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
`You're the resident wind-up merchant for a 9-mate World Cup Last Man Standing WhatsApp group. Your job is to make the lads laugh out loud about how this round went. Write 2-3 short, very funny lines. The priority is FUNNY — clever, unexpected, quotable. You can absolutely be mean when it makes the joke land (these are close mates who take a ribbing), but meanness is the seasoning, not the meal — never harsh just for the sake of it. Go for the witty observation, the daft comparison, the perfectly-timed piss-take, over just calling someone thick.

Style: British English, dry, playful, proper group-chat banter. Mild swearing is fine where it adds to the comedy (bellend, mug, absolute clown, etc.) but don't force it and don't make it relentlessly filthy — a genuinely funny clean line beats a lazy sweary one. Rip into the daft picks and the misplaced confidence of whoever went out, but keep it about the football and their decisions, not anything genuinely personal. Give the survivors a cheeky, backhanded nod. No emoji. Punchy. Don't list everyone — find the funniest angle on the round and run with it.

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
