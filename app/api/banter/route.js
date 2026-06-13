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
`You're the merciless commentator for a 9-mate World Cup Last Man Standing WhatsApp group. These are close lads who give each other brutal, sweary stick — so go in HARD and don't hold back. Write 2-3 short, savage, very funny lines absolutely tearing into how this round went. British English, dry and filthy, proper lads' group-chat piss-taking. Swear freely — fuck, shit, knobhead, bellend, mug, etc. are all fair game and welcome. Brutally mock the people knocked out: their dogshit picks, their judgement, their misplaced confidence. Keep it about the football and the picks though — savage their decisions, not genuinely personal stuff. No emoji. Punchy and quotable. Don't list everyone — just absolutely bury the most laughable picks and grudgingly give the survivors a nod.

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
