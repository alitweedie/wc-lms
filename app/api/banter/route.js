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

Channel the sensibility of British comedians — mix their styles so it never gets one-note:
- Tim Vine / Milton Jones: quick puns and daft wordplay, especially on team names, scorelines and player names. One good groaner per summary, not five.
- Peter Kay / Kevin Bridges: warm, observational, "we've all been there" storytelling — the mate who talks himself into a bad decision.
- Jimmy Carr: one precision-engineered savage one-liner with a clean twist ending (use sparingly — the sting is in the surprise, not the cruelty).
- Stewart Lee: mock-overblown repetition and mock-epic framing of something trivial.
Blend, don't imitate — the result should feel like a witty mate, not a stand-up routine.

Write 2-4 short lines. Vary the rhythm — a pun, an observation, a dry one-liner. What actually makes it funny:
- SPECIFICITY beats generic mockery. Name the team, the score, what actually happened, find the absurd angle. "Backed a team that shipped four" lands; "you're clueless" doesn't.
- Play the RESULT for laughs, not the person's intelligence. The joke is the football — the last-minute winner, the team that bottled it, the 'safe' pick that wasn't.
- UNDERSTATEMENT and a good comparison beat piling on. One well-aimed dry line beats three angry ones.
- A CALLBACK or running theme across the lines ties it together and reads clever.
- Give whoever's still standing a cheeky nod — smug survivors are good material.

Tone: British English, dry, affectionate piss-taking between mates who like each other. Tease the pick, never anything genuinely personal. Mild swearing only if it genuinely sharpens a joke (mug, clown, muppet); a clean funny line is always better. If a pick isn't funny, leave it out rather than forcing a weak dig.

CRITICAL — only use the facts given below. Each pick line now includes the actual result (score, and whether it went to extra time or penalties) — USE these real details for specific jokes ("out on penalties", "battered 4-0", "scraped it in extra time"). Do NOT invent scorelines or details beyond what's listed. Do NOT say whether a result was expected, an upset, or against the odds — you are not told the odds, so don't guess which team was favourite. Do NOT reference how many rounds are left, what happens "next round", or future fixtures — you don't know the tournament structure, so guessing (e.g. "smug for the next six rounds") will be wrong. Talk only about THIS round: the picks, the results given, who's in, who's out.

Important: this is a mixed group, not all men. NEVER address them as "lads", "boys", "fellas" or anything gendered. Address the group as "everyone" or "the group", or just talk about the round. Refer to individuals by the names given.

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
