// Tidebind: every constant that shapes the table. Four suits in a cycle, each told
// apart by colour and by shape, never by text alone: Ember is a red flame triangle,
// Tide a blue wave, Thorn a green leaf, Stone a violet diamond.
export const CANVAS_WIDTH = 1280;
export const CANVAS_HEIGHT = 720;

export const START_LIFE = 20;
export const START_TIDE = 2;
export const MAX_TIDE = 6;
export const HAND_SIZE = 5;
export const TIDE_PER_ROUND = 2;
export const DISCARD_TIDE = 2;
export const SUIT_EDGE_BONUS = 3;
export const SURGE_BONUS = 2;
export const SURGE_TIDE = 4;

export const SUITS = {
  ember: { label: 'Ember', color: '#ff6b4a', dark: '#c93a22', glyph: 'flame' },
  tide: { label: 'Tide', color: '#4ab8ff', dark: '#1d6fb8', glyph: 'wave' },
  thorn: { label: 'Thorn', color: '#5ed97a', dark: '#2c8a44', glyph: 'leaf' },
  stone: { label: 'Stone', color: '#b48cff', dark: '#6d4fc4', glyph: 'diamond' },
};

// The cycle: each suit beats the next one. Ember burns Thorn, Thorn drinks Tide,
// Tide wears down Stone, Stone smothers Ember.
export const BEATS = { ember: 'thorn', thorn: 'tide', tide: 'stone', stone: 'ember' };

export function suitBeats(attacker, defender) {
  return BEATS[attacker] === defender;
}

// The whole deck: 24 cards, six per suit. Power 1-2 are free, 3-4 cost 1 Tide,
// 5-6 cost 2 Tide. Power 5 cards carry Surge (+2 power while your Tide is 4 or
// more); power 6 cards carry Echo (the card returns to your hand if you lose
// the round with it).
export const CARD_DEFS = [
  { suit: 'ember', power: 1, name: 'Cinder Imp' },
  { suit: 'ember', power: 2, name: 'Spark Fox' },
  { suit: 'ember', power: 3, name: 'Coal Sprite' },
  { suit: 'ember', power: 4, name: 'Flame Heron' },
  { suit: 'ember', power: 5, name: 'Blaze Stag', keyword: 'surge' },
  { suit: 'ember', power: 6, name: 'Inferno Wyrm', keyword: 'echo' },
  { suit: 'tide', power: 1, name: 'Dew Minnow' },
  { suit: 'tide', power: 2, name: 'Brook Otter' },
  { suit: 'tide', power: 3, name: 'Rain Frog' },
  { suit: 'tide', power: 4, name: 'River Heron' },
  { suit: 'tide', power: 5, name: 'Storm Eel', keyword: 'surge' },
  { suit: 'tide', power: 6, name: 'Abyss Whale', keyword: 'echo' },
  { suit: 'thorn', power: 1, name: 'Seed Mouse' },
  { suit: 'thorn', power: 2, name: 'Sprout Hare' },
  { suit: 'thorn', power: 3, name: 'Bramble Cat' },
  { suit: 'thorn', power: 4, name: 'Ivy Owl' },
  { suit: 'thorn', power: 5, name: 'Thorn Wolf', keyword: 'surge' },
  { suit: 'thorn', power: 6, name: 'Elder Treant', keyword: 'echo' },
  { suit: 'stone', power: 1, name: 'Pebble Crab' },
  { suit: 'stone', power: 2, name: 'Flint Mole' },
  { suit: 'stone', power: 3, name: 'Slate Badger' },
  { suit: 'stone', power: 4, name: 'Granite Bear' },
  { suit: 'stone', power: 5, name: 'Quartz Golem', keyword: 'surge' },
  { suit: 'stone', power: 6, name: 'Mountain Titan', keyword: 'echo' },
];

export function cardCost(power) {
  if (power <= 2) return 0;
  if (power <= 4) return 1;
  return 2;
}

export function keywordLabel(keyword) {
  if (keyword === 'surge') return 'SURGE +2 when Tide 4+';
  if (keyword === 'echo') return 'ECHO returns if you lose';
  return '';
}
