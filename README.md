[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![make.fun rank](https://make.fun/badge/gta6-cover-art-01/pastikaiwayan28-cpu/gta6-cover-art-01/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard)
[![make.fun reward](https://make.fun/badge/gta6-cover-art-01/pastikaiwayan28-cpu/gta6-cover-art-01/reward.svg)](https://make.fun/bounty/gta6-cover-art-01)

# Vice Nights — GTA 6-style cover art maker

A make.fun bounty entry for [gta6-cover-art-01](https://make.fun/bounty/gta6-cover-art-01): a web app that turns a person's photo and a caption into cover art in the style of GTA 6's posters — the multi-panel poster look with bold caption lettering and a Vice City sunset or neon colour grade — exported as a PNG to share.

- **3 layouts:** Hero (big panel + 2 stacked), Grid (2×2), Strip (wide top + 3 bottom), white-framed panels with gutters.
- **3 colour grades:** Sunset (orange/pink), Neon (magenta/cyan), Vice (purple/teal) — gradient wash + vignette + accent caption line.
- **Photos:** 3 slots from your own machine + free samples; click a panel to select it, drag to reposition, zoom slider, "one photo for all panels" toggle. Empty panels draw a procedural sunset.
- **Caption:** title + subtitle in Anton (OFL, vendored under `app/fonts/`), auto-fit, letter-spaced subtitle.
- **Sizes:** 1080×1080, 1080×1350, 1920×1080; Export PNG downloads at the chosen size.
- **Offline:** static files under `app/`, no build step, no network request. Serve with `node serve.ts` and open http://localhost:8080.

Original design — no Rockstar Games logo, wordmark, official artwork, character or font.
