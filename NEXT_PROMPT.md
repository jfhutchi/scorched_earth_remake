new version is v0.9.2 all areas must be updated
update the aiming trajectory preview so it feels more like Tank Stars.

Problem:
- The current aim arc in our game predicts all the way to the exact projectile impact point.
- That makes shots too easy because the player can see precisely where the projectile will land.

Goal:
- Keep real projectile physics unchanged.
- Only change the visual aiming guide / target arc.
- The guide should show a partial, helpful arc, but stop before the exact hit point.
- It should still respond to angle, power, weapon speed, and wind, but should not reveal the final landing location.

Likely code area:
- `src/game.js`
- Look for `_drawTrajectoryPreview(ctx, tank)`.

Desired behavior:
- Render a dotted/segmented arc like Tank Stars.
- Cap the preview to roughly the first 55-70% of the predicted path, or a fixed short time/dot count.
- Stop the preview before terrain/block collision instead of drawing to the exact collision point.
- Fade dots toward the end of the guide.
- Keep the guide readable but intentionally imperfect.
- Do not alter projectile flight, collision, weapon stats, damage, wind, or terrain behavior.

Acceptance criteria:
- Changing angle/power visibly changes the preview arc.
- The guide no longer reaches the exact landing or collision point.
- Firing still uses the same real physics as before.
- Duel vs CPU, Two Player Local, and Castle Siege still work.
- No console errors.

Validation:
- Run `node scripts/static-check.mjs`.
- Run `node scripts/validate-version.mjs v0.9.0` or the current active version if it has changed.
- Run `git diff --check`.
- Do a quick browser smoke test: aim at different powers and confirm the arc stops short of the actual hit.

Continue the Castle Siege Armory work from stash@{0} for v0.9.2 in e:\Documents\GitHub\scorched_earth_remake.

Context:
- The campaign currently awards siege coins, and the goal is to make those coins spendable without reusing the duel shop.
- Implement a lightweight Castle Siege Armory:
  - Accessible from level select and the Castle Siege result overlay.
  - Uses persistent Castle Siege progress storage under `crater-command-siege-progress-v1`.
  - Adds `armory: {}` to progress.
  - Lets players buy one-attempt bonus ammo caches with siege coins.
  - Stocked supplies auto-load into the next Castle Siege attempt and are consumed when that attempt starts.
  - Keep Duel vs CPU and Two Player Local shop behavior unchanged.

Expected files/areas:
- `src/siege/armory.js`: armory item catalog, purchase helper, consume helper, summary helper.
- `src/siege/progress.js`: preserve/sanitize `armory`.
- `src/game.js`: consume armory supplies in `startCastleSiege()` and merge bonus ammo into `createSiegeAmmo()`.
- `src/ui.js`: Armory overlay rendering and purchase disabled states.
- `src/main.js`: Armory routing and purchase sound feedback.
- `index.html`: Armory buttons and overlay DOM.
- `styles.css`: Armory layout and responsive styles.
- Docs: `README.md`, `RELEASE_NOTES.md`, `TESTING.md`, `BALANCE.md`, `progress.md`.

Suggested initial Armory items:
- Precision Shell Cache: $80, max stock 3, +1 Precision Shell.
- Heavy Shell Cache: $90, max stock 3, +1 Heavy Shell.
- Excavator Bomb Cache: $105, max stock 2, +1 Excavator Bomb.
- Cluster Bomb Cache: $125, max stock 2, +1 Cluster Bomb.

Before editing:
1. Inspect `git status --short`.
2. Inspect the stash with `git stash show --stat stash@{0}`.
3. Apply with `git stash apply stash@{0}` if appropriate.
4. Resolve conflicts without reverting unrelated user changes.

Validation:
- `node scripts/static-check.mjs`
- `node scripts/validate-version.mjs v0.9.2`
- `node scripts/check-release-notes.mjs v0.9.2`
- `node scripts/check-artifacts.mjs`
- `node scripts/check-pages-paths.mjs`
- `git diff --check`

Smoke test:
- Seed Castle Siege progress with test coins.
- Open Campaign -> Armory.
- Buy a Precision cache.
- Confirm coins decrement and `progress.armory.precision` increments.
- Start `siege_001`.
- Confirm the Armory supply is consumed and the player receives 1 Precision Shell.
- Confirm Duel vs CPU and Two Player Local still start.