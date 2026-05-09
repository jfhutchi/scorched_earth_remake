# Release Notes

## v0.6.8 - Pending

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
