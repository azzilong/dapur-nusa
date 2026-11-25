// render.js — Dapur Nusa: every pixel the player sees.
// Flat vector shapes only: no images, no external assets. The cover frame must
// read at half size, so order cards are big, the timer is a large numeral, and
// the wok (mid-assembly dish) sits dead centre with flame and steam.

import { VIEW_W, VIEW_H, HUD_H, FLOOR_TOP, FLOOR_BOTTOM, STATIONS, COLORS } from './config.js';
import { INGREDIENTS, DISHES, dishById, baseId, isChopped, itemLabel, itemColor } from './recipes.js';
import { stationCenter } from './kitchen.js';

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, s, x, y, size, color, weight, align) {
  ctx.fillStyle = color;
  ctx.font = (weight || 'bold') + ' ' + size + 'px system-ui, sans-serif';
  ctx.textAlign = align || 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(s, x, y);
}

function fmtTime(sec) {
  const s = Math.max(0, Math.ceil(sec));
  return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
}

// --- ingredient + dish icons (vector, no emoji — emoji fonts are unreliable) ---
export function drawIngredientIcon(ctx, id, x, y, s) {
  const base = baseId(id);
  const chopped = isChopped(id);
  ctx.save();
  ctx.translate(x, y);
  if (chopped) {
    // Three chopped pieces on a tiny board.
    ctx.fillStyle = '#e9c893';
    ctx.fillRect(-s * 0.7, -s * 0.15, s * 1.4, s * 0.55);
    ctx.fillStyle = itemColor(id);
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.arc(i * s * 0.42, s * 0.12, s * 0.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    return;
  }
  if (base === 'rice') {
    ctx.fillStyle = '#f5f0dc';
    ctx.beginPath(); ctx.arc(0, -s * 0.1, s * 0.55, 0, Math.PI); ctx.fill();
    ctx.fillStyle = '#c94f2e';
    ctx.beginPath(); ctx.arc(0, -s * 0.1, s * 0.62, Math.PI, 0); ctx.fill();
    ctx.fillStyle = '#f5f0dc';
    for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.arc(i * s * 0.22, -s * 0.28, s * 0.13, 0, Math.PI * 2); ctx.fill(); }
  } else if (base === 'chicken') {
    ctx.fillStyle = '#e8a05c';
    ctx.beginPath(); ctx.ellipse(-s * 0.1, 0, s * 0.5, s * 0.38, -0.5, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#f7e8c9'; ctx.lineWidth = s * 0.16;
    ctx.beginPath(); ctx.moveTo(s * 0.25, -s * 0.25); ctx.lineTo(s * 0.6, -s * 0.6); ctx.stroke();
    ctx.fillStyle = '#f7e8c9';
    ctx.beginPath(); ctx.arc(s * 0.62, -s * 0.62, s * 0.14, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(s * 0.5, -s * 0.72, s * 0.14, 0, Math.PI * 2); ctx.fill();
  } else if (base === 'chili') {
    ctx.fillStyle = '#d63c2f';
    ctx.beginPath(); ctx.moveTo(-s * 0.55, -s * 0.35);
    ctx.quadraticCurveTo(s * 0.1, s * 0.75, s * 0.6, -s * 0.3);
    ctx.quadraticCurveTo(s * 0.1, s * 0.25, -s * 0.55, -s * 0.35);
    ctx.fill();
    ctx.strokeStyle = '#3d9b4f'; ctx.lineWidth = s * 0.14;
    ctx.beginPath(); ctx.moveTo(-s * 0.55, -s * 0.35); ctx.lineTo(-s * 0.75, -s * 0.6); ctx.stroke();
  } else if (base === 'egg') {
    ctx.fillStyle = '#fff8ea';
    ctx.beginPath(); ctx.ellipse(0, 0, s * 0.5, s * 0.62, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f2b705';
    ctx.beginPath(); ctx.arc(0, s * 0.08, s * 0.26, 0, Math.PI * 2); ctx.fill();
  } else if (base === 'veg') {
    ctx.fillStyle = '#58a34a';
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath(); ctx.ellipse(i * s * 0.35, -i * i * s * 0.1, s * 0.28, s * 0.5, i * 0.5, 0, Math.PI * 2); ctx.fill();
    }
    ctx.strokeStyle = '#2f6f3e'; ctx.lineWidth = s * 0.08;
    ctx.beginPath(); ctx.moveTo(0, s * 0.55); ctx.lineTo(0, -s * 0.2); ctx.stroke();
  }
  ctx.restore();
}

export function drawDishIcon(ctx, dishId, x, y, s) {
  const dish = dishById(dishId);
  if (!dish) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = COLORS.plate;
  ctx.beginPath(); ctx.arc(0, 0, s, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#d9c9a3'; ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = dish.color;
  ctx.beginPath(); ctx.arc(0, 0, s * 0.62, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#7be495';
  ctx.beginPath(); ctx.arc(-s * 0.25, -s * 0.2, s * 0.16, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(s * 0.3, s * 0.15, s * 0.13, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(s * 0.1, -s * 0.3, s * 0.1, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

// --- kitchen ----------------------------------------------------------------
function drawFloor(ctx) {
  ctx.fillStyle = COLORS.wall;
  ctx.fillRect(0, 0, VIEW_W, FLOOR_TOP);
  ctx.fillStyle = COLORS.wallTrim;
  ctx.fillRect(0, FLOOR_TOP - 6, VIEW_W, 6);
  for (let ty = 0; ty < 8; ty++) {
    for (let tx = 0; tx < 16; tx++) {
      ctx.fillStyle = (tx + ty) % 2 === 0 ? COLORS.floorA : COLORS.floorB;
      ctx.fillRect(tx * 80, FLOOR_TOP + ty * 74, 80, 74);
    }
  }
  ctx.strokeStyle = COLORS.floorLine;
  ctx.lineWidth = 1;
  for (let tx = 0; tx <= 16; tx++) { ctx.beginPath(); ctx.moveTo(tx * 80, FLOOR_TOP); ctx.lineTo(tx * 80, VIEW_H); ctx.stroke(); }
  // Recipe poster on the wall gap (fills the empty wall, shows the 4 dishes).
  ctx.fillStyle = '#fff8ea';
  rr(ctx, 812, 128, 196, 118, 10); ctx.fill();
  ctx.strokeStyle = COLORS.counterEdge; ctx.lineWidth = 3; ctx.stroke();
  text(ctx, 'RESEP HARI INI', 910, 146, 14, COLORS.textDark, 'bold', 'center');
  DISHES.forEach((d, i) => {
    const y = 168 + i * 19;
    drawDishIcon(ctx, d.id, 830, y, 8);
    text(ctx, d.short + '  •  ' + d.price, 846, y, 12, COLORS.textDark, 'bold');
  });
  // Hanging pans on the wall, right of the poster.
  ctx.strokeStyle = '#5a4632'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(1030, 128); ctx.lineTo(1030, 150); ctx.stroke();
  ctx.fillStyle = '#3d4450';
  ctx.beginPath(); ctx.arc(1030, 168, 16, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#6b7280';
  ctx.beginPath(); ctx.arc(1030, 168, 10, 0, Math.PI * 2); ctx.fill();
}

// --- kitchen decor: fills the empty middle floor + wall gaps (flat vector) ----
// Everything here is floor dressing only: no gameplay, no HUD changes. The
// big mat is flat (the chef walks over it); sacks, baskets and pots hug the
// bottom edge and the right-centre gap so no walk lane or station is covered.
function drawDecor(ctx) {
  // Dark-wood wall band under the HUD: the kitchen finally has a "room".
  ctx.fillStyle = '#6e4520';
  ctx.fillRect(0, 104, VIEW_W, 22);
  ctx.fillStyle = '#8a5a2b';
  ctx.fillRect(0, 104, VIEW_W, 3);
  ctx.fillStyle = '#d9a441';
  ctx.fillRect(0, 124, VIEW_W, 2);
  // Hanging lamps in the gaps between stations: cord, warm shade, glow.
  for (const lx of [280, 515]) {
    ctx.strokeStyle = '#5a4632'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(lx, 126); ctx.lineTo(lx, 152); ctx.stroke();
    ctx.fillStyle = 'rgba(242,183,5,0.18)';
    ctx.beginPath(); ctx.arc(lx, 174, 34, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#d9a441';
    ctx.beginPath();
    ctx.moveTo(lx - 16, 152); ctx.lineTo(lx + 16, 152);
    ctx.lineTo(lx + 10, 174); ctx.lineTo(lx - 10, 174);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#f2b705';
    ctx.beginPath(); ctx.arc(lx, 178, 7, 0, Math.PI * 2); ctx.fill();
  }
  // Shelf with pot/pan silhouettes above the stove, below the wall band.
  ctx.fillStyle = '#8a5a2b';
  ctx.fillRect(600, 130, 180, 6);
  ctx.fillStyle = '#6e4520';
  ctx.fillRect(612, 136, 4, 6); ctx.fillRect(764, 136, 4, 6);
  ctx.fillStyle = '#3d4450'; // hanging pans + a small pot, dark silhouettes
  ctx.beginPath(); ctx.arc(640, 146, 8, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(700, 146, 9, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(752, 146, 8, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#6b7280';
  ctx.beginPath(); ctx.arc(700, 144, 5, 0, Math.PI * 2); ctx.fill();
  // Round wall clock, top-right, right of the trash station.
  ctx.fillStyle = '#2b1d0e';
  ctx.beginPath(); ctx.arc(1225, 140, 19, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fdf6e3';
  ctx.beginPath(); ctx.arc(1225, 140, 15, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#2b1d0e'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(1225, 140); ctx.lineTo(1225, 129); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(1225, 140); ctx.lineTo(1234, 143); ctx.stroke();
  ctx.fillStyle = '#d64541';
  ctx.beginPath(); ctx.arc(1225, 140, 2, 0, Math.PI * 2); ctx.fill();
  // Framed MENU HARI INI strip under the band, left of the clock.
  ctx.fillStyle = '#6e4520';
  rr(ctx, 1040, 130, 140, 18, 4); ctx.fill();
  ctx.strokeStyle = '#d9a441'; ctx.lineWidth = 2; ctx.stroke();
  text(ctx, 'MENU HARI INI', 1110, 140, 11, COLORS.gold, 'bold', 'center');
  // Chili garland strung across the wall gap left of the board.
  ctx.strokeStyle = '#6e4520'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(140, 132);
  ctx.quadraticCurveTo(210, 152, 282, 132); ctx.stroke();
  for (let i = 0; i < 7; i++) {
    const gx = 150 + i * 20;
    const gy = 138 + Math.sin((i / 6) * Math.PI) * 8;
    ctx.fillStyle = '#d63c2f';
    ctx.beginPath(); ctx.ellipse(gx, gy + 6, 5, 9, 0.3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#3d9b4f';
    ctx.fillRect(gx - 1, gy - 2, 3, 4);
  }
  // Side table with stacked bowls + a small pot, left of the board.
  ctx.fillStyle = '#6e4520';
  ctx.fillRect(148, 232, 8, 20); ctx.fillRect(266, 232, 8, 20);
  ctx.fillStyle = '#8a5a2b';
  rr(ctx, 140, 214, 142, 20, 6); ctx.fill();
  ctx.fillStyle = '#b5773a';
  rr(ctx, 140, 214, 142, 8, 4); ctx.fill();
  for (let i = 0; i < 3; i++) { // stacked bowls, alternating glaze
    ctx.fillStyle = i % 2 ? '#2f6f5e' : '#fdf6e3';
    ctx.beginPath(); ctx.arc(178, 206 - i * 9, 16 - i * 2, 0, Math.PI); ctx.fill();
  }
  ctx.fillStyle = '#3d4450'; // small pot with lid
  ctx.beginPath(); ctx.arc(248, 200, 14, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#6b7280';
  ctx.beginPath(); ctx.arc(248, 190, 14, Math.PI, 0); ctx.fill();
  // Two woven floor mats, centre floor (flat — the chef walks over them).
  ctx.fillStyle = '#2f6f5e'; // teal runner above the big mat
  rr(ctx, 520, 340, 240, 50, 8); ctx.fill();
  ctx.fillStyle = '#3a8a72';
  rr(ctx, 530, 348, 220, 34, 6); ctx.fill();
  ctx.strokeStyle = '#f2b705'; ctx.lineWidth = 2;
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(565 + i * 52, 365);
    ctx.lineTo(578 + i * 52, 354); ctx.lineTo(591 + i * 52, 365); ctx.lineTo(578 + i * 52, 376);
    ctx.closePath(); ctx.stroke();
  }
  ctx.fillStyle = '#c98a4e'; // big terracotta mat
  rr(ctx, 480, 400, 320, 145, 10); ctx.fill();
  ctx.fillStyle = '#e8b07d';
  rr(ctx, 492, 412, 296, 121, 8); ctx.fill();
  ctx.strokeStyle = '#a06a2e'; ctx.lineWidth = 2;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(520 + i * 52, 472);
    ctx.lineTo(546 + i * 52, 446); ctx.lineTo(572 + i * 52, 472); ctx.lineTo(546 + i * 52, 498);
    ctx.closePath(); ctx.stroke();
  }
  ctx.strokeStyle = '#2f6f5e'; ctx.lineWidth = 2; // teal inner border
  rr(ctx, 504, 424, 272, 97, 6); ctx.stroke();
  // Scattered chillies + flour dust: floor decals around the mats.
  ctx.fillStyle = '#d63c2f';
  for (const [cx, cy, r] of [[500, 392, 0.4], [786, 398, -0.4], [652, 552, 0.2]]) {
    ctx.beginPath(); ctx.ellipse(cx, cy, 5, 9, r, 0, Math.PI * 2); ctx.fill();
  }
  ctx.fillStyle = 'rgba(255,248,234,0.85)'; // flour dust
  for (const [fx, fy] of [[540, 352], [700, 352], [745, 382], [500, 530], [790, 530]]) {
    ctx.beginPath(); ctx.arc(fx, fy, 3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(fx + 8, fy + 4, 2, 0, Math.PI * 2); ctx.fill();
  }
  // Side counter with spice bowls, mid-right, below the recipe poster.
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  ctx.beginPath(); ctx.ellipse(900, 434, 78, 8, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#8a5a2b'; // counter body
  rr(ctx, 830, 360, 140, 70, 8); ctx.fill();
  ctx.fillStyle = '#b5773a'; // counter top
  rr(ctx, 830, 360, 140, 14, 6); ctx.fill();
  ctx.fillStyle = '#6e4520'; // legs
  ctx.fillRect(838, 424, 8, 10); ctx.fillRect(954, 424, 8, 10);
  // Spice bowls on the counter: red spice, limes, shallots.
  ctx.fillStyle = '#fdf6e3';
  ctx.beginPath(); ctx.arc(856, 352, 11, 0, Math.PI); ctx.fill();
  ctx.fillStyle = '#d64541';
  ctx.beginPath(); ctx.arc(856, 350, 8, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fdf6e3';
  ctx.beginPath(); ctx.arc(886, 352, 11, 0, Math.PI); ctx.fill();
  ctx.fillStyle = '#7be495';
  ctx.beginPath(); ctx.arc(883, 348, 5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(890, 351, 5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fdf6e3';
  ctx.beginPath(); ctx.arc(916, 352, 11, 0, Math.PI); ctx.fill();
  ctx.fillStyle = '#c98a4e';
  ctx.beginPath(); ctx.arc(913, 349, 5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(920, 351, 5, 0, Math.PI * 2); ctx.fill();
  // Small steaming pot on the counter (second motion cue).
  ctx.fillStyle = '#3d4450';
  ctx.beginPath(); ctx.arc(950, 348, 13, 0, Math.PI); ctx.fill();
  ctx.fillRect(937, 348, 26, 8);
  ctx.fillStyle = '#6b7280';
  ctx.beginPath(); ctx.arc(950, 348, 13, Math.PI, 0); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(946, 334); ctx.quadraticCurveTo(942, 324, 946, 316); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(954, 334); ctx.quadraticCurveTo(958, 324, 954, 316); ctx.stroke();
  // Hanging rail with ladles above the counter.
  ctx.strokeStyle = '#5a4632'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(840, 302); ctx.lineTo(960, 302); ctx.stroke();
  ctx.fillStyle = '#5a4632';
  ctx.fillRect(846, 302, 3, 10); ctx.fillRect(948, 302, 3, 10);
  ctx.strokeStyle = '#8a5a2b'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(872, 302); ctx.lineTo(872, 326); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(920, 302); ctx.lineTo(920, 326); ctx.stroke();
  ctx.fillStyle = '#c8ccd4';
  ctx.beginPath(); ctx.arc(872, 330, 6, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(920, 330, 6, 0, Math.PI * 2); ctx.fill();
  // Rice sacks along the mid-left edge, between crates and talenan.
  for (const [sx, sy, sw] of [[195, 385, 56], [200, 475, 60]]) {
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.beginPath(); ctx.ellipse(sx, sy + 26, sw * 0.6, 7, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#d9c9a3';
    rr(ctx, sx - sw / 2, sy - 22, sw, 48, 10); ctx.fill();
    ctx.strokeStyle = '#a08c5f'; ctx.lineWidth = 2;
    rr(ctx, sx - sw / 2, sy - 22, sw, 48, 10); ctx.stroke();
    ctx.fillStyle = '#c9b183'; // tied neck
    ctx.beginPath();
    ctx.moveTo(sx - 12, sy - 20); ctx.lineTo(sx + 12, sy - 20);
    ctx.lineTo(sx + 7, sy - 34); ctx.lineTo(sx - 7, sy - 34);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#8a5a2b'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(sx - 10, sy - 24); ctx.lineTo(sx + 10, sy - 24); ctx.stroke();
    ctx.fillStyle = '#f5f0dc'; // spilled grains
    for (let i = 0; i < 5; i++) {
      ctx.beginPath(); ctx.arc(sx - 18 + i * 9, sy + 30, 2.5, 0, Math.PI * 2); ctx.fill();
    }
  }
  // Chili baskets: woven basket mounded with red chilies.
  for (const [bx, by] of [[215, 545], [600, 628]]) {
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.beginPath(); ctx.ellipse(bx, by + 16, 34, 6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#a06a2e';
    ctx.beginPath(); ctx.arc(bx, by + 4, 30, 0, Math.PI); ctx.fill();
    ctx.fillStyle = '#8a5a2e';
    ctx.fillRect(bx - 30, by + 2, 60, 6);
    ctx.fillStyle = '#d63c2f';
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath(); ctx.ellipse(bx + i * 11, by - 4, 6, 10, i * 0.25, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = '#3d9b4f';
    for (let i = -2; i <= 2; i++) ctx.fillRect(bx + i * 11 - 1, by - 14, 3, 5);
  }
  // Small round woven mat, bottom-centre floor.
  ctx.fillStyle = '#c98a4e';
  ctx.beginPath(); ctx.arc(730, 620, 38, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#e8b07d';
  ctx.beginPath(); ctx.arc(730, 620, 30, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#a06a2e'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(730, 620, 20, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.arc(730, 620, 10, 0, Math.PI * 2); ctx.stroke();
  // Sink + clean plates + potted plant, bottom-left corner.
  ctx.fillStyle = '#8a5a2b'; // sink backsplash + basin
  rr(ctx, 28, 600, 112, 14, 4); ctx.fill();
  ctx.fillStyle = '#c8ccd4';
  rr(ctx, 28, 614, 112, 62, 8); ctx.fill();
  ctx.fillStyle = '#9aa0ab';
  rr(ctx, 38, 622, 92, 46, 6); ctx.fill();
  ctx.fillStyle = '#6b7280'; // faucet
  ctx.fillRect(126, 600, 6, 22);
  ctx.fillRect(108, 600, 24, 6);
  ctx.fillRect(108, 600, 6, 12);
  ctx.fillStyle = '#7fb3d5'; // water
  ctx.beginPath(); ctx.arc(84, 645, 26, 0, Math.PI); ctx.fill();
  // Stack of clean plates beside the sink.
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = '#fdf6e3';
    ctx.beginPath(); ctx.ellipse(188, 672 - i * 7, 26, 8, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#d9c9a3'; ctx.lineWidth = 1;
    ctx.stroke();
  }
  // Potted plant.
  ctx.fillStyle = '#c65a1e';
  ctx.beginPath(); ctx.moveTo(232, 652); ctx.lineTo(258, 652); ctx.lineTo(253, 676); ctx.lineTo(237, 676); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#58a34a';
  ctx.beginPath(); ctx.ellipse(245, 640, 7, 14, 0.3, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(238, 644, 6, 11, -0.4, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(253, 644, 6, 11, 0.4, 0, Math.PI * 2); ctx.fill();
  // Small crate of greens, bottom band right of the round mat.
  ctx.fillStyle = '#a06a2e';
  rr(ctx, 820, 612, 80, 56, 6); ctx.fill();
  ctx.fillStyle = '#8a5a2e';
  rr(ctx, 820, 612, 80, 12, 6); ctx.fill();
  ctx.fillStyle = '#58a34a';
  ctx.beginPath(); ctx.arc(845, 606, 12, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(868, 602, 13, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(888, 608, 11, 0, Math.PI * 2); ctx.fill();
  // Small dining corner, bottom-right, below the serving table.
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  ctx.beginPath(); ctx.ellipse(1140, 668, 52, 8, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fdf6e3'; // round table top
  ctx.beginPath(); ctx.arc(1140, 625, 46, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#d64541'; ctx.lineWidth = 10; // checkered cloth rim
  ctx.beginPath(); ctx.arc(1140, 625, 41, 0, Math.PI * 2); ctx.stroke();
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    ctx.fillStyle = '#fdf6e3';
    ctx.fillRect(1140 + Math.cos(a) * 41 - 5, 625 + Math.sin(a) * 41 - 5, 11, 11);
  }
  ctx.fillStyle = '#fdf6e3';
  ctx.beginPath(); ctx.arc(1140, 625, 32, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#e8b07d'; // tiny plate in the middle
  ctx.beginPath(); ctx.arc(1140, 625, 10, 0, Math.PI * 2); ctx.fill();
  // Two stools flanking the table.
  for (const sx of [1058, 1222]) {
    ctx.fillStyle = '#8a5a2b';
    ctx.beginPath(); ctx.arc(sx, 618, 16, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#b5773a';
    ctx.beginPath(); ctx.arc(sx, 618, 11, 0, Math.PI * 2); ctx.fill();
  }
}

function drawStation(ctx, key, k) {
  const s = STATIONS[key];
  const cx = s.x + s.w / 2, cy = s.y + s.h / 2;
  ctx.save();
  if (k.nearest === key) { // highlight the station in reach
    ctx.fillStyle = 'rgba(242,183,5,0.35)';
    rr(ctx, s.x - 8, s.y - 8, s.w + 16, s.h + 16, 12); ctx.fill();
  }
  if (s.kind === 'crate') {
    ctx.fillStyle = COLORS.crate;
    rr(ctx, s.x, s.y, s.w, s.h, 8); ctx.fill();
    ctx.fillStyle = COLORS.counterTop;
    rr(ctx, s.x, s.y, s.w, 16, 8); ctx.fill();
    drawIngredientIcon(ctx, key, cx, cy - 8, 24);
    text(ctx, s.label, cx, s.y + s.h - 12, 14, COLORS.textLight, 'bold', 'center');
  } else if (s.kind === 'board') {
    ctx.fillStyle = COLORS.counter;
    rr(ctx, s.x, s.y, s.w, s.h, 8); ctx.fill();
    ctx.fillStyle = COLORS.board;
    rr(ctx, s.x + 12, s.y + 12, s.w - 24, s.h - 40, 6); ctx.fill();
    if (k.chop.item) {
      drawIngredientIcon(ctx, k.chop.item, cx, cy - 6, 26);
      ctx.fillStyle = '#2b1d0e';
      ctx.fillRect(cx - 45, cy + 22, 90, 8);
      ctx.fillStyle = '#f2b705';
      ctx.fillRect(cx - 45, cy + 22, 90 * (k.chop.progress / 1.4), 8);
    } else {
      // Knife resting on the board.
      ctx.fillStyle = '#c8ccd4';
      ctx.fillRect(cx - 30, cy - 8, 60, 8);
      ctx.fillStyle = '#5a4632';
      ctx.fillRect(cx + 28, cy - 8, 18, 8);
    }
    text(ctx, s.label, cx, s.y + s.h - 10, 13, COLORS.textLight, 'bold', 'center');
  } else if (s.kind === 'stove') {
    ctx.fillStyle = COLORS.stove;
    rr(ctx, s.x, s.y, s.w, s.h, 8); ctx.fill();
    const cooking = k.wok.cooking > 0 || k.wok.burn > 0 || k.wok.items.length > 0;
    // Wok bowl.
    ctx.fillStyle = '#23272e';
    ctx.beginPath(); ctx.arc(cx, cy - 4, 52, 0, Math.PI); ctx.fill();
    ctx.fillStyle = '#454c59';
    ctx.beginPath(); ctx.ellipse(cx, cy - 4, 52, 12, 0, 0, Math.PI * 2); ctx.fill();
    if (cooking) { // flame tongues at the wok's sides, clear of the centre label
      for (const side of [-1, 1]) {
        const fx = cx + side * 58;
        ctx.fillStyle = '#f2762e';
        ctx.beginPath();
        ctx.moveTo(fx - 14, s.y + s.h - 4);
        ctx.quadraticCurveTo(fx - 10, s.y + s.h - 34, fx, s.y + s.h - 16);
        ctx.quadraticCurveTo(fx + 10, s.y + s.h - 34, fx + 14, s.y + s.h - 4);
        ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#f2b705';
        ctx.beginPath();
        ctx.moveTo(fx - 7, s.y + s.h - 4);
        ctx.quadraticCurveTo(fx - 4, s.y + s.h - 20, fx, s.y + s.h - 10);
        ctx.quadraticCurveTo(fx + 4, s.y + s.h - 20, fx + 7, s.y + s.h - 4);
        ctx.closePath(); ctx.fill();
      }
    }
    if (k.wok.dish) {
      drawDishIcon(ctx, k.wok.dish, cx, cy - 10, 30);
    } else if (k.wok.items.length > 0) {
      k.wok.items.forEach((id, i) => drawIngredientIcon(ctx, id, cx - 26 + i * 26, cy - 10, 15));
    }
    if (k.wok.cooking > 0) { // steam curls + progress ring
      ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 3;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(cx - 24 + i * 24, cy - 44);
        ctx.quadraticCurveTo(cx - 30 + i * 24, cy - 62, cx - 22 + i * 24, cy - 76);
        ctx.stroke();
      }
      const pct = 1 - k.wok.cooking / 2.6;
      ctx.fillStyle = '#2b1d0e';
      ctx.fillRect(cx - 40, s.y + 8, 80, 7);
      ctx.fillStyle = '#f2b705';
      ctx.fillRect(cx - 40, s.y + 8, 80 * pct, 7);
      text(ctx, 'MASAK...', cx, s.y + 26, 11, COLORS.textLight, 'bold', 'center');
    }
    if (k.wok.burn > 0) {
      ctx.fillStyle = '#3a3a3a';
      ctx.beginPath(); ctx.arc(cx, cy - 30, 18, 0, Math.PI * 2); ctx.fill();
      text(ctx, 'GOSONG!', cx, s.y + 26, 12, '#ff9d9d', 'bold', 'center');
    }
    text(ctx, s.label, cx, s.y + s.h - 10, 13, COLORS.textLight, 'bold', 'center');
  } else if (s.kind === 'plating') {
    ctx.fillStyle = COLORS.counter;
    rr(ctx, s.x, s.y, s.w, s.h, 8); ctx.fill();
    ctx.fillStyle = COLORS.counterTop;
    rr(ctx, s.x + 8, s.y + 8, s.w - 16, s.h - 36, 6); ctx.fill();
    if (k.plate.dish) {
      drawDishIcon(ctx, k.plate.dish, cx, cy - 4, 30);
      ctx.fillStyle = '#3d9b4f';
      ctx.beginPath(); ctx.arc(cx + 26, cy - 30, 12, 0, Math.PI * 2); ctx.fill();
      text(ctx, '✓', cx + 26, cy - 29, 14, '#fff', 'bold', 'center');
    } else {
      ctx.fillStyle = COLORS.plate;
      ctx.beginPath(); ctx.arc(cx, cy - 4, 26, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#d9c9a3'; ctx.lineWidth = 2; ctx.stroke();
    }
    text(ctx, s.label, cx, s.y + s.h - 10, 13, COLORS.textLight, 'bold', 'center');
  } else if (s.kind === 'pass') {
    ctx.fillStyle = COLORS.pass;
    rr(ctx, s.x, s.y, s.w, s.h, 10); ctx.fill();
    ctx.fillStyle = '#3a8a72';
    rr(ctx, s.x + 10, s.y + 10, s.w - 20, s.h - 48, 8); ctx.fill();
    // Service bell.
    ctx.fillStyle = '#f2b705';
    ctx.beginPath(); ctx.arc(cx, cy - 30, 20, Math.PI, 0); ctx.fill();
    ctx.fillRect(cx - 20, cy - 32, 40, 6);
    ctx.fillStyle = '#d9a441';
    ctx.beginPath(); ctx.arc(cx + 26, cy - 28, 4, 0, Math.PI * 2); ctx.fill();
    text(ctx, 'MEJA SAJI', cx, cy + 8, 18, '#fff', 'bold', 'center');
    text(ctx, 'antar hidangan ke sini', cx, cy + 30, 13, '#d8f3e3', 'bold', 'center');
    text(ctx, '★ PESANAN ★', cx, cy + 52, 13, '#f2b705', 'bold', 'center');
    text(ctx, s.label, cx, s.y + s.h - 12, 12, '#fff', 'bold', 'center');
  } else if (s.kind === 'trash') {
    ctx.fillStyle = '#6b7280';
    rr(ctx, s.x, s.y, s.w, s.h, 8); ctx.fill();
    ctx.fillStyle = '#4b5563';
    rr(ctx, s.x + 10, s.y + 10, s.w - 20, s.h - 34, 6); ctx.fill();
    text(ctx, '✕', cx, cy - 6, 26, '#fff', 'bold', 'center');
    text(ctx, s.label, cx, s.y + s.h - 10, 13, COLORS.textLight, 'bold', 'center');
  }
  ctx.restore();
}

function drawPlayer(ctx, k) {
  const p = k.player;
  const bob = p.walking ? Math.sin(Date.now() / 90) * 2 : 0;
  ctx.save();
  ctx.translate(p.x, p.y + bob);
  // Shadow.
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath(); ctx.ellipse(0, 22, 26, 8, 0, 0, Math.PI * 2); ctx.fill();
  // Body + apron.
  ctx.fillStyle = '#fff8ea';
  ctx.beginPath(); ctx.arc(0, 4, 22, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#2f6f5e';
  ctx.fillRect(-14, 0, 28, 20);
  // Head + chef hat.
  ctx.fillStyle = '#f2c79b';
  ctx.beginPath(); ctx.arc(0, -22, 15, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(-8, -34, 9, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(0, -37, 10, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(8, -34, 9, 0, Math.PI * 2); ctx.fill();
  ctx.fillRect(-14, -36, 28, 8);
  // Eyes look toward facing.
  ctx.fillStyle = '#2b1d0e';
  ctx.beginPath(); ctx.arc(p.face * 5 - 4, -22, 2, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(p.face * 5 + 5, -22, 2, 0, Math.PI * 2); ctx.fill();
  // Carried items above the hat.
  k.carrying.forEach((id, i) => {
    const x = (i - (k.carrying.length - 1) / 2) * 30;
    ctx.fillStyle = 'rgba(255,248,234,0.95)';
    ctx.beginPath(); ctx.arc(x, -58, 13, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#d9a441'; ctx.lineWidth = 2; ctx.stroke();
    if (id.startsWith('dish:')) drawDishIcon(ctx, id.slice(5), x, -58, 9);
    else drawIngredientIcon(ctx, id, x, -58, 9);
  });
  ctx.restore();
}

// --- HUD: order board, big timer, coins, combo, stars ------------------------
function drawHUD(ctx, k) {
  ctx.fillStyle = '#2b1d0e';
  ctx.fillRect(0, 0, VIEW_W, HUD_H);
  ctx.fillStyle = COLORS.gold;
  ctx.fillRect(0, HUD_H - 4, VIEW_W, 4);
  // Game name, small in the corner (title lives here, not on an intro screen).
  text(ctx, 'DAPUR NUSA', 16, 22, 22, COLORS.gold, 'bold');
  text(ctx, 'HARI ' + (k.dayIndex + 1) + ' / 3', 16, 48, 14, COLORS.textLight, 'bold');
  // Stars.
  let stars = '';
  for (let i = 0; i < 3; i++) stars += i < k.stars ? '★' : '☆';
  text(ctx, stars, 16, 74, 20, '#f2b705', 'bold');
  // Order cards.
  const cardW = 196, cardH = 84, gap = 8, startX = 176;
  k.board.orders.forEach((o, i) => {
    const x = startX + i * (cardW + gap), y = 10;
    const dish = dishById(o.dishId);
    const frac = Math.max(0, o.timeLeft / o.timeMax);
    const urgent = o.timeLeft < 15;
    ctx.fillStyle = urgent && Math.floor(Date.now() / 400) % 2 === 0 ? '#5e1f1a' : '#fff8ea';
    rr(ctx, x, y, cardW, cardH, 10); ctx.fill();
    ctx.strokeStyle = urgent ? COLORS.red : '#d9c9a3'; ctx.lineWidth = 2; ctx.stroke();
    drawDishIcon(ctx, o.dishId, x + 30, y + 30, 22);
    text(ctx, dish.name, x + 58, y + 20, 14, COLORS.textDark, 'bold');
    text(ctx, dish.price + ' KOPI', x + 58, y + 40, 12, '#8a5a2b', 'bold');
    ctx.fillStyle = '#e5d9bd';
    ctx.fillRect(x + 12, y + 62, cardW - 24, 10);
    ctx.fillStyle = frac > 0.5 ? COLORS.green : frac > 0.25 ? '#e8a13c' : COLORS.red;
    ctx.fillRect(x + 12, y + 62, (cardW - 24) * frac, 10);
    text(ctx, fmtTime(o.timeLeft), x + cardW - 14, y + 40, 16, urgent ? COLORS.red : COLORS.textDark, 'bold', 'right');
  });
  if (k.board.orders.length === 0) {
    text(ctx, 'Menunggu pesanan pertama...', startX + 10, 52, 15, '#cbb98f', 'bold');
  }
  // Big shift timer, top-right.
  const tx = 1010;
  text(ctx, 'SHIFT', tx, 20, 12, '#cbb98f', 'bold');
  text(ctx, fmtTime(k.shiftLeft), tx, 48, 34, k.shiftLeft < 30 ? '#ff6b5e' : '#fff8ea', 'bold');
  const shiftFrac = Math.max(0, k.shiftLeft / k.day.shift);
  ctx.fillStyle = '#4a3a22';
  ctx.fillRect(tx, 68, 120, 8);
  ctx.fillStyle = shiftFrac > 0.3 ? COLORS.gold : COLORS.red;
  ctx.fillRect(tx, 68, 120 * shiftFrac, 8);
  // Coins + combo.
  text(ctx, '◉ ' + k.board.coins + ' KOPI', 1150, 22, 16, COLORS.gold, 'bold');
  text(ctx, k.board.combo > 1 ? 'KOMBO x' + k.board.combo : 'KOMBO —', 1150, 48, 14, '#7be495', 'bold');
  text(ctx, 'Target: ' + k.board.servedToday + '/' + k.day.quota + ' sajian', 1150, 74, 13, COLORS.textLight, 'bold');
}

// --- overlays ------------------------------------------------------------------
function dimOverlay(ctx, alpha) {
  ctx.fillStyle = 'rgba(20,12,4,' + alpha + ')';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
}

function centerPanel(ctx, w, h) {
  ctx.fillStyle = 'rgba(43,29,14,0.96)';
  rr(ctx, (VIEW_W - w) / 2, (VIEW_H - h) / 2, w, h, 18); ctx.fill();
  ctx.strokeStyle = COLORS.gold; ctx.lineWidth = 3; ctx.stroke();
}

export function render(ctx, k) {
  drawFloor(ctx);
  drawDecor(ctx);
  for (const key of Object.keys(STATIONS)) drawStation(ctx, key, k);
  // Walk-target marker.
  if (k.moveTarget) {
    ctx.strokeStyle = 'rgba(242,183,5,0.9)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(k.moveTarget.x, k.moveTarget.y, 10, 0, Math.PI * 2); ctx.stroke();
  }
  drawPlayer(ctx, k);
  // Floating score texts.
  for (const f of k.floats) {
    ctx.globalAlpha = Math.min(1, f.life);
    text(ctx, f.text, f.x, f.y - (1.4 - f.life) * 30, 22, f.color, 'bold', 'center');
    ctx.globalAlpha = 1;
  }
  drawHUD(ctx, k);
  // Controls hint, one line at the bottom, on a light strip so it reads.
  ctx.fillStyle = 'rgba(255,248,234,0.92)';
  ctx.fillRect(0, VIEW_H - 26, VIEW_W, 26);
  text(ctx, 'WASD / panah: gerak   •   E / Spasi: ambil • potong • masak • sajikan   •   Klik: jalan ke stasiun   •   M: suara',
    VIEW_W / 2, VIEW_H - 13, 13, COLORS.textDark, 'bold', 'center');
  // Banner message (drawn over the open floor, clear of the stations).
  if (k.message) {
    ctx.globalAlpha = Math.min(1, k.message.life);
    const w = ctx.measureText(k.message.text).width + 40;
    ctx.fillStyle = 'rgba(43,29,14,0.92)';
    rr(ctx, (VIEW_W - w) / 2, 300, w, 40, 12); ctx.fill();
    text(ctx, k.message.text, VIEW_W / 2, 321, 17, k.message.color, 'bold', 'center');
    ctx.globalAlpha = 1;
  }

  if (k.phase === 'title') {
    dimOverlay(ctx, 0.55);
    centerPanel(ctx, 760, 430);
    const cx = VIEW_W / 2, top = (VIEW_H - 430) / 2;
    text(ctx, 'DAPUR NUSA', cx, top + 62, 58, COLORS.gold, 'bold', 'center');
    text(ctx, 'Dapur Indonesia: terima pesanan, potong, masak di wok, sajikan!', cx, top + 112, 19, '#fff8ea', 'bold', 'center');
    text(ctx, '4 hidangan  •  5 bahan  •  kombo koin  •  3 hari, makin ramai', cx, top + 146, 16, '#cbb98f', 'bold', 'center');
    DISHES.forEach((d, i) => {
      const x = cx - 300 + i * 200;
      drawDishIcon(ctx, d.id, x, top + 205, 34);
      text(ctx, d.name, x, top + 252, 14, '#fff8ea', 'bold', 'center');
      text(ctx, d.blurb, x, top + 274, 12, '#cbb98f', 'bold', 'center');
      text(ctx, d.price + ' KOPI', x, top + 294, 13, COLORS.gold, 'bold', 'center');
    });
    text(ctx, 'WASD / panah bergerak  •  E ambil & pakai stasiun  •  Klik stasiun untuk jalan ke sana', cx, top + 336, 15, '#fff8ea', 'bold', 'center');
    text(ctx, 'Sajikan sebelum timer habis — 3 pesanan hangus = hari gagal!', cx, top + 362, 15, '#ff9d9d', 'bold', 'center');
    text(ctx, '▶  TEKAN ENTER ATAU KLIK UNTUK MULAI  ◀', cx, top + 398, 18, '#7be495', 'bold', 'center');
  } else if (k.phase === 'dayclear') {
    dimOverlay(ctx, 0.5);
    centerPanel(ctx, 560, 260);
    const cx = VIEW_W / 2, top = (VIEW_H - 260) / 2;
    text(ctx, 'HARI ' + (k.dayIndex + 1) + ' SELESAI!', cx, top + 60, 40, COLORS.gold, 'bold', 'center');
    text(ctx, k.board.servedToday + ' sajian  •  ' + k.board.coins + ' KOPI  •  kombo terbaik x' + k.board.comboBest,
      cx, top + 118, 19, '#fff8ea', 'bold', 'center');
    text(ctx, k.dayIndex + 1 >= 3 ? 'Hari terakhir selesai — terima kasih, Koki!' : 'Hari berikutnya makin ramai...', cx, top + 158, 17, '#cbb98f', 'bold', 'center');
    text(ctx, '★'.repeat(Math.max(1, k.stars)) + '☆'.repeat(3 - Math.max(1, k.stars)), cx, top + 205, 30, '#f2b705', 'bold', 'center');
  } else if (k.phase === 'failed') {
    dimOverlay(ctx, 0.55);
    centerPanel(ctx, 560, 240);
    const cx = VIEW_W / 2, top = (VIEW_H - 240) / 2;
    text(ctx, 'HARI GAGAL', cx, top + 60, 40, '#ff6b5e', 'bold', 'center');
    text(ctx, 'Pesanan hangus atau shift habis — coba lagi, Koki!', cx, top + 118, 18, '#fff8ea', 'bold', 'center');
    text(ctx, 'Mengulang hari ini...', cx, top + 165, 16, '#cbb98f', 'bold', 'center');
  } else if (k.phase === 'win') {
    dimOverlay(ctx, 0.6);
    centerPanel(ctx, 700, 340);
    const cx = VIEW_W / 2, top = (VIEW_H - 340) / 2;
    text(ctx, '★ ★ ★', cx, top + 52, 34, '#f2b705', 'bold', 'center');
    text(ctx, 'DAPUR NUSA — 3 HARI SELESAI!', cx, top + 108, 36, COLORS.gold, 'bold', 'center');
    text(ctx, 'Koki Hebat! Semua shift berhasil dilewati.', cx, top + 158, 19, '#fff8ea', 'bold', 'center');
    text(ctx, 'Total: ' + k.board.coins + ' KOPI  •  Kombo terbaik x' + k.board.comboBest, cx, top + 196, 18, '#cbb98f', 'bold', 'center');
    text(ctx, 'Tekan ENTER untuk main lagi', cx, top + 252, 16, '#7be495', 'bold', 'center');
    text(ctx, 'Terima kasih sudah memasak di Dapur Nusa!', cx, top + 292, 15, '#cbb98f', 'bold', 'center');
  }
}
