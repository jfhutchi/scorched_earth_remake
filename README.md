# Tank Artillery Duel

Tank Artillery Duel is a local browser-based 2D artillery game inspired by classic tank duel games. Two tanks fight across destructible hilly terrain with wind, turn-based aiming, movement fuel, distinct weapons, generated sound effects, score tracking, and a simple CPU opponent.

The project is pure HTML, CSS, vanilla JavaScript, and HTML5 Canvas. It has no backend, no build step, no paid services, and no remote assets.

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

### VS Code

Install the Live Server extension, right-click `index.html`, and choose "Open with Live Server".

## Game Modes

- `Two Player Local`: both players share the keyboard and take turns.
- `Single Player vs CPU`: Player 1 is human, Player 2 is CPU-controlled.

The CPU waits briefly, picks a weapon, and uses a simple simulated aiming pass that accounts for distance, gravity, terrain, and wind. It has random aim error and gets slightly better after misses, so it should be functional without being perfect.

## Controls

| Key | Action |
| --- | --- |
| `Left Arrow` / `Right Arrow` | Adjust cannon angle |
| `Up Arrow` / `Down Arrow` | Adjust shot power |
| `A` / `D` | Move the active tank before firing |
| `Spacebar` | Fire |
| `Tab` or `W` | Cycle available weapons |
| `M` | Mute or unmute sound |
| `R` | Restart current round |
| `N` | Start next round after game over |
| `Escape` | Return to main menu |

Controls are locked while a projectile is flying, an explosion is resolving, the CPU is thinking, or the game is over. Tank movement is available only during the active human player's aiming phase and uses 90 pixels of movement fuel per turn.

## Weapons

| Weapon | Ammo | Terrain Effect | Damage |
| --- | --- | --- | --- |
| `Standard Shell` | Unlimited | Normal crater, radius 42 | Balanced, max 38 |
| `Heavy Shell` | 3 per round per player | Larger and deeper crater, radius 62 | High, max 68 |
| `Dirt Bomb` | 4 per round per player | Adds a rounded dirt mound, radius 58 | Low, max 10 |

Each player has separate ammo. Empty limited weapons are skipped when cycling, and the game prevents firing a weapon with 0 ammo. Terrain effect and damage are tuned separately, so Dirt Bomb can reshape the battlefield without acting like another high-damage explosive.

## Movement

During a human aiming phase, press `A` or `D` to drive the active tank left or right. Movement follows the terrain surface, consumes fuel by distance moved, and is blocked by steep slopes, battlefield edges, or the other tank. Fuel resets at the start of each turn.

## Round and Match Flow

- Destroying a tank ends the round and awards 1 point to the surviving player.
- `Next Round` regenerates terrain, resets tank health and ammo, and keeps score.
- `New Match` regenerates terrain, resets health and ammo, and resets score.
- `Restart Round` restarts the current round without awarding a point.

## Project Structure

```text
index.html          Page shell, menu, HUD, overlays
styles.css          Responsive layout and UI styling
src/config.js       Central tunables and weapon definitions
src/main.js         Entry point, DOM wiring, canvas sizing, test hooks
src/game.js         Game loop, turn state, scoring, collisions, rendering
src/terrain.js      Heightmap terrain generation, spawn pads, crater carving
src/tank.js         Tank state, health, ammo, aiming, drawing
src/projectile.js   Projectile physics, trails, explosion effects
src/cpu.js          CPU weapon choice and aiming simulation
src/audio.js        Generated Web Audio sound effects and mute persistence
src/ui.js           Menu, HUD, overlay updates
```

## Troubleshooting

- If the page is blank, make sure it is served over `http://localhost` instead of `file://`.
- If the port is busy, use another port such as `python -m http.server 8010`.
- If sound does not play, click once in the page first. Browsers require user interaction before starting audio.
- If the sound button starts muted, localStorage has a saved mute preference. Press `M` or the sound button to toggle it.
- If the HUD feels cramped, expand the browser window. The game is tuned for common desktop sizes.

## Known Limitations

- CPU aiming is intentionally simple and imperfect.
- CPU movement is not implemented; the CPU repositions by aim and weapon choice only.
- Terrain is a heightmap, so it cannot represent caves or overhangs.
- There are no online, networked, or persistent profiles.
- Touch controls and small-phone layouts are not implemented.
- Match score resets when the page reloads.

## Suggested Future Improvements

- Add more weapon types such as split shells, rollers, or shields.
- Add optional mouse aiming and power drag.
- Add local difficulty settings for CPU aim error.
- Add wind visualization in the HUD and stronger turn transition animation.
- Add local-only settings for round count, terrain roughness, and starting ammo.
