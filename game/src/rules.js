// The rules of one round: how a card's strength is counted, who wins the trick,
// and what the loser pays. The whole duel hangs off resolveRound, so the
// renderer, the AI and the screenshot staging all read the same verdict.
import { SUIT_EDGE_BONUS, SURGE_BONUS, SURGE_TIDE, suitBeats } from './config.js';

// A card's fighting strength right now: its power, +3 when its suit beats the
// other card's suit, +2 for Surge while its owner's Tide is 4 or more.
export function effectivePower(card, foeCard, tide) {
  let power = card.power;
  if (suitBeats(card.suit, foeCard.suit)) power += SUIT_EDGE_BONUS;
  if (card.keyword === 'surge' && tide >= SURGE_TIDE) power += SURGE_BONUS;
  return power;
}

// Settle one face-up pair. Returns the winner ('player', 'rival' or 'tie'),
// the damage the loser takes, and one line of plain words for the log.
export function resolveRound(playerCard, rivalCard, playerTide, rivalTide) {
  const playerPower = effectivePower(playerCard, rivalCard, playerTide);
  const rivalPower = effectivePower(rivalCard, playerCard, rivalTide);
  if (playerPower === rivalPower) {
    return {
      winner: 'tie',
      damage: 0,
      playerPower,
      rivalPower,
      line: `${playerCard.name} ${playerPower} meets ${rivalCard.name} ${rivalPower} — a dead tie, no damage.`,
    };
  }
  const playerWins = playerPower > rivalPower;
  const damage = Math.max(1, Math.abs(playerPower - rivalPower));
  const winnerCard = playerWins ? playerCard : rivalCard;
  const loserCard = playerWins ? rivalCard : playerCard;
  const edge = suitBeats(winnerCard.suit, loserCard.suit)
    ? ` ${winnerCard.suit} beats ${loserCard.suit} (+${SUIT_EDGE_BONUS}).`
    : '';
  return {
    winner: playerWins ? 'player' : 'rival',
    damage,
    playerPower,
    rivalPower,
    line: `${winnerCard.name} ${playerWins ? playerPower : rivalPower} overpowers ${loserCard.name} — ${damage} damage.${edge}`,
  };
}
