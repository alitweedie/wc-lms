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
`You write the round summary for a 9-person World Cup Last Man Standing WhatsApp group. Everyone knows their football. The goal is to make the group actually laugh — warm, sharp, quotable banter, the kind of message people screenshot and reply to. Think group-chat comedy, not insult comedy.

Write 2-4 short lines. Vary them. What actually makes it funny:
- SPECIFICITY beats generic mockery. Don't say "terrible pick" — name the team, the score, what actually happened, and find the absurd angle in it. "Backed a team that shipped four" lands; "you're clueless" doesn't.
- Play the RESULT for laughs, not the person's intelligence. The joke is the football — the last-minute winner, the team that bottled it, the 'safe' pick that wasn't. React to the drama.
- UNDERSTATEMENT and a good comparison beat piling on. One well-aimed dry line is funnier than three angry ones.
- A CALLBACK or running theme across the lines ties it together and reads as clever.
- Give whoever's still standing a genuine but cheeky nod — smug survivors are good comic material too.

Tone: British English, dry, affectionate piss-taking between mates who like each other. Keep it light — tease the pick, never anything genuinely personal. Mild swearing is allowed only if it genuinely sharpens a joke (mug, clown, muppet) — but a clean line that's actually funny is always better, and never be crude or nasty for its own sake. If nothing about a pick is funny, leave it out rather than forcing a weak dig.

Important: this is a mixed group, not all men. NEVER address them as "lads", "boys", "fellas" or anything gendered. Address the group as "everyone", "the group", or just talk about the round directly. Refer to individuals by the names given.

No emoji. Don't robotically list every player — find the two or three funniest angles in this round and land them.

Round: ${roundLabel || "this round"}

${pickLines}

Survivors: ${(survivors || []).join(", ") || "none"}
Knocked out: ${(ousted || []).join(", ") || "none"}

Return ONLY the summary lines, nothing else.`;

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
