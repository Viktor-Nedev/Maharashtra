import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import type { IncomingMessage, ServerResponse } from 'node:http';

/**
 * Dev-only bridge that serves the Vercel `api/*` functions under `npm run dev`.
 *
 * The Vite dev server doesn't run Vercel's serverless/edge functions, so every
 * `/api/...` request 404s locally (which is exactly why the AI advisor + Stripe
 * intent appeared "broken" in development). This plugin imports the matching
 * `api/<name>.ts` handler, adapts the Node request/response to the web
 * `Request`/`Response` the handlers expect (including streamed bodies), and runs
 * it in-process. Production is untouched — `apply: 'serve'` keeps it dev-only and
 * real Vercel functions handle `/api/*` when deployed.
 */
function devApi(env: Record<string, string>): Plugin {
  return {
    name: 'dev-api-bridge',
    apply: 'serve',
    configureServer(server) {
      // Make non-VITE_ secrets (e.g. GEMINI_API_KEY) visible to the handlers,
      // which read them via process.env just like they do on Vercel.
      for (const [k, v] of Object.entries(env)) {
        if (process.env[k] === undefined) process.env[k] = v;
      }

      server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next) => {
        const url = req.url ?? '';
        if (!url.startsWith('/api/')) return next();

        // Map /api/<name>[?query] → api/<name>.ts
        const name = url.slice('/api/'.length).split('?')[0].replace(/\/$/, '');
        if (!name) return next();

        try {
          const mod = await server.ssrLoadModule(`/api/${name}.ts`);
          const handler = mod.default as
            | ((request: Request) => Response | Promise<Response>)
            | undefined;
          if (typeof handler !== 'function') return next();

          // Buffer the incoming body for non-GET/HEAD requests.
          let body: Buffer | undefined;
          if (req.method && !['GET', 'HEAD'].includes(req.method)) {
            const chunks: Buffer[] = [];
            for await (const c of req) chunks.push(c as Buffer);
            body = Buffer.concat(chunks);
          }

          const headers = new Headers();
          for (const [k, v] of Object.entries(req.headers)) {
            if (v === undefined) continue;
            headers.set(k, Array.isArray(v) ? v.join(', ') : v);
          }

          const request = new Request(`http://localhost${url}`, {
            method: req.method,
            headers,
            // Buffer is a valid body at runtime; cast past the narrow BodyInit type.
            body: body && body.length ? (body as unknown as BodyInit) : undefined,
          });

          const response = await handler(request);

          res.statusCode = response.status;
          response.headers.forEach((value, key) => {
            // Let Node manage framing — manual values here conflict with its
            // own chunked streaming.
            if (key === 'content-length' || key === 'transfer-encoding') return;
            res.setHeader(key, value);
          });

          if (response.body) {
            const reader = response.body.getReader();
            for (;;) {
              const { done, value } = await reader.read();
              if (done) break;
              res.write(Buffer.from(value));
            }
          }
          res.end();
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error(`[dev-api-bridge] ${name} failed:`, err);
          res.statusCode = 500;
          res.end(JSON.stringify({ error: 'dev api handler failed' }));
        }
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load every env var (prefixless) so the dev API bridge can forward secrets.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react(), devApi(env)],
    resolve: {
      alias: {
        '@': '/src',
      },
    },
    css: {
      preprocessorOptions: {
        scss: { api: 'modern-compiler' },
      },
    },
    build: {
      target: 'esnext',
      sourcemap: false,
      rollupOptions: {
        output: {
          // Aggressive code-splitting so the heavy 3D libs load only for the
          // cinematic experience and never block the booking platform routes.
          manualChunks: {
            three: ['three'],
            r3f: ['@react-three/fiber', '@react-three/drei', '@react-three/postprocessing'],
            gsap: ['gsap'],
            mapbox: ['mapbox-gl'],
            stripe: ['@stripe/stripe-js', '@stripe/react-stripe-js'],
            vendor: ['react', 'react-dom', 'react-router-dom'],
          },
        },
      },
    },
    optimizeDeps: {
      include: ['three', '@react-three/fiber', '@react-three/drei'],
    },
  };
});
