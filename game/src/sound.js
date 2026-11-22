// Short synthesized sounds, made with the Web Audio API and nothing else:
// no audio files, no network. Created lazily on the first user gesture, since
// browsers block audio before one.
export function createSound() {
  let audio = null;
  let muted = false;

  function ensureAudio() {
    if (!audio) {
      const AudioContext = window.AudioContext ?? window.webkitAudioContext;
      if (!AudioContext) return null;
      audio = new AudioContext();
    }
    if (audio.state === 'suspended') void audio.resume();
    return audio;
  }

  function tone(frequency, duration, type, gainValue, delay = 0) {
    if (muted) return;
    const ctx = ensureAudio();
    if (!ctx) return;
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, ctx.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(gainValue, ctx.currentTime + delay + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + delay + duration);
    oscillator.connect(gain).connect(ctx.destination);
    oscillator.start(ctx.currentTime + delay);
    oscillator.stop(ctx.currentTime + delay + duration + 0.05);
  }

  function play(name) {
    if (name === 'play') {
      tone(520, 0.12, 'triangle', 0.12);
      tone(780, 0.14, 'triangle', 0.1, 0.06);
    } else if (name === 'deal') {
      tone(330, 0.1, 'sine', 0.1);
      tone(440, 0.1, 'sine', 0.1, 0.07);
      tone(550, 0.12, 'sine', 0.1, 0.14);
    } else if (name === 'discard') {
      tone(300, 0.12, 'sawtooth', 0.05);
    } else if (name === 'win') {
      tone(523, 0.16, 'triangle', 0.12);
      tone(659, 0.16, 'triangle', 0.12, 0.12);
      tone(784, 0.3, 'triangle', 0.12, 0.24);
    } else if (name === 'lose') {
      tone(392, 0.2, 'sine', 0.1);
      tone(311, 0.3, 'sine', 0.1, 0.16);
    }
  }

  function toggleMute() {
    muted = !muted;
    return muted;
  }

  return { play, toggleMute };
}
