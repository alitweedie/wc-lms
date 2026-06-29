// Place at: app/api/sync-scores/route.js

export const dynamic = "force-dynamic";

// ── Team name mapping ─────────────────────────────────────────────────────────
const TRACKER_TEAMS = [
  "Algeria","Argentina","Australia","Austria","Belgium","Bosnia & Herz.",
  "Brazil","Canada","Cape Verde","Colombia","Croatia","Curaçao",
  "Czechia","DR Congo","Ecuador","Egypt","England","France","Germany","Ghana",
  "Haiti","Iran","Iraq","Ivory Coast","Japan","Jordan","Mexico","Morocco",
  "Netherlands","New Zealand","Norway","Panama","Paraguay","Portugal","Qatar",
  "Saudi Arabia","Scotland","Senegal","South Africa","South Korea","Spain",
  "Sweden","Switzerland","Tunisia","Turkey","Uruguay","USA","Uzbekistan",
];

const NAME_MAP = {
  "United States":          "USA",
  "Korea Republic":         "South Korea",
  "Türkiye":                "Turkey",
  "IR Iran":                "Iran",
  "Bosnia and Herzegovina": "Bosnia & Herz.",
  "Bosnia-Herzegovina":     "Bosnia & Herz.",
  "Côte d'Ivoire":          "Ivory Coast",
  "Cote d'Ivoire":          "Ivory Coast",
  "Côte D'Ivoire":          "Ivory Coast",
  "Cote D'Ivoire":          "Ivory Coast",
  "CÃ´te d'Ivoire":         "Ivory Coast",
  "Congo DR":               "DR Congo",
  "Cape Verde Islands":     "Cape Verde",
  "Cabo Verde":             "Cape Verde",
  "Czech Republic":         "Czechia",
  "CuraÃ§ao":              "Curaçao",
  "Curacao":                "Curaçao",
};

function toTrackerLabel(apiName) {
  if (!apiName) return null;
  if (NAME_MAP[apiName]) return NAME_MAP[apiName];
  if (TRACKER_TEAMS.includes(apiName)) return apiName;
  console.log(`[sync-scores] Unmapped team name from API: "${apiName}"`);
  return null;
}

// ── Redis via plain fetch (no client library) ─────────────────────────────────
// POST to the base URL with a JSON array matching the Redis command signature.
// This is exactly what @upstash/redis does internally.
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

// ── Constants ─────────────────────────────────────────────────────────────────
const OUTCOME = { WIN: "win", LOSE: "lose", DRAW: "draw", PENDING: "" };
const ENTRY_FEE = 2;

const ROUNDS = [
  { id:1, stage:"Group Stage" },
  { id:2, stage:"Group Stage" },
  { id:3, stage:"Group Stage" },
  { id:4, stage:"Round of 32" },
  { id:5, stage:"Round of 16" },
  { id:6, stage:"Quarter-Finals" },
  { id:7, stage:"Semi-Finals" },
  { id:8, stage:"Final" },
];

// Map a football-data.org match to our round id.
// Group stage uses matchday (1/2/3); knockouts use the stage name.
const STAGE_TO_ROUND = {
  // football-data.org's actual stage strings for the 48-team format:
  "LAST_32":        4,
  "LAST_16":        5,
  "QUARTER_FINALS": 6,
  "SEMI_FINALS":    7,
  "FINAL":          8,
  // Defensive aliases in case the API ever switches naming mid-tournament:
  "ROUND_OF_32":    4,
  "ROUND_OF_16":    5,
  "QUARTER_FINAL":  6,
  "SEMI_FINAL":     7,
};

function matchRoundId(m) {
  if (m.stage === "GROUP_STAGE") return m.matchday; // 1, 2, or 3
  return STAGE_TO_ROUND[m.stage] ?? null;
}

// Collect the stage strings the API actually sends for any non-group match,
// so we can surface them in the response log for diagnosis.
function unmappedStages(rawMatches) {
  const seen = {};
  for (const m of rawMatches) {
    if (m.stage === "GROUP_STAGE") continue;
    if (STAGE_TO_ROUND[m.stage] == null) {
      const k = m.stage || "(no stage)";
      seen[k] = (seen[k] || 0) + 1;
    }
  }
  return seen;
}

// ── State helpers ─────────────────────────────────────────────────────────────
function roundResolved(round) {
  return Object.values(round.outcomes).some(
    o => o === OUTCOME.WIN || o === OUTCOME.LOSE || o === OUTCOME.DRAW
  );
}

function gameEntrants(game, players) {
  const r0 = game.rounds[0];
  if (!r0) return players;
  if (!roundResolved(r0)) return players;
  return players.filter(p => !!r0.picks[p]);
}

function calcPot(game, players) {
  const r0 = game.rounds[0];
  const count = roundResolved(r0)
    ? gameEntrants(game, players).length
    : Object.values(r0?.picks ?? {}).filter(Boolean).length;
  return count * ENTRY_FEE + (game.rollover || 0);
}

function getAliveAtStart(game, players, roundIndex) {
  const entrants = gameEntrants(game, players);
  const elim = {};
  for (let i = 0; i < roundIndex; i++) {
    const r = game.rounds[i];
    if (!roundResolved(r)) break;
    for (const p of entrants) {
      if (elim[p]) continue;
      const pick = r.picks[p];
      const o    = r.outcomes[p];
      if (i > 0 && !pick)                           { elim[p] = r.id; continue; }
      if (o === OUTCOME.LOSE || o === OUTCOME.DRAW) { elim[p] = r.id; }
    }
  }
  return entrants.filter(p => !elim[p]);
}

function isRoundFullySettled(round, aliveAtStart) {
  return aliveAtStart.every(p => {
    const o    = round.outcomes[p];
    const pick = round.picks[p];
    if (!pick && roundResolved(round)) return true;
    return o === OUTCOME.WIN || o === OUTCOME.LOSE || o === OUTCOME.DRAW;
  });
}

function buildElimMap(game, players) {
  const m = {};
  for (const p of players) {
    const entrants = gameEntrants(game, players);
    if (!entrants.includes(p)) { m[p] = -1; continue; }
    let eliminated = null;
    for (let i = 0; i < game.rounds.length; i++) {
      const r    = game.rounds[i];
      if (!roundResolved(r)) break;
      const pick = r.picks[p];
      const o    = r.outcomes[p];
      if (i > 0 && !pick)                           { eliminated = r.id; break; }
      if (o === OUTCOME.LOSE || o === OUTCOME.DRAW) { eliminated = r.id; break; }
    }
    if (eliminated !== null) m[p] = eliminated;
  }
  return m;
}

function buildGame(id, startRoundIdx = 0) {
  return {
    id, label: `Game ${id}`, startRoundIdx,
    rounds: ROUNDS.slice(startRoundIdx).map(r => ({
      id: r.id, label: "", stage: r.stage, picks: {}, outcomes: {}, tiebreaker: {},
    })),
    complete: false, winners: [], rollover: 0,
  };
}

function evaluateGameEnd(g, players) {
  let lastSettledIdx = -1;
  for (let i = 0; i < g.rounds.length; i++) {
    const alive = getAliveAtStart(g, players, i);
    if (alive.length === 0 && !roundResolved(g.rounds[i])) break;
    if (isRoundFullySettled(g.rounds[i], alive)) { lastSettledIdx = i; } else { break; }
  }
  if (lastSettledIdx < 0) return;

  const entrants     = gameEntrants(g, players);
  const lastRound    = g.rounds[lastSettledIdx];
  const isFinalRound = lastSettledIdx === g.rounds.length - 1;
  const survivors    = entrants.filter(p => lastRound.outcomes[p] === OUTCOME.WIN);
  const elimMap      = buildElimMap(g, players);
  const alive        = entrants.filter(p => elimMap[p] == null);

  const aliveAtLast  = getAliveAtStart(g, players, lastSettledIdx);
  const roundPending = aliveAtLast.filter(p => {
    const o    = lastRound.outcomes[p];
    const pick = lastRound.picks[p];
    if (!pick) return false;
    return !o || o === OUTCOME.PENDING;
  }).length;
  if (roundPending > 0) return;

  const gameOver = survivors.length <= 1 || isFinalRound;
  if (!gameOver) return;

  g.complete = true;
  g.winners  = survivors.length === 1
    ? survivors
    : (isFinalRound && survivors.length > 0 ? survivors : []);
  if (survivors.length === 0) g.rolledOver = true;

  const wcIdx = ROUNDS.findIndex(wr => wr.id === lastRound.id);
  if (wcIdx >= ROUNDS.length - 1) return;

  const pot     = calcPot(g, players);
  const newGame = buildGame(0, wcIdx + 1);
  newGame.rollover = alive.length === 0 ? pot : 0;
  return newGame;
}

// ── Football data ─────────────────────────────────────────────────────────────
async function fetchFinishedMatches(apiKey) {
  const res = await fetch(
    "https://api.football-data.org/v4/competitions/WC/matches?status=FINISHED",
    { headers: { "X-Auth-Token": apiKey }, cache: "no-store" }
  );
  if (!res.ok) throw new Error(`football-data.org returned ${res.status}`);
  const data = await res.json();
  const raw = data.matches ?? [];
  const mapped = raw.map(m => ({
    homeLabel: toTrackerLabel(m.homeTeam?.name),
    awayLabel: toTrackerLabel(m.awayTeam?.name),
    winner:    m.score?.winner,
    duration:  m.score?.duration,
    homeGoals: m.score?.fullTime?.home ?? null,
    awayGoals: m.score?.fullTime?.away ?? null,
    roundId:   matchRoundId(m),
  }));
  return { raw, mapped };
}

function buildResultLookup(matches) {
  // Key: "roundId|TEAM" -> outcome for that team in that specific round.
  // Keying by round is essential: a team plays in rounds 1, 2 and 3, so
  // "USA won" is meaningless without knowing which matchday it refers to.
  const lookup = {};
  for (const m of matches) {
    if (!m.homeLabel || !m.awayLabel || m.roundId == null) continue;
    const homeOutcome =
      m.winner === "HOME_TEAM" ? OUTCOME.WIN :
      m.winner === "AWAY_TEAM" ? OUTCOME.LOSE : OUTCOME.DRAW;
    const awayOutcome =
      m.winner === "AWAY_TEAM" ? OUTCOME.WIN :
      m.winner === "HOME_TEAM" ? OUTCOME.LOSE : OUTCOME.DRAW;
    lookup[`${m.roundId}|${m.homeLabel}`] = { outcome: homeOutcome, winner: m.winner };
    lookup[`${m.roundId}|${m.awayLabel}`] = { outcome: awayOutcome, winner: m.winner };
  }
  return lookup;
}

function resolveOutcome(pick, roundId, resultLookup, isKnockout) {
  const result = resultLookup[`${roundId}|${pick}`];
  if (!result) return null; // this team has not played in this round yet
  // A genuine draw only eliminates in the group stage; knockouts always
  // produce a winner via ET/pens, so winner is never DRAW there.
  if (result.outcome === OUTCOME.DRAW && isKnockout) return null;
  return result.outcome;
}

// ── Main handler ──────────────────────────────────────────────────────────────
export async function GET(request) {
  const url        = new URL(request.url);
  const isDry      = url.searchParams.get("dry") === "1";
  const apiKey     = process.env.FOOTBALL_DATA_API_KEY;
  const cronSecret = process.env.CRON_SECRET;
  const log        = [];

  if (!apiKey) return respond({ error: "FOOTBALL_DATA_API_KEY not set" }, 500);

  if (!isDry && cronSecret) {
    if (request.headers.get("x-cron-secret") !== cronSecret) {
      return respond({ error: "Unauthorised" }, 401);
    }
  }

  try {
    const state = await loadState();
    if (!state) return respond({ error: "No state in Redis" }, 500);
    log.push("State loaded successfully");

    const { raw, mapped: finished } = await fetchFinishedMatches(apiKey);
    log.push(`Fetched ${finished.length} finished match(es) from API`);

    // Diagnostic: surface any non-group stage strings the API uses that we
    // don't map, plus a peek at non-group matches and how they resolved.
    const unmapped = unmappedStages(raw);
    if (Object.keys(unmapped).length) {
      log.push(`Unmapped stage strings: ${JSON.stringify(unmapped)}`);
    }
    for (const m of raw) {
      if (m.stage === "GROUP_STAGE") continue;
      log.push(`Non-group match: stage="${m.stage}" md=${m.matchday} ${m.homeTeam?.name} v ${m.awayTeam?.name} -> roundId=${matchRoundId(m)}`);
    }

    const resultLookup = buildResultLookup(finished);

    // Update matchResults map in state. Keyed by "roundId|home|away" so the
    // fixtures tab shows the correct score against the correct matchday.
    if (!state.matchResults) state.matchResults = {};
    for (const m of finished) {
      if (!m.homeLabel || !m.awayLabel || m.roundId == null) continue;
      if (m.homeGoals === null) continue;
      const key = `${m.roundId}|${m.homeLabel}|${m.awayLabel}`;
      state.matchResults[key] = { h: m.homeGoals, a: m.awayGoals };
    }

    let totalChanges = 0;

    for (const game of state.games) {
      if (game.complete) continue;

      for (let rIdx = 0; rIdx < game.rounds.length; rIdx++) {
        const round   = game.rounds[rIdx];
        const wcRound = ROUNDS.find(r => r.id === round.id);
        if (!wcRound) continue;

        const isKnockout   = round.id >= 4;
        const aliveAtStart = getAliveAtStart(game, state.players, rIdx);

        for (const player of aliveAtStart) {
          const pick    = round.picks[player];
          const current = round.outcomes[player];

          if (!pick) continue;
          if (current === OUTCOME.WIN || current === OUTCOME.LOSE || current === OUTCOME.DRAW) continue;

          const outcome = resolveOutcome(pick, round.id, resultLookup, isKnockout);
          if (outcome === null) continue;

          log.push(`${game.label} R${round.id}: ${player} picked ${pick} -> ${outcome}`);
          if (!isDry) {
            round.outcomes[player] = outcome;
            totalChanges++;
          }
        }

        if (!isDry && totalChanges > 0) {
          const newGame = evaluateGameEnd(game, state.players);
          if (newGame) {
            const alreadyExists = state.games.length > state.games.indexOf(game) + 1;
            if (!alreadyExists) {
              newGame.id    = state.games.length + 1;
              newGame.label = `Game ${newGame.id}`;
              state.games.push(newGame);
              log.push(`Game ended - spawned ${newGame.label}`);
            }
          }
        }
      }
    }

    if (!isDry) {
      // Always save if matchResults changed, even if no outcomes changed
      const hasNewScores = finished.some(m => m.homeGoals !== null);
      if (totalChanges > 0 || hasNewScores) {
        await saveState(state);
        log.push(`Saved - ${totalChanges} outcome(s) updated, scores stored`);
      } else {
        log.push("No changes to save");
      }
    } else {
      log.push("Dry run - nothing saved");
    }

    return respond({ ok: true, dry: isDry, changes: totalChanges, log });

  } catch (e) {
    log.push("Error: " + e.message);
    return respond({ ok: false, log, error: e.message }, 500);
  }
}

function respond(obj, status = 200) {
  return new Response(JSON.stringify(obj, null, 2), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
