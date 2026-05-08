# Manual Testing Checklist

Use a local static server, open the game in a desktop browser, and keep DevTools open to watch for console errors.

## GitHub Pages / Version

- [ ] Main menu visibly shows `v0.5.0`.
- [ ] In-game HUD/footer visibly shows `v0.5.0`.
- [ ] GitHub Pages deployment shows `v0.5.0` after a hard refresh.
- [ ] No external assets are requested in the Network panel.

## Startup and Settings

- [ ] Page loads without console errors.
- [ ] Main menu shows title, mode buttons, settings, controls summary, version, and sound button.
- [ ] `Two Player Local` starts a two-player match.
- [ ] `Single Player vs CPU` starts a CPU match.
- [ ] Rounds to win setting works for 1, 3, and 5.
- [ ] CPU difficulty setting changes observable CPU behavior.
- [ ] Wind Off produces 0 wind.
- [ ] Light wind is subtle.
- [ ] Normal wind is playable.
- [ ] Wild wind is visibly disruptive but not broken.
- [ ] Terrain roughness setting changes terrain shape.
- [ ] Starting money setting changes starting money.
- [ ] Settings persist after reload.
- [ ] `Escape` returns from the game to the main menu cleanly.

## Input Regression

- [ ] `Left Arrow` adjusts cannon angle and does not move the tank.
- [ ] `Right Arrow` adjusts cannon angle and does not move the tank.
- [ ] `A` moves the active tank left and does not adjust cannon angle.
- [ ] `D` moves the active tank right and does not adjust cannon angle.
- [ ] `Up Arrow` and `Down Arrow` adjust power.
- [ ] Player can move tank, then adjust angle, then fire.
- [ ] Player can adjust angle, then move tank, then fire.
- [ ] Movement fuel decreases only from successful `A`/`D` movement.
- [ ] `Spacebar` fires one projectile and repeated keydown does not fire extra shots.
- [ ] `Tab` cycles weapons and does not change browser focus.
- [ ] `W` cycles weapons.
- [ ] Controls are ignored during projectile flight, explosion resolving, CPU turn, summary, shop, menu, and match over.

## Two Player Mode

- [ ] Player 1 starts the first turn.
- [ ] Current player is clearly highlighted in the HUD.
- [ ] Human trajectory preview appears before firing.
- [ ] Arc preview is visible against the sky.
- [ ] Arc preview updates after tank movement.
- [ ] Arc preview updates after weapon change.
- [ ] Controls are locked while projectile is flying.
- [ ] Controls are locked while explosion animation resolves.
- [ ] Turn changes after impact delay.
- [ ] Result message reports direct hit, near miss, or missed with damage when applicable.

## Single Player vs CPU

- [ ] Player 1 is human and Player 2 is named CPU.
- [ ] CPU does not act during Player 1 turn.
- [ ] CPU waits briefly before firing.
- [ ] CPU selects an available weapon.
- [ ] CPU does not select weapons with zero ammo.
- [ ] Easy CPU misses often.
- [ ] Normal CPU is competent but beatable.
- [ ] Hard CPU is more accurate than Normal but still misses sometimes.
- [ ] CPU difficulty changes weapon choice.
- [ ] CPU shop purchases differ by difficulty.
- [ ] CPU does not spam Dirt Bomb as a damage weapon.
- [ ] CPU does not fire during summary or shop.
- [ ] CPU mode can complete round -> summary -> shop -> next round without locking.

## Weapons and Ammo

- [ ] HUD shows selected weapon and ammo.
- [ ] Standard Shell fires and remains unlimited.
- [ ] Standard Shell creates a normal crater.
- [ ] Standard Shell uses a compact blast visual.
- [ ] Standard Shell deals moderate damage.
- [ ] Heavy Shell fires and ammo decreases.
- [ ] Heavy Shell projectile is slower than Standard Shell.
- [ ] Heavy Shell creates a visibly larger and deeper crater than Standard Shell.
- [ ] Heavy Shell uses a larger, more forceful blast visual than Standard Shell.
- [ ] Heavy Shell does more damage than Standard Shell at a similar impact distance.
- [ ] Dirt Bomb fires and ammo decreases.
- [ ] Dirt Bomb adds terrain instead of removing terrain.
- [ ] Dirt Bomb creates a rounded mound.
- [ ] Dirt Bomb fills part of an existing crater.
- [ ] Dirt Bomb uses a brown/green dirt-puff visual, not a bright orange fireball.
- [ ] Dirt Bomb does low damage unless it lands very close to a tank.
- [ ] A weapon with 0 ammo cannot be selected or fired.
- [ ] Each player has separate ammo counts.

## Movement and Terrain

- [ ] Terrain generation creates varied hills.
- [ ] Tanks spawn away from edges.
- [ ] Tanks spawn far enough apart.
- [ ] Tanks spawn on stable, usable ground.
- [ ] Craters remain visible after explosions.
- [ ] Multiple overlapping craters render correctly.
- [ ] Tanks settle onto terrain after explosions.
- [ ] Tanks do not disappear underground or off-screen.
- [ ] Tank movement follows the terrain surface.
- [ ] Tank cannot climb steep terrain.
- [ ] Tank cannot move out of bounds.
- [ ] Tank cannot move through the enemy tank.

## Economy and Shop

- [ ] HUD shows money, Heavy Shell ammo, Dirt Bomb ammo, shield charge, repair kits, parachutes, current weapon, and movement fuel.
- [ ] Money is earned from damage.
- [ ] Money is earned from round win.
- [ ] Money carries into the next round.
- [ ] New match resets economy and inventory.
- [ ] Winner can buy a meaningful item after a normal round.
- [ ] Loser can usually buy at least a small useful item after a normal round.
- [ ] Shop prices are not so low that every item can be spammed.
- [ ] Round summary opens after a round.
- [ ] Round summary shows damage dealt, shots fired, direct/near hits, money earned, score, and inventory.
- [ ] Shop opens after round summary.
- [ ] Buying Heavy Shell ammo costs `$50` and increases ammo.
- [ ] Buying Dirt Bomb ammo costs `$30` and increases ammo.
- [ ] Buying Shield costs `$85` and increases shield charge.
- [ ] Buying Repair Kit costs `$65` and increases repair kit count.
- [ ] Buying Parachute costs `$45` and increases parachute count.
- [ ] Cannot buy without enough money.
- [ ] Repeated shop button clicks do not double-buy invalidly.
- [ ] Disabled shop buttons are visually distinct.
- [ ] Start Next Round button starts the next round from the shop.
- [ ] `N` continues from summary to shop and from shop to next round.
- [ ] CPU purchases items automatically in Single Player mode.
- [ ] CPU does not spend money it does not have.
- [ ] CPU does not buy useless items repeatedly.

## Defensive Utilities

- [ ] Shield is visible around a charged tank.
- [ ] Shield flashes or visibly reacts when absorbing damage.
- [ ] Shield reduces explosion damage.
- [ ] Shield charge decreases when absorbing damage.
- [ ] Shield does not make a tank invincible.
- [ ] Repair kit heals at the start of the next round when damaged.
- [ ] Repair kit does not exceed max health.
- [ ] Repair kit is consumed after healing.
- [ ] Repair use is visible in the round-start message, HUD, or shop inventory.
- [ ] Fall damage occurs without a parachute after a large terrain drop.
- [ ] Parachute reduces fall damage.
- [ ] Parachute is consumed when used.
- [ ] Parachute use is reported in the shot result.
- [ ] Fall damage is not excessive during normal crater settling.

## State Flow

- [ ] No firing from menu.
- [ ] No firing from summary.
- [ ] No firing from shop.
- [ ] No movement from menu.
- [ ] No movement from summary.
- [ ] No movement from shop.
- [ ] No angle adjustment from menu.
- [ ] No angle adjustment from shop.
- [ ] No duplicate summary screens.
- [ ] No duplicate shop screens.
- [ ] No CPU shop buying more than once per round.
- [ ] No next-round transition while projectile or explosion is resolving.
- [ ] Starting a new match clears overlays and stale state.
- [ ] Two Player mode can complete round -> summary -> shop -> next round without locking.

## Damage and Win State

- [ ] Direct tank hits reduce health.
- [ ] Near misses can deal falloff damage.
- [ ] Health is clamped at 0.
- [ ] Destroyed tank shows a wreck.
- [ ] Round ends when one tank is destroyed.
- [ ] Player score increments after a win.
- [ ] Draw state works if both tanks are destroyed.
- [ ] Match winner appears when the selected rounds-to-win target is reached.
- [ ] New Match resets score, economy, terrain, health, ammo, and utilities.

## Audio

- [ ] Fire sound plays after firing.
- [ ] Explosion sound plays on impact.
- [ ] Tank hit sound plays when damage is dealt.
- [ ] Menu click or turn-change sound plays.
- [ ] `M` toggles mute.
- [ ] Sound button toggles mute.
- [ ] Mute preference persists after reload.

## Responsive Layout

- [ ] 1280x720 layout is readable with no overlapping HUD.
- [ ] 1366x768 layout is readable with no overlapping HUD.
- [ ] 1920x1080 layout is readable and canvas remains centered.
- [ ] Summary is readable at 1280x720.
- [ ] Shop is readable at 1280x720.
- [ ] Very small windows show a warning or scale reasonably.

## Developer Helpers

Open the local URL with `?debug=1` to expose optional helpers. They do not run automatically.

- [ ] `window.render_game_to_text()` returns concise current game state.
- [ ] `window.debugGameState()` returns parsed game state.
- [ ] `window.testWeaponImpact("standard")` creates a Standard Shell impact during a live aiming turn.
- [ ] `window.testWeaponImpact("heavy")` creates a Heavy Shell impact during a live aiming turn.
- [ ] `window.testWeaponImpact("dirt")` creates a Dirt Bomb mound during a live aiming turn.
- [ ] `window.forceRoundWin(0)` opens a Player 1 win summary during a live round.
- [ ] `window.forceRoundWin(1)` opens a Player 2/CPU win summary during a live round.

## Final Regression Pass

- [ ] Main menu loads.
- [ ] Settings persist.
- [ ] Two Player starts.
- [ ] CPU mode starts.
- [ ] Arrow keys adjust angle only.
- [ ] `A`/`D` moves tank only.
- [ ] Weapon cycling works.
- [ ] Standard Shell crater works.
- [ ] Heavy Shell bigger crater works.
- [ ] Dirt Bomb mound works.
- [ ] Round summary appears.
- [ ] Shop appears.
- [ ] Purchase works.
- [ ] Unaffordable purchase is blocked.
- [ ] Start next round works.
- [ ] New match resets state.
- [ ] CPU shop auto-purchase works.
- [ ] Shield absorbs.
- [ ] Repair heals.
- [ ] Parachute reduces fall damage.
- [ ] Reloading the page returns to a clean menu state.
- [ ] No normal gameplay console errors appear.
