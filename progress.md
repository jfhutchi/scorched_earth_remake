# Project Progress

Current Version: v0.7.0

Current Branch: version/v0.7.0

Release History Source: RELEASE_NOTES.md

## Latest Completed Work

- Implemented the v0.7.0 weapon-system foundation in the working tree: the weapon catalog now carries categories, tactical roles, prices, ammo caps, starting ammo, unlimited-ammo flags, damage/terrain labels, arc difficulty, icon profiles, visual profiles, sound profiles, CPU-use weights, shop priority, and special behavior metadata.
- Added the first expanded original weapon pack: Precision Shell, Airburst Shell, Splitter Shell, Heavy Roller, Excavator Bomb, Mound Maker, and Firestorm Canister. Existing Standard Shell, Heavy Shell, Dirt Bomb, Roller Shell, Napalm Canister, Cluster Bomb, and Mega Bomb remain represented in the same catalog.
- Updated shop generation so limited ammo cards are driven from weapon metadata and show compact category labels while utilities remain separate.
- Improved CPU weapon selection and shopping to use weapon roles, ammo, distance, target health, shields, terrain obstruction, downhill/uphill relation, exposed targets, miss streak, difficulty, shop priorities, and CPU-use weights.
- Added debug-only v0.7.0 weapon helpers: `window.debugWeapons()`, `window.testWeaponCatalog()`, and `window.setupWeaponTest()`.
- Added BALANCE.md as the weapon/economy/CPU tuning reference and updated README.md, TESTING.md, progress.md, and RELEASE_NOTES.md for v0.7.0.
- Added GitHub Actions validation and local scripts for version consistency, release notes, artifact pollution, GitHub Pages-safe paths, and JavaScript syntax checks.
- Fixed match clinch logic so Best of 3 and Best of 5 matches end as soon as a player has already won the match, and renamed the menu setting to Match Length.
- Preserved desktop keyboard controls, mobile touch controls, mobile Play behavior, Play vs CPU, Two Player Local, local handoff behavior, player identity clarity, default `$0` starting money, Standard Shell unlimited ammo, Mega Bomb late-match gating, generated audio, movement audio, result audio identity, and GitHub Pages compatibility.

## Current Known Issues

- CPU aiming is intentionally simple and CPU tanks do not drive with movement fuel.
- Expanded v0.7.0 weapon balance needs longer full-match tuning after this foundation pass.
- Real-phone app switching, phone locking, auditory weapon-sound quality, real-phone Two Player Local handoff usability, and GitHub Pages deployment still need manual verification before cutting a public release.
- Terrain remains heightmap-based, so caves and overhangs are out of scope.
- Two Player Local is intentionally hidden on phone-sized viewports; the handoff overlay only matters when Two Player Local is reached on desktop or via wider viewports.

## Next Candidate

- Longer full-match playtests on Easy, Normal, and Hard CPU after the expanded weapon pack.
- Tune Airburst Shell trigger height/radius if it becomes too reliable.
- Tune Mound Maker and Excavator Bomb after repeated terrain-shaping tests.
- Real-phone playtests of the Two Player Local handoff flow to confirm input lock and Start Turn touch target are comfortable on a real phone.
- Auditory side-by-side comparison of new weapon sounds on speakers and headphones.
- Consider optional drag aiming/power controls after the mobile layout remains stable.
- Consider CPU driving logic only after current movement and audio behavior is fully verified.

## Recent Release Notes

### v0.7.0

- Added a cleaner data-driven weapon catalog with category, role, economy, ammo, behavior, icon, visual, sound, CPU, and balance metadata.
- Added weapon categories for shop clarity, CPU reasoning, documentation, and future balance work.
- Added seven original weapons: Precision Shell, Airburst Shell, Splitter Shell, Heavy Roller, Excavator Bomb, Mound Maker, and Firestorm Canister.
- Preserved all existing weapons and key balance rules: Standard Shell unlimited, Heavy Shell heavier arc, Napalm burn ticks, Mega Bomb late-match max-ammo-1 gating, and default `$0` starting money.
- Improved CPU firing and shopping decisions using weapon roles and tactical context.
- Added debug-only weapon helpers and catalog validation.
- Added BALANCE.md as the tuning reference.
- Added GitHub Actions validation and local scripts for version consistency, release notes, artifacts, Pages-safe paths, and syntax checks.
- Fixed match clinch logic so Best of 3 and Best of 5 matches end immediately when a player reaches the majority, and clarified the menu setting as Match Length.
- Updated README.md, TESTING.md, progress.md, and RELEASE_NOTES.md for v0.7.0.

### v0.6.10

- Fixed the Two Player Local movement-state bug: Player 1 using all movement no longer prevents Player 2 from moving on Player 2's turn. Movement allowance is now strictly per-tank/per-turn, with the active tank being the only one whose movement is reset at turn start.
- Added a local turn handoff overlay between human turns (`Player 2 Turn / Pass the keyboard or device / Start Turn`) with all input locked until Start Turn is pressed. Single Player vs CPU and CPU turns never show the overlay.
- Cleared stuck movement keys at every turn start so a held key from a previous shared-keyboard turn cannot drive the next active tank.
- Improved player identity clarity: HUD, mobile HUD turn pill (CPU now visually distinguished from Player 2), turn label color, summary score, and handoff overlay all use consistent `Player 1` / `Player 2` / `CPU` labels and colors.
- Boosted movement bus volume and added a high-mid tick layer so the tank movement loop is reliably audible on laptop and phone speakers without becoming loud.
- Replaced round-win, round-loss, match-win, and match-loss generated stingers so victory and defeat have clearly different character. Match-level stingers are longer than round-level stingers and use distinct musical phrases.
- Consolidated turn-state ownership into a single `Game.turnState` object (active player ID, turn number, input lock, handoff pending, last result audio round) so future online/room-code multiplayer can serialize it cleanly without rewriting the game state manager.
- Added `Tank.playerIndex` and `Tank.label` for clearer per-player identity in code and debug output.
- Added debug-only `window.debugTurnState()`, `window.debugMovementState()`, and `window.exportDebugGameState()` helpers behind `?debug=1`.
- Updated README.md, TESTING.md, progress.md, and RELEASE_NOTES.md for v0.6.10.

### v0.6.9

- Default starting money changed to `None ($0)` while preserving higher starting money presets and pre-round shop flow.
- Heavy Shell now has a heavier `0.94` arc than Standard Shell while remaining practical.
- Mega Bomb remains a `$375`, max-ammo-1 late-match premium weapon under the new default economy.
- Shop purchases are redesigned as weapon/item cards with generated icons, descriptions, ammo/status, prices, and clear full/too-expensive states.
- Mobile shop cards use a compact single-column layout with CPU purchase details summarized/collapsed.
- Selected weapon HUD/info now includes generated weapon identity and ammo clarity.
- Floating combat feedback now covers damage, shield absorption, First Aid healing, parachutes, fall damage, and Napalm burn ticks.
- Round summaries now show clearer damage, burn, fall, parachute, money, ammo, and utility details.
- Added generated victory/defeat/neutral round-end/match result stingers that use the existing Web Audio/mute/lifecycle path.
- Parachutes now deploy only on meaningful fall protection, show visual/audio/text feedback, and cost `$35`.
- Napalm now applies initial flame-area damage plus two small `Burn -1` ticks without terrain deformation.
- Added Help / How to Play and grouped settings UI.
- Updated README.md, TESTING.md, progress.md, and RELEASE_NOTES.md for v0.6.9.

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

- Bouncer Shell was previously mentioned as an optional future idea, but it is not a current v0.6.10 plan.
