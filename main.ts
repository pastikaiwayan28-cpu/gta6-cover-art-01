// Vice Nights — the gta6-cover-art-01 entry (Node 22, standard library only). The app is
// this directory's app/ folder: plain static files a desktop browser loads offline
// (app/index.html and its ES modules, no library, no network request). This program hands
// it in: it copies app/ and screenshots/ from beside this file to /output and writes
// /output/dossier.json, the summary the judge reads, with the vendored make.fun library.
//
// The app is a multi-panel GTA-style cover maker: 3 layouts (Hero/Grid/Strip), 3 colour
// grades (Sunset/Neon/Vice), 3 photo slots plus the kit's free sample photos, a caption in
// Anton (OFL, vendored under app/fonts/), and PNG export at 1080x1080, 1080x1350 and
// 1920x1080. screenshots/ holds 4 JPEGs taken with headless Chromium (the first by name is
// the cover). The README.md was written by the same recorded session that built the app.
//
// Serve it locally with `node serve.ts`, then open http://localhost:8080.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// An entry with no screenshots is invalid, so fail loudly instead of handing in an
// empty screenshots/ folder: the screenshots are the judge's first look at the app.
const shotFiles = readdirSync(join(out, 'screenshots')).filter((f) => !f.startsWith('.'));
if (shotFiles.length < 3) throw new Error(`expected at least 3 screenshots, found ${shotFiles.length}`);

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the bytes; the
// others refuse an entry the scorer would refuse (more than 4 screenshots or one over
// 256 KiB; more than 993 files in app/ or 48 MiB of app files, in all, or a path under
// app/ over 1000 bytes: app/ counts beside /output's own 1000-entry cap, its screenshots/
// and dossier.json).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
    app_path_max_bytes: 1000,
  }),
);
