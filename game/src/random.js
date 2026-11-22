// A tiny seeded generator (mulberry32) so a game staged from one seed always
// deals the same hands, and two runs of the same seed play the same rounds.
// Nothing here reads the clock: the seed is the only source of chance.
export function makeRandom(seed) {
  let state = seed >>> 0;
  return function next() {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

// Fisher-Yates shuffle driven by a seeded generator, so the order is fixed
// for a fixed seed.
export function shuffleInPlace(items, random) {
  for (let index = items.length - 1; index > 0; index -= 1) {
    const other = Math.floor(random() * (index + 1));
    const held = items[index];
    items[index] = items[other];
    items[other] = held;
  }
  return items;
}
