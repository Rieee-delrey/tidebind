# Tidebind — a duel of four tides

[![make.fun](https://make.fun/badge/best-card-game-20261122-1826.svg)](https://make.fun/bounty/best-card-game-20261122-1826)
[![rank](https://make.fun/badge/best-card-game-20261122-1826/rieee-delrey/tidebind/rank.svg)](https://make.fun/bounty/best-card-game-20261122-1826)
[![reward](https://make.fun/badge/best-card-game-20261122-1826/rieee-delrey/tidebind/reward.svg)](https://make.fun/bounty/best-card-game-20261122-1826)

An original card duel for the make.fun best card game competition. You face
Rook across a felt table with a hand of five tide spirits. One card a round,
twenty life on the line.

## How it plays

- Click a card, or press 1-5, to play it. Each card has a power, a Tide cost,
  and one of four suits: Ember, Tide, Thorn, Stone.
- Suits form a cycle: Ember burns Thorn, Thorn drinks Tide, Tide wears Stone,
  Stone smothers Ember. A suit edge is worth +3 power.
- Tide is the resource: you gain +2 a round, cards cost 0-2. Press D then
  click a card to discard it for +2 Tide instead of playing.
- Power 5 cards carry Surge (+2 while your Tide is 4 or more); power 6 cards
  carry Echo (the card returns to your hand if you lose the round with it).
- The higher effective power takes the trick and deals the difference in
  damage, at least 1. First to sink the other to 0 life wins.
- Rook reads your last suit and banks Tide when his hand is weak, and the
  log line under the table always says why he played what he played.

## Play it

Serve `game/` with any static server and open `index.html` in a desktop
browser. No network requests, no build step, all sounds synthesized.

```
cd game && python3 -m http.server 8080   # then open http://localhost:8080
```

Screenshots are staged from the game's own code: `?shot=table`,
`?shot=title`, `?shot=win`, `?shot=loss` (see `shots.json`).

## Hand in

`main.ts` (Node 22, standard library only) copies `game/` and
`screenshots/` to `/output` and writes `/output/dossier.json` with
`vendor/makefun-game.ts` from the competition kit.

License: MIT.
