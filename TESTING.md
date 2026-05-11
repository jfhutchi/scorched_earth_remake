# Manual Testing Checklist

Current version: `v0.7.1`

Use a local static server, open Crater Command in a desktop or mobile browser, and keep DevTools open for console errors. For mobile testing, use a real device on the LAN IP when possible.

## Required Pre-Merge Smoke Test

- [ ] Browser tab title uses `Crater Command`.
- [ ] Main menu shows `Crater Command`.
- [ ] Main menu shows `v0.7.1`.
- [ ] Gameplay screen does not show a floating version badge.
- [ ] `window.GAME_VERSION` returns `"v0.7.1"`.
- [ ] Single Player vs CPU starts from the primary menu action.
- [ ] Phone-sized layout shows the single `Play` button and it starts Single Player vs CPU.
- [ ] Two Player Local remains available on desktop/wider layouts.
- [ ] Match Length, Starting Money, CPU Difficulty, Wind, and Terrain dropdowns are readable when closed and when opened.
- [ ] Default starting money is `None ($0)`.
- [ ] Pre-round shop opens before Round 1 with `$0`.
- [ ] Standard Shell is unlimited and has no shop ammo card.
- [ ] Existing weapons still appear, buy/refill where limited, select, fire, and resolve.
- [ ] New v0.7.x weapons appear in the shop with icons, descriptions, category labels, prices, and ammo states.
- [ ] New weapons can be bought/refilled, selected, fired, and resolved without turn lockups.
- [ ] CPU can shop, take turns, and fire supported weapons without freezing.
- [ ] Mobile landscape controls and compact shop remain usable.
- [ ] Desktop keyboard controls still work.
- [ ] `BALANCE.md` exists and references `v0.7.1`.
- [ ] GitHub Actions validation passes.
- [ ] GitHub Actions workflows run without Node 20 deprecation warnings.
- [ ] No stale test artifacts are committed.
- [ ] No startup or normal-play console errors occur.

## Match Length Clinch Checks

- [ ] Set match format to `Best of 3`.
- [ ] Win 2 rounds with the same player.
- [ ] Confirm the match ends immediately after the second win.
- [ ] Confirm no third round begins.
- [ ] Confirm the match result screen appears with the correct winner and final score.
- [ ] Confirm New Match works from the result screen.
- [ ] Confirm Main Menu works from the result screen.
- [ ] Set match format to `Best of 5`.
- [ ] Win 3 rounds with the same player.
- [ ] Confirm the match ends immediately after the third win.
- [ ] Confirm rounds 4 and 5 are not played.
- [ ] Confirm the final score is correct.
- [ ] Confirm no console errors occur.

## v0.7.1 Debug and Weapon Catalog Checks

Open with `?debug=1`.

- [ ] Press `Ctrl + Shift + D` and confirm the compact debug panel toggles.
- [ ] Load without `?debug=1`, press `Ctrl + Shift + D`, and confirm debug controls do not appear.
- [ ] Use the debug panel to add money and confirm HUD/shop money updates immediately.
- [ ] Use the debug panel to refill all weapons and confirm every v0.7.x catalog weapon is included while Standard Shell remains unlimited.
- [ ] Use the debug panel to refill Shield, First Aid Kit, and Parachute.
- [ ] Use the debug panel to set wind to `0`.
- [ ] Use the debug panel to setup the weapon test range.
- [ ] In the debug weapon test range, select and fire every weapon at least once.
- [ ] Use the debug panel to force round wins and match wins without corrupting flow.
- [ ] `window.debugWeapons()` lists every weapon id, name, category, price, ammo cap, speed scale, damage/radius values, CPU weight, and profile flags.
- [ ] `window.testWeaponCatalog().ok` is `true`.
- [ ] `window.testWeaponCatalog()` reports categories and no duplicate weapon ids.
- [ ] Every limited weapon has finite max ammo and a price.
- [ ] Every weapon has description, icon profile, visual profile, sound profile, role, and CPU metadata.
- [ ] `window.setupWeaponTest()` sets wind to 0, gives both players full ammo, and starts a predictable aiming scenario.
- [ ] `window.testWeaponReach()` includes existing and new weapons with reach, price, category, role, damage, and terrain data.

## HUD and Menu Readability

- [ ] Selected weapon display uses the improved dark card styling and remains readable.
- [ ] Angle, Power, Ammo, Move, and Wind stat blocks use the updated mini-card visual language.
- [ ] Player HUD panels remain readable and do not become oversized.
- [ ] HUD remains readable on desktop.
- [ ] HUD remains readable on mobile landscape.
- [ ] Match Length dropdown is readable when closed, focused, opened, and selected.
- [ ] Starting Money dropdown is readable when closed, focused, opened, and selected.
- [ ] CPU Difficulty dropdown is readable when closed, focused, opened, and selected.
- [ ] Wind dropdown is readable when closed, focused, opened, and selected.
- [ ] Terrain dropdown is readable when closed, focused, opened, and selected.

## Weapon Behavior Checks

- [ ] Standard Shell fires and remains unlimited.
- [ ] Heavy Shell fires, consumes ammo, has a heavier arc than Standard, and creates a larger crater.
- [ ] Dirt Bomb fires, consumes ammo, adds terrain, and keeps low damage.
- [ ] Roller Shell rolls along slopes and does not roll forever.
- [ ] Napalm Canister applies initial flame-area damage plus two small burn ticks.
- [ ] Cluster Bomb splits into several wide-spread lighter bomblets, covers more area than Splitter Shell, and resolves.
- [ ] Mega Bomb remains max ammo 1, costs `$375`, and remains late-match.
- [ ] Precision Shell has a small crater/radius and stronger direct-hit behavior.
- [ ] Airburst Shell detonates above terrain or near exposed targets and creates only modest terrain damage.
- [ ] Splitter Shell forks into a controlled two/three-child pattern near the top of the arc, brackets the target predictably, and resolves.
- [ ] Splitter Shell and Cluster Bomb have distinct icons, descriptions, visuals, sounds, and CPU role behavior.
- [ ] Heavy Roller rolls more heavily than Roller Shell and resolves reliably.
- [ ] Excavator Bomb removes noticeable terrain with low/moderate damage.
- [ ] Mound Maker creates a larger focused mound without breaking tank placement.
- [ ] Firestorm Canister creates a wider fire area with bounded burn ticks.
- [ ] New weapon icons render in shop, HUD, mobile HUD, and projectile sprites.
- [ ] New weapon fire/impact sounds are generated and distinct.
- [ ] New weapon visuals are distinct enough to identify their role.

## CPU Checks

- [ ] Easy CPU mostly uses Standard Shell and occasional limited weapons.
- [ ] Normal CPU uses role-based choices in obvious situations.
- [ ] Hard CPU uses limited weapons more intentionally but remains beatable.
- [ ] CPU does not select weapons with zero ammo.
- [ ] CPU does not buy ammo already at max.
- [ ] CPU prioritizes First Aid or Shield when low on health before luxury weapons.
- [ ] CPU avoids wasting Mega Bomb on low-health targets.
- [ ] CPU considers Excavator Bomb or Airburst Shell when terrain blocks the target.
- [ ] CPU considers Roller Shell or Heavy Roller when the target is downhill.
- [ ] CPU mode can complete round -> summary -> shop -> next round.

## Existing Feature Regression

- [ ] Two Player Local: Player 1 spends movement, fires, handoff appears, and Player 2 gets full movement allowance.
- [ ] Single Player vs CPU never shows the local handoff overlay between turns.
- [ ] Handoff overlay locks movement, aiming, weapon-cycle, and fire until Start Turn / Enter.
- [ ] Player identity labels remain clear across HUD, mobile HUD, handoff, turn label, and summary.
- [ ] Holding desktop `A` / `D` plays movement audio only while the active tank moves.
- [ ] Holding mobile movement buttons uses the same movement and movement-audio path.
- [ ] Movement audio stops on release, no fuel, blocked movement, projectile flight, resolving, shop, summary, menu, handoff, mute, and page hide.
- [ ] Result audio identity remains distinct for win/loss and round/match states.
- [ ] Generated audio respects mute and page lifecycle.
- [ ] Shield, First Aid Kit, and Parachute still work.
- [ ] Parachute deploys only for meaningful fall protection.
- [ ] Round summary remains readable and accurate.
- [ ] Help / How to Play opens and remains readable on desktop and mobile.

## CI and Static Validation

- [ ] `node --check` passes for all source and script files.
- [ ] `node scripts/validate-version.mjs v0.7.1` passes.
- [ ] `node scripts/check-release-notes.mjs v0.7.1` passes.
- [ ] `node scripts/check-artifacts.mjs` passes.
- [ ] `node scripts/check-pages-paths.mjs` passes.
- [ ] Version branches run validation only.
- [ ] GitHub Pages deployment workflow runs only from `main`.
- [ ] Workflow logs do not show Node 20 action deprecation warnings.

## Mobile and GitHub Pages

- [ ] Mobile landscape layout has usable controls, readable HUD, and reachable shop buttons.
- [ ] Mobile portrait rotate overlay still appears unless the player continues anyway.
- [ ] No horizontal scrolling in the mobile shop.
- [ ] iPhone Safari normal browser landscape uses the visible viewport and keeps gameplay controls tappable.
- [ ] iPhone Safari pre-round and between-round shop content scrolls if it exceeds the visible area.
- [ ] iPhone Safari `Start Round`, `Continue`, `New Match`, and `Main Menu` buttons are visible and tappable.
- [ ] iPhone Safari match result screen buttons are visible and tappable.
- [ ] iPhone Safari Add to Home Screen creates a Crater Command home-screen app entry.
- [ ] PWA/standalone launch hides the install hint and keeps the layout usable.
- [ ] `manifest.webmanifest` loads from the GitHub Pages project path.
- [ ] PWA icons load from local `icons/` paths.
- [ ] `Try Fullscreen` works on supported browsers and fails gracefully where unsupported.
- [ ] Android Chrome still keeps the mobile shop and gameplay controls usable.
- [ ] Gameplay controls still prevent accidental page scroll during active gameplay.
- [ ] Shop/menu screens allow intended scrolling.
- [ ] GitHub Pages project path works after merge to `main`: `https://jfhutchi.github.io/scorched_earth_remake/`.
- [ ] No root-relative runtime asset paths or CDN dependencies are introduced.

## Artifact Cleanup

- [ ] Generated screenshots, traces, reports, coverage, logs, and debug output are absent or ignored.
- [ ] `output/`, `outputs/`, `test-results/`, `playwright-report/`, `coverage/`, `screenshots/`, `tmp/`, `temp/`, `.nyc_output/`, and `debug-output/` are absent or ignored.
- [ ] No `*.trace.zip` or unnecessary `*.log` files are committed.
