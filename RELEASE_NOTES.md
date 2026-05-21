# Release Notes

## v0.9.0 - Pending

### Summary

v0.9.0 turns Castle Siege from a one-level vertical slice into a campaign level-engine milestone while preserving Duel vs CPU and Two Player Local. It adds a level-select screen, 16 handcrafted levels across two worlds, a 6-star World 2 unlock gate, next-level routing after victories, and a minimal `src/siege/` module structure for future Castle Siege work. It does not add a backend, accounts, online multiplayer, ads, in-app purchases, procedural generation, external assets, or a new build system.

### Added

- Castle Siege level-select overlay with campaign totals, per-world progress, per-level stars, locked level states, and Main Menu routing.
- World catalog for Outpost and Quarry, including world membership, star unlock requirements, and level unlock helpers.
- Sixteen Castle Siege levels: `siege_001` through `siege_008` in Outpost, and `siege_009` through `siege_016` in Quarry.
- Wood/crystal Outpost levels and stone-supported Quarry levels.
- Next Level action on victory when the next campaign level is unlocked.
- Progress helpers for total stars and per-level progress reads.

### Changed

- Moved Castle Siege modules into the minimal `src/siege/` folder.
- Refactored Castle Siege level data into per-level files aggregated by `src/siege/levels.js`.
- Campaign now opens the level-select screen instead of immediately starting `siege_001`.
- Updated workflow validation references to `v0.9.0`.

### Preserved

- Duel vs CPU, Two Player Local, mobile controls, generated Canvas visuals, generated Web Audio, debug helpers, static module loading, local Castle Siege progress storage, and GitHub Pages-safe relative paths remain intact.

### Testing

- Local checks should include static syntax validation, version/release/artifact/path validation, level-select smoke testing, first-level victory and Next Level routing, World 2 lock/unlock checks, and regression starts for Duel vs CPU and Two Player Local.

## v0.8.0 - Previous

### Summary

v0.8.0 adds the first playable Castle Siege campaign vertical slice while preserving the existing Duel vs CPU and Two Player Local artillery modes. The slice includes one handcrafted level, destructible castle blocks, a core objective, limited shots, a result overlay, and local progress saving. It does not add a backend, accounts, online multiplayer, ads, in-app purchases, procedural generation, external assets, or a new build system.

### Added

- Main-menu Campaign entry that starts Castle Siege.
- Castle Siege mode value: `siege`.
- One level, `siege_001` / Old Watchtower.
- One player cannon on the left and a destructible castle target on the right.
- Castle blocks with HP, wood/crystal materials, damage visuals, and a `castle_core` objective block.
- Projectile collision against castle blocks and explosion damage to nearby blocks.
- Limited-shot victory/failure flow with Replay and Main Menu.
- Local Castle Siege progress save under `crater-command-siege-progress-v1`, including best stars, best shots remaining, completion count, and coins.

### Preserved

- Duel vs CPU, Two Player Local, mobile controls, generated Canvas visuals, generated Web Audio, debug helpers, static module loading, and GitHub Pages-safe relative paths remain intact.

### Testing

- Local checks should include static syntax validation, version/release/artifact/path validation, local browser Castle Siege smoke testing, and regression starts for Duel vs CPU and Two Player Local.

## v0.7.1 - Previous

### Summary

v0.7.1 is a focused follow-up polish pass on top of the deployed v0.7.0 baseline. It renames the displayed game to Crater Command, updates GitHub Actions to Node 24-compatible action versions, adds a gated developer debug panel, improves HUD and dropdown readability, differentiates Splitter Shell from Cluster Bomb, and improves iPhone Safari viewport/shop handling with PWA home-screen support. It does not add online multiplayer, networking, room codes, a backend, external image assets, or external audio files.

### Added

- Crater Command browser metadata, manifest metadata, iOS home-screen metadata, and local generated PWA icons.
- `manifest.webmanifest` with GitHub Pages-safe relative `start_url`, `scope`, and icon paths.
- A main-menu `Try Fullscreen` action plus iPhone Add to Home Screen guidance that hides in standalone/fullscreen display modes or after dismissal.
- Gated developer debug mode behind `?debug=1`, with `Ctrl+Shift+D` toggling a compact debug panel.
- Debug controls for money, all catalog weapons, selected weapon refill, utilities, wind, tank health/damage, shields, flat/weapon/parachute test setups, turn flow, forced round wins, forced match wins, and returning to the main menu.
- Debug window helpers including `window.DEBUG_MODE`, `window.debugGrantMoney()`, `window.debugSetMoney()`, `window.debugRefillWeapons()`, `window.debugRefillUtilities()`, and `window.debugSetupWeaponTest()`.

### Changed

- Updated the central version target to `v0.7.1`; the main menu shows `v0.7.1`, and `window.GAME_VERSION` returns `"v0.7.1"`.
- Renamed the displayed game title and project-facing browser/PWA metadata from Tank Artillery Duel to Crater Command without renaming the repository or changing the GitHub Pages URL.
- Updated GitHub Actions validation and Pages workflows to use `actions/checkout@v6`, `actions/setup-node@v6` with Node 24, and `actions/upload-pages-artifact@v5`.
- Kept Pages deployment main-only while validation continues to run on `version/**` pushes and pull requests into `main`.
- Pages deployment now stages `manifest.webmanifest` and the local `icons/` folder.
- Promoted the polished weapon info card visual language into the main HUD: darker translucent panels, cleaner borders, stronger stat tile hierarchy, and a wind stat tile.
- Splitter Shell now uses controlled-fork metadata and behavior while Cluster Bomb remains wide-scatter area coverage.
- CPU weapon choice now treats Splitter Shell and Cluster Bomb as different tactical roles instead of the same split category.
- Browser viewport sizing now updates `--app-height` from `visualViewport.height` or `innerHeight` and applies it to app, game, shop, summary, and overlay sizing.

### Fixed

- Fixed opened dropdown option contrast by enforcing dark readable native select and option colors.
- Fixed Shield cap enforcement so Shield cannot exceed 60.
- Improved shield visual clarity and animation so active shields are much easier to see.
- Improved iPhone Safari shop and result overlay usability with visual-viewport sizing, safe-area padding, internal scroll regions, `-webkit-overflow-scrolling: touch`, and less aggressive page-level touch prevention while overlays are being scrolled.
- Improved GitHub Pages path validation to include manifest paths.
- Expanded artifact ignore/check coverage for traces, HAR files, generated screenshots, debug JSON, and video captures.

### Preserved

- Desktop keyboard controls, mobile touch controls, mobile Play behavior, Play vs CPU primary action, Two Player Local secondary mode, match-end/best-of logic, local handoff behavior, Standard Shell unlimited ammo, Heavy Shell heavier arc, Mega Bomb late-match gating, Napalm hit plus burn ticks, Parachute behavior, shop cards, compact mobile shop layout, generated audio lifecycle, and GitHub Pages compatibility are preserved.

### Testing

- Local checks should include JavaScript syntax validation, version/release/artifact/path validation, local browser smoke testing, debug panel actions, dropdown readability checks, Splitter/Cluster weapon tests, and mobile overlay/shop checks.
- TESTING.md now includes checking that GitHub Actions workflows run without Node 20 deprecation warnings.
- Real iPhone Safari Add to Home Screen launch and production GitHub Pages deployment still require device/release verification after merge to `main`.

### Known Limitations

- A normal iPhone Safari tab cannot always be forced into true fullscreen; v0.7.1 maximizes the visible viewport and provides PWA/home-screen guidance for a more fullscreen-like experience.
- CPU tanks still do not drive with movement fuel.
- CPU aim and weapon choice remain intentionally imperfect.
- Terrain remains heightmap-based and cannot represent caves or overhangs.

## v0.7.0 - Previous

### Summary

v0.7.0 is the first weapon-system foundation pass. It expands the weapon catalog into a data-driven balance/reference source, adds weapon categories and tactical roles, introduces seven original classic-inspired weapons, improves CPU weapon selection and shopping, adds debug weapon helpers, creates BALANCE.md, updates documentation, and hardens GitHub Actions validation for version branches. It does not add online multiplayer, networking, accounts, room codes, a backend, external assets, or external audio files.

### Added

- Centralized weapon catalog metadata for id, name, category, role, descriptions, price, max ammo, starting ammo, unlimited ammo, speed scale, damage/radius values, terrain effects, special behavior profiles, icon profiles, visual profiles, sound profiles, CPU-use weights, shop priority, labels, and arc difficulty.
- Weapon categories: Basic Shells, Precision Weapons, Heavy Explosives, Terrain Builders, Terrain Destroyers, Rolling Weapons, Fire Weapons, Split / Cluster Weapons, and Utility / Defense.
- Seven new original weapons: Precision Shell, Airburst Shell, Splitter Shell, Heavy Roller, Excavator Bomb, Mound Maker, and Firestorm Canister.
- Debug-only weapon helpers behind `?debug=1`: `window.debugWeapons()`, `window.testWeaponCatalog()`, and `window.setupWeaponTest()`.
- BALANCE.md as the human-readable weapon, economy, utility, and CPU tuning reference.
- GitHub Actions validation for version branches and pull requests into `main`.
- Local validation scripts for version consistency, release notes, artifact pollution, Pages-safe paths, and JavaScript syntax checks.

### Changed

- Updated version target to `v0.7.0`; the main menu shows `v0.7.0`, and `window.GAME_VERSION` returns `"v0.7.0"`.
- Shop ammo cards are generated from the weapon catalog and now show compact category labels.
- CPU firing choices now read weapon roles and consider ammo, distance, target health, shields, terrain obstruction, slope relation, exposed targets, miss streak, and difficulty.
- CPU shopping now uses catalog shop priorities and CPU-use weights while preserving full-ammo, affordability, First Aid, Shield, and Mega Bomb gating rules.
- Existing generated projectile sprites, impact visuals, and Web Audio branches now cover the expanded weapon pack.
- Renamed the match setting UI from `Rounds to Win` to `Match Length` with `1 Round`, `Best of 3`, and `Best of 5` options.
- README.md, TESTING.md, progress.md, and release notes now document v0.7.0.

### Fixed

- Fixed match clinch logic so Best of 3 and Best of 5 matches end as soon as a player has already won the match.

### Preserved

- Standard Shell remains unlimited.
- Default starting money remains `None ($0)`.
- Mega Bomb remains a `$375`, max-ammo-1 late-match premium weapon.
- Heavy Shell keeps its heavier arc behavior.
- Napalm keeps its initial hit plus bounded burn ticks.
- Parachutes remain useful for meaningful fall protection.
- Two Player Local, Play vs CPU, mobile Play behavior, desktop keyboard controls, mobile touch controls, local handoff behavior, player identity clarity, generated audio, movement audio, result audio identity, and GitHub Pages compatibility are preserved.

### Testing

- Local checks performed during implementation should include JavaScript syntax validation, version/release/artifact/path validation, local static-server browser smoke testing, debug weapon catalog validation, and manual weapon/CPU smoke checks.
- Real-device mobile audio/app-switch behavior and GitHub Pages deployment still require release verification after merge to `main`.

### Known Limitations

- CPU tanks still do not drive with movement fuel.
- CPU aim and weapon choice remain intentionally imperfect.
- Terrain remains heightmap-based and cannot represent caves or overhangs.
- v0.7.0 does not add online multiplayer or any backend.

## v0.6.10 - Pending

### Summary

v0.6.10 is a focused local multiplayer state, audio bugfix, and future-multiplayer foundation pass. It fixes the Two Player Local movement-state bug, adds a clear local turn handoff overlay between human turns, improves player identity in the HUD/turn label/summary, makes tank movement audio actually audible, gives victory and defeat audio clearly distinct generated identities, adds debug-only turn/movement/state helpers for future multiplayer testing, and cleans up turn-state ownership so future online multiplayer is easier to add later. v0.6.10 does not add new weapons, online multiplayer, a backend, or any external assets.

### Added

- Two Player Local turn handoff overlay (`Player 2 Turn / Pass the keyboard or device / Start Turn`) shown between human turns. Inputs are locked until Start Turn is pressed.
- `Enter` keyboard shortcut for starting the next local turn from the handoff overlay (Space is intentionally not mapped here so the inactive player cannot accidentally fire).
- Game-level `turnState` (active player ID, turn number, input lock, handoff pending, last-result-audio round) so future online/room-code multiplayer can serialize and transfer turn ownership cleanly.
- Per-tank `playerIndex` and `label` fields for clearer player identity in code and debug output.
- Debug-only helpers (only available with `?debug=1`): `window.debugTurnState()`, `window.debugMovementState()`, and `window.exportDebugGameState()`.

### Changed

- Updated version target to `v0.6.10`.
- Updated central game version constant; the main menu now shows `v0.6.10` and `window.GAME_VERSION` returns `"v0.6.10"`. Gameplay continues to have no floating version badge.
- Boosted the movement audio bus and the tread/tick layers so the tank movement loop is reliably audible on laptop and phone speakers without becoming loud.
- Replaced round-win, round-loss, match-win, and match-loss generated stingers so victory and defeat have clearly different character. Match-level stingers are longer (~2-3 s) than the round-level stingers (~1 s) and use distinct musical phrases instead of shared sequences.
- Improved player identity clarity across HUD, mobile HUD turn pill, turn label color (CPU now visually distinguished from Player 2), summary score, and the new handoff overlay.
- Round summary now reads `Score: <P1 name> X - <P2/CPU name> Y` so both player names appear consistently.
- Page lifecycle audio handling now treats the new `handoff` phase the same as gameplay phases when restarting ambience after returning to the tab.

### Fixed

- Fixed the Two Player Local movement-state bug: Player 1 using all movement no longer prevents Player 2 from moving on Player 2's turn. Movement allowance is now treated as strictly per-tank and per-turn, with the active tank being the only one whose movement is reset at turn start.
- Movement audio is now actually audible when desktop `A`/`D` or mobile movement buttons move the active tank, while remaining subtle and below weapon/explosion volumes.
- Cleared stuck movement keys at every turn start so a held key from a previous shared-keyboard turn cannot drive the next active tank.
- Result stingers no longer double-play when `_checkWinCondition` is reached more than once for the same round-end.

### Testing

- Local checks performed: `node --check` for all `src/*.js`; manual code review of turn state, handoff flow, movement state ownership, and audio routing.
- Not verified yet: real auditory comparison of round-win vs round-loss and match-win vs match-loss stingers on speakers and headphones, real-phone Two Player Local handoff usability, real-phone movement-audio audibility, and GitHub Pages deployment of v0.6.10.

### Known Limitations

- v0.6.10 does not add online multiplayer, room codes, networking, accounts, or a backend. The `turnState` cleanup is preparation only.
- CPU tanks still do not drive with movement fuel; CPU aiming remains intentionally simple.
- Two Player Local remains intentionally hidden on phone-sized viewports (the existing single-button `Play` mobile entry stays Single Player vs CPU).
- Terrain remains heightmap-based and cannot represent caves or overhangs.

## v0.6.9 - Previous

### Summary

v0.6.9 is a focused UI/UX clarity, economy, shop presentation, combat feedback, result-audio, parachute, Napalm, help/settings, and documentation pass. It keeps the existing weapon list and core loop intact while making progression, purchases, combat events, and round results easier to understand.

### Added

- Shared generated weapon/item icon presentation for shop cards and selected weapon HUD.
- Compact generated utility icons for Shield Charge, First Aid Kit, and Parachute.
- Floating combat feedback for damage, shield absorption, healing, parachute deployment, fall damage, and Napalm burn ticks.
- Generated victory, defeat, neutral round-end, and match result stingers using Web Audio only.
- Help / How to Play overlay from the main menu.
- Debug-only `window.testParachuteDrop()` helper for parachute/fall-damage checks.

### Changed

- Updated version target to `v0.6.9`.
- Changed default starting money to `None ($0)` while preserving selectable higher starting money presets.
- Rebalanced Heavy Shell to a heavier `0.94` speed scale so it is harder to aim than Standard Shell but still practical.
- Preserved Mega Bomb as a `$375`, max-ammo-1, late-match premium weapon under the new `$0` default economy.
- Redesigned shop purchases as item cards with icons, descriptions, ammo/status, prices, and clear action states.
- Improved mobile shop cards into a compact single-column layout.
- Improved selected weapon HUD/info clarity with generated icons and weapon-cycle feedback.
- Improved round summary readability with damage, burn, fall, parachute, money, ammo, and utility details.
- Tuned fall damage/parachute behavior so parachutes deploy only for meaningful protection.
- Changed Parachute price from `$45` to `$35`.
- Updated Napalm Canister to apply initial flame-area damage plus two minor `-1` burn ticks.
- Grouped settings into Match, Battlefield, and Audio/Help sections.
- Updated README.md, TESTING.md, progress.md, and release notes for v0.6.9.

### Fixed

- Pre-round shop now clearly communicates the default `$0` start instead of implying spendable starting cash.
- Too-expensive and full shop states are clearer and continue to block invalid purchases without charging money.
- Result stingers route through the existing generated audio and lifecycle/mute behavior.
- Napalm burn ticks are bounded and use the existing damage/death path to avoid repeated death sounds or scoring loops.

### Testing

- Local checks performed: `node --check` for all `src/*.js`; `git diff --check`; web-game Playwright smoke client; targeted Playwright checks for menu version, `window.GAME_VERSION`, `$0` default starting money, Help overlay, pre-round shop cards, Mega Bomb disabled state, no Standard Shell ammo card, Round 1 start, Heavy/Standard/Mega speed-scale debug values, Heavy Shell reach, parachute debug drop, Napalm initial hit plus visible burn tick feedback, forced summary, mobile Play to shop, compact mobile shop screenshots, high-starting-money purchase/refill behavior, screenshot review, and no console/page errors.
- Not verified yet: real-phone app switching/phone lock behavior, auditory result-stinger quality, and GitHub Pages deployment.

### Known Limitations

- CPU tanks still do not drive with movement fuel.
- CPU aiming remains intentionally simple.
- Terrain remains heightmap-based and cannot represent caves or overhangs.

## v0.6.8 - Previous

### Summary

v0.6.8 is a focused gameplay balance, audio lifecycle, HUD cleanup, documentation, release-notes, and artifact-cleanup pass. Mega Bomb is now a late-match premium weapon, tank movement has subtle generated audio, inactive tabs/mobile app backgrounding stop game audio, and wind is no longer duplicated in the upper HUD.

### Added

- Subtle generated tank tread movement audio for real human tank movement on desktop and mobile controls.
- Page lifecycle audio handling for hidden tabs, page hide, blur, focus, and freeze events.
- RELEASE_NOTES.md as the concise human-readable release-history source.
- Expanded `.gitignore` coverage for generated browser/test output folders and trace/report artifacts.

### Changed

- Updated version target to `v0.6.8`.
- Rebalanced Mega Bomb to price `$375`, max ammo `1`, speed scale `0.92`, max damage `82`, damage radius `82`, falloff `1.85`, and crater radius `88`.
- Changed Mega Bomb from an early easy purchase into a late-match premium weapon.
- Adjusted CPU shop behavior so Mega Bomb is not bought too early, while full, or ahead of critical First Aid/Shield needs.
- Removed duplicate wind information from the upper desktop/mobile HUD while keeping the battlefield wind indicator.
- Cleaned up README.md, TESTING.md, and progress.md for current project state.

### Fixed

- Long-running generated audio no longer continues while the page is hidden or the mobile browser is backgrounded.
- Held movement state is cleared on page hide/blur so movement audio and movement input do not get stuck on return.
- Ambience is guarded against duplicate layers after returning to the tab/app.

### Testing

- Local checks performed: `node --check` for all `src/*.js`; web-game Playwright smoke client; targeted Playwright checks for menu version, no gameplay version badge, Normal pre-round Mega Bomb affordability, Round 1 start, keyboard movement/fuel use, Standard Shell fire transition, Mega Bomb reach/debug values, Mega Bomb near-hit damage, shield absorption, mobile Play to CPU mode, mobile landscape HUD/controls, wind HUD cleanup, simulated page-hide movement clearing, screenshot review, and no console/page errors.
- Not verified yet: real-phone app switching/phone lock behavior, auditory movement-sound quality, and GitHub Pages deployment.

### Known Limitations

- CPU tanks still do not drive with movement fuel.
- CPU aiming remains intentionally simple.
- Terrain remains heightmap-based and cannot represent caves or overhangs.

## v0.6.7 - Previous

### Summary

v0.6.7 improved generated audio, restored practical Mega Bomb reach, added aim/reach debug helpers, and refined mobile landscape controls.

### Added

- Categorized Web Audio mixer with layered generated weapon, explosion, UI, utility, and ambience sounds.
- Debug-only `window.testWeaponReach()` and `window.setupAimTest()` helpers.

### Changed

- Normalized Heavy Shell and Mega Bomb speed scales to make Mega Bomb usable at high power.
- Reworked mobile landscape firing controls into one compact row.

### Fixed

- Mega Bomb no longer fell dramatically short after the earlier weapon expansion.

### Testing

- Historical local checks included `node --check`, debug helper checks, mobile landscape sizes, mute persistence, screenshot review, and no console/page errors.

### Known Limitations

- Mega Bomb became too easy and too affordable, which v0.6.8 rebalances.

## v0.6.6 - Previous

### Summary

v0.6.6 was the major visual upgrade pass for battlefield, terrain, tank, projectile, and impact presentation.

### Added

- Runtime-generated battlefield themes, layered backgrounds, projectile sprites, terrain detail rendering, and cached visual assets.
- Improved tank art with treads, turret/cannon details, recoil, muzzle flash, smoke, shield arcs, and wreck rendering.

### Changed

- Upgraded terrain and explosion rendering while preserving core gameplay flow.

### Fixed

- Improved visual clarity for craters, scorch marks, Dirt Bomb mounds, and heavy weapon impacts.

### Testing

- Historical local checks included static JS checks, Playwright smoke tests, weapon visual checks, mobile Play checks, screenshot review, and no console/page errors.

### Known Limitations

- Visual complexity remained Canvas-only and intentionally avoided external assets.

## v0.6.5 - Previous

### Summary

v0.6.5 focused on tank destruction, Napalm ground-fire presentation, and mobile shop usability.

### Added

- Generated tank destruction audio and larger tank death blast visuals.
- Persistent wreck art and dark smoke for destroyed tanks.
- Terrain-sampled Napalm ground fire with flame flicker, smoke, and linger.

### Changed

- Napalm shifted away from crater behavior toward minimal terrain deformation.
- Mobile shop layout became more compact, with CPU auto-shop details collapsible on phone-sized screens.

### Fixed

- Destroyed tanks became clearer and Napalm visuals better matched weapon behavior.

### Testing

- Historical local checks included static JS checks, web-game smoke checks, mobile shop checks, Napalm behavior, tank destruction behavior, and no console/page errors.

### Known Limitations

- Real mobile-device coverage remained manual.

## v0.6.4 - Previous

### Summary

v0.6.4 expanded weapons, clarified HUD/shop inventory, improved shield visibility, and removed the gameplay version badge.

### Added

- Roller Shell, Napalm Canister, Cluster Bomb, and Mega Bomb.
- Shield display in player panels, mobile HUD, shop inventory, and summary inventory.
- Weapon-driven limited ammo shop generation.

### Changed

- Main menu remained the only visible version display while `window.GAME_VERSION` stayed available.
- HUD/shop labels were rewritten to be clearer.

### Fixed

- Standard Shell remained unlimited and did not gain an ammo shop item.

### Testing

- Historical local checks covered expanded weapon flow, shop ammo behavior, shield display, and version display.

### Known Limitations

- Expanded weapons needed later balance and presentation passes.
