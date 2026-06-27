export const config = { runtime: 'edge' };

const DESTINATIONS_SUMMARY = `
Maharashtra adventure destinations — use this data to make personalised recommendations:

1. Sahyadri Ranges (Western Ghats) — Trek, camp, fort walks, rappel, stargazing. Elevation 1,438m. Best: Jun–Feb. Includes Lohagad Fort, Rajmachi, Kalsubai Peak, Sinhagad, Torna Fort, Sandhan Valley.
2. Pawna Lake (Maval Valley) — Kayak, raft, boating, lakeside camp, cycling, Bhandardara lake. Elevation 610m. Best: Oct–Mar.
3. Bhimashankar Forest (Sahyadri Reserve) — Zipline, trek, wildlife safari, cave, birding. Elevation 1,034m. Best: Aug–Jan.
4. Harishchandragad (Malshej Range) — Paraglide, rock climb, rappel, hot-air balloon, Kamshet paragliding hub. Elevation 1,424m. Best: Oct–Feb.
5. Mahabaleshwar (Satara Highlands) — Paraglide at Panchgani, trek, boating, Lonavala, Matheran trail. Elevation 1,353m. Best: Oct–Jun.
6. Tarkarli Coast (Konkan Coast) — Scuba, kayak, dolphin boat, Kolad rafting, Alibaug water sports, Diveagar beach. Elevation 5m. Best: Nov–Mar.

Activity categories: trekking, camping, water, aerial, climbing, wildlife.
Prices range from ₹700 to ₹6,500 per person per activity.

Booking URL pattern: /book/{destination-slug}/{activity-id}
Destination slugs: sahyadri-ranges, pawna-lake, bhimashankar-forest, harishchandragad-cliffs, mahabaleshwar, tarkarli-coast
`;

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return new Response(JSON.stringify({ error: 'AI not configured — set GEMINI_API_KEY' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { message, history = [] } = await req.json() as {
    message: string;
    history: { role: string; content: string }[];
  };

  const systemInstruction = `You are Maharashtra Adventures AI — an expert travel advisor for adventure tourism in Maharashtra, India.
${DESTINATIONS_SUMMARY}
Guide users to the best destinations based on their interests, budget, fitness, group size, and travel dates.
Be enthusiastic and specific. Always mention 2-3 concrete destination recommendations with activity names and approximate prices.
End each recommendation with a booking link formatted as: [Book {Activity Name}](/book/{slug}/{activity-id})
Keep responses concise (under 300 words). Use markdown for formatting: **bold**, bullet lists.`;

  // Build conversation history for Gemini
  const contents = [
    ...history.map((m) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    })),
    { role: 'user', parts: [{ text: message }] },
  ];

  const encoder = new TextEncoder();
  const stream = new TransformStream<Uint8Array, Uint8Array>();
  const writer = stream.writable.getWriter();

  (async () => {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?key=${key}&alt=sse`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: systemInstruction }] },
            contents,
            generationConfig: {
              maxOutputTokens: 1024,
              temperature: 0.7,
            },
          }),
        },
      );

      if (!res.ok || !res.body) {
        const errText = await res.text().catch(() => res.statusText);
        writer.write(encoder.encode(`\n\n*Gemini error (${res.status}): ${errText}*`));
        return;
      }

      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let buf = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        const lines = buf.split('\n');
        buf = lines.pop() ?? '';
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') continue;
          try {
            const json = JSON.parse(data);
            const text: string | undefined =
              json?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) writer.write(encoder.encode(text));
          } catch {
            // skip malformed chunks
          }
        }
      }
    } catch (err) {
      writer.write(
        encoder.encode('\n\n*Sorry, could not reach the AI. Please try again.*'),
      );
    } finally {
      writer.close();
    }
  })();

  return new Response(stream.readable, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
