Original prompt: Upgrade the existing local browser Scorched Earth-style artillery MVP into a playable v0.2 with game modes, CPU opponent, weapons and ammo, turn flow polish, rounds and score, improved terrain, trajectory preview, HUD/menu/visual/audio/responsive improvements, documentation, and manual testing coverage.

## Progress

- Inspected existing vanilla Canvas structure: `index.html`, `styles.css`, and modules under `src/`.
- Decision: preserve the current MVP architecture and add targeted modules for shared config, audio, and CPU aiming.
- Implemented v0.2 core systems across the existing game: mode selection, CPU turn logic, weapons/ammo, score and round flow, richer HUD, improved terrain/tanks/projectiles, generated Web Audio sounds, mute persistence, responsive layout, and browser testing hooks.
- Static JavaScript parse checks passed for all `src/*.js` files.
- Started v0.3 correction pass: split weapon terrain/damage stats, changed Dirt Bomb to add terrain, added movement fuel fields and A/D movement handling, and improved trajectory preview contrast.
- Updated README and TESTING for v0.3 weapon, movement, Dirt Bomb, and preview behavior.
- Browser verification covered A/D movement fuel, weapon cycling, Dirt Bomb terrain addition and ammo use, CPU turn flow after movement changes, direct-damage values, crater-vs-mound height changes, preview visibility, and 1280x720 / 1920x1080 HUD screenshots with no console errors.
- Started v0.4 replayability pass: added match settings controls, settings persistence plumbing, economy/player inventories, round summary and shop overlays, CPU shop purchases, shield/repair/parachute utilities, fall damage, wind/terrain setting hooks, and event-code based input separation.
- Completed v0.4 input-control fix: `ArrowLeft`/`ArrowRight` adjust cannon angle only, while `A`/`D` move the active human tank only.
- Completed v0.4 replayability systems: economy, summary screen, between-round shop, player and CPU purchases, defensive utilities, CPU difficulty profiles, saved match settings, HUD inventory display, and documentation updates.
- Browser verification covered two-player input separation, firing control lockout, CPU turn progression, settings persistence, economy/shop math, shield absorb, repair kit healing, parachute fall mitigation, summary/shop overlays, and dedicated web-game Playwright client smoke testing with no console errors.
- Started v0.5 stabilization pass: added `v0.5.0` version display, tuned weapon feedback, added a Dirt Bomb dirt-puff effect, tightened shop/state guards, added repair-use messaging, added CPU shop reserves, and documented debug helpers.

## Notes

- No dependencies or build step are present.
- Use a local static server for testing because ES modules are blocked by some browsers on `file://`.
- Browser verification covered two-player smoke play, CPU smoke play, HUD screenshots, mute persistence, forced win scoring, next-round state, new-match state, and 1280x720 / 1366x768 / 1920x1080 screenshots with no console errors.
- v0.5 debug helpers are available only when loading the page with `?debug=1`.

## TODO

- v0.5 browser verification covered version display, debug-helper gating, Arrow vs A/D control separation, Standard/Heavy/Dirt impact helpers, summary -> shop -> next round flow, shop purchase prices, wind off, shield absorb, repair messages, parachute fall mitigation, 1280x720 / 1366x768 / 1920x1080 screenshots, and the dedicated web-game Playwright client with no console errors.
- Optional next pass: hand-play full best-of-three matches on each CPU difficulty and tune aim errors, shop preferences, and money pacing if needed.
- Optional future feature: add Bouncer Shell once core economy and utility balance feel stable.

## v0.6.4 Notes

- Updated the version target to `v0.6.4` and removed the gameplay version badge; only the main menu shows the version while `window.GAME_VERSION` remains available.
- Added clear shield display in player panels, mobile HUD, shop inventory, and summary inventory.
- Replaced cryptic HUD/shop inventory abbreviations with clear labels.
- Changed mobile angle controls to up/down arrows and kept power buttons adjacent.
- Moved ammo shop entries to weapon-driven generation so Heavy/Dirt remain in the shop as `Heavy Shell Ammo` and `Dirt Bomb Ammo`, with Roller/Napalm/Cluster/Mega added consistently.
- Added Roller Shell, Napalm Canister, Cluster Bomb, and Mega Bomb definitions, CPU shop/weapon preferences, rolling projectile behavior, cluster bomblets, flame visuals, expanded blast rings, and distinct generated sounds.
- Updated README.md and TESTING.md for v0.6.4.

## v0.6.5 Notes

- Updated the version target to `v0.6.5`; the main menu and `window.GAME_VERSION` now report v0.6.5 while gameplay remains free of a floating version chip.
- Added generated tank destruction audio with a deep boom, low rumble, metallic crack/pop, and debris noise, triggered only on fresh death transitions.
- Added tank death blast visuals, charred wreck drawing, and looping dark smoke so destroyed tanks are clearly disabled.
- Reworked Napalm Canister impact visuals into terrain-sampled ground fire that spreads along the surface, flickers, smokes lightly, and lingers before fading.
- Changed Napalm terrain behavior to avoid crater carving while preserving immediate flame-area damage.
- Compact mobile shop polish now keeps the human purchase card primary, uses smaller mobile shop spacing/buttons, and collapses CPU auto-shop purchases behind a Details toggle on phone-sized screens.
- Updated README.md and TESTING.md for v0.6.5.
- Verification: `node --check` passed for edited JS files; the web-game Playwright smoke client reported `v0.6.5`; targeted browser checks covered menu version, no gameplay version chip, desktop/mobile CPU shop summaries, mobile compact shop reachability, Napalm ground fire/damage, tank death wreck/blast, and no console/page errors.

## v0.6.6 Notes

- Updated the version target to `v0.6.6`; the main menu and `window.GAME_VERSION` now report v0.6.6 while gameplay remains free of a floating version chip.
- Added original runtime-generated visual systems: battlefield themes, layered backgrounds, procedural terrain texture/detail rendering, generated projectile sprites, and cached tread/projectile art.
- Upgraded tanks with stylized armored hulls, treads, turret/cannon details, slope-aligned bodies, recoil, muzzle flash, low-health smoke, shield arcs, and improved wreck rendering.
- Upgraded terrain rendering with theme-aware fills, strata, embedded stones, surface highlights, crater shadows, scorch marks, napalm scorch, and Dirt Bomb mound highlights.
- Upgraded combat presentation with projectile trails/sprites, richer smoke/debris on explosions, weapon-specific visual identity, and subtle screen shake for impacts.
- Polished CSS for menu, HUD panels, buttons, health/shield bars, canvas frame, and mobile controls without changing core flow.
- Updated README.md and TESTING.md for v0.6.6 visual QA and the new rendering modules.
- Verification: `node --check` passed for all `src/*.js`; the web-game Playwright client reported `v0.6.6`; targeted Playwright checks covered main menu version, no gameplay version badge, desktop round start, keyboard angle/movement/fire transitions, debug weapon impact visuals for Standard/Heavy/Dirt/Roller/Napalm/Cluster/Mega, mobile Play to CPU mode, visible mobile touch controls, mobile fire transition, screenshot review, and no console/page errors.
