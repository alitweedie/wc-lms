// Place at: app/api/test-scores/route.js
//
// READ-ONLY diagnostic. Writes nothing, changes no state.
// Visit: https://wc-lms-slxr.vercel.app/api/test-scores?pretty=1

export const dynamic = "force-dynamic";

const TRACKER_TEAMS = [
  "Algeria","Argentina","Australia","Austria","Belgium","Bosnia & Herz.",
  "Brazil","Canada","Cape Verde","Colombia","Croatia","Curaçao",
  "Czechia","DR Congo","Ecuador","Egypt","England","France","Germany","Ghana",
  "Haiti","Iran","Iraq","Ivory Coast","Japan","Jordan","Mexico","Morocco",
  "Netherlands","New Zealand","Norway","Panama","Paraguay","Portugal","Qatar",
  "Saudi Arabia","Scotland","Senegal","South Africa","South Korea","Spain",
  "Sweden","Switzerland","Tunisia","Turkey","Uruguay","USA","Uzbekistan",
];

// football-data.org name → your tracker label
// Update these if the diagnostic reports unresolved names.
export const NAME_MAP = {
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

export function toTrackerLabel(apiName) {
  if (!apiName) return null;
  if (NAME_MAP[apiName]) return NAME_MAP[apiName];
  if (TRACKER_TEAMS.includes(apiName)) return apiName;
  return null;
}

export async function GET(request) {
  const pretty = new URL(request.url).searchParams.get("pretty");
  const key = process.env.FOOTBALL_DATA_API_KEY;

  const report = {
    checkedAt: new Date().toISOString(),
    auth: key ? "key present" : "MISSING — add FOOTBALL_DATA_API_KEY to Vercel env vars",
  };

  if (!key) return respond(report, pretty);

  let data;
  try {
    const res = await fetch(
      "https://api.football-data.org/v4/competitions/WC/matches",
      { headers: { "X-Auth-Token": key }, cache: "no-store" }
    );
    report.httpStatus = res.status;
    report.requestsRemainingThisMinute = res.headers.get("X-Requests-Available-Minute");

    if (!res.ok) {
      report.error =
        res.status === 403 ? "403 — token invalid, or free tier does not expose WC yet." :
        res.status === 429 ? "429 — rate limited. Wait a minute and retry." :
        `HTTP ${res.status}`;
      report.bodyPreview = (await res.text()).slice(0, 400);
      return respond(report, pretty);
    }
    data = await res.json();
  } catch (e) {
    report.error = "Fetch failed: " + e.message;
    return respond(report, pretty);
  }

  const matches = data.matches ?? [];
  report.competition   = data.competition?.name ?? null;
  report.totalMatches  = matches.length;
  report.statusCounts  = matches.reduce((a, m) => { a[m.status] = (a[m.status]||0)+1; return a; }, {});

  // All distinct team names the API uses
  const apiNames = [...new Set(
    matches.flatMap(m => [m.homeTeam?.name, m.awayTeam?.name]).filter(Boolean)
  )].sort();
  report.distinctApiTeamNames = apiNames;

  // The key output: which names don't resolve to a tracker label
  const unresolved = apiNames.filter(n => toTrackerLabel(n) === null);
  report.unresolvedNames = unresolved.length
    ? unresolved
    : "none — all API names map cleanly to tracker labels ✓";

  // Tracker teams not yet seen in API data (normal for knockout TBDs)
  const seen = new Set(apiNames.map(toTrackerLabel).filter(Boolean));
  report.trackerTeamsNotInApi = TRACKER_TEAMS.filter(t => !seen.has(t));

  // Sample of finished matches in auto-resolver shape
  report.finishedSample = matches
    .filter(m => m.status === "FINISHED")
    .slice(0, 10)
    .map(m => ({
      date:      m.utcDate,
      home:      m.homeTeam?.name,
      away:      m.awayTeam?.name,
      homeLabel: toTrackerLabel(m.homeTeam?.name),
      awayLabel: toTrackerLabel(m.awayTeam?.name),
      winner:    m.score?.winner,    // HOME_TEAM | AWAY_TEAM | DRAW
      duration:  m.score?.duration,  // REGULAR | EXTRA_TIME | PENALTY_SHOOTOUT
      score:     m.score?.fullTime,  // { home, away }
    }));

  return respond(report, pretty);
}

function respond(obj, pretty) {
  return new Response(JSON.stringify(obj, null, pretty ? 2 : 0), {
    headers: { "Content-Type": "application/json" },
  });
}
