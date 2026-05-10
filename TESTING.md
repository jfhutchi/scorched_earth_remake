# Manual Testing Checklist

Use a local static server, open the game in a desktop or mobile browser, and keep DevTools open to watch for console errors.

For mobile testing, visit the LAN IP from a phone (`http://<your-laptop-ip>:8000`), publish to GitHub Pages, or use browser DevTools device emulation. Real mobile app-switch and phone-lock audio behavior should be verified on an actual device before release when possible.

## Required Pre-Merge Smoke Test

- [ ] Main menu shows `v0.6.9`.
- [ ] Gameplay screen does not show a floating version badge.
- [ ] `window.GAME_VERSION` returns `"v0.6.9"`.
- [ ] Start Single Player vs CPU.
- [ ] Fresh/default starting money is `None ($0)`.
- [ ] Pre-round shop opens with `$0` under default settings.
- [ ] Mega Bomb Ammo shows `$375` and is not affordable in Round 1 under default settings.
- [ ] Shop uses item cards with generated icons, descriptions, ammo/status, price, and action buttons.
- [ ] Standard Shell does not appear as a shop ammo card.
- [ ] Start Round begins Round 1.
- [ ] Cycle weapons and confirm the selected weapon HUD icon/name/ammo are clear.
- [ ] Fire Standard Shell.
- [ ] Fire Heavy Shell and confirm it has a heavier arc than Standard while still reaching useful distances at high power.
- [ ] Fire Napalm and confirm initial flame-area damage plus two small `Burn -1` ticks when a tank is affected.
- [ ] Confirm floating damage, shield, heal, parachute, fall, and burn feedback appear when those events occur.
- [ ] Round summary appears and is readable.
- [ ] Continue to Shop works.
- [ ] Result stingers respect mute and do not duplicate.
- [ ] Mobile landscape controls and compact mobile shop are usable.
- [ ] Desktop keyboard controls still work.
- [ ] No console errors.

## v0.6.9 Focus Checks

### Version and Deployment

- [ ] Main menu visibly shows `v0.6.9`.
- [ ] `window.GAME_VERSION` returns `"v0.6.9"` in the browser console.
- [ ] Gameplay screen does not show a floating version badge over the battlefield, HUD, or controls.
- [ ] GitHub Pages deployment shows `v0.6.9` after a hard refresh.
- [ ] No external image or audio assets are requested in the Network panel.

### Starting Economy

- [ ] Fresh localStorage/default settings select `None ($0)` for Starting Money.
- [ ] Starting money setting can still be changed manually.
- [ ] Settings persist after reload.
- [ ] New Match resets player money to the configured starting money amount.
- [ ] Pre-round shop still opens before Round 1.
- [ ] With default `$0`, shop cards clearly show unaffordable items.
- [ ] `Start Round` remains reachable with `$0`.
- [ ] Player cannot buy Mega Bomb in the pre-round shop under default settings.
- [ ] Mega Bomb is usually not affordable in Round 2 under default settings by simply saving all Round 1 money.
- [ ] Higher starting money presets are respected if intentionally selected.

### Heavy Shell and Mega Bomb

- [ ] Standard Shell remains the easy reliable baseline.
- [ ] Heavy Shell speed/arc is visibly heavier than Standard Shell.
- [ ] Heavy Shell still has useful reach at high power.
- [ ] Heavy Shell trajectory preview matches the actual shot.
- [ ] CPU can use Heavy Shell without always undershooting.
- [ ] Mega Bomb max ammo remains 1.
- [ ] Mega Bomb remains `$375`.
- [ ] Mega Bomb remains heavier than Heavy Shell.
- [ ] Mega Bomb trajectory preview matches the actual shot.
- [ ] Mega Bomb remains powerful but is not a trivial medium-distance one-shot.
- [ ] CPU does not buy Mega Bomb before it can afford it.
- [ ] CPU does not prioritize Mega Bomb over critical First Aid or Shield needs.

### Shop UI and Icons

- [ ] Shop uses polished weapon/item cards instead of plain dense rows.
- [ ] Every purchasable item has an icon, name, short description, status, price, and action.
- [ ] Standard Shell does not appear as a shop ammo purchase.
- [ ] Heavy Shell, Dirt Bomb, Roller Shell, Napalm Canister, Cluster Bomb, and Mega Bomb cards are present.
- [ ] Shield Charge, First Aid Kit, and Parachute cards are present.
- [ ] Weapon/item icons are readable on desktop and mobile.
- [ ] Icons match weapon/item identity and use generated Canvas/procedural drawing only.
- [ ] Full limited ammo cards clearly show `Full`.
- [ ] Too-expensive cards are visibly disabled but readable.
- [ ] Player cannot buy full ammo.
- [ ] Player cannot buy unaffordable items.
- [ ] Money is not deducted for invalid purchases.
- [ ] Shop updates immediately after valid purchases.
- [ ] Existing purchase and invalid-purchase audio feedback still works.
- [ ] CPU shop behavior still works before Round 1 and between rounds.
- [ ] CPU does not double-buy if the shop re-renders.

### Mobile Shop

- [ ] Mobile shop uses compact single-column cards.
- [ ] Mobile cards are not too tall or cluttered.
- [ ] Human player purchase options are easy to scan.
- [ ] CPU purchase details are summarized/collapsed by default on mobile.
- [ ] `Start Round` / `Start Next Round` remains reachable.
- [ ] Mobile shop has no horizontal scrolling.
- [ ] Buttons remain usable finger targets without being oversized.

### Weapon HUD and Help

- [ ] HUD selected weapon display shows icon, name, and ammo.
- [ ] Standard Shell shows unlimited ammo.
- [ ] Limited ammo counts are clear.
- [ ] Weapon-cycle feedback is brief and does not cover controls or trajectory preview.
- [ ] Help / How to Play opens from the main menu.
- [ ] Help explains angle, power, wind, weapons, fire, money, shop, default `$0`, Standard Shell, Heavy Shell, Mega Bomb, Parachute, Napalm burn ticks, and mobile landscape.
- [ ] Help is readable on desktop and mobile.
- [ ] Settings are grouped clearly and mobile menu remains usable.

### Combat Feedback

- [ ] Damage numbers appear when tanks take damage.
- [ ] Shield absorption feedback appears when shield absorbs damage.
- [ ] First Aid/heal feedback appears when a kit triggers at round start.
- [ ] Parachute feedback appears when parachute deploys.
- [ ] Burn tick feedback appears if Napalm burn damage applies.
- [ ] Fall damage feedback appears when fall damage applies.
- [ ] Feedback fades/moves cleanly and cleans itself up.
- [ ] Feedback does not spam or overlap unreadably.
- [ ] No duplicate damage messages appear for one hit.

### Round Summary

- [ ] Round summary shows round winner and match score.
- [ ] Round summary shows damage dealt, shots fired, direct/near hits, burn damage, fall damage, parachutes used, money earned, and current money.
- [ ] Round summary shows ammo remaining, shield remaining, First Aid, parachutes, and HP.
- [ ] CPU purchase summary remains compact.
- [ ] Round summary is readable on desktop.
- [ ] Round summary is readable on mobile.
- [ ] Summary -> Shop -> Next Round flow still works.
- [ ] Match winner flow still works.

### Result Audio

- [ ] Single Player human round win plays a short victory stinger.
- [ ] Single Player human round loss plays a short defeat stinger.
- [ ] Human match win plays match win stinger.
- [ ] Human match loss plays match loss stinger.
- [ ] Two Player Local does not play inappropriate CPU-style defeat audio.
- [ ] Neutral/draw round end uses neutral result audio or no inappropriate win/loss cue.
- [ ] Result music/stingers respect mute.
- [ ] Result music/stingers stop when tab is hidden or app is backgrounded.
- [ ] Returning to the tab/app does not restart or duplicate result music.
- [ ] Result music/stingers do not play more than once per result screen.
- [ ] No external audio files are used.
- [ ] No console errors occur from result audio.

### Parachute and Fall Damage

- [ ] Parachute can trigger during normal gameplay when a tank falls a meaningful distance.
- [ ] Parachute reduces or cancels meaningful fall damage.
- [ ] Parachute is consumed only when it provides meaningful protection.
- [ ] Parachute does not trigger for tiny falls.
- [ ] Parachute does not consume multiple times from one fall.
- [ ] Parachute count decreases when it deploys.
- [ ] Parachute visual, sound, and floating `Parachute!` feedback appear.
- [ ] Fall damage does not become annoying or constant.
- [ ] Tank movement on terrain does not cause random fall damage spam.
- [ ] `window.testParachuteDrop()` works in debug mode.

### Napalm Burn

- [ ] Napalm does initial impact/flame-area damage.
- [ ] Napalm applies two small burn ticks of `-1` to affected living tanks.
- [ ] Napalm burn tick feedback appears.
- [ ] Burn ticks do not reshape terrain.
- [ ] Burn ticks do not stack infinitely.
- [ ] Burn ticks do not continue after round end.
- [ ] Burn ticks do not keep turn resolution locked forever.
- [ ] Burn ticks do not duplicate death sounds.
- [ ] Burn ticks do not duplicate score or money.
- [ ] Napalm remains visually distinct as ground fire.

## Full Regression Matrix

### Startup and Modes

- [ ] Page loads without console errors.
- [ ] Main menu shows title, mode buttons, settings, controls summary, help, version, and sound button.
- [ ] `Two Player Local` starts a two-player match on desktop.
- [ ] `Single Player vs CPU` starts a CPU match on desktop.
- [ ] Phone layout shows a single `Play` button.
- [ ] Phone `Play` starts Single Player vs CPU.
- [ ] Rounds to win setting works for 1, 3, and 5.
- [ ] CPU difficulty setting changes observable CPU behavior.
- [ ] Terrain roughness setting changes terrain shape.
- [ ] Wind setting changes projectile behavior.
- [ ] `Escape` returns from game to menu cleanly.

### Pre-Round Shop and Economy

- [ ] Starting a new match opens the shop before Round 1.
- [ ] Pre-Round Shop title reads `Pre-Round Shop`.
- [ ] Pre-Round Shop primary button reads `Start Round`.
- [ ] `Start Round` begins Round 1.
- [ ] Between-round shop still works.
- [ ] New Match resets economy and opens pre-round shop again.
- [ ] Restart Round does not incorrectly open pre-round shop.
- [ ] CPU auto-shops before Round 1 in Single Player mode.
- [ ] Pressing `N` from the Pre-Round Shop starts Round 1.
- [ ] Pressing `Esc` from the Pre-Round Shop returns to menu.
- [ ] Money is earned from damage.
- [ ] Money is earned from round win.
- [ ] Money carries into the next round.
- [ ] New match resets economy and inventory.

### Shop Ammo and Utilities

- [ ] Heavy Shell Ammo refills Heavy Shell ammo to max.
- [ ] Dirt Bomb Ammo refills Dirt Bomb ammo to max.
- [ ] Roller Shell Ammo refills Roller Shell ammo to max.
- [ ] Napalm Canister Ammo refills Napalm Canister ammo to max.
- [ ] Cluster Bomb Ammo refills Cluster Bomb ammo to max.
- [ ] Mega Bomb Ammo refills Mega Bomb ammo to max.
- [ ] Ammo buttons become active after that weapon type is used.
- [ ] Buying Shield Charge immediately updates visible shield indicators.
- [ ] First Aid Kit fully heals to 100 HP at next round start if damaged.
- [ ] First Aid Kit is consumed only when healing happens.
- [ ] Tank at full health does not consume a kit.
- [ ] Shield reduces explosion damage but does not make a tank invincible.

### Weapons

- [ ] Standard Shell fires and remains unlimited.
- [ ] Heavy Shell fires, consumes ammo, creates a larger crater, and does higher damage than Standard Shell.
- [ ] Dirt Bomb fires, consumes ammo, adds terrain, and does low damage.
- [ ] Roller Shell can be bought/refilled, selected, fired, rolled, and resolved.
- [ ] Roller Shell can damage a tank near the roll path.
- [ ] Roller Shell does not roll forever.
- [ ] Napalm Canister can be bought/refilled, selected, fired, and resolved.
- [ ] Cluster Bomb can be bought/refilled, selected, fired, and resolved.
- [ ] Cluster Bomb splits into several bomblets.
- [ ] Bomblets collide with terrain/tanks.
- [ ] Bomblets create multiple small craters.
- [ ] Cluster Bomb does not crash the game.
- [ ] Weapon cycling works on desktop with the expanded weapon list.
- [ ] Weapon cycling works on mobile with the expanded weapon list.
- [ ] HUD selected weapon display handles longer names.

### Audio and Page Lifecycle

- [ ] Standard Shell, Heavy Shell, Dirt Bomb, Roller Shell, Napalm Canister, Cluster Bomb, and Mega Bomb have distinct fire sounds.
- [ ] Each weapon has a distinct impact/explosion sound.
- [ ] Tank death sounds bigger and more final than a normal weapon impact.
- [ ] Cluster Bomb split and bomblet impacts sound distinct.
- [ ] Shield absorb shimmer plays when shield blocks damage.
- [ ] First Aid Kit heal tone plays when a kit is used.
- [ ] Parachute cushion sound plays on parachute use.
- [ ] Shop purchase plays a click/chime.
- [ ] Invalid purchase plays a subtle blocked sound.
- [ ] Weapon cycle sound plays and remains subtle.
- [ ] Round start, result, and match stingers play.
- [ ] Theme ambience starts during battlefield play.
- [ ] Ambience stops or quiets when muted or returning to menu.
- [ ] Holding `A` or `D` plays subtle tank movement sound.
- [ ] Releasing `A` or `D` stops/fades tank movement sound.
- [ ] Mobile movement buttons play tank movement sound.
- [ ] Movement sound does not play when movement fuel is 0.
- [ ] Movement sound does not play when movement is blocked.
- [ ] Movement sound does not play during CPU turn, projectile flight, resolving, shop, summary, menu, or match over.
- [ ] Movement sound respects mute.
- [ ] `M` toggles mute.
- [ ] Sound buttons toggle mute.
- [ ] Mute persists after reload.
- [ ] No sounds play while muted.
- [ ] Switching tabs stops/suspends game audio.
- [ ] Returning to the tab does not duplicate ambience.
- [ ] Returning to the tab does not leave movement audio stuck.
- [ ] Napalm crackle/fire tails stop when the tab is hidden.
- [ ] On mobile, app switching/backgrounding stops game audio.
- [ ] Returning from mobile app switch does not leave audio stuck.
- [ ] No movement audio node leak occurs.
- [ ] No console errors from audio.
- [ ] Mobile audio works only after user interaction and produces no autoplay errors.

### Wind and HUD

- [ ] Upper player/status HUD does not duplicate wind by default.
- [ ] Battlefield wind indicator remains visible and readable.
- [ ] Wind Off shows calm/0 wind.
- [ ] Wind direction and strength are clear during aiming.
- [ ] Desktop HUD is readable and does not overlap player panels.
- [ ] Mobile HUD is compact and readable.
- [ ] Battlefield is not overly obstructed.
- [ ] Desktop remains readable at 1280x720, 1366x768, and 1920x1080.

### Desktop Keyboard

- [ ] `Left Arrow` adjusts cannon angle and does not move the tank.
- [ ] `Right Arrow` adjusts cannon angle and does not move the tank.
- [ ] `A` moves the active tank left and does not adjust cannon angle.
- [ ] `D` moves the active tank right and does not adjust cannon angle.
- [ ] `Up Arrow` and `Down Arrow` adjust power.
- [ ] `Spacebar` fires one projectile and repeated keydown does not fire extra shots.
- [ ] `Tab` cycles weapons and does not change browser focus.
- [ ] `W` cycles weapons.
- [ ] `M` toggles mute.
- [ ] `R` restarts the current round during live play only.
- [ ] `N` advances summary -> shop -> next round.
- [ ] `Escape` returns to main menu from any state.
- [ ] Controls are ignored during projectile flight, explosion resolving, CPU turn, summary, shop, menu, and match over.

### Touch and Mobile

- [ ] On-screen control pad appears on phones, narrow viewports, and coarse-pointer devices.
- [ ] On a desktop browser at 1280x720 with a mouse, the on-screen pad is hidden.
- [ ] Phone landscape remains playable.
- [ ] Phone portrait still shows rotate guidance or current portrait behavior.
- [ ] Canvas remains large enough in phone landscape.
- [ ] Shop remains usable on phone.
- [ ] Summary remains usable on phone.
- [ ] No gameplay version badge overlaps mobile controls.
- [ ] Touch controls are dimmed during CPU turn, projectile flight, explosion resolving, summary, and shop.
- [ ] No accidental zoom from rapid taps on touch buttons.
- [ ] Page does not body-scroll while pressing canvas or holding a touch button.
- [ ] Switching apps mid-hold and returning does not leave a hold state stuck.
- [ ] Mobile landscape controls are usable at common phone landscape sizes.

### CPU

- [ ] CPU can buy Shield Charge.
- [ ] CPU can buy First Aid Kit.
- [ ] CPU can buy Parachute.
- [ ] CPU can refill every limited weapon when below max.
- [ ] CPU does not buy ammo that is already full.
- [ ] CPU does not spend money it does not have.
- [ ] CPU inventory updates after auto-buy.
- [ ] CPU shop behavior works before Round 1.
- [ ] CPU shop behavior works between rounds.
- [ ] CPU does not double-buy if the shop re-renders.
- [ ] CPU does not select weapons with zero ammo.
- [ ] CPU does not treat Dirt Bomb as a high-damage weapon.
- [ ] CPU can fire all current weapons without freezing.
- [ ] CPU mode can complete round -> summary -> shop -> next round.
- [ ] CPU remains beatable on Easy and Normal.

### Terrain, Damage, and Visuals

- [ ] Terrain generation creates varied hills.
- [ ] Tanks spawn away from edges and far enough apart.
- [ ] Tanks spawn on stable, usable ground.
- [ ] Craters remain visible after explosions.
- [ ] Multiple overlapping craters render correctly.
- [ ] Tanks settle onto terrain after explosions.
- [ ] Tanks do not disappear underground or off-screen.
- [ ] Tank movement follows terrain.
- [ ] Tank cannot climb steep terrain.
- [ ] Tank cannot move through the enemy tank.
- [ ] Direct tank hits reduce health.
- [ ] Near misses can deal falloff damage.
- [ ] Health is clamped at 0.
- [ ] Destroyed tank shows a wreck.
- [ ] Round ends when one tank is destroyed.
- [ ] Player score increments after a win.
- [ ] Match winner appears when the rounds-to-win target is reached.
- [ ] Tanks render with armored body, separate turret, cannon, treads/wheels, highlight, shadow, and team color accents.
- [ ] Tank cannon visually matches the gameplay firing angle.
- [ ] Recoil and muzzle flash occur when firing.
- [ ] Low-health smoke appears on damaged tanks.
- [ ] Destroyed tanks look disabled/wrecked and continue smoking.
- [ ] Terrain has textured fill, surface highlight, embedded stones/details, and darker underside shading.
- [ ] Dirt Bomb mounds are visually highlighted without implying extra damage.
- [ ] Green hills, desert canyon, and snowy mountain themes each render correctly across new rounds.
- [ ] Visuals remain performant on desktop.
- [ ] Visuals remain acceptable on mobile.

### Developer Helpers

Open the local URL with `?debug=1` for optional helpers.

- [ ] `window.GAME_VERSION` returns `"v0.6.9"`.
- [ ] `window.render_game_to_text()` returns concise current game state.
- [ ] `window.debugGameState()` returns parsed game state with `?debug=1`.
- [ ] `window.testWeaponImpact("standard")` creates a Standard Shell impact during a live aiming turn.
- [ ] `window.testWeaponImpact("heavy")` creates a Heavy Shell impact during a live aiming turn.
- [ ] `window.testWeaponImpact("dirt")` creates a Dirt Bomb mound during a live aiming turn.
- [ ] `window.testWeaponImpact("roller")` creates a Roller Shell impact during a live aiming turn.
- [ ] `window.testWeaponImpact("napalm")` creates a Napalm Canister impact during a live aiming turn.
- [ ] `window.testWeaponImpact("cluster")` creates a Cluster Bomb impact during a live aiming turn.
- [ ] `window.testWeaponImpact("mega")` creates a Mega Bomb impact during a live aiming turn.
- [ ] `window.testWeaponReach()` returns approximate reach, price, damage, radius, and speed-scale information for every weapon.
- [ ] `window.testWeaponReach()` reports Heavy Shell as heavier than Standard and Mega Bomb as a late-match heavy-arc weapon.
- [ ] `window.setupAimTest()` sets wind to 0, places tanks on stable terrain, gives ammo, and selects Mega Bomb.
- [ ] `window.testParachuteDrop()` creates a controlled parachute/fall-damage scenario.
- [ ] `window.forceRoundWin(0)` opens a Player 1 win summary during a live round.
- [ ] `window.forceRoundWin(1)` opens a Player 2/CPU win summary during a live round.
- [ ] No debug noise is logged during normal gameplay.

### Artifact Cleanup

- [ ] Generated screenshots, traces, reports, coverage, logs, and debug output are not committed.
- [ ] `output/`, `outputs/`, `test-results/`, `playwright-report/`, `coverage/`, `screenshots/`, `tmp/`, `temp/`, `.nyc_output/`, and `debug-output/` are absent or ignored.
- [ ] Useful test evidence is summarized instead of committed.

### Final Regression Pass

- [ ] Main menu loads and shows `v0.6.9`.
- [ ] Phone viewport shows `Play`; desktop shows `Two Player Local` and `Single Player vs CPU`.
- [ ] Help overlay opens and closes.
- [ ] Pre-round shop opens with `$0`.
- [ ] Full ammo buttons are disabled.
- [ ] Too-expensive buttons are disabled.
- [ ] Standard Shell Ammo is absent.
- [ ] All limited ammo buttons are present.
- [ ] Shield purchase updates visible shield indicator.
- [ ] Start Round begins Round 1.
- [ ] Standard Shell fires.
- [ ] Heavy Shell fires.
- [ ] Dirt Bomb fires.
- [ ] Roller Shell fires and resolves.
- [ ] Napalm Canister fires, applies initial damage, and applies burn ticks.
- [ ] Cluster Bomb fires and resolves.
- [ ] Mega Bomb fires and resolves.
- [ ] Mega Bomb preview and actual projectile agree at power 100.
- [ ] Parachute debug helper can deploy a parachute.
- [ ] Round summary appears.
- [ ] Shop appears after summary.
- [ ] Ammo refill buttons become available after ammo is used.
- [ ] Ammo purchases refill to max.
- [ ] CPU can shop and play after weapon expansion.
- [ ] Desktop HUD inventory labels are readable.
- [ ] Battlefield wind indicator is readable and not duplicated in upper HUD.
- [ ] Mobile landscape controls remain usable.
- [ ] Reloading the page returns to a clean menu state.
- [ ] No normal gameplay console errors appear.
