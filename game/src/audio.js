// audio.js — Dapur Nusa: procedural WebAudio sound effects only.
// No audio files, no network: every sound is synthesized on the fly.

let ctx = null;
let muted = false;

export function ensureAudio() {
  if (!ctx) {
    try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { ctx = null; }
  }
  if (ctx && ctx.state === 'suspended') ctx.resume();
  return ctx;
}

export function toggleMute() { muted = !muted; return muted; }
export function isMuted() { return muted; }

function tone(freq, dur, type, vol, slideTo) {
  if (muted) return;
  const ac = ensureAudio();
  if (!ac) return;
  const t0 = ac.currentTime;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type || 'sine';
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
  gain.gain.setValueAtTime(vol || 0.15, t0);
  gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
  osc.connect(gain).connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

function noiseBurst(dur, vol, filterFreq) {
  if (muted) return;
  const ac = ensureAudio();
  if (!ac) return;
  const t0 = ac.currentTime;
  const len = Math.floor(ac.sampleRate * dur);
  const buf = ac.createBuffer(1, len, ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = ac.createBufferSource();
  src.buffer = buf;
  const filter = ac.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = filterFreq || 3000;
  const gain = ac.createGain();
  gain.gain.setValueAtTime(vol || 0.2, t0);
  gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
  src.connect(filter).connect(gain).connect(ac.destination);
  src.start(t0);
}

export function playPickup() { tone(520, 0.08, 'triangle', 0.12, 700); }
export function playChop() { noiseBurst(0.09, 0.25, 1800); tone(180, 0.06, 'square', 0.08); }
export function playSizzle() { noiseBurst(0.5, 0.12, 5200); }
export function playDing() { tone(880, 0.25, 'sine', 0.15); tone(1320, 0.3, 'sine', 0.1); }
export function playCoin() {
  tone(988, 0.09, 'triangle', 0.14);
  setTimeout(() => tone(1319, 0.16, 'triangle', 0.14), 80);
}
export function playFail() { tone(220, 0.3, 'sawtooth', 0.12, 110); }
export function playBurn() { noiseBurst(0.4, 0.2, 900); playFail(); }
export function playJingle() {
  const notes = [523, 659, 784, 1047];
  notes.forEach((n, i) => setTimeout(() => tone(n, 0.22, 'triangle', 0.15), i * 130));
}
export function playClick() { tone(660, 0.05, 'square', 0.06); }
