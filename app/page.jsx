"use client";
import { useState, useEffect, useCallback, useRef } from "react";

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
};

const ROUNDS = [
  {
    id:1, label:"Group Stage – Matchday 1", stage:"Group Stage",
    deadline:"Wed 11 Jun, 18:00 BST",
    note:"Pick any team playing their first group game. A draw eliminates you. Not picking = sitting this game out (no entry fee).",
    fixtures:[
      ["Mexico","South Africa","Thu 12 Jun","00:00"],["South Korea","Czechia","Thu 12 Jun","21:00"],
      ["Canada","Wales","Fri 13 Jun","00:00"],["Croatia","Scotland","Fri 13 Jun","03:00"],
      ["Brazil","Qatar","Fri 13 Jun","21:00"],["Switzerland","Norway","Sat 14 Jun","00:00"],
      ["Germany","Curaçao","Sat 14 Jun","19:00"],["Ivory Coast","Ecuador","Sat 14 Jun","22:00"],
      ["Netherlands","Japan","Sun 15 Jun","01:00"],["Tunisia","Serbia","Sun 15 Jun","04:00"],
      ["Spain","Cape Verde","Sun 15 Jun","19:00"],["Belgium","Egypt","Sun 15 Jun","22:00"],
      ["Saudi Arabia","Uruguay","Mon 16 Jun","01:00"],["Iran","New Zealand","Mon 16 Jun","04:00"],
      ["France","Senegal","Mon 16 Jun","21:00"],["Argentina","Algeria","Tue 17 Jun","02:00"],
      ["Austria","Jordan","Tue 17 Jun","05:00"],["Portugal","TBD","Tue 17 Jun","19:00"],
      ["England","Croatia","Tue 17 Jun","22:00"],["Ghana","Morocco","Wed 18 Jun","01:00"],
      ["USA","Paraguay","Wed 18 Jun","02:00"],["Colombia","Serbia","Wed 18 Jun","22:00"],
      ["Cameroon","Poland","Thu 19 Jun","01:00"],["Italy","Denmark","Thu 19 Jun","22:00"],
      ["Costa Rica","TBD","Fri 20 Jun","01:00"],
    ],
  },
  {
    id:2, label:"Group Stage – Matchday 2", stage:"Group Stage",
    deadline:"Sat 21 Jun, 10:00 BST",
    note:"Pick any team playing their second group game. A draw eliminates you. Missing this round = auto-eliminated.",
    fixtures:[
      ["South Africa","South Korea","Sat 21 Jun","16:00"],["Czechia","Mexico","Sat 21 Jun","16:00"],
      ["Wales","Croatia","Sat 21 Jun","22:00"],["Scotland","Canada","Sat 21 Jun","22:00"],
      ["Qatar","Switzerland","Sun 22 Jun","16:00"],["Norway","Brazil","Sun 22 Jun","16:00"],
      ["Curaçao","Ivory Coast","Sun 22 Jun","22:00"],["Ecuador","Germany","Sun 22 Jun","22:00"],
      ["Japan","Tunisia","Mon 23 Jun","16:00"],["Serbia","Netherlands","Mon 23 Jun","16:00"],
      ["Cape Verde","Saudi Arabia","Mon 23 Jun","22:00"],["Uruguay","Spain","Mon 23 Jun","22:00"],
      ["New Zealand","Belgium","Tue 24 Jun","16:00"],["Egypt","Iran","Tue 24 Jun","16:00"],
      ["Senegal","Austria","Tue 24 Jun","22:00"],["Jordan","France","Tue 24 Jun","22:00"],
      ["Algeria","Portugal","Wed 25 Jun","16:00"],["TBD","Argentina","Wed 25 Jun","16:00"],
      ["Croatia","England","Wed 25 Jun","22:00"],["Morocco","USA","Wed 25 Jun","22:00"],
      ["Paraguay","Colombia","Thu 26 Jun","16:00"],["Ghana","Cameroon","Thu 26 Jun","16:00"],
      ["Denmark","Costa Rica","Thu 26 Jun","22:00"],["Poland","Italy","Thu 26 Jun","22:00"],
    ],
  },
  {
    id:3, label:"Group Stage – Matchday 3", stage:"Group Stage",
    deadline:"Fri 27 Jun, 19:00 BST",
    note:"Final group games. Simultaneous kick-offs — must WIN, no draws.",
    fixtures:[
      ["Mexico","Czechia","Sat 28 Jun","20:00"],["South Africa","Canada","Sat 28 Jun","20:00"],
      ["South Korea","Croatia","Sat 28 Jun","23:00"],["Wales","Scotland","Sat 28 Jun","23:00"],
      ["Brazil","Switzerland","Sun 29 Jun","20:00"],["Norway","Qatar","Sun 29 Jun","20:00"],
      ["Germany","Japan","Sun 29 Jun","23:00"],["Ivory Coast","Tunisia","Sun 29 Jun","23:00"],
      ["Netherlands","Ecuador","Mon 30 Jun","20:00"],["Serbia","Cape Verde","Mon 30 Jun","20:00"],
      ["Spain","Iran","Mon 30 Jun","23:00"],["Belgium","Saudi Arabia","Mon 30 Jun","23:00"],
      ["Uruguay","New Zealand","Tue 1 Jul","20:00"],["Egypt","Jordan","Tue 1 Jul","20:00"],
      ["France","Algeria","Tue 1 Jul","23:00"],["Senegal","TBD","Tue 1 Jul","23:00"],
      ["Argentina","Austria","Wed 2 Jul","20:00"],["Portugal","TBD","Wed 2 Jul","20:00"],
      ["England","Morocco","Wed 2 Jul","23:00"],["Croatia","Ghana","Wed 2 Jul","23:00"],
      ["USA","Colombia","Thu 3 Jul","20:00"],["Paraguay","Cameroon","Thu 3 Jul","20:00"],
      ["Italy","Costa Rica","Thu 3 Jul","23:00"],["Denmark","Poland","Thu 3 Jul","23:00"],
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
    note:"The World Cup Final at MetLife Stadium, New Jersey.",
    fixtures:[["SF M1 Winner","SF M2 Winner","Sun 27 Jul","20:00"]],
  },
];

const isPlaceholder = t => !t || t.includes("Winner") || t.includes("TBD") || t.includes("Runner") || t.includes("R32") || t.includes("R16") || t.includes("QF") || t.includes("SF");
const realTeams = r => [...new Set(r.fixtures.flatMap(([h,a])=>[h,a]).filter(t=>!isPlaceholder(t)))].sort();

const OUTCOME = { WIN:"win", LOSE:"lose", DRAW:"draw", PENDING:"" };
const STORAGE_KEY = "wc_lms_v6";
const POLL_MS = 5000;
const ENTRY_FEE = 2;

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
    rounds: ROUNDS.slice(startRoundIdx).map(r=>({ id:r.id, label:r.label, stage:r.stage, picks:{}, outcomes:{} })),
    complete:false, winners:[], rollover:0,
  };
}

function defaultState() {
  return { players:["Ben","Tom","James","Tweedie","Kieran","Tucker","Ash"], games:[buildGame(1,0)], lastUpdated:0 };
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
  const elimMap = buildElimMap(g, players);
  const alive = entrants.filter(p => elimMap[p] == null);
  const isFinalRound = lastSettledIdx === g.rounds.length - 1;
  const lastRound = g.rounds[lastSettledIdx];
  const survivors = entrants.filter(p => lastRound.outcomes[p] === OUTCOME.WIN);

  const gameOver = alive.length === 1 || alive.length === 0 || (isFinalRound && survivors.length > 0);
  if (!gameOver) return;

  g.complete = true;
  g.winners = alive.length === 1 ? alive : (isFinalRound && survivors.length > 0 ? survivors : []);
  if (alive.length === 0) g.rolledOver = true;

  const pot = calcPot(g, players);
  const wcIdx = ROUNDS.findIndex(wr => wr.id === lastRound.id);
  const nextWCIdx = Math.min(wcIdx + 1, ROUNDS.length - 1);
  const newGame = buildGame(0, nextWCIdx); // id set by caller
  newGame.rollover = alive.length === 0 ? pot : 0;
  return newGame;
}

function usedTeams(game, player, roundIndex) {
  const s = new Set();
  for (const r of game.rounds.slice(0, roundIndex)) if (r.picks[player]) s.add(r.picks[player]);
  return s;
}

// ─── Money tracker: compute P&L per player across all games ──────────────────
function computeMoneyTracker(state) {
  const tracker = {};
  for (const p of state.players) tracker[p] = { spent:0, won:0, games:[] };

  for (const game of state.games) {
    const entrants = gameEntrants(game, state.players);
    const pot = calcPot(game, state.players);

    for (const p of state.players) {
      const entered = entrants.includes(p);
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

  for (const p of state.players) {
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

  const addPlayer = () => {
    const name = newPlayerName.trim();
    if (!name||state.players.includes(name)) return;
    update(s=>{ s.players.push(name); });
    setNewPlayerName(""); showToast(`${name} added`);
  };
  const removePlayer = (name) => update(s=>{
    s.players=s.players.filter(p=>p!==name);
    s.games.forEach(g=>g.rounds.forEach(r=>{ delete r.picks[name]; delete r.outcomes[name]; }));
  });

  if (loading) return (
    <div style={S.loadScreen}><div style={S.spinner}/>
      <p style={{color:"#c9a84c",marginTop:16,fontFamily:"'Oswald',sans-serif",letterSpacing:4}}>LOADING…</p>
    </div>
  );

  const game = state.games[activeGameIdx]||state.games[state.games.length-1];
  const gi = state.games.indexOf(game);
  const elimMap = buildElimMap(game, state.players);
  const entrants = gameEntrants(game, state.players);
  const aliveNow = entrants.filter(p=>elimMap[p]==null);
  const pot = calcPot(game, state.players);
  const syncLabel = syncing?"saving…":lastSync?`synced ${Math.round((Date.now()-lastSync)/1000)}s ago`:"";

  // Show played rounds (collapsed by default) on complete games; all rounds while in progress
  const lastResolvedIdx = game.rounds.reduce((acc,r,i)=>roundResolved(r)?i:acc, -1);
  const trackerRounds = game.complete
    ? game.rounds.slice(0, lastResolvedIdx + 1)
    : game.rounds;

  return (
    <div style={S.root}>
      <header style={S.header}>
        <div style={S.headerInner}>
          <div style={S.trophy}>🏆</div>
          <div style={{flex:1,minWidth:0}}>
            <h1 style={S.title}>LAST MAN STANDING</h1>
            <p style={S.subtitle}>
              World Cup 2026 · £{ENTRY_FEE}/game · Pot: <strong style={{color:"#c9a84c"}}>£{pot}</strong>
              {"  "}<span style={{color:syncing?"#f59e0b":"#4ade80",fontSize:10}}>● {syncLabel}</span>
            </p>
          </div>
          <div style={S.aliveCount}>
            <span style={S.aliveNum}>{game.complete?"🏆":aliveNow.length}</span>
            <span style={S.aliveLabel}>{game.complete?"DONE":"ALIVE"}</span>
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
          {["tracker","fixtures","money","rules","settings"].map(t=>(
            <button key={t} onClick={()=>setTab(t)}
              style={{...S.navBtn,...(tab===t?S.navBtnActive:{})}}>
              {t==="money"?"MONEY":t.toUpperCase()}
            </button>
          ))}
        </nav>
      </header>

      <main style={S.main}>
        {game.complete&&game.winners.length>0&&(
          <div style={S.winnerBanner}>
            <div style={{fontSize:36}}>🏆</div>
            <div>
              <div style={{fontSize:10,letterSpacing:3,color:"#c9a84c"}}>GAME OVER</div>
              <div style={{fontSize:20,fontWeight:900,color:"#fff"}}>{game.winners.join(" & ")} WIN!</div>
              <div style={{fontSize:12,color:"#c9a84c",marginTop:2}}>
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

        {tab==="tracker"&&(
          <TrackerTab rounds={trackerRounds} game={game} gi={gi} state={state}
            elimMap={elimMap} entrants={entrants} setPick={setPick} setOutcome={setOutcome}
            closeRound={closeRound}
            editingRound={editingRound} setEditingRound={setEditingRound} update={update}/>
        )}
        {tab==="fixtures"&&<FixturesTab game={game}/>}
        {tab==="money"&&<MoneyTab state={state}/>}
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
function TrackerTab({ rounds, game, gi, state, elimMap, entrants, setPick, setOutcome, closeRound, editingRound, setEditingRound, update }) {
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
            setPick={setPick} setOutcome={setOutcome} closeRound={closeRound} isFirstRound={isFirstRound}
            isEditing={editingRound===`${gi}-${round.id}`}
            setEditing={v=>setEditingRound(v?`${gi}-${round.id}`:null)}
            update={update} roundIndex={realRoundIdx}/>
        );
      })}
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

function RoundCard({ round, wcRound, game, gi, state, aliveAtStart, elimMap, entrants, setPick, setOutcome, closeRound, isFirstRound, isEditing, setEditing, update, roundIndex }) {
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

  return (
    <div style={{...S.roundCard,...(resolved?S.roundCardResolved:{})}}>
      <div style={S.roundHeader} onClick={()=>setExpanded(e=>!e)}>
        <div style={{flex:1,minWidth:0}}>
          <span style={S.roundStage}>{round.stage}</span>
          <h2 style={S.roundLabel}>{round.label}</h2>
          {wcRound&&<span style={S.roundDeadline}>⏰ Deadline: {wcRound.deadline}</span>}
        </div>
        <div style={{display:"flex",gap:5,alignItems:"center",flexShrink:0}}>
          {resolved
            ?<span style={S.resolvedBadge}>✓ {survivors.length} survive</span>
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

          <div style={S.picksGrid}>
            {state.players.map(player=>{
              const entered = entrants.includes(player);
              const satOut = !entered && resolved; // sat out round 1
              const isAlive = aliveAtStart.includes(player);
              const pick = round.picks[player];
              const outcome = round.outcomes[player];
              const used = usedTeams(game, player, roundIndex);
              const availTeams = wcRound ? realTeams(wcRound) : [];

              let cellStyle = {...S.pickCell};
              if (satOut) cellStyle={...cellStyle,...S.pickCellSatOut};
              else if (!isAlive) cellStyle={...cellStyle,...S.pickCellGhost};
              else if (outcome===OUTCOME.WIN) cellStyle={...cellStyle,...S.pickCellWin};
              else if (outcome===OUTCOME.LOSE||outcome===OUTCOME.DRAW) cellStyle={...cellStyle,...S.pickCellElim};

              return (
                <div key={player} style={cellStyle}>
                  <div style={S.pickPlayer}>
                    <span style={S.pickPlayerName}>{player}</span>
                    {satOut&&<span style={{...S.elimBadge,background:"#1e3a2f",color:"#6ee7b7"}}>OUT</span>}
                    {!satOut&&!isAlive&&elimMap[player]&&elimMap[player]>0&&
                      <span style={S.elimBadge}>OUT R{elimMap[player]}</span>}
                  </div>

                  {satOut?(
                    <div style={S.pickDisplay}><span style={{color:"#3d6b56",fontStyle:"italic"}}>sat out</span></div>
                  ):isAlive?(
                    <>
                      {!resolved?(
                        <select style={S.pickSelect} value={pick||""}
                          onChange={e=>setPick(gi,round.id,player,e.target.value)}>
                          <option value="">{isFirstRound?"— pick to enter / leave blank to sit out —":"— pick a team —"}</option>
                          {availTeams.map(t=>{
                            const wasUsed=used.has(t);
                            return <option key={t} value={t} disabled={wasUsed}>{FLAG[t]||"🏳️"} {t}{wasUsed?" ✗":""}</option>;
                          })}
                        </select>
                      ):(
                        <div style={S.pickDisplay}>
                          {pick?<>{FLAG[pick]||"🏳️"} <strong>{pick}</strong></>:<span style={{color:"#555",fontStyle:"italic"}}>No pick</span>}
                        </div>
                      )}
                      {pick&&(
                        <div style={S.outcomeRow}>
                          {[{val:OUTCOME.WIN,label:"W",color:"#4caf50"},{val:OUTCOME.DRAW,label:"D",color:"#f59e0b"},{val:OUTCOME.LOSE,label:"L",color:"#e53935"}].map(({val,label,color})=>(
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
                Paid: £{t.spent} · Won: £{t.won}
                {" · "}
                {t.games.map(g=>(
                  <span key={g.gameId} style={{marginRight:6,fontSize:9,color:"#6b7280"}}>
                    {g.gameLabel}: {g.entered?(g.winnings>0?`-£${g.cost}+£${g.winnings}`:`-£${g.cost}`):"sat out"}
                  </span>
                ))}
              </div>
            </div>
            <div style={{...S.moneyNet,...(isUp?{color:"#4caf50"}:isEven?{color:"#9ca3af"}:{color:"#e53935"})}}>
              {isUp?"+":""}{net < 0 ? `-£${Math.abs(net)}` : `£${net}`}
            </div>
          </div>
        );
      })}

      {/* Running totals per game */}
      <h2 style={{...S.sectionTitle,marginTop:20}}>BY GAME</h2>
      {state.games.map(game=>{
        const entrants = gameEntrants(game, state.players);
        const pot = calcPot(game, state.players);
        return (
          <div key={game.id} style={S.moneyGameBlock}>
            <div style={S.moneyGameHeader}>
              <span style={{fontWeight:700,color:"#fff",fontSize:13}}>{game.label}</span>
              <span style={{fontSize:11,color:"#888"}}>
                {entrants.length} entered · Pot: <strong style={{color:"#c9a84c"}}>£{pot}</strong>
                {game.rollover>0&&<span style={{color:"#f59e0b"}}> (incl. £{game.rollover} rollover)</span>}
              </span>
              <span style={{fontSize:11,color:game.complete?(game.winners.length>0?"#4caf50":"#f59e0b"):"#6b7280"}}>
                {game.complete?(game.winners.length>0?`🏆 ${game.winners.join(", ")} won £${Math.floor(pot/game.winners.length)}`:"🔁 Rollover"):"In progress"}
              </span>
            </div>
            <div style={{display:"flex",flexWrap:"wrap",gap:4,padding:"8px 12px"}}>
              {state.players.map(p=>{
                const entered = entrants.includes(p);
                const won = game.complete && game.winners.includes(p);
                const data = tracker[p].games.find(g=>g.gameId===game.id);
                return (
                  <span key={p} style={{
                    fontSize:10,padding:"3px 8px",borderRadius:12,
                    background: won?"rgba(201,168,76,0.2)":entered?"rgba(76,175,80,0.1)":"rgba(100,100,100,0.1)",
                    border: won?"1px solid rgba(201,168,76,0.5)":entered?"1px solid rgba(76,175,80,0.2)":"1px solid #222",
                    color: won?"#c9a84c":entered?"#9ca3af":"#444",
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
  root:{minHeight:"100vh",background:"#0a0a0f",backgroundImage:"radial-gradient(ellipse at top,#1a1a2e 0%,#0a0a0f 60%)",color:"#ddd",fontFamily:"'Barlow Condensed','Oswald',sans-serif"},
  loadScreen:{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100vh",background:"#0a0a0f"},
  spinner:{width:40,height:40,border:"3px solid #333",borderTop:"3px solid #c9a84c",borderRadius:"50%"},
  header:{background:"linear-gradient(135deg,#1a1a2e 0%,#16213e 100%)",borderBottom:"2px solid #c9a84c",position:"sticky",top:0,zIndex:100},
  headerInner:{display:"flex",alignItems:"center",gap:10,padding:"10px 14px"},
  trophy:{fontSize:28},
  title:{margin:0,fontSize:17,fontWeight:800,letterSpacing:3,color:"#fff",fontFamily:"'Oswald',sans-serif",lineHeight:1.1},
  subtitle:{margin:"2px 0 0",fontSize:10,color:"#999",fontFamily:"sans-serif"},
  aliveCount:{marginLeft:"auto",textAlign:"center",background:"#c9a84c",color:"#0a0a0f",borderRadius:8,padding:"3px 10px",minWidth:46,flexShrink:0},
  aliveNum:{display:"block",fontSize:20,fontWeight:900,lineHeight:1},
  aliveLabel:{fontSize:8,fontWeight:700,letterSpacing:2},
  gameTabs:{display:"flex",overflowX:"auto",padding:"4px 8px",gap:5,borderBottom:"1px solid #1f2937"},
  gameTab:{background:"transparent",border:"1px solid #374151",color:"#888",borderRadius:5,padding:"3px 9px",cursor:"pointer",fontSize:10,fontFamily:"'Oswald',sans-serif",whiteSpace:"nowrap"},
  gameTabActive:{background:"rgba(201,168,76,0.15)",border:"1px solid #c9a84c",color:"#c9a84c"},
  nav:{display:"flex",borderTop:"1px solid #222"},
  navBtn:{flex:1,padding:"8px 0",background:"transparent",border:"none",color:"#888",fontFamily:"'Oswald',sans-serif",fontSize:10,letterSpacing:1,cursor:"pointer"},
  navBtnActive:{color:"#c9a84c",borderBottom:"2px solid #c9a84c",background:"rgba(201,168,76,0.08)"},
  main:{padding:"10px",maxWidth:900,margin:"0 auto"},
  winnerBanner:{display:"flex",alignItems:"center",gap:14,background:"linear-gradient(135deg,#1a1a00,#2a1e00)",border:"2px solid #c9a84c",borderRadius:12,padding:"14px",marginBottom:12},
  rolloverBanner:{background:"rgba(245,158,11,0.1)",border:"1px solid rgba(245,158,11,0.3)",borderRadius:8,padding:"8px 12px",marginBottom:10,fontSize:12,color:"#f59e0b"},
  roundCard:{background:"#111827",border:"1px solid #1f2937",borderRadius:12,marginBottom:10,overflow:"hidden"},
  roundCardResolved:{opacity:0.72},
  roundHeader:{display:"flex",alignItems:"flex-start",justifyContent:"space-between",padding:"10px 12px",borderBottom:"1px solid #1f2937",background:"linear-gradient(90deg,#111827,#0f172a)",cursor:"pointer",gap:8},
  roundStage:{fontSize:8,color:"#c9a84c",letterSpacing:3,display:"block",marginBottom:1},
  roundLabel:{margin:0,fontSize:14,fontWeight:700,color:"#fff",letterSpacing:1},
  roundDeadline:{fontSize:10,color:"#888",marginTop:2,display:"block"},
  resolvedBadge:{background:"rgba(76,175,80,0.15)",color:"#4caf50",border:"1px solid rgba(76,175,80,0.3)",borderRadius:4,padding:"2px 6px",fontSize:9,fontWeight:700,flexShrink:0},
  expandChevron:{color:"#6b7280",fontSize:11,flexShrink:0},
  roundNote:{padding:"6px 12px",background:"#0d1117",fontSize:11,color:"#6b7280",fontStyle:"italic",borderBottom:"1px solid #1f2937"},
  editBtn:{background:"transparent",border:"1px solid #374151",color:"#9ca3af",borderRadius:4,padding:"2px 8px",cursor:"pointer",fontSize:9,letterSpacing:1,fontFamily:"'Oswald',sans-serif"},
  closeRoundBtn:{background:"rgba(229,57,53,0.12)",border:"1px solid rgba(229,57,53,0.4)",color:"#e53935",borderRadius:4,padding:"4px 10px",cursor:"pointer",fontSize:10,letterSpacing:1,fontFamily:"'Oswald',sans-serif",fontWeight:700},
  picksGrid:{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:1,background:"#1f2937"},
  pickCell:{background:"#111827",padding:"8px 10px"},
  pickCellWin:{background:"#071a0e",borderLeft:"3px solid #4caf50"},
  pickCellElim:{background:"#1a0808",borderLeft:"3px solid #e53935"},
  pickCellGhost:{opacity:0.3,background:"#0d1117"},
  pickCellSatOut:{opacity:0.35,background:"#0a0f0a"},
  pickPlayer:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4},
  pickPlayerName:{fontSize:11,fontWeight:700,color:"#e5e7eb",letterSpacing:1},
  elimBadge:{fontSize:8,background:"#7f1d1d",color:"#fca5a5",borderRadius:3,padding:"1px 3px"},
  pickSelect:{width:"100%",background:"#1f2937",border:"1px solid #374151",color:"#ddd",borderRadius:4,padding:"3px 4px",fontSize:10,outline:"none",marginBottom:3},
  pickDisplay:{fontSize:11,color:"#d1d5db",marginBottom:3,minHeight:16},
  outcomeRow:{display:"flex",gap:3},
  outcomeBtn:{flex:1,padding:"3px 0",background:"transparent",border:"1px solid #374151",borderRadius:4,cursor:"pointer",fontSize:11,fontWeight:700,fontFamily:"'Oswald',sans-serif",letterSpacing:1,transition:"all 0.12s"},
  resultBar:{padding:"6px 12px",background:"rgba(201,168,76,0.07)",borderTop:"1px solid rgba(201,168,76,0.15)",color:"#c9a84c",fontSize:10,letterSpacing:1},
  fixtureSection:{background:"#111827",border:"1px solid #1f2937",borderRadius:10,marginBottom:8,overflow:"hidden"},
  fixtureSectionHeader:{display:"flex",alignItems:"flex-start",justifyContent:"space-between",padding:"10px 12px",cursor:"pointer",gap:8,background:"linear-gradient(90deg,#111827,#0f172a)"},
  fixtureSectionTitle:{fontSize:13,fontWeight:700,color:"#fff",letterSpacing:1,display:"block",marginTop:1},
  fixtureNote:{padding:"6px 12px",background:"#0d1117",fontSize:11,color:"#6b7280",fontStyle:"italic",borderBottom:"1px solid #1f2937"},
  deadlineBadge:{background:"rgba(201,168,76,0.12)",color:"#c9a84c",border:"1px solid rgba(201,168,76,0.25)",borderRadius:4,padding:"2px 6px",fontSize:9,fontWeight:700,flexShrink:0,whiteSpace:"nowrap"},
  fixtureRow:{display:"flex",alignItems:"center",gap:6,padding:"5px 12px",borderBottom:"1px solid #0d1117"},
  fixtureDate:{fontSize:9,color:"#6b7280",minWidth:72,flexShrink:0,fontFamily:"sans-serif"},
  fixtureTeam:{fontSize:11,color:"#d1d5db",flex:1,minWidth:0},
  fixtureVs:{fontSize:10,color:"#374151",flexShrink:0,padding:"0 2px"},
  // Money
  sectionTitle:{fontSize:16,letterSpacing:4,color:"#c9a84c",marginBottom:10,fontFamily:"'Oswald',sans-serif",borderBottom:"1px solid #1f2937",paddingBottom:7},
  moneyRow:{display:"flex",alignItems:"center",gap:10,padding:"11px 14px",borderRadius:10,marginBottom:5},
  moneyRowUp:{background:"#071a0e",border:"1px solid rgba(76,175,80,0.25)"},
  moneyRowEven:{background:"#111827",border:"1px solid #1f2937"},
  moneyRowDown:{background:"#150808",border:"1px solid rgba(229,57,53,0.2)"},
  moneyRank:{width:20,fontSize:14,fontWeight:900,color:"#374151",textAlign:"center",flexShrink:0},
  moneyName:{fontSize:14,fontWeight:700,color:"#e5e7eb",marginBottom:3},
  moneyBreakdown:{fontSize:10,color:"#6b7280",lineHeight:1.4},
  moneyNet:{fontSize:22,fontWeight:900,fontFamily:"'Oswald',sans-serif",flexShrink:0,minWidth:52,textAlign:"right"},
  moneyGameBlock:{background:"#111827",border:"1px solid #1f2937",borderRadius:10,marginBottom:8,overflow:"hidden"},
  moneyGameHeader:{padding:"10px 12px",borderBottom:"1px solid #1f2937",display:"flex",flexDirection:"column",gap:3},
  // Rules
  rules:{},
  ruleRow:{display:"flex",gap:10,padding:"9px 0",borderBottom:"1px solid #1a1a1a",alignItems:"flex-start"},
  ruleNum:{width:22,height:22,background:"#c9a84c",color:"#0a0a0f",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:900,flexShrink:0},
  ruleText:{fontSize:12,color:"#d1d5db",lineHeight:1.5,paddingTop:1},
  // Settings
  settings:{},
  infoBox:{background:"rgba(201,168,76,0.07)",border:"1px solid rgba(201,168,76,0.25)",borderRadius:8,padding:"12px",marginBottom:12},
  settingGroup:{background:"#111827",border:"1px solid #1f2937",borderRadius:10,padding:"12px",marginBottom:10},
  settingGroupTitle:{fontSize:11,letterSpacing:2,color:"#c9a84c",margin:"0 0 9px",fontFamily:"'Oswald',sans-serif"},
  playerRow:{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:"1px solid #1a1a1a"},
  editInput:{background:"#1f2937",border:"1px solid #374151",color:"#ddd",borderRadius:5,padding:"5px 8px",fontSize:12,outline:"none",flex:1},
  addBtn:{background:"#c9a84c",color:"#0a0a0f",border:"none",borderRadius:5,padding:"5px 12px",cursor:"pointer",fontWeight:700,letterSpacing:1,fontFamily:"'Oswald',sans-serif"},
  removeBtn:{background:"transparent",border:"1px solid #7f1d1d",color:"#e53935",borderRadius:4,padding:"3px 6px",cursor:"pointer",fontSize:11},
  toast:{position:"fixed",bottom:20,left:"50%",transform:"translateX(-50%)",background:"#c9a84c",color:"#0a0a0f",padding:"8px 20px",borderRadius:20,fontWeight:700,letterSpacing:1,fontSize:12,zIndex:999,boxShadow:"0 4px 20px rgba(201,168,76,0.4)",whiteSpace:"nowrap"},
};
