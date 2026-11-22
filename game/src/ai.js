// Rook, the rival. He does not see your card, but he reads your last play and
// the Tide on the table, and he banks Tide when his hand is weak instead of
// throwing good cards after bad ones.
import { MAX_TIDE, suitBeats } from './config.js';

// Score one card in Rook's hand as if it were played now. A card that beats
// your last suit is worth more, a card you cannot answer cheaply is worth
// more, and an expensive card is worth less while his Tide is low.
function scoreCard(card, state) {
  const lastSuit = state.lastPlayerSuit;
  let score = card.power * 2;
  if (lastSuit && suitBeats(card.suit, lastSuit)) score += 5;
  if (card.keyword === 'surge' && state.rivalTide >= 4) score += 4;
  if (card.keyword === 'echo') score += 1;
  score -= card.cost * 2;
  if (state.rivalTide < card.cost) score -= 20;
  return score;
}

// Pick Rook's move for the round. Returns { kind: 'play', card } or
// { kind: 'discard', card } when banking Tide is the smarter play.
export function rivalChoose(state) {
  const affordable = state.rivalHand.filter((card) => card.cost <= state.rivalTide);
  if (affordable.length === 0) {
    const cheapest = [...state.rivalHand].sort((a, b) => a.power - b.power)[0];
    return { kind: 'discard', card: cheapest, reason: 'no card affordable, banks Tide' };
  }
  let best = affordable[0];
  let bestScore = scoreCard(best, state);
  for (const card of affordable) {
    const score = scoreCard(card, state);
    if (score > bestScore || (score === bestScore && card.power > best.power)) {
      best = card;
      bestScore = score;
    }
  }
  const weakest = [...state.rivalHand].sort((a, b) => a.power - b.power)[0];
  const maxPower = Math.max(...state.rivalHand.map((card) => card.power));
  const handWeak = maxPower <= 2 && state.rivalTide < MAX_TIDE - 1;
  if (handWeak && weakest.power <= 2 && state.round > 1) {
    return { kind: 'discard', card: weakest, reason: 'hand is weak, banks Tide for a bigger turn' };
  }
  return { kind: 'play', card: best, reason: '' };
}

// One line explaining Rook's play, so his choices can be read and countered.
// `beatenSuit` is the player's suit from the previous round, the one Rook
// was reading when he chose.
export function rivalPlayLine(card, beatenSuit, tide = 0) {
  if (beatenSuit && suitBeats(card.suit, beatenSuit)) {
    return `Rook plays ${card.name} — ${card.suit} beats your last ${beatenSuit}.`;
  }
  if (card.keyword === 'surge' && tide >= 4) {
    return `Rook plays ${card.name} — Surge fires on a full Tide.`;
  }
  return `Rook plays ${card.name}.`;
}