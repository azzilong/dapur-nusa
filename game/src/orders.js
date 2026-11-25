// orders.js — Dapur Nusa: the order board.
// Orders spawn on a timer, count down, expire into a lost star, and pay coins
// (with a combo multiplier) when the matching plated dish is served.

import { DAYS, MAX_ACTIVE_ORDERS } from './config.js';
import { DISHES, dishById } from './recipes.js';

let nextOrderId = 1;

export class OrderBoard {
  constructor() {
    this.orders = [];        // {id, dishId, timeLeft, timeMax}
    this.spawnTimer = 6;     // first order arrives quickly
    this.servedToday = 0;
    this.expiredToday = 0;
    this.coins = 0;
    this.combo = 0;          // consecutive serves without an expiry
    this.comboBest = 0;
  }

  dayConfig(dayIndex) { return DAYS[Math.min(dayIndex, DAYS.length - 1)]; }

  resetDay(dayIndex) {
    this.orders = [];
    this.spawnTimer = 5;
    this.servedToday = 0;
    this.expiredToday = 0;
    this.combo = 0;
  }

  // Pick a dish, avoiding three copies of the same dish on the board.
  pickDish() {
    const counts = {};
    for (const o of this.orders) counts[o.dishId] = (counts[o.dishId] || 0) + 1;
    const pool = DISHES.filter((d) => (counts[d.id] || 0) < 2);
    const list = pool.length ? pool : DISHES;
    return list[Math.floor(Math.random() * list.length)];
  }

  spawnOrder(dayIndex) {
    const cfg = this.dayConfig(dayIndex);
    const dish = this.pickDish();
    this.orders.push({
      id: nextOrderId++,
      dishId: dish.id,
      timeLeft: cfg.orderTime,
      timeMax: cfg.orderTime,
    });
  }

  // Advance timers; returns the orders that expired this tick.
  tick(dt, dayIndex) {
    const cfg = this.dayConfig(dayIndex);
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0 && this.orders.length < MAX_ACTIVE_ORDERS) {
      this.spawnOrder(dayIndex);
      this.spawnTimer = cfg.spawnEvery;
    }
    const expired = [];
    for (const o of this.orders) o.timeLeft -= dt;
    this.orders = this.orders.filter((o) => {
      if (o.timeLeft <= 0) { expired.push(o); return false; }
      return true;
    });
    for (const o of expired) {
      this.expiredToday++;
      this.combo = 0; // an expiry breaks the combo
    }
    return expired;
  }

  // Serve a plated dish. Returns {ok, coins, dish} or {ok:false}.
  serve(dishId) {
    const idx = this.orders.findIndex((o) => o.dishId === dishId);
    if (idx < 0) return { ok: false };
    const order = this.orders[idx];
    this.orders.splice(idx, 1);
    const dish = dishById(dishId);
    this.combo++;
    this.comboBest = Math.max(this.comboBest, this.combo);
    const mult = 1 + Math.min(this.combo - 1, 4) * 0.25; // x1.00 .. x2.00
    const coins = Math.round(dish.price * mult);
    this.coins += coins;
    this.servedToday++;
    return { ok: true, coins, dish, combo: this.combo, mult };
  }

  quotaMet(dayIndex) { return this.servedToday >= this.dayConfig(dayIndex).quota; }
}
