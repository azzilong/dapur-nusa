// recipes.js — Dapur Nusa: ingredients and dishes.
// Item ids: plain ingredients, and chopped ones suffixed "_potong".
// A dish is the exact set of items the wok must hold; order does not matter.

export const INGREDIENTS = {
  rice:    { id: 'rice',    name: 'Nasi',   color: '#f5f0dc', chop: false, emoji: '🍚' },
  chicken: { id: 'chicken', name: 'Ayam',   color: '#f2b27d', chop: true,  emoji: '🍗' },
  chili:   { id: 'chili',   name: 'Cabai',  color: '#d63c2f', chop: true,  emoji: '🌶️' },
  egg:     { id: 'egg',     name: 'Telur',  color: '#ffe9a8', chop: false, emoji: '🥚' },
  veg:     { id: 'veg',     name: 'Sayur',  color: '#58a34a', chop: true,  emoji: '🥬' },
};

export function choppedId(id) { return id + '_potong'; }
export function choppedName(id) { return INGREDIENTS[id].name + ' potong'; }
export function isChopped(id) { return id.endsWith('_potong'); }
export function baseId(id) { return isChopped(id) ? id.slice(0, -7) : id; }

// Which crate each ingredient comes from (crate station key = ingredient id).
export const CRATE_ITEMS = ['rice', 'chicken', 'chili', 'egg', 'veg'];

export const DISHES = [
  {
    id: 'nasi-goreng', name: 'Nasi Goreng Nusa', short: 'NASI GORENG',
    needs: ['rice', 'egg', 'chili_potong'],
    price: 120, color: '#e07830', icon: '🍛',
    blurb: 'Nasi + telur + cabai potong',
  },
  {
    id: 'ayam-bakar', name: 'Ayam Bakar Kilau', short: 'AYAM BAKAR',
    needs: ['chicken_potong', 'chili_potong', 'veg_potong'],
    price: 150, color: '#c65a1e', icon: '🍗',
    blurb: 'Ayam + cabai + sayur potong',
  },
  {
    id: 'soto-kilat', name: 'Soto Kilat', short: 'SOTO KILAT',
    needs: ['chicken_potong', 'veg_potong', 'egg'],
    price: 140, color: '#e8b93c', icon: '🍲',
    blurb: 'Ayam + sayur potong + telur',
  },
  {
    id: 'mie-goreng', name: 'Mie Goreng Rimba', short: 'MIE GORENG',
    needs: ['egg', 'veg_potong', 'chili_potong'],
    price: 130, color: '#d98e2b', icon: '🍜',
    blurb: 'Telur + sayur + cabai potong',
  },
];

// Find the dish whose needs exactly match a sorted list of wok items.
export function matchDish(items) {
  const key = [...items].sort().join('+');
  return DISHES.find((d) => [...d.needs].sort().join('+') === key) || null;
}

export function dishById(id) { return DISHES.find((d) => d.id === id) || null; }

// Short label for a carried item, shown above the cook.
export function itemLabel(id) {
  if (isChopped(id)) return choppedName(baseId(id));
  return INGREDIENTS[id] ? INGREDIENTS[id].name : id;
}

export function itemColor(id) {
  const base = INGREDIENTS[baseId(id)];
  return base ? base.color : '#cccccc';
}
