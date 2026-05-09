# Manual Testing Checklist

Use a local static server, open the game in a desktop or mobile browser, and keep DevTools open to watch for console errors.

For mobile testing, visit the LAN IP from a phone (`http://<your-laptop-ip>:8000`), publish to GitHub Pages, or use browser DevTools device emulation. Real mobile app-switch and phone-lock audio behavior should be verified on an actual device before release when possible.

## Required Pre-Merge Smoke Test

- [ ] Main menu shows `v0.6.8`.
- [ ] Gameplay screen does not show a floating version badge.
- [ ] `window.GAME_VERSION` returns `"v0.6.8"`.
- [ ] Start Single Player vs CPU.
- [ ] Pre-round shop opens.
- [ ] Mega Bomb Ammo shows `$375` and is not affordable in Round 1 under Normal starting money.
- [ ] Start Round begins Round 1.
- [ ] Fire Standard Shell.
- [ ] Fire one premium weapon.
- [ ] Fire Mega Bomb and confirm it is powerful but not a trivial medium-distance one-shot.
- [ ] Move tank left/right and confirm subtle movement sound.
- [ ] Release movement and confirm movement sound stops/fades.
- [ ] Switch to another browser tab and confirm audio stops.
- [ ] On mobile, switch apps/background the browser and confirm audio stops.
- [ ] Return to the game and confirm movement/ambience audio is not stuck or duplicated.
- [ ] Confirm wind appears only once by default and remains visible on the battlefield.
- [ ] Round summary appears.
- [ ] Continue to Shop works.
- [ ] Mobile landscape controls are usable.
- [ ] Desktop keyboard controls still work.
- [ ] No console errors.

## Full Regression Matrix

### Version and Deployment

- [ ] Main menu visibly shows `v0.6.8`.
- [ ] `window.GAME_VERSION` returns `"v0.6.8"` in the browser console.
- [ ] Gameplay screen does not show a floating version badge over the battlefield, HUD, or controls.
- [ ] GitHub Pages deployment shows `v0.6.8` after a hard refresh.
- [ ] No external assets are requested in the Network panel.

### Startup and Modes

- [ ] Page loads without console errors.
- [ ] Main menu shows title, mode buttons, settings, controls summary, version, and sound button.
- [ ] `Two Player Local` starts a two-player match on desktop.
- [ ] `Single Player vs CPU` starts a CPU match on desktop.
- [ ] Phone layout shows a single `Play` button.
- [ ] Phone `Play` starts Single Player vs CPU.
- [ ] Rounds to win setting works for 1, 3, and 5.
- [ ] CPU difficulty setting changes observable CPU behavior.
- [ ] Terrain roughness setting changes terrain shape.
- [ ] Starting money setting changes starting money.
- [ ] Settings persist after reload.
- [ ] `Escape` returns from game to menu cleanly.

### Pre-Round Shop and Economy

- [ ] Starting a new match opens the shop before Round 1.
- [ ] Player can spend starting money before Round 1.
- [ ] Pre-Round Shop title reads `Pre-Round Shop`.
- [ ] Pre-Round Shop primary button reads `Start Round`.
- [ ] `Start Round` begins Round 1.
- [ ] Between-round shop still works.
- [ ] New Match resets economy and opens pre-round shop again.
- [ ] Restart Round does not incorrectly open pre-round shop.
- [ ] CPU auto-shops before Round 1 in Single Player mode.
- [ ] CPU does not double-buy.
- [ ] Pressing `N` from the Pre-Round Shop starts Round 1.
- [ ] Pressing `Esc` from the Pre-Round Shop returns to menu.
- [ ] Money is earned from damage.
- [ ] Money is earned from round win.
- [ ] Money carries into the next round.
- [ ] New match resets economy and inventory.
- [ ] Round summary shows damage dealt, shots fired, direct/near hits, money earned, score, and inventory.

### Shop Ammo and Utilities

- [ ] Shop shows Heavy Shell Ammo, Dirt Bomb Ammo, Roller Shell Ammo, Napalm Canister Ammo, Cluster Bomb Ammo, and Mega Bomb Ammo.
- [ ] Shop does not show Standard Shell Ammo.
- [ ] Standard Shell remains unlimited.
- [ ] Heavy Shell Ammo refills Heavy Shell ammo to max.
- [ ] Dirt Bomb Ammo refills Dirt Bomb ammo to max.
- [ ] Roller Shell Ammo refills Roller Shell ammo to max.
- [ ] Napalm Canister Ammo refills Napalm Canister ammo to max.
- [ ] Cluster Bomb Ammo refills Cluster Bomb ammo to max.
- [ ] Mega Bomb Ammo refills Mega Bomb ammo to max.
- [ ] Full ammo disables each limited weapon ammo button.
- [ ] Full ammo state is obvious and says or indicates `Full`.
- [ ] Player cannot buy full ammo and is not charged for full ammo.
- [ ] Ammo buttons become active after that weapon type is used.
- [ ] CPU does not buy full ammo.
- [ ] Mobile shop clearly shows disabled/full state.
- [ ] Buying Shield Charge immediately updates visible shield indicators.
- [ ] First Aid Kit fully heals to 100 HP at next round start if damaged.
- [ ] First Aid Kit is consumed only when healing happens.
- [ ] Tank at full health does not consume a kit.
- [ ] Parachute reduces fall damage and is consumed.
- [ ] Fall damage remains bounded.
- [ ] Shield reduces explosion damage but does not make a tank invincible.

### Mega Bomb v0.6.8

- [ ] Mega Bomb Ammo costs `$375`.
- [ ] Mega Bomb Ammo is too expensive to buy in Round 1 under Normal starting money.
- [ ] Mega Bomb is generally not affordable before Round 3 under normal money pacing.
- [ ] Mega Bomb becomes purchasable later if enough money is earned.
- [ ] Mega Bomb max ammo remains 1.
- [ ] Mega Bomb Ammo button shows Full when already at max.
- [ ] Mega Bomb has a heavier arc than Standard Shell.
- [ ] Mega Bomb can still threaten normal battlefield distances at high power.
- [ ] Mega Bomb trajectory preview matches the actual shot.
- [ ] Mega Bomb creates the largest crater.
- [ ] Mega Bomb is visually the biggest blast.
- [ ] Mega Bomb sounds largest.
- [ ] Mega Bomb is not a reliable one-hit kill from medium distance against a full-health unshielded tank.
- [ ] Extremely close/direct Mega Bomb hits remain scary.
- [ ] Shield meaningfully reduces Mega Bomb damage.
- [ ] Other weapons remain useful after the Mega Bomb rebalance.
- [ ] CPU does not buy Mega Bomb before it can afford it.
- [ ] CPU does not prioritize Mega Bomb over critical First Aid or Shield needs.
- [ ] CPU does not buy Mega Bomb when ammo is already full.
- [ ] CPU can still use Mega Bomb without always undershooting.

### Weapons

- [ ] Standard Shell fires and remains unlimited.
- [ ] Heavy Shell fires, consumes ammo, creates a larger crater, and does higher damage than Standard Shell.
- [ ] Dirt Bomb fires, consumes ammo, adds terrain, and does low damage.
- [ ] Roller Shell can be bought/refilled, selected, fired, rolled, and resolved.
- [ ] Roller Shell can damage a tank near the roll path.
- [ ] Roller Shell does not roll forever.
- [ ] Napalm Canister can be bought/refilled, selected, fired, and resolved.
- [ ] Napalm creates terrain-hugging flame visuals.
- [ ] Napalm damages tanks in the flame area.
- [ ] Napalm does not create a large crater.
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
- [ ] Round start, round win, and match win sounds play.
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
- [ ] Wind settings still affect projectile behavior.
- [ ] Desktop HUD is less cluttered.
- [ ] Mobile HUD is less cluttered.
- [ ] Center HUD does not overlap player panels.
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

- [ ] `window.GAME_VERSION` returns `"v0.6.8"`.
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
- [ ] `window.testWeaponReach()` reports Mega Bomb as able to threaten typical enemy spawn distance.
- [ ] `window.setupAimTest()` sets wind to 0, places tanks on stable terrain, gives ammo, and selects Mega Bomb.
- [ ] `window.forceRoundWin(0)` opens a Player 1 win summary during a live round.
- [ ] `window.forceRoundWin(1)` opens a Player 2/CPU win summary during a live round.
- [ ] No debug noise is logged during normal gameplay.

### Artifact Cleanup

- [ ] Generated screenshots, traces, reports, coverage, logs, and debug output are not committed.
- [ ] `output/`, `outputs/`, `test-results/`, `playwright-report/`, `coverage/`, `screenshots/`, `tmp/`, `temp/`, `.nyc_output/`, and `debug-output/` are absent or ignored.
- [ ] Useful test evidence is summarized instead of committed.

### Final Regression Pass

- [ ] Main menu loads and shows `v0.6.8`.
- [ ] Phone viewport shows `Play`; desktop shows `Two Player Local` and `Single Player vs CPU`.
- [ ] Pre-round shop opens.
- [ ] Full ammo buttons are disabled.
- [ ] Standard Shell Ammo is absent.
- [ ] All limited ammo buttons are present.
- [ ] Shield purchase updates visible shield indicator.
- [ ] Start Round begins Round 1.
- [ ] Standard Shell fires.
- [ ] Heavy Shell fires.
- [ ] Dirt Bomb fires.
- [ ] Roller Shell fires and resolves.
- [ ] Napalm Canister fires and resolves.
- [ ] Cluster Bomb fires and resolves.
- [ ] Mega Bomb fires and resolves.
- [ ] Mega Bomb preview and actual projectile agree at power 100.
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
