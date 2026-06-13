// Place at: app/api/banter/route.js
//
// Server-side proxy to the Anthropic API for generating round banter.
// Keeps the API key secret (never exposed to the browser).
// Called by the "Generate round summary" button in the Tracker tab.

export const dynamic = "force-dynamic";

export async function POST(request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return json({ error: "ANTHROPIC_API_KEY not set" }, 500);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  const { roundLabel, pickLines, survivors, ousted } = body || {};
  if (!pickLines) return json({ error: "Missing pickLines" }, 400);

  const prompt =
`You're the cheeky commentator for a 9-mate World Cup Last Man Standing WhatsApp group. Write 2-3 short, funny, light-hearted lines of banter about how this round went. British English, dry humour, no emoji, keep it punchy. Tease the people knocked out gently, hype the survivors. Don't list everyone — just riff on the most interesting picks.

Round: ${roundLabel || "this round"}

${pickLines}

Survivors: ${(survivors || []).join(", ") || "none"}
Knocked out: ${(ousted || []).join(", ") || "none"}

Return ONLY the banter lines, nothing else.`;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      return json({ error: `Anthropic API ${res.status}: ${txt}` }, 502);
    }

    const data = await res.json();
    const banter = (data.content || [])
      .filter(b => b.type === "text")
      .map(b => b.text)
      .join("\n")
      .trim();

    return json({ banter });
  } catch (e) {
    return json({ error: "Request failed: " + e.message }, 502);
  }
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
