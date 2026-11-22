// The entry point: a 1280x720 canvas, a fixed-step render loop, and the wiring
// between the state, the input and the sound. ?shot=title|table|win|loss stages
// one of the screenshot scenes from a fixed seed; ?seed=N changes the deal.
// The reveal pauses briefly so the played cards can be read, then the duel
// moves on by itself.
import { CANVAS_HEIGHT, CANVAS_WIDTH } from './config.js';
import { endReveal, newGame } from './state.js';
import { render } from './render.js';
import { createInput } from './input.js';
import { createSound } from './sound.js';
import { stageShot } from './shots.js';

const REVEAL_MS = 1600;

function readParams() {
  const params = new URLSearchParams(window.location.search);
  const shot = params.get('shot') ?? '';
  const seed = Number.parseInt(params.get('seed') ?? '1', 10);
  return { shot, seed: Number.isFinite(seed) ? seed : 1 };
}

function main() {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;

  const { shot, seed } = readParams();
  let state = newGame(seed);
  let lastScreen = state.screen;
  // A ?shot= URL is a staged still: the reveal holds so the screenshot
  // catches both played cards. The real game, with no shot, moves on.
  const staging = shot !== '';
  if (shot) {
    stageShot(shot, state);
    lastScreen = state.screen;
  }

  const sound = createSound();
  const input = createInput(() => state, sound, () => {
    state = newGame(seed + 1);
    lastScreen = state.screen;
  });

  function canvasPoint(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * CANVAS_WIDTH,
      y: ((event.clientY - rect.top) / rect.height) * CANVAS_HEIGHT,
    };
  }

  canvas.addEventListener('click', (event) => {
    const point = canvasPoint(event);
    input.handleClick(point.x, point.y);
  });
  canvas.addEventListener('mousemove', (event) => {
    const point = canvasPoint(event);
    input.handleMove(point.x, point.y);
  });
  window.addEventListener('keydown', (event) => {
    if (['Enter', ' '].includes(event.key)) event.preventDefault();
    input.handleKey(event.key);
  });

  let revealSince = 0;
  function frame(now) {
    if (state.phase === 'reveal' && !staging) {
      if (revealSince === 0) revealSince = now;
      if (now - revealSince >= REVEAL_MS) {
        endReveal(state);
        revealSince = 0;
      }
    } else {
      revealSince = 0;
    }
    if (state.screen !== lastScreen) {
      if (state.screen === 'win') sound.play('win');
      if (state.screen === 'loss') sound.play('lose');
      lastScreen = state.screen;
    }
    render(ctx, state, input.view);
    const status = document.getElementById('status');
    if (status) status.textContent = state.log;
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

main();
