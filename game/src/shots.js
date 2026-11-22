// The four screenshot scenes, each a real position reached through the real
// rules from a fixed seed, never a mock render. ?shot=title shows the title,
// ?shot=table a mid-duel reveal, ?shot=win the win screen and ?shot=loss the
// loss screen. The same seed always stages the same frame.
import { cardCost } from './config.js';
import { discardCard, drawUpHands, endReveal, newGame, playCard, startDuel } from './state.js';

let stagedId = 9000;

function stagedCard(suit, power, name, keyword = null) {
  const card = { id: stagedId, suit, power, name, keyword, cost: cardCost(power) };
  stagedId += 1;
  return card;
}

// The player's autopilot for the table scene: the strongest affordable card,
// favouring a suit edge over Rook's last played suit. When `holdReveal` is
// set the round stays on the reveal, so both played cards are showing.
function autopilotPlay(state, holdReveal = false) {
  const affordable = state.playerHand.filter((card) => card.cost <= state.playerTide);
  if (affordable.length === 0) {
    const weakest = [...state.playerHand].sort((a, b) => a.power - b.power)[0];
    discardCard(state, weakest);
    return;
  }
  let best = affordable[0];
  let bestScore = best.power;
  for (const card of affordable) {
    let score = card.power;
    if (state.rivalPlayed && card.suit === 'ember' && state.rivalPlayed.suit === 'thorn') score += 2;
    if (score > bestScore) {
      best = card;
      bestScore = score;
    }
  }
  playCard(state, best);
  if (!holdReveal) endReveal(state);
}

function stageTable(state) {
  startDuel(state);
  for (let round = 0; round < 4 && state.screen === 'play'; round += 1) {
    autopilotPlay(state);
  }
  if (state.screen === 'play') {
    autopilotPlay(state, true);
    // Leave the last round on the reveal, so both played cards are showing,
    // and refill the hands so the table shows a full hand beside them.
    drawUpHands(state);
  }
  return state.screen;
}

function stageWin(state) {
  startDuel(state);
  state.playerLife = 16;
  state.rivalLife = 1;
  state.round = 7;
  state.playerTide = 5;
  state.rivalTide = 1;
  state.playerRounds = 4;
  state.rivalRounds = 2;
  state.playerHand = [
    stagedCard('ember', 6, 'Inferno Wyrm', 'echo'),
    stagedCard('tide', 5, 'Storm Eel', 'surge'),
    stagedCard('thorn', 4, 'Ivy Owl'),
    stagedCard('stone', 2, 'Flint Mole'),
    stagedCard('tide', 1, 'Dew Minnow'),
  ];
  state.rivalHand = [
    stagedCard('tide', 1, 'Dew Minnow'),
    stagedCard('thorn', 1, 'Seed Mouse'),
    stagedCard('stone', 2, 'Flint Mole'),
    stagedCard('ember', 3, 'Coal Sprite'),
  ];
  playCard(state, state.playerHand[0]);
  endReveal(state);
  return state.screen;
}

function stageLoss(state) {
  startDuel(state);
  state.playerLife = 3;
  state.rivalLife = 15;
  state.round = 8;
  state.playerTide = 2;
  state.rivalTide = 5;
  state.playerRounds = 2;
  state.rivalRounds = 5;
  state.playerHand = [
    stagedCard('stone', 1, 'Pebble Crab'),
    stagedCard('tide', 1, 'Dew Minnow'),
    stagedCard('thorn', 2, 'Sprout Hare'),
    stagedCard('ember', 2, 'Spark Fox'),
  ];
  state.rivalHand = [
    stagedCard('ember', 6, 'Inferno Wyrm', 'echo'),
    stagedCard('stone', 6, 'Mountain Titan', 'echo'),
    stagedCard('tide', 5, 'Storm Eel', 'surge'),
    stagedCard('thorn', 4, 'Ivy Owl'),
  ];
  playCard(state, state.playerHand[0]);
  endReveal(state);
  return state.screen;
}

// Set `state` to the named scene and return the screen to draw.
export function stageShot(name, state) {
  if (name === 'table') return stageTable(state);
  if (name === 'win') return stageWin(state);
  if (name === 'loss') return stageLoss(state);
  return 'title';
}

export function freshStateForShot(name, seed) {
  const state = newGame(seed);
  stageShot(name, state);
  return state;
}
