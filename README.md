# Tank Artillery Duel

A small turn-based 2D artillery game inspired by classic tank-vs-tank shooters.
Two players share a keyboard, take turns adjusting angle/power, and try to blow
each other up across destructible hilly terrain. Pure HTML / CSS / vanilla
JavaScript — no build step, no dependencies, no remote assets.

## How to run

The game uses ES modules, so most browsers won't load it directly from the
filesystem (`file://`). Use any tiny static server. Two zero-install options:

### Option A — Python (already on most systems)

```
cd "2d 1 shot game"
python -m http.server 8000
```

Then open <http://localhost:8000> in your browser.

### Option B — Node (if you have it)

```
cd "2d 1 shot game"
npx --yes serve .
```

Then open the URL it prints (usually <http://localhost:3000>).

### Option C — VS Code

Install the "Live Server" extension, right-click `index.html`, and choose
"Open with Live Server".

> If you really want to double-click `index.html`: it works in Firefox with
> default settings, but Chrome/Edge will block ES modules over `file://`. Use a
> local server for the best experience.

## Controls

| Key                | Action                                  |
|--------------------|-----------------------------------------|
| `←` / `→`          | Adjust cannon angle (left raises)       |
| `↑` / `↓`          | Adjust shot power                       |
| `Space`            | Fire                                    |
| `R`                | Restart match                           |
| `Esc`              | Return to main menu                     |

Both players use the same controls — the active player's panel is highlighted
yellow at the top of the screen. The cannon can't be fired again until the
current shot has landed.

## How it plays

- Wind is randomized each turn (shown by the arrow above the HUD) and pushes
  the projectile horizontally.
- Explosions carve a circular hole in the terrain and damage tanks within
  ~45 px. Damage falls off linearly with distance.
- After every explosion both tanks settle onto the new ground height, so a
  near miss can drop a tank into a fresh crater.
- First tank to 0 HP loses.

## Files

```
index.html          – page shell + HUD overlay
styles.css          – all styling
src/main.js         – entry point, wires DOM/events, sizes the canvas
src/game.js         – core loop, turn/state logic, collisions
src/terrain.js      – heightmap generation + crater carving + drawing
src/tank.js         – tank state, aim, drawing, damage popup
src/projectile.js   – projectile physics + trail + explosion FX
src/ui.js           – HUD updates and screen switching
```

## Known limitations / future improvements

- AI opponent / single-player mode (currently always 2-player local).
- Sound effects and music.
- Multiple weapon types (cluster shots, dirt bombs, etc.).
- Mouse aim and drag-to-set-power.
- Touch / mobile controls.
- Trajectory preview line for new players.
- The heightmap doesn't model overhangs, so explosions inside a hill collapse
  the dirt above. It looks fine but isn't physically accurate.
- No persistent score / match best-of-N.
