// v2

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
    deadline:"Thu 11 Jun, 20:00 BST",
    note:"Pick any team playing their first group game. A draw eliminates you. Not picking = sitting this game out (no entry fee).",
    fixtures:[
      ["Mexico","South Africa","Thu 11 Jun","20:00 BST"],
      ["South Korea","Czechia","Fri 12 Jun","03:00 BST"],
      ["Canada","Bosnia & Herz.","Fri 12 Jun","20:00 BST"],
      ["USA","Paraguay","Sat 13 Jun","02:00 BST"],
      ["Australia","Turkey","Sat 13 Jun","05:00 BST"],
      ["Qatar","Switzerland","Sat 13 Jun","20:00 BST"],
      ["Brazil","Morocco","Sat 13 Jun","23:00 BST"],
      ["Haiti","Scotland","Sun 14 Jun","02:00 BST"],
      ["Germany","Curaçao","Sun 14 Jun","18:00 BST"],
      ["Ivory Coast","Ecuador","Sun 14 Jun","21:00 BST"],
      ["Netherlands","Japan","Mon 15 Jun","00:00 BST"],
      ["Sweden","Tunisia","Mon 15 Jun","03:00 BST"],
      ["Spain","Cape Verde","Mon 15 Jun","17:00 BST"],
      ["Belgium","Egypt","Mon 15 Jun","20:00 BST"],
      ["Saudi Arabia","Uruguay","Mon 15 Jun","23:00 BST"],
      ["Iran","New Zealand","Tue 16 Jun","02:00 BST"],
      ["France","Senegal","Tue 16 Jun","20:00 BST"],
      ["Iraq","Norway","Tue 16 Jun","23:00 BST"],
      ["Argentina","Algeria","Wed 17 Jun","02:00 BST"],
      ["Austria","Jordan","Wed 17 Jun","05:00 BST"],
      ["Portugal","DR Congo","Wed 17 Jun","18:00 BST"],
      ["Uzbekistan","Colombia","Wed 17 Jun","21:00 BST"],
      ["England","Croatia","Wed 17 Jun","21:00 BST"],
      ["Ghana","Panama","Thu 18 Jun","00:00 BST"],
    ],
  },
  {
    id:2, label:"Group Stage – Matchday 2", stage:"Group Stage",
    deadline:"Thu 18 Jun, 17:00 BST",
    note:"Pick any team playing their second group game. A draw eliminates you. Missing this round = auto-eliminated.",
    fixtures:[
      ["Czechia","South Africa","Thu 18 Jun","17:00 BST"],
      ["Switzerland","Bosnia & Herz.","Thu 18 Jun","20:00 BST"],
      ["Canada","Qatar","Thu 18 Jun","23:00 BST"],
      ["Mexico","South Korea","Fri 19 Jun","02:00 BST"],
      ["USA","Australia","Fri 19 Jun","20:00 BST"],
      ["Scotland","Morocco","Fri 19 Jun","23:00 BST"],
      ["Brazil","Haiti","Sat 20 Jun","02:00 BST"],
      ["Turkey","Paraguay","Sat 20 Jun","05:00 BST"],
      ["Netherlands","Sweden","Sat 20 Jun","18:00 BST"],
      ["Germany","Ivory Coast","Sat 20 Jun","21:00 BST"],
      ["Ecuador","Curaçao","Sun 21 Jun","00:00 BST"],
      ["Tunisia","Japan","Sun 21 Jun","03:00 BST"],
      ["Spain","Saudi Arabia","Sun 21 Jun","17:00 BST"],
      ["Belgium","Iran","Sun 21 Jun","20:00 BST"],
      ["Uruguay","Cape Verde","Sun 21 Jun","23:00 BST"],
      ["New Zealand","Egypt","Mon 22 Jun","02:00 BST"],
      ["Argentina","Austria","Mon 22 Jun","18:00 BST"],
      ["France","Iraq","Mon 22 Jun","22:00 BST"],
      ["Portugal","Uzbekistan","Tue 23 Jun","18:00 BST"],
      ["Colombia","DR Congo","Tue 23 Jun","21:00 BST"],
      ["England","Ghana","Tue 23 Jun","21:00 BST"],
      ["Panama","Croatia","Wed 24 Jun","00:00 BST"],
      ["Norway","Senegal","Wed 24 Jun","01:00 BST"],
      ["Jordan","Algeria","Wed 24 Jun","04:00 BST"],
    ],
  },
  {
    id:3, label:"Group Stage – Matchday 3", stage:"Group Stage",
    deadline:"Wed 24 Jun, 20:00 BST",
    note:"Final group games. Simultaneous kick-offs — must WIN, no draws.",
    fixtures:[
      ["South Africa","South Korea","Wed 24 Jun","20:00 BST"],
      ["Mexico","Czechia","Wed 24 Jun","20:00 BST"],
      ["Switzerland","Canada","Wed 24 Jun","20:00 BST"],
      ["Bosnia & Herz.","Qatar","Wed 24 Jun","20:00 BST"],
      ["Scotland","Brazil","Wed 24 Jun","23:00 BST"],
      ["Morocco","Haiti","Wed 24 Jun","23:00 BST"],
      ["USA","Turkey","Thu 25 Jun","03:00 BST"],
      ["Australia","Paraguay","Thu 25 Jun","03:00 BST"],
      ["Germany","Ecuador","Thu 25 Jun","20:00 BST"],
      ["Curaçao","Ivory Coast","Thu 25 Jun","20:00 BST"],
      ["Netherlands","Tunisia","Fri 26 Jun","00:00 BST"],
      ["Japan","Sweden","Fri 26 Jun","00:00 BST"],
      ["Spain","Uruguay","Fri 26 Jun","02:00 BST"],
      ["Cape Verde","Saudi Arabia","Fri 26 Jun","02:00 BST"],
      ["Belgium","New Zealand","Fri 26 Jun","02:00 BST"],
      ["Egypt","Iran","Fri 26 Jun","02:00 BST"],
      ["Norway","France","Fri 26 Jun","20:00 BST"],
      ["Senegal","Iraq","Fri 26 Jun","20:00 BST"],
      ["Algeria","Austria","Sat 27 Jun","03:00 BST"],
      ["Argentina","Jordan","Sat 27 Jun","03:00 BST"],
      ["Portugal","Colombia","Sat 27 Jun","18:00 BST"],
      ["Uzbekistan","DR Congo","Sat 27 Jun","18:00 BST"],
      ["Panama","England","Sat 27 Jun","22:00 BST"],
      ["Croatia","Ghana","Sat 27 Jun","22:00 BST"],
    ],
  },
  {
    id:4, label:"Round of 32", stage:"Round of 32",
    deadline:"Sat 28 Jun, 17:00 BST",
    note:"32 teams. No draws — extra time & penalties if level after 90 mins.",
    fixtures:[
      ["Group A Winner","TBD","Sat 28 Jun","17:00 BST"],["Group B Winner","TBD","Sun 6 Jul","20:30"],
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
    deadline:"Fri 4 Jul, 17:00 BST",
    note:"16 teams remaining. No draws.",
    fixtures:[
      ["R32 M1 Winner","R32 M2 Winner","Fri 4 Jul","17:00 BST"],["R32 M3 Winner","R32 M4 Winner","Sun 13 Jul","21:00"],
      ["R32 M5 Winner","R32 M6 Winner","Mon 14 Jul","17:00"],["R32 M7 Winner","R32 M8 Winner","Mon 14 Jul","21:00"],
      ["R32 M9 Winner","R32 M10 Winner","Tue 15 Jul","17:00"],["R32 M11 Winner","R32 M12 Winner","Tue 15 Jul","21:00"],
      ["R32 M13 Winner","R32 M14 Winner","Wed 16 Jul","17:00"],["R32 M15 Winner","R32 M16 Winner","Wed 16 Jul","21:00"],
    ],
  },
  {
    id:6, label:"Quarter-Finals", stage:"Quarter-Finals",
    deadline:"Thu 9 Jul, 21:00 BST",
    note:"8 teams. No draws.",
    fixtures:[
      ["R16 M1 Winner","R16 M2 Winner","Thu 9 Jul","21:00 BST"],["R16 M3 Winner","R16 M4 Winner","Sat 19 Jul","00:00"],
      ["R16 M5 Winner","R16 M6 Winner","Sat 19 Jul","20:00"],["R16 M7 Winner","R16 M8 Winner","Sun 20 Jul","00:00"],
    ],
  },
  {
    id:7, label:"Semi-Finals", stage:"Semi-Finals",
    deadline:"Tue 14 Jul, 20:00 BST",
    note:"4 teams. No draws.",
    fixtures:[
      ["QF M1 Winner","QF M2 Winner","Tue 14 Jul","20:00 BST"],["SF M3 Winner","SF M4 Winner","Thu 24 Jul","23:00"],
    ],
  },
  {
    id:8, label:"Final", stage:"Final",
    deadline:"Sat 18 Jul, 20:00 BST",
    note:"The World Cup Final at MetLife Stadium, New Jersey. Tiebreaker: predict the minute of the first goal.",
    fixtures:[["SF M1 Winner","SF M2 Winner","Sun 19 Jul","20:00 BST"]],
    hasTiebreaker: true,
  },
];

const isPlaceholder = t => !t || t.includes("Winner") || t.includes("TBD") || t.includes("Runner") || t.includes("R32") || t.includes("R16") || t.includes("QF") || t.includes("SF");

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
    return new Date(Date.UTC(2026, month, parseInt(day), parseInt(hh) - 1, parseInt(mm)));
  } catch { return null; }
}

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
const PREDICTOR_FEE = 10;

const ALL_NATIONS = [
  "Algeria","Argentina","Australia","Austria","Belgium","Bosnia & Herz.",
  "Brazil","Canada","Cape Verde","Colombia","Croatia","Curaçao",
  "Czechia","DR Congo","Ecuador","Egypt","England","France","Germany","Ghana",
  "Haiti","Iran","Iraq","Ivory Coast","Japan","Jordan","Mexico","Morocco",
  "Netherlands","New Zealand","Norway","Panama","Paraguay","Portugal","Qatar",
  "Saudi Arabia","Scotland","Senegal","South Africa","South Korea","Spain",
  "Sweden","Switzerland","Tunisia","Turkey","Uruguay","USA","Uzbekistan",
].sort();

const PREDICTOR_QUESTIONS = [
  { id:"winner",      pts:15, label:"Tournament Winner",                              type:"nation",   cat:"15pts" },
  { id:"runner_up",   pts:15, label:"Runner-Up",                                      type:"nation",   cat:"15pts" },
  { id:"semi1",       pts:15, label:"Semi-Finalist #1",                               type:"nation",   cat:"15pts" },
  { id:"semi2",       pts:15, label:"Semi-Finalist #2",                               type:"nation",   cat:"15pts" },
  { id:"semi3",       pts:15, label:"Semi-Finalist #3",                               type:"nation",   cat:"15pts" },
  { id:"semi4",       pts:15, label:"Semi-Finalist #4",                               type:"nation",   cat:"15pts" },
  { id:"golden_boot", pts:15, label:"Golden Boot – Top Scorer (player name)",         type:"freetext", cat:"15pts" },
  { id:"most_concede",pts:15, label:"Nation that concedes the most goals",            type:"nation",   cat:"15pts" },
  { id:"group_a", pts:5, label:"Group A Winner", type:"nation", cat:"Groups", teams:["Mexico","South Africa","South Korea","Czechia"] },
  { id:"group_b", pts:5, label:"Group B Winner", type:"nation", cat:"Groups", teams:["Canada","Bosnia & Herz.","Qatar","Switzerland"] },
  { id:"group_c", pts:5, label:"Group C Winner", type:"nation", cat:"Groups", teams:["Brazil","Morocco","Haiti","Scotland"] },
  { id:"group_d", pts:5, label:"Group D Winner", type:"nation", cat:"Groups", teams:["USA","Paraguay","Australia","Turkey"] },
  { id:"group_e", pts:5, label:"Group E Winner", type:"nation", cat:"Groups", teams:["Germany","Curaçao","Ivory Coast","Ecuador"] },
  { id:"group_f", pts:5, label:"Group F Winner", type:"nation", cat:"Groups", teams:["Netherlands","Japan","Sweden","Tunisia"] },
  { id:"group_g", pts:5, label:"Group G Winner", type:"nation", cat:"Groups", teams:["Belgium","Egypt","Iran","New Zealand"] },
  { id:"group_h", pts:5, label:"Group H Winner", type:"nation", cat:"Groups", teams:["Spain","Cape Verde","Saudi Arabia","Uruguay"] },
  { id:"group_i", pts:5, label:"Group I Winner", type:"nation", cat:"Groups", teams:["France","Senegal","Iraq","Norway"] },
  { id:"group_j", pts:5, label:"Group J Winner", type:"nation", cat:"Groups", teams:["Argentina","Algeria","Austria","Jordan"] },
  { id:"group_k", pts:5, label:"Group K Winner", type:"nation", cat:"Groups", teams:["Portugal","DR Congo","Uzbekistan","Colombia"] },
  { id:"group_l", pts:5, label:"Group L Winner", type:"nation", cat:"Groups", teams:["England","Croatia","Ghana","Panama"] },
  { id:"first_red",   pts:5, label:"First nation to receive a red card",             type:"nation",   cat:"5pts" },
  { id:"most_reds",   pts:5, label:"Nation with the most red cards overall",         type:"nation",   cat:"5pts" },
  { id:"boot_runner", pts:5, label:"Golden Boot Runner-Up (player name)",            type:"freetext", cat:"5pts" },
  { id:"first_out",   pts:5, label:"First nation knocked out of the tournament",     type:"nation",   cat:"5pts" },
  { id:"own_goals",   pts:5, label:"Nation that scores the most own goals",          type:"nation",   cat:"5pts" },
  { id:"high_score",  pts:5, label:"Predict the score of the highest-scoring match", type:"score", cat:"5pts" },
  { id:"most_pens",   pts:5, label:"Nation that wins the most penalty shootouts",    type:"nation",   cat:"5pts" },
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
      picks: {},
      answers: {},
      overrides: {},
      locked: false,
    },
    lastUpdated:0,
  };
}

function roundResolved(round) {
  return Object.values(round.outcomes).some(o => o===OUTCOME.WIN || o===OUTCOME.LOSE || o===OUTCOME.DRAW);
}

function gameEntrants(game, players) {
  const r0 = game.rounds[0];
  if (!r0) return players;
  if (!roundResolved(r0)) return players;
  return players.filter(p => !!r0.picks[p]);
}

function calcPot(game, players) {
  const r0 = game.rounds[0];
  const pickedCount = r0 ? Object.values(r0.picks).filter(p => !!p).length : 0;
  const entrantCount = roundResolved(r0)
    ? gameEntrants(game, players).length
    : pickedCount;
  return entrantCount * ENTRY_FEE + (game.rollover || 0);
}

function getElimRound(game, player, players) {
  const entrants = gameEntrants(game, players);
  if (!entrants.includes(player)) return -1;

  for (let i = 0; i < game.rounds.length; i++) {
    const r = game.rounds[i];
    if (!roundResolved(r)) break;
    const pick = r.picks[player];
    const o = r.outcomes[player];
    if (i > 0 && !pick) return r.id;
    if (o === OUTCOME.LOSE || o === OUTCOME.DRAW) return r.id;
  }
  return null;
}

function buildElimMap(game, players) {
  const m = {};
  for (const p of players) {
    const rid = getElimRound(game, p, players);
    if (rid !== null) m[p] = rid;
  }
  return m;
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
      const o = r.outcomes[p];
      if (i > 0 && !pick) { elim[p] = r.id; continue; }
      if (o === OUTCOME.LOSE || o === OUTCOME.DRAW) elim[p] = r.id;
    }
  }
  return entrants.filter(p => !elim[p]);
}

function isRoundFullySettled(round, aliveAtStart) {
  return aliveAtStart.every(p => {
    const o = round.outcomes[p];
    const pick = round.picks[p];
    if (!pick && roundResolved(round)) return true;
    return o === OUTCOME.WIN || o === OUTCOME.LOSE || o === OUTCOME.DRAW;
  });
}

function evaluateGameEnd(g, players) {
  let lastSettledIdx = -1;
  for (let i = 0; i < g.rounds.length; i++) {
    const alive = getAliveAtStart(g, players, i);
    if (alive.length === 0 && !roundResolved(g.rounds[i])) break;
    if (isRoundFullySettled(g.rounds[i], alive)) {
      lastSettledIdx = i;
    } else {
      break;
    }
  }
  if (lastSettledIdx < 0) return;

  const entrants = gameEntrants(g, players);
  const lastRound = g.rounds[lastSettledIdx];
  const isFinalRound = lastSettledIdx === g.rounds.length - 1;

  const survivors = entrants.filter(p => lastRound.outcomes[p] === OUTCOME.WIN);
  const elimMap = buildElimMap(g, players);
  const alive = entrants.filter(p => elimMap[p] == null);

  const aliveAtLastRound = getAliveAtStart(g, players, lastSettledIdx);
  const roundPending = aliveAtLastRound.filter(p => {
    const o = lastRound.outcomes[p];
    const pick = lastRound.picks[p];
    if (!pick) return false;
    return !o || o === OUTCOME.PENDING;
  }).length;

  if (roundPending > 0) return;

  const gameOver = survivors.length <= 1 || isFinalRound;
  if (!gameOver) return;

  g.complete = true;
  g.winners = survivors.length === 1 ? survivors : (isFinalRound && survivors.length > 0 ? survivors : []);
  if (survivors.length === 0) g.rolledOver = true;

  // The Final is the last round of the tournament — there is no next round,
  // so no new game should ever spawn after it.
  const wcIdx = ROUNDS.findIndex(wr => wr.id === lastRound.id);
  if (wcIdx >= ROUNDS.length - 1) return;

  const pot = calcPot(g, players);
  const newGame = buildGame(0, wcIdx + 1);
  newGame.rollover = alive.length === 0 ? pot : 0;
  return newGame;
}

function usedTeams(game, player, roundIndex) {
  const s = new Set();
  for (const r of game.rounds.slice(0, roundIndex)) {
    if (r.picks[player]) s.add(r.picks[player]);
  }
  return s;
}

function computeMoneyTracker(state) {
  const tracker = {};
  for (const p of state.players) tracker[p] = { spent:0, won:0, games:[] };

  for (const game of state.games) {
    const r0 = game.rounds[0];
    const pot = calcPot(game, state.players);

    for (const p of state.players) {
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

  const pred = state.predictor || { picks:{}, answers:{}, locked:false };
  const predEntrants = state.players.filter(p => pred.picks[p] && Object.keys(pred.picks[p]).some(id => id !== "tiebreak" && pred.picks[p][id] !== "" && pred.picks[p][id] !== null && pred.picks[p][id] !== undefined));
  const predPot = predEntrants.length * PREDICTOR_FEE;
  const scores = {};
  for (const p of state.players) {
    scores[p] = 0;
    const picks = pred.picks[p] || {};
    const sfAnswers = [pred.answers["semi1"], pred.answers["semi2"], pred.answers["semi3"], pred.answers["semi4"]].filter(Boolean).map(s=>s.toLowerCase().trim());
    for (const q of PREDICTOR_QUESTIONS) {
      if (q.id === "semi1" || q.id === "semi2" || q.id === "semi3" || q.id === "semi4") {
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
  let predWinners = maxScore > 0 ? state.players.filter(p => scores[p] === maxScore && predEntrants.includes(p)) : [];
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

  const closeRound = (gi, roundId) => update(s => {
    const g = s.games[gi];
    const r = g.rounds.find(r => r.id === roundId);
    if (!r) return;
    const roundIndex = g.rounds.indexOf(r);
    const aliveAtStart = getAliveAtStart(g, s.players, roundIndex);
    for (const p of aliveAtStart) {
      const o = r.outcomes[p];
      if (o !== OUTCOME.WIN && o !== OUTCOME.LOSE && o !== OUTCOME.DRAW) {
        r.outcomes[p] = OUTCOME.LOSE;
      }
    }
    const newGame = evaluateGameEnd(g, s.players);
    if (newGame) {
      const alreadyExists = s.games.length > gi + 1;
      if (!alreadyExists) {
        newGame.id = s.games.length + 1;
        newGame.label = `Game ${newGame.id}`;
        s.games.push(newGame);
      }
    }
  });

  const reopenRound = (gi, roundId) => update(s => {
    const g = s.games[gi];
    const r = g.rounds.find(r => r.id === roundId);
    if (!r) return;
    for (const p of s.players) {
      if (r.outcomes[p] !== undefined) r.outcomes[p] = OUTCOME.PENDING;
    }
    if (g.complete) {
      g.complete = false;
      g.winners = [];
      g.rolledOver = false;
      if (s.games.length > gi + 1) {
        const nextGame = s.games[gi + 1];
        const hasAnyPicks = nextGame.rounds.some(r => Object.values(r.picks).some(p => !!p));
        if (!hasAnyPicks) {
          s.games.splice(gi + 1, 1);
        }
      }
    }
  });

  const setOutcome = (gi, roundId, player, outcome) => update(s => {
    const g = s.games[gi];
    const r = g.rounds.find(r => r.id === roundId);
    if (!r) return;
    r.outcomes[player] = (r.outcomes[player] === outcome) ? OUTCOME.PENDING : outcome;

    if (g.complete) {
      g.complete = false;
      g.winners = [];
      g.rolledOver = false;
      if (s.games.length > gi + 1) {
        const nextGame = s.games[gi + 1];
        const hasAnyPicks = nextGame.rounds.some(r => Object.values(r.picks).some(p => !!p));
        if (!hasAnyPicks) s.games.splice(gi + 1, 1);
      }
    }

    const newGame = evaluateGameEnd(g, s.players);
    if (newGame) {
      const alreadyExists = s.games.length > gi + 1;
      if (!alreadyExists) {
        newGame.id = s.games.length + 1;
        newGame.label = `Game ${newGame.id}`;
        s.games.push(newGame);
      }
    }
  });

  const setPredictorPick = (player, questionId, answer) => update(s => {
    if (!s.predictor) s.predictor = { picks:{}, answers:{}, locked:false };
    if (!s.predictor.picks[player]) s.predictor.picks[player] = {};
    if (answer === "" || answer === null || answer === undefined) {
      delete s.predictor.picks[player][questionId];
    } else {
      s.predictor.picks[player][questionId] = answer;
    }
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
      <p style={{color:"#e61d25",marginTop:16,fontFamily:"'DM Sans',sans-serif",letterSpacing:4}}>LOADING…</p>
    </div>
  );

  const game = state.games[activeGameIdx]||state.games[state.games.length-1];
  const gi = state.games.indexOf(game);
  const elimMap = buildElimMap(game, state.players);
  const entrants = gameEntrants(game, state.players);
  const r0picks = game.rounds[0] ? state.players.filter(p => !!game.rounds[0].picks[p]) : [];
  const actualEntrants = roundResolved(game.rounds[0]) ? entrants : r0picks;
  const aliveNow = actualEntrants.filter(p=>elimMap[p]==null);
  const pot = calcPot(game, state.players);
  const pred = state.predictor || { picks:{}, answers:{}, locked:false };
  const predEntrantCount = state.players.filter(p => pred.picks[p] && Object.keys(pred.picks[p]).some(id => id !== "tiebreak" && pred.picks[p][id] !== "" && pred.picks[p][id] !== null && pred.picks[p][id] !== undefined)).length;
  const predPotTotal = predEntrantCount * PREDICTOR_FEE;

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
        {tab==="tracker"&&game.complete&&game.winners.length>0&&(
          <div style={S.winnerBanner}>
            <div style={{fontSize:30,lineHeight:1}}>🏆</div>
            <div>
              <div style={{fontSize:9,letterSpacing:4,color:"rgba(255,255,255,0.9)",textTransform:"uppercase",fontWeight:700,fontFamily:"'DM Sans',sans-serif"}}>Game over</div>
              <div style={{fontSize:28,fontWeight:400,color:"#fff",fontFamily:"'Bebas Neue',sans-serif",letterSpacing:3,lineHeight:1.05}}>{game.winners.join(" & ")} WIN</div>
              <div style={{fontSize:11,color:"rgba(255,255,255,0.8)",marginTop:3}}>£{Math.floor(pot/game.winners.length)} each · a new game starts from the next round</div>
            </div>
          </div>
        )}
        {tab==="tracker"&&game.rolledOver&&(
          <div style={S.rolloverBanner}>Everyone out — £{pot} rolls over to {state.games[gi+1]?.label||"the next game"}</div>
        )}
        {tab==="tracker"&&game.rollover>0&&!game.rolledOver&&(
          <div style={S.rolloverBanner}>Rollover included — £{game.rollover} carried into this game's pot</div>
        )}
        {tab==="tracker"&&!game.complete&&aliveNow.length===1&&(
          <div style={{background:"#E61D25",padding:"11px 18px",display:"flex",alignItems:"baseline",gap:12,flexShrink:0}}>
            <span style={{fontSize:22,fontFamily:"'Bebas Neue',sans-serif",letterSpacing:3,color:"#fff",lineHeight:1}}>LAST MAN STANDING</span>
            <span style={{fontSize:12,color:"rgba(255,255,255,0.9)",fontWeight:700,letterSpacing:1}}>{aliveNow[0]}</span>
          </div>
        )}
        {tab==="tracker"&&!game.complete&&aliveNow.length>1&&aliveNow.length<=3&&(
          <div style={{background:"#E61D25",padding:"9px 18px",display:"flex",alignItems:"center",flexShrink:0}}>
            <span style={{fontSize:20,fontFamily:"'Bebas Neue',sans-serif",letterSpacing:3,color:"#fff",lineHeight:1}}>FINAL SHOWDOWN — {aliveNow.length} REMAINING</span>
          </div>
        )}
      </header>

      <main style={S.main}>
        {tab==="tracker"&&(
          <TrackerTab rounds={trackerRounds} game={game} gi={gi} state={state}
            elimMap={elimMap} entrants={entrants} setPick={setPick} setOutcome={setOutcome}
            closeRound={closeRound} reopenRound={reopenRound} setTiebreaker={setTiebreaker}
            editingRound={editingRound} setEditingRound={setEditingRound}/>
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
function TrackerTab({ rounds, game, gi, state, elimMap, entrants, setPick, setOutcome, closeRound, reopenRound, setTiebreaker, editingRound, setEditingRound }) {
  return (
    <div>
      {rounds.map((round) => {
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
            roundIndex={realRoundIdx}/>
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
            style={{background:"rgba(245,158,11,0.2)",border:"1px solid #f59e0b",color:"#f59e0b",borderRadius:4,padding:"4px 10px",cursor:"pointer",fontSize:10,fontFamily:"'DM Sans',sans-serif",fontWeight:700}}>
            Confirm
          </button>
          <button
            onClick={e=>{e.stopPropagation(); setConfirming(false);}}
            style={{background:"transparent",border:"1px solid #374151",color:"#9ca3af",borderRadius:4,padding:"4px 10px",cursor:"pointer",fontSize:10,fontFamily:"'DM Sans',sans-serif"}}>
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={e=>{e.stopPropagation(); setConfirming(true);}}
          style={{background:"rgba(245,158,11,0.1)",border:"1px solid rgba(245,158,11,0.4)",color:"#f59e0b",borderRadius:4,padding:"4px 10px",cursor:"pointer",fontSize:9,letterSpacing:2,fontFamily:"'DM Sans',sans-serif",fontWeight:700,textTransform:"uppercase"}}>
          Reopen round
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
            Confirm
          </button>
          <button
            onClick={e=>{e.stopPropagation(); setConfirming(false);}}
            style={{background:"transparent",border:"1px solid #374151",color:"#9ca3af",borderRadius:4,padding:"4px 10px",cursor:"pointer",fontSize:10,fontFamily:"'DM Sans',sans-serif"}}>
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={e=>{e.stopPropagation(); setConfirming(true);}}
          style={S.closeRoundBtn}>
          Close round
        </button>
      )}
    </div>
  );
}

function RoundCard({ round, wcRound, game, gi, state, aliveAtStart, elimMap, entrants, setPick, setOutcome, closeRound, reopenRound, setTiebreaker, isFirstRound, isEditing, setEditing, roundIndex }) {
  const resolved = roundResolved(round);
  const survivors = aliveAtStart.filter(p=>round.outcomes[p]===OUTCOME.WIN);
  const ousted = aliveAtStart.filter(p=>
    round.outcomes[p]===OUTCOME.LOSE||round.outcomes[p]===OUTCOME.DRAW||(resolved&&!round.picks[p]&&roundIndex>0)
  );
  const [expanded, setExpanded] = useState(!resolved && !game.complete);
  useEffect(()=>{ if (!resolved && !game.complete) setExpanded(true); },[resolved, game.complete]);

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
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8}}>
            <h2 style={S.roundLabel}>{round.label}</h2>
            {resolved
              ?<span style={S.resolvedBadge}>{survivors.length} survive</span>
              :deadlinePassed
                ?<span style={S.lockedBadge}>Locked</span>
                :<span style={S.expandChevron}>{expanded?"▲":"▼"}</span>}
          </div>
          {wcRound&&<span style={S.roundDeadline}>Locks at first kick-off · {wcRound.fixtures[0]?.[2]} {wcRound.fixtures[0]?.[3]}</span>}
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
              const satOut = !entered && resolved;
              const isAlive = aliveAtStart.includes(player);
              const pick = round.picks[player];
              const outcome = round.outcomes[player];
              const used = usedTeams(game, player, roundIndex);
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
                    <span style={{display:"flex",alignItems:"center",gap:4}}>
                      {outcome===OUTCOME.WIN&&<span style={{fontSize:9,fontWeight:700,color:"#a8e031",letterSpacing:1,background:"rgba(168,224,49,0.12)",padding:"1px 6px",borderRadius:2}}>WIN</span>}
                      {outcome===OUTCOME.DRAW&&<span style={{fontSize:9,fontWeight:700,color:"#E61D25",letterSpacing:1,background:"rgba(230,29,37,0.12)",padding:"1px 6px",borderRadius:2}}>DRAW</span>}
                      {outcome===OUTCOME.LOSE&&<span style={{fontSize:9,fontWeight:700,color:"#E61D25",letterSpacing:1,background:"rgba(230,29,37,0.12)",padding:"1px 6px",borderRadius:2}}>OUT</span>}
                      {satOut&&<span style={{fontSize:9,fontWeight:700,color:"#444",letterSpacing:1}}>SAT OUT</span>}
                      {!satOut&&!isAlive&&!outcome&&elimMap[player]&&elimMap[player]>0&&
                        <span style={S.elimBadge}>OUT R{elimMap[player]}</span>}
                    </span>
                  </div>

                  {satOut?(
                    <div style={{paddingTop:2,color:"#2a2a2a",fontSize:11,fontStyle:"italic",letterSpacing:0.5}}>—</div>
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
                        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",minHeight:28,paddingTop:1}}>
                          {pick?(
                            <>
                              <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,letterSpacing:1,color:"#fff",lineHeight:1}}>{pick}</span>
                              <span style={{fontSize:28,lineHeight:1}}>{FLAG[pick]||"🏳️"}</span>
                            </>
                          ):deadlinePassed&&!resolved?(
                            <span style={{color:"#E61D25",fontSize:9,fontWeight:700,letterSpacing:1}}>NO PICK</span>
                          ):(
                            <span style={{color:"#555",fontStyle:"italic",fontSize:11}}>No pick</span>
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
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",minHeight:28,paddingTop:1}}>
                      {pick?(
                        <>
                          <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,letterSpacing:1,color:"#fff",lineHeight:1}}>{pick}</span>
                          <span style={{fontSize:28,lineHeight:1}}>{FLAG[pick]||"🏳️"}</span>
                        </>
                      ):(
                        <span style={{color:"#333",fontStyle:"italic",fontSize:11}}>no pick</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            {state.players.length % 2 !== 0 && (
              <div style={{background:"#0f0f0f",borderBottom:"1px solid #1e1f26"}}/>
            )}
          </div>

          {resolved&&(
            <div style={S.resultBar}>
              {survivors.length} survive{survivors.length>0?` · ${survivors.join(", ")}`:""} · {ousted.length} out
            </div>
          )}

          {wcRound?.hasTiebreaker&&(
            <div style={{padding:"12px 16px",background:"#0b0c10",borderTop:"1px solid #1e1f26"}}>
              <div style={{...S.eyebrow,color:"#E61D25",marginBottom:8}}>
                Tiebreaker — minute of first goal in the Final
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(155px,1fr))",gap:1,background:"#1e1f26"}}>
                {state.players.map(player => {
                  const tbVal = (round.tiebreaker||{})[player] || "";
                  const isAlivePlayer = aliveAtStart.includes(player);
                  if (!isAlivePlayer) return null;
                  return (
                    <div key={player} style={{background:"#13141a",padding:"10px 12px"}}>
                      <div style={{...S.pickPlayerName,marginBottom:6}}>{player}</div>
                      {resolved ? (
                        <div style={{fontSize:12,color:"#888"}}>{tbVal ? `Minute ${tbVal}` : <span style={{color:"#333"}}>no guess</span>}</div>
                      ) : (
                        <LMSTiebreakerInput
                          value={tbVal}
                          takenValues={Object.entries(round.tiebreaker||{}).filter(([op])=>op!==player&&op!=="__answer__").map(([,ov])=>ov).filter(Boolean)}
                          onCommit={v=>setTiebreaker(gi,round.id,player,v)}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
              {isEditing&&(
                <div style={{display:"flex",alignItems:"center",gap:8,marginTop:10}}>
                  <span style={{...S.eyebrow,color:"#555"}}>Correct minute</span>
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
                return <div style={{marginTop:8,fontSize:11,color:"#a8e031",fontWeight:700}}>Tiebreaker won by {tbWinner.join(" & ")} — closest to minute {adminMin}</div>;
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
      <p style={{fontSize:11,color:"#6b7280",marginBottom:10,fontFamily:"'DM Sans',sans-serif"}}>All times BST. Use these to decide which team to pick.</p>
      {game.rounds.map(round=>{
        const wcRound=ROUNDS.find(r=>r.id===round.id);
        if (!wcRound) return null;
        const isOpen=openRound===round.id;
        return (
          <div key={round.id} style={S.fixtureSection}>
            <div style={S.fixtureSectionHeader} onClick={()=>setOpenRound(isOpen?null:round.id)}>
              <div style={{minWidth:0}}>
                <span style={S.roundStage}>{wcRound.stage}</span>
                <span style={S.fixtureSectionTitle}>{wcRound.label}</span>
              </div>
              <div style={{display:"flex",gap:8,alignItems:"center",flexShrink:0}}>
                <span style={S.deadlineBadge}>First KO {wcRound.fixtures?.[0]?.[2]} {wcRound.fixtures?.[0]?.[3]}</span>
                <span style={S.expandChevron}>{isOpen?"▲":"▼"}</span>
              </div>
            </div>
            {isOpen&&(
              <div>
                {wcRound.fixtures.map(([home,away,date,time],i)=>(
                  <div key={i} style={S.fixtureRow}>
                    <span style={S.fixtureDate}><span style={{display:"block"}}>{date}</span><span style={{display:"block"}}>{time}</span></span>
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
  const sorted = [...state.players].sort((a,b)=>tracker[b].net - tracker[a].net);

  return (
    <div>
      <h2 style={S.sectionTitle}>MONEY TRACKER</h2>
      <p style={{fontSize:11,color:"#6b7280",marginBottom:12,fontFamily:"'DM Sans',sans-serif"}}>
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

      <h2 style={{...S.sectionTitle,marginTop:20}}>BY GAME</h2>
      {state.games.map(game=>{
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
              <span style={{fontSize:11,color:game.complete?(game.winners.length>0?"#a8e031":"#f59e0b"):"#6b7280"}}>
                {game.complete?(game.winners.length>0?`${game.winners.join(", ")} won £${Math.floor(pot/game.winners.length)}`:"Rolled over"):"In progress"}
              </span>
            </div>
            <div style={{display:"flex",flexWrap:"wrap",gap:4,padding:"8px 12px"}}>
              {state.players.map(p=>{
                const entered = actualEntrants.includes(p);
                const won = game.complete && game.winners.includes(p);
                return (
                  <span key={p} style={{
                    fontSize:10,padding:"3px 9px",borderRadius:2,letterSpacing:0.3,
                    background: won?"rgba(168,224,49,0.1)":entered?"#1a1b22":"transparent",
                    border: won?"1px solid #a8e031":entered?"1px solid #1e1f26":"1px solid #161616",
                    color: won?"#a8e031":entered?"#9ca3af":"#444",
                  }}>
                    {p}{won?` · £${Math.floor(pot/game.winners.length)}`:entered?` · -£${ENTRY_FEE}`:" · –"}
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

  const cats = ["15pts","Groups","5pts","Tiebreaker"];
  const catLabels = {
    "15pts":"15 points each",
    "Groups":"Group winners — 5 points each",
    "5pts":"5 points each",
    "Tiebreaker":"Tiebreaker"
  };

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
  const maxPts = PREDICTOR_QUESTIONS.reduce((s,q)=>s+q.pts,0);
  const predEntrants = state.players.filter(p => pred.picks[p] && Object.keys(pred.picks[p]).some(id => id !== "tiebreak" && pred.picks[p][id] !== "" && pred.picks[p][id] !== null && pred.picks[p][id] !== undefined));
  const pot = predEntrants.length * PREDICTOR_FEE;

  return (
    <div>
      {/* Header */}
      <div style={S.predHeader}>
        <div>
          <h2 style={{...S.sectionTitle,marginBottom:4}}>TOURNAMENT PREDICTOR</h2>
          <p style={{fontSize:11,color:"#9ca3af",fontFamily:"'DM Sans',sans-serif",margin:0}}>
            £{PREDICTOR_FEE} entry · {predEntrants.length} entered · Pot: <strong style={{color:"#a8e031"}}>£{pot}</strong>
          </p>
        </div>
        <div style={{display:"flex",gap:6,flexShrink:0}}>
          <button onClick={()=>{ if(adminMode){setAdminMode(false);}else{const pin=prompt("Enter admin PIN:");if(pin==="4816")setAdminMode(true);}}}
            style={{...S.editBtn, background: adminMode?"#E61D25":"transparent", color: adminMode?"#fff":"#9ca3af"}}>
            {adminMode ? "Admin on" : "Admin"}
          </button>
          {adminMode&&(
            <button onClick={togglePredictorLock}
              style={{...S.editBtn, color: pred.locked?"#a8e031":"#9ca3af", borderColor: pred.locked?"rgba(168,224,49,0.4)":"#1e1f26"}}>
              {pred.locked ? "Locked" : "Open"}
            </button>
          )}
        </div>
      </div>

      {/* Player selector */}
      {!adminMode&&(
        <div style={{paddingBottom:14,borderBottom:"1px solid #1e1f26",marginBottom:14}}>
          <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
            {pred.locked&&(
              <button onClick={()=>setSelectedPlayer(null)}
                style={{
                  ...S.predPlayerBtn,
                  background: selectedPlayer===null?"#E61D25":"transparent",
                  color: selectedPlayer===null?"#fff":"#555",
                  borderColor: selectedPlayer===null?"#E61D25":"#252525",
                }}>
                OVERVIEW
              </button>
            )}
            {state.players.map(p=>(
              <button key={p} onClick={()=>setSelectedPlayer(p)}
                style={{
                  ...S.predPlayerBtn,
                  background: selectedPlayer===p?"#E61D25":"transparent",
                  color: selectedPlayer===p?"#fff":"#888",
                  borderColor: selectedPlayer===p?"#E61D25":"#252525",
                }}>
                {p.toUpperCase()}
              </button>
            ))}
          </div>
          {pred.locked&&(
            <div style={{display:"flex",alignItems:"center",gap:8,marginTop:10,padding:"9px 12px",background:"#100a0a",border:"1px solid #2a1010",borderRadius:2}}>
              <span style={{fontSize:9,color:"#E61D25",fontWeight:700,letterSpacing:2,textTransform:"uppercase"}}>Locked</span>
              <span style={{fontSize:11,color:"#777",letterSpacing:0.3}}>No more picks accepted</span>
            </div>
          )}
        </div>
      )}

      {/* Overview — shown when locked and no player selected */}
      {!adminMode&&!selectedPlayer&&pred.locked&&(
        <div style={{marginBottom:16}}>
          <div style={{...S.eyebrow,color:"#E61D25",marginBottom:12}}>Everyone&apos;s picks</div>
          {predEntrants.length===0&&<div style={{color:"#444",fontSize:11,padding:"8px 0"}}>No picks submitted yet.</div>}
          {cats.filter(c=>c!=="Tiebreaker").map(cat=>{
            const qs = PREDICTOR_QUESTIONS.filter(q=>q.cat===cat&&q.id!=="tiebreak");
            if(!qs.length) return null;
            return (
              <div key={cat} style={{marginBottom:18}}>
                <div style={S.overviewCatHeader}>{catLabels[cat]}</div>
                {qs.map(q=>(
                  <div key={q.id} style={{marginBottom:12}}>
                    <div style={S.overviewQLabel}>{q.label}</div>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:1,background:"#1a1b22"}}>
                      {predEntrants.map(p=>{
                        const pick = (pred.picks[p]||{})[q.id];
                        if(!pick) return null;
                        const ans = pred.answers[q.id];
                        const overrideVal = (pred.overrides||{})[q.id]?.[p];
                        const sfIds = ["semi1","semi2","semi3","semi4"];
                        const sfAnsList = sfIds.map(id=>pred.answers[id]).filter(Boolean).map(s=>s.toLowerCase().trim());
                        let correct = null;
                        if (overrideVal===true) correct=true;
                        else if (overrideVal===false) correct=false;
                        else if (sfIds.includes(q.id)) { if(ans) correct = sfAnsList.includes((pick||'').toLowerCase().trim()); }
                        else if (ans && pick) {
                          const norm = v=>v.includes('-')?v.split('-').map(Number).sort((a,b)=>a-b).join('-'):v.toLowerCase().trim();
                          correct = norm(ans)===norm(pick);
                        }
                        const borderCol = correct===true?'#a8e031':correct===false?'#E61D25':'transparent';
                        const bgCol = correct===true?'rgba(168,224,49,0.06)':correct===false?'rgba(230,29,37,0.06)':'#13141a';
                        return (
                          <div key={p} style={{background:bgCol,borderLeft:`2px solid ${borderCol}`,padding:'8px 10px',display:'flex',flexDirection:'column',gap:3}}>
                            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                              <span style={S.overviewPlayerName}>{p.toUpperCase()}</span>
                              {correct===true&&<span style={{fontSize:8,color:'#a8e031',fontWeight:700,letterSpacing:1}}>✓</span>}
                              {correct===false&&<span style={{fontSize:8,color:'#E61D25',fontWeight:700,letterSpacing:1}}>✗</span>}
                            </div>
                            <span style={S.overviewPickValue}>{q.type==='nation'?(FLAG[pick]||'🏳️')+' ':''}{pick}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {/* No player selected prompt */}
      {!adminMode&&!selectedPlayer&&!pred.locked&&(
        <div style={{padding:"24px 0",textAlign:"center",color:"#333",fontSize:9,letterSpacing:3,textTransform:"uppercase",fontFamily:"'DM Sans',sans-serif",fontWeight:700}}>
          Select your name above to make your picks
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
                  <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}>
                    {q.pts>0&&<span style={S.predPtsBadge}>{q.pts}pts</span>}
                    <span style={{fontSize:12,color:"#e5e7eb",fontWeight:600,fontFamily:"'DM Sans',sans-serif"}}>{q.label}</span>
                    {isCorrect&&<span style={{color:"#a8e031",fontSize:12}}>✓</span>}
                    {hasAnswer&&playerPick&&!isCorrect&&<span style={{color:"#e53935",fontSize:12}}>✗</span>}
                  </div>

                  {!adminMode&&!pred.locked&&(
                    q.id==="tiebreak"
                      ? <TiebreakerInput
                          key={selectedPlayer}
                          value={playerPick}
                          takenValues={state.players.filter(p=>p!==selectedPlayer).map(p=>(pred.picks[p]||{})[q.id]).filter(Boolean)}
                          onCommit={v=>setPredictorPick(selectedPlayer, q.id, v)}
                        />
                      : <PredictorInput q={q} value={playerPick}
                          onChange={v=>setPredictorPick(selectedPlayer, q.id, v)}/>
                  )}
                  {!adminMode&&pred.locked&&playerPick&&<PredPickResult
                    pick={playerPick} qId={q.id} qType={q.type}
                    answers={pred.answers} overrides={pred.overrides}
                    player={selectedPlayer}
                  />}
                  {adminMode&&(
                    <div style={{marginTop:4}}>
                      {q.type==="freetext" ? (
                        <div style={{display:"flex",flexDirection:"column",gap:4,marginBottom:6}}>
                          {state.players.map(p=>{
                            const pp = (pred.picks[p]||{})[q.id];
                            if (!pp) return null;
                            const ov = (pred.overrides||{})[q.id]?.[p];
                            return (
                              <div key={p} style={{display:"flex",alignItems:"center",gap:8,background:"#1a1b22",borderRadius:3,padding:"5px 10px"}}>
                                <span style={{fontSize:9,fontWeight:700,color:"#888",letterSpacing:2,textTransform:"uppercase",minWidth:60,fontFamily:"'DM Sans',sans-serif"}}>{p}</span>
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
                        <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:6}}>
                          {state.players.map(p=>{
                            const pp = (pred.picks[p]||{})[q.id];
                            if (!pp) return null;
                            return (
                              <span key={p} style={{fontSize:10,color:"#9ca3af",background:"#1a1b22",borderRadius:4,padding:"2px 8px",display:"flex",alignItems:"center",gap:5}}>
                                <strong style={{fontSize:8,color:"#888",letterSpacing:1.5,textTransform:"uppercase",fontFamily:"'DM Sans',sans-serif"}}>{p}</strong>
                                <span style={{color:"#ccc"}}>{pp}</span>
                              </span>
                            );
                          })}
                        </div>
                      )}
                      <PredictorInput q={q} value={correctAnswer}
                        onChange={v=>setPredictorAnswer(q.id, v)}
                        placeholder="Set correct answer…"/>
                    </div>
                  )}
                  {hasAnswer&&<div style={{fontSize:10,color:"#555",marginTop:4}}>Answer: <strong style={{color:"#a8e031",fontWeight:600}}>{correctAnswer}</strong></div>}
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
        <div key={p} style={{...S.lbRow,marginBottom:1,background:"#13141a",padding:"12px 0"}}>
          <span style={S.lbRank}>{i+1}</span>
          <span style={{...S.pickPlayerName,fontSize:11,letterSpacing:2}}>{p.toUpperCase()}</span>
          <span style={{fontSize:10,color:"#444",marginLeft:8}}>{scores[p]}/{maxPts} pts</span>
          <div style={{marginLeft:"auto",background:"#E61D25",borderRadius:2,padding:"3px 12px",fontSize:14,color:"#fff",fontFamily:"'Bebas Neue',sans-serif",letterSpacing:2}}>
            {scores[p]}
          </div>
        </div>
      ))}
      {predEntrants.length===0&&(
        <p style={{fontSize:11,color:"#444",fontStyle:"italic",fontFamily:"'DM Sans',sans-serif",padding:"8px 0"}}>No entries yet — select your name above to start predicting.</p>
      )}
    </div>
  );
}

function PredPickResult({ pick, qId, qType, answers, overrides, player }) {
  const sfIds = ["semi1","semi2","semi3","semi4"];
  const sfAnsList = sfIds.map(id=>answers[id]).filter(Boolean).map(s=>s.toLowerCase().trim());
  const overrideVal = (overrides||{})[qId]?.[player];
  const ans = answers[qId];
  let correct = null;
  if (overrideVal===true) correct=true;
  else if (overrideVal===false) correct=false;
  else if (sfIds.includes(qId)) { if(ans) correct = sfAnsList.includes((pick||"").toLowerCase().trim()); }
  else if (ans && pick) {
    const norm = v=>v.includes("-")?v.split("-").map(Number).sort((a,b)=>a-b).join("-"):v.toLowerCase().trim();
    correct = norm(ans)===norm(pick);
  }
  return (
    <div style={{display:"flex",alignItems:"center",gap:8,fontSize:11,color:"#9ca3af",marginTop:2}}>
      <span style={{color:"#666"}}>Your pick:</span>
      <strong style={{color:"#fff",fontFamily:"'DM Sans',sans-serif"}}>{pick}</strong>
      {correct===true&&<span style={{fontSize:9,fontWeight:700,color:"#a8e031",background:"rgba(168,224,49,0.1)",padding:"1px 7px",borderRadius:2,letterSpacing:1}}>✓ CORRECT</span>}
      {correct===false&&<span style={{fontSize:9,fontWeight:700,color:"#E61D25",background:"rgba(230,29,37,0.1)",padding:"1px 7px",borderRadius:2,letterSpacing:1}}>✗ WRONG</span>}
    </div>
  );
}

function LMSTiebreakerInput({ value, takenValues, onCommit }) {
  const [local, setLocal] = useState(value||"");
  useEffect(()=>{ setLocal(value||""); }, [value]);
  const isTaken = local && takenValues.includes(local) && local !== value;
  return (
    <div style={{display:"flex",alignItems:"center",gap:6}}>
      <input
        type="number" min="1" max="120"
        style={{...{background:"#1a1b22",border:"1px solid",color:"#fff",borderRadius:2,padding:"4px 8px",fontSize:12,outline:"none",fontFamily:"'DM Sans',sans-serif"},width:64,flex:"none",borderColor:isTaken?"#E61D25":"#1e1f26"}}
        placeholder="min"
        value={local}
        onChange={e=>setLocal(e.target.value)}
        onBlur={()=>{
          if (!local) { onCommit(""); return; }
          if (takenValues.includes(local)) { setLocal(value||""); return; }
          onCommit(local);
        }}
      />
      <span style={{fontSize:10,color:isTaken?"#E61D25":"#444"}}>{isTaken?"TAKEN":"min"}</span>
    </div>
  );
}

function TiebreakerInput({ value, takenValues, onCommit }) {
  const [local, setLocal] = useState(value||"");
  useEffect(()=>{ setLocal(value||""); }, [value]);
  const isTaken = local && takenValues.includes(local) && local !== value;
  return (
    <div>
      <input
        type="number"
        style={{width:"100%",background:"#1a1b22",border:"1px solid",borderColor:isTaken?"#E61D25":"#1e1f26",color:"#fff",borderRadius:2,padding:"7px 10px",fontSize:12,outline:"none",fontFamily:"'DM Sans',sans-serif",boxSizing:"border-box"}}
        placeholder="e.g. 168"
        value={local}
        onChange={e=>setLocal(e.target.value)}
        onBlur={()=>{
          if (!local) { onCommit(""); return; }
          if (takenValues.includes(local)) { setLocal(value||""); return; }
          onCommit(local);
        }}
      />
      {isTaken&&<div style={{fontSize:10,color:"#E61D25",fontWeight:700,marginTop:4,letterSpacing:1}}>⚠ TAKEN — PICK A DIFFERENT NUMBER</div>}
    </div>
  );
}

function PredictorInput({ q, value, onChange, placeholder }) {
  if (q.type === "nation") return (
    <select style={{...S.pickSelect,fontSize:11,marginBottom:0}}
      value={value} onChange={e=>onChange(e.target.value)}>
      <option value="">{placeholder||"— select a nation —"}</option>
      {(q.teams||ALL_NATIONS).map(t=><option key={t} value={t}>{FLAG[t]||"🏳️"} {t}</option>)}
    </select>
  );
  if (q.type === "score") {
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
      <span style={{fontSize:12,color:"#e53935"}}>This will wipe all data for everyone.</span>
      <button onClick={async()=>{ await fetch("/api/state", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(null),
    }); window.location.reload(); }}
        style={{...S.removeBtn,padding:"5px 12px",fontWeight:700,color:"#e53935",borderColor:"#e53935"}}>Yes, reset</button>
      <button onClick={()=>setConfirming(false)}
        style={{background:"transparent",border:"1px solid #374151",color:"#9ca3af",borderRadius:4,padding:"5px 10px",cursor:"pointer",fontSize:11}}>
        Cancel
      </button>
    </div>
  ) : (
    <button style={{...S.removeBtn,padding:"8px 16px"}} onClick={()=>setConfirming(true)}>
      Reset all data
    </button>
  );
}

function SettingsTab({ state, update, newPlayerName, setNewPlayerName, addPlayer, removePlayer }) {
  return (
    <div style={S.settings}>
      <h2 style={S.sectionTitle}>SETTINGS</h2>
      <div style={S.infoBox}>
        <strong style={{...S.eyebrow,color:"#E61D25",display:"block",marginBottom:6}}>Live &amp; shared</strong>
        <p style={{margin:0,fontSize:12,color:"#9ca3af",lineHeight:1.5}}>
          Share this URL in your WhatsApp group. All picks and results sync within about five seconds for everyone.
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
  root:{display:"flex",flexDirection:"column",height:"100vh",background:"#0e0f14",color:"#fff",fontFamily:"'DM Sans','Helvetica Neue',sans-serif",overflow:"hidden"},
  loadScreen:{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100vh",background:"#0e0f14"},
  spinner:{width:36,height:36,border:"2px solid #1e1f26",borderTop:"2px solid #E61D25",borderRadius:"50%"},

  header:{background:"#0e0f14",flexShrink:0,zIndex:100,borderBottom:"3px solid #E61D25"},
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
  statDivider:{width:1,height:28,background:"#2a2a2a",margin:"0 16px"},

  gameTabs:{display:"flex",overflowX:"auto",padding:"0 16px",gap:0,background:"#0e0f14",borderBottom:"1px solid #141414"},
  gameTab:{background:"transparent",border:"none",borderBottom:"2px solid transparent",color:"#3a3b45",padding:"9px 12px",cursor:"pointer",fontSize:10,fontFamily:"'DM Sans',sans-serif",whiteSpace:"nowrap",fontWeight:600,letterSpacing:1.5,textTransform:"uppercase"},
  gameTabActive:{color:"#E61D25",borderBottom:"2px solid #E61D25"},

  nav:{display:"flex",background:"#0b0c10",borderBottom:"1px solid #141414"},
  navBtn:{flex:1,padding:"11px 0",background:"transparent",border:"none",color:"#666",fontFamily:"'DM Sans',sans-serif",fontSize:9,letterSpacing:2.5,cursor:"pointer",textTransform:"uppercase",fontWeight:700,borderBottom:"3px solid transparent"},
  navBtnActive:{color:"#fff",borderBottom:"3px solid #E61D25",background:"#0d0d0d"},

  main:{padding:"14px 14px",maxWidth:900,margin:"0 auto",flex:1,overflowY:"auto",WebkitOverflowScrolling:"touch"},

  winnerBanner:{display:"flex",alignItems:"center",gap:18,background:"#E61D25",padding:"18px 20px",marginBottom:14,borderRadius:3},
  rolloverBanner:{background:"#13141a",borderLeft:"3px solid #a8e031",padding:"10px 14px",marginBottom:10,fontSize:10,color:"#a8e031",letterSpacing:2,textTransform:"uppercase",fontWeight:700},

  roundCard:{background:"#13141a",borderRadius:3,marginBottom:10,overflow:"hidden",border:"1px solid #1e1f26"},
  roundCardResolved:{opacity:0.45},
  roundHeader:{display:"flex",alignItems:"flex-start",justifyContent:"space-between",padding:"14px 16px",borderBottom:"1px solid #1e1f26",cursor:"pointer",gap:8},
  roundStage:{fontSize:8,color:"#E61D25",letterSpacing:4,display:"block",marginBottom:5,textTransform:"uppercase",fontWeight:700},
  roundLabel:{margin:0,fontSize:26,fontWeight:400,color:"#fff",fontFamily:"'Bebas Neue',sans-serif",letterSpacing:2},
  roundDeadline:{fontSize:10,color:"#666",marginTop:4,display:"block",letterSpacing:0.5},
  resolvedBadge:{background:"#a8e031",color:"#080808",borderRadius:2,padding:"3px 10px",fontSize:8,fontWeight:700,flexShrink:0,textTransform:"uppercase",letterSpacing:2,alignSelf:"flex-start",fontFamily:"'DM Sans',sans-serif"},
  lockedBadge:{background:"#E61D25",color:"#fff",borderRadius:2,padding:"3px 10px",fontSize:8,fontWeight:700,letterSpacing:2,textTransform:"uppercase",fontFamily:"'DM Sans',sans-serif",flexShrink:0,alignSelf:"flex-start"},
  expandChevron:{color:"#2e2f38",fontSize:10,flexShrink:0,marginTop:6},
  roundNote:{padding:"10px 16px",background:"#0b0c10",fontSize:11,color:"#777",borderBottom:"1px solid #1e1f26",lineHeight:1.5},
  editBtn:{background:"transparent",border:"1px solid #1e1f26",color:"#3a3b45",borderRadius:2,padding:"4px 12px",cursor:"pointer",fontSize:8,letterSpacing:2.5,fontFamily:"'DM Sans',sans-serif",textTransform:"uppercase",fontWeight:700},
  closeRoundBtn:{background:"transparent",border:"1px solid #E61D25",color:"#E61D25",borderRadius:2,padding:"4px 12px",cursor:"pointer",fontSize:8,letterSpacing:2,fontFamily:"'DM Sans',sans-serif",fontWeight:700,textTransform:"uppercase"},

  picksGrid:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:0,background:"#1e1f26"},
  pickCell:{background:"#0f0f0f",padding:"6px 12px 8px"},
  pickCellWin:{background:"#0f0f0f",borderLeft:"3px solid #a8e031"},
  pickCellElim:{background:"#0f0f0f",borderLeft:"3px solid #E61D25"},
  pickCellGhost:{background:"#0f0f0f"},
  pickCellSatOut:{background:"#0f0f0f"},
  pickPlayer:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:7},
  pickPlayerName:{fontSize:9,fontWeight:700,color:"#888",letterSpacing:2,textTransform:"uppercase",marginBottom:1,fontFamily:"'DM Sans',sans-serif"},
  elimBadge:{fontSize:7,background:"#E61D25",color:"#fff",borderRadius:2,padding:"2px 5px",fontWeight:700,letterSpacing:1.5,textTransform:"uppercase"},
  pickSelect:{width:"100%",background:"transparent",border:"1px solid #2a2a2a",color:"#fff",borderRadius:2,padding:"5px 8px",fontSize:14,outline:"none",marginBottom:0,fontFamily:"'Bebas Neue',sans-serif",letterSpacing:1},
  outcomeRow:{display:"flex",gap:4,marginTop:2},
  outcomeBtn:{flex:1,padding:"5px 0",background:"transparent",border:"1px solid #1e1f26",borderRadius:2,cursor:"pointer",fontSize:13,fontWeight:700,letterSpacing:0.5,transition:"all 0.1s",fontFamily:"'DM Sans',sans-serif"},
  resultBar:{padding:"9px 16px",background:"#0b0c10",borderTop:"1px solid #1e1f26",color:"#a8e031",fontSize:9,letterSpacing:3,textTransform:"uppercase",fontWeight:700},

  fixtureSection:{background:"#13141a",border:"1px solid #1e1f26",borderRadius:3,marginBottom:10,overflow:"hidden",width:"100%"},
  fixtureSectionHeader:{display:"flex",alignItems:"flex-start",justifyContent:"space-between",padding:"13px 16px",cursor:"pointer",gap:8,borderBottom:"1px solid #1e1f26"},
  fixtureSectionTitle:{fontSize:22,fontWeight:400,color:"#fff",fontFamily:"'Bebas Neue',sans-serif",letterSpacing:2,display:"block",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",marginTop:1},
  deadlineBadge:{background:"transparent",color:"#E61D25",border:"1px solid #E61D25",borderRadius:2,padding:"3px 8px",fontSize:7,fontWeight:700,flexShrink:0,whiteSpace:"nowrap",letterSpacing:1,textTransform:"uppercase",fontFamily:"'DM Sans',sans-serif"},
  fixtureRow:{display:"grid",gridTemplateColumns:"76px 1fr 14px 1fr",alignItems:"center",gap:6,padding:"8px 14px",borderBottom:"1px solid #111318",boxSizing:"border-box",width:"100%"},
  fixtureDate:{fontSize:10,color:"#666",letterSpacing:0.3},
  fixtureTeam:{fontSize:13,color:"#ccc",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"},
  fixtureVs:{fontSize:9,color:"#333",textAlign:"center",fontWeight:700,letterSpacing:1},

  sectionTitle:{fontSize:26,fontWeight:400,color:"#fff",marginBottom:14,fontFamily:"'Bebas Neue',sans-serif",letterSpacing:3,textTransform:"uppercase",display:"block",borderBottom:"1px solid #1e1f26",paddingBottom:10},

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

  rules:{},
  ruleRow:{display:"flex",gap:14,padding:"12px 0",borderBottom:"1px solid #1a1b22",alignItems:"flex-start"},
  ruleNum:{width:24,height:24,background:"#E61D25",color:"#fff",borderRadius:2,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,flexShrink:0},
  ruleText:{fontSize:12,color:"#666",lineHeight:1.7},

  settings:{},
  infoBox:{background:"#13141a",borderLeft:"3px solid #E61D25",padding:"14px 16px",marginBottom:14},
  settingGroup:{background:"#13141a",border:"1px solid #1e1f26",borderRadius:3,padding:"16px",marginBottom:10},
  settingGroupTitle:{fontSize:9,letterSpacing:3,color:"#E61D25",margin:"0 0 12px",fontFamily:"'DM Sans',sans-serif",textTransform:"uppercase",fontWeight:700},
  playerRow:{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:"1px solid #1a1b22"},
  editInput:{background:"#1a1b22",border:"1px solid #1e1f26",color:"#fff",borderRadius:2,padding:"8px 12px",fontSize:13,outline:"none",flex:1,fontFamily:"'DM Sans',sans-serif"},
  addBtn:{background:"#E61D25",color:"#fff",border:"none",borderRadius:2,padding:"8px 18px",cursor:"pointer",fontWeight:700,letterSpacing:2,fontFamily:"'DM Sans',sans-serif",fontSize:10,textTransform:"uppercase"},
  removeBtn:{background:"transparent",border:"1px solid #1e1f26",color:"#3a3b45",borderRadius:2,padding:"5px 10px",cursor:"pointer",fontSize:11},

  // ── Predictor ─────────────────────────────────────────────────────────────
  // Shared "eyebrow" label — small uppercase letter-spaced caption used app-wide
  eyebrow:{fontSize:9,letterSpacing:3,fontWeight:700,textTransform:"uppercase",fontFamily:"'DM Sans',sans-serif"},
  predHeader:{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:8,marginBottom:16},
  predCatHeader:{fontSize:9,letterSpacing:3,color:"#666",padding:"14px 0 8px",borderBottom:"1px solid #1e1f26",marginBottom:10,fontFamily:"'DM Sans',sans-serif",textTransform:"uppercase",fontWeight:700},
  predRow:{background:"#13141a",borderBottom:"1px solid #1a1b22",padding:"12px 0",borderLeft:"3px solid transparent"},
  predPtsBadge:{background:"#E61D25",color:"#fff",borderRadius:2,padding:"2px 7px",fontSize:8,fontWeight:700,flexShrink:0,letterSpacing:1.5,textTransform:"uppercase",fontFamily:"'DM Sans',sans-serif"},

  // Player selector buttons — match tracker pickPlayerName style
  predPlayerBtn:{padding:"5px 12px",borderRadius:2,border:"1px solid",cursor:"pointer",fontSize:9,fontFamily:"'DM Sans',sans-serif",letterSpacing:2,fontWeight:700,textTransform:"uppercase",transition:"all 0.1s"},

  // Overview cards
  overviewCatHeader:{fontSize:9,letterSpacing:3,color:"#666",fontWeight:700,textTransform:"uppercase",marginBottom:8,paddingBottom:6,borderBottom:"1px solid #1a1b22",fontFamily:"'DM Sans',sans-serif"},
  overviewQLabel:{fontSize:10,color:"#555",marginBottom:1,letterSpacing:0.5,fontFamily:"'DM Sans',sans-serif",paddingBottom:4},
  overviewPlayerName:{fontSize:8,fontWeight:700,color:"#555",letterSpacing:2,textTransform:"uppercase",fontFamily:"'DM Sans',sans-serif"},
  overviewPickValue:{fontSize:16,color:"#fff",fontFamily:"'Bebas Neue',sans-serif",letterSpacing:1,lineHeight:1.1},

  // ── Leaderboard ───────────────────────────────────────────────────────────
  lbRow:{display:"flex",alignItems:"center",gap:12,padding:"14px 0",borderBottom:"1px solid #1a1b22"},
  lbRank:{width:28,fontSize:16,fontWeight:400,color:"#222",textAlign:"center",fontFamily:"'Bebas Neue',sans-serif"},

  toast:{position:"fixed",bottom:24,left:"50%",transform:"translateX(-50%)",background:"#fff",color:"#080808",padding:"10px 24px",borderRadius:2,fontWeight:700,letterSpacing:3,fontSize:10,zIndex:999,boxShadow:"0 8px 40px rgba(0,0,0,0.7)",whiteSpace:"nowrap",textTransform:"uppercase",fontFamily:"'DM Sans',sans-serif"},
};
