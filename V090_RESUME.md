# v0.9.0 Resume Checkpoint

**Paste this whole file back to Claude to resume.**

## Session context

- **Repo:** `e:\Documents\GitHub\scorched_earth_remake`
- **Branch:** `feature/v0.9.0-level-engine` (branched from `main` after v0.8.0 was merged)
- **Working tree:** Uncommitted in-progress changes. Do NOT commit yet — milestone not done.
- **Plan file:** `C:\Users\JHutc\.claude\plans\eager-gathering-sifakis.md` (the full v0.9.0 → v1.0.0 roadmap).
- **User decisions already made this session:**
  - Endpoint: Android-shippable via Capacitor (later milestone).
  - Monetization: Coins + optional rewarded ads (later milestone).
  - Depth: special blocks + defenders + multi-stage + tank/weapon upgrades (later milestones).
  - Content: 40+ levels, 5+ worlds.
  - Restructure: **minimal `src/siege/` subfolder** (chosen mid-session over full domain reorg).
  - Pages.yml + validate.yml version refs must be bumped each version (user directive).

## What v0.9.0 is

First milestone of the roadmap. Goal: lock the level schema for 40+ future levels, ship 16 levels across 2 worlds with a level-select screen and star-gated world unlock.

Acceptance from the plan:
- Level select shows worlds 1 and 2; world 2 locked until 6 stars in W1 (CURRENT VALUE is 12 stars — discuss with user; spec said 6 but I set 12 for tighter pacing).
- Each level boots from level-select and returns to level-select on victory/failure.
- Result overlay offers Next Level button.
- Duel modes unaffected.
- Validation scripts pass.

## DONE so far

1. ✅ Branched from `main` to `feature/v0.9.0-level-engine`.
2. ✅ `GAME_VERSION` bumped to `v0.9.0` in `src/config.js`.
3. ✅ Workflow version refs bumped:
   - `.github/workflows/pages.yml` lines 35,38 → `v0.9.0`
   - `.github/workflows/validate.yml` lines 32,35 → `v0.9.0`
4. ✅ **Restructure: minimal `src/siege/` subfolder.**
   - `git mv` of all 5 files:
     - `src/castleSiegeBlocks.js` → `src/siege/blocks.js`
     - `src/castleSiegeLevels.js` → `src/siege/levels.js`
     - `src/castleSiegeMode.js` → `src/siege/mode.js`
     - `src/castleSiegeProgress.js` → `src/siege/progress.js`
     - `src/castleSiegeRenderer.js` → `src/siege/renderer.js`
   - Internal imports updated in `siege/mode.js` and `siege/renderer.js`.
   - External imports updated in `src/game.js` (lines 9-10 now `./siege/mode.js` and `./siege/renderer.js`).
   - Syntax-checked with `node --check`. Passes.
5. ✅ **16 level files written, 8 per world:**
   - `src/siege/levels/world1/siege_001.js` Lone Pillar
   - `src/siege/levels/world1/siege_002.js` Twin Stack
   - `src/siege/levels/world1/siege_003.js` Footbridge
   - `src/siege/levels/world1/siege_004.js` Old Watchtower
   - `src/siege/levels/world1/siege_005.js` Lean-To
   - `src/siege/levels/world1/siege_006.js` Stacked Tower
   - `src/siege/levels/world1/siege_007.js` Sheltered Core
   - `src/siege/levels/world1/siege_008.js` Outpost Citadel
   - `src/siege/levels/world2/siege_009.js` Stone Cap
   - `src/siege/levels/world2/siege_010.js` Hard Wall
   - `src/siege/levels/world2/siege_011.js` Stone Pillars
   - `src/siege/levels/world2/siege_012.js` The Vault
   - `src/siege/levels/world2/siege_013.js` Heavy Bridge
   - `src/siege/levels/world2/siege_014.js` Layered Defense
   - `src/siege/levels/world2/siege_015.js` Quarry Keep
   - `src/siege/levels/world2/siege_016.js` Stronghold
   - World 1: wood + crystal only. World 2: adds stone.
   - Each level exports a single named const matching its id.
6. ✅ `src/siege/worlds.js` created with `CASTLE_SIEGE_WORLDS`, `getWorld`, `getWorldForLevel`, `getStarsEarnedInWorld`, `isWorldUnlocked`, `isLevelUnlocked`, `findNextUnlockedLevelId`, `getNextLevelInCampaign`, `summarizeCampaignProgress`.
7. ✅ `src/siege/levels.js` refactored from one big literal into 16 imports + an aggregator (`CASTLE_SIEGE_LEVELS` map, `CASTLE_SIEGE_LEVEL_ORDER` array, `getCastleSiegeLevel`, `getNextCastleSiegeLevelId`).
8. ✅ `src/siege/progress.js` extended with `getStarsTotal(progress)` and `getLevelProgress(progress, levelId)` exports.
9. ✅ Level-select overlay DOM added to `index.html` (`#levelSelectOverlay`, `#levelSelectSummary`, `#levelSelectWorlds`, `#levelSelectBackBtn`).
10. ✅ Result overlay extended with `#siegeNextBtn` (hidden by default) and `#siegeLevelSelectBtn`.
11. ✅ `styles.css` got `.level-select-card`, `.level-select-summary`, `.level-select-worlds`, `.level-select-world`, `.level-select-world-header`, `.level-select-grid`, `.level-card` styles plus mobile breakpoints.
12. ✅ `src/ui.js` constructor now grabs references for: `siegeNextBtn`, `siegeLevelSelectBtn`, `levelSelectOverlay`, `levelSelectWorlds`, `levelSelectSummary`, `levelSelectBackBtn`.

## IN PROGRESS — pick up exactly here

**Last action:** Added the 7 new UI element references to `src/ui.js` constructor (around line 25-30, right after `siegeMenuBtn`). The next step was to add `showLevelSelect(progress)` / `hideLevelSelect()` methods to the `UI` class, then update `showCastleSiegeResult(result)` to control the Next button.

The TODO list from the in-progress run, in order:

1. **Wire `showLevelSelect`/`hideLevelSelect` in `src/ui.js`** ← STOPPED HERE
   - Needs to import worlds catalog: `import { CASTLE_SIEGE_WORLDS, isLevelUnlocked, isWorldUnlocked, getStarsEarnedInWorld, summarizeCampaignProgress } from './siege/worlds.js';` (note: only if used in ui.js — could also be passed in from main.js)
   - Needs `import { getCastleSiegeLevel } from './siege/levels.js';` for level name lookup
   - `showLevelSelect(progress, { onSelect, onBack })`: rebuilds the world/level grid into `this.levelSelectWorlds`; each level button calls `onSelect(levelId)`; back button calls `onBack()`. Use `progress.completedLevels[id]?.bestStars` for star pips.
   - `hideLevelSelect()`: just `.classList.add('hidden')`.
   - Also fold in: extend `showCastleSiegeResult(result)` to show/hide `siegeNextBtn` based on whether there's a next unlocked level. Caller (game.js) decides; ui.js just toggles.
   - Also add `siegeNextBtn` and `levelSelectOverlay` and `siegeLevelSelectBtn` to `hideAllOverlays()`.

2. **Wire `campaignBtn` in `src/main.js` to open level-select instead of jumping straight into siege_001.**
   - Replace `startMatch('siege')` with `ui.showLevelSelect(...)`, supplying:
     - `onSelect(levelId)` → `game.startCastleSiege(ui.getSettings(), levelId)` (need to confirm `startCastleSiege` signature; v0.8 had it).
     - `onBack()` → close overlay, return to menu (no action needed beyond hide).
   - Wire `siegeNextBtn` click → `game.startCastleSiege(ui.getSettings(), nextLevelId)`. `nextLevelId` from `getNextLevelInCampaign(currentLevelId)`.
   - Wire `siegeLevelSelectBtn` click → close result overlay, call `ui.showLevelSelect(...)` again.
   - Wire `levelSelectBackBtn` click → `ui.hideLevelSelect()` (returns to menu since menu is below).

3. **Update `src/game.js`:**
   - In `_showCastleSiegeVictory()`: compute next level via `getNextLevelInCampaign(this.siege.level.id)` (import from `./siege/worlds.js`); attach `nextLevelId` and `nextLevelName` to the result object before calling `ui.showCastleSiegeResult(result)`.
   - Make sure `restartCastleSiegeLevel(levelId)` accepts an explicit levelId (already does in v0.8 — verify).
   - Confirm `startCastleSiege(settings, levelId)` already accepts a levelId arg (it does — see earlier review).

4. **Update docs:**
   - `README.md` — current version → `v0.9.0`, short note about level-select + 16 levels across 2 worlds.
   - `RELEASE_NOTES.md` — add `## v0.9.0 - Pending` block at top covering: level engine refactor, 16 levels across 2 worlds, level-select screen, star-gated world unlock, restructure into `src/siege/`.
   - `TESTING.md` — header → `v0.9.0`; add level-select checks (open from menu, world 1 unlocked, world 2 locked at 0 stars, completing world 1 with X stars unlocks world 2, next-level button on victory).
   - `BALANCE.md` — header → `v0.9.0`; document new shotLimit/par values per level if user wants the tuning visible.
   - `progress.md` — add v0.9.0 latest-completed-work block.

5. **Run validation:**
   ```
   node scripts/static-check.mjs
   node scripts/validate-version.mjs v0.9.0
   node scripts/check-release-notes.mjs v0.9.0
   node scripts/check-artifacts.mjs
   node scripts/check-pages-paths.mjs
   ```
   - If `check-artifacts.mjs` complains about `V090_RESUME.md`, delete it before commit.
   - If `validate-version.mjs` scans for the version in unexpected files (e.g. `manifest.webmanifest`), bump those too.

6. **Manual smoke test:**
   - `python -m http.server 8000` from repo root.
   - Open `http://localhost:8000`.
   - Play Campaign → level select shows world 1 unlocked, world 2 locked.
   - Click siege_001 → game loads, can fire, beats level → result overlay shows Next + Replay + Levels + Main Menu.
   - Next → siege_002 boots.
   - Back to level-select → siege_001 shows stars earned.
   - Confirm Duel vs CPU still works.
   - Confirm Two Player Local still works.

## Open questions / things to confirm with user when resuming

1. **World 2 unlock threshold**: plan said 6 stars; I set 12 stars in `src/siege/worlds.js` `CASTLE_SIEGE_WORLDS[1].starsToUnlock`. Tighter pacing but slightly stricter. Ask user.
2. **Should level-select replace the menu (push it down) or overlay on top?** Currently it's an overlay — user clicks Main Menu / Back to dismiss.
3. **Should `siegeNextBtn` advance across world boundaries or stop at world-end and show a celebratory card?** Currently `getNextLevelInCampaign` returns the next world's first level if available (`crossesWorld: true` flag set). UI doesn't currently treat that specially.
4. **Commit cadence**: should the restructure be its own commit, then the level-engine work be a second commit, then UI a third? Or one bundled `Add Castle Siege level engine + 16 levels + level-select (v0.9.0)`?

## File map (post-session state)

```
src/
  audio.js  backgroundRenderer.js  config.js  cpu.js  game.js  main.js
  projectile.js  tank.js  tankRenderer.js  terrain.js  terrainRenderer.js
  themes.js  touchInput.js  ui.js  visualAssets.js
  siege/                         ← NEW SUBFOLDER (minimal restructure)
    blocks.js                    ← moved from src/castleSiegeBlocks.js
    levels.js                    ← refactored to aggregator
    mode.js                      ← imports updated
    progress.js                  ← getStarsTotal added
    renderer.js                  ← import updated
    worlds.js                    ← NEW
    levels/                      ← NEW
      world1/
        siege_001.js .. siege_008.js
      world2/
        siege_009.js .. siege_016.js
```

## How to resume

Paste this whole file back. Then say "continue from the IN PROGRESS section." I will:
1. Re-read `src/ui.js` around lines 19-32 to confirm references are in.
2. Add `showLevelSelect` / `hideLevelSelect` methods + Next button toggling in `showCastleSiegeResult`.
3. Walk down the remaining 5 numbered items.
4. Validate.
5. Report.
