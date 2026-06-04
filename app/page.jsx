"use client";
import { useState, useEffect, useCallback, useRef } from "react";

// Load Bebas Neue + DM Sans from Google Fonts
if (typeof document !== "undefined") {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700;800&display=swap";
  document.head.appendChild(link);
}

const FLAG = {
  "Mexico":"🇲🇽","South Africa":"🇿🇦","South Korea":"🇰🇷","Czechia":"🇨🇿",
  "Canada":"🇨🇦","Wales":"🏴󠁧󠁢󠁷󠁬󠁳󠁿","Croatia":"🇭🇷","Scotland":"🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  "Brazil":"🇧🇷","Qatar":"🇶🇦","Switzerland":"🇨🇭","Germany":"🇩🇪",
  "Curaçao":"🇨🇼","Ivory Coast":"🇨🇮","Ecuador":"🇪🇨","Netherlands":"🇳🇱",
  "Japan":"🇯🇵","Tunisia":"🇹🇳","Spain":"🇪🇸","Cape Verde":"🇨🇻",
  "Belgium":"🇧🇪","Egypt":"🇪🇬","Saudi Arabia":"🇸🇦","Uruguay":"🇺🇾",
  "Iran":"🇮🇷","New Zealand":"🇳🇿","France":"🇫🇷","Senegal":"🇸🇳",
  "Norway":"🇳🇴","Argentina":"🇦🇷","Algeria":"🇩🇿","Austria":"🇦🇹",
  "Jordan":"🇯🇴","Portugal":"🇵🇹","England":"🏴󠁧󠁢󠁥󠁮󠁧󠁿","Ghana":"🇬🇭",
  "Morocco":"🇲🇦","USA":"🇺🇸","Paraguay":"🇵🇾","Australia":"🇦🇺",
  "Turkey":"🇹🇷","Colombia":"🇨🇴","Serbia":"🇷🇸","Cameroon":"🇨🇲",
  "Poland":"🇵🇱","Italy":"🇮🇹","Denmark":"🇩🇰","Costa Rica":"🇨🇷",
  "Haiti":"🇭🇹","Panama":"🇵🇦","Bosnia & Herz.":"🇧🇦","DR Congo":"🇨🇩",
  "Uzbekistan":"🇺🇿","Sweden":"🇸🇪","Iraq":"🇮🇶",
};

const ROUNDS = [
  {
    id:1, label:"Group Stage – Matchday 1", stage:"Group Stage",
    deadline:"Wed 11 Jun, 18:00 BST",
    note:"Pick any team playing their first group game. A draw eliminates you. Not picking = sitting this game out (no entry fee).",
    fixtures:[
      ["Mexico","South Africa","Thu 11 Jun","20:00 BST"],
      ["Australia","Turkey","Fri 12 Jun","05:00 BST"],
      ["Canada","Bosnia & Herz.","Fri 12 Jun","20:00 BST"],
      ["USA","Paraguay","Sat 13 Jun","02:00 BST"],
      ["Scotland","Haiti","Sat 13 Jun","02:00 BST"],
      ["South Korea","Czechia","Sat 13 Jun","03:00 BST"],
      ["Germany","Curaçao","Sat 13 Jun","18:00 BST"],
      ["Qatar","Switzerland","Sat 13 Jun","20:00 BST"],
      ["Brazil","Morocco","Sat 13 Jun","23:00 BST"],
      ["Ivory Coast","Ecuador","Sun 14 Jun","00:00 BST"],
      ["Spain","Cape Verde","Sun 14 Jun","17:00 BST"],
      ["Netherlands","Japan","Sun 14 Jun","21:00 BST"],
      ["Saudi Arabia","Uruguay","Sun 14 Jun","23:00 BST"],
      ["Iran","New Zealand","Mon 15 Jun","02:00 BST"],
      ["Tunisia","Sweden","Mon 15 Jun","03:00 BST"],
      ["France","Senegal","Mon 15 Jun","20:00 BST"],
      ["Iraq","Norway","Mon 15 Jun","23:00 BST"],
      ["Belgium","Egypt","Tue 16 Jun","02:00 BST"],
      ["Argentina","Algeria","Tue 16 Jun","02:00 BST"],
      ["Austria","Jordan","Tue 16 Jun","05:00 BST"],
      ["Portugal","DR Congo","Tue 16 Jun","18:00 BST"],
      ["England","Croatia","Tue 16 Jun","21:00 BST"],
      ["Ghana","Panama","Wed 17 Jun","00:00 BST"],
      ["Uzbekistan","Colombia","Wed 17 Jun","03:00 BST"],
    ],
  },
  {
    id:2, label:"Group Stage – Matchday 2", stage:"Group Stage",
    deadline:"Thu 19 Jun, 16:00 BST",
    note:"Pick any team playing their second group game. A draw eliminates you. Missing this round = auto-eliminated.",
    fixtures:[
      ["Czechia","South Africa","Thu 18 Jun","17:00 BST"],
      ["Switzerland","Bosnia & Herz.","Thu 18 Jun","20:00 BST"],
      ["Canada","Qatar","Thu 18 Jun","23:00 BST"],
      ["Mexico","South Korea","Fri 19 Jun","02:00 BST"],
      ["Brazil","Haiti","Sat 20 Jun","02:00 BST"],
      ["USA","Australia","Sat 20 Jun","05:00 BST"],
      ["Paraguay","Turkey","Sat 20 Jun","05:00 BST"],
      ["Germany","Ivory Coast","Sat 20 Jun","21:00 BST"],
      ["Morocco","Scotland","Sat 20 Jun","23:00 BST"],
      ["Curaçao","Ecuador","Sun 21 Jun","01:00 BST"],
      ["Japan","Sweden","Sun 21 Jun","05:00 BST"],
      ["Uruguay","Cape Verde","Sun 21 Jun","17:00 BST"],
      ["Netherlands","Tunisia","Sun 21 Jun","18:00 BST"],
      ["Belgium","Iran","Sun 21 Jun","20:00 BST"],
      ["Spain","Saudi Arabia","Sun 21 Jun","23:00 BST"],
      ["New Zealand","Egypt","Mon 22 Jun","02:00 BST"],
      ["Argentina","Austria","Mon 22 Jun","18:00 BST"],
      ["England","Ghana","Mon 22 Jun","21:00 BST"],
      ["France","Iraq","Mon 22 Jun","22:00 BST"],
      ["Panama","Croatia","Tue 23 Jun","00:00 BST"],
      ["Norway","Senegal","Tue 23 Jun","01:00 BST"],
      ["DR Congo","Colombia","Tue 23 Jun","02:00 BST"],
      ["Portugal","Uzbekistan","Tue 23 Jun","21:00 BST"],
      ["Algeria","Jordan","Tue 23 Jun","23:00 BST"],
    ],
  },
  {
    id:3, label:"Group Stage – Matchday 3", stage:"Group Stage",
    deadline:"Thu 26 Jun, 16:00 BST",
    note:"Final group games. Simultaneous kick-offs — must WIN, no draws.",
    fixtures:[
      ["Mexico","Czechia","Sat 27 Jun","20:00 BST"],
      ["South Africa","South Korea","Sat 27 Jun","20:00 BST"],
      ["Switzerland","Canada","Sat 27 Jun","23:00 BST"],
      ["Qatar","Bosnia & Herz.","Sat 27 Jun","23:00 BST"],
      ["Scotland","Brazil","Sun 28 Jun","20:00 BST"],
      ["Haiti","Morocco","Sun 28 Jun","20:00 BST"],
      ["USA","Turkey","Sun 28 Jun","23:00 BST"],
      ["Australia","Paraguay","Sun 28 Jun","23:00 BST"],
      ["Ecuador","Germany","Mon 29 Jun","20:00 BST"],
      ["Curaçao","Ivory Coast","Mon 29 Jun","20:00 BST"],
      ["Sweden","Netherlands","Mon 29 Jun","23:00 BST"],
      ["Tunisia","Japan","Mon 29 Jun","23:00 BST"],
      ["Spain","Uruguay","Tue 30 Jun","20:00 BST"],
      ["Saudi Arabia","Cape Verde","Tue 30 Jun","20:00 BST"],
      ["Iran","Egypt","Tue 30 Jun","23:00 BST"],
      ["Belgium","New Zealand","Tue 30 Jun","23:00 BST"],
      ["Norway","France","Wed 1 Jul","20:00 BST"],
      ["Senegal","Iraq","Wed 1 Jul","20:00 BST"],
      ["Argentina","Jordan","Wed 1 Jul","23:00 BST"],
      ["Algeria","Austria","Wed 1 Jul","23:00 BST"],
      ["England","Panama","Thu 2 Jul","20:00 BST"],
      ["Croatia","Ghana","Thu 2 Jul","20:00 BST"],
      ["Portugal","Colombia","Thu 2 Jul","23:00 BST"],
      ["Uzbekistan","DR Congo","Thu 2 Jul","23:00 BST"],
    ],
  },
  {
    id:4, label:"Round of 32", stage:"Round of 32",
    deadline:"Sat 5 Jul, 16:00 BST",
    note:"32 teams. No draws — extra time & penalties if level after 90 mins.",
    fixtures:[
      ["Group A Winner","TBD","Sun 6 Jul","17:00"],["Group B Winner","TBD","Sun 6 Jul","20:30"],
      ["Group C Winner","TBD","Sun 6 Jul","22:00"],["Group D Winner","TBD","Mon 7 Jul","17:00"],
      ["Group E Winner","TBD","Mon 7 Jul","20:30"],["Group F Winner","TBD","Mon 7 Jul","22:00"],
      ["Group G Winner","TBD","Tue 8 Jul","17:00"],["Group H Winner","TBD","Tue 8 Jul","20:30"],
      ["Group I Winner","TBD","Tue 8 Jul","22:00"],["Group J Winner","TBD","Wed 9 Jul","17:00"],
      ["Group K Winner","TBD","Wed 9 Jul","20:30"],["Group L Winner","TBD","Wed 9 Jul","22:00"],
      ["Group A Runner-up","TBD","Thu 10 Jul","17:00"],["Group B Runner-up","TBD","Thu 10 Jul","20:30"],
      ["Group C Runner-up","TBD","Thu 10 Jul","22:00"],["Group D Runner-up","TBD","Fri 11 Jul","17:00"],
    ],
  },
  {
    id:5, label:"Round of 16", stage:"Round of 16",
    deadline:"Sat 12 Jul, 16:00 BST",
    note:"16 teams remaining. No draws.",
    fixtures:[
      ["R32 M1 Winner","R32 M2 Winner","Sun 13 Jul","17:00"],["R32 M3 Winner","R32 M4 Winner","Sun 13 Jul","21:00"],
      ["R32 M5 Winner","R32 M6 Winner","Mon 14 Jul","17:00"],["R32 M7 Winner","R32 M8 Winner","Mon 14 Jul","21:00"],
      ["R32 M9 Winner","R32 M10 Winner","Tue 15 Jul","17:00"],["R32 M11 Winner","R32 M12 Winner","Tue 15 Jul","21:00"],
      ["R32 M13 Winner","R32 M14 Winner","Wed 16 Jul","17:00"],["R32 M15 Winner","R32 M16 Winner","Wed 16 Jul","21:00"],
    ],
  },
  {
    id:6, label:"Quarter-Finals", stage:"Quarter-Finals",
    deadline:"Thu 17 Jul, 18:00 BST",
    note:"8 teams. No draws.",
    fixtures:[
      ["R16 M1 Winner","R16 M2 Winner","Fri 18 Jul","20:00"],["R16 M3 Winner","R16 M4 Winner","Sat 19 Jul","00:00"],
      ["R16 M5 Winner","R16 M6 Winner","Sat 19 Jul","20:00"],["R16 M7 Winner","R16 M8 Winner","Sun 20 Jul","00:00"],
    ],
  },
  {
    id:7, label:"Semi-Finals", stage:"Semi-Finals",
    deadline:"Tue 22 Jul, 20:00 BST",
    note:"4 teams. No draws.",
    fixtures:[
      ["SF M1 Winner","SF M2 Winner","Wed 23 Jul","23:00"],["SF M3 Winner","SF M4 Winner","Thu 24 Jul","23:00"],
    ],
  },
  {
    id:8, label:"Final", stage:"Final",
    deadline:"Sat 26 Jul, 19:00 BST",
    note:"The World Cup Final at MetLife Stadium, New Jersey. Tiebreaker: predict the minute of the first goal.",
    fixtures:[["SF M1 Winner","SF M2 Winner","Sun 27 Jul","20:00"]],
    hasTiebreaker: true,
  },
];

const isPlaceholder = t => !t || t.includes("Winner") || t.includes("TBD") || t.includes("Runner") || t.includes("R32") || t.includes("R16") || t.includes("QF") || t.includes("SF");

// Parse a date+time string from fixtures e.g. "Thu 11 Jun" + "20:00 BST"
// BST = UTC+1, so subtract 1 hour to get UTC
const MONTH_MAP = {Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11};
function parseKickoff(dateStr, timeStr) {
  try {
    const dm = dateStr.match(/(\d+)\s+(\w+)/);
    const tm = timeStr.match(/(\d+):(\d+)/);
    if (!dm || !tm) return null;
    const [,day,mon] = dm;
    const [,hh,mm] = tm;
    const month = MONTH_MAP[mon];
    if (month === undefined) return null;
    // BST = UTC+1, subtract 1hr for UTC
    return new Date(Date.UTC(2026, month, parseInt(day), parseInt(hh) - 1, parseInt(mm)));
  } catch { return null; }
}

// Lock time = kick-off of the first fixture in the round
function getRoundLockTime(wcRound) {
  if (!wcRound || !wcRound.fixtures || wcRound.fixtures.length === 0) return null;
  const [,, date, time] = wcRound.fixtures[0];
  return parseKickoff(date, time);
}

function isRoundLocked(wcRound) {
  const lockTime = getRoundLockTime(wcRound);
  if (!lockTime) return false;
  return Date.now() > lockTime.getTime();
}
const realTeams = r => [...new Set(r.fixtures.flatMap(([h,a])=>[h,a]).filter(t=>!isPlaceholder(t)))].sort();

const OUTCOME = { WIN:"win", LOSE:"lose", DRAW:"draw", PENDING:"" };
const POLL_MS = 5000;
const ENTRY_FEE = 2;
const PREDICTOR_FEE = 10; // £10 per person for the predictor game

// All 48 WC 2026 teams for dropdowns
const ALL_NATIONS = [
  "Algeria","Argentina","Australia","Austria","Belgium","Bosnia & Herz.",
  "Brazil","Canada","Cape Verde","Colombia","Costa Rica","Croatia","Curaçao",
  "Czechia","DR Congo","Ecuador","Egypt","England","France","Germany","Ghana",
  "Haiti","Iran","Iraq","Ivory Coast","Japan","Jordan","Mexico","Morocco",
  "Netherlands","New Zealand","Norway","Panama","Paraguay","Portugal","Qatar",
  "Saudi Arabia","Scotland","Senegal","South Africa","South Korea","Spain",
  "Sweden","Switzerland","Tunisia","Turkey","Uruguay","USA","Uzbekistan","Wales",
].sort();

const PREDICTOR_QUESTIONS = [
  // ── 15 points ──────────────────────────────────────────────────────────────
  { id:"winner",      pts:15, label:"Tournament Winner",                              type:"nation",   cat:"15pts" },
  { id:"runner_up",   pts:15, label:"Runner-Up",                                      type:"nation",   cat:"15pts" },
  { id:"semi1",       pts:15, label:"Semi-Finalist #1",                               type:"nation",   cat:"15pts" },
  { id:"semi2",       pts:15, label:"Semi-Finalist #2",                               type:"nation",   cat:"15pts" },
  { id:"semi3",       pts:15, label:"Semi-Finalist #3",                               type:"nation",   cat:"15pts" },
  { id:"semi4",       pts:15, label:"Semi-Finalist #4",                               type:"nation",   cat:"15pts" },
  { id:"golden_boot", pts:15, label:"Golden Boot – Top Scorer (player name)",         type:"freetext", cat:"15pts" },
  { id:"most_concede",pts:15, label:"Nation that concedes the most goals",            type:"nation",   cat:"15pts" },
  // ── Group Winners – 5 points each ──────────────────────────────────────────
  { id:"group_a", pts:5, label:"Group A Winner", type:"nation", cat:"Groups" },
  { id:"group_b", pts:5, label:"Group B Winner", type:"nation", cat:"Groups" },
  { id:"group_c", pts:5, label:"Group C Winner", type:"nation", cat:"Groups" },
  { id:"group_d", pts:5, label:"Group D Winner", type:"nation", cat:"Groups" },
  { id:"group_e", pts:5, label:"Group E Winner", type:"nation", cat:"Groups" },
  { id:"group_f", pts:5, label:"Group F Winner", type:"nation", cat:"Groups" },
  { id:"group_g", pts:5, label:"Group G Winner", type:"nation", cat:"Groups" },
  { id:"group_h", pts:5, label:"Group H Winner", type:"nation", cat:"Groups" },
  { id:"group_i", pts:5, label:"Group I Winner", type:"nation", cat:"Groups" },
  { id:"group_j", pts:5, label:"Group J Winner", type:"nation", cat:"Groups" },
  { id:"group_k", pts:5, label:"Group K Winner", type:"nation", cat:"Groups" },
  { id:"group_l", pts:5, label:"Group L Winner", type:"nation", cat:"Groups" },
  // ── 5 points ───────────────────────────────────────────────────────────────
  { id:"first_red",   pts:5, label:"First nation to receive a red card",             type:"nation",   cat:"5pts" },
  { id:"most_reds",   pts:5, label:"Nation with the most red cards overall",         type:"nation",   cat:"5pts" },
  { id:"boot_runner", pts:5, label:"Golden Boot Runner-Up (player name)",            type:"freetext", cat:"5pts" },
  { id:"first_out",   pts:5, label:"First nation knocked out of the tournament",     type:"nation",   cat:"5pts" },
  { id:"own_goals",   pts:5, label:"Nation that scores the most own goals",          type:"nation",   cat:"5pts" },
  { id:"high_score",  pts:5, label:"Predict the score of the highest-scoring match", type:"score", cat:"5pts" },
  { id:"most_pens",   pts:5, label:"Nation that wins the most penalty shootouts",    type:"nation",   cat:"5pts" },
  // ── Tiebreaker ─────────────────────────────────────────────────────────────
  { id:"tiebreak",    pts:0, label:"Total goals scored in the tournament (closest wins)", type:"number", cat:"Tiebreaker" },
];

async function loadData() {
  try {
    const r = await fetch("/api/state", { cache: "no-store" });
    return await r.json();
  } catch { return null; }
}
async function saveData(d) {
  try {
    await fetch("/api/state", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(d),
    });
  } catch(e) { console.error(e); }
}

function buildGame(id, startRoundIdx=0) {
  return {
    id, label:`Game ${id}`, startRoundIdx,
    rounds: ROUNDS.slice(startRoundIdx).map(r=>({ id:r.id, label:r.label, stage:r.stage, picks:{}, outcomes:{}, tiebreaker:{} })),
    complete:false, winners:[], rollover:0,
  };
}

function defaultState() {
  return {
    players:["Ben","Tom","James","Tweedie","Kieran","Tucker","Ash","Toynbee"],
    games:[buildGame(1,0)],
    predictor: {
      picks: {},    // picks[player][questionId] = answer
      answers: {},  // answers[questionId] = correct answer (admin sets)
      overrides: {}, // overrides[questionId][player] = true/false (admin manual tick for freetext)
      locked: false,
    },
    lastUpdated:0,
  };
}

// ─── A round is resolved once every entrant who is alive at its start has a final outcome ──
// "Final outcome" = WIN, LOSE, or DRAW. PENDING / missing = not yet resolved.
function roundResolved(round) {
  return Object.values(round.outcomes).some(o => o===OUTCOME.WIN || o===OUTCOME.LOSE || o===OUTCOME.DRAW);
}

// ─── Who entered a game: anyone who made a pick in round 0 ────────────────────
// Before round 0 resolves, we treat everyone as a potential entrant so picks can be submitted.
function gameEntrants(game, players) {
  const r0 = game.rounds[0];
  if (!r0) return players;
  if (!roundResolved(r0)) return players; // round 0 not closed yet
  // Once round 0 closes, only those with a pick (or a non-pending outcome) entered
  return players.filter(p => !!r0.picks[p]);
}

// ─── Pot ─────────────────────────────────────────────────────────────────────
// Count players who have actually picked in round 0 (entered), not all players.
// Before round 0 closes, count current picks. After it closes, count confirmed entrants.
function calcPot(game, players) {
  const r0 = game.rounds[0];
  const pickedCount = r0 ? Object.values(r0.picks).filter(p => !!p).length : 0;
  const entrantCount = roundResolved(r0)
    ? gameEntrants(game, players).length  // locked in after round closes
    : pickedCount;                         // live count of picks so far
  return entrantCount * ENTRY_FEE + (game.rollover || 0);
}

// ─── Who was eliminated and in which round ────────────────────────────────────
// Returns: roundId = eliminated that round, -1 = sat out (never entered), null = still alive
function getElimRound(game, player, players) {
  const entrants = gameEntrants(game, players);
  if (!entrants.includes(player)) return -1; // sat out

  for (let i = 0; i < game.rounds.length; i++) {
    const r = game.rounds[i];
    if (!roundResolved(r)) break; // stop at first unresolved round
    const pick = r.picks[player];
    const o = r.outcomes[player];
    // Round 0: no pick = sat out (handled above). Round 1+: no pick = eliminated.
    if (i > 0 && !pick) return r.id;
    if (o === OUTCOME.LOSE || o === OUTCOME.DRAW) return r.id;
  }
  return null; // still alive
}

function buildElimMap(game, players) {
  const m = {};
  for (const p of players) {
    const rid = getElimRound(game, p, players);
    if (rid !== null) m[p] = rid; // null = alive, -1 = sat out, roundId = eliminated
  }
  return m;
}

// Who is alive going INTO the round at roundIndex (0-based within game.rounds)
function getAliveAtStart(game, players, roundIndex) {
  const entrants = gameEntrants(game, players);
  const elim = {};
  for (let i = 0; i < roundIndex; i++) {
    const r = game.rounds[i];
    if (!roundResolved(r)) break;
    for (const p of entrants) {
      if (elim[p]) continue;
      const pick = r.picks[p];
      const o = r.outcomes[p];
      if (i > 0 && !pick) { elim[p] = r.id; continue; }
      if (o === OUTCOME.LOSE || o === OUTCOME.DRAW) elim[p] = r.id;
    }
  }
  return entrants.filter(p => !elim[p]);
}

// ─── Check if the game should end after any outcome change ────────────────────
// A round is "fully settled" when every alive-at-start player has a WIN/LOSE/DRAW outcome.
function isRoundFullySettled(round, aliveAtStart) {
  return aliveAtStart.every(p => {
    const o = round.outcomes[p];
    const pick = round.picks[p];
    // No pick AND round is resolved = auto-loss (counts as settled)
    if (!pick && roundResolved(round)) return true;
    return o === OUTCOME.WIN || o === OUTCOME.LOSE || o === OUTCOME.DRAW;
  });
}

// Shared game-end evaluation — call after any outcome mutation
function evaluateGameEnd(g, players) {
  // Find the last fully-settled round
  let lastSettledIdx = -1;
  for (let i = 0; i < g.rounds.length; i++) {
    const alive = getAliveAtStart(g, players, i);
    if (isRoundFullySettled(g.rounds[i], alive)) {
      lastSettledIdx = i;
    } else {
      break; // stop at first unsettled round
    }
  }
  if (lastSettledIdx < 0) return; // nothing settled yet

  const entrants = gameEntrants(g, players);
  const lastRound = g.rounds[lastSettledIdx];
  const isFinalRound = lastSettledIdx === g.rounds.length - 1;

  // Count survivors of the last fully-settled round (players who got WIN)
  const survivors = entrants.filter(p => lastRound.outcomes[p] === OUTCOME.WIN);
  // Count players eliminated at or before this round
  const elimMap = buildElimMap(g, players);
  const alive = entrants.filter(p => elimMap[p] == null);

  // Game ends when:
  // - Exactly 1 player survives the last settled round (last man standing)
  // - Nobody survives (rollover)
  // - It's the final round and someone won
  // IMPORTANT: we use survivors from lastRound (not alive) to avoid
  // triggering game-end mid-round when others still have PENDING outcomes.
  const roundSurvivors = survivors.length;
  const roundEliminated = entrants.filter(p =>
    lastRound.outcomes[p] === OUTCOME.LOSE || lastRound.outcomes[p] === OUTCOME.DRAW
  ).length;
  const roundPending = entrants.filter(p =>
    !lastRound.outcomes[p] || lastRound.outcomes[p] === OUTCOME.PENDING
  ).length;

  // Don't end the game if any entrant still has a pending outcome in this round
  if (roundPending > 0) return;

  const gameOver = roundSurvivors <= 1 || isFinalRound;
  if (!gameOver) return;

  g.complete = true;
  g.winners = roundSurvivors === 1 ? survivors : (isFinalRound && roundSurvivors > 0 ? survivors : []);
  if (roundSurvivors === 0) g.rolledOver = true;

  const pot = calcPot(g, players);
  const wcIdx = ROUNDS.findIndex(wr => wr.id === lastRound.id);
  const nextWCIdx = Math.min(wcIdx + 1, ROUNDS.length - 1);
  const newGame = buildGame(0, nextWCIdx); // id set by caller
  newGame.rollover = alive.length === 0 ? pot : 0;
  return newGame;
}

function usedTeams(game, player, roundIndex) {
  // Track all picks across all rounds — no repeats ever allowed.
  const s = new Set();
  for (const r of game.rounds.slice(0, roundIndex)) {
    if (r.picks[player]) s.add(r.picks[player]);
  }
  return s;
}

// ─── Money tracker: compute P&L per player across all games ──────────────────
function computeMoneyTracker(state) {
  const tracker = {};
  for (const p of state.players) tracker[p] = { spent:0, won:0, games:[] };

  for (const game of state.games) {
    const r0 = game.rounds[0];
    const pot = calcPot(game, state.players);

    for (const p of state.players) {
      // A player only pays in if they actually made a pick in round 0.
      // Before round 0 closes, only count if they have a pick already set.
      const hasPick = r0 && !!r0.picks[p];
      const entered = hasPick;
      const isWinner = game.complete && game.winners.includes(p);
      const winnings = isWinner ? Math.floor(pot / game.winners.length) : 0;
      const cost = entered ? ENTRY_FEE : 0;

      tracker[p].spent += cost;
      tracker[p].won += winnings;
      tracker[p].games.push({
        gameId: game.id,
        gameLabel: game.label,
        entered,
        cost,
        winnings,
        complete: game.complete,
      });
    }
  }

  // Predictor entry and winnings
  const pred = state.predictor || { picks:{}, answers:{}, locked:false };
  const predEntrants = state.players.filter(p => pred.picks[p] && Object.keys(pred.picks[p]).some(id => id !== "tiebreak" && pred.picks[p][id] !== "" && pred.picks[p][id] !== null && pred.picks[p][id] !== undefined));
  const predPot = predEntrants.length * PREDICTOR_FEE;
  // Score each player
  const scores = {};
  for (const p of state.players) {
    scores[p] = 0;
    const picks = pred.picks[p] || {};
    // Semi-finalists are unordered — check both SF picks against both SF answers
    const sfAnswers = [pred.answers["semi1"], pred.answers["semi2"], pred.answers["semi3"], pred.answers["semi4"]].filter(Boolean).map(s=>s.toLowerCase().trim());
    for (const q of PREDICTOR_QUESTIONS) {
      if (q.id === "semi1" || q.id === "semi2" || q.id === "semi3" || q.id === "semi4") {
        // Award pts if this pick appears anywhere in the sf answers pool
        const pick = (picks[q.id]||"").toLowerCase().trim();
        if (pick && sfAnswers.includes(pick)) scores[p] += q.pts;
        continue;
      }
      if (q.type === "freetext") {
        const overrideVal = (pred.overrides||{})[q.id]?.[p];
        if (overrideVal === true) { scores[p] += q.pts; continue; }
        if (overrideVal === false) continue;
      }
      const ans = pred.answers[q.id];
      if (ans && picks[q.id]) {
        const normalise = v => v.includes("-") ? v.split("-").map(Number).sort((a,b)=>a-b).join("-") : v.toLowerCase().trim();
        if (normalise(ans) === normalise(picks[q.id])) scores[p] += q.pts;
      }
    }
  }
  const maxScore = Math.max(...Object.values(scores), 0);
  // Find leading entrants by score
  let predWinners = maxScore > 0 ? state.players.filter(p => scores[p] === maxScore && predEntrants.includes(p)) : [];
  // Tiebreaker: if multiple players tied on max score, closest tiebreak answer wins
  if (predWinners.length > 1 && pred.answers["tiebreak"]) {
    const correct = parseFloat(pred.answers["tiebreak"]);
    if (!isNaN(correct)) {
      let bestDiff = Infinity;
      for (const p of predWinners) {
        const guess = parseFloat((pred.picks[p]||{})["tiebreak"]);
        if (!isNaN(guess)) bestDiff = Math.min(bestDiff, Math.abs(guess - correct));
      }
      predWinners = predWinners.filter(p => {
        const guess = parseFloat((pred.picks[p]||{})["tiebreak"]);
        return !isNaN(guess) && Math.abs(guess - correct) === bestDiff;
      });
    }
  }
  const predPrizeEach = predWinners.length > 0 ? Math.floor(predPot / predWinners.length) : 0;

  for (const p of state.players) {
    const entered = predEntrants.includes(p);
    const predWinAmt = predWinners.includes(p) ? predPrizeEach : 0;
    tracker[p].spent += entered ? PREDICTOR_FEE : 0;
    tracker[p].won += predWinAmt;
    tracker[p].predictorScore = scores[p];
    tracker[p].predictorEntered = entered;
    tracker[p].predictorWinnings = predWinAmt;
    tracker[p].net = tracker[p].won - tracker[p].spent;
  }
  return tracker;
}

// ═══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const [tab, setTab] = useState("tracker");
  const [activeGameIdx, setActiveGameIdx] = useState(0);
  const [editingRound, setEditingRound] = useState(null);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [toast, setToast] = useState(null);
  const stateRef = useRef(null);

  useEffect(() => {
    loadData().then(d => {
      const s = d || defaultState();
      setState(s); stateRef.current = s;
      setActiveGameIdx((s.games?.length||1)-1);
      setLastSync(Date.now()); setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (loading) return;
    const iv = setInterval(async () => {
      const remote = await loadData();
      if (!remote) return;
      if ((remote.lastUpdated||0) > (stateRef.current?.lastUpdated||0)) {
        setState(remote); stateRef.current = remote;
        setActiveGameIdx((remote.games?.length||1)-1);
        setLastSync(Date.now()); showToast("🔄 Updated");
      } else setLastSync(Date.now());
    }, POLL_MS);
    return () => clearInterval(iv);
  }, [loading]);

  const showToast = (msg) => { setToast(msg); setTimeout(()=>setToast(null),3000); };

  const update = useCallback((fn) => {
    setSyncing(true);
    setState(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      fn(next);
      next.lastUpdated = Date.now();
      stateRef.current = next;
      saveData(next).then(()=>{ setSyncing(false); setLastSync(Date.now()); });
      return next;
    });
  }, []);

  const setTiebreaker = (gi, roundId, player, value) => update(s => {
    const r = s.games[gi].rounds.find(r => r.id === roundId);
    if (r) { if (!r.tiebreaker) r.tiebreaker = {}; r.tiebreaker[player] = value; }
  });

  const setPick = (gi, roundId, player, team) => update(s => {
    const r = s.games[gi].rounds.find(r=>r.id===roundId);
    if (r) { r.picks[player]=team; r.outcomes[player]=OUTCOME.PENDING; }
  });

  // Close a round: mark every alive player with no pick, or no final outcome, as LOSE.
  const closeRound = (gi, roundId) => update(s => {
    const g = s.games[gi];
    const r = g.rounds.find(r => r.id === roundId);
    if (!r) return;
    const roundIndex = g.rounds.indexOf(r);
    const aliveAtStart = getAliveAtStart(g, s.players, roundIndex);
    // Mark everyone without a resolved outcome as LOSE
    for (const p of aliveAtStart) {
      const o = r.outcomes[p];
      if (o !== OUTCOME.WIN && o !== OUTCOME.LOSE && o !== OUTCOME.DRAW) {
        r.outcomes[p] = OUTCOME.LOSE;
      }
    }
    // Evaluate game end
    const newGame = evaluateGameEnd(g, s.players);
    if (newGame) {
      newGame.id = s.games.length + 1;
      newGame.label = `Game ${newGame.id}`;
      s.games.push(newGame);
    }
  });

  // Reopen a round: clear all outcomes, un-complete the game if it was triggered by this round
  const reopenRound = (gi, roundId) => update(s => {
    const g = s.games[gi];
    const r = g.rounds.find(r => r.id === roundId);
    if (!r) return;
    // Clear all outcomes for this round
    for (const p of s.players) {
      if (r.outcomes[p] !== undefined) r.outcomes[p] = OUTCOME.PENDING;
    }
    // If the game was completed, un-complete it and remove the auto-spawned next game
    if (g.complete) {
      g.complete = false;
      g.winners = [];
      g.rolledOver = false;
      // Remove the last game if it was auto-spawned as a result of this game completing
      // (only remove if it has no picks at all yet)
      if (s.games.length > gi + 1) {
        const nextGame = s.games[gi + 1];
        const hasAnyPicks = nextGame.rounds.some(r => Object.values(r.picks).some(p => !!p));
        if (!hasAnyPicks) {
          s.games.splice(gi + 1, 1);
        }
      }
    }
  });

  // Set a single player's outcome then check if the game has ended
  const setOutcome = (gi, roundId, player, outcome) => update(s => {
    const g = s.games[gi];
    const r = g.rounds.find(r => r.id === roundId);
    if (!r) return;
    // Toggle off if already set to same value
    r.outcomes[player] = (r.outcomes[player] === outcome) ? OUTCOME.PENDING : outcome;
    const newGame = evaluateGameEnd(g, s.players);
    if (newGame) {
      newGame.id = s.games.length + 1;
      newGame.label = `Game ${newGame.id}`;
      s.games.push(newGame);
    }
  });

  const setPredictorPick = (player, questionId, answer) => update(s => {
    if (!s.predictor) s.predictor = { picks:{}, answers:{}, locked:false };
    if (!s.predictor.picks[player]) s.predictor.picks[player] = {};
    if (answer === "" || answer === null || answer === undefined) {
      // Remove empty picks so entrant detection stays accurate
      delete s.predictor.picks[player][questionId];
    } else {
      s.predictor.picks[player][questionId] = answer;
    }
    // If no non-tiebreak picks remain, remove the player entry entirely
    const remaining = Object.keys(s.predictor.picks[player]).filter(id => id !== "tiebreak");
    if (remaining.length === 0) {
      delete s.predictor.picks[player];
    }
  });

  const setPredictorAnswer = (questionId, answer) => update(s => {
    if (!s.predictor) s.predictor = { picks:{}, answers:{}, overrides:{}, locked:false };
    s.predictor.answers[questionId] = answer;
  });

  const setPredictorOverride = (questionId, player, value) => update(s => {
    if (!s.predictor) s.predictor = { picks:{}, answers:{}, overrides:{}, locked:false };
    if (!s.predictor.overrides) s.predictor.overrides = {};
    if (!s.predictor.overrides[questionId]) s.predictor.overrides[questionId] = {};
    s.predictor.overrides[questionId][player] = value;
  });

  const togglePredictorLock = () => update(s => {
    if (!s.predictor) s.predictor = { picks:{}, answers:{}, locked:false };
    s.predictor.locked = !s.predictor.locked;
  });

  const addPlayer = () => {
    const name = newPlayerName.trim();
    if (!name||state.players.includes(name)) return;
    update(s=>{ s.players.push(name); });
    setNewPlayerName(""); showToast(`${name} added`);
  };
  const removePlayer = (name) => update(s=>{
    s.players=s.players.filter(p=>p!==name);
    s.games.forEach(g=>g.rounds.forEach(r=>{ delete r.picks[name]; delete r.outcomes[name]; }));
    if (s.predictor?.picks) delete s.predictor.picks[name];
  });

  if (loading) return (
    <div style={S.loadScreen}><div style={S.spinner}/>
      <p style={{color:"#e61d25",marginTop:16,fontFamily:"'Inter',sans-serif",letterSpacing:4}}>LOADING…</p>
    </div>
  );

  const game = state.games[activeGameIdx]||state.games[state.games.length-1];
  const gi = state.games.indexOf(game);
  const elimMap = buildElimMap(game, state.players);
  const entrants = gameEntrants(game, state.players);
  // For the alive counter, only count players who have actually picked in round 1
  const r0picks = game.rounds[0] ? state.players.filter(p => !!game.rounds[0].picks[p]) : [];
  const actualEntrants = roundResolved(game.rounds[0]) ? entrants : r0picks;
  const aliveNow = actualEntrants.filter(p=>elimMap[p]==null);
  const pot = calcPot(game, state.players);
  const syncLabel = syncing?"saving…":lastSync?`synced ${Math.round((Date.now()-lastSync)/1000)}s ago`:"";
  const pred = state.predictor || { picks:{}, answers:{}, locked:false };
  const predEntrantCount = state.players.filter(p => pred.picks[p] && Object.keys(pred.picks[p]).some(id => id !== "tiebreak" && pred.picks[p][id] !== "" && pred.picks[p][id] !== null && pred.picks[p][id] !== undefined)).length;
  const predPotTotal = predEntrantCount * PREDICTOR_FEE;

  // Show played rounds (collapsed by default) on complete games; all rounds while in progress
  const lastResolvedIdx = game.rounds.reduce((acc,r,i)=>roundResolved(r)?i:acc, -1);
  const trackerRounds = game.complete
    ? game.rounds.slice(0, lastResolvedIdx + 1)
    : game.rounds;

  return (
    <div style={S.root}>
      <header style={S.header}>
        <div style={S.headerTop}>
          <div style={{flex:1,minWidth:0}}>
            <div style={S.kicker}>FIFA WORLD CUP 2026</div>
            <h1 style={S.title}>LAST MAN<br/>STANDING</h1>
          </div>
          <div style={S.aliveCount}>
            <span style={S.aliveNum}>{game.complete?"✓":aliveNow.length}</span>
            <span style={S.aliveLabel}>{game.complete?"DONE":"ALIVE"}</span>
          </div>
        </div>
        <div style={S.statStrip}>
          <div style={S.statItem}>
            <span style={S.statLabel}>Players</span>
            <span style={S.statValue}>{state.players.length}</span>
          </div>
          <div style={S.statDivider}/>
          <div style={S.statItem}>
            <span style={S.statLabel}>LMS Pot</span>
            <span style={{...S.statValue,color:"#a8e031"}}>£{pot}</span>
          </div>
          <div style={S.statDivider}/>
          <div style={S.statItem}>
            <span style={S.statLabel}>Predict Pot</span>
            <span style={{...S.statValue,color:"#a8e031"}}>£{predPotTotal}</span>
          </div>
          <div style={S.statDivider}/>
          <div style={S.statItem}>
            <span style={S.statLabel}>Status</span>
            <span style={{...S.statValue,fontSize:13,color:syncing?"#f5a623":"#a8e031"}}>● {syncing?"SAVING":"LIVE"}</span>
          </div>
        </div>
        {state.games.length>1&&(
          <div style={S.gameTabs}>
            {state.games.map((g,i)=>(
              <button key={g.id} onClick={()=>setActiveGameIdx(i)}
                style={{...S.gameTab,...(i===activeGameIdx?S.gameTabActive:{})}}>
                {g.label}{g.complete?" ✓":""}
              </button>
            ))}
          </div>
        )}
        <nav style={S.nav}>
          {["tracker","fixtures","predictor","money","rules","settings"].map(t=>(
            <button key={t} onClick={()=>setTab(t)}
              style={{...S.navBtn,...(tab===t?S.navBtnActive:{})}}>
              {t==="money"?"MONEY":t==="predictor"?"PREDICT":t.toUpperCase()}
            </button>
          ))}
        </nav>
      </header>

      <main style={S.main}>
        {game.complete&&game.winners.length>0&&(
          <div style={S.winnerBanner}>
            <div style={{fontSize:36}}>🏆</div>
            <div>
              <div style={{fontSize:9,letterSpacing:4,color:"rgba(255,255,255,0.9)",textTransform:"uppercase",fontWeight:700,fontFamily:"'DM Sans',sans-serif"}}>GAME OVER</div>
              <div style={{fontSize:32,fontWeight:400,color:"#fff",fontFamily:"'Bebas Neue',sans-serif",letterSpacing:3}}>{game.winners.join(" & ")} WIN!</div>
              <div style={{fontSize:11,color:"rgba(255,255,255,0.8)",marginTop:4}}>
                Prize: £{Math.floor(pot/game.winners.length)} each · Next game starts from the next round
              </div>
            </div>
          </div>
        )}
        {game.rolledOver&&(
          <div style={S.rolloverBanner}>🔁 Everyone out — £{pot} rolls over to {state.games[gi+1]?.label||"next game"}</div>
        )}
        {game.rollover>0&&!game.rolledOver&&(
          <div style={S.rolloverBanner}>🔁 Rollover included: +£{game.rollover} carried into this game's pot</div>
        )}

        {/* Final showdown banners */}
        {!game.complete&&aliveNow.length===1&&(
          <div style={{background:"#E61D25",padding:"12px 18px",marginBottom:12,display:"flex",alignItems:"center",gap:12}}>
            <span style={{fontSize:26,fontFamily:"'Bebas Neue',sans-serif",letterSpacing:3,color:"#fff"}}>⚡ LAST MAN STANDING</span>
            <span style={{fontSize:12,color:"rgba(255,255,255,0.9)",fontWeight:700}}>{aliveNow[0]}</span>
          </div>
        )}
        {!game.complete&&aliveNow.length>1&&aliveNow.length<=3&&(
          <div style={{background:"#E61D25",padding:"10px 18px",marginBottom:12,display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:22,fontFamily:"'Bebas Neue',sans-serif",letterSpacing:3,color:"#fff"}}>🔥 FINAL SHOWDOWN — {aliveNow.length} REMAINING</span>
          </div>
        )}

        {tab==="tracker"&&(
          <TrackerTab rounds={trackerRounds} game={game} gi={gi} state={state}
            elimMap={elimMap} entrants={entrants} setPick={setPick} setOutcome={setOutcome}
            closeRound={closeRound} reopenRound={reopenRound} setTiebreaker={setTiebreaker}
            editingRound={editingRound} setEditingRound={setEditingRound} update={update}/>
        )}
        {tab==="fixtures"&&<FixturesTab game={game}/>}
        {tab==="money"&&<MoneyTab state={state}/>}
        {tab==="predictor"&&(
          <PredictorTab
            state={state}
            setPredictorPick={setPredictorPick}
            setPredictorAnswer={setPredictorAnswer}
            setPredictorOverride={setPredictorOverride}
            togglePredictorLock={togglePredictorLock}
          />
        )}
        {tab==="rules"&&<RulesTab/>}
        {tab==="settings"&&(
          <SettingsTab state={state} update={update} newPlayerName={newPlayerName}
            setNewPlayerName={setNewPlayerName} addPlayer={addPlayer} removePlayer={removePlayer}/>
        )}
      </main>
      {toast&&<div style={S.toast}>{toast}</div>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TRACKER
// ═══════════════════════════════════════════════════════════════════════════════
function TrackerTab({ rounds, game, gi, state, elimMap, entrants, setPick, setOutcome, closeRound, reopenRound, setTiebreaker, editingRound, setEditingRound, update }) {
  return (
    <div>
      {rounds.map((round, idx) => {
        const wcRound = ROUNDS.find(r=>r.id===round.id);
        const realRoundIdx = game.rounds.indexOf(round);
        const aliveAtStart = getAliveAtStart(game, state.players, realRoundIdx);
        const isFirstRound = realRoundIdx === 0;
        return (
          <RoundCard key={round.id} round={round} wcRound={wcRound} game={game} gi={gi}
            state={state} aliveAtStart={aliveAtStart} elimMap={elimMap} entrants={entrants}
            setPick={setPick} setOutcome={setOutcome} closeRound={closeRound} reopenRound={reopenRound} setTiebreaker={setTiebreaker} isFirstRound={isFirstRound}
            isEditing={editingRound===`${gi}-${round.id}`}
            setEditing={v=>setEditingRound(v?`${gi}-${round.id}`:null)}
            update={update} roundIndex={realRoundIdx}/>
        );
      })}
    </div>
  );
}

function ReopenRoundPanel({ onReopen }) {
  const [confirming, setConfirming] = useState(false);
  return (
    <div style={{padding:"8px 12px",background:"#0d1117",borderBottom:"1px solid #1f2937",display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,flexWrap:"wrap"}}>
      <span style={{fontSize:11,color:"#9ca3af"}}>Clear all outcomes and reopen this round for editing</span>
      {confirming ? (
        <div style={{display:"flex",gap:6}}>
          <button
            onClick={e=>{e.stopPropagation(); onReopen(); setConfirming(false);}}
            style={{background:"rgba(245,158,11,0.2)",border:"1px solid #f59e0b",color:"#a8e031",borderRadius:4,padding:"4px 10px",cursor:"pointer",fontSize:10,fontFamily:"'Oswald',sans-serif",fontWeight:700}}>
            ✓ CONFIRM
          </button>
          <button
            onClick={e=>{e.stopPropagation(); setConfirming(false);}}
            style={{background:"transparent",border:"1px solid #374151",color:"#9ca3af",borderRadius:4,padding:"4px 10px",cursor:"pointer",fontSize:10,fontFamily:"'Oswald',sans-serif"}}>
            CANCEL
          </button>
        </div>
      ) : (
        <button
          onClick={e=>{e.stopPropagation(); setConfirming(true);}}
          style={{background:"rgba(245,158,11,0.1)",border:"1px solid rgba(245,158,11,0.4)",color:"#a8e031",borderRadius:4,padding:"4px 10px",cursor:"pointer",fontSize:10,letterSpacing:1,fontFamily:"'Oswald',sans-serif",fontWeight:700}}>
          ↩ REOPEN ROUND
        </button>
      )}
    </div>
  );
}

function CloseRoundPanel({ unpickedAlive, onClose }) {
  const [confirming, setConfirming] = useState(false);
  return (
    <div style={{padding:"8px 12px",background:"#0d1117",borderBottom:"1px solid #1f2937",display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,flexWrap:"wrap"}}>
      <span style={{fontSize:11,color:"#9ca3af"}}>
        {unpickedAlive.length} player(s) with no pick/result will be eliminated
      </span>
      {confirming ? (
        <div style={{display:"flex",gap:6}}>
          <button
            onClick={e=>{e.stopPropagation(); onClose(); setConfirming(false);}}
            style={{...S.closeRoundBtn,background:"rgba(229,57,53,0.25)",borderColor:"#e53935"}}>
            ✓ CONFIRM
          </button>
          <button
            onClick={e=>{e.stopPropagation(); setConfirming(false);}}
            style={{background:"transparent",border:"1px solid #374151",color:"#9ca3af",borderRadius:4,padding:"4px 10px",cursor:"pointer",fontSize:10,fontFamily:"'Oswald',sans-serif"}}>
            CANCEL
          </button>
        </div>
      ) : (
        <button
          onClick={e=>{e.stopPropagation(); setConfirming(true);}}
          style={S.closeRoundBtn}>
          ⛔ CLOSE ROUND
        </button>
      )}
    </div>
  );
}

function RoundCard({ round, wcRound, game, gi, state, aliveAtStart, elimMap, entrants, setPick, setOutcome, closeRound, reopenRound, setTiebreaker, isFirstRound, isEditing, setEditing, update, roundIndex }) {
  const resolved = roundResolved(round);
  const survivors = aliveAtStart.filter(p=>round.outcomes[p]===OUTCOME.WIN);
  const ousted = aliveAtStart.filter(p=>
    round.outcomes[p]===OUTCOME.LOSE||round.outcomes[p]===OUTCOME.DRAW||(resolved&&!round.picks[p]&&roundIndex>0)
  );
  const [expanded, setExpanded] = useState(!resolved && !game.complete);
  useEffect(()=>{ if (!resolved && !game.complete) setExpanded(true); },[resolved, game.complete]);

  // Players alive at start of this round without a final outcome (WIN/LOSE/DRAW)
  const unpickedAlive = aliveAtStart.filter(p => {
    const o = round.outcomes[p];
    return o !== OUTCOME.WIN && o !== OUTCOME.LOSE && o !== OUTCOME.DRAW;
  });
  const canClose = !resolved && unpickedAlive.length > 0;

  const deadlinePassed = wcRound ? isRoundLocked(wcRound) : false;

  return (
    <div style={{...S.roundCard,...(resolved?S.roundCardResolved:{})}}>
      <div style={S.roundHeader} onClick={()=>setExpanded(e=>!e)}>
        <div style={{flex:1,minWidth:0}}>
          <span style={S.roundStage}>{round.stage}</span>
          <h2 style={S.roundLabel}>{round.label}</h2>
          {wcRound&&(()=>{ const lt=getRoundLockTime(wcRound); return <span style={S.roundDeadline}>🔒 Locks at first KO: {wcRound.fixtures[0]?.[2]} {wcRound.fixtures[0]?.[3]}</span>; })()}
        </div>
        <div style={{display:"flex",gap:5,alignItems:"center",flexShrink:0}}>
          {resolved
            ?<span style={S.resolvedBadge}>✓ {survivors.length} survive</span>
            :deadlinePassed
              ?<span style={{background:"#E61D25",color:"#fff",borderRadius:2,padding:"3px 8px",fontSize:8,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase"}}>⏰ LOCKED</span>
              :<span style={S.expandChevron}>{expanded?"▲":"▼"}</span>}
        </div>
      </div>

      {expanded&&(
        <>
          {wcRound&&<div style={S.roundNote}>{wcRound.note}</div>}
          <div style={{padding:"4px 12px",borderBottom:"1px solid #1f2937",display:"flex",justifyContent:"flex-end",alignItems:"center",gap:8}}>
            <button onClick={e=>{e.stopPropagation();setEditing(!isEditing);}} style={S.editBtn}>
              {isEditing?"DONE":"EDIT"}
            </button>
          </div>

          {isEditing && canClose && (
            <CloseRoundPanel
              unpickedAlive={unpickedAlive}
              onClose={() => closeRound(gi, round.id)}
            />
          )}
          {isEditing && resolved && (
            <ReopenRoundPanel onReopen={() => reopenRound(gi, round.id)}/>
          )}

          <div style={S.picksGrid}>
            {state.players.map(player=>{
              const entered = entrants.includes(player);
              const satOut = !entered && resolved; // sat out round 1
              const isAlive = aliveAtStart.includes(player);
              const pick = round.picks[player];
              const outcome = round.outcomes[player];
              const used = usedTeams(game, player, roundIndex);
              // Group stage: only show teams playing that round. Knockouts: show all nations.
              const isKnockout = wcRound && wcRound.id >= 4;
              const availTeams = wcRound
                ? (isKnockout ? ALL_NATIONS : realTeams(wcRound))
                : ALL_NATIONS;

              let cellStyle = {...S.pickCell};
              if (satOut) cellStyle={...cellStyle,...S.pickCellSatOut};
              else if (!isAlive) cellStyle={...cellStyle,...S.pickCellGhost};
              else if (outcome===OUTCOME.WIN) cellStyle={...cellStyle,...S.pickCellWin};
              else if (outcome===OUTCOME.LOSE||outcome===OUTCOME.DRAW) cellStyle={...cellStyle,...S.pickCellElim};

              return (
                <div key={player} style={cellStyle}>
                  <div style={S.pickPlayer}>
                    <span style={S.pickPlayerName}>{player}</span>
                    {satOut&&<span style={{...S.elimBadge,background:"#1e3a2f",color:"#6ee7b7"}}>SAT OUT</span>}
                    {!satOut&&!isAlive&&elimMap[player]&&elimMap[player]>0&&
                      <span style={S.elimBadge}>OUT R{elimMap[player]}</span>}
                  </div>

                  {satOut?(
                    <div style={S.pickDisplay}><span style={{color:"#3d6b56",fontStyle:"italic"}}>sat out</span></div>
                  ):isAlive?(
                    <>
                      {!resolved&&!deadlinePassed?(
                        <select style={S.pickSelect} value={pick||""}
                          onChange={e=>setPick(gi,round.id,player,e.target.value)}>
                          <option value="">{isFirstRound?"— select team to enter —":"— select team —"}</option>
                          {availTeams.map(t=>{
                            const wasUsed=used.has(t);
                            return <option key={t} value={t} disabled={wasUsed}>{FLAG[t]||"🏳️"} {t}{wasUsed?" ✗":""}</option>;
                          })}
                        </select>
                      ):(
                        <div style={{...S.pickDisplay, ...(deadlinePassed&&!resolved?{opacity:0.7}:{})}}>
                          {pick?(
                            <span>
                              {FLAG[pick]||"🏳️"} <strong>{pick}</strong>
                              {deadlinePassed&&!resolved&&<span style={{marginLeft:6,fontSize:8,color:"#E61D25",letterSpacing:1,fontWeight:700,textTransform:"uppercase"}}>🔒 LOCKED</span>}
                            </span>
                          ):deadlinePassed&&!resolved?(
                            <span style={{color:"#E61D25",fontSize:10,fontWeight:700,letterSpacing:1}}>⏰ NO PICK — DEADLINE PASSED</span>
                          ):(
                            <span style={{color:"#555",fontStyle:"italic"}}>No pick</span>
                          )}
                        </div>
                      )}
                      {pick&&isEditing&&(
                        <div style={S.outcomeRow}>
                          {[{val:OUTCOME.WIN,label:"W",color:"#a8e031"},{val:OUTCOME.DRAW,label:"D",color:"#a8e031"},{val:OUTCOME.LOSE,label:"L",color:"#e53935"}].map(({val,label,color})=>(
                            <button key={val}
                              onClick={()=>setOutcome(gi,round.id,player,outcome===val?OUTCOME.PENDING:val)}
                              style={{...S.outcomeBtn,...(outcome===val?{background:color,color:"#0a0a0f",borderColor:color}:{color})}}>
                              {label}
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  ):(
                    <div style={S.pickDisplay}>
                      {pick?<>{FLAG[pick]||"🏳️"} <strong>{pick}</strong></>:<span style={{color:"#333",fontStyle:"italic"}}>no pick</span>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {resolved&&(
            <div style={S.resultBar}>
              ✓ {survivors.length} survive{survivors.length>0?` · ${survivors.join(", ")}`:""} · ✗ {ousted.length} out
            </div>
          )}

          {wcRound?.hasTiebreaker&&(
            <div style={{padding:"12px 16px",background:"#0b0c10",borderTop:"1px solid #1e1f26"}}>
              <div style={{fontSize:9,letterSpacing:3,color:"#E61D25",textTransform:"uppercase",fontWeight:700,marginBottom:8,fontFamily:"'DM Sans',sans-serif"}}>
                ⚡ TIEBREAKER — Minute of first goal in the Final
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(155px,1fr))",gap:1,background:"#1e1f26"}}>
                {state.players.map(player => {
                  const tbVal = (round.tiebreaker||{})[player] || "";
                  const isAlivePlayer = aliveAtStart.includes(player);
                  if (!isAlivePlayer) return null;
                  return (
                    <div key={player} style={{background:"#13141a",padding:"10px 12px"}}>
                      <div style={{fontSize:11,fontWeight:700,color:"#fff",letterSpacing:0.5,textTransform:"uppercase",marginBottom:5}}>{player}</div>
                      {resolved ? (
                        <div style={{fontSize:12,color:"#888"}}>{tbVal ? `Minute ${tbVal}` : <span style={{color:"#333"}}>no guess</span>}</div>
                      ) : (
                        <div style={{display:"flex",alignItems:"center",gap:6}}>
                          <input
                            type="number" min="1" max="120"
                            style={{...S.editInput,width:64,padding:"4px 8px",fontSize:12,flex:"none"}}
                            placeholder="min"
                            value={tbVal}
                            onChange={e=>setTiebreaker(gi,round.id,player,e.target.value)}
                          />
                          <span style={{fontSize:10,color:"#444"}}>min</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              {/* Admin: set correct minute */}
              {isEditing&&(
                <div style={{display:"flex",alignItems:"center",gap:8,marginTop:10}}>
                  <span style={{fontSize:9,letterSpacing:2,color:"#444",textTransform:"uppercase",fontWeight:700,fontFamily:"'DM Sans',sans-serif"}}>Correct minute:</span>
                  <input type="number" min="1" max="120"
                    style={{...S.editInput,width:72,padding:"4px 8px",fontSize:12,flex:"none"}}
                    placeholder="e.g. 23"
                    value={(round.tiebreaker||{})["__answer__"]||""}
                    onChange={e=>setTiebreaker(gi,round.id,"__answer__",e.target.value)}
                  />
                </div>
              )}
              {(()=>{
                if (survivors.length<=1) return null;
                const adminMin = parseFloat((round.tiebreaker||{})["__answer__"]||"");
                if (isNaN(adminMin)||!adminMin) return null;
                const tbEntries = Object.entries(round.tiebreaker||{}).filter(([p,v])=>v&&p!=="__answer__"&&aliveAtStart.includes(p));
                let best = Infinity;
                tbEntries.forEach(([,v])=>{ const d=Math.abs(parseFloat(v)-adminMin); if(d<best) best=d; });
                const tbWinner = tbEntries.filter(([,v])=>Math.abs(parseFloat(v)-adminMin)===best).map(([p])=>p);
                return <div style={{marginTop:8,fontSize:11,color:"#a8e031",fontWeight:700}}>⚡ Tiebreaker: {tbWinner.join(" & ")} (closest to min {adminMin})</div>;
              })()}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// FIXTURES TAB
// ═══════════════════════════════════════════════════════════════════════════════
function FixturesTab({ game }) {
  const [openRound, setOpenRound] = useState(game.rounds[0]?.id||1);
  return (
    <div>
      <h2 style={S.sectionTitle}>FIXTURES BY ROUND</h2>
      <p style={{fontSize:11,color:"#6b7280",marginBottom:10,fontFamily:"sans-serif"}}>All times BST. Use these to decide which team to pick.</p>
      {game.rounds.map(round=>{
        const wcRound=ROUNDS.find(r=>r.id===round.id);
        if (!wcRound) return null;
        const isOpen=openRound===round.id;
        return (
          <div key={round.id} style={S.fixtureSection}>
            <div style={S.fixtureSectionHeader} onClick={()=>setOpenRound(isOpen?null:round.id)}>
              <div>
                <span style={S.roundStage}>{wcRound.stage}</span>
                <span style={S.fixtureSectionTitle}>{wcRound.label}</span>
              </div>
              <div style={{display:"flex",gap:6,alignItems:"center",flexShrink:0}}>
                <span style={S.deadlineBadge}>⏰ {wcRound.deadline}</span>
                <span style={S.expandChevron}>{isOpen?"▲":"▼"}</span>
              </div>
            </div>
            {isOpen&&(
              <div>
                <div style={S.fixtureNote}>{wcRound.note}</div>
                {wcRound.fixtures.map(([home,away,date,time],i)=>(
                  <div key={i} style={S.fixtureRow}>
                    <span style={S.fixtureDate}>{date} {time}</span>
                    <span style={S.fixtureTeam}>{FLAG[home]||"🏳️"} {home}</span>
                    <span style={S.fixtureVs}>v</span>
                    <span style={S.fixtureTeam}>{FLAG[away]||"🏳️"} {away}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MONEY TRACKER TAB
// ═══════════════════════════════════════════════════════════════════════════════
function MoneyTab({ state }) {
  const tracker = computeMoneyTracker(state);

  // Sort by net (highest first)
  const sorted = [...state.players].sort((a,b)=>tracker[b].net - tracker[a].net);

  return (
    <div>
      <h2 style={S.sectionTitle}>MONEY TRACKER</h2>
      <p style={{fontSize:11,color:"#6b7280",marginBottom:12,fontFamily:"sans-serif"}}>
        £{ENTRY_FEE} per game entered. Only players who pick in round 1 of each game pay in.
      </p>

      {sorted.map((player,rank)=>{
        const t = tracker[player];
        const net = t.net;
        const isUp = net > 0;
        const isEven = net === 0;
        return (
          <div key={player} style={{...S.moneyRow,...(isUp?S.moneyRowUp:isEven?S.moneyRowEven:S.moneyRowDown)}}>
            <span style={S.moneyRank}>{rank+1}</span>
            <div style={{flex:1}}>
              <div style={S.moneyName}>{player}</div>
              <div style={S.moneyBreakdown}>
                {t.games.filter(g=>g.entered).map(g=>(
                  <span key={g.gameId} style={{marginRight:8,fontSize:10,color:"#555"}}>
                    {g.gameLabel}: {g.winnings>0?`-£${g.cost} +£${g.winnings}`:`-£${g.cost}`}
                  </span>
                ))}
                {t.predictorEntered&&(
                  <span style={{fontSize:10,color:"#555"}}>Predictor: -£{PREDICTOR_FEE}{t.predictorWinnings>0?` +£${t.predictorWinnings}`:""}</span>
                )}
                {!t.games.some(g=>g.entered)&&!t.predictorEntered&&(
                  <span style={{fontSize:10,color:"#333"}}>no entries yet</span>
                )}
              </div>
            </div>
            <div style={{...S.moneyNet,...(isUp?{color:"#a8e031"}:isEven?{color:"#9ca3af"}:{color:"#e53935"})}}>
              {isUp?"+":""}{net < 0 ? `-£${Math.abs(net)}` : `£${net}`}
            </div>
          </div>
        );
      })}

      {/* Running totals per game */}
      <h2 style={{...S.sectionTitle,marginTop:20}}>BY GAME</h2>
      {state.games.map(game=>{
        // Use actual picks in round 0 — not gameEntrants which returns all before round closes
        const r0 = game.rounds[0];
        const actualEntrants = state.players.filter(p => r0 && !!r0.picks[p]);
        const pot = calcPot(game, state.players);
        return (
          <div key={game.id} style={S.moneyGameBlock}>
            <div style={S.moneyGameHeader}>
              <span style={{fontWeight:700,color:"#fff",fontSize:13}}>{game.label}</span>
              <span style={{fontSize:11,color:"#888"}}>
                {actualEntrants.length} entered · Pot: <strong style={{color:"#a8e031"}}>£{pot}</strong>
                {game.rollover>0&&<span style={{color:"#a8e031"}}> (incl. £{game.rollover} rollover)</span>}
              </span>
              <span style={{fontSize:11,color:game.complete?(game.winners.length>0?"#4caf50":"#f59e0b"):"#6b7280"}}>
                {game.complete?(game.winners.length>0?`🏆 ${game.winners.join(", ")} won £${Math.floor(pot/game.winners.length)}`:"🔁 Rollover"):"In progress"}
              </span>
            </div>
            <div style={{display:"flex",flexWrap:"wrap",gap:4,padding:"8px 12px"}}>
              {state.players.map(p=>{
                const entered = actualEntrants.includes(p);
                const won = game.complete && game.winners.includes(p);
                return (
                  <span key={p} style={{
                    fontSize:10,padding:"3px 8px",borderRadius:12,
                    background: won?"#0a150a":entered?"rgba(76,175,80,0.1)":"rgba(100,100,100,0.1)",
                    border: won?"1px solid #a8e031":entered?"1px solid rgba(76,175,80,0.2)":"1px solid #222",
                    color: won?"#a8e031":entered?"#9ca3af":"#444",
                  }}>
                    {p}{won?" 🏆":entered?" -£2":" –"}
                  </span>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PREDICTOR TAB
// ═══════════════════════════════════════════════════════════════════════════════
function PredictorTab({ state, setPredictorPick, setPredictorAnswer, setPredictorOverride, togglePredictorLock }) {
  const pred = state.predictor || { picks:{}, answers:{}, locked:false };
  const [adminMode, setAdminMode] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  // Group questions by category
  const cats = ["15pts","Groups","5pts","Tiebreaker"];
  const catLabels = {
    "15pts":"⭐ 15 Points Each",
    "Groups":"🏟️ Group Winners — 5 Points Each",
    "5pts":"5 Points Each",
    "Tiebreaker":"🎯 Tiebreaker"
  };

  // Score computation — semi-finalists are unordered
  const sfAnswers = [pred.answers["semi1"], pred.answers["semi2"], pred.answers["semi3"], pred.answers["semi4"]].filter(Boolean).map(s=>s.toLowerCase().trim());
  const scores = {};
  for (const p of state.players) {
    scores[p] = 0;
    const picks = pred.picks[p] || {};
    for (const q of PREDICTOR_QUESTIONS) {
      if (q.id === "semi1" || q.id === "semi2" || q.id === "semi3" || q.id === "semi4") {
        const pick = (picks[q.id]||"").toLowerCase().trim();
        if (pick && sfAnswers.includes(pick)) scores[p] += q.pts;
        continue;
      }
      // For freetext questions, check manual override first
      if (q.type === "freetext") {
        const overrideVal = (pred.overrides||{})[q.id]?.[p];
        if (overrideVal === true) { scores[p] += q.pts; continue; }
        if (overrideVal === false) continue; // explicitly marked wrong
        // Fall through to text match if no override set
      }
      const ans = pred.answers[q.id];
      if (ans && picks[q.id]) {
        const normalise = v => v.includes("-") ? v.split("-").map(Number).sort((a,b)=>a-b).join("-") : v.toLowerCase().trim();
        if (normalise(ans) === normalise(picks[q.id])) scores[p] += q.pts;
      }
    }
  }
  const maxPts = PREDICTOR_QUESTIONS.reduce((s,q)=>s+q.pts,0);
  const predEntrants = state.players.filter(p => pred.picks[p] && Object.keys(pred.picks[p]).some(id => id !== "tiebreak" && pred.picks[p][id] !== "" && pred.picks[p][id] !== null && pred.picks[p][id] !== undefined));
  const pot = predEntrants.length * PREDICTOR_FEE;

  return (
    <div>
      {/* Header */}
      <div style={S.predHeader}>
        <div>
          <h2 style={{...S.sectionTitle,marginBottom:4}}>TOURNAMENT PREDICTOR</h2>
          <p style={{fontSize:11,color:"#9ca3af",fontFamily:"sans-serif",margin:0}}>
            £{PREDICTOR_FEE} entry · {predEntrants.length} entered · Pot: <strong style={{color:"#a8e031"}}>£{pot}</strong>
          </p>
        </div>
        <div style={{display:"flex",gap:6,flexShrink:0}}>
          <button onClick={()=>setAdminMode(a=>!a)}
            style={{...S.editBtn, background: adminMode?"#E61D25":"transparent", color: adminMode?"#fff":"#9ca3af"}}>
            {adminMode ? "✓ ADMIN" : "ADMIN"}
          </button>
          {adminMode&&(
            <button onClick={togglePredictorLock}
              style={{...S.editBtn, color: pred.locked?"#a8e031":"#3a3a3a"}}>
              {pred.locked ? "🔒 LOCKED" : "🔓 OPEN"}
            </button>
          )}
        </div>
      </div>

      {/* Player selector */}
      {!adminMode&&(
        <div style={{padding:"8px 0 12px"}}>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {state.players.map(p=>(
              <button key={p} onClick={()=>setSelectedPlayer(p)}
                style={{
                  padding:"5px 12px",borderRadius:20,border:"1px solid",cursor:"pointer",fontSize:12,
                  fontFamily:"'Oswald',sans-serif",letterSpacing:1,
                  background: selectedPlayer===p?"#E61D25":"transparent",
                  color: selectedPlayer===p?"#0a0a0f":"#9ca3af",
                  borderColor: selectedPlayer===p?"#E61D25":"#1c1c1c",
                }}>
                {p}
              </button>
            ))}
          </div>
          {pred.locked&&<p style={{fontSize:11,color:"#e53935",marginTop:6,fontFamily:"sans-serif"}}>🔒 Predictor is locked — no more picks accepted.</p>}
        </div>
      )}

      {/* No player selected prompt */}
      {!adminMode&&!selectedPlayer&&(
        <div style={{padding:"20px 0",textAlign:"center",color:"#444",fontSize:12,letterSpacing:1}}>
          ↑ SELECT YOUR NAME ABOVE TO MAKE YOUR PICKS
        </div>
      )}

      {/* Questions */}
      {(adminMode||selectedPlayer)&&cats.map(cat=>(
        <div key={cat} style={{marginBottom:16}}>
          <div style={S.predCatHeader}>{catLabels[cat]}</div>
          {PREDICTOR_QUESTIONS.filter(q=>q.cat===cat).map(q=>{
            const playerPick = selectedPlayer ? ((pred.picks[selectedPlayer]||{})[q.id] || "") : "";
            const correctAnswer = pred.answers[q.id] || "";
            const overrideVal = selectedPlayer ? (pred.overrides||{})[q.id]?.[selectedPlayer] : undefined;
            const isCorrect = q.id === "semi1" || q.id === "semi2" || q.id === "semi3" || q.id === "semi4"
              ? sfAnswers.length > 0 && playerPick && sfAnswers.includes(playerPick.toLowerCase().trim())
              : q.type === "freetext" && overrideVal !== undefined
                ? overrideVal === true
                : (()=>{ if (!correctAnswer||!playerPick) return false; const n=v=>v.includes("-")?v.split("-").map(Number).sort((a,b)=>a-b).join("-"):v.toLowerCase().trim(); return n(correctAnswer)===n(playerPick); })();
            const hasAnswer = !!correctAnswer || (q.type==="freetext" && overrideVal !== undefined);

            return (
              <div key={q.id} style={{
                ...S.predRow,
                ...(isCorrect?{borderLeft:"3px solid #4caf50",background:"#071a0e"}:
                  hasAnswer&&playerPick&&!isCorrect?{borderLeft:"3px solid #e53935",background:"#1a0808"}:{}),
              }}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                    {q.pts>0&&<span style={S.predPtsBadge}>{q.pts}pts</span>}
                    <span style={{fontSize:12,color:"#e5e7eb",fontWeight:600}}>{q.label}</span>
                    {isCorrect&&<span style={{color:"#a8e031",fontSize:12}}>✓</span>}
                    {hasAnswer&&playerPick&&!isCorrect&&<span style={{color:"#e53935",fontSize:12}}>✗</span>}
                  </div>

                  {/* Player pick input — shown when unlocked and not in admin mode */}
                  {!adminMode&&!pred.locked&&(
                    <PredictorInput q={q} value={playerPick}
                      onChange={v=>setPredictorPick(selectedPlayer, q.id, v)}/>
                  )}
                  {/* Show pick when locked */}
                  {!adminMode&&pred.locked&&playerPick&&(
                    <div style={{fontSize:11,color:"#9ca3af"}}>
                      Your pick: <strong style={{color:"#fff"}}>{playerPick}</strong>
                    </div>
                  )}
                  {/* Admin: show all players' picks + set correct answer */}
                  {adminMode&&(
                    <div style={{marginTop:4}}>
                      {q.type==="freetext" ? (
                        // Freetext: show each player's answer with tick/cross override
                        <div style={{display:"flex",flexDirection:"column",gap:4,marginBottom:6}}>
                          {state.players.map(p=>{
                            const pp = (pred.picks[p]||{})[q.id];
                            if (!pp) return null;
                            const ov = (pred.overrides||{})[q.id]?.[p];
                            return (
                              <div key={p} style={{display:"flex",alignItems:"center",gap:8,background:"#1a1b22",borderRadius:3,padding:"5px 10px"}}>
                                <span style={{fontSize:11,color:"#E61D25",fontWeight:700,minWidth:60}}>{p}</span>
                                <span style={{fontSize:11,color:"#ccc",flex:1}}>{pp}</span>
                                <button onClick={()=>setPredictorOverride(q.id,p,ov===true?null:true)}
                                  style={{background:ov===true?"#a8e031":"transparent",border:"1px solid",borderColor:ov===true?"#a8e031":"#333",color:ov===true?"#080808":"#444",borderRadius:2,padding:"2px 8px",cursor:"pointer",fontSize:11,fontWeight:700}}>✓</button>
                                <button onClick={()=>setPredictorOverride(q.id,p,ov===false?null:false)}
                                  style={{background:ov===false?"#E61D25":"transparent",border:"1px solid",borderColor:ov===false?"#E61D25":"#333",color:ov===false?"#fff":"#444",borderRadius:2,padding:"2px 8px",cursor:"pointer",fontSize:11,fontWeight:700}}>✗</button>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        // Non-freetext: show picks summary
                        <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:6}}>
                          {state.players.map(p=>{
                            const pp = (pred.picks[p]||{})[q.id];
                            if (!pp) return null;
                            return <span key={p} style={{fontSize:10,color:"#9ca3af",background:"#1a1b22",borderRadius:4,padding:"1px 6px"}}><strong style={{color:"#E61D25"}}>{p}:</strong> {pp}</span>;
                          })}
                        </div>
                      )}
                      <PredictorInput q={q} value={correctAnswer}
                        onChange={v=>setPredictorAnswer(q.id, v)}
                        placeholder="Set correct answer…"/>
                    </div>
                  )}
                  {hasAnswer&&<div style={{fontSize:10,color:"#6b7280",marginTop:2}}>✓ Answer: <strong style={{color:"#a8e031",fontWeight:600}}>{correctAnswer}</strong></div>}
                </div>
              </div>
            );
          })}
        </div>
      ))}

      {/* Leaderboard */}
      <div style={S.predCatHeader}>LEADERBOARD</div>
      {[...state.players]
        .filter(p=>predEntrants.includes(p))
        .sort((a,b)=>scores[b]-scores[a])
        .map((p,i)=>(
        <div key={p} style={{...S.lbRow,...S.lbRowAlive,marginBottom:4}}>
          <span style={S.lbRank}>{i+1}</span>
          <span style={S.lbName}>{p}</span>
          <span style={{fontSize:11,color:"#6b7280"}}>{scores[p]}/{maxPts} pts</span>
          <div style={{marginLeft:"auto",background:"#E61D25",borderRadius:2,padding:"3px 10px",fontSize:11,color:"#fff",fontWeight:400,letterSpacing:1,fontFamily:"'Bebas Neue',sans-serif",fontWeight:700}}>
            {scores[p]}
          </div>
        </div>
      ))}
      {predEntrants.length===0&&(
        <p style={{fontSize:12,color:"#6b7280",fontStyle:"italic",fontFamily:"sans-serif"}}>No entries yet — pick your player above and start predicting!</p>
      )}
    </div>
  );
}

function PredictorInput({ q, value, onChange, placeholder }) {
  if (q.type === "nation") return (
    <select style={{...S.pickSelect,fontSize:11,marginBottom:0}}
      value={value} onChange={e=>onChange(e.target.value)}>
      <option value="">{placeholder||"— select a nation —"}</option>
      {ALL_NATIONS.map(t=><option key={t} value={t}>{FLAG[t]||"🏳️"} {t}</option>)}
    </select>
  );
  if (q.type === "score") {
    // Parse "H-A" — default both sides to "0" once user starts selecting
    const parts = (value||"").split("-");
    const home = parts.length >= 2 ? parts[0] : "";
    const away = parts.length >= 2 ? parts[1] : "";
    const opts = ["0","1","2","3","4","5","6","7","8","9","10"];
    const selectStyle = {...S.pickSelect, fontSize:13, marginBottom:0, width:64, textAlign:"center"};
    return (
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <select style={selectStyle} value={home}
          onChange={e=>{
            const h = e.target.value;
            if (h === "") { onChange(""); return; }
            onChange(`${h}-${away||"0"}`);
          }}>
          <option value="">-</option>
          {opts.map(n=><option key={n} value={n}>{n}</option>)}
        </select>
        <span style={{color:"#E61D25",fontWeight:700,fontSize:16}}>–</span>
        <select style={selectStyle} value={away}
          onChange={e=>{
            const a = e.target.value;
            if (a === "") { onChange(""); return; }
            onChange(`${home||"0"}-${a}`);
          }}>
          <option value="">-</option>
          {opts.map(n=><option key={n} value={n}>{n}</option>)}
        </select>
      </div>
    );
  }
  return (
    <input
      type={q.type==="number"?"number":"text"}
      style={{...S.editInput,width:"100%",fontSize:11,boxSizing:"border-box"}}
      placeholder={placeholder||(q.type==="number"?"e.g. 168":"e.g. Kylian Mbappé")}
      value={value}
      onChange={e=>onChange(e.target.value)}
    />
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// RULES
// ═══════════════════════════════════════════════════════════════════════════════
function RulesTab() {
  return (
    <div style={S.rules}>
      <h2 style={S.sectionTitle}>THE RULES</h2>
      {[
        `Entry is £${ENTRY_FEE} per game. You only pay if you pick a team in the first round of each game. Leaving round 1 blank = sitting out that game, no charge.`,
        "Before each round's deadline, pick any nation playing in that round that you think will WIN.",
        "You can pick the same team as other players — no exclusivity.",
        "If your team wins, you survive to the next round.",
        "If your team draws or loses, you are ELIMINATED.",
        "In knockout rounds there are no draws — extra time and penalties count as a win.",
        "You cannot pick the same nation twice within one game.",
        "Missing any round AFTER round 1 means auto-elimination (no pick = lost).",
        "You can submit picks for future rounds in advance.",
        "The last player remaining wins the entire pot.",
        "If everyone is eliminated in the same round, the pot rolls over and a new game auto-starts from the next round.",
        "When a winner is found, a new game auto-starts from the following round. Players re-enter by picking in the new game's first round.",
      ].map((r,i)=>(
        <div key={i} style={S.ruleRow}>
          <span style={S.ruleNum}>{i+1}</span>
          <span style={S.ruleText}>{r}</span>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SETTINGS
// ═══════════════════════════════════════════════════════════════════════════════
function ResetPanel() {
  const [confirming, setConfirming] = useState(false);
  return confirming ? (
    <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
      <span style={{fontSize:12,color:"#e53935"}}>This will wipe ALL data for everyone.</span>
      <button onClick={async()=>{ await fetch("/api/state", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(null),
    }); window.location.reload(); }}
        style={{...S.removeBtn,padding:"5px 12px",fontWeight:700}}>✓ YES, RESET</button>
      <button onClick={()=>setConfirming(false)}
        style={{background:"transparent",border:"1px solid #374151",color:"#9ca3af",borderRadius:4,padding:"5px 10px",cursor:"pointer",fontSize:11}}>
        CANCEL
      </button>
    </div>
  ) : (
    <button style={{...S.removeBtn,padding:"8px 16px"}} onClick={()=>setConfirming(true)}>
      RESET ALL DATA
    </button>
  );
}

function SettingsTab({ state, update, newPlayerName, setNewPlayerName, addPlayer, removePlayer }) {
  return (
    <div style={S.settings}>
      <h2 style={S.sectionTitle}>SETTINGS</h2>
      <div style={S.infoBox}>
        <strong style={{color:"#c9a84c"}}>🌐 Live & Shared</strong>
        <p style={{margin:"6px 0 0",fontSize:12,color:"#9ca3af",lineHeight:1.5}}>
          Share this artifact's URL in your WhatsApp group. All picks and results sync within ~5 seconds for everyone.
        </p>
      </div>
      <div style={S.settingGroup}>
        <h3 style={S.settingGroupTitle}>PLAYERS</h3>
        <div style={{display:"flex",gap:8,marginBottom:10}}>
          <input style={S.editInput} placeholder="New player name"
            value={newPlayerName} onChange={e=>setNewPlayerName(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&addPlayer()}/>
          <button onClick={addPlayer} style={S.addBtn}>ADD</button>
        </div>
        {state.players.map(p=>(
          <div key={p} style={S.playerRow}>
            <span style={{color:"#ddd",fontSize:13}}>{p}</span>
            <button onClick={()=>removePlayer(p)} style={S.removeBtn}>✕</button>
          </div>
        ))}
      </div>
      <div style={S.settingGroup}>
        <h3 style={S.settingGroupTitle}>DANGER ZONE</h3>
        <ResetPanel/>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════════
const S = {
  root:{minHeight:"100vh",background:"#0e0f14",color:"#fff",fontFamily:"'DM Sans','Helvetica Neue',sans-serif"},
  loadScreen:{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100vh",background:"#0e0f14"},
  spinner:{width:36,height:36,border:"2px solid #1e1f26",borderTop:"2px solid #E61D25",borderRadius:"50%"},

  // ── Header ────────────────────────────────────────────────────────────────
  header:{background:"#0e0f14",position:"sticky",top:0,zIndex:100,borderBottom:"3px solid #E61D25"},
  headerTop:{display:"flex",alignItems:"center",gap:14,padding:"18px 18px 14px"},
  kicker:{fontSize:9,letterSpacing:4,color:"#E61D25",fontWeight:700,textTransform:"uppercase",fontFamily:"'DM Sans',sans-serif",marginBottom:6},
  title:{margin:0,fontSize:42,fontWeight:400,letterSpacing:1,color:"#fff",fontFamily:"'Bebas Neue',sans-serif",lineHeight:0.88,textTransform:"uppercase"},
  aliveCount:{marginLeft:"auto",textAlign:"center",background:"#E61D25",color:"#fff",borderRadius:4,padding:"10px 16px",minWidth:64,flexShrink:0,alignSelf:"flex-start"},
  aliveNum:{display:"block",fontSize:38,fontWeight:400,lineHeight:0.9,fontFamily:"'Bebas Neue',sans-serif",letterSpacing:1},
  aliveLabel:{fontSize:8,fontWeight:700,letterSpacing:3,textTransform:"uppercase",opacity:0.9},
  statStrip:{display:"flex",alignItems:"center",padding:"0 18px 14px",gap:0},
  statItem:{display:"flex",flexDirection:"column",gap:2,flex:1},
  statLabel:{fontSize:8,letterSpacing:2,color:"#444",textTransform:"uppercase",fontWeight:600},
  statValue:{fontSize:18,fontFamily:"'Bebas Neue',sans-serif",color:"#fff",letterSpacing:1,lineHeight:1},
  statDivider:{width:1,height:28,background:"#1c1c1c",margin:"0 16px"},

  // ── Game tabs ─────────────────────────────────────────────────────────────
  gameTabs:{display:"flex",overflowX:"auto",padding:"0 16px",gap:0,background:"#0e0f14",borderBottom:"1px solid #141414"},
  gameTab:{background:"transparent",border:"none",borderBottom:"2px solid transparent",color:"#3a3b45",padding:"9px 12px",cursor:"pointer",fontSize:10,fontFamily:"'DM Sans',sans-serif",whiteSpace:"nowrap",fontWeight:600,letterSpacing:1.5,textTransform:"uppercase"},
  gameTabActive:{color:"#E61D25",borderBottom:"2px solid #E61D25"},

  // ── Nav ───────────────────────────────────────────────────────────────────
  nav:{display:"flex",background:"#0b0c10",borderBottom:"1px solid #141414"},
  navBtn:{flex:1,padding:"11px 0",background:"transparent",border:"none",color:"#333",fontFamily:"'DM Sans',sans-serif",fontSize:9,letterSpacing:2.5,cursor:"pointer",textTransform:"uppercase",fontWeight:700,borderBottom:"3px solid transparent"},
  navBtnActive:{color:"#fff",borderBottom:"3px solid #E61D25",background:"#0d0d0d"},

  main:{padding:"14px 14px",maxWidth:900,margin:"0 auto"},

  // ── Banners ───────────────────────────────────────────────────────────────
  winnerBanner:{display:"flex",alignItems:"center",gap:18,background:"#E61D25",padding:"18px 20px",marginBottom:14,borderRadius:3},
  rolloverBanner:{background:"#13141a",borderLeft:"3px solid #a8e031",padding:"10px 14px",marginBottom:10,fontSize:10,color:"#a8e031",letterSpacing:2,textTransform:"uppercase",fontWeight:700},

  // ── Round cards ───────────────────────────────────────────────────────────
  roundCard:{background:"#13141a",borderRadius:3,marginBottom:10,overflow:"hidden",border:"1px solid #1e1f26"},
  roundCardResolved:{opacity:0.45},
  roundHeader:{display:"flex",alignItems:"flex-start",justifyContent:"space-between",padding:"14px 16px",borderBottom:"1px solid #1e1f26",cursor:"pointer",gap:8},
  roundStage:{fontSize:8,color:"#E61D25",letterSpacing:4,display:"block",marginBottom:5,textTransform:"uppercase",fontWeight:700},
  roundLabel:{margin:0,fontSize:22,fontWeight:400,color:"#fff",fontFamily:"'Bebas Neue',sans-serif",letterSpacing:2},
  roundDeadline:{fontSize:10,color:"#666",marginTop:4,display:"block",letterSpacing:0.5},
  resolvedBadge:{background:"#a8e031",color:"#080808",borderRadius:2,padding:"3px 10px",fontSize:8,fontWeight:700,flexShrink:0,textTransform:"uppercase",letterSpacing:2,alignSelf:"flex-start"},
  expandChevron:{color:"#2e2f38",fontSize:10,flexShrink:0,marginTop:6},
  roundNote:{padding:"10px 16px",background:"#0b0c10",fontSize:11,color:"#777",borderBottom:"1px solid #1e1f26",lineHeight:1.5},
  editBtn:{background:"transparent",border:"1px solid #1e1f26",color:"#3a3b45",borderRadius:2,padding:"4px 12px",cursor:"pointer",fontSize:8,letterSpacing:2.5,fontFamily:"'DM Sans',sans-serif",textTransform:"uppercase",fontWeight:700},
  closeRoundBtn:{background:"transparent",border:"1px solid #E61D25",color:"#E61D25",borderRadius:2,padding:"4px 12px",cursor:"pointer",fontSize:8,letterSpacing:2,fontFamily:"'DM Sans',sans-serif",fontWeight:700,textTransform:"uppercase"},

  // ── Pick grid ─────────────────────────────────────────────────────────────
  picksGrid:{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:1,background:"#1e1f26"},
  pickCell:{background:"#13141a",padding:"12px 14px"},
  pickCellWin:{background:"#0a1a0a",borderLeft:"3px solid #a8e031"},
  pickCellElim:{background:"#1a0a0a",borderLeft:"3px solid #E61D25"},
  pickCellGhost:{opacity:0.15,background:"#0e0f14"},
  pickCellSatOut:{opacity:0.2,background:"#0b0c10"},
  pickPlayer:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:7},
  pickPlayerName:{fontSize:11,fontWeight:700,color:"#fff",letterSpacing:1,textTransform:"uppercase"},
  elimBadge:{fontSize:7,background:"#E61D25",color:"#fff",borderRadius:2,padding:"2px 5px",fontWeight:700,letterSpacing:1.5,textTransform:"uppercase"},
  pickSelect:{width:"100%",background:"#1a1b22",border:"1px solid #1e1f26",color:"#ccc",borderRadius:2,padding:"5px 7px",fontSize:11,outline:"none",marginBottom:4},
  pickDisplay:{fontSize:12,color:"#777",marginBottom:4,minHeight:20},
  outcomeRow:{display:"flex",gap:4,marginTop:2},
  outcomeBtn:{flex:1,padding:"5px 0",background:"transparent",border:"1px solid #1e1f26",borderRadius:2,cursor:"pointer",fontSize:13,fontWeight:700,letterSpacing:0.5,transition:"all 0.1s",fontFamily:"'DM Sans',sans-serif"},
  resultBar:{padding:"9px 16px",background:"#0b0c10",borderTop:"1px solid #1e1f26",color:"#a8e031",fontSize:9,letterSpacing:3,textTransform:"uppercase",fontWeight:700},

  // ── Fixtures ──────────────────────────────────────────────────────────────
  fixtureSection:{background:"#13141a",border:"1px solid #1e1f26",borderRadius:3,marginBottom:10,overflow:"hidden"},
  fixtureSectionHeader:{display:"flex",alignItems:"flex-start",justifyContent:"space-between",padding:"13px 16px",cursor:"pointer",gap:8,borderBottom:"1px solid #1e1f26"},
  fixtureSectionTitle:{fontSize:18,fontWeight:400,color:"#fff",fontFamily:"'Bebas Neue',sans-serif",letterSpacing:2,display:"block",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"},
  fixtureNote:{padding:"10px 16px",background:"#0b0c10",fontSize:11,color:"#777",borderBottom:"1px solid #1e1f26",lineHeight:1.6},
  deadlineBadge:{background:"transparent",color:"#E61D25",border:"1px solid #E61D25",borderRadius:2,padding:"3px 9px",fontSize:8,fontWeight:700,flexShrink:0,whiteSpace:"nowrap",letterSpacing:1.5,textTransform:"uppercase"},
  fixtureRow:{display:"flex",alignItems:"center",gap:10,padding:"10px 16px",borderBottom:"1px solid #111318"},
  fixtureDate:{fontSize:10,color:"#666",minWidth:85,flexShrink:0,letterSpacing:0.3},
  fixtureTeam:{fontSize:13,color:"#ccc",flex:1,minWidth:0},
  fixtureVs:{fontSize:9,color:"#1c1c1c",flexShrink:0,padding:"0 4px",fontWeight:700,letterSpacing:2},

  // ── Section titles ────────────────────────────────────────────────────────
  sectionTitle:{fontSize:26,fontWeight:400,color:"#fff",marginBottom:14,fontFamily:"'Bebas Neue',sans-serif",letterSpacing:3,textTransform:"uppercase",display:"block",borderBottom:"1px solid #1e1f26",paddingBottom:10},

  // ── Money tracker ─────────────────────────────────────────────────────────
  moneyRow:{display:"flex",alignItems:"center",gap:12,padding:"14px 16px",marginBottom:1,background:"#13141a",borderBottom:"1px solid #1a1b22"},
  moneyRowUp:{borderLeft:"3px solid #a8e031"},
  moneyRowEven:{borderLeft:"3px solid #1e1f26"},
  moneyRowDown:{borderLeft:"3px solid #E61D25"},
  moneyRank:{width:26,fontSize:14,fontWeight:400,color:"#222",textAlign:"center",flexShrink:0,fontFamily:"'Bebas Neue',sans-serif"},
  moneyName:{fontSize:14,fontWeight:700,color:"#fff",marginBottom:3},
  moneyBreakdown:{fontSize:10,color:"#333",lineHeight:1.5},
  moneyNet:{fontSize:26,fontWeight:400,fontFamily:"'Bebas Neue',sans-serif",letterSpacing:1,flexShrink:0,minWidth:60,textAlign:"right"},
  moneyGameBlock:{background:"#13141a",border:"1px solid #1e1f26",borderRadius:3,marginBottom:8,overflow:"hidden"},
  moneyGameHeader:{padding:"12px 16px",borderBottom:"1px solid #1e1f26",display:"flex",flexDirection:"column",gap:4},

  // ── Rules ─────────────────────────────────────────────────────────────────
  rules:{},
  ruleRow:{display:"flex",gap:14,padding:"12px 0",borderBottom:"1px solid #1a1b22",alignItems:"flex-start"},
  ruleNum:{width:24,height:24,background:"#E61D25",color:"#fff",borderRadius:2,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,flexShrink:0},
  ruleText:{fontSize:12,color:"#666",lineHeight:1.7},

  // ── Settings ──────────────────────────────────────────────────────────────
  settings:{},
  infoBox:{background:"#13141a",borderLeft:"3px solid #E61D25",padding:"14px 16px",marginBottom:14},
  settingGroup:{background:"#13141a",border:"1px solid #1e1f26",borderRadius:3,padding:"16px",marginBottom:10},
  settingGroupTitle:{fontSize:8,letterSpacing:4,color:"#E61D25",margin:"0 0 12px",fontFamily:"'DM Sans',sans-serif",textTransform:"uppercase",fontWeight:700},
  playerRow:{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:"1px solid #1a1b22"},
  editInput:{background:"#1a1b22",border:"1px solid #1e1f26",color:"#fff",borderRadius:2,padding:"8px 12px",fontSize:13,outline:"none",flex:1,fontFamily:"'DM Sans',sans-serif"},
  addBtn:{background:"#E61D25",color:"#fff",border:"none",borderRadius:2,padding:"8px 18px",cursor:"pointer",fontWeight:700,letterSpacing:2,fontFamily:"'DM Sans',sans-serif",fontSize:10,textTransform:"uppercase"},
  removeBtn:{background:"transparent",border:"1px solid #1e1f26",color:"#3a3b45",borderRadius:2,padding:"5px 10px",cursor:"pointer",fontSize:11},

  // ── Predictor ─────────────────────────────────────────────────────────────
  predHeader:{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:8,marginBottom:16},
  predCatHeader:{fontSize:8,letterSpacing:4,color:"#3a3b45",padding:"14px 0 8px",borderBottom:"1px solid #1e1f26",marginBottom:10,fontFamily:"'DM Sans',sans-serif",textTransform:"uppercase",fontWeight:700},
  predRow:{background:"#13141a",borderBottom:"1px solid #1a1b22",padding:"14px 0",marginBottom:0},
  predPtsBadge:{background:"#E61D25",color:"#fff",borderRadius:2,padding:"3px 8px",fontSize:8,fontWeight:700,flexShrink:0,letterSpacing:1.5,textTransform:"uppercase",fontFamily:"'DM Sans',sans-serif"},

  // ── Leaderboard ───────────────────────────────────────────────────────────
  lbRow:{display:"flex",alignItems:"center",gap:12,padding:"14px 0",borderBottom:"1px solid #1a1b22"},
  lbRowWinner:{borderLeft:"3px solid #a8e031",paddingLeft:12},
  lbRowAlive:{},
  lbRowElim:{opacity:0.3},
  lbRank:{width:28,fontSize:16,fontWeight:400,color:"#222",textAlign:"center",fontFamily:"'Bebas Neue',sans-serif"},
  lbName:{flex:1,fontSize:15,fontWeight:700,color:"#fff"},
  lbStatus:{fontSize:9,letterSpacing:1.5,textTransform:"uppercase",fontWeight:600},
  lbStat:{fontSize:10,color:"#333",minWidth:48,textAlign:"right"},
  lbPot:{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:18,padding:"16px 18px",background:"#E61D25",borderRadius:3},

  // ── Toast ─────────────────────────────────────────────────────────────────
  toast:{position:"fixed",bottom:24,left:"50%",transform:"translateX(-50%)",background:"#fff",color:"#080808",padding:"10px 24px",borderRadius:2,fontWeight:700,letterSpacing:3,fontSize:10,zIndex:999,boxShadow:"0 8px 40px rgba(0,0,0,0.7)",whiteSpace:"nowrap",textTransform:"uppercase",fontFamily:"'DM Sans',sans-serif"},
};
