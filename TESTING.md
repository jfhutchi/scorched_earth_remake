# Manual Testing Checklist

Use a local static server, open the game in a desktop or mobile browser, and keep DevTools open to watch for console errors.

For mobile testing, either visit the LAN IP from a phone (`http://<your-laptop-ip>:8000`), publish to GitHub Pages, or use Chrome / Edge / Firefox DevTools device emulation (Toggle Device Toolbar) at the listed phone presets.

## GitHub Pages / Version

- [ ] Main menu visibly shows `v0.6.2`.
- [ ] In-game HUD/footer visibly shows the `v0.6.2` chip.
- [ ] GitHub Pages deployment shows `v0.6.2` after a hard refresh.
- [ ] `window.GAME_VERSION` returns `"v0.6.2"` in the browser console.
- [ ] No external assets are requested in the Network panel.

## v0.6.2 Phone Landscape Hotfix

Test these at phone-emulator viewports (DevTools Device Toolbar) and, where possible, on at least one real phone in landscape.

- [ ] Main menu shows `v0.6.2`.
- [ ] In phone gameplay, `v0.6.2` is visible inside the top-left HUD pill row (no more bottom-left version chip overlapping movement buttons).
- [ ] In desktop gameplay (1280×720+), the bottom-left `v0.6.2` chip is still visible.
- [ ] At 844×390 landscape, the canvas is visibly much larger than v0.6.1 and clearly shows both tanks, terrain, and shot arc.
- [ ] At 932×430 landscape, the canvas uses most of the available width; horizontal dark margins around the canvas only host the touch clusters, not large empty space.
- [ ] In phone landscape, utility buttons (`WPN R N ♪ ≡`) sit in a single small row in the top-right corner — NOT in the middle of the battlefield.
- [ ] In phone landscape, move buttons (`◀ ▶`) sit in the bottom-left corner.
- [ ] In phone landscape, aim/power/fire (`↺ ↻ PWR- PWR+ FIRE`) sit in the bottom-right corner in a compact 2-column stack with FIRE on its own row.
- [ ] Touch buttons in landscape are translucent enough that terrain is visible behind them where they slightly overlap the canvas edges.
- [ ] Touch buttons sized within spec: movement/aim/power approximately 42–58 px, FIRE approximately 58–78 px, utilities approximately 34–46 px.
- [ ] In phone portrait, the rotate overlay appears with the message "Rotate your phone to landscape for the playable layout."
- [ ] `Continue Anyway` dismisses the overlay and lets the user play in portrait with a compact layout.
- [ ] `Back to Menu` returns to the main menu.
- [ ] Rotating from portrait to landscape automatically hides the rotate overlay.
- [ ] In phone landscape, the rotate overlay is NOT shown.
- [ ] On desktop (≥768 px wide and pointer:fine), no rotate overlay appears.
- [ ] FIRE fires exactly one shot per tap.
- [ ] Hold for `↺`, `↻`, `PWR-`, `PWR+`, `◀`, `▶` repeats smoothly.
- [ ] `WPN`, `R`, `N`, `♪`, `≡` each fire once per tap.
- [ ] Touch controls are dimmed during CPU turn, projectile flight, explosion resolving, summary, and shop.
- [ ] No accidental zoom from rapid taps on touch buttons.
- [ ] No horizontal page scrolling at 390×844, 430×932, 844×390, 932×430.
- [ ] Round summary opens correctly on phone, scrolls internally if it overflows, and `New Match` / `Main Menu` buttons remain reachable.
- [ ] Shop opens on phone, items stack vertically, all `Buy` buttons are touch-sized, and `Start Next Round` is always reachable without horizontal scrolling.
- [ ] Desktop layout at 1280×720, 1366×768, and 1920×1080 is unchanged from v0.6.1 (cream HUD cards, bottom-left version chip).
- [ ] All desktop keyboard controls (arrows, `A`/`D`, `Space`, `Tab`/`W`, `R`, `N`, `M`, `Esc`) still work.
- [ ] First Aid Kit fully heals between rounds (regression).
- [ ] Heavy Shell and Dirt Bomb refill purchases still refill to max carried ammo (regression).
- [ ] Dirt Bomb still creates a much larger mound than v0.5 (regression).
- [ ] Each weapon still has a distinct fire and impact sound (regression).
- [ ] Mobile Play still starts Single Player vs CPU (regression).
- [ ] GitHub Pages deployment shows `v0.6.2` after a hard refresh.
- [ ] No uncaught console errors in any of the above flows.

## v0.6.1 Mobile Hotfix

Test these at phone-emulator viewports (DevTools Device Toolbar) and, where possible, on at least one real phone.

- [ ] At a 390 px wide viewport (phone), the menu shows only the single `Play` button.
- [ ] Phone `Play` starts Single Player vs CPU.
- [ ] Desktop (1280 px wide) menu still shows both `Two Player Local` and `Single Player vs CPU`.
- [ ] In phone portrait (390×844), the gameplay screen shows the full-screen `Rotate your phone` overlay with `Continue Anyway` and `Back to Menu` buttons.
- [ ] `Continue Anyway` dismisses the rotate overlay and leaves the compact layout in place; the user can still play in portrait.
- [ ] `Back to Menu` returns to the main menu.
- [ ] In phone landscape (844×390), the rotate overlay does not appear.
- [ ] In phone landscape, the compact mobile HUD chips appear at the top of the screen (turn, P1 HP, P2 HP, wind, weapon, angle, power, ammo).
- [ ] The desktop HUD cards (cream P1/center/P2 panels) are NOT shown during phone gameplay.
- [ ] Tapping the `i` chip toggles an extra HUD row with P1 inventory, P2 inventory, round, and last result.
- [ ] The canvas is the dominant visible area in phone landscape and you can clearly see both tanks.
- [ ] In phone portrait with `Continue Anyway`, the canvas is still visible (smaller strip) and not zero-height.
- [ ] Touch buttons are not oversized; they sit comfortably without covering the tanks.
- [ ] FIRE fires exactly one shot per tap.
- [ ] Hold for `↺`, `↻`, `PWR-`, `PWR+`, `◀`, `▶` repeats smoothly while held and stops on release.
- [ ] No "Landscape is recommended" bubble overlaps the HUD or health pills.
- [ ] No duplicated portrait warning text appears anywhere on screen.
- [ ] On phone Play, the browser attempts fullscreen; if denied, the game still runs and the console has no uncaught fullscreen errors.
- [ ] On phone Play, the orientation-lock attempt is non-fatal whether it succeeds or fails.
- [ ] After fullscreen denial or success, the `≡` (menu) button still works and returns to the main menu.
- [ ] Round summary is reachable on phone (after a tank is destroyed) and scrolls internally if it overflows.
- [ ] Shop is reachable on phone, items stack vertically, and buttons are touch-sized.
- [ ] `Start Next Round` is always reachable on phone (visible without horizontal scrolling).
- [ ] No horizontal page scrolling on any phone viewport.
- [ ] No accidental zoom from rapid taps on the touch buttons.
- [ ] Desktop layout at 1280×720, 1366×768, and 1920×1080 is unchanged from v0.6 and shows the desktop HUD cards.
- [ ] Desktop keyboard controls (arrows, A/D, Space, Tab/W, R, N, M, Esc) all still work.
- [ ] First Aid Kit fully heals between rounds (regression check).
- [ ] Heavy Shell and Dirt Bomb refill purchases still refill to max carried ammo (regression check).
- [ ] Mobile Play still starts Single Player vs CPU (regression check).

## Startup and Settings

- [ ] Page loads without console errors.
- [ ] Main menu shows title, mode buttons, settings, controls summary, version, and sound button.
- [ ] `Two Player Local` starts a two-player match (desktop layout only).
- [ ] `Single Player vs CPU` starts a CPU match (desktop layout only).
- [ ] Phone layout shows a single `Play` button instead of the two desktop buttons.
- [ ] Phone `Play` button starts Single Player vs CPU.
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

## Mobile Menu Behavior

- [ ] At a 390 px wide viewport (phone), only one primary `Play` button is visible.
- [ ] At a 390 px wide viewport, `Two Player Local` is hidden and not focusable via Tab.
- [ ] At a 1280 px wide viewport (desktop), both `Two Player Local` and `Single Player vs CPU` buttons are visible.
- [ ] Resizing the window from desktop down to 390 px swaps the menu to phone mode without reload.
- [ ] Resizing back up to 1280 px restores the desktop menu without reload.
- [ ] On phone-sized layout, CPU difficulty and other match settings are still visible.
- [ ] On phone, tapping `Play` while CPU difficulty is `Hard` actually starts a Hard CPU match.

## Desktop Keyboard Regression

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
- [ ] `M` toggles mute.
- [ ] `R` restarts the current round during live play only.
- [ ] `N` advances summary -> shop -> next round.
- [ ] `Escape` returns to the main menu from any state.
- [ ] Controls are ignored during projectile flight, explosion resolving, CPU turn, summary, shop, menu, and match over.

## Touch Control Regression

Use a real phone or DevTools device emulation.

- [ ] On-screen control pad appears in the game screen on phones, narrow viewports, and any coarse-pointer device.
- [ ] On a desktop browser at 1280×720 with a mouse, the on-screen pad is hidden.
- [ ] Holding `↺` smoothly rotates the cannon left.
- [ ] Holding `↻` smoothly rotates the cannon right.
- [ ] Holding `PWR-` smoothly decreases power.
- [ ] Holding `PWR+` smoothly increases power.
- [ ] Holding `◀` moves the tank left while fuel remains.
- [ ] Holding `▶` moves the tank right while fuel remains.
- [ ] Releasing a hold button stops the corresponding action.
- [ ] `FIRE` fires exactly one shot per tap, even when held down.
- [ ] `WPN` cycles to the next weapon exactly once per tap, even when held.
- [ ] `R` restarts the current round when tapped during live play.
- [ ] `N` advances summary or shop when tapped.
- [ ] `≡` returns to the main menu when tapped.
- [ ] `♪` toggles mute when tapped.
- [ ] Touch and keyboard can be used in the same session without one breaking the other.
- [ ] Touch hold buttons are dimmed and disabled during CPU turn, projectile flight, explosion resolving, summary, and shop.
- [ ] Tapping anywhere on a touch button does not zoom the page.
- [ ] Two-finger pinch does not zoom the page during play.
- [ ] Page does not body-scroll while pressing the canvas or holding a touch button.
- [ ] Switching apps mid-hold and returning does not leave the tank stuck moving.

## Touch Devices and Viewports

Test each viewport / device. Either at the listed pixel resolution in DevTools or, where available, on a real device.

- [ ] iPhone Safari portrait (e.g. 390×844, 430×932).
- [ ] iPhone Safari landscape (e.g. 844×390, 932×430).
- [ ] Android Chrome portrait (e.g. 412×915).
- [ ] Android Chrome landscape (e.g. 915×412).
- [ ] iPad Safari portrait and landscape.
- [ ] Desktop Chrome (1366×768 and 1920×1080).
- [ ] Desktop Edge.
- [ ] Desktop Safari (if available).
- [ ] Notched iPhone in landscape: HUD, version chip, and touch buttons all stay inside the safe area (use the safe-area lines visible in DevTools device frame).

## Two Player Mode

Note: only available from desktop layout (≥ 768 px wide).

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
- [ ] Dirt Bomb creates a clearly larger mound than v0.5 (compare to a previous build or to a standard crater of similar radius).
- [ ] Dirt Bomb fully fills small craters and noticeably fills medium craters.
- [ ] Dirt Bomb visibly piles dirt above the surrounding ground on flat terrain.
- [ ] Dirt Bomb does not bury or strand the firing tank.
- [ ] Dirt Bomb terrain stays clamped (no ridiculous spike piercing the sky).
- [ ] Dirt Bomb uses the brown/green dirt-puff visual, not a bright orange fireball.
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
- [ ] After a Dirt Bomb mound, a tank can settle onto the new mound without clipping.

## Economy and Shop

- [ ] HUD shows money, Heavy Shell ammo, Dirt Bomb ammo, shield charge, First Aid Kits (`FA`), parachutes, current weapon, and movement fuel.
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

### v0.6 Shop Behavior

- [ ] `Refill Heavy Shells` button label includes "to 3" and shows price `$100`.
- [ ] Buying `Refill Heavy Shells` sets Heavy Shell ammo to exactly 3 and deducts `$100`.
- [ ] When Heavy Shell ammo is already 3, the button shows `Heavy Shells Full` and is disabled.
- [ ] Tapping a disabled refill button does not deduct money and plays a subtle blocked sound.
- [ ] `Refill Dirt Bombs` button label includes "to 4" and shows price `$80`.
- [ ] Buying `Refill Dirt Bombs` sets Dirt Bomb ammo to exactly 4 and deducts `$80`.
- [ ] When Dirt Bomb ammo is already 4, the button shows `Dirt Bombs Full` and is disabled.
- [ ] Buying `Shield Charge` costs `$85` and increases shield charge.
- [ ] Buying `First Aid Kit` costs `$110` and increases the FA count by 1.
- [ ] Buying `Parachute` costs `$45` and increases parachute count.
- [ ] Cannot buy without enough money.
- [ ] Repeated shop button clicks do not double-buy invalidly.
- [ ] Disabled shop buttons are visually distinct.
- [ ] Start Next Round button starts the next round from the shop.
- [ ] `N` continues from summary to shop and from shop to next round.
- [ ] CPU purchases items automatically in Single Player mode.
- [ ] CPU does not spend money it does not have.
- [ ] CPU does not buy a refill for a weapon that is already at max ammo.
- [ ] CPU does not buy a First Aid Kit while at 100 HP.
- [ ] CPU does not buy useless items repeatedly.

## Defensive Utilities

- [ ] Shield is visible around a charged tank.
- [ ] Shield flashes or visibly reacts when absorbing damage.
- [ ] Shield reduces explosion damage.
- [ ] Shield charge decreases when absorbing damage.
- [ ] Shield does not make a tank invincible.
- [ ] Shield absorption plays a short shimmer sound.

### v0.6 First Aid Kit

- [ ] Damaged tank with one First Aid Kit starts the next round at exactly 100 HP.
- [ ] One kit is consumed (FA count decreases by 1).
- [ ] Tank at full health does not consume a kit.
- [ ] Round-start message reports the heal and the heal sound plays.
- [ ] FA count is correctly displayed in HUD inventory and the shop summary.

### Parachute

- [ ] Fall damage occurs without a parachute after a large terrain drop.
- [ ] Parachute reduces fall damage.
- [ ] Parachute is consumed when used.
- [ ] Parachute use is reported in the shot result.
- [ ] Parachute use plays a soft cushion sound.
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

- [ ] Standard Shell, Heavy Shell, and Dirt Bomb sound clearly different on fire.
- [ ] Standard Shell, Heavy Shell, and Dirt Bomb sound clearly different on impact.
- [ ] Heavy Shell impact has a deeper rumble than Standard Shell.
- [ ] Dirt Bomb impact sounds like a soil thud, not a fireball.
- [ ] Tank hit sound plays when damage is dealt.
- [ ] Shield absorb shimmer plays when shield blocks damage.
- [ ] First Aid Kit heal tone plays at the start of a round when a kit was used.
- [ ] Parachute cushion sound plays on parachute use.
- [ ] Shop purchase plays a click/chime; blocked purchase plays a subtle blocked sound.
- [ ] `M` toggles mute.
- [ ] Sound button on menu and HUD toggle mute.
- [ ] On-screen `♪` button toggles mute on touch devices.
- [ ] Mute preference persists after reload (close and reopen the tab).
- [ ] No sounds play while muted.

## Responsive Layout

- [ ] 1280×720 layout is readable with no overlapping HUD.
- [ ] 1366×768 layout is readable with no overlapping HUD.
- [ ] 1920×1080 layout is readable and canvas remains centered.
- [ ] 390×844 portrait phone: menu and Play button are readable; game canvas, HUD, and touch controls all fit; no horizontal scrolling.
- [ ] 844×390 landscape phone: HUD and touch controls fit; canvas takes up most of the width; touch buttons stay clear of HUD.
- [ ] 430×932 portrait phone: same checks as 390×844.
- [ ] 932×430 landscape phone: same checks as 844×390.
- [ ] Summary is readable at 1280×720 and on phone widths.
- [ ] Shop is readable at 1280×720 and on phone widths.
- [ ] Very small windows show a warning or scale reasonably.
- [ ] Page does not horizontally scroll on any tested viewport.
- [ ] Page does not body-scroll vertically during gameplay.
- [ ] Notched device safe-area insets are respected for HUD and touch buttons.

## Developer Helpers

Open the local URL with `?debug=1` to expose optional helpers. They do not run automatically.

- [ ] `window.GAME_VERSION` returns `"v0.6.2"`.
- [ ] `window.render_game_to_text()` returns concise current game state.
- [ ] `window.debugGameState()` returns parsed game state (with `?debug=1`).
- [ ] `window.testWeaponImpact("standard")` creates a Standard Shell impact during a live aiming turn.
- [ ] `window.testWeaponImpact("heavy")` creates a Heavy Shell impact during a live aiming turn.
- [ ] `window.testWeaponImpact("dirt")` creates a Dirt Bomb mound during a live aiming turn.
- [ ] `window.forceRoundWin(0)` opens a Player 1 win summary during a live round.
- [ ] `window.forceRoundWin(1)` opens a Player 2/CPU win summary during a live round.
- [ ] No debug noise is logged during normal gameplay.

## Final Regression Pass

- [ ] Main menu loads and shows `v0.6.2`.
- [ ] Phone viewport shows `Play`; desktop shows `Two Player Local` + `Single Player vs CPU`.
- [ ] Settings persist.
- [ ] Two Player starts (desktop only).
- [ ] CPU mode starts (desktop and phone Play).
- [ ] Arrow keys adjust angle only.
- [ ] `A`/`D` moves tank only.
- [ ] Touch hold for aim/power/move works.
- [ ] Touch FIRE fires once per tap.
- [ ] Touch WPN cycles once per tap.
- [ ] Weapon cycling works.
- [ ] Standard Shell crater works.
- [ ] Heavy Shell bigger crater works.
- [ ] Dirt Bomb mound clearly visible and substantially larger than v0.5.
- [ ] Round summary appears.
- [ ] Shop appears.
- [ ] Refill Heavy Shells purchase works and disables when full.
- [ ] Refill Dirt Bombs purchase works and disables when full.
- [ ] First Aid Kit purchase fully heals at the next round.
- [ ] Unaffordable purchase is blocked.
- [ ] Start next round works.
- [ ] New match resets state.
- [ ] CPU shop auto-purchase works and respects new ammo/repair rules.
- [ ] Shield absorbs.
- [ ] Parachute reduces fall damage.
- [ ] Reloading the page returns to a clean menu state.
- [ ] No normal gameplay console errors appear.
