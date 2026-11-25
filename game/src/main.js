// main.js — Dapur Nusa: game loop, scene staging, and the playtest hook.
// URL scenes (?scene=cover|play|serve|end) freeze a staged kitchen so the
// screenshots show the full game in one frame. No scene param = title screen.

import { VIEW_W, VIEW_H } from './config.js';
import { Kitchen } from './kitchen.js';
import { Input } from './input.js';
import { render } from './render.js';
import { ensureAudio, toggleMute, playClick } from './audio.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
canvas.width = VIEW_W;
canvas.height = VIEW_H;

const kitchen = new Kitchen();
const input = new Input(canvas);

function fmtTime(sec) {
  const s = Math.max(0, Math.ceil(sec));
  return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
}

// --- staged scenes for screenshots (frozen, fully readable) ------------------
function stageCover() {
  // The cover frame: order board full, big shift timer, wok mid-cook dead
  // centre with flame + steam, a plated dish ready, ingredients on the
  // counter, cook carrying chopped veg toward the wok.
  kitchen.startGame();
  kitchen.paused = true;
  kitchen.board.orders = [
    { id: 1, dishId: 'nasi-goreng', timeLeft: 48, timeMax: 75 },
    { id: 2, dishId: 'ayam-bakar', timeLeft: 62, timeMax: 75 },
    { id: 3, dishId: 'soto-kilat', timeLeft: 35, timeMax: 75 },
  ];
  kitchen.board.coins = 240;
  kitchen.board.combo = 2;
  kitchen.board.servedToday = 2;
  kitchen.shiftLeft = 132;
  kitchen.wok.items = ['rice', 'egg', 'chili_potong'];
  kitchen.wok.cooking = 1.5;
  kitchen.wok.pendingDish = 'nasi-goreng';
  kitchen.plate.dish = 'ayam-bakar';
  kitchen.carrying = ['veg_potong'];
  kitchen.player.x = 700; kitchen.player.y = 330; kitchen.player.face = -1;
  kitchen.floats = [{ x: 1158, y: 260, text: '+120 KOPI', color: '#f2b705', life: 1.4 }];
}

function stagePlay() {
  // Mid-game: cook chopping chicken at the board, rice in hand, two orders up.
  kitchen.startGame();
  kitchen.paused = true;
  kitchen.board.orders = [
    { id: 1, dishId: 'mie-goreng', timeLeft: 55, timeMax: 75 },
    { id: 2, dishId: 'nasi-goreng', timeLeft: 28, timeMax: 75 },
  ];
  kitchen.board.coins = 0;
  kitchen.board.combo = 0;
  kitchen.board.servedToday = 0;
  kitchen.shiftLeft = 141;
  kitchen.chop.item = 'chicken';
  kitchen.chop.progress = 0.7;
  kitchen.carrying = ['rice'];
  kitchen.player.x = 385; kitchen.player.y = 300; kitchen.player.face = 1;
}

function stageServe() {
  // The serve moment: cook at the pass holding plated Nasi Goreng, the matching
  // order almost out of time, coins just earned.
  kitchen.startGame();
  kitchen.paused = true;
  kitchen.board.orders = [
    { id: 1, dishId: 'nasi-goreng', timeLeft: 12, timeMax: 75 },
    { id: 2, dishId: 'soto-kilat', timeLeft: 44, timeMax: 75 },
  ];
  kitchen.board.coins = 120;
  kitchen.board.combo = 1;
  kitchen.board.servedToday = 1;
  kitchen.shiftLeft = 118;
  kitchen.carrying = ['dish:nasi-goreng'];
  kitchen.player.x = 1010; kitchen.player.y = 420; kitchen.player.face = 1;
  kitchen.floats = [{ x: 1158, y: 260, text: '+120 KOPI', color: '#f2b705', life: 1.4 }];
}

function stageEnd() {
  // Day-3 victory panel over the kitchen.
  kitchen.startGame();
  kitchen.dayIndex = 2;
  kitchen.board.coins = 1250;
  kitchen.board.comboBest = 4;
  kitchen.board.servedToday = 8;
  kitchen.board.orders = [
    { id: 1, dishId: 'ayam-bakar', timeLeft: 40, timeMax: 55 },
  ];
  kitchen.phase = 'win';
  kitchen.paused = true;
  kitchen.dayClearTimer = 999;
}

function stageScene(name) {
  if (name === 'cover') stageCover();
  else if (name === 'play') stagePlay();
  else if (name === 'serve') stageServe();
  else if (name === 'end') stageEnd();
  kitchen.message = null; // staged frames stay clean: no day-start banner
}

// --- boot ----------------------------------------------------------------------
const params = new URLSearchParams(location.search);
const scene = params.get('scene');
if (scene) stageScene(scene);

// Playtest hook: the automated playtest drives the real interaction functions
// through this handle (teleport + useStation), never by editing state directly.
window.DAPUR = {
  kitchen, input,
  teleport(x, y) { kitchen.player.x = x; kitchen.player.y = y; },
  useStation(key) { kitchen.useStation(key); },
  start() { kitchen.startGame(); },
  state() {
    return {
      phase: kitchen.phase,
      coins: kitchen.board.coins,
      stars: kitchen.stars,
      orders: kitchen.board.orders.map((o) => ({ dish: o.dishId, t: Math.round(o.timeLeft) })),
      carrying: [...kitchen.carrying],
      wok: { items: [...kitchen.wok.items], dish: kitchen.wok.dish, cooking: kitchen.wok.cooking },
      plate: kitchen.plate.dish,
      served: kitchen.board.servedToday,
      shift: Math.round(kitchen.shiftLeft),
    };
  },
};

let last = performance.now();

function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;

  if (input.consumeMute()) toggleMute();
  if (kitchen.phase === 'title') {
    if (input.consumeStart() || input.consumeClick()) {
      ensureAudio(); playClick();
      kitchen.startGame();
    }
  } else if (kitchen.phase === 'win') {
    if (input.consumeStart()) kitchen.startGame();
  } else {
    input.consumeStart(); // swallow Enter during play
  }

  kitchen.nearest = kitchen.nearestStation();
  kitchen.update(dt, input);
  render(ctx, kitchen);
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
