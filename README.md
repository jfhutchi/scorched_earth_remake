# Tank Artillery Duel

Current version: `v0.6.2`

Tank Artillery Duel is a local browser-based 2D artillery game inspired by classic tank duel games. Two tanks fight across destructible hilly terrain with wind, turn-based aiming, movement fuel, distinct weapons, generated sound effects, match scoring, money, a between-round shop, and an optional CPU opponent. v0.6 added mobile-browser support and on-screen touch controls. v0.6.1 introduced a compact mobile HUD and rotate overlay. **v0.6.2 makes phone landscape the primary mobile gameplay mode**: the canvas now fills nearly the entire viewport, touch clusters live in corner thumb zones (left margin, right margin, top-right utilities) instead of a wide bottom strip, and the version chip moved into the HUD pill row so it never overlaps movement controls.

The project is pure HTML, CSS, vanilla JavaScript, HTML5 Canvas, and the Web Audio API. It has no backend, no build step, no paid services, and no remote assets.

## GitHub Pages Note

The live game displays `v0.6.2` on the main menu and in the in-game HUD. After a GitHub Pages deployment, hard refresh the page if the old version still appears:

- Windows/Linux: `Ctrl` + `F5`
- macOS: `Cmd` + `Shift` + `R`
- iOS Safari: tap the address bar, hold the reload icon, then tap `Request Website Without Cache` if available, or close and reopen the tab.
- Android Chrome: tap menu, then `Reload`.

This helps bypass cached JavaScript and CSS.

## Browser Support

The game targets modern browsers from roughly 2022 onward:

- Desktop: Chrome, Edge, Firefox, Safari.
- Mobile: iPhone Safari and Chrome, Android Chrome and Firefox.
- Tablets: iPad Safari, Android Chrome.

## How to Run Locally

Because the game uses ES modules, use a local static server instead of opening `index.html` directly in Chrome or Edge.

### Python

```bash
cd path/to/scorched_earth_remake
python -m http.server 8000
```

Open `http://localhost:8000`.

### Node

```bash
cd path/to/scorched_earth_remake
npx --yes serve .
```

Open the local URL printed by the command. To test mobile from a phone on the same Wi-Fi, use your machine's LAN IP (for example `http://192.168.1.10:8000`).

## Current Features

- Two Player Local and Single Player vs CPU modes.
- Single-button **Play** entry on phone-sized screens that starts Single Player vs CPU.
- On-screen touch controls for mobile and tablet browsers, with full keyboard controls preserved on desktop.
- Destructible heightmap terrain with craters and Dirt Bomb mounds.
- Projectile physics with gravity and wind.
- Angle, power, weapon selection, and pre-shot tank movement.
- Standard Shell, Heavy Shell, and a buffed Dirt Bomb that builds substantially larger mounds.
- Match settings for rounds to win, CPU difficulty, wind, starting money, and terrain roughness.
- Economy, round summaries, between-round shop, score tracking, and inventory HUD.
- Defensive utilities: shield, **First Aid Kit** (full heal between rounds), and parachute.
- Distinct generated Web Audio fire and impact sounds per weapon, plus shield, heal, parachute, and shop click sounds.
- Persistent mute toggle (keyboard `M` or the on-screen ♪ button).
- Optional debug helpers for local testing.

## Mobile Browser Support

v0.6 made the game playable in a phone or tablet browser without a physical keyboard. v0.6.1 introduced the compact mobile HUD and rotate overlay. **v0.6.2 makes phone landscape the primary mobile gameplay mode** and fixes the cramped layout reported on real Android phones.

### Phone menu

Phones (viewports under 768 pixels wide) show a single primary `Play` button that starts Single Player vs CPU. Two Player Local is hidden because shared-keyboard play does not make sense on a single small touchscreen. CPU difficulty and the rest of the match settings remain visible. On desktop and large tablets, both `Two Player Local` and `Single Player vs CPU` buttons are still shown.

If you resize a desktop browser window down to phone width, the menu automatically swaps to the single Play button. Resizing back up restores the full menu.

### Phone landscape gameplay (v0.6.2)

Phone landscape is the intended mobile gameplay mode:

- The canvas/battlefield occupies nearly the full viewport (only ~6 px reserved at the edges).
- The compact pill HUD lives at the top-left as a slim translucent strip (turn, P1 HP, P2 HP, wind, weapon, angle, power, ammo, version).
- Utility buttons (`WPN R N ♪ ≡`) form a single small row in the top-right corner — they no longer sit in the middle of the play area.
- Move buttons (`◀ ▶`) sit in the bottom-left corner.
- Aim/Power/Fire (`↺ ↻ PWR- PWR+ FIRE`) form a compact 2-column stack in the bottom-right corner.
- All buttons are translucent so terrain remains visible behind the side margins.
- Touch buttons follow the v0.6.2 sizing spec: movement/aim/power use `clamp(42px, 8dvh, 58px)`, FIRE uses `clamp(58px, 11dvh, 78px)`, utilities use `clamp(34px, 6dvh, 46px)`.
- The version chip is now a HUD pill (`v0.6.2`) — the old bottom-left chip that overlapped the move buttons is hidden during phone gameplay.

### Phone portrait: rotate overlay

In phone portrait on the gameplay screen, a clean full-screen rotate overlay reads:

> **Rotate your phone to landscape for the playable layout.**

Two buttons:

- `Continue Anyway` keeps the compact layout in portrait.
- `Back to Menu` returns to the main menu.

In landscape the overlay is hidden automatically and the optimized layout is used.

### Fullscreen and orientation lock

Tapping `Play` on a phone makes a best-effort `requestFullscreen()` call on the document so the browser chrome retracts. It also attempts `screen.orientation.lock('landscape')`. Both calls are wrapped in `try/catch` so failure is silent. The layout is designed to be playable even when fullscreen is denied and the browser chrome stays visible.

### On-screen controls

The mobile control pad is shown on coarse-pointer (touch) devices and on viewports under 900 pixels wide. It is automatically hidden when the device has only a fine pointer (mouse) and the viewport is large enough for a desktop layout.

| Control | Action |
| --- | --- |
| `◀` `▶` (left side) | Move active tank left/right while held |
| `↺` `↻` (right side) | Adjust cannon angle while held |
| `PWR-` / `PWR+` | Decrease/increase shot power while held |
| `FIRE` | Fire one shot per tap |
| `WPN` | Cycle weapons one tap at a time |
| `R` | Restart the current round |
| `N` | Continue from summary, or start the next round from the shop |
| `≡` | Return to the main menu |
| `♪` | Toggle mute |

Hold-to-repeat works for aim, power, and movement just like keyboard arrow keys. Fire and weapon-cycle each fire only once per tap. Touch controls are dimmed when the human player cannot act (CPU turn, projectile in flight, explosion resolving, summary, or shop).

### Mobile orientation

Both portrait and landscape are playable. Landscape is recommended on small phones because the canvas can use more horizontal pixels. In portrait, the rotate overlay appears first; once dismissed, the compact layout still gives a usable canvas plus controls.

## Match Settings

Settings are saved in `localStorage` and reused for the next match:

- `Rounds to Win`: 1, 3, or 5.
- `CPU Difficulty`: Easy, Normal, or Hard.
- `Wind`: Off, Light, Normal, or Wild.
- `Starting Money`: Low `$100`, Normal `$150`, or High `$250`.
- `Terrain`: Smooth, Normal, or Rough.

Starting a new match resets score, money, inventory, terrain, and tank health using these settings. Active match state does not persist across reloads.

## Desktop Controls

Keyboard controls are preserved exactly as they were in v0.5:

| Key | Action |
| --- | --- |
| `Left Arrow` / `Right Arrow` | Adjust cannon angle only |
| `Up Arrow` / `Down Arrow` | Adjust shot power |
| `A` / `D` | Move the active tank before firing only |
| `Spacebar` | Fire |
| `Tab` or `W` | Cycle available weapons |
| `M` | Mute or unmute sound |
| `R` | Restart current round during live play |
| `N` | Continue from summary to shop, or start next round from shop |
| `Escape` | Return to main menu |

Controls are locked while a projectile is flying, an explosion is resolving, the CPU is thinking, the summary is open, the shop is open, or the match is over. Touch controls are also locked under those same conditions.

## Weapons

| Weapon | Ammo | Projectile | Terrain Effect | Damage |
| --- | --- | --- | --- | --- |
| `Standard Shell` | Unlimited | Normal speed | Medium crater, radius 42 | Medium, max 38 |
| `Heavy Shell` | Limited, max carried 3 | Slower and larger | Larger, deeper crater, radius 66 | High, max 70 |
| `Dirt Bomb` | Limited, max carried 4 | Slightly slower | Builds a much bigger mound, radius 88 | Low, max 10 |

The v0.6 Dirt Bomb is meaningfully stronger as a terrain-builder. Its mound radius is wider, its mound is much taller, and post-impact terrain smoothing is reduced so the pile actually sticks. The mound visibly fills craters and creates usable cover, while damage to tanks remains low.

Each weapon has a distinct firing voice and a distinct impact voice generated through the Web Audio API:

- Standard Shell: medium pop on fire, normal explosion on impact.
- Heavy Shell: deeper, louder cannon boom on fire, larger boom with low rumble on impact.
- Dirt Bomb: softer airy puff on fire, dirt thud / soil burst (no fireball) on impact.

Shield absorption, First Aid Kit use, parachute use, shop purchases, and blocked purchases each have their own short sound.

## Movement

During a human aiming phase, press `A` or `D` (or hold the on-screen `◀` / `▶`) to drive the active tank left or right. Movement follows the terrain surface, consumes fuel by distance moved, and is blocked by steep slopes, battlefield edges, or the other tank. Fuel resets at the start of each turn.

`Left Arrow` and `Right Arrow` are reserved for cannon angle adjustment and never move the tank.

## Economy and Shop

Players keep money and inventory across rounds in a match. A new match resets both.

Money earned after each round:

- `$1` per 2 damage dealt.
- `$50` base allowance.
- `$75` round win bonus.
- `$25` survival bonus.

### Shop prices and behavior (v0.6)

| Item | Price | Effect |
| --- | --- | --- |
| `Refill Heavy Shells` | `$100` | Refills Heavy Shell ammo to its max carried 3. Disabled when full. |
| `Refill Dirt Bombs` | `$80` | Refills Dirt Bomb ammo to its max carried 4. Disabled when full. |
| `Shield Charge` | `$85` | Adds 60 shield charge, capped at 180. |
| `First Aid Kit` | `$110` | Fully heals to 100 HP at the start of the next round if damaged. |
| `Parachute` | `$45` | Reduces one fall-damage event. |

Notes:

- Ammo purchases now refill that weapon to its max carried ammo rather than adding one round at a time. Buying when already full is blocked, no money is spent, and a subtle blocked sound plays.
- The First Aid Kit replaces the old Repair Kit and is consumed only when the player is below 100 HP. One kit fully heals to 100 HP.
- The CPU shop logic understands the new ammo and heal behavior and will not waste money on a full ammo type or a full-health repair.

## Defensive Utilities

- `Shield`: visible around the tank while charged. It absorbs 50% of incoming explosion damage while charge remains, spends charge by the absorbed amount, flashes when it absorbs damage, and plays a brief shimmering tone.
- `First Aid Kit`: consumed at the start of a round if that player is below 100 HP, fully restoring health to 100. The round-start message reports the heal and a clean heal tone plays.
- `Parachute`: consumed when a tank drops far enough after terrain is destroyed, reducing that fall damage by 80%. The shot result reports parachute use and plays a soft cushion sound.

Fall damage only triggers when a tank settles downward more than 45 pixels after terrain changes.

## Round and Match Flow

- Destroying a tank ends the round and awards 1 point to the surviving player.
- The round summary appears before the shop.
- The shop appears between rounds unless the match winner has reached the rounds-to-win target.
- `Start Next Round` regenerates terrain and keeps score, money, inventory, and remaining tank health.
- `New Match` resets score, terrain, health, money, ammo, and utilities.
- `Restart Round` restarts the current battlefield without awarding score or shop money.

## Debug Helpers

Normal play does not expose extra debug helpers. Add `?debug=1` to the local URL to enable:

- `window.debugGameState()`
- `window.testWeaponImpact("standard")`
- `window.testWeaponImpact("heavy")`
- `window.testWeaponImpact("dirt")`
- `window.forceRoundWin(0)`
- `window.forceRoundWin(1)`

`window.render_game_to_text()`, `window.advanceTime(ms)`, and `window.GAME_VERSION` remain available for smoke testing without `?debug`.

## Testing

Use `TESTING.md` for the manual checklist. At minimum before publishing, verify:

- Main menu shows `v0.6.2`.
- In-game HUD shows the `v0.6.2` chip (HUD pill on phone, bottom-left chip on desktop).
- Phone-sized viewport shows a single `Play` button (Two Player Local hidden).
- Desktop viewport still shows both `Two Player Local` and `Single Player vs CPU` buttons.
- Arrow keys adjust angle only; `A`/`D` move only.
- Touch buttons hold-to-repeat for aim/power/move; `FIRE` fires once per tap; `WPN` cycles once per tap.
- Standard, Heavy, and Dirt Bomb sound different on fire and on impact.
- Dirt Bomb visibly creates a much larger mound than v0.5.
- Buying `Refill Heavy Shells` sets Heavy Shell ammo to 3; refill button disables when full.
- Buying `Refill Dirt Bombs` sets Dirt Bomb ammo to 4; refill button disables when full.
- Buying `First Aid Kit` while below 100 HP fully heals at the next round start; one kit consumed.
- Browser console has no normal gameplay errors.

## Project Structure

```text
index.html          Page shell, menu, HUD, settings, summary, shop, touch pad
styles.css          Responsive layout, touch button styling, safe-area handling
src/config.js       Version, tunables, weapon definitions, economy, shop, CPU difficulty
src/main.js         Entry point, DOM wiring, canvas sizing, touch wiring, debug hooks
src/game.js         Game loop, state flow, economy, shop, scoring, collisions, rendering
src/terrain.js      Heightmap terrain, spawn pads, crater carving, dirt mounds
src/tank.js         Tank state, health, ammo, utilities, aiming, drawing
src/projectile.js   Projectile physics, trails, explosion and dirt-puff effects
src/cpu.js          CPU weapon choice, aiming simulation, difficulty tuning
src/audio.js        Per-weapon Web Audio sound effects and mute persistence
src/ui.js           Menu, HUD, settings persistence, summary and shop updates
src/touchInput.js   Pointer-event wiring for the on-screen touch control pad
```

## Troubleshooting

- If the page is blank, serve it over `http://localhost` instead of `file://`.
- If the port is busy, use another port such as `python -m http.server 8010`.
- If sound does not play, click or tap once in the page first. Browsers require user interaction before starting audio.
- If the sound button starts muted, localStorage has a saved mute preference. Press `M` or tap the sound button to toggle it.
- If GitHub Pages shows an older version, hard refresh (`Ctrl+F5` on Windows/Linux, `Cmd+Shift+R` on macOS) and confirm the menu says `v0.6.2`.
- If match settings look wrong, clear `localStorage` for the site or change the settings on the menu before starting a new match.
- If a phone keeps zooming on double-tap, ensure the page is loaded fresh after the v0.6 update — it sets `user-scalable=no` and `touch-action: manipulation` to prevent that behavior on the controls.

## Known Limitations

- CPU aiming is intentionally simple and does not drive the tank.
- Tank health persists between rounds for strategy. The First Aid Kit fully heals at the start of the next round, so kits are very strong but require a slot in the inventory and money to buy.
- Terrain is a heightmap, so it cannot represent caves or overhangs.
- There are no online, networked, or persistent profiles.
- Active match state does not persist across page reloads.
- Two Player Local is intentionally hidden on phone-sized viewports because shared local play is impractical on a single small touchscreen.

## Suggested Future Improvements

- Add optional weapons such as a Bouncer Shell, roller, or cluster shell.
- Add optional mouse/finger drag aiming and power drag.
- Add CPU driving logic that uses movement fuel.
- Add local match presets for short, standard, and economy-heavy games.
- Add a lightweight automated smoke-test page for GitHub Pages deployments.
