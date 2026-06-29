// Place at: app/api/sync-fixtures/route.js
//
// Admin-triggered endpoint that fetches upcoming WC fixtures from
// football-data.org and stores real team names into Redis state.
// Called from the Settings tab "Sync Fixtures" button.
// READ-WRITE but safe to call repeatedly — only updates fixture data.

export const dynamic = "force-dynamic";

// ── Team name mapping ─────────────────────────────────────────────────────────
const NAME_MAP = {
  "United States":          "USA",
  "Korea Republic":         "South Korea",
  "Türkiye":                "Turkey",
  "IR Iran":                "Iran",
  "Bosnia and Herzegovina": "Bosnia & Herz.",
  "Bosnia-Herzegovina":     "Bosnia & Herz.",
  "Côte d'Ivoire":          "Ivory Coast",
  "Cote d'Ivoire":          "Ivory Coast",
  "Congo DR":               "DR Congo",
  "Cape Verde Islands":     "Cape Verde",
  "Cabo Verde":             "Cape Verde",
  "Czech Republic":         "Czechia",
  "CuraÃ§ao":              "Curaçao",
  "Curacao":                "Curaçao",
};

function toLabel(name) {
  if (!name) return null;
  return NAME_MAP[name] || name;
}

// ── Round mapping: football-data.org matchday → our round id ─────────────────
// Group stage matchdays 1-3 = rounds 1-3
// Knockout rounds matched by stage name
const STAGE_TO_ROUND = {
  // football-data.org's actual stage strings for the 48-team format:
  "LAST_32":          4,
  "LAST_16":          5,
  "QUARTER_FINALS":   6,
  "SEMI_FINALS":      7,
  "FINAL":            8,
  // Defensive aliases in case the API ever switches naming mid-tournament:
  "ROUND_OF_32":      4,
  "ROUND_OF_16":      5,
  "QUARTER_FINAL":    6,
  "SEMI_FINAL":       7,
};

// ── Redis ─────────────────────────────────────────────────────────────────────
const KEY = "wc_lms_state";

async function redisCmd(args) {
  const url   = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw new Error("Upstash env vars not set");
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
    body: JSON.stringify(args),
    cache: "no-store",
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error("Redis " + args[0] + " failed " + res.status + ": " + txt);
  }
  return res.json();
}

async function loadState() {
  const { result } = await redisCmd(["GET", KEY]);
  if (!result) return null;
  return typeof result === "string" ? JSON.parse(result) : result;
}

async function saveState(state) {
  state.lastUpdated = Date.now();
  await redisCmd(["SET", KEY, JSON.stringify(state)]);
}

// ── Main handler ──────────────────────────────────────────────────────────────
export async function GET(request) {
  const apiKey = process.env.FOOTBALL_DATA_API_KEY;
  if (!apiKey) return respond({ error: "FOOTBALL_DATA_API_KEY not set" }, 500);

  try {
    // Fetch all WC matches (not just finished)
    const res = await fetch(
      "https://api.football-data.org/v4/competitions/WC/matches",
      { headers: { "X-Auth-Token": apiKey }, cache: "no-store" }
    );
    if (!res.ok) throw new Error(`football-data.org returned ${res.status}`);
    const data = await res.json();
    const matches = data.matches ?? [];

    // Build fixtureOverrides: { [roundId]: [ [home, away, dateStr, timeStr], ... ] }
    const overrides = {};

    for (const m of matches) {
      const home = toLabel(m.homeTeam?.name);
      const away = toLabel(m.awayTeam?.name);
      if (!home || !away) continue;

      // Skip TBD placeholder names
      if (home.includes("Winner") || away.includes("Winner") ||
          home === "TBD" || away === "TBD") continue;

      let roundId = null;

      if (m.stage === "GROUP_STAGE") {
        roundId = m.matchday; // 1, 2, or 3
      } else {
        roundId = STAGE_TO_ROUND[m.stage] ?? null;
      }

      if (!roundId) continue;

      // Format date and time in BST (UTC+1 during summer)
      const dt = new Date(m.utcDate);
      const dateStr = dt.toLocaleDateString("en-GB", {
        weekday: "short", day: "numeric", month: "short", timeZone: "Europe/London"
      });
      const timeStr = dt.toLocaleTimeString("en-GB", {
        hour: "2-digit", minute: "2-digit", timeZone: "Europe/London"
      }) + " BST";

      if (!overrides[roundId]) overrides[roundId] = [];
      overrides[roundId].push([home, away, dateStr, timeStr]);
    }

    // Save into state
    const state = await loadState();
    if (!state) return respond({ error: "No state in Redis" }, 500);

    state.fixtureOverrides = overrides;
    await saveState(state);

    const summary = Object.entries(overrides).map(([id, fx]) =>
      `Round ${id}: ${fx.length} fixture(s)`
    );

    return respond({ ok: true, updated: summary });

  } catch (e) {
    return respond({ ok: false, error: e.message }, 500);
  }
}

function respond(obj, status = 200) {
  return new Response(JSON.stringify(obj, null, 2), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
