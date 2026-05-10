# Tank Artillery Duel

Current version: `v0.7.0`

Tank Artillery Duel is a local browser-based 2D artillery tank game inspired by classic artillery duels. Two tanks fight across destructible hilly terrain with wind, turn-based aiming, movement fuel, generated Web Audio, match scoring, money, a pre-round and between-round shop, and an optional CPU opponent.

v0.7.0 adds the weapon-system foundation: a centralized weapon catalog with categories, tactical roles, ammo/economy metadata, generated icon/visual/sound profiles, CPU-use hints, and debug validation helpers. It also adds the first expanded original weapon pack, improves CPU weapon choice, introduces [BALANCE.md](BALANCE.md), and adds GitHub Actions validation for version branches. Online multiplayer, room codes, accounts, backends, WebRTC, and external assets are still not implemented.

Release history lives in [RELEASE_NOTES.md](RELEASE_NOTES.md). Balance notes live in [BALANCE.md](BALANCE.md).

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

The live game displays `v0.7.0` on the main menu only. Gameplay intentionally does not show a floating version badge over the canvas, HUD, or touch controls. `window.GAME_VERSION` is always available and returns `"v0.7.0"`.

After a GitHub Pages deployment from `main`:

- Hard refresh `https://jfhutchi.github.io/scorched_earth_remake/`.
- Confirm the main menu shows `v0.7.0`.
- Open DevTools and confirm `window.GAME_VERSION` returns `"v0.7.0"`.
- Confirm no gameplay version badge appears.
- Confirm no external image or audio assets are requested.
- Confirm version branches run validation only and do not deploy production Pages.

## Current Features

- Single Player vs CPU and Two Player Local modes.
- Phone-sized layouts show one primary `Play` button that starts Single Player vs CPU.
- Two Player Local remains available on desktop and wider layouts.
- Two Player Local turn handoff overlay with input lock between human turns.
- Per-tank movement allowance so Player 1 and Player 2 movement state stays separate.
- Match Length supports `1 Round`, `Best of 3`, and `Best of 5`; best-of matches end as soon as one player clinches the majority.
- Desktop keyboard controls and mobile/tablet touch controls.
- Destructible heightmap terrain, craters, mounds, tank settling, fall damage, parachutes, and wind physics.
- Centralized weapon catalog with categories, tactical roles, prices, ammo caps, starting ammo, labels, icon profiles, visual profiles, sound profiles, CPU-use weights, and shop priorities.
- Shop cards generated from weapon metadata, plus separate Shield, First Aid Kit, and Parachute utility cards.
- Economy, round summaries, pre-round shop before Round 1, between-round shop, score tracking, and inventory HUD.
- Shield charge, First Aid full-heal behavior, parachutes, floating combat feedback, and bounded burn ticks.
- Generated Canvas weapon/item icons and projectile sprites. No external image assets are used.
- Generated Web Audio firing, impact, ambience, tank movement, utility, purchase, blocked-purchase, round start, and result sounds. No external audio files are used.
- Help / How to Play overlay, grouped settings, and debug/smoke hooks.

## Weapon Categories

Weapon categories are used for shop clarity, balancing, CPU reasoning, debug output, and documentation:

- Basic Shells
- Precision Weapons
- Heavy Explosives
- Terrain Builders
- Terrain Destroyers
- Rolling Weapons
- Fire Weapons
- Split / Cluster Weapons
- Utility / Defense for non-weapon shop items

## Weapons

Standard Shell remains unlimited and does not appear as a shop ammo card. Every limited weapon can be bought/refilled through the shop and selected only when it has ammo.

| Weapon | Category | Starting | Max | Price | Role |
| --- | --- | ---: | ---: | ---: | --- |
| Standard Shell | Basic Shells | Unlimited | Unlimited | None | Reliable baseline shot |
| Precision Shell | Precision Weapons | 0 | 4 | $95 | Small crater, strong direct hit |
| Heavy Shell | Heavy Explosives | 1 | 3 | $100 | Higher damage, heavier arc |
| Dirt Bomb | Terrain Builders | 1 | 4 | $80 | Basic terrain mound |
| Mound Maker | Terrain Builders | 0 | 3 | $110 | Larger focused mound |
| Excavator Bomb | Terrain Destroyers | 0 | 3 | $115 | Large terrain removal, modest damage |
| Roller Shell | Rolling Weapons | 0 | 3 | $90 | Basic slope-following roller |
| Heavy Roller | Rolling Weapons | 0 | 2 | $150 | Heavier limited roller |
| Napalm Canister | Fire Weapons | 0 | 3 | $95 | Flame hit plus two small burn ticks |
| Firestorm Canister | Fire Weapons | 0 | 2 | $180 | Wider expensive fire area |
| Airburst Shell | Precision Weapons | 0 | 3 | $120 | Detonates above terrain or near exposed tanks |
| Splitter Shell | Split / Cluster Weapons | 0 | 3 | $125 | Three medium shards near arc peak |
| Cluster Bomb | Split / Cluster Weapons | 0 | 2 | $130 | Five lighter bomblets |
| Mega Bomb | Heavy Explosives | 0 | 1 | $375 | Late-match premium blast |

## Economy and Shop

The default starting money preset is `None ($0)`. Higher starting money presets remain available but intentionally change progression.

Players keep money and inventory across rounds in a match. Match Length is a best-of setting: `1 Round` ends after one win, `Best of 3` ends at two wins, and `Best of 5` ends at three wins. A new match resets both players and opens the pre-round shop before Round 1.

Money earned after each round:

- `$1` per 2 damage dealt.
- `$50` base allowance.
- `$75` round win bonus.
- `$25` survival bonus.

Utilities:

| Item | Price | Effect |
| --- | ---: | --- |
| Shield Charge | $85 | Adds 60 shield charge, capped at 180 |
| First Aid Kit | $110 | Fully heals at next round start if damaged |
| Parachute | $35 | Automatically reduces meaningful fall damage |

Mega Bomb remains a late-match premium weapon at `$375`, max ammo `1`, default `$0` starting money, heavy arc, steep damage falloff, and the largest crater.

## Controls

### Desktop

| Key | Action |
| --- | --- |
| Left Arrow / Right Arrow | Adjust cannon angle only |
| Up Arrow / Down Arrow | Adjust shot power |
| A / D | Move the active tank before firing |
| Spacebar | Fire |
| Tab or W | Cycle available weapons |
| M | Mute or unmute sound |
| R | Restart current round during live play |
| N | Continue from summary to shop, or start next round from shop |
| Escape | Return to main menu |

Controls are locked while a projectile is flying, an explosion is resolving, the CPU is thinking, the shop or summary is open, the handoff overlay is visible, or the match is over.

### Mobile

Phone landscape remains the intended mobile gameplay mode.

- Phones show one primary `Play` button that starts Single Player vs CPU.
- Desktop and larger layouts still show both `Two Player Local` and `Single Player vs CPU`.
- Phone portrait shows the rotate overlay unless the player chooses to continue.
- Touch hold works for angle, power, and movement.
- Fire and weapon-cycle trigger once per tap.
- Mobile movement buttons use the same movement and movement-audio path as desktop `A` / `D`.
- The mobile shop uses compact single-column item cards so `Start Round` / `Start Next Round` stays reachable.

## CPU

CPU weapon choice now reads catalog roles and considers available ammo, enemy distance, target health, shields, rough terrain, terrain obstruction, uphill/downhill relation, miss streak, and difficulty. Easy CPU heavily favors Standard Shell and can make premium mistakes. Normal and Hard use roles more intentionally, avoid wasting Mega Bomb on low-value targets, and prefer defensive utilities when low on health.

CPU shopping uses the same affordability and full-ammo rules as human shopping, respects ammo caps, prioritizes First Aid and Shield when damaged, and uses shop priorities and CPU-use weights for weapon refills.

## Debug Helpers

Normal play does not expose extra debug helpers. Add `?debug=1` to enable:

- `window.debugGameState()`
- `window.debugWeapons()`
- `window.testWeaponCatalog()`
- `window.setupWeaponTest("airburst")`
- `window.testWeaponImpact("standard")` through any catalog weapon id
- `window.testWeaponReach()`
- `window.setupAimTest()`
- `window.testParachuteDrop()`
- `window.forceRoundWin(0)` / `window.forceRoundWin(1)`
- `window.debugTurnState()`
- `window.debugMovementState()`
- `window.exportDebugGameState()`

`window.render_game_to_text()`, `window.advanceTime(ms)`, and `window.GAME_VERSION` are always available for smoke testing.

## Project Structure

```text
index.html          Page shell, menu, HUD, help, summary, shop, touch controls
styles.css          Responsive layout, HUD, shop cards, help, touch controls
src/config.js       Version, tunables, weapon catalog, economy, CPU difficulty
src/main.js         Entry point, DOM wiring, canvas sizing, touch wiring, debug hooks
src/game.js         Game loop, turn flow, economy, shop, scoring, collisions, rendering
src/cpu.js          CPU weapon choice, aiming simulation, difficulty tuning
src/projectile.js   Projectile physics, rolling/split/airburst support, explosion visuals
src/audio.js        Generated Web Audio effects, lifecycle handling, mute persistence
src/visualAssets.js Runtime-generated icon, sprite, and texture caches
src/terrain.js      Heightmap terrain, spawn pads, craters, mounds, scorch marks
src/terrainRenderer.js Layered terrain painting and scorch/crater rendering
src/tank.js         Tank state, health, shield, ammo, utilities, aiming, visual timers
src/tankRenderer.js Tank, shield, parachute, wreck, and smoke drawing
src/themes.js       Original battlefield theme palettes
src/backgroundRenderer.js Layered Canvas backgrounds
src/ui.js           Menu, HUD, settings persistence, help, summary, shop updates
src/touchInput.js   Pointer-event wiring for the on-screen touch control pad
scripts/            Local/CI validation scripts
```

## Test Artifacts

Generated screenshots, traces, reports, coverage, logs, and debug output are ignored by `.gitignore`. They should be deleted after successful local testing unless intentionally documented as project assets.

## Known Limitations

- CPU tanks still do not drive with movement fuel.
- CPU aiming remains intentionally imperfect.
- Terrain is a heightmap, so it cannot represent caves or overhangs.
- Two Player Local is intentionally hidden on phone-sized viewports.
- There are no online, networked, campaign, save-file, backend, account, room-code, WebRTC, or persistent-profile features.
