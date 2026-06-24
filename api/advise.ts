import Anthropic from '@anthropic-ai/sdk';

export const config = { runtime: 'edge' };

const DESTINATIONS_SUMMARY = `
Maharashtra adventure destinations — use this data to make personalised recommendations:

1. Sahyadri Ranges (Western Ghats) — Trek, camp, sunrise, waterfall, fort walk. Elevation 1,646m. Best: Oct-Feb.
2. Pawna Lake (Maval Valley) — Kayak, raft, boating, camp, cycling. Elevation 650m. Best: Nov-Feb.
3. Bhimashankar Forest (Sahyadri Reserve) — Zipline, trek, wildlife safari, cave, birding, waterfall. Elevation 1,033m. Best: Jun-Sep.
4. Harishchandragad (Malshej Range) — Paraglide, rock climb, rappel, hot-air balloon, extreme trek. Elevation 1,429m. Best: Oct-Mar.
5. Mahabaleshwar (Satara Highlands) — Paraglide, trek, boating, zipline, cycling, waterfall. Elevation 1,353m. Best: Oct-Jun.
6. Tarkarli Coast (Konkan Coast) — Scuba, kayak, dolphin boat, beach camp, sea-fort cycling. Elevation 5m. Best: Nov-Mar.

Activity categories: trekking, camping, water, aerial, climbing, wildlife.
Prices range from ₹2,800 to ₹9,500 per person per activity.

Booking URL pattern: /book/{destination-slug}/{activity-id}
Destination slugs: sahyadri-ranges, pawna-lake, bhimashankar-forest, harishchandragad, mahabaleshwar, tarkarli-coast
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

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    return new Response(JSON.stringify({ error: 'AI not configured' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { message, history = [] } = await req.json();

  const client = new Anthropic({ apiKey: key });

  const encoder = new TextEncoder();
  const stream = new TransformStream<Uint8Array, Uint8Array>();
  const writer = stream.writable.getWriter();

  (async () => {
    try {
      const anthropicStream = client.messages.stream({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        system: `You are Maharashtra Adventures AI — an expert travel advisor for adventure tourism in Maharashtra, India.
${DESTINATIONS_SUMMARY}
Guide users to the best destinations based on their interests, budget, fitness, group size, and travel dates.
Be enthusiastic and specific. Always mention 2-3 concrete destination recommendations with activity names and approximate prices.
End each recommendation with a booking link formatted as: [Book {Activity Name}](/book/{slug}/{activity-id})
Use slug 'sahyadri-ranges', 'pawna-lake', 'bhimashankar-forest', 'harishchandragad', 'mahabaleshwar', or 'tarkarli-coast'.
Keep responses concise (under 300 words). Use markdown for formatting.`,
        messages: [
          ...history,
          { role: 'user' as const, content: message },
        ],
      });

      for await (const chunk of anthropicStream) {
        if (
          chunk.type === 'content_block_delta' &&
          chunk.delta.type === 'text_delta'
        ) {
          writer.write(encoder.encode(chunk.delta.text));
        }
      }
    } catch {
      writer.write(encoder.encode('\n\n*Sorry, I had trouble connecting. Please try again.*'));
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
