# Vice Dusk Cover Studio

[![Make GTA 6 Cover Art](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![Rank](https://make.fun/badge/gta6-cover-art-01/pastikaiwayan28-cpu/gta6-cover-art-01/rank.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![Reward](https://make.fun/badge/gta6-cover-art-01/pastikaiwayan28-cpu/gta6-cover-art-01/reward.svg)](https://make.fun/bounty/gta6-cover-art-01)

An offline web app that turns your photos into neon-sunset poster cover art — the multi-panel poster look with bold caption lettering, exported as a PNG to share. Built for the [Make GTA 6 Cover Art](https://make.fun/bounty/gta6-cover-art-01) bounty on make.fun.

## What it does

- **Any photo:** upload your own photos (read locally, never uploaded) or use the two bundled samples (Boulevard, Pier). Each panel can use a different photo.
- **Crop and position:** every panel has its own zoom and shift sliders, so you can frame each photo exactly how you want it.
- **Four layouts:** Marquee (one big hero panel over two small ones), Columns (three tall panels), Duo (two panels with a caption band), and Solo (one full-bleed photo).
- **Four sunset grades:** Vice Dusk (magenta-to-amber sunset wash), Neon Palms (teal and pink neon), Gold Hour (warm amber), and Mono Noir (high-contrast black and white) — each with a strength slider.
- **Caption:** a bold title and subtitle in your own words, with size, placement (top or bottom), and colour controls.
- **Fast and easy:** pick a layout, pick a grade, type a caption, hit Download PNG. Exports at 1080 × 1080, 1080 × 1350, or 1920 × 1080.

## Run it

Serve `app/` with any static server and open `app/index.html` in desktop Chrome. No build step, no network requests — every script, style, image, and sample is a file under `app/`.

```sh
cd app
python3 -m http.server 8080
```

Then open <http://localhost:8080> and make a cover.

A clean cover-only view is available for screenshots: open `app/index.html?view=cover&layout=columns&grade=neon&size=1080x1350` (any layout, grade, and size work as parameters, plus `title` and `subtitle`).

## How it is built

- `app/index.html` — the editor page: photo uploads, panel controls, grade buttons, caption fields, and the live preview canvas.
- `app/look.css` — the editor's dark dusk theme.
- `app/src/presets.js` — the data: four layouts, four grades, three export sizes, and the sample photos.
- `app/src/painter.js` — the renderer: cover-fit photo drawing per panel, the sunset grade wash, the caption scrim, bold lettering, and the corner tag. Plain Canvas 2D.
- `app/src/studio.js` — the wiring: editor state, photo loading, every control, PNG export, and the cover-only view.
- `main.ts` — the entry program: copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with `buildDossier` from `vendor/makefun-app.ts` (Node standard library only).
- `screenshots/` — 3–4 screenshots taken with the app itself: the cover first, then the editor with a photo loaded.

## Originality

Everything here is original work made for this bounty. No Rockstar Games logo, wordmark, official artwork, character, or font from any game is used. The caption lettering uses the system heavy sans-serif stack, and the two sample photos under `app/samples/` were made for make.fun and are free to use.

## License

MIT — see `LICENSE`.
