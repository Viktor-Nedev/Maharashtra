import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import cesium from 'vite-plugin-cesium';

/**
 * vite-plugin-cesium injects Cesium.js as a render-blocking <script> in <head>.
 * Cesium is ~3 MB and only used on the homepage, so block-loading it would stall
 * first paint on every route. Rewriting it to `defer` keeps initial paint fast
 * while still guaranteeing the global `Cesium` is ready before React mounts
 * (deferred scripts run before DOMContentLoaded).
 */
function deferCesium(): Plugin {
  return {
    name: 'defer-cesium-script',
    transformIndexHtml(html) {
      return html.replace(
        /<script(\s+)src="([^"]*Cesium\.js)"><\/script>/,
        '<script defer src="$2"></script>',
      );
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), cesium(), deferCesium()],
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
});
