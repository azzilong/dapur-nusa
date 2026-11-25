// main.ts — Dapur Nusa entry program (Node 22, standard library only).
// Hands the game in: copies game/ and screenshots/ from beside this file into
// the output directory and writes /output/dossier.json with the vendored
// make.fun library. The output directory is never removed first (it may be a
// bind mount); files are copied over it instead.
//
// Local check:  mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Grader:       MAKEFUN_OUTPUT_DIR is unset, so /output is used.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function handIn() {
  mkdirSync(outputDir, { recursive: true });
  cpSync(join(repoRoot, 'game'), join(outputDir, 'game'), { recursive: true });
  mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
  const shots = join(repoRoot, 'screenshots');
  if (existsSync(shots)) cpSync(shots, join(outputDir, 'screenshots'), { recursive: true });

  // Gate caps from the competition bundle: dossier text 160 KiB, at most 4
  // screenshots of 256 KiB, game/ at most 993 entries / 48 MiB / 1000-byte paths.
  const dossier = buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  });
  writeFileSync(join(outputDir, 'dossier.json'), dossier);
}

handIn();
