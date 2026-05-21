You are Codex / Claude Code acting as a senior frontend game developer, browser game UI engineer, gameplay systems engineer, game audio engineer, mobile Safari/PWA compatibility engineer, CI/CD engineer, and documentation maintainer inside my existing browser-based artillery tank game repository.

Context:
This is my existing browser-based artillery tank game, now titled Crater Command.

Current deployed stable version:
v0.7.0

Target version:
v0.7.1

Target branch:
version/v0.7.1

Branch safety requirements:
- Before making changes, check the current branch.
- Do not work directly on main.
- Do not work directly on gh-pages.
- Do not merge to main.
- Do not delete branches.
- Do not overwrite unrelated user work.
- Fetch the latest remote refs before creating or switching branches.
- If the working tree has uncommitted changes before starting, inspect them and stop unless they are clearly intended v0.7.1 work.
- If `version/v0.7.1` already exists locally, switch to it.
- If `version/v0.7.1` exists on origin but not locally, check it out from origin.
- If `version/v0.7.1` does not exist locally or remotely, create it from the latest `main`.
- Push `version/v0.7.1` to GitHub when the work is complete and committed.
- Commit only files related to v0.7.1.
- Final response must include:
  - current branch name
  - whether the branch was created or already existed
  - whether the branch was pushed
  - git status summary
  - commit hash if committed

Important:
v0.7.0 is already deployed. This is a v0.7.1 follow-up polish, debug, CI, mobile Safari/PWA, UI, shield, wind, and weapon-differentiation pass built on top of the deployed v0.7.0 baseline.

Do not rewrite the whole game.
Do not discard existing v0.7.0 weapon work.
Do not add online multiplayer.
Do not add a backend.
Do not add WebRTC.
Do not add room codes.
Do not add external image assets.
Do not add external audio files.
Do not add copyrighted assets.
Do not break GitHub Pages.
Do not deploy from version branches.
Do not merge to main.
Do not rename the GitHub repository unless explicitly instructed.
Do not add dependencies unless absolutely necessary.

Task:
Implement v0.7.1 as a focused follow-up pass.

This pass has twelve goals:
1. Rename the displayed game title and metadata to `Crater Command` without renaming the repository.
2. Fix GitHub Actions Node 20 deprecation warnings and harden CI validation.
3. Add a gated developer debug / cheat panel for testing weapons, money, ammo, utilities, wind, and match flow.
4. Upgrade HUD visual styling using the polished weapon info card style as the design anchor.
5. Fix dropdown/select contrast so opened dropdown options are readable.
6. Differentiate Splitter Shell from Cluster Bomb so they are not redundant.
7. Fix iPhone Safari viewport/shop usability and add PWA/home-screen support for a more fullscreen-like iPhone experience.
8. Enforce Shield hard cap at 60.
9. Improve Shield visual clarity and animation.
10. Fix Shield damage absorption so HP does not decrease until Shield is gone.
11. Clean up wind display so it appears only in the battlefield/background indicator and uses MPH-equivalent labels.
12. Fix weapon-switch info popup so it behaves as a non-layout-shifting overlay.

Preserve all deployed v0.7.0 functionality.

Version requirements:
- Update the central game version constant to `v0.7.1`.
- Main menu must show `v0.7.1`.
- Gameplay screen must not show a floating version badge.
- `window.GAME_VERSION` must return `"v0.7.1"`.
- README.md, TESTING.md, progress.md, RELEASE_NOTES.md, and BALANCE.md must reference `v0.7.1`.

Game title requirements:
- Displayed game title should be `Crater Command`.
- Browser title/meta title should use `Crater Command`.
- PWA manifest name should be `Crater Command`.
- PWA manifest short name should be `Crater`.
- Documentation should use `Crater Command` as the game name.
- Do not rename the GitHub repository.
- Do not break the GitHub Pages URL.

Hard rules:
- Preserve desktop keyboard controls.
- Preserve mobile touch controls.
- Preserve mobile Play button behavior.
- Preserve Play vs CPU as the primary main menu action.
- Preserve Two Player Local as an available secondary mode.
- Preserve all v0.7.0 weapons and weapon catalog work.
- Preserve Standard Shell unlimited ammo.
- Preserve Heavy Shell heavier arc behavior.
- Preserve Mega Bomb late-match economy gating.
- Preserve Napalm initial hit plus burn ticks.
- Preserve Parachute usefulness behavior.
- Preserve shop cards and compact mobile shop layout.
- Preserve match-end / best-of logic from v0.7.0.
- Preserve Two Player Local movement-state fix from v0.6.10.
- Preserve generated audio lifecycle.
- Preserve GitHub Pages compatibility.
- Do not reintroduce a floating gameplay version badge.
- Do not commit temporary test artifacts, Playwright screenshots, debug dumps, generated reports, coverage folders, or stale output files unless intentionally documented as project assets.
- All new icons must be generated/procedural/local.
- All new sounds must be generated Web Audio API only.
- Keep performance reasonable on mobile.
- iPhone Safari fixes must not regress Android Chrome.
- PWA support must use local assets and GitHub Pages-safe paths.

Primary goal:
Improve the deployed v0.7.0 game with the new Crater Command name, CI cleanup, developer testing tools, HUD polish, readable dropdowns, clearer weapon differentiation, iPhone Safari/PWA compatibility, correct Shield behavior, cleaner wind display, and fixed weapon-switch overlay behavior without destabilizing the weapon catalog or deployed gameplay.

1. Rename Displayed Game Title to Crater Command

Current issue:
The game still uses the older displayed title such as Tank Artillery Duel. The chosen game name is now Crater Command.

Requirement:
Rename the displayed game title and project-facing metadata to Crater Command.

Update:
- Main menu title
- Browser document title
- PWA manifest name
- PWA manifest short_name
- README.md
- TESTING.md
- progress.md
- RELEASE_NOTES.md
- BALANCE.md
- Any title/meta tags
- Any help/about text where the old game title appears

Do not:
- Rename the GitHub repository.
- Change the GitHub Pages URL.
- Break existing asset paths.
- Rename internal variables unless it is trivial and safe.

Acceptance Criteria:
- Main menu shows `Crater Command`.
- Browser tab title uses `Crater Command`.
- Documentation uses `Crater Command`.
- PWA metadata uses `Crater Command`.
- Repo name and GitHub Pages URL remain unchanged.

2. GitHub Actions Node 24 Warning Fix and CI Hardening

Current issue:
GitHub Actions build workflow warns that Node.js 20 actions are deprecated. The workflow is using actions such as `actions/checkout@v4` and `actions/upload-artifact@v4` that trigger Node 20 deprecation warnings.

Requirement:
Update GitHub Actions workflow action versions to Node 24-compatible/current versions where available, while preserving workflow behavior.

Required updates:
- Inspect all files under `.github/workflows`.
- Replace `actions/checkout@v4` with a newer Node 24-compatible official version, preferably `actions/checkout@v6` if compatible.
- Replace `actions/upload-artifact@v4` with a newer Node 24-compatible official version, preferably `actions/upload-artifact@v7` if compatible.
- If the Pages workflow uses `actions/upload-pages-artifact@v3`, update it to a newer compatible version, preferably `actions/upload-pages-artifact@v5` if compatible.
- Keep `actions/deploy-pages@v4` unless the workflow or current official action compatibility requires a newer version.
- Preserve existing permissions unless they are clearly wrong.
- Preserve main-only GitHub Pages deployment.
- Version branches such as `version/v0.7.1` should run validation only, not production deployment.
- Do not add unnecessary CI complexity.

CI validation requirements:
- Add or update PR validation workflow for:
  - pushes to `version/**`
  - pull requests into `main`
- Add or preserve checks for:
  - JavaScript syntax/build if applicable
  - static validation
  - version consistency
  - release notes presence
  - no stale output/test artifacts committed
  - GitHub Pages-safe asset paths if practical

Version consistency check:
Verify `v0.7.1` appears consistently in:
- source version constant
- README.md
- TESTING.md
- progress.md
- RELEASE_NOTES.md
- BALANCE.md

Release notes check:
- `RELEASE_NOTES.md` must contain a top entry for `v0.7.1 - Pending` or equivalent.

Artifact pollution check:
Fail or warn if these are committed:
- output/
- outputs/
- test-results/
- playwright-report/
- coverage/
- screenshots/
- tmp/
- temp/
- .nyc_output/
- debug-output/
- generated screenshots
- Playwright traces
- stale logs
- `*.trace.zip`
- unnecessary `*.log`

Update `.gitignore` if needed.

Optional browser smoke test:
If practical, add a lightweight Playwright or browser smoke test that verifies:
- page loads
- main menu is visible
- Crater Command title is visible
- v0.7.1 is visible
- Play vs CPU starts
- canvas exists
- no startup console errors

Acceptance Criteria:
- GitHub Actions no longer warns about `actions/checkout@v4`.
- GitHub Actions no longer warns about `actions/upload-artifact@v4`.
- Pages deployment still works from main only.
- Version branch validation still works.
- Workflow permissions remain correct.
- Version consistency is checked.
- Release notes presence is checked.
- Artifact clutter is ignored/detected.
- RELEASE_NOTES.md mentions GitHub Actions Node 24 compatibility cleanup under v0.7.1.
- TESTING.md includes checking that workflows run without Node 20 deprecation warnings.

3. Developer Debug / Cheat / Weapon Testing Mode

Current issue:
As the weapon list expands, it is too slow to test every weapon through normal earning/shop progression. The game needs a controlled debug/cheat mode for local development and manual QA.

Requirement:
Add a developer debug mode that can be intentionally enabled and used to test weapons, money, ammo, utilities, wind, shield, and match states.

Debug mode activation:
- Debug mode may be enabled by URL query parameter:
  - `?debug=1`
- Add keyboard shortcut:
  - `Ctrl + Shift + D`
- The shortcut should toggle a compact debug panel only when debug mode is allowed.
- If the page is not in debug mode, pressing `Ctrl + Shift + D` may show a small notice such as:
  - `Debug mode requires ?debug=1`
- Do not show the debug panel during normal gameplay unless debug mode is enabled.

Important:
This is not security. The game is a public browser game and users can always inspect client-side code. The goal is to avoid cluttering the normal player UI, not to create secure anti-cheat.

Debug panel requirements:
Add a compact, collapsible debug panel with buttons/actions for:

Money:
- Add $100 to active player.
- Add $500 to active player.
- Set active player money to $9999.
- Set Player 1 money to $9999.
- Set Player 2/CPU money to $9999.

Weapons and ammo:
- Unlock/refill all weapons for active player.
- Refill all weapons for Player 1.
- Refill all weapons for Player 2/CPU.
- Refill selected weapon.
- Set all limited ammo to max.
- Preserve Standard Shell as unlimited.
- Include all v0.7.0/v0.7.1 weapons automatically from the weapon catalog.

Utilities:
- Refill Shield up to the normal cap of 60.
- Refill First Aid Kit.
- Refill Parachute.
- Refill all utility items for active player.
- If a debug-only Shield override exists, it must be clearly labeled as an override and not used by normal refill.

Tank state:
- Heal active tank to full.
- Heal all tanks to full.
- Damage active enemy by 25.
- Damage active enemy by 75.
- Destroy active enemy.
- Clear shields.
- Add shield to active player, respecting the 60 cap.

Test setup:
- Set wind to 0.
- Set wind to light left.
- Set wind to light right.
- Setup weapon test range.
- Setup parachute/fall test if that helper exists.
- Setup flat terrain if practical.
- Give all weapons and utilities for testing.

Round/match flow:
- End current turn.
- Force round win for Player 1.
- Force round win for Player 2/CPU.
- Force match win for Player 1.
- Force match win for Player 2/CPU.
- Return to main menu.

Rules:
- Debug actions must only affect local in-browser game state.
- Do not add backend code.
- Do not add online cheat systems.
- Do not add network calls.
- Do not break normal gameplay.
- Do not expose debug controls in normal UI.
- Do not make debug panel huge or visually disruptive.
- Debug panel should be collapsible.
- Debug panel should work on desktop.
- Debug panel may be basic on mobile but must not break mobile layout.
- Debug actions must update HUD/shop/summary state immediately.
- Debug actions must not corrupt game state.
- Debug actions must not create negative ammo/money.
- Debug actions must not bypass match-end logic incorrectly unless explicitly forcing a result.
- Debug actions should work in Single Player vs CPU and Two Player Local where applicable.
- Debug panel must read from the current weapon catalog so all weapons are included automatically.
- Do not hardcode only old v0.6.x weapon names.
- Debug shield refill must respect the normal shield cap unless using a clearly labeled debug-only override.

Acceptance Criteria:
- Opening the game with `?debug=1` enables debug mode.
- `Ctrl + Shift + D` toggles the debug panel.
- Debug panel is hidden by default in normal play.
- Debug panel does not appear for normal players unless debug mode is enabled.
- Unlimited money action works.
- Refill all weapons gives max ammo for all limited weapons.
- All v0.7.x weapons are included in refill/unlock actions.
- Utility refill works for Shield, First Aid, and Parachute.
- Shield debug refill respects the cap of 60 unless using a clearly labeled override.
- Weapon test setup lets the player quickly test all weapons.
- Wind can be set to 0 for testing.
- Tank heal/damage actions work.
- Forced round/match result actions work without corrupting flow.
- HUD/shop update correctly after debug actions.
- Mobile layout is not broken.
- No console errors.
- TESTING.md documents debug mode and cheat panel tests.
- README.md briefly documents developer debug mode.
- BALANCE.md may mention debug mode as a balancing/testing aid.
- RELEASE_NOTES.md v0.7.1 mentions developer debug/cheat tools for weapon testing.

4. HUD Visual Language Upgrade Based on Weapon Info Card

Current observation:
The small weapon/ammo info frame, the dark rounded popup that shows the weapon icon, weapon name, and ammo/details, looks better and more polished than the original HUD blocks. Its styling feels more like the finished game UI.

Requirement:
Use the visual style of that weapon info frame as the design reference for the broader HUD refresh.

Goal:
Make the main HUD feel more like a cohesive game UI and less like flat prototype panels.

Design direction:
Promote the existing weapon info card style into the HUD system:
- dark or dark-translucent rounded panels
- subtle highlight/border
- better spacing/padding
- clearer typography hierarchy
- small icon support where useful
- stronger separation between label and value
- more polished, finished card appearance

Apply this style carefully to:
1. selected weapon display
2. ammo display
3. angle / power / move stat blocks
4. center turn-status panel
5. player status panels if practical
6. small status pills/badges if useful

Do not include duplicate wind in the upper HUD. Wind should be shown by the battlefield wind indicator only.

Do not blindly restyle everything the same size.
The goal is a cohesive UI family, not giant duplicate boxes.

Priority:
1. selected weapon display
2. center stat tiles
3. turn panel
4. player panels only if stable and not disruptive

Acceptance Criteria:
- The selected weapon display visually matches the better polished card style.
- The center stat blocks look more like finished UI cards.
- The HUD feels visually more cohesive overall.
- The original flat/prototype look is reduced.
- Player panels are improved if practical without becoming oversized.
- Wind is not duplicated in the top HUD.
- Desktop remains readable.
- Mobile remains readable and playable.
- No gameplay controls are blocked.
- No console errors.
- TESTING.md includes HUD readability checks.
- RELEASE_NOTES.md mentions HUD visual language polish.
- progress.md mentions the weapon info card styling informed broader HUD cleanup.

5. Dropdown / Select Contrast Fix

Current issue:
The main menu dropdowns still have unreadable option text when opened. The option list shows a light/white native dropdown background with very light text, making options such as Rounds to Win / Match Length, Starting Money, CPU Difficulty, Wind, and Terrain hard to read.

Requirement:
Fix all select/dropdown styling so the closed select and opened dropdown options remain readable.

Target visual:
Dropdowns should visually match the game’s dark button/panel style as much as browsers allow.

Rules:
- All select controls must have readable text in closed state.
- All option rows must have readable text when dropdown is open.
- Selected option must remain readable.
- Focused/hovered option must remain readable where browser styling allows.
- Disabled options must remain readable enough to understand.
- Dropdown should visually match the dark green/bronze game UI instead of default white browser styling.
- Do not make text white-on-white or pale-on-white.
- Do not break mobile browser dropdown behavior.
- Do not replace all selects with a complex custom dropdown unless native CSS styling cannot fix readability.
- Keep keyboard accessibility.
- Keep existing settings behavior.
- Preserve settings persistence.
- Apply the fix to all current menu/settings selects.

Acceptance Criteria:
- Rounds to Win / Match Length dropdown is readable when opened.
- Starting Money dropdown is readable when opened.
- CPU Difficulty dropdown is readable when opened.
- Wind dropdown is readable when opened.
- Terrain dropdown is readable when opened.
- Dropdowns look visually consistent with the game UI.
- Dropdowns remain usable on desktop.
- Dropdowns remain usable on mobile.
- Keyboard navigation still works.
- No settings behavior regresses.
- TESTING.md includes a dropdown contrast check.
- RELEASE_NOTES.md mentions dropdown contrast/readability fix under v0.7.1.

6. Splitter Shell vs Cluster Bomb Differentiation

Current issue:
Splitter Shell and Cluster Bomb currently feel too similar. Both behave like one projectile that separates into multiple smaller explosive impacts. This makes one of them redundant.

Requirement:
Differentiate Splitter Shell and Cluster Bomb so they have clearly different gameplay roles, visuals, sounds, shop descriptions, metadata, and CPU behavior.

Design direction:
Cluster Bomb should remain the chaotic area-saturation weapon.

Splitter Shell should become a controlled mid-air fork weapon.

Final weapon identities:

Cluster Bomb:
- Wide-area saturation.
- Less precise.
- Multiple bomblets.
- Bomblets spread over a wider area.
- Preferably 4–6 bomblets.
- Each bomblet has lower damage.
- Good for area denial / probability hits.

Splitter Shell:
- Controlled fork shot.
- More precise than Cluster Bomb.
- Smaller number of child projectiles.
- Exactly 2 or 3 child shells.
- Predictable fork pattern near peak arc or after short fuse.
- One shell continues mostly forward, with others forking slightly left/right/down.
- Rewards aim more than Cluster Bomb.
- Less terrain chaos than Cluster Bomb.

Shop description:
- Cluster Bomb: “Splits into several bomblets for wide area coverage.”
- Splitter Shell: “Forks into controlled child shells near the top of its arc.”

Balance:
- Splitter Shell should be cheaper or similar price to Cluster Bomb depending on power.
- Cluster Bomb should cover more area.
- Splitter Shell should be more predictable.
- Neither should obsolete the other.

Acceptance Criteria:
- Splitter Shell and Cluster Bomb feel clearly different in gameplay.
- Splitter Shell uses a controlled 2–3 projectile fork pattern.
- Cluster Bomb remains a wider bomblet area weapon.
- Splitter Shell is more predictable than Cluster Bomb.
- Cluster Bomb covers more area than Splitter Shell.
- Both weapons have distinct icons/descriptions.
- Both weapons have distinct visual effects.
- Both weapons have distinct sounds.
- CPU metadata treats them differently.
- BALANCE.md explains the difference.
- README.md explains the difference.
- TESTING.md includes tests for both weapons.
- RELEASE_NOTES.md mentions Splitter/Cluster differentiation under v0.7.1.
- No turn-resolution lockups.
- No console errors.

7. iPhone Safari Fullscreen / PWA Display Fix

Current issue:
On iPhone Safari, the game does not go fullscreen. The Safari address bar, tab bar, and browser controls remain visible, which reduces the playable area and makes the landscape game feel cramped. Also, the shop does not work well between rounds/matches on iPhone Safari, while Android Chrome works well.

Important platform reality:
A normal iPhone Safari browser tab cannot always be forced into true fullscreen. The game should:
1. Use the maximum visible viewport possible in browser mode.
2. Provide a PWA/home-screen install path for a more app-like fullscreen/standalone experience.
3. Avoid claiming true fullscreen is guaranteed inside a normal Safari tab.

Requirement:
Improve iPhone Safari fullscreen behavior and add PWA support for Crater Command.

Goals:
- Maximize the usable game area in normal iPhone Safari.
- Add installable PWA metadata so iPhone users can add the game to their home screen.
- When launched from the iPhone home screen, the game should run in standalone/app-like mode without the normal Safari browser chrome as much as iOS allows.
- Fix iPhone Safari shop/overlay scrolling and touch behavior.
- Keep GitHub Pages compatibility.
- Do not add a backend.
- Do not add external dependencies.

Browser viewport optimization:
- Use `100dvh` where supported.
- Add a fallback CSS variable such as `--app-height`.
- Update `--app-height` from JavaScript using `window.visualViewport.height` when available and `window.innerHeight` as fallback.
- Update this variable on resize, orientationchange, and visualViewport resize.
- Apply this sizing to app shell, gameplay screen, overlays, shop, match result screens, help/settings screens if needed.
- Avoid relying only on `100vh`.
- Ensure canvas/game area fits inside visible viewport.
- Ensure controls remain visible and tappable.
- Use safe-area padding where needed.

PWA support:
- Add or update `manifest.webmanifest`.
- Link the manifest in `index.html`.
- Add iOS-specific meta tags.
- Manifest name: `Crater Command`.
- Manifest short_name: `Crater`.
- start_url and scope must work under GitHub Pages project path.
- display should prefer `fullscreen` or `standalone`.
- background_color/theme_color should match the game.
- orientation should prefer `landscape`.
- Icons should be local/generated assets committed to the repo.
- Use safe GitHub Pages-relative paths.

Fullscreen/install guidance:
- Add a small fullscreen/install hint or button in main menu/help screen.
- On browsers supporting `requestFullscreen()`, allow user-gesture-triggered fullscreen attempt.
- If fullscreen request is unsupported or fails, fail gracefully.
- On iPhone Safari, show guidance:
  - “For the best fullscreen experience on iPhone, tap Share → Add to Home Screen, then launch Crater Command from the home screen.”
- Do not repeatedly nag the player.
- Hide install hint in standalone/PWA mode.

Standalone detection:
- Detect `window.navigator.standalone === true`.
- Detect `window.matchMedia('(display-mode: standalone)').matches`.
- Detect `window.matchMedia('(display-mode: fullscreen)').matches`.
- Use only for layout/help behavior.

iPhone Safari shop/overlay compatibility:
- Between-round shop must be usable on iPhone Safari.
- Shop must scroll if content exceeds visible area.
- Start Round / Continue / New Match / Main Menu buttons must remain reachable.
- Do not globally block touch scrolling while shop/menu is open.
- Use `-webkit-overflow-scrolling: touch` on scrollable panels.
- Use safe-area padding.
- Use `touch-action: pan-y` for scrollable menu/shop areas if needed.
- Keep gameplay controls restrictive only during gameplay/canvas interaction.
- Do not break Android Chrome where the shop already works well.

Acceptance Criteria:
- iPhone Safari landscape uses visible viewport better.
- iPhone Safari shop scrolls.
- iPhone Safari shop buttons are tappable.
- Match result buttons are tappable.
- Pre-round shop works.
- Between-round shop works.
- PWA manifest exists and loads.
- PWA icons exist locally and load.
- Add to Home Screen guidance exists.
- Android Chrome remains good.
- Desktop remains good.
- No console errors.

8. Shield Hard Cap Fix

Current issue:
Shield can currently exceed the intended cap. HUD has shown Shield 120, which should not be possible. Shield purchases should stop when the current shield level reaches 60.

Requirement:
Enforce a hard Shield cap of 60.

Rules:
- Maximum shield value is 60.
- Shield purchase must be disabled when the player’s current shield is 60 or higher.
- Buying shield must never raise shield above 60.
- If a player somehow already has shield above 60 from old state/debug/testing, clamp it down to 60 safely.
- CPU shield purchasing must obey the same cap.
- Debug/cheat tools must also respect the cap unless there is an explicitly labeled debug-only override.
- HUD must never display shield above 60 during normal gameplay.
- Shop card should show Full or Max when shield is at 60.
- Player must not be charged money when shield is already full.
- Invalid shield purchase should play/show normal invalid feedback if that system exists.
- Do not change HP max.
- Do not confuse HP and Shield values.
- Do not globally rebalance shield unless necessary.

Implementation guidance:
- Add a central constant such as `MAX_SHIELD = 60` if one does not already exist.
- Use that constant everywhere shield is modified.
- Clamp shield after:
  - purchase
  - CPU purchase
  - debug refill
  - new round setup
  - loading/restoring state if applicable
- Prefer helper functions such as:
  - `addShield(player, amount)`
  - `clampShield(player)`
  - `canBuyShield(player)`
- Do not allow scattered direct shield mutation that can bypass the cap.
- Fix any visible spelling issues: use `Shield`, not `Sheild`.

Acceptance Criteria:
- Shield cannot exceed 60 in normal gameplay.
- Shield shop card disables at 60.
- Shield shop card shows Full/Max at 60.
- Player is not charged for shield when already at 60.
- CPU cannot buy shield past 60.
- Existing over-cap shield values are clamped to 60.
- HUD never shows Shield above 60 during normal gameplay.
- Debug refill does not accidentally create Shield 120 unless explicitly using a debug override.
- No console errors.

9. Shield Damage Absorption Fix

Current issue:
When hitting a shielded tank with Heavy Shell, both Shield and HP decrease. This is wrong. HP should not move until Shield is gone.

Requirement:
Fix the damage pipeline so Shield absorbs incoming damage before HP is reduced.

Expected behavior:
- If target Shield is greater than 0, incoming damage must be applied to Shield first.
- HP should not decrease while Shield remains above 0 after the hit.
- Only damage that exceeds the remaining Shield should overflow into HP.
- If Shield fully absorbs the hit, HP must remain unchanged.
- This must apply to both Player 1 and CPU/Player 2.
- This must apply consistently to all normal damage sources unless a weapon is explicitly documented as bypassing shields.
- Currently, no weapon should bypass Shield unless already intentionally implemented and documented.

Examples:
- Target has Shield 60 and HP 100. Incoming damage 25:
  - Shield becomes 35.
  - HP remains 100.
- Target has Shield 10 and HP 100. Incoming damage 25:
  - Shield becomes 0.
  - HP becomes 85.
- Target has Shield 0 and HP 100. Incoming damage 25:
  - Shield remains 0.
  - HP becomes 75.

Damage sources to check:
- Standard Shell
- Heavy Shell
- Dirt Bomb if it deals damage
- Roller Shell
- Heavy Roller
- Napalm initial hit
- Napalm burn ticks
- Cluster Bomb bomblets
- Splitter Shell child projectiles
- Mega Bomb
- Firestorm if present
- Airburst / Precision / Excavator / Mound Maker if present and they deal damage
- Fall damage if it is meant to be shielded
- Debug damage actions if practical

Rules:
- Use one central damage function if possible.
- Do not let weapons directly subtract HP while bypassing shield.
- Do not double-count damage.
- Do not duplicate death sounds.
- Do not duplicate score/money awards.
- Do not let delayed burn ticks damage HP while Shield is still available unless burn bypass is explicitly designed and documented.
- Do not show misleading damage feedback.
- Shield feedback should show absorbed damage.
- HP damage feedback should show only actual HP damage.
- Round stats should distinguish HP damage from shield absorption if such stats exist.
- If money is awarded for damage, decide whether shield damage earns money and document/keep consistent with existing economy. Do not accidentally double-award.

Recommended implementation:
- Create or fix a helper such as:
  - `applyDamage(target, amount, source, options)`
- Return a damage result object:
  - `shieldDamage`
  - `hpDamage`
  - `remainingShield`
  - `remainingHp`
  - `killed`
- Use that result for:
  - HUD updates
  - floating feedback
  - score/money
  - death resolution
  - sound effects

Acceptance Criteria:
- Heavy Shell against active Shield reduces Shield first.
- HP does not decrease until Shield is fully depleted.
- Overflow damage works correctly.
- Shield-only hits do not trigger tank death.
- Shield-only hits do not reduce HP.
- All weapons use consistent Shield-before-HP behavior.
- Napalm burn ticks respect Shield unless clearly documented otherwise.
- Debug damage actions respect Shield unless clearly labeled as direct HP damage.
- Floating feedback clearly shows Shield absorption and HP damage separately.
- HUD updates correctly after damage.
- No duplicate death sounds.
- No duplicate score/money bugs.
- No console errors.

10. Shield Visual Readability / Animation Upgrade

Current issue:
Both tanks can have shields active, but the shield effect is too faint and inconsistent in readability. The blue tank’s shield is especially hard to see against snowy/light terrain.

Requirement:
Upgrade the shield visual so an active Shield is immediately recognizable on any tank, terrain theme, and background brightness.

Goals:
- Make Shield presence obvious at a glance.
- Preserve tank readability.
- Keep the effect visually polished, not noisy.
- Make the effect readable on desktop and mobile.
- Ensure Shield visuals are equally visible on orange/red and blue tanks.

Required shield visual improvements:
1. Stronger outer ring / bubble.
2. Gentle animated pulse.
3. Soft glow / aura.
4. Stronger color separation.
5. Clear layering around full tank silhouette.
6. Optional shield strength readability.
7. Clear shield break/depletion feedback if practical.

Design direction:
- bright cyan/white outer ring
- soft translucent bubble fill
- slow pulse
- subtle glow
- shield-break burst/pop/crackle on depletion if practical

Rules:
- Do not reduce performance significantly.
- Do not hide the tank silhouette.
- Do not create a distracting constant flashing effect.
- Do not make shield visuals so large they interfere with aiming clarity.
- Do not make orange tank shield much more readable than blue tank shield.
- Do not rely only on a faint dashed circle.
- Preserve existing shield gameplay behavior except for the cap and damage absorption fixes.

Acceptance Criteria:
- Active Shield is clearly visible on Player 1.
- Active Shield is clearly visible on CPU/blue tank.
- Shield remains visible on bright/snowy themes.
- Shield remains visible on dark themes.
- Shield has a more pronounced, polished animated look.
- Shield break/depletion feedback is visible if implemented.
- Mobile readability is improved.
- No gameplay logic regressions.
- No console errors.

11. Wind Display Cleanup and MPH-Equivalent Labels

Current issue:
Wind was re-added to the upper HUD/status area. That creates duplicate wind display and clutters the HUD. Wind should be shown only on the battlefield/background wind indicator under the HUD, not inside the top HUD/player/status panels.

Goal:
Keep wind visible and readable, but only in the battlefield indicator area. Also make the wind display use MPH-style labels while preserving the existing wind physics.

Remove wind from upper HUD:
- Do not show wind in top player panels.
- Do not show wind in center HUD stat cards if it duplicates the battlefield indicator.
- Do not show wind in compact top mobile HUD if the battlefield indicator is visible.
- Keep battlefield/background wind indicator visible and readable.
- Wind indicator should remain near gameplay/sky/trajectory area, under the HUD rather than inside the HUD.
- Do not remove wind physics.
- Do not remove wind setting.
- Do not remove Wind Off / Light / Normal / Wild behavior.

Show wind as MPH-equivalent:
- Internal wind value is a game-unit value, not real-world physical MPH.
- Do not rewrite physics.
- Use a display mapping.
- Recommended mapping:
  - 1.0 internal wind unit = 10 mph displayed

Examples:
- wind 0 → Calm
- wind 0.8 → 8 mph →
- wind -1.6 → 16 mph ←
- wind 3.0 → 30 mph →

Implementation guidance:
- Add helper such as `getWindMph(windValue)` and `formatWindDisplay(windValue)`.
- Use same helper everywhere wind text is displayed.
- Wind Off should show Calm or 0 mph.
- Direction must be clear.
- Prefer compact text for mobile.

Verify wind physics:
- Left wind pushes projectiles left.
- Right wind pushes projectiles right.
- Calm wind has no horizontal wind acceleration.
- Trajectory preview reflects wind.
- CPU still fires normally under wind.
- No weapons break because of this change.

Debug support:
- Debug tools should set wind to Calm / 0.
- Debug tools should set wind to light left.
- Debug tools should set wind to light right.
- Debug tools may set stronger left/right values.
- Debug wind changes should update battlefield wind indicator.
- Debug tools should not show wind in the upper HUD.

Acceptance Criteria:
- Wind is not duplicated in the upper HUD.
- Wind appears only in battlefield/background indicator during gameplay.
- Battlefield wind indicator remains readable.
- Wind display uses MPH-style labels.
- Wind Off displays Calm or 0 mph.
- Direction is clear.
- Display text does not imply physically exact real-world simulation.
- Left wind visibly changes projectile path left.
- Right wind visibly changes projectile path right.
- Calm wind has no wind push.
- Trajectory preview reflects wind.
- CPU still fires under wind.
- Mobile HUD is less cluttered.
- Desktop HUD is less cluttered.
- No console errors.

12. Weapon Switch Info Popup Layout Bug

Current issue:
When switching weapons, the weapon info popup/card appears inside or near the center HUD and pushes/overlaps the HUD layout. The popup should not reflow, stretch, or shove HUD elements around. It should behave like a transient overlay/toast, not part of the HUD layout.

Observed behavior:
Switching to a weapon such as Heavy Roller shows the weapon info card over the center HUD, and the HUD content appears pushed upward/around. This makes the turn panel look broken.

Requirement:
Weapon-switch feedback must be rendered as an overlay/toast layer that does not affect HUD layout.

Rules:
- The weapon info popup must not change the size or position of the center HUD panel.
- The weapon info popup must not push Angle / Power / Ammo / Move / Weapon cards around.
- The popup should float above the game UI briefly, then fade out.
- It should not block important gameplay controls.
- It should not cover the fire button or mobile controls.
- It should not cover the battlefield wind indicator if avoidable.
- It should not overlap the selected weapon HUD in a way that makes both unreadable.
- It should remain readable on desktop and mobile.
- It should not appear as a permanent HUD element.
- It should be dismissible by timeout and/or replaced cleanly when cycling weapons quickly.
- Rapid weapon cycling should update/restart one popup, not create stacked popups.
- The popup should use absolute/fixed positioning or a dedicated toast layer outside normal HUD document flow.
- Keep the polished dark card styling, but fix the layout behavior.

Recommended implementation:
- Create a dedicated overlay container such as:
  - `.toast-layer`
  - `.weapon-toast-layer`
  - `.game-overlay-layer`
- Render weapon-switch popup inside that layer.
- Use `position: absolute` or `position: fixed` relative to the game shell.
- Use `pointer-events: none` unless the popup has a deliberate close button.
- Use a high but controlled `z-index`.
- Animate opacity/transform only.
- Do not insert the popup inside the stat-card grid or center turn panel content flow.

Acceptance Criteria:
- Switching weapons no longer pushes the HUD upward or changes HUD layout.
- Angle / Power / Ammo / Move / Weapon cards remain fixed in place.
- Center turn panel size remains stable.
- Only one weapon popup is visible at a time.
- Rapid weapon cycling does not stack multiple popups.
- Popup fades away cleanly.
- Popup remains readable.
- Desktop layout remains stable.
- Mobile layout remains stable.
- No console errors.

13. Preserve Existing v0.7.0 and v0.7.1 Work

Do not break:
- deployed v0.7.0 weapon catalog foundation
- existing new v0.7.0 weapons
- all pre-v0.7.0 weapons
- Standard Shell unlimited ammo
- Heavy Shell heavier arc
- Mega Bomb late-match gating
- Napalm burn ticks
- Parachute behavior
- shop cards
- compact mobile shop
- player HUD
- round summary
- match-end / best-of logic
- Two Player Local movement fix from v0.6.10
- generated audio lifecycle
- Crater Command title/metadata if already changed
- debug/cheat panel if already added
- PWA/home-screen support if already added
- iPhone Safari viewport/shop fixes if already added
- HUD polish if already added
- dropdown contrast fixes if already added
- Splitter/Cluster differentiation if already added
- GitHub Pages compatibility
- main-only deployment

Acceptance Criteria:
- Existing gameplay remains intact.
- v0.7.0 weapons still work.
- No console errors during normal play.
- No stale artifacts are committed.

14. Documentation Updates

Update README.md:
- Current version v0.7.1.
- Use game name `Crater Command`.
- Mention developer debug mode and how to enable it:
  - `?debug=1`
  - `Ctrl + Shift + D`
- Mention debug mode is for local testing weapons, money, ammo, utilities, wind, shield, and match flow.
- Mention HUD polish if README has a UI section.
- Mention Splitter Shell and Cluster Bomb have distinct roles.
- Document Shield cap of 60.
- Document Shield absorbs damage before HP.
- Document improved Shield visual clarity if relevant.
- Explain wind affects projectile trajectory.
- Explain wind is displayed as MPH-equivalent.
- Explain battlefield wind indicator is the source of wind info during gameplay.
- Do not claim MPH value is physically exact.
- Document iPhone Safari browser limitation.
- Document best iPhone experience:
  - Share → Add to Home Screen
  - launch Crater Command from home screen
- Document PWA support.
- Preserve existing v0.7.0 documentation.

Update TESTING.md:
- Current version v0.7.1.
- Use game name `Crater Command`.
- Add GitHub Actions warning check:
  - workflows run without Node 20 deprecation warnings.
- Add debug mode tests:
  - load with `?debug=1`
  - toggle panel with `Ctrl + Shift + D`
  - grant money
  - refill all weapons
  - confirm all v0.7.x weapons included
  - set wind to 0
  - setup weapon test range
  - fire every weapon
- Add HUD tests:
  - HUD remains readable on desktop.
  - HUD remains readable on mobile.
  - selected weapon display uses improved card styling.
  - stat blocks use updated visual language.
  - wind does not appear in upper HUD.
- Add dropdown tests:
  - all dropdowns readable when opened/focused/selected.
- Add Splitter/Cluster tests:
  - Splitter uses controlled fork.
  - Cluster uses wide area scatter.
  - both resolve turns without lockup.
- Add Shield cap tests:
  - buy Shield until it reaches 60.
  - confirm Shield cannot exceed 60.
  - confirm Shield button disables or shows Full/Max at 60.
  - confirm money is not deducted when trying to buy Shield at max.
  - confirm CPU cannot buy Shield past 60.
  - confirm debug refill respects cap unless override is clearly labeled.
  - confirm HUD never displays Shield above 60.
- Add Shield damage absorption tests:
  - hit a shielded tank with Heavy Shell.
  - confirm Shield decreases first.
  - confirm HP does not decrease while Shield remains.
  - confirm overflow damage hits HP only after Shield reaches 0.
  - test Cluster/Splitter/Napalm/Mega if practical.
  - confirm no duplicate death sounds or scoring.
- Add Shield visual tests:
  - give both tanks active shields.
  - verify Shield is clearly visible on Player 1.
  - verify Shield is clearly visible on CPU/blue tank.
  - verify Shield is visible on light/snowy terrain.
  - verify Shield is visible on dark terrain.
  - verify Shield remains visible on mobile.
- Add wind tests:
  - confirm wind does not appear in upper HUD.
  - confirm wind appears in battlefield/background indicator.
  - confirm Calm displays correctly.
  - confirm left/right wind labels use MPH-style display.
  - confirm left wind pushes projectiles left.
  - confirm right wind pushes projectiles right.
  - confirm calm wind does not push projectiles.
  - confirm trajectory preview reflects wind.
  - confirm CPU still fires under wind.
- Add weapon popup tests:
  - switch weapons and confirm HUD layout does not shift.
  - rapidly switch weapons and confirm only one popup appears.
  - confirm popup fades away.
  - confirm popup does not block controls.
- Add iPhone Safari/PWA tests if relevant:
  - iPhone Safari normal browser landscape layout.
  - iPhone Safari shop scroll.
  - PWA manifest path loads on GitHub Pages.
  - PWA icons load.
  - Fullscreen button fails gracefully if unsupported.

Update progress.md:
- Current version v0.7.1.
- Use game name `Crater Command`.
- Add notes under v0.7.1 for:
  - Crater Command title/metadata update
  - GitHub Actions Node 24 compatibility
  - debug/cheat mode
  - HUD visual language polish
  - dropdown contrast fix
  - Splitter/Cluster differentiation
  - PWA/home-screen support
  - iPhone Safari viewport/shop/fullscreen-like improvements
  - Shield hard cap fix
  - Shield damage absorption fix
  - Shield visual clarity upgrade
  - wind HUD cleanup and MPH-equivalent labels
  - weapon-switch popup overlay fix

Update RELEASE_NOTES.md:
- Add or update `v0.7.1 - Pending` at the top.
- Use game name `Crater Command`.
- Under v0.7.1, mention:
  - Crater Command title/metadata update
  - GitHub Actions Node 24 compatibility cleanup
  - developer debug/cheat panel
  - HUD visual language polish
  - dropdown readability fix
  - Splitter Shell vs Cluster Bomb differentiation
  - PWA/home-screen support for Crater Command
  - improved iPhone Safari viewport/fullscreen behavior
  - fixed iPhone Safari shop viewport/scroll/touch handling
  - fixed Shield cap enforcement so Shield cannot exceed 60
  - fixed Shield damage absorption so HP does not decrease until Shield is depleted
  - improved Shield visual clarity and animation
  - improved wind display to use MPH-equivalent labels
  - removed duplicate wind display from the upper HUD
  - fixed weapon-switch info popup so it displays as a non-layout-shifting overlay

Update BALANCE.md:
- Current version v0.7.1.
- Use game name `Crater Command`.
- Explain Splitter Shell vs Cluster Bomb roles clearly.
- Mention debug mode as a balancing/testing aid if appropriate.
- Document Shield max as 60.
- Document Shield absorbs damage before HP.
- Document internal wind units and display mapping:
  - 1 internal wind unit = 10 mph displayed
- Explain this is a gameplay readability mapping, not real-world physics.

Acceptance Criteria:
- Documentation accurately reflects implemented v0.7.1 changes.
- Documentation does not claim untested work was tested.
- RELEASE_NOTES.md starts with v0.7.1.
- TESTING.md remains usable.
- README.md, TESTING.md, progress.md, RELEASE_NOTES.md, and BALANCE.md reference v0.7.1.
- Docs do not claim normal iPhone Safari tab can always be forced into true fullscreen.
- Docs do not claim MPH is physically exact.
- Release notes describe all major v0.7.1 fixes clearly.

15. Output/Test Artifact Cleanup

After tests pass, inspect and clean temporary output/test artifacts.

Potential folders/files:
- output/
- outputs/
- test-results/
- playwright-report/
- coverage/
- screenshots/
- tmp/
- temp/
- .nyc_output/
- debug-output/
- generated screenshots
- Playwright traces
- stale logs

Rules:
- Do not delete source files.
- Do not delete documentation.
- Do not delete intentional assets.
- Do not delete required game assets.
- Add/update .gitignore if useful.
- Do not commit stale temporary files.
- Final response must list any cleanup performed.

Acceptance Criteria:
- No stale test artifacts are committed.
- Required files remain intact.
- `.gitignore` covers common generated clutter.

16. Manual Self-Review

After implementation:
- Confirm current branch is `version/v0.7.1`.
- Confirm main was not modified directly.
- Confirm main menu shows `Crater Command`.
- Confirm main menu shows v0.7.1.
- Confirm `window.GAME_VERSION` returns `"v0.7.1"`.
- Confirm browser title uses `Crater Command`.
- Confirm workflows do not reference deprecated action versions that triggered Node 20 warnings.
- Confirm Pages deploy remains main-only.
- Confirm version branch validation exists/runs.
- Load game with `?debug=1`.
- Toggle debug panel with `Ctrl + Shift + D`.
- Grant money.
- Refill all weapons.
- Confirm all v0.7.x weapons are included.
- Set wind to 0.
- Setup weapon test if implemented.
- Confirm HUD selected weapon/stat blocks use improved styling.
- Confirm dropdowns are readable when opened.
- Fire Splitter Shell and confirm controlled fork behavior.
- Fire Cluster Bomb and confirm wide area scatter behavior.
- Confirm Splitter and Cluster feel different.
- Confirm Shield cannot exceed 60.
- Confirm Shield shop card disables or shows Full/Max at 60.
- Confirm shielded tank HP does not decrease until Shield is depleted.
- Confirm overflow damage works correctly.
- Confirm Shield visuals are clearly visible on both tanks.
- Confirm wind appears only in battlefield indicator.
- Confirm wind uses MPH-equivalent labels.
- Confirm wind still affects trajectory.
- Confirm weapon-switch popup does not shift HUD layout.
- Confirm no turn-resolution lockups.
- Confirm mobile layout remains usable.
- Confirm iPhone Safari layout/shop behavior if practical to test.
- Confirm PWA manifest exists and loads if implemented.
- Confirm generated audio respects mute/page lifecycle.
- Confirm README.md, TESTING.md, progress.md, RELEASE_NOTES.md, and BALANCE.md are updated.
- Clean output/test artifacts.
- Commit changes.
- Push `version/v0.7.1` to GitHub.

Final Response Required:
When complete, provide:
- Current branch name
- Whether `version/v0.7.1` already existed or was created
- Whether branch was pushed to GitHub
- Commit hash
- Git status summary
- Summary of Crater Command rename/title/metadata updates
- Summary of GitHub Actions / CI fixes
- Summary of debug/cheat mode
- Summary of HUD visual language upgrade
- Summary of dropdown contrast fix
- Summary of Splitter vs Cluster differentiation
- Summary of iPhone Safari viewport/shop fixes
- Summary of PWA/home-screen support
- Summary of Shield hard cap fix
- Summary of Shield damage absorption fix
- Summary of Shield visual clarity upgrade
- Summary of wind HUD cleanup and MPH-equivalent labels
- Summary of weapon-switch popup overlay fix
- Summary of documentation updates
- Summary of output/test artifact cleanup
- Files modified
- Files added
- Files/folders removed, if any
- .gitignore changes, if any
- Workflow files changed and what each workflow does
- How to run locally
- How to verify GitHub Pages after merge to main
- What was tested
- What was not tested
- Known limitations
- Suggested PR title
- Suggested PR description
- Suggested git commit message

Suggested git commit message:
Fix v0.7.1 shield behavior, wind display, HUD overlays, PWA support, and UI polish

Suggested PR title:
Fix v0.7.1 shield behavior, wind display, HUD overlays, PWA support, and UI polish

Suggested PR description:
This PR completes the v0.7.1 follow-up improvements on top of the deployed v0.7.0 baseline. It renames the displayed game to Crater Command, updates GitHub Actions for Node 24-compatible action versions, adds gated debug tools, improves HUD styling and dropdown contrast, differentiates Splitter Shell from Cluster Bomb, improves iPhone Safari/PWA support, enforces a Shield cap of 60, fixes Shield-first damage absorption, improves Shield visuals, removes duplicate wind from the upper HUD, adds MPH-equivalent wind labels, and fixes the weapon-switch popup so it no longer shifts the HUD layout.