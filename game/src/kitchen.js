// kitchen.js — Dapur Nusa: the kitchen world and its rules.
// Player movement, station interaction, chopping, wok cooking, plating,
// serving, and the day/shift state machine all live here.

import {
  STATIONS, PLAYER_SPEED, PLAYER_RADIUS, CARRY_MAX,
  CHOP_TIME, COOK_TIME, BURN_TIME, FLOOR_TOP, FLOOR_BOTTOM, MAX_STARS, DAYS,
} from './config.js';
import {
  INGREDIENTS, CRATE_ITEMS, choppedId, isChopped, baseId, matchDish, dishById,
} from './recipes.js';
import { OrderBoard } from './orders.js';
import * as sfx from './audio.js';

export function stationCenter(key) {
  const s = STATIONS[key];
  return { x: s.x + s.w / 2, y: s.y + s.h / 2 };
}

export function stationAt(x, y) {
  for (const key of Object.keys(STATIONS)) {
    const s = STATIONS[key];
    if (x >= s.x - 6 && x <= s.x + s.w + 6 && y >= s.y - 6 && y <= s.y + s.h + 6) return key;
  }
  return null;
}

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

export class Kitchen {
  constructor() {
    this.board = new OrderBoard();
    this.dayIndex = 0;
    this.phase = 'title';       // title | play | dayclear | failed | win
    this.shiftLeft = DAYS[0].shift;
    this.stars = MAX_STARS;
    this.player = { x: 640, y: 430, face: 1, walking: false };
    this.carrying = [];         // item ids, max CARRY_MAX
    this.moveTarget = null;     // {x, y} from a mouse click
    this.autoInteract = null;   // station key to use on arrival
    this.chop = { item: null, progress: 0 };   // active chopping job
    this.wok = { items: [], cooking: 0, dish: null, burn: 0, sizzling: false };
    this.plate = { dish: null }; // plated dish waiting on the plating counter
    this.floats = [];           // {x, y, text, color, life}
    this.message = null;        // {text, color, life} banner
    this.paused = false;        // frozen for staged screenshots
    this.dayClearTimer = 0;
  }

  get day() { return DAYS[this.dayIndex]; }

  startGame() {
    this.dayIndex = 0;
    this.stars = MAX_STARS;
    this.board = new OrderBoard();
    this.startDay();
  }

  startDay() {
    this.board.resetDay(this.dayIndex);
    this.shiftLeft = this.day.shift;
    this.carrying = [];
    this.chop = { item: null, progress: 0 };
    this.wok = { items: [], cooking: 0, dish: null, burn: 0, sizzling: false };
    this.plate = { dish: null };
    this.player.x = 640; this.player.y = 430;
    this.phase = 'play';
    this.showMessage(this.day.name + ' — sajikan ' + this.day.quota + ' pesanan!', '#f2b705');
  }

  showMessage(text, color) { this.message = { text, color: color || '#fff8ea', life: 2.6 }; }

  addFloat(x, y, text, color) { this.floats.push({ x, y, text, color, life: 1.4 }); }

  nearestStation() {
    let best = null, bestD = 1e9;
    for (const key of Object.keys(STATIONS)) {
      const c = stationCenter(key);
      const d = Math.hypot(this.player.x - c.x, this.player.y - c.y);
      if (d < bestD) { bestD = d; best = key; }
    }
    return bestD < 130 ? best : null;
  }

  // --- interaction -------------------------------------------------------
  tryInteract() {
    const key = this.nearestStation();
    if (!key) return;
    this.useStation(key);
  }

  useStation(key) {
    const p = this.player;
    if (CRATE_ITEMS.includes(key)) {
      if (this.carrying.length >= CARRY_MAX) { this.showMessage('Tangan penuh! (maks 3)', '#ff9d9d'); return; }
      this.carrying.push(key);
      sfx.playPickup();
      return;
    }
    if (key === 'board') {
      const idx = this.carrying.findIndex((id) => INGREDIENTS[baseId(id)] && INGREDIENTS[baseId(id)].chop && !isChopped(id));
      if (idx < 0) { this.showMessage('Bawa bahan yang bisa dipotong (ayam / cabai / sayur)', '#ff9d9d'); return; }
      if (this.chop.item) return; // already chopping
      this.chop.item = this.carrying.splice(idx, 1)[0];
      this.chop.progress = 0;
      sfx.playChop();
      return;
    }
    if (key === 'stove') {
      if (this.wok.dish) {
        if (this.carrying.length >= CARRY_MAX) { this.showMessage('Tangan penuh!', '#ff9d9d'); return; }
        this.carrying.push('dish:' + this.wok.dish);
        this.wok.dish = null;
        sfx.playPickup();
        return;
      }
      if (this.wok.cooking > 0 || this.wok.burn > 0) return;
      if (this.carrying.length === 0) { this.showMessage('Bawa bahan ke wok dulu', '#ff9d9d'); return; }
      const item = this.carrying.shift();
      if (item.startsWith('dish:')) { this.carrying.unshift(item); this.showMessage('Hidangan jadi jangan dimasak lagi!', '#ff9d9d'); return; }
      this.wok.items.push(item);
      sfx.playSizzle();
      if (this.wok.items.length >= 3) {
        const dish = matchDish(this.wok.items);
        if (dish) { this.wok.cooking = COOK_TIME; this.wok.pendingDish = dish.id; }
        else { this.wok.burn = BURN_TIME; }
      }
      return;
    }
    if (key === 'plating') {
      const idx = this.carrying.findIndex((id) => id.startsWith('dish:'));
      if (idx >= 0 && !this.plate.dish) {
        this.plate.dish = this.carrying.splice(idx, 1)[0].slice(5);
        sfx.playDing();
        return;
      }
      if (this.plate.dish && this.carrying.length < CARRY_MAX) {
        this.carrying.push('dish:' + this.plate.dish);
        this.plate.dish = null;
        sfx.playPickup();
        return;
      }
      this.showMessage('Bawa hidangan matang ke piring', '#ff9d9d');
      return;
    }
    if (key === 'pass') {
      const idx = this.carrying.findIndex((id) => id.startsWith('dish:'));
      if (idx < 0) { this.showMessage('Bawa hidangan di piring ke meja saji', '#ff9d9d'); return; }
      const dishId = this.carrying[idx].slice(5);
      const res = this.board.serve(dishId);
      if (res.ok) {
        this.carrying.splice(idx, 1);
        const c = stationCenter('pass');
        this.addFloat(c.x, c.y - 40, '+' + res.coins + ' KOPI', '#f2b705');
        if (res.combo > 1) this.addFloat(c.x, c.y - 70, 'KOMBO x' + res.combo + '!', '#7be495');
        sfx.playCoin();
      } else {
        this.showMessage('Tidak ada pesanan ' + dishById(dishId).name + ' — sajikan yang dipesan!', '#ff9d9d');
        sfx.playFail();
      }
      return;
    }
    if (key === 'trash') {
      if (this.carrying.length === 0 && !this.wok.dish && this.wok.items.length === 0) return;
      this.carrying = [];
      this.wok.items = [];
      this.wok.cooking = 0;
      this.wok.burn = 0;
      sfx.playFail();
      this.showMessage('Dibuang — mulai lagi dari bahan', '#ff9d9d');
    }
  }

  // --- update ------------------------------------------------------------
  update(dt, input) {
    // Banner + floating texts always tick.
    if (this.message) { this.message.life -= dt; if (this.message.life <= 0) this.message = null; }
    for (const f of this.floats) f.life -= dt;
    this.floats = this.floats.filter((f) => f.life > 0);

    if (this.phase === 'dayclear' || this.phase === 'failed' || this.phase === 'win') {
      this.dayClearTimer -= dt;
      if (this.dayClearTimer <= 0) {
        if (this.phase === 'dayclear') {
          if (this.dayIndex + 1 >= DAYS.length) { this.phase = 'win'; sfx.playJingle(); }
          else { this.dayIndex++; this.startDay(); }
        } else if (this.phase === 'failed') {
          this.startDay(); // retry the same day, stars restored
          this.stars = MAX_STARS;
        }
      }
      return;
    }
    if (this.phase !== 'play' || this.paused) return;

    // Timers: orders + shift.
    const expired = this.board.tick(dt, this.dayIndex);
    for (const o of expired) {
      this.stars--;
      this.showMessage('Pesanan hangus! Bintang tersisa: ' + Math.max(this.stars, 0), '#ff9d9d');
      sfx.playFail();
    }
    this.shiftLeft -= dt;

    // Chopping progress.
    if (this.chop.item) {
      this.chop.progress += dt;
      if (Math.floor(this.chop.progress * 6) !== Math.floor((this.chop.progress - dt) * 6)) sfx.playChop();
      if (this.chop.progress >= CHOP_TIME) {
        const done = choppedId(this.chop.item);
        if (this.carrying.length < CARRY_MAX) this.carrying.push(done);
        this.chop = { item: null, progress: 0 };
        sfx.playDing();
      }
    }

    // Wok cooking / burning.
    if (this.wok.cooking > 0) {
      this.wok.cooking -= dt;
      if (this.wok.cooking <= 0) {
        this.wok.cooking = 0;
        this.wok.dish = this.wok.pendingDish;
        this.wok.items = [];
        this.wok.pendingDish = null;
        sfx.playDing();
        this.showMessage('Matang! Ambil dari wok: ' + dishById(this.wok.dish).name, '#7be495');
      }
    } else if (this.wok.burn > 0) {
      this.wok.burn -= dt;
      if (this.wok.burn <= 0) {
        this.wok.burn = 0;
        this.wok.items = [];
        sfx.playBurn();
        this.showMessage('Gosong! Resep salah — cek papan resep', '#ff9d9d');
      }
    }

    // Movement: keys win over click target.
    const mv = input.moveVector();
    const p = this.player;
    if (mv.dx !== 0 || mv.dy !== 0) {
      this.moveTarget = null;
      this.autoInteract = null;
      p.x += mv.dx * PLAYER_SPEED * dt;
      p.y += mv.dy * PLAYER_SPEED * dt;
      p.face = mv.dx !== 0 ? Math.sign(mv.dx) : p.face;
      p.walking = true;
    } else if (this.moveTarget) {
      const dx = this.moveTarget.x - p.x, dy = this.moveTarget.y - p.y;
      const d = Math.hypot(dx, dy);
      if (d < 8) {
        this.moveTarget = null;
        if (this.autoInteract) { const k = this.autoInteract; this.autoInteract = null; this.useStation(k); }
      } else {
        p.x += (dx / d) * PLAYER_SPEED * dt;
        p.y += (dy / d) * PLAYER_SPEED * dt;
        p.face = dx !== 0 ? Math.sign(dx) : p.face;
        p.walking = true;
      }
    } else {
      p.walking = false;
    }
    p.x = clamp(p.x, 150, 1040);
    p.y = clamp(p.y, FLOOR_TOP + 30, FLOOR_BOTTOM - 20);

    // Click handling: walk to the point; station clicks auto-use on arrival.
    const click = input.consumeClick();
    if (click) {
      const key = stationAt(click.x, click.y);
      if (key) {
        const c = stationCenter(key);
        this.moveTarget = { x: clamp(c.x, 150, 1040), y: clamp(c.y, FLOOR_TOP + 30, FLOOR_BOTTOM - 20) };
        // If already close, use it at once.
        if (Math.hypot(p.x - c.x, p.y - c.y) < 130) { this.moveTarget = null; this.useStation(key); }
        else this.autoInteract = key;
      } else {
        this.moveTarget = { x: clamp(click.x, 150, 1040), y: clamp(click.y, FLOOR_TOP + 30, FLOOR_BOTTOM - 20) };
        this.autoInteract = null;
      }
    }
    if (input.consumeInteract()) this.tryInteract();

    // Day end checks.
    if (this.board.quotaMet(this.dayIndex)) {
      this.phase = 'dayclear';
      this.dayClearTimer = 3.2;
      sfx.playJingle();
    } else if (this.stars <= 0) {
      this.phase = 'failed';
      this.dayClearTimer = 3.2;
      sfx.playFail();
    } else if (this.shiftLeft <= 0) {
      this.phase = 'failed';
      this.dayClearTimer = 3.2;
      sfx.playFail();
    }
  }
}
