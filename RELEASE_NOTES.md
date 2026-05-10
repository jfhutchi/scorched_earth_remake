# Release Notes

## v0.6.9 - Pending

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
