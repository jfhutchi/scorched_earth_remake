# Manual Testing Checklist

Use a local static server, open the game in a desktop browser, and keep DevTools open to watch for console errors.

## Startup and Settings

- [ ] Page loads without console errors.
- [ ] Main menu shows title, mode buttons, settings, controls summary, and sound button.
- [ ] `Two Player Local` starts a two-player match.
- [ ] `Single Player vs CPU` starts a CPU match.
- [ ] Rounds to win setting works for 1, 3, and 5.
- [ ] CPU difficulty setting changes observable CPU behavior.
- [ ] Wind mode changes wind range: Off is 0, Wild is stronger than Normal.
- [ ] Terrain roughness setting changes terrain shape.
- [ ] Starting money setting changes starting money.
- [ ] Settings persist after reload.
- [ ] `Escape` returns from the game to the main menu.

## Input Regression

- [ ] `Left Arrow` adjusts cannon angle and does not move the tank.
- [ ] `Right Arrow` adjusts cannon angle and does not move the tank.
- [ ] `A` moves the active tank left and does not adjust cannon angle.
- [ ] `D` moves the active tank right and does not adjust cannon angle.
- [ ] `Up Arrow` and `Down Arrow` adjust power.
- [ ] Player can move tank, then adjust angle, then fire.
- [ ] Player can adjust angle, then move tank, then fire.
- [ ] Movement fuel decreases only from successful `A`/`D` movement.
- [ ] Angle controls still work after opening a new match with shop/settings changes.
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
- [ ] CPU adjusts angle and power before firing.
- [ ] CPU shot accounts for wind well enough to be plausible.
- [ ] Easy CPU misses often.
- [ ] Normal CPU is competent but beatable.
- [ ] Hard CPU is more accurate than Normal but still misses sometimes.
- [ ] CPU difficulty changes weapon choice.
- [ ] CPU purchases items after a round.
- [ ] CPU does not spam Dirt Bomb as a damage weapon.
- [ ] CPU still works after Dirt Bomb adds terrain.

## Weapons and Ammo

- [ ] HUD shows selected weapon and ammo.
- [ ] Standard Shell fires and remains unlimited.
- [ ] Standard Shell creates a normal crater.
- [ ] Standard Shell deals moderate damage.
- [ ] Heavy Shell fires and ammo decreases.
- [ ] Heavy Shell creates a visibly larger crater than Standard Shell.
- [ ] Heavy Shell does more damage than Standard Shell at a similar impact distance.
- [ ] Dirt Bomb fires and ammo decreases.
- [ ] Dirt Bomb adds terrain instead of removing terrain.
- [ ] Dirt Bomb creates a rounded mound.
- [ ] Dirt Bomb fills part of an existing crater.
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
- [ ] Round summary opens after a round.
- [ ] Round summary shows damage dealt, shots fired, direct/near hits, money earned, score, and inventory.
- [ ] Shop opens after round summary.
- [ ] Buying Heavy Shell ammo decreases money and increases ammo.
- [ ] Buying Dirt Bomb ammo decreases money and increases ammo.
- [ ] Buying Shield decreases money and increases shield charge.
- [ ] Buying Repair Kit decreases money and increases repair kit count.
- [ ] Buying Parachute decreases money and increases parachute count.
- [ ] Cannot buy without enough money.
- [ ] Start Next Round button starts the next round from the shop.
- [ ] `N` continues from summary to shop and from shop to next round.
- [ ] CPU purchases items automatically in Single Player mode.
- [ ] CPU does not spend money it does not have.

## Defensive Utilities

- [ ] Shield is visible around a charged tank.
- [ ] Shield reduces explosion damage.
- [ ] Shield charge decreases when absorbing damage.
- [ ] Shield does not make a tank invincible.
- [ ] Repair kit heals at the start of the next round when damaged.
- [ ] Repair kit is consumed after healing.
- [ ] Fall damage occurs without a parachute after a large terrain drop.
- [ ] Parachute reduces fall damage.
- [ ] Parachute is consumed when used.
- [ ] Fall damage is not excessive during normal crater settling.

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

## Round and Menu Controls

- [ ] `R` restarts the current round during live play.
- [ ] Restart resets the battlefield without awarding score or shop money.
- [ ] `Escape` returns to menu from live play.
- [ ] `Escape` returns to menu from summary.
- [ ] `Escape` returns to menu from shop.
- [ ] No firing from menu, summary, shop, or match-over state.
- [ ] No movement from menu, summary, shop, or match-over state.
- [ ] No angle adjustment from menu, summary, shop, or CPU turn.
- [ ] No duplicate round transitions occur from repeated inputs or clicks.

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
- [ ] Very small windows show a warning or scale reasonably.

## Final Regression Pass

- [ ] Two Player mode remains playable end to end.
- [ ] Single Player vs CPU remains playable end to end.
- [ ] Player can move, adjust angle, and fire in the same turn.
- [ ] Shop purchases affect the next round.
- [ ] CPU can progress through shop and next round.
- [ ] Reloading the page returns to a clean menu state.
- [ ] No normal gameplay console errors appear.
- [ ] No external assets are requested in the Network panel.
