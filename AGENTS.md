# AGENTS.md — Scorched Earth Remake Project Rules

This repository is a static ES-module JavaScript browser game.

Do not assume:
- Vite
- TypeScript
- React
- npm scripts
- package.json
- bundler build steps

Preserve static GitHub Pages compatibility.

## Validation

Use the existing validation gate:

```bash
node scripts/static-check.mjs
node scripts/validate-version.mjs v0.9.1
node scripts/check-release-notes.mjs v0.9.1
node scripts/check-artifacts.mjs
node scripts/check-pages-paths.mjs
```

Do not claim success unless these pass or unless the failure is clearly reported.

## Hard constraints

Do not add package.json unless explicitly asked.
Do not introduce Vite or TypeScript unless explicitly asked.
Do not add CDN dependencies.
Do not add server-side dependencies.
Do not use root-relative asset paths.
Do not commit generated artifacts.
Do not rewrite large files wholesale.
Keep changes small and reviewable.
Preserve browser playability.
Preserve mobile support.

## Current engineering posture

Prioritize:

- Validation cleanliness.
- Line-ending normalization as a dedicated cleanup only.
- Mobile-friendly controls.
- Projectile trajectory clarity.
- Terrain destruction stability.
- Turn-flow clarity.
- CPU/player AI quality.
- UI polish.
- GitHub Pages deployment safety.

## Large-file caution

Treat these files carefully:

- src/game.js
- src/ui.js
- src/audio.js
- src/config.js
- src/main.js

Extract only when a feature naturally requires it.
Do not perform cosmetic rewrites.
