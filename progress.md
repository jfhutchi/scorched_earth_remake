# Project Progress

Current Version: v0.6.8

Current Branch: Claude

Release History Source: RELEASE_NOTES.md

## Latest Completed Work

- Implemented v0.6.8 in the working tree: Mega Bomb rebalance, Mega Bomb economy gating, tank movement audio, page-hidden audio lifecycle handling, duplicate wind HUD cleanup, documentation cleanup, release notes, and generated artifact ignore cleanup.
- Updated the central version constant so the main menu and `window.GAME_VERSION` report `v0.6.8`; gameplay remains free of a floating version badge.
- Kept the existing architecture, current weapon list, desktop keyboard controls, mobile touch controls, mobile Play behavior, shop flow, pre-round shop, CPU shopping, generated Web Audio system, mute persistence, destructible terrain, wind physics, shields, First Aid, and parachutes.
- Documentation now treats RELEASE_NOTES.md as the concise release-history source.
- Local verification for this pass: `node --check` passed for all `src/*.js`; the web-game Playwright smoke client reported `v0.6.8`; targeted Playwright checks covered main menu version, no gameplay version badge, Normal pre-round Mega Bomb affordability, Round 1 start, keyboard movement/fuel use, Standard Shell firing transition, Mega Bomb reach/debug values, Mega Bomb near-hit damage, shield absorption against Mega Bomb, mobile Play to CPU mode, mobile landscape HUD/controls, wind HUD cleanup, simulated page-hide movement clearing, screenshot review, and no console/page errors.

## Current Known Issues

- CPU aiming is intentionally simple and CPU tanks do not drive with movement fuel.
- Real-phone app switching, phone locking, auditory movement-sound quality, and GitHub Pages deployment still need manual verification before cutting a public release.
- Terrain remains heightmap-based, so caves and overhangs are out of scope.
- Two Player Local is intentionally hidden on phone-sized viewports.

## Next Candidate

- Run longer full-match playtests on Easy, Normal, and Hard CPU after v0.6.8 to tune CPU economy and weapon preferences with more data.
- Consider optional drag aiming/power controls after mobile layout remains stable.
- Consider CPU driving logic only after current movement and audio behavior is fully verified.

## Recent Release Notes

### v0.6.8

- Mega Bomb now costs `$375`, remains max ammo 1, uses a heavier `0.92` speed scale, has max damage `82`, damage radius `82`, steeper `1.85` damage falloff, and crater radius `88`.
- Mega Bomb remains the biggest visual/audio spectacle and largest crater weapon, but medium-distance hits should no longer reliably delete a full-health tank.
- CPU shop logic avoids Mega Bomb when ammo is full, before it can afford it, and when critical First Aid or Shield needs should come first.
- Added generated tank tread movement audio for real human tank movement on desktop and mobile controls.
- Added page lifecycle handling for `visibilitychange`, `pagehide`, `blur`, `focus`, and `freeze` so active generated sounds stop/suspend when the page is inactive.
- Removed duplicated wind text from the upper desktop/mobile HUD while preserving the battlefield wind indicator and wind physics.
- Reworked README.md, TESTING.md, and this progress file around current v0.6.8 state.
- Added RELEASE_NOTES.md.
- Expanded `.gitignore` for generated browser/test output folders and trace/report artifacts.

### v0.6.7

- Normalized Heavy Shell and Mega Bomb reach in v0.6.7 so Mega Bomb became practical at high power.
- Replaced simple generated tones with a categorized Web Audio mixer, layered generated weapon/explosion/UI/utility sounds, subtle positional panning, safer gain staging, and generated theme ambience.
- Added debug-only `window.testWeaponReach()` and `window.setupAimTest()` helpers.
- Reworked the mobile landscape firing controls into a compact one-row right cluster.
- Verified at the time with `node --check`, local Playwright/client checks, debug helper checks, mute persistence, desktop key holds, mobile landscape sizes, screenshot review, and no console/page errors.

### v0.6.6

- Added original runtime-generated visual systems: battlefield themes, layered backgrounds, procedural terrain details, generated projectile sprites, cached tread/projectile art, improved tank rendering, terrain rendering, blast visuals, and subtle screen shake.
- Kept core game flow unchanged while polishing CSS, HUD, canvas presentation, and mobile controls.
- Verified at the time with `node --check`, Playwright smoke checks, debug weapon visuals, mobile Play, visible mobile controls, screenshot review, and no console/page errors.

### v0.6.5

- Added generated tank destruction audio, tank death blast visuals, wreck rendering, and smoke.
- Reworked Napalm Canister into terrain-sampled ground fire with flicker, smoke, linger, and minimal terrain deformation.
- Polished compact mobile shop behavior and CPU purchase detail collapsing.
- Verified at the time with static JS checks, web-game smoke checks, desktop/mobile CPU shop summaries, Napalm behavior, tank death visuals/audio, and no console/page errors.

### v0.6.4

- Removed the gameplay version badge while keeping main menu version display and `window.GAME_VERSION`.
- Added shield display in player panels, mobile HUD, shop inventory, and summary inventory.
- Replaced cryptic HUD/shop abbreviations with clearer labels.
- Added Roller Shell, Napalm Canister, Cluster Bomb, and Mega Bomb definitions, behavior, visuals, generated sounds, and CPU preferences.
- Moved limited ammo shop entries to weapon-driven generation while preserving Standard Shell as unlimited.

## Archived Earlier Progress

Original prompt: Upgrade the existing local browser Scorched Earth-style artillery MVP into a playable v0.2 with game modes, CPU opponent, weapons and ammo, turn flow polish, rounds and score, improved terrain, trajectory preview, HUD/menu/visual/audio/responsive improvements, documentation, and manual testing coverage.

### v0.2-v0.3 Foundation

- Preserved the existing vanilla Canvas structure and added targeted modules for shared config, generated audio, and CPU aiming.
- Implemented mode selection, CPU turn logic, weapons/ammo, score and round flow, richer HUD, improved terrain/tanks/projectiles, generated Web Audio sounds, mute persistence, responsive layout, and browser testing hooks.
- Split weapon terrain/damage stats, changed Dirt Bomb to add terrain, added movement fuel fields and `A`/`D` movement handling, and improved trajectory preview contrast.
- Updated early README and TESTING coverage for weapon, movement, Dirt Bomb, and preview behavior.

### v0.4 Replayability

- Added match settings, settings persistence, economy/player inventories, round summary and shop overlays, CPU shop purchases, shield/repair/parachute utilities, fall damage, wind/terrain setting hooks, and event-code based input separation.
- Completed input separation so `Left Arrow`/`Right Arrow` adjust cannon angle only while `A`/`D` move the active human tank only.
- Added pre-round and between-round shop behavior that later releases continue to preserve.

### v0.5 Stabilization

- Added version display, tuned weapon feedback, added Dirt Bomb dirt-puff effects, tightened shop/state guards, added repair-use messaging, added CPU shop reserves, and documented debug helpers.
- Browser verification at the time covered version display, debug-helper gating, Arrow vs A/D control separation, Standard/Heavy/Dirt impact helpers, summary -> shop -> next round flow, shop purchase prices, wind off, shield absorb, repair messages, parachute fall mitigation, multiple desktop viewports, and the web-game Playwright client with no console errors.

### Archived Ideas

- Bouncer Shell was previously mentioned as an optional future idea, but it is not a current v0.6.8 plan.
