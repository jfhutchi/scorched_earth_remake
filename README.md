# Tank Artillery Duel

Current version: `v0.5.0`

Tank Artillery Duel is a local browser-based 2D artillery game inspired by classic tank duel games. Two tanks fight across destructible hilly terrain with wind, turn-based aiming, movement fuel, distinct weapons, generated sound effects, match scoring, money, a between-round shop, and an optional CPU opponent.

The project is pure HTML, CSS, vanilla JavaScript, and HTML5 Canvas. It has no backend, no build step, no paid services, and no remote assets.

## GitHub Pages Note

The live game displays `v0.5.0` on the main menu and in the in-game HUD. After a GitHub Pages deployment, hard refresh the page if the old version still appears:

- Windows/Linux: `Ctrl` + `F5`
- macOS: `Cmd` + `Shift` + `R`

This helps bypass cached JavaScript and CSS.

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

Open the local URL printed by the command.

## Current Features

- Two Player Local and Single Player vs CPU modes.
- Destructible heightmap terrain with craters and Dirt Bomb mounds.
- Projectile physics with gravity and wind.
- Angle, power, weapon selection, and pre-shot tank movement.
- Standard Shell, Heavy Shell, and Dirt Bomb.
- Match settings for rounds to win, CPU difficulty, wind, starting money, and terrain roughness.
- Economy, round summaries, between-round shop, score tracking, and inventory HUD.
- Defensive utilities: shield, repair kit, and parachute.
- Generated Web Audio effects with persistent mute toggle.
- Optional debug helpers for local testing.

## Match Settings

Settings are saved in `localStorage` and reused for the next match:

- `Rounds to Win`: 1, 3, or 5.
- `CPU Difficulty`: Easy, Normal, or Hard.
- `Wind`: Off, Light, Normal, or Wild.
- `Starting Money`: Low `$100`, Normal `$150`, or High `$250`.
- `Terrain`: Smooth, Normal, or Rough.

Starting a new match resets score, money, inventory, terrain, and tank health using these settings. Active match state does not persist across reloads.

## Controls

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

Controls are locked while a projectile is flying, an explosion is resolving, the CPU is thinking, the summary is open, the shop is open, or the match is over.

## Weapons

| Weapon | Ammo | Projectile | Terrain Effect | Damage |
| --- | --- | --- | --- | --- |
| `Standard Shell` | Unlimited | Normal speed | Medium crater, radius 42 | Medium, max 38 |
| `Heavy Shell` | Limited, starts with 3 | Slower and larger | Larger/deeper crater, radius 66 | High, max 70 |
| `Dirt Bomb` | Limited, starts with 4 | Slightly slower | Adds a mound, radius 58 | Low, max 10 |

The v0.5 visual pass makes the impacts easier to read: Standard Shell uses a compact blast, Heavy Shell has a larger forceful blast, and Dirt Bomb uses a brown/green dirt puff with upward soil fragments instead of a fireball.

## Movement

During a human aiming phase, press `A` or `D` to drive the active tank left or right. Movement follows the terrain surface, consumes fuel by distance moved, and is blocked by steep slopes, battlefield edges, or the other tank. Fuel resets at the start of each turn.

`Left Arrow` and `Right Arrow` are reserved for cannon angle adjustment and never move the tank.

## Economy and Shop

Players keep money and inventory across rounds in a match. A new match resets both.

Money earned after each round:

- `$1` per 2 damage dealt.
- `$50` base allowance.
- `$75` round win bonus.
- `$25` survival bonus.

Shop prices:

| Item | Price | Effect |
| --- | --- | --- |
| `Heavy Shell Ammo` | `$50` | Adds 1 Heavy Shell |
| `Dirt Bomb Ammo` | `$30` | Adds 1 Dirt Bomb |
| `Shield Charge` | `$85` | Adds 60 shield charge, capped at 180 |
| `Repair Kit` | `$65` | Heals 25 HP at the start of the next round if damaged |
| `Parachute` | `$45` | Reduces one fall-damage event |

In CPU mode, the CPU buys automatically using its difficulty profile and keeps a small money reserve so it does not overspend every round.

## Defensive Utilities

- `Shield`: visible around the tank while charged. It absorbs 50% of incoming explosion damage while charge remains, spends charge by the absorbed amount, and flashes when it absorbs damage.
- `Repair Kit`: consumed at the start of a round if that player is below 100 HP, restoring up to 25 HP. The round start message reports the repair.
- `Parachute`: consumed when a tank drops far enough after terrain is destroyed, reducing that fall damage by 80%. The shot result reports parachute use.

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

`window.render_game_to_text()` and `window.advanceTime(ms)` remain available for smoke testing.

## Testing

Use `TESTING.md` for the manual checklist. At minimum before publishing, verify:

- Main menu shows `v0.5.0`.
- Two Player and CPU modes start.
- Arrow keys adjust angle only.
- `A`/`D` move only.
- Standard Shell, Heavy Shell, and Dirt Bomb are visually distinct.
- Summary and shop appear after a forced or played round win.
- Shop purchase, next round, and new match flows work.
- Browser console has no normal gameplay errors.

## Project Structure

```text
index.html          Page shell, menu, HUD, settings, summary, and shop overlays
styles.css          Responsive layout and UI styling
src/config.js       Version, tunables, weapon definitions, economy, shop, CPU difficulty
src/main.js         Entry point, DOM wiring, canvas sizing, test hooks
src/game.js         Game loop, state flow, economy, shop, scoring, collisions, rendering
src/terrain.js      Heightmap terrain generation, spawn pads, crater carving, dirt mounds
src/tank.js         Tank state, health, ammo, utilities, aiming, drawing
src/projectile.js   Projectile physics, trails, explosion and dirt-puff effects
src/cpu.js          CPU weapon choice, aiming simulation, difficulty tuning
src/audio.js        Generated Web Audio sound effects and mute persistence
src/ui.js           Menu, HUD, settings persistence, summary and shop updates
```

## Troubleshooting

- If the page is blank, serve it over `http://localhost` instead of `file://`.
- If the port is busy, use another port such as `python -m http.server 8010`.
- If sound does not play, click once in the page first. Browsers require user interaction before starting audio.
- If the sound button starts muted, localStorage has a saved mute preference. Press `M` or the sound button to toggle it.
- If GitHub Pages shows an older version, hard refresh and confirm the menu says `v0.5.0`.
- If match settings look wrong, clear `localStorage` for the site or change the settings on the menu before starting a new match.

## Known Limitations

- CPU aiming is still intentionally simple and does not drive the tank.
- Tank health persists between rounds for strategy, so repair kits matter; this is less arcade-like than full health reset.
- Terrain is a heightmap, so it cannot represent caves or overhangs.
- There are no online, networked, or persistent profiles.
- Touch controls and small-phone layouts are not implemented.
- Active match state does not persist across page reloads.

## Suggested Future Improvements

- Add optional weapons such as a Bouncer Shell, roller, or cluster shell.
- Add optional mouse aiming and power drag.
- Add CPU driving logic that uses movement fuel.
- Add local match presets for short, standard, and economy-heavy games.
- Add a lightweight automated smoke-test page for GitHub Pages deployments.
