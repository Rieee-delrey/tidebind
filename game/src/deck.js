// The deck: one copy of each card definition, shuffled by seed, dealt into two
// hands of five with the rest as the draw pile. When the pile runs out the
// discard pile is shuffled back in, so a duel can run long without stalling.
import { CARD_DEFS, cardCost } from './config.js';
import { shuffleInPlace } from './random.js';

export function buildDeck(random) {
  // The id is the card's place in the definitions, so the same seed always
  // builds the same deck with the same ids.
  const cards = CARD_DEFS.map((def, index) => ({
    id: index,
    suit: def.suit,
    power: def.power,
    name: def.name,
    keyword: def.keyword ?? null,
    cost: cardCost(def.power),
  }));
  return shuffleInPlace(cards, random);
}

export function drawCard(state) {
  if (state.drawPile.length === 0) {
    if (state.discardPile.length === 0) return null;
    state.drawPile = shuffleInPlace(state.discardPile, state.random);
    state.discardPile = [];
  }
  return state.drawPile.pop();
}

export function dealHands(state) {
  state.playerHand = [];
  state.rivalHand = [];
  for (let index = 0; index < 5; index += 1) {
    state.playerHand.push(state.drawPile.pop());
    state.rivalHand.push(state.drawPile.pop());
  }
}
