// Mouse and keyboard for the table. Clicking a card plays it (or discards it
// while discard mode is on); keys 1-5 play by position, D toggles discard mode,
// Enter starts the duel, R restarts it, M mutes the sound. Restart is a
// callback because main.js owns the game state.
import { discardCard, playCard, startDuel } from './state.js';

export function createInput(getState, sound, onRestart) {
  const view = { hoverIndex: -1, handRects: [] };

  function cardAt(x, y) {
    for (const rect of view.handRects) {
      if (x >= rect.x && x <= rect.x + rect.width && y >= rect.y && y <= rect.y + rect.height) {
        return rect;
      }
    }
    return null;
  }

  function playAt(index) {
    const state = getState();
    const card = state.playerHand[index];
    if (!card) return;
    if (state.discardMode) {
      if (discardCard(state, card)) {
        state.discardMode = false;
        sound.play('discard');
      }
      return;
    }
    if (playCard(state, card)) sound.play('play');
  }

  function handleClick(x, y) {
    const state = getState();
    if (state.screen === 'title') {
      startDuel(state);
      sound.play('deal');
      return;
    }
    if (state.screen === 'win' || state.screen === 'loss') return;
    const rect = cardAt(x, y);
    if (rect) playAt(rect.index);
  }

  function handleMove(x, y) {
    const rect = cardAt(x, y);
    view.hoverIndex = rect ? rect.index : -1;
  }

  function handleKey(key) {
    const state = getState();
    if (key === 'Enter' && state.screen === 'title') {
      startDuel(state);
      sound.play('deal');
      return;
    }
    if (key === 'r' || key === 'R') {
      onRestart();
      return;
    }
    if (key === 'm' || key === 'M') {
      sound.toggleMute();
      return;
    }
    if (state.screen !== 'play' || state.phase !== 'choose') return;
    if (key === 'd' || key === 'D') {
      state.discardMode = !state.discardMode;
      return;
    }
    const number = Number.parseInt(key, 10);
    if (number >= 1 && number <= 5) playAt(number - 1);
  }

  return { view, handleClick, handleMove, handleKey, playAt };
}
