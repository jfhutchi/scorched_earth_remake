# Manual Testing Checklist

Use a local static server, open the game in a desktop or mobile browser, and keep DevTools open to watch for console errors.

For mobile testing, either visit the LAN IP from a phone (`http://<your-laptop-ip>:8000`), publish to GitHub Pages, or use browser DevTools device emulation.

## v0.6.6 Version

- [ ] Main menu visibly shows `v0.6.6`.
- [ ] Gameplay screen does not show a floating version badge over the battlefield, HUD, or controls.
- [ ] `window.GAME_VERSION` returns `"v0.6.6"` in the browser console.
- [ ] GitHub Pages deployment shows `v0.6.6` after a hard refresh.
- [ ] No external assets are requested in the Network panel.

## v0.6.6 Visual Presentation

- [ ] Tanks render with armored body, separate turret, cannon, treads/wheels, highlight, shadow, and team color accents.
- [ ] Tank cannon visually matches the gameplay firing angle.
- [ ] Tanks align with sloped terrain without flipping or changing collision behavior.
- [ ] Recoil occurs when firing.
- [ ] Muzzle flash appears when firing.
- [ ] Low-health smoke appears on damaged tanks.
- [ ] Destroyed tanks look disabled/wrecked and continue smoking.
- [ ] Terrain has textured fill, surface highlight, embedded stones/details, and darker underside shading.
- [ ] Craters and scorch marks remain visible after explosions.
- [ ] Dirt Bomb mounds are visually highlighted without implying extra damage.
- [ ] Background has layered depth and does not look empty.
- [ ] Green hills, desert canyon, and snowy mountain themes each render correctly across new rounds.
- [ ] Background animation is subtle and does not obscure tanks, terrain, HUD, or touch controls.
- [ ] Projectile shells/canisters/bomblets have readable sprites and motion trails.
- [ ] Screen shake is subtle and does not make the HUD unreadable.
- [ ] Main menu, HUD, shop, summary, buttons, health bars, and shield bars look visually cohesive.

## v0.6.6 Tank Destruction

- [ ] Destroying a tank plays a distinct death explosion sound.
- [ ] Tank death sound plays once for the destroyed tank.
- [ ] Tank death sound respects mute.
- [ ] Two tanks destroyed by one blast do not create an ugly overlapping audio mess.
- [ ] Destroyed tank has a clear larger visual blast and debris flash.
- [ ] Destroyed tank remains visibly disabled or wrecked.
- [ ] Destroyed tank emits dark smoke.
- [ ] Round summary still appears after the destruction effect resolves.

## v0.6.6 Napalm Ground Fire

- [ ] Napalm Canister creates visible ground fire on impact.
- [ ] Napalm fire spreads horizontally along the terrain surface.
- [ ] Napalm fire clings to the ground instead of expanding as a circular explosion.
- [ ] Napalm fire flickers with orange, yellow, and red flame shapes.
- [ ] Napalm fire has light smoke or dark wisps.
- [ ] Napalm fire lingers briefly and fades.
- [ ] Napalm does minimal terrain deformation and does not create a large crater.
- [ ] Napalm damages tanks in the flame area.
- [ ] Napalm impact sound differs from normal explosions.
- [ ] Napalm sound respects mute.

## v0.6.6 Shield and Inventory Clarity

- [ ] Buying `Shield Charge` immediately updates the visible shield indicator.
- [ ] Shield value is shown near HP on desktop as separate blue/cyan protection.
- [ ] Shield value is visible in the mobile HUD or mobile info row.
- [ ] Shield value is visible in the shop inventory display.
- [ ] Shield value is visible in the summary inventory display.
- [ ] Shield value decreases after absorbing damage.
- [ ] The game does not present shield as normal HP.
- [ ] Desktop HUD inventory uses clear labels such as `Heavy`, `Dirt`, `Shield`, `Aid`, and `Chute`.
- [ ] Desktop HUD no longer shows unexplained `Sh`, `FA`, or `P`.
- [ ] Mobile HUD/info panel no longer shows unexplained `Sh`, `FA`, or `P`.
- [ ] HP is not duplicated in the player HUD inventory line.
- [ ] Shop inventory uses `Money:`, `Heavy Shells:`, `Dirt Bombs:`, `Shield:`, `First Aid:`, and `Parachutes:`.
- [ ] Summary inventory uses the same clear terminology.

## v0.6.6 Mobile Controls

- [ ] Mobile angle up button displays `↑`.
- [ ] Mobile angle down button displays `↓`.
- [ ] Holding `↑` increases cannon angle.
- [ ] Holding `↓` decreases cannon angle.
- [ ] `PWR-` and `PWR+` sit beside each other on the same row.
- [ ] Holding `PWR-` decreases power.
- [ ] Holding `PWR+` increases power.
- [ ] FIRE remains prominent and fires exactly once per tap.
- [ ] Move buttons remain usable.
- [ ] Utility buttons remain compact.
- [ ] Touch hold still works for angle, power, and movement.
- [ ] Desktop keyboard controls are unchanged.

## v0.6.6 Shop Ammo

- [ ] Shop shows `Heavy Shell Ammo`.
- [ ] Shop shows `Dirt Bomb Ammo`.
- [ ] Shop shows `Roller Shell Ammo`.
- [ ] Shop shows `Napalm Canister Ammo`.
- [ ] Shop shows `Cluster Bomb Ammo`.
- [ ] Shop shows `Mega Bomb Ammo`.
- [ ] Shop does not show `Standard Shell Ammo`.
- [ ] Standard Shell remains unlimited.
- [ ] Heavy Shell Ammo refills Heavy Shell ammo to max.
- [ ] Dirt Bomb Ammo refills Dirt Bomb ammo to max.
- [ ] Roller Shell Ammo refills Roller Shell ammo to max.
- [ ] Napalm Canister Ammo refills Napalm Canister ammo to max.
- [ ] Cluster Bomb Ammo refills Cluster Bomb ammo to max.
- [ ] Mega Bomb Ammo refills Mega Bomb ammo to max.
- [ ] Full ammo disables/greys out each limited weapon ammo button.
- [ ] Full ammo state is obvious and says or indicates `Full`.
- [ ] Player cannot buy full ammo.
- [ ] Player is not charged for full ammo.
- [ ] Ammo buttons become active after that weapon type is used.
- [ ] CPU does not buy full ammo.
- [ ] Mobile shop clearly shows disabled/full state.

## v0.6.6 Mobile Shop Compacting

- [ ] Mobile shop cards are smaller and cleaner than the desktop shop cards.
- [ ] Human player money, inventory, and purchase buttons are the main focus.
- [ ] Purchase buttons remain touch-friendly without dominating the screen.
- [ ] Start Round / Start Next Round remains reachable on mobile.
- [ ] CPU purchase details are summarized or collapsed on mobile.
- [ ] CPU purchase Details toggle can reveal exact CPU purchases.
- [ ] Desktop shop still shows enough CPU auto-shop detail.
- [ ] CPU does not double-buy when the shop re-renders after human purchases.

## v0.6.6 Weapons

- [ ] Standard Shell fires and remains unlimited.
- [ ] Heavy Shell fires, consumes ammo, creates a larger crater, and does higher damage than Standard Shell.
- [ ] Dirt Bomb fires, consumes ammo, adds terrain, and does low damage.
- [ ] Roller Shell can be bought/refilled in the shop.
- [ ] Roller Shell can be selected and fired.
- [ ] Roller Shell rolls along terrain after impact.
- [ ] Roller Shell explodes after rolling.
- [ ] Roller Shell can damage a tank near the roll path.
- [ ] Roller Shell does not roll forever.
- [ ] Roller Shell does not break terrain collision.
- [ ] Napalm Canister can be bought/refilled in the shop.
- [ ] Napalm Canister can be selected and fired.
- [ ] Napalm creates a terrain-hugging flame visual.
- [ ] Napalm damages tanks in the flame area.
- [ ] Napalm does not create a large crater.
- [ ] Napalm impact sound is distinct.
- [ ] Cluster Bomb can be bought/refilled in the shop.
- [ ] Cluster Bomb can be selected and fired.
- [ ] Cluster Bomb splits into several bomblets.
- [ ] Bomblets collide with terrain/tanks.
- [ ] Bomblets create multiple small craters.
- [ ] Cluster Bomb does not crash the game.
- [ ] CPU can use Cluster Bomb without breaking turn flow.
- [ ] Mega Bomb can be bought/refilled in the shop.
- [ ] Mega Bomb can be selected and fired.
- [ ] Mega Bomb max ammo is 1.
- [ ] Mega Bomb creates the largest crater.
- [ ] Mega Bomb does high damage.
- [ ] Mega Bomb is expensive enough that it cannot be spammed.
- [ ] Weapon cycling works on desktop with the expanded weapon list.
- [ ] Weapon cycling works on mobile with the expanded weapon list.
- [ ] HUD selected weapon display handles longer names.

## v0.6.6 Explosion Visuals

- [ ] Expanding explosion rings are visible.
- [ ] Standard Shell uses a medium expanding blast.
- [ ] Heavy Shell uses a larger expanding blast than Standard Shell.
- [ ] Dirt Bomb uses a brown/green dirt puff and does not look like a fireball.
- [ ] Roller Shell has a small/medium expanding blast after rolling.
- [ ] Napalm Canister looks like ground fire along terrain, not a normal crater explosion.
- [ ] Cluster Bomb shows multiple small expanding mini-blasts.
- [ ] Mega Bomb is visually the biggest blast.
- [ ] Tank death uses a larger tank-centered blast than a normal hit.
- [ ] Destroyed tank smoke remains visible after the blast.
- [ ] Visuals remain performant on desktop.
- [ ] Visuals remain acceptable on mobile.

## v0.6.6 Audio

- [ ] Standard Shell, Heavy Shell, Dirt Bomb, Roller Shell, Napalm Canister, Cluster Bomb, and Mega Bomb have distinct fire sounds.
- [ ] Each weapon has a distinct impact/explosion sound.
- [ ] Heavy Shell sounds heavier than Standard Shell.
- [ ] Mega Bomb sounds largest.
- [ ] Dirt Bomb sounds like dirt/soil, not a fireball.
- [ ] Napalm sounds like flame/air burst.
- [ ] Tank death sounds bigger and more final than a normal weapon impact.
- [ ] Cluster Bomb split and bomblet impacts sound distinct.
- [ ] Shield absorb shimmer plays when shield blocks damage.
- [ ] First Aid Kit heal tone plays when a kit is used.
- [ ] Parachute cushion sound plays on parachute use.
- [ ] Shop purchase plays a click/chime.
- [ ] Invalid purchase plays a subtle blocked sound.
- [ ] `M` toggles mute.
- [ ] Sound buttons toggle mute.
- [ ] No sounds play while muted.
- [ ] No console errors from audio.

## v0.6.6 CPU Shop and Weapon Use

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
- [ ] CPU does not spam Mega Bomb without money/ammo.
- [ ] CPU can fire new weapons without freezing.
- [ ] CPU mode can complete round -> summary -> shop -> next round with expanded weapons.
- [ ] CPU remains beatable on Easy and Normal.

## Pre-Round Shop Regression

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

## Desktop HUD Regression

- [ ] Center HUD takes less vertical space than the previous pass.
- [ ] Turn, status, round, mode, angle, power, wind, weapon, ammo, move, and result remain visible.
- [ ] Wind text does not truncate awkwardly.
- [ ] Center HUD does not overlap player panels.
- [ ] Battlefield is less obstructed.
- [ ] Desktop remains readable at 1280x720, 1366x768, and 1920x1080.

## Startup and Settings Regression

- [ ] Page loads without console errors.
- [ ] Main menu shows title, mode buttons, settings, controls summary, version, and sound button.
- [ ] `Two Player Local` starts a two-player match on desktop.
- [ ] `Single Player vs CPU` starts a CPU match on desktop.
- [ ] Phone layout shows a single `Play` button.
- [ ] Phone `Play` starts Single Player vs CPU.
- [ ] Rounds to win setting works for 1, 3, and 5.
- [ ] CPU difficulty setting changes observable CPU behavior.
- [ ] Wind Off produces 0 wind.
- [ ] Terrain roughness setting changes terrain shape.
- [ ] Starting money setting changes starting money.
- [ ] Settings persist after reload.
- [ ] `Escape` returns from game to menu cleanly.

## Desktop Keyboard Regression

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

## Touch and Mobile Regression

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

## Economy and Utilities Regression

- [ ] Money is earned from damage.
- [ ] Money is earned from round win.
- [ ] Money carries into the next round.
- [ ] New match resets economy and inventory.
- [ ] Round summary shows damage dealt, shots fired, direct/near hits, money earned, score, and inventory.
- [ ] First Aid Kit fully heals to 100 HP at next round start if damaged.
- [ ] First Aid Kit is consumed only when healing happens.
- [ ] Tank at full health does not consume a kit.
- [ ] Parachute reduces fall damage and is consumed.
- [ ] Fall damage remains bounded.
- [ ] Shield reduces explosion damage but does not make a tank invincible.

## Terrain and Damage Regression

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

## Developer Helpers

Open the local URL with `?debug=1` for optional helpers.

- [ ] `window.GAME_VERSION` returns `"v0.6.6"`.
- [ ] `window.render_game_to_text()` returns concise current game state.
- [ ] `window.debugGameState()` returns parsed game state with `?debug=1`.
- [ ] `window.testWeaponImpact("standard")` creates a Standard Shell impact during a live aiming turn.
- [ ] `window.testWeaponImpact("heavy")` creates a Heavy Shell impact during a live aiming turn.
- [ ] `window.testWeaponImpact("dirt")` creates a Dirt Bomb mound during a live aiming turn.
- [ ] `window.testWeaponImpact("roller")` creates a Roller Shell impact during a live aiming turn.
- [ ] `window.testWeaponImpact("napalm")` creates a Napalm Canister impact during a live aiming turn.
- [ ] `window.testWeaponImpact("cluster")` creates a Cluster Bomb impact during a live aiming turn.
- [ ] `window.testWeaponImpact("mega")` creates a Mega Bomb impact during a live aiming turn.
- [ ] `window.forceRoundWin(0)` opens a Player 1 win summary during a live round.
- [ ] `window.forceRoundWin(1)` opens a Player 2/CPU win summary during a live round.
- [ ] No debug noise is logged during normal gameplay.

## Final Regression Pass

- [ ] Main menu loads and shows `v0.6.6`.
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
- [ ] Round summary appears.
- [ ] Shop appears after summary.
- [ ] Ammo refill buttons become available after ammo is used.
- [ ] Ammo purchases refill to max.
- [ ] CPU can shop and play after weapon expansion.
- [ ] Desktop HUD inventory labels are readable.
- [ ] Center HUD is compact and wind is readable.
- [ ] Mobile PWR buttons are on the same row.
- [ ] Mobile angle arrows work.
- [ ] Reloading the page returns to a clean menu state.
- [ ] No normal gameplay console errors appear.
