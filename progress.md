Original prompt: Upgrade the existing local browser Scorched Earth-style artillery MVP into a playable v0.2 with game modes, CPU opponent, weapons and ammo, turn flow polish, rounds and score, improved terrain, trajectory preview, HUD/menu/visual/audio/responsive improvements, documentation, and manual testing coverage.

## Progress

- Inspected existing vanilla Canvas structure: `index.html`, `styles.css`, and modules under `src/`.
- Decision: preserve the current MVP architecture and add targeted modules for shared config, audio, and CPU aiming.
- Implemented v0.2 core systems across the existing game: mode selection, CPU turn logic, weapons/ammo, score and round flow, richer HUD, improved terrain/tanks/projectiles, generated Web Audio sounds, mute persistence, responsive layout, and browser testing hooks.
- Static JavaScript parse checks passed for all `src/*.js` files.
- Started v0.3 correction pass: split weapon terrain/damage stats, changed Dirt Bomb to add terrain, added movement fuel fields and A/D movement handling, and improved trajectory preview contrast.
- Updated README and TESTING for v0.3 weapon, movement, Dirt Bomb, and preview behavior.
- Browser verification covered A/D movement fuel, weapon cycling, Dirt Bomb terrain addition and ammo use, CPU turn flow after movement changes, direct-damage values, crater-vs-mound height changes, preview visibility, and 1280x720 / 1920x1080 HUD screenshots with no console errors.

## Notes

- No dependencies or build step are present.
- Use a local static server for testing because ES modules are blocked by some browsers on `file://`.
- Browser verification is still pending.
- Browser verification covered two-player smoke play, CPU smoke play, HUD screenshots, mute persistence, forced win scoring, next-round state, new-match state, and 1280x720 / 1366x768 / 1920x1080 screenshots with no console errors.

## TODO

- No known functional blockers remain.
- Suggested next pass after v0.3: hand-play a full best-of-three match and tune CPU error values if it feels too strong or too weak.
