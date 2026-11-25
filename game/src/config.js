// config.js — Dapur Nusa: canvas size, palette, station layout, day tuning.
// Every number that shapes the kitchen lives here so the other files stay small.

export const VIEW_W = 1280;
export const VIEW_H = 720;

export const HUD_H = 104;            // top order-board strip
export const FLOOR_TOP = HUD_H + 8;  // kitchen floor starts here
export const FLOOR_BOTTOM = 700;

export const PLAYER_SPEED = 265;     // px per second
export const PLAYER_RADIUS = 24;
export const CARRY_MAX = 3;

export const CHOP_TIME = 1.4;        // seconds to chop one ingredient
export const COOK_TIME = 2.6;        // seconds in the wok once a recipe matches
export const BURN_TIME = 1.2;        // seconds before a wrong wok mix is cleared

// Warm warung palette: terracotta floor, cream walls, teak counters.
export const COLORS = {
  wall: '#f7e8c9',
  wallTrim: '#d9a441',
  floorA: '#e8b07d',
  floorB: '#df9f66',
  floorLine: '#c98a4e',
  counter: '#8a5a2b',
  counterTop: '#b5773a',
  counterEdge: '#6e4520',
  crate: '#a06a2e',
  board: '#e9c893',
  stove: '#3d4450',
  stoveHot: '#e2543e',
  pass: '#2f6f5e',
  plate: '#fdf6e3',
  textDark: '#2b1d0e',
  textLight: '#fff8ea',
  gold: '#f2b705',
  red: '#d64541',
  green: '#3d9b4f',
};

// Station rectangles (x, y, w, h) on the 1280x720 canvas.
export const STATIONS = {
  // Ingredient crates along the left wall.
  rice:    { x: 24,  y: 150, w: 92, h: 76, label: 'NASI',  kind: 'crate' },
  chicken: { x: 24,  y: 242, w: 92, h: 76, label: 'AYAM',  kind: 'crate' },
  chili:   { x: 24,  y: 334, w: 92, h: 76, label: 'CABAI', kind: 'crate' },
  egg:     { x: 24,  y: 426, w: 92, h: 76, label: 'TELUR', kind: 'crate' },
  veg:     { x: 24,  y: 518, w: 92, h: 76, label: 'SAYUR', kind: 'crate' },
  // Work stations.
  board:   { x: 300, y: 150, w: 170, h: 96, label: 'TALENAN — POTONG', kind: 'board' },
  stove:   { x: 560, y: 150, w: 220, h: 110, label: 'WOK — MASAK',     kind: 'stove' },
  plating: { x: 300, y: 560, w: 200, h: 92, label: 'PIRING — SAJI',    kind: 'plating' },
  pass:    { x: 1060, y: 300, w: 196, h: 220, label: 'MEJA SAJI',      kind: 'pass' },
  trash:   { x: 1060, y: 150, w: 110, h: 80, label: 'BUANG',           kind: 'trash' },
};

// One day's pressure: order interval, order lifetime, dishes to clear the day,
// shift length. Day 3 is a real rush.
export const DAYS = [
  { day: 1, name: 'HARI 1 — PEMANASAN', spawnEvery: 15, orderTime: 75, quota: 4, shift: 150 },
  { day: 2, name: 'HARI 2 — RAMAI',     spawnEvery: 12, orderTime: 65, quota: 6, shift: 150 },
  { day: 3, name: 'HARI 3 — PUNCAK',    spawnEvery: 9,  orderTime: 55, quota: 8, shift: 150 },
];

export const MAX_ACTIVE_ORDERS = 4;
export const MAX_STARS = 3;
