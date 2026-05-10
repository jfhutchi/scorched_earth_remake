# Manual Testing Checklist

Current version: `v0.7.0`

Use a local static server, open the game in a desktop or mobile browser, and keep DevTools open for console errors. For mobile testing, use a real device on the LAN IP when possible.

## Required Pre-Merge Smoke Test

- [ ] Main menu shows `v0.7.0`.
- [ ] Gameplay screen does not show a floating version badge.
- [ ] `window.GAME_VERSION` returns `"v0.7.0"`.
- [ ] Single Player vs CPU starts from the primary menu action.
- [ ] Phone-sized layout shows the single `Play` button and it starts Single Player vs CPU.
- [ ] Two Player Local remains available on desktop/wider layouts.
- [ ] Rounds to Win, Starting Money, CPU Difficulty, Wind, and Terrain dropdowns are readable when closed and when opened.
- [ ] Default starting money is `None ($0)`.
- [ ] Pre-round shop opens before Round 1 with `$0`.
- [ ] Standard Shell is unlimited and has no shop ammo card.
- [ ] Existing weapons still appear, buy/refill where limited, select, fire, and resolve.
- [ ] New v0.7.0 weapons appear in the shop with icons, descriptions, category labels, prices, and ammo states.
- [ ] New weapons can be bought/refilled, selected, fired, and resolved without turn lockups.
- [ ] CPU can shop, take turns, and fire supported weapons without freezing.
- [ ] Mobile landscape controls and compact shop remain usable.
- [ ] Desktop keyboard controls still work.
- [ ] `BALANCE.md` exists and references `v0.7.0`.
- [ ] GitHub Actions validation passes.
- [ ] No stale test artifacts are committed.
- [ ] No startup or normal-play console errors occur.

## v0.7.0 Weapon Catalog Checks

Open with `?debug=1`.

- [ ] `window.debugWeapons()` lists every weapon id, name, category, price, ammo cap, speed scale, damage/radius values, CPU weight, and profile flags.
- [ ] `window.testWeaponCatalog().ok` is `true`.
- [ ] `window.testWeaponCatalog()` reports categories and no duplicate weapon ids.
- [ ] Every limited weapon has finite max ammo and a price.
- [ ] Every weapon has description, icon profile, visual profile, sound profile, role, and CPU metadata.
- [ ] `window.setupWeaponTest()` sets wind to 0, gives both players full ammo, and starts a predictable aiming scenario.
- [ ] `window.testWeaponReach()` includes existing and new weapons with reach, price, category, role, damage, and terrain data.

## Weapon Behavior Checks

- [ ] Standard Shell fires and remains unlimited.
- [ ] Heavy Shell fires, consumes ammo, has a heavier arc than Standard, and creates a larger crater.
- [ ] Dirt Bomb fires, consumes ammo, adds terrain, and keeps low damage.
- [ ] Roller Shell rolls along slopes and does not roll forever.
- [ ] Napalm Canister applies initial flame-area damage plus two small burn ticks.
- [ ] Cluster Bomb splits into five lighter bomblets and resolves.
- [ ] Mega Bomb remains max ammo 1, costs `$375`, and remains late-match.
- [ ] Precision Shell has a small crater/radius and stronger direct-hit behavior.
- [ ] Airburst Shell detonates above terrain or near exposed targets and creates only modest terrain damage.
- [ ] Splitter Shell splits into three medium shards and is distinct from Cluster Bomb.
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
- [ ] `node scripts/validate-version.mjs v0.7.0` passes.
- [ ] `node scripts/check-release-notes.mjs v0.7.0` passes.
- [ ] `node scripts/check-artifacts.mjs` passes.
- [ ] `node scripts/check-pages-paths.mjs` passes.
- [ ] Version branches run validation only.
- [ ] GitHub Pages deployment workflow runs only from `main`.

## Mobile and GitHub Pages

- [ ] Mobile landscape layout has usable controls, readable HUD, and reachable shop buttons.
- [ ] Mobile portrait rotate overlay still appears unless the player continues anyway.
- [ ] No horizontal scrolling in the mobile shop.
- [ ] GitHub Pages project path works after merge to `main`: `https://jfhutchi.github.io/scorched_earth_remake/`.
- [ ] No root-relative runtime asset paths or CDN dependencies are introduced.

## Artifact Cleanup

- [ ] Generated screenshots, traces, reports, coverage, logs, and debug output are absent or ignored.
- [ ] `output/`, `outputs/`, `test-results/`, `playwright-report/`, `coverage/`, `screenshots/`, `tmp/`, `temp/`, `.nyc_output/`, and `debug-output/` are absent or ignored.
- [ ] No `*.trace.zip` or unnecessary `*.log` files are committed.
