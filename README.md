[![make.fun · best-cooking-game-20261125-0137](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/azzilong/dapur-nusa/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/azzilong/dapur-nusa/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)

# Dapur Nusa — Indonesian Kitchen: Orders, Wok & Plating

> **Submission title draft:** Dapur Nusa — Indonesian kitchen orders, wok cooking and plating

An original 2D top-down cooking game. You are the cook of a small Indonesian
kitchen (*dapur*): take orders from the board, grab ingredients from the
crates, chop them on the board, fry them in the wok, plate the dish and serve
it at the pass — before the order timer runs out.

## How to play

- **Move:** WASD or arrow keys (or click a spot / station to walk there)
- **Interact:** E or Space — pick up, chop, cook, plate, serve
- **Goal:** serve the daily quota of dishes across 3 days. Days get faster and
  busier. An expired order costs a star; lose all 3 stars (or run out the
  shift) and the day restarts.

## The loop

1. An order appears on the board (dish + countdown).
2. Grab its ingredients from the crates on the left wall (rice, chicken,
   chili, egg, vegetables — up to 3 in hand).
3. Chop what needs chopping at the talenan (chopping board).
4. Drop the exact recipe into the wok. A matching set cooks into the dish;
   a wrong mix burns.
5. Take the cooked dish to the plating counter, then carry the plated dish to
   the serving pass. Served dishes pay coins; serving in a row builds a combo
   multiplier.

## Dishes (all original, Indonesian-inspired)

| Dish | Recipe | Price |
| --- | --- | --- |
| Nasi Goreng Nusa | rice + egg + chopped chili | 120 KOPI |
| Ayam Bakar Kilau | chopped chicken + chopped chili + chopped veg | 150 KOPI |
| Soto Kilat | chopped chicken + chopped veg + egg | 140 KOPI |
| Mie Goreng Rimba | egg + chopped veg + chopped chili | 130 KOPI |

## Tech

- Pure static files under `game/` — no build step, no network, no external
  assets. All art is canvas vector shapes; all sound is procedural WebAudio
  (sizzle, chop, ding, coin jingle).
- Source is split one job per file: `config.js` (layout + tuning),
  `recipes.js` (ingredients + dishes), `orders.js` (order board + scoring),
  `kitchen.js` (world + interaction rules), `input.js`, `audio.js`,
  `render.js` (all drawing), `main.js` (loop + screenshot scenes).
- `?scene=cover|play|serve|end` freezes a staged kitchen for screenshots.
- `main.ts` (Node 22 stdlib only) copies `game/` + `screenshots/` to
  `/output` and writes `dossier.json` via `vendor/makefun-game.ts`.

## Play locally

```sh
python3 -m http.server 8080 --directory game
# open http://localhost:8080
```

## Bounty

Built for [make.fun — Make the best cooking game](https://make.fun/bounty/best-cooking-game-20261125-0137) (`best-cooking-game-20261125-0137`).

## License

MIT — see [LICENSE](LICENSE).
