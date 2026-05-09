# Tank Artillery Duel

Current version: `v0.6.8`

Tank Artillery Duel is a local browser-based 2D artillery game inspired by classic tank duel games. Two tanks fight across destructible hilly terrain with wind, turn-based aiming, movement fuel, limited special weapons, generated Web Audio effects, match scoring, money, a pre-round and between-round shop, and an optional CPU opponent.

v0.6.8 is a focused balance and maintenance pass. It makes Mega Bomb a late-match premium weapon, adds subtle tank movement audio, stops game audio when the page is hidden or the mobile browser is backgrounded, removes duplicate wind text from the upper HUD, cleans up documentation, and adds release notes.

The project is pure HTML, CSS, vanilla JavaScript, HTML5 Canvas, and the Web Audio API. It has no backend, no build step, no paid services, and no external assets.

Release history lives in [RELEASE_NOTES.md](RELEASE_NOTES.md).

## How to Run Locally

Because the game uses ES modules, use a local static server instead of opening `index.html` directly.

```bash
cd path/to/scorched_earth_remake
python -m http.server 8000
```

Open `http://localhost:8000`.

Node also works:

```bash
cd path/to/scorched_earth_remake
npx --yes serve .
```

To test from a phone on the same Wi-Fi, use your machine's LAN IP, for example `http://192.168.1.10:8000`.

## GitHub Pages Verification

The live game displays `v0.6.8` on the main menu only. Gameplay intentionally does not show a floating version badge over the canvas, HUD, or touch controls. `window.GAME_VERSION` remains available and returns `"v0.6.8"`.

After a GitHub Pages deployment:

- Hard refresh the page.
- Confirm the main menu shows `v0.6.8`.
- Open the browser console and confirm `window.GAME_VERSION` returns `"v0.6.8"`.
- Confirm no old gameplay version badge appears.

## Current Features

- Two Player Local and Single Player vs CPU modes.
- Single-button `Play` entry on phone-sized screens that starts Single Player vs CPU.
- Desktop keyboard controls and mobile/tablet touch controls.
- Destructible heightmap terrain with craters, Dirt Bomb mounds, tank settling, and fall damage.
- Projectile physics with gravity and wind.
- Standard Shell, Heavy Shell, Dirt Bomb, Roller Shell, Napalm Canister, Cluster Bomb, and Mega Bomb.
- Original self-contained Canvas art, generated projectile sprites, tank details, procedural terrain texture, and layered backgrounds.
- Economy, round summaries, pre-round shop before Round 1, between-round shop, score tracking, and inventory HUD.
- Shield charge, First Aid Kit full-heal behavior, parachutes, and ammo refill-to-max purchases.
- Layered generated Web Audio firing, impact, ambience, tank movement, tank destruction, shield, heal, parachute, purchase, blocked-purchase, weapon-cycle, round, and match sounds.
- Debug/smoke hooks: `window.render_game_to_text()`, `window.advanceTime(ms)`, and `window.GAME_VERSION`.

## Controls

### Desktop

| Key | Action |
| --- | --- |
| `Left Arrow` / `Right Arrow` | Adjust cannon angle only |
| `Up Arrow` / `Down Arrow` | Adjust shot power |
| `A` / `D` | Move the active tank before firing |
| `Spacebar` | Fire |
| `Tab` or `W` | Cycle available weapons |
| `M` | Mute or unmute sound |
| `R` | Restart current round during live play |
| `N` | Continue from summary to shop, or start next round from shop |
| `Escape` | Return to main menu |

Controls are locked while a projectile is flying, an explosion is resolving, the CPU is thinking, the summary is open, the shop is open, or the match is over.

### Mobile

Phone landscape remains the intended mobile gameplay mode.

- Phones show one primary `Play` button that starts Single Player vs CPU.
- Desktop and larger layouts still show both `Two Player Local` and `Single Player vs CPU`.
- Phone portrait shows the rotate overlay unless the player chooses to continue.
- Touch hold works for angle, power, and movement.
- Fire and weapon-cycle trigger once per tap.
- Mobile movement buttons use the same movement and movement-audio path as desktop `A` / `D`.

## HUD and Wind Display

The desktop player panels focus on player state: name, score, HP, shield, money, ammo, First Aid, and parachutes. The center status panel shows turn, round, mode, angle, power, selected weapon, ammo, movement fuel, status, and result.

Wind is shown on the battlefield wind indicator near the sky/trajectory area instead of being duplicated in the upper HUD. `Wind Off` still shows calm/0 wind on the battlefield indicator, and wind settings still affect projectile behavior.

## Weapons

| Weapon | Starting Ammo | Max Carried | Shop Ammo Item | Behavior |
| --- | ---: | ---: | --- | --- |
| `Standard Shell` | Unlimited | Unlimited | None | Balanced crater and damage. |
| `Heavy Shell` | 1 | 3 | `Heavy Shell Ammo` | Heavy-feeling shell, larger crater, high damage. |
| `Dirt Bomb` | 1 | 4 | `Dirt Bomb Ammo` | Adds a large dirt mound with low tank damage. |
| `Roller Shell` | 0 | 3 | `Roller Shell Ammo` | Hits terrain, rolls along the slope, then explodes. |
| `Napalm Canister` | 0 | 3 | `Napalm Canister Ammo` | Creates a terrain-hugging ground fire patch with minimal terrain deformation. |
| `Cluster Bomb` | 0 | 2 | `Cluster Bomb Ammo` | Splits into 5 bomblets with multiple small craters. |
| `Mega Bomb` | 0 | 1 | `Mega Bomb Ammo` | Late-match premium blast with the largest crater, heavy arc, and scary near-hit damage. |

Standard Shell is unlimited and has no ammo shop button. Every limited weapon can be selected only when it has ammo.

## Mega Bomb Balance

v0.6.8 changes Mega Bomb from an early easy delete button into a late-match super weapon:

- Price increased to `$375`.
- Max ammo remains `1`.
- Buying `Mega Bomb Ammo` refills it to `1`; if already full, the button is disabled and marked full.
- Speed scale is `0.92`, heavier than Standard Shell and Heavy Shell while still useful at high power.
- Max damage is `82` with steeper falloff, so medium-distance hits hurt without reliably deleting a full-health tank.
- Damage radius is `82`; terrain crater radius is `88`, keeping it the largest crater weapon.
- Shield absorbs a meaningful portion of Mega Bomb damage through the existing shield rules.

The trajectory preview and the actual projectile both use the same `Tank.fireVelocity()` calculation, and the CPU aim simulation reads the same weapon speed scale. Debug mode includes `window.testWeaponReach()` and `window.setupAimTest()` for quick Mega Bomb checks.

## Generated Sounds

All sounds are generated locally with Web Audio. No audio files or remote assets are used.

- Standard Shell, Heavy Shell, Dirt Bomb, Roller Shell, Napalm Canister, Cluster Bomb, and Mega Bomb have distinct generated fire and impact sounds.
- Mega Bomb keeps the largest low-frequency launch and explosion effect.
- Tank destruction, shield activation/absorption, First Aid, parachute, purchase, invalid purchase, weapon cycle, round start, round win, and match win sounds remain generated.
- Holding `A` / `D` or the mobile movement buttons plays a subtle generated tread loop only while the tank is actually moving.
- Movement audio respects mute, stops when movement stops or fuel runs out, and does not play during CPU turns, projectile flight, resolving, menu, shop, summary, or match over.
- Ambience is generated per battlefield theme.

Mute suppresses all generated sounds and persists through localStorage.

## Audio Lifecycle

v0.6.8 handles page lifecycle events so audio does not continue while the game is inactive.

- Audio stops or suspends when the page is hidden, the browser tab loses visibility, the mobile browser is backgrounded, the phone is locked, or the user switches apps.
- Tank movement audio, ambience, and active generated sound tails are stopped on page hide.
- Held movement states are cleared on page hide/blur so movement audio does not get stuck.
- Returning to the page does not duplicate ambience and does not restart movement audio unless the player actively presses movement again.
- Existing mute behavior and mute persistence are preserved.

## Economy and Shop

Players keep money and inventory across rounds in a match. A new match resets both and opens the pre-round shop before Round 1.

Money earned after each round:

- `$1` per 2 damage dealt.
- `$50` base allowance.
- `$75` round win bonus.
- `$25` survival bonus.

| Item | Price | Effect |
| --- | ---: | --- |
| `Heavy Shell Ammo` | `$100` | Refills Heavy Shell ammo to 3. Disabled when full. |
| `Dirt Bomb Ammo` | `$80` | Refills Dirt Bomb ammo to 4. Disabled when full. |
| `Roller Shell Ammo` | `$90` | Refills Roller Shell ammo to 3. Disabled when full. |
| `Napalm Canister Ammo` | `$95` | Refills Napalm Canister ammo to 3. Disabled when full. |
| `Cluster Bomb Ammo` | `$130` | Refills Cluster Bomb ammo to 2. Disabled when full. |
| `Mega Bomb Ammo` | `$375` | Refills Mega Bomb ammo to 1. Disabled when full. |
| `Shield Charge` | `$85` | Adds 60 shield charge, capped at 180. |
| `First Aid Kit` | `$110` | Fully heals to 100 HP at the start of the next round if damaged. |
| `Parachute` | `$45` | Reduces one fall-damage event. |

Mega Bomb is not affordable in Round 1 under normal starting money and is intended to become practical around Round 3 or later under normal money pacing. The CPU uses the same affordability and full-ammo rules, buys defensive utilities before considering Mega Bomb, and does not buy Mega Bomb when ammo is already full.

## Defensive Utilities

- `Shield Charge`: separate protection that absorbs 50% of incoming explosion damage while charge remains.
- `First Aid Kit`: consumed at round start only if the player is below 100 HP, fully restoring health to 100.
- `Parachute`: consumed when a tank drops far enough after terrain changes, reducing fall damage by 80%.

## Round and Match Flow

- Starting a new match opens the Pre-Round Shop before Round 1.
- In Single Player vs CPU, the CPU auto-shops before Round 1 and between rounds.
- `Start Round` begins Round 1 from the pre-round shop.
- The round summary appears after a tank is destroyed.
- `Continue to Shop` opens the Between-Round Shop unless the match is complete.
- `Start Next Round` regenerates terrain and preserves score, money, inventory, and remaining tank health.
- `New Match` resets score, terrain, health, money, ammo, utilities, and opens the pre-round shop again.
- `Restart Round` restarts the current battlefield without awarding score, money, or opening the pre-round shop.

## Debug Helpers

Normal play does not expose extra debug helpers. Add `?debug=1` to enable:

- `window.debugGameState()`
- `window.testWeaponImpact("standard")`
- `window.testWeaponImpact("heavy")`
- `window.testWeaponImpact("dirt")`
- `window.testWeaponImpact("roller")`
- `window.testWeaponImpact("napalm")`
- `window.testWeaponImpact("cluster")`
- `window.testWeaponImpact("mega")`
- `window.testWeaponReach()`
- `window.setupAimTest()`
- `window.forceRoundWin(0)`
- `window.forceRoundWin(1)`

`window.render_game_to_text()`, `window.advanceTime(ms)`, and `window.GAME_VERSION` are always available for smoke testing.

## Project Structure

```text
index.html          Page shell, menu, HUD, settings, summary, shop, touch pad
styles.css          Responsive layout, HUD, touch button styling, safe-area handling
src/config.js       Version, tunables, weapon definitions, economy, CPU difficulty
src/main.js         Entry point, DOM wiring, canvas sizing, touch wiring, debug hooks
src/game.js         Game loop, turn flow, economy, shop, scoring, collisions, rendering
src/themes.js       Original battlefield theme palettes and theme selection
src/backgroundRenderer.js Layered Canvas backgrounds and lightweight atmosphere animation
src/visualAssets.js Runtime-generated sprite and texture caches
src/terrainRenderer.js Layered terrain painting, texture, stones, craters, scorch marks
src/tankRenderer.js Stylized tank, recoil, smoke, shield, and wreck drawing
src/terrain.js      Heightmap terrain, spawn pads, crater carving, dirt mounds, visual marks
src/tank.js         Tank state, health, shield, ammo, utilities, aiming, visual timers
src/projectile.js   Projectile physics, rolling/split behavior support, explosion visuals
src/cpu.js          CPU weapon choice, aiming simulation, difficulty tuning
src/audio.js        Generated Web Audio effects, lifecycle handling, and mute persistence
src/ui.js           Menu, HUD, settings persistence, summary and shop updates
src/touchInput.js   Pointer-event wiring for the on-screen touch control pad
```

## Test Artifacts

Generated screenshots, traces, reports, coverage, and debug output are ignored by `.gitignore`. They should be deleted after successful local testing unless intentionally documented as project assets.

## Troubleshooting

- If the page is blank, serve it over `http://localhost` instead of `file://`.
- If the port is busy, use another port such as `python -m http.server 8010`.
- If sound does not play, click or tap once in the page first. Browsers require user interaction before starting audio.
- If the sound button starts muted, localStorage has a saved mute preference. Press `M` or tap the sound button.
- If GitHub Pages shows an older version, hard refresh and confirm the main menu says `v0.6.8`.
- If match settings look wrong, clear `localStorage` for the site or change settings on the menu before starting a new match.

## Known Limitations

- CPU aiming is intentionally simple and does not drive the tank.
- Roller Shell follows the heightmap surface and uses conservative rolling limits so it cannot roll forever.
- Cluster Bomb uses a small fixed bomblet count for performance.
- Terrain is a heightmap, so it cannot represent caves or overhangs.
- There are no online, networked, campaign, save-file, backend, or persistent-profile features.
- Two Player Local is intentionally hidden on phone-sized viewports.
