// Place at: app/api/sync-scores/route.js
//
// Cron endpoint — called by Vercel Cron every 5 minutes during the tournament.
// Fetches finished WC matches from football-data.org, resolves LMS outcomes
// automatically, and saves state back to Redis.
//
// Safe to call manually too: GET /api/sync-scores
// Add ?dry=1 to preview what WOULD change without saving anything.

export const dynamic = "force-dynamic";

import { Redis } from "@upstash/redis";
import { toTrackerLabel } from "../test-scores/route";

// ── Redis (matches your existing /api/state/route.js exactly) ────────────────
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const KEY = "wc_lms_state";

async function loadState() {
  const data = await redis.get(KEY);
  return data || null;
}

async function saveState(state) {
  state.lastUpdated = Date.now();
  await redis.set(KEY, state);
}

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

  // Don't spawn a new game after the Final
  const wcIdx = ROUNDS.findIndex(wr => wr.id === lastRound.id);
  if (wcIdx >= ROUNDS.length - 1) return;

  const pot     = calcPot(g, players);
  const newGame = buildGame(0, wcIdx + 1);
  newGame.rollover = alive.length === 0 ? pot : 0;
  return newGame;
}

// ── Fetch finished WC matches from football-data.org ────────────────────────
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
    winner:    m.score?.winner,   // HOME_TEAM | AWAY_TEAM | DRAW
    duration:  m.score?.duration, // REGULAR | EXTRA_TIME | PENALTY_SHOOTOUT
  }));
}

// Build a lookup: "TeamA|TeamB" → { winner, duration }
// Both orderings stored so pick-lookup is order-independent.
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

// Resolve a player's picked team against the result lookup.
// Returns WIN | LOSE | DRAW | null (null = match not finished yet)
function resolveOutcome(pick, resultLookup, isKnockout) {
  // Find any lookup entry where pick is the home team (avoid double-counting)
  for (const [key, result] of Object.entries(resultLookup)) {
    const [home] = key.split("|");
    if (home !== pick) continue;

    const { winner, duration } = result;

    if (winner === "DRAW") {
      // In knockouts the API still returns HOME_TEAM/AWAY_TEAM when ET/pens decide it,
      // so a genuine DRAW here only occurs in the group stage.
      if (isKnockout) return null; // shouldn't happen, but guard anyway
      return OUTCOME.DRAW;
    }

    return winner === "HOME_TEAM" ? OUTCOME.WIN : OUTCOME.LOSE;
  }
  return null; // match not in finished results yet
}

// ── Main handler ─────────────────────────────────────────────────────────────
export async function GET(request) {
  const isDry      = new URL(request.url).searchParams.get("dry") === "1";
  const apiKey     = process.env.FOOTBALL_DATA_API_KEY;
  const cronSecret = process.env.CRON_SECRET;
  const log        = [];

  if (!apiKey) return json({ error: "FOOTBALL_DATA_API_KEY not set" }, 500);

  // Protect the live endpoint from external callers.
  // Dry-run is always allowed (read-only); live runs require the secret header
  // that Vercel Cron sends automatically.
  if (!isDry && cronSecret) {
    const incoming = request.headers.get("x-cron-secret");
    if (incoming !== cronSecret) return json({ error: "Unauthorised" }, 401);
  }

  try {
    // 1. Load state from Redis
    const state = await loadState();
    if (!state) return json({ error: "No state in Redis" }, 500);

    // 2. Fetch all finished matches and build lookup
    const finished     = await fetchFinishedMatches(apiKey);
    log.push(`Fetched ${finished.length} finished match(es) from API`);
    const resultLookup = buildResultLookup(finished);

    // 3. Walk every active game → every round → every alive player
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

          if (!pick) continue; // no pick yet
          if (current === OUTCOME.WIN || current === OUTCOME.LOSE || current === OUTCOME.DRAW) {
            continue; // already resolved — never overwrite
          }

          const outcome = resolveOutcome(pick, resultLookup, isKnockout);
          if (outcome === null) continue; // match not finished yet

          log.push(`${game.label} R${round.id}: ${player} picked ${pick} → ${outcome}`);
          if (!isDry) {
            round.outcomes[player] = outcome;
            totalChanges++;
          }
        }

        // Check whether this outcome update ended the game
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

    // 4. Save if anything changed
    if (!isDry && totalChanges > 0) {
      await saveState(state);
      log.push(`Saved — ${totalChanges} outcome(s) updated`);
    } else if (isDry) {
      log.push("Dry run — nothing saved");
    } else {
      log.push("No new outcomes to update");
    }

    return json({ ok: true, dry: isDry, changes: totalChanges, log });

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
