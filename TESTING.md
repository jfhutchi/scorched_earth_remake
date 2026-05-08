# Manual Testing Checklist

Use a local static server, open the game in a desktop browser, and keep DevTools open to watch for console errors.

## Startup and Menu

- [ ] Page loads without console errors.
- [ ] Main menu shows the title, instructions, controls summary, and sound button.
- [ ] `Two Player Local` starts a two-player match.
- [ ] `Single Player vs CPU` starts a CPU match.
- [ ] `Escape` returns from the game to the main menu.

## Two Player Mode

- [ ] Player 1 starts the first turn.
- [ ] Current player is clearly highlighted in the HUD.
- [ ] `Left Arrow` and `Right Arrow` adjust angle.
- [ ] `Up Arrow` and `Down Arrow` adjust power.
- [ ] Human trajectory preview appears before firing.
- [ ] `Spacebar` fires one projectile and repeated keydown does not fire extra shots.
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
- [ ] CPU can miss and remains beatable.
- [ ] CPU consumes limited ammo when using Heavy Shell or Dirt Bomb.

## Weapons and Ammo

- [ ] HUD shows selected weapon and ammo.
- [ ] `Tab` cycles weapons before firing.
- [ ] `W` cycles weapons before firing.
- [ ] Standard Shell fires and remains unlimited.
- [ ] Heavy Shell fires, deals higher damage, makes a larger crater, and ammo decreases.
- [ ] Dirt Bomb fires, deals low tank damage, makes a large terrain deformation, and ammo decreases.
- [ ] A weapon with 0 ammo cannot be selected or fired.
- [ ] Each player has separate ammo counts.

## Terrain and Tanks

- [ ] Terrain generation creates varied hills.
- [ ] Tanks spawn away from edges.
- [ ] Tanks spawn far enough apart.
- [ ] Tanks spawn on stable, usable ground.
- [ ] Craters remain visible after explosions.
- [ ] Multiple overlapping craters render correctly.
- [ ] Tanks settle onto terrain after explosions.
- [ ] Tanks do not disappear underground or off-screen.

## Damage and Win State

- [ ] Direct tank hits reduce health.
- [ ] Near misses can deal falloff damage.
- [ ] Health is clamped at 0.
- [ ] Destroyed tank shows a wreck.
- [ ] Round ends when one tank is destroyed.
- [ ] Winner overlay shows the winner and current score.
- [ ] Player score increments after a win.
- [ ] Draw state works if both tanks are destroyed.

## Round and Match Controls

- [ ] `N` starts the next round after game over.
- [ ] Next round regenerates terrain.
- [ ] Next round resets health and ammo.
- [ ] Next round keeps match score.
- [ ] `R` restarts the current round.
- [ ] Restart resets health, terrain, and ammo without awarding score.
- [ ] `New Match` resets score, terrain, health, and ammo.
- [ ] `Escape` returns to menu from live play and game-over overlay.

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
- [ ] No normal gameplay console errors appear.
- [ ] No external assets are requested in the Network panel.
- [ ] Reloading the page returns to a clean menu state.
