// Vice Dusk Cover Studio — entry program (gta6-cover-art-01).
// Copies app/ and screenshots/ from this repository into the output
// directory and writes dossier.json with buildDossier from
// ./vendor/makefun-app.ts. Node standard library only; no install step.
// The output directory is MAKEFUN_OUTPUT_DIR when set, else /output.
import { buildDossier } from './vendor/makefun-app.ts';
import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = dirname(fileURLToPath(import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR || '/output';

function copyTree(name: string): void {
  const from = join(repoRoot, name);
  const to = join(outDir, name);
  if (!existsSync(from)) {
    throw new Error(`main.ts: ${name}/ is missing from the repository`);
  }
  cpSync(from, to, { recursive: true });
}

function main(): void {
  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir, { recursive: true });
  copyTree('app');
  copyTree('screenshots');
  const dossier = buildDossier(outDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  });
  writeFileSync(join(outDir, 'dossier.json'), dossier);
  console.log(`vice-dusk: wrote ${outDir} (app/ + screenshots/ + dossier.json, ${dossier.length} bytes)`);
}

main();
