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
  return null;
}

// ── State via your own /api/state route ──────────────────────────────────────
// This avoids any Redis client issues by reusing the working endpoint.
async function loadState(baseUrl) {
  const res = await fetch(`${baseUrl}/api/state`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load state: ${res.status}`);
  return res.json();
}

async function saveState(baseUrl, state) {
  state.lastUpdated = Date.now();
  const res = await fetch(`${baseUrl}/api/state`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(state),
  });
  if (!res.ok) throw new Error(`Failed to save state: ${res.status}`);
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
  return (data.matches ?? []).map(m => ({
    homeLabel: toTrackerLabel(m.homeTeam?.name),
    awayLabel: toTrackerLabel(m.awayTeam?.name),
    winner:    m.score?.winner,
    duration:  m.score?.duration,
  }));
}

function buildResultLookup(matches) {
  const lookup = {};
  for (const m of matches) {
    if (!m.homeLabel || !m.awayLabel) continue;
    const flipped =
      m.winner === "HOME_TEAM" ? "AWAY_TEAM" :
      m.winner === "AWAY_TEAM" ? "HOME_TEAM" : m.winner;
    lookup[`${m.homeLabel}|${m.awayLabel}`] = { winner: m.winner,  duration: m.duration };
    lookup[`${m.awayLabel}|${m.homeLabel}`] = { winner: flipped,   duration: m.duration };
  }
  return lookup;
}

function resolveOutcome(pick, resultLookup, isKnockout) {
  for (const [key, result] of Object.entries(resultLookup)) {
    const [home] = key.split("|");
    if (home !== pick) continue;
    const { winner } = result;
    if (winner === "DRAW") return isKnockout ? null : OUTCOME.DRAW;
    return winner === "HOME_TEAM" ? OUTCOME.WIN : OUTCOME.LOSE;
  }
  return null;
}

// ── Main handler ──────────────────────────────────────────────────────────────
export async function GET(request) {
  const url        = new URL(request.url);
  const baseUrl    = `${url.protocol}//${url.host}`;
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
    const state = await loadState(baseUrl);
    if (!state) return respond({ error: "No state in Redis" }, 500);
    log.push("State loaded successfully");

    const finished     = await fetchFinishedMatches(apiKey);
    log.push(`Fetched ${finished.length} finished match(es) from API`);
    const resultLookup = buildResultLookup(finished);

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

          const outcome = resolveOutcome(pick, resultLookup, isKnockout);
          if (outcome === null) continue;

          log.push(`${game.label} R${round.id}: ${player} picked ${pick} → ${outcome}`);
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
              log.push(`Game ended — spawned ${newGame.label}`);
            }
          }
        }
      }
    }

    if (!isDry && totalChanges > 0) {
      await saveState(baseUrl, state);
      log.push(`Saved — ${totalChanges} outcome(s) updated`);
    } else if (isDry) {
      log.push("Dry run — nothing saved");
    } else {
      log.push("No new outcomes to update");
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
