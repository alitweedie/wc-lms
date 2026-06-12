// Place at: app/api/sync-scores/route.js
//
// Cron endpoint — called by Vercel Cron every 5 minutes during the tournament.
// Fetches finished WC matches from football-data.org, resolves LMS outcomes
// automatically, and saves state back to Redis.
//
// Safe to call manually too: GET /api/sync-scores
// Add ?dry=1 to preview what WOULD change without saving anything.

export const dynamic = "force-dynamic";

import { toTrackerLabel } from "../test-scores/route";

// ── Shared constants (mirrors page.jsx) ──────────────────────────────────────
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

// ── Redis helpers (same pattern as your existing /api/state route) ───────────
async function loadState() {
  const res = await fetch(process.env.KV_REST_API_URL + "/get/wc-lms-state", {
    headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}` },
    cache: "no-store",
  });
  const { result } = await res.json();
  return result ? JSON.parse(result) : null;
}

async function saveState(state) {
  state.lastUpdated = Date.now();
  await fetch(process.env.KV_REST_API_URL + "/set/wc-lms-state", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ value: JSON.stringify(state) }),
  });
}

// ── State helpers (mirrors page.jsx logic) ───────────────────────────────────
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
      if (i > 0 && !pick)                              { elim[p] = r.id; continue; }
      if (o === OUTCOME.LOSE || o === OUTCOME.DRAW)    { elim[p] = r.id; }
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
      const r = game.rounds[i];
      if (!roundResolved(r)) break;
      const pick = r.picks[p];
      const o    = r.outcomes[p];
      if (i > 0 && !pick)                              { eliminated = r.id; break; }
      if (o === OUTCOME.LOSE || o === OUTCOME.DRAW)    { eliminated = r.id; break; }
    }
    if (eliminated !== null) m[p] = eliminated;
  }
  return m;
}

function buildGame(id, startRoundIdx = 0) {
  return {
    id, label: `Game ${id}`, startRoundIdx,
    rounds: ROUNDS.slice(startRoundIdx).map(r => ({
      id: r.id, label: r.label ?? "", stage: r.stage, picks: {}, outcomes: {}, tiebreaker: {},
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

  const entrants  = gameEntrants(g, players);
  const lastRound = g.rounds[lastSettledIdx];
  const isFinalRound = lastSettledIdx === g.rounds.length - 1;

  const survivors = entrants.filter(p => lastRound.outcomes[p] === OUTCOME.WIN);
  const elimMap   = buildElimMap(g, players);
  const alive     = entrants.filter(p => elimMap[p] == null);

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
  g.winners  = survivors.length === 1 ? survivors : (isFinalRound && survivors.length > 0 ? survivors : []);
  if (survivors.length === 0) g.rolledOver = true;

  // Don't spawn a new game after the Final
  const wcIdx = ROUNDS.findIndex(wr => wr.id === lastRound.id);
  if (wcIdx >= ROUNDS.length - 1) return;

  const pot     = calcPot(g, players);
  const newGame = buildGame(0, wcIdx + 1);
  newGame.rollover = alive.length === 0 ? pot : 0;
  return newGame;
}

// ── Fetch finished WC matches from football-data.org ────────────────────────
async function fetchFinishedMatches(key) {
  const res = await fetch(
    "https://api.football-data.org/v4/competitions/WC/matches?status=FINISHED",
    { headers: { "X-Auth-Token": key }, cache: "no-store" }
  );
  if (!res.ok) throw new Error(`football-data.org returned ${res.status}`);
  const data = await res.json();
  return (data.matches ?? []).map(m => ({
    homeLabel: toTrackerLabel(m.homeTeam?.name),
    awayLabel: toTrackerLabel(m.awayTeam?.name),
    winner:    m.score?.winner,    // HOME_TEAM | AWAY_TEAM | DRAW
    duration:  m.score?.duration,  // REGULAR | EXTRA_TIME | PENALTY_SHOOTOUT
    utcDate:   m.utcDate,
  }));
}

// Build a lookup: "TeamA|TeamB" → { winner, duration }
// Both orderings are stored so pick-lookup is order-independent.
function buildResultLookup(matches) {
  const lookup = {};
  for (const m of matches) {
    if (!m.homeLabel || !m.awayLabel) continue;
    const key1 = `${m.homeLabel}|${m.awayLabel}`;
    const key2 = `${m.awayLabel}|${m.homeLabel}`;
    // Flip winner for the reversed key
    const flippedWinner =
      m.winner === "HOME_TEAM" ? "AWAY_TEAM" :
      m.winner === "AWAY_TEAM" ? "HOME_TEAM" : m.winner;
    lookup[key1] = { winner: m.winner,        duration: m.duration };
    lookup[key2] = { winner: flippedWinner,   duration: m.duration };
  }
  return lookup;
}

// For a player's pick (a single team label) and a result lookup,
// return WIN | LOSE | DRAW | null (null = match not finished yet)
function resolveOutcome(pickedTeam, roundFixtures, resultLookup, isKnockout) {
  // Find the fixture in this round that involves the picked team
  const fixture = roundFixtures.find(([h, a]) => h === pickedTeam || a === pickedTeam);
  if (!fixture) return null; // team not in this round — shouldn't happen

  const [home, away] = fixture;
  const key = `${home}|${away}`;
  const result = resultLookup[key];
  if (!result) return null; // match not finished yet

  const isHome = home === pickedTeam;
  const { winner, duration } = result;

  if (winner === "DRAW") {
    // Knockout rounds: draws go to ET/pens, which always produce a winner
    // so DRAW at full time in a knockout = check duration
    if (isKnockout && (duration === "EXTRA_TIME" || duration === "PENALTY_SHOOTOUT")) {
      // This shouldn't happen (API gives HOME_TEAM/AWAY_TEAM for ET/pens winners)
      // but guard just in case
      return null;
    }
    return OUTCOME.DRAW;
  }

  const pickedWon = (winner === "HOME_TEAM" && isHome) || (winner === "AWAY_TEAM" && !isHome);
  return pickedWon ? OUTCOME.WIN : OUTCOME.LOSE;
}

// ── Main handler ─────────────────────────────────────────────────────────────
export async function GET(request) {
  const isDry = new URL(request.url).searchParams.get("dry") === "1";

  const key = process.env.FOOTBALL_DATA_API_KEY;
  if (!key) {
    return json({ error: "FOOTBALL_DATA_API_KEY env var not set" }, 500);
  }

  // Verify this is a legitimate cron call in production
  // (Vercel sends this header; skip check in dev/dry-run)
  const cronSecret  = request.headers.get("x-cron-secret");
  const expectedSecret = process.env.CRON_SECRET;
  if (!isDry && expectedSecret && cronSecret !== expectedSecret) {
    return json({ error: "Unauthorised" }, 401);
  }

  const log = [];

  try {
    // 1. Load state
    const state = await loadState();
    if (!state) return json({ error: "No state in Redis" }, 500);

    // 2. Fetch finished matches
    const finished = await fetchFinishedMatches(key);
    log.push(`Fetched ${finished.length} finished matches from API`);

    const resultLookup = buildResultLookup(finished);

    // 3. Walk every active (incomplete) game
    let totalChanges = 0;

    for (const game of state.games) {
      if (game.complete) continue;

      for (let rIdx = 0; rIdx < game.rounds.length; rIdx++) {
        const round    = game.rounds[rIdx];
        const wcRound  = ROUNDS.find(r => r.id === round.id);
        if (!wcRound) continue;

        const isKnockout  = round.id >= 4;
        const aliveAtStart = getAliveAtStart(game, state.players, rIdx);

        // Get the fixture list for this round from the ROUNDS data in page.jsx.
        // We need the actual fixture pairings. Rather than duplicating all fixtures
        // here, we infer them from the result lookup — any match in the lookup
        // involving a team that a player picked is the relevant fixture.
        // The resolver works pick-by-pick: for each alive player with a PENDING
        // outcome, look up their team in the results.

        for (const player of aliveAtStart) {
          const pick    = round.picks[player];
          const current = round.outcomes[player];

          if (!pick) continue; // no pick yet — leave pending
          if (current === OUTCOME.WIN || current === OUTCOME.LOSE || current === OUTCOME.DRAW) {
            continue; // already resolved
          }

          // Find the result for this player's picked team in this round.
          // Look for any lookup key that starts with or ends with the picked team.
          let outcome = null;
          for (const [lookupKey, result] of Object.entries(resultLookup)) {
            const [home, away] = lookupKey.split("|");
            if (home !== pick) continue; // use the "home is pick" orientation only (avoid double-processing)
            outcome = resolveOutcome(pick, [[home, away]], resultLookup, isKnockout);
            if (outcome !== null) break;
          }

          if (outcome === null) continue; // match not finished yet

          log.push(`${game.label} R${round.id} ${player} picked ${pick} → ${outcome}`);
          if (!isDry) {
            round.outcomes[player] = outcome;
            totalChanges++;
          }
        }

        // After updating outcomes, check if the game should end
        if (!isDry && totalChanges > 0) {
          const newGame = evaluateGameEnd(game, state.players);
          if (newGame) {
            const alreadyExists = state.games.length > state.games.indexOf(game) + 1;
            if (!alreadyExists) {
              newGame.id    = state.games.length + 1;
              newGame.label = `Game ${newGame.id}`;
              state.games.push(newGame);
              log.push(`Game ended — spawned ${newGame.label} starting at round ${newGame.startRoundIdx + 1}`);
            }
          }
        }
      }
    }

    // 4. Save if anything changed
    if (!isDry && totalChanges > 0) {
      await saveState(state);
      log.push(`Saved state (${totalChanges} outcome(s) updated)`);
    } else if (isDry) {
      log.push("Dry run — no changes saved");
    } else {
      log.push("No new outcomes to update");
    }

    return json({ ok: true, dry: isDry, changes: totalChanges, log }, 200);

  } catch (e) {
    log.push("Error: " + e.message);
    return json({ ok: false, log, error: e.message }, 500);
  }
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj, null, 2), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
