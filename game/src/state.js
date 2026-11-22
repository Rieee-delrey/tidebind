// The duel itself: life, Tide, hands, rounds and the screen the player is on.
// Every change to the duel goes through here, so the renderer only ever draws
// state, and the screenshot staging can build any legal position by calling
// the same functions a real player would.
import {
  DISCARD_TIDE,
  HAND_SIZE,
  MAX_TIDE,
  START_LIFE,
  START_TIDE,
  TIDE_PER_ROUND,
} from './config.js';
import { buildDeck, dealHands, drawCard } from './deck.js';
import { resolveRound } from './rules.js';
import { rivalChoose, rivalPlayLine } from './ai.js';
import { makeRandom } from './random.js';

export function newGame(seed) {
  const random = makeRandom(seed);
  const state = {
    seed,
    random,
    screen: 'title',
    phase: 'choose',
    round: 1,
    playerLife: START_LIFE,
    rivalLife: START_LIFE,
    playerTide: START_TIDE,
    rivalTide: START_TIDE,
    playerRounds: 0,
    rivalRounds: 0,
    playerHand: [],
    rivalHand: [],
    drawPile: [],
    discardPile: [],
    playerPlayed: null,
    rivalPlayed: null,
    lastPlayerSuit: null,
    lastRivalSuit: null,
    lastResult: null,
    log: 'Welcome to Tidebind. Play a card to open the duel.',
    discardMode: false,
    over: false,
  };
  state.drawPile = buildDeck(random);
  dealHands(state);
  return state;
}

export function startDuel(state) {
  state.screen = 'play';
  state.phase = 'choose';
  state.log = 'Round 1 — play a card, or discard one for +2 Tide.';
}

// A card may be played only while choosing, and only when its cost fits the
// player's Tide. Returns true when the card left the hand.
export function canPlayCard(state, card) {
  return state.screen === 'play' && state.phase === 'choose' && card.cost <= state.playerTide;
}

export function playCard(state, card) {
  if (!canPlayCard(state, card)) return false;
  state.playerHand = state.playerHand.filter((held) => held.id !== card.id);
  state.playerTide -= card.cost;
  state.playerPlayed = card;
  resolveTurn(state);
  return true;
}

// Discarding banks Tide instead of playing: the card leaves the hand, +2 Tide,
// and Rook takes his turn alone (his card still stands, unopposed).
export function discardCard(state, card) {
  if (state.screen !== 'play' || state.phase !== 'choose') return false;
  state.playerHand = state.playerHand.filter((held) => held.id !== card.id);
  state.discardPile.push(card);
  state.playerTide = Math.min(MAX_TIDE, state.playerTide + DISCARD_TIDE);
  state.playerPlayed = null;
  state.log = `${card.name} discarded — +${DISCARD_TIDE} Tide. Rook takes the round unopposed.`;
  rivalSoloTurn(state);
  return true;
}

function drawUp(state) {
  while (state.playerHand.length < HAND_SIZE) {
    const card = drawCard(state);
    if (!card) break;
    state.playerHand.push(card);
  }
  while (state.rivalHand.length < HAND_SIZE) {
    const card = drawCard(state);
    if (!card) break;
    state.rivalHand.push(card);
  }
}

// Refill both hands to five without advancing the round: the screenshot
// staging uses it so the table shot shows a full hand beside the played cards.
export function drawUpHands(state) {
  drawUp(state);
}

function nextRound(state) {
  state.round += 1;
  state.playerTide = Math.min(MAX_TIDE, state.playerTide + TIDE_PER_ROUND);
  state.rivalTide = Math.min(MAX_TIDE, state.rivalTide + TIDE_PER_ROUND);
  state.phase = 'choose';
  state.playerPlayed = null;
  state.rivalPlayed = null;
  state.lastResult = null;
  drawUp(state);
  if (!state.over) state.log = `Round ${state.round} — play a card, or discard one for +2 Tide.`;
}

function finishTurn(state) {
  if (state.playerLife <= 0 || state.rivalLife <= 0) {
    state.over = true;
    state.screen = state.rivalLife <= 0 ? 'win' : 'loss';
    state.phase = 'over';
    return;
  }
  nextRound(state);
}

// Rook plays while the player discarded: his card wins the trick unopposed
// and deals its power in damage.
function rivalSoloTurn(state) {
  const move = rivalChoose(state);
  state.rivalHand = state.rivalHand.filter((held) => held.id !== move.card.id);
  if (move.kind === 'discard') {
    state.discardPile.push(move.card);
    state.rivalTide = Math.min(MAX_TIDE, state.rivalTide + DISCARD_TIDE);
    state.rivalPlayed = null;
    state.log = `Rook discards too and banks Tide. No damage either way.`;
    finishTurn(state);
    return;
  }
  state.rivalTide -= move.card.cost;
  state.rivalPlayed = move.card;
  state.lastRivalSuit = move.card.suit;
  state.playerLife -= Math.max(1, move.card.power);
  state.rivalRounds += 1;
  state.log = `${rivalPlayLine(move.card, state.lastPlayerSuit, state.rivalTide)} Unopposed — ${Math.max(1, move.card.power)} damage.`;
  state.discardPile.push(move.card);
  finishTurn(state);
}

// The full turn: Rook chooses against the player's PREVIOUS round's suit,
// then the player's current suit becomes the one Rook reads next round. Both
// cards are revealed, the round is settled, Echo cards return to the loser's
// hand, and the duel advances.
function resolveTurn(state) {
  const prevPlayerSuit = state.lastPlayerSuit;
  const move = rivalChoose(state);
  state.lastPlayerSuit = state.playerPlayed.suit;
  state.rivalHand = state.rivalHand.filter((held) => held.id !== move.card.id);
  if (move.kind === 'discard') {
    state.discardPile.push(move.card);
    state.rivalTide = Math.min(MAX_TIDE, state.rivalTide + DISCARD_TIDE);
    state.rivalPlayed = null;
    const unopposed = Math.max(1, state.playerPlayed.power);
    state.rivalLife -= unopposed;
    state.playerRounds += 1;
    state.lastResult = { winner: 'player', damage: unopposed, playerPower: state.playerPlayed.power, rivalPower: 0 };
    state.log = `Rook discards ${move.card.name} and banks Tide — your ${state.playerPlayed.name} takes the round unopposed for ${unopposed} damage.`;
    state.discardPile.push(state.playerPlayed);
    finishTurn(state);
    return;
  }
  state.rivalTide -= move.card.cost;
  state.rivalPlayed = move.card;
  state.lastRivalSuit = move.card.suit;
  const result = resolveRound(state.playerPlayed, move.card, state.playerTide, state.rivalTide);
  state.lastResult = result;
  if (result.winner === 'player') {
    state.rivalLife -= result.damage;
    state.playerRounds += 1;
    state.playerTide = Math.min(MAX_TIDE, state.playerTide + 1);
  } else if (result.winner === 'rival') {
    state.playerLife -= result.damage;
    state.rivalRounds += 1;
    state.rivalTide = Math.min(MAX_TIDE, state.rivalTide + 1);
  }
  state.log = `${rivalPlayLine(move.card, prevPlayerSuit, state.rivalTide)} ${result.line}`;
  const winnerCard = result.winner === 'player' ? state.playerPlayed : move.card;
  const loserCard = result.winner === 'player' ? move.card : state.playerPlayed;
  if (result.winner === 'tie') {
    state.discardPile.push(state.playerPlayed, move.card);
  } else {
    state.discardPile.push(winnerCard);
    if (loserCard.keyword === 'echo') {
      if (result.winner === 'player') state.rivalHand.push(loserCard);
      else state.playerHand.push(loserCard);
      state.log += ` Echo: ${loserCard.name} returns to hand.`;
    } else {
      state.discardPile.push(loserCard);
    }
  }
  state.phase = 'reveal';
}

// After the reveal has been shown, move the duel on: score the life totals
// and either end the duel or deal the next round.
export function endReveal(state) {
  if (state.phase !== 'reveal') return;
  finishTurn(state);
}
