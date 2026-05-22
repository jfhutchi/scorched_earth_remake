# v0.9.1 Resume Checkpoint

**Branch:** `feature/v0.9.1-mobile-cpu-fix` (off `main`, nothing committed yet)
**Stashed:** `stash@{0}` holds Codex's uncommitted Armory work for the future v0.9.2.

## v0.9.1 scope

Single fix: restore Duel vs CPU on mobile. The v0.9.0 menu reshuffle put `desktop-only` on `cpuBtn`, hiding it on phones.

## DONE

- `index.html` line 28: removed `desktop-only` from `cpuBtn`.
- `index.html` line 23: menu version → `v0.9.1`.
- `src/main.js` cpuBtn handler: added `if (isPhoneViewport() || isCoarsePointer()) tryFullscreen({ quiet: true });` for parity with `campaignBtn`.
- `src/config.js`: `GAME_VERSION = 'v0.9.1'`.
- `.github/workflows/pages.yml`: both validate refs → `v0.9.1`.
- `.github/workflows/validate.yml`: both validate refs → `v0.9.1`.
- `RELEASE_NOTES.md`: added `## v0.9.1 - Pending` block; demoted v0.9.0 block from `Pending` to released.
- `README.md` lines 3 + 7: bumped to v0.9.1 with one-line summary.

## TO DO (resume here)

1. **README.md still has `v0.9.0` on lines 33, 39, 40** — bump these to `v0.9.1`. Single `replace_all` from `v0.9.0` to `v0.9.1` is fine (no other v0.9.0 mentions remain after the lines 3+7 edit).
2. **TESTING.md** — `Current version:` header → `v0.9.1`. Add a tiny "v0.9.1 Mobile CPU Fix" check block (one item: phone-sized viewport shows Duel vs CPU and tapping it starts a duel).
3. **BALANCE.md** — `Current version:` → `v0.9.1`. No tuning changes — just a one-liner noting v0.9.1 is a UI fix.
4. **progress.md** — `Current Version: v0.9.1`, branch → `feature/v0.9.1-mobile-cpu-fix`, add a "v0.9.1 mobile CPU button restored" entry to latest completed work.
5. **Run validation:**
   ```
   node scripts/static-check.mjs
   node scripts/validate-version.mjs v0.9.1
   node scripts/check-release-notes.mjs v0.9.1
   node scripts/check-artifacts.mjs
   node scripts/check-pages-paths.mjs
   ```
   If `check-artifacts.mjs` complains about `V091_RESUME.md` or `V090_RESUME.md`, delete them before commit.
6. **Manual smoke test:**
   - DevTools mobile emulator (or real phone): Play Campaign, Duel vs CPU, How to Play, Sound, Try Fullscreen all visible. Tap Duel vs CPU → CPU duel starts.
   - Desktop: layout unchanged, all three primary buttons visible.

## Open decisions for the user

- After v0.9.1 PR merges, the next branch is **v0.9.2 = Armory**. To restore Codex's work: `git stash pop stash@{0}` (or whichever index it is after future stashes — current is `stash@{0}` with message `v0.9.2-armory: codex local work`).

## How to resume

Paste this file back to Claude and say: "continue from TO DO." I'll do steps 1-5 and report the validation output.
