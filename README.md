# Tank Artillery Duel

Current version: `v0.6.6`

Tank Artillery Duel is a local browser-based 2D artillery game inspired by classic tank duel games. Two tanks fight across destructible hilly terrain with wind, turn-based aiming, movement fuel, limited special weapons, generated Web Audio effects, match scoring, money, a pre-round and between-round shop, and an optional CPU opponent.

v0.6.6 is a major graphics and presentation pass. It adds original runtime-generated tank art, textured terrain, layered battlefield themes, projectile sprites, richer combat effects, subtle screen shake, and UI polish while preserving the existing game loop, weapons, economy, CPU, shop, and mobile controls.

The project is pure HTML, CSS, vanilla JavaScript, HTML5 Canvas, and the Web Audio API. It has no backend, no build step, no paid services, and no external assets.

## GitHub Pages Note

The live game displays `v0.6.6` on the main menu only. Gameplay intentionally does not show a floating version badge over the canvas, HUD, or touch controls. `window.GAME_VERSION` remains available and returns `"v0.6.6"`.

After a GitHub Pages deployment, hard refresh the page if the old version still appears:

- Windows/Linux: `Ctrl` + `F5`
- macOS: `Cmd` + `Shift` + `R`
- iOS Safari: close and reopen the tab, or use a reload without cache if available.
- Android Chrome: tap menu, then `Reload`.

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

## Current Features

- Two Player Local and Single Player vs CPU modes.
- Single-button `Play` entry on phone-sized screens that starts Single Player vs CPU.
- Desktop keyboard controls and mobile/tablet touch controls.
- Destructible heightmap terrain with craters, Dirt Bomb mounds, and tank settling/fall damage.
- Projectile physics with gravity and wind.
- Standard Shell, Heavy Shell, Dirt Bomb, Roller Shell, Napalm Canister, Cluster Bomb, and Mega Bomb.
- Original self-contained Canvas art: cached projectile sprites, tank details, procedural terrain texture, and layered backgrounds.
- Three randomly selected battlefield looks: green daytime hills, desert sunset canyon, and snowy mountains.
- Polished tank rendering with treads, armored hulls, turret/cannon details, recoil, muzzle flash, shadows, shield outlines, damage smoke, and wrecked states.
- Textured terrain with surface highlights, embedded stones, crater shadows, scorch marks, and Dirt Bomb mound highlights.
- Economy, round summaries, pre-round shop before Round 1, between-round shop, score tracking, and inventory HUD.
- Shield charge, First Aid Kit full-heal behavior, parachutes, and ammo refill-to-max purchases.
- Generated Web Audio firing, impact, tank destruction, shield, heal, parachute, purchase, and blocked-purchase sounds.
- `window.render_game_to_text()`, `window.advanceTime(ms)`, and `window.GAME_VERSION` for smoke testing.

## Version Display

- Main menu shows `v0.6.6`.
- Gameplay does not show a version chip or badge.
- `window.GAME_VERSION` returns `"v0.6.6"`.

## Visual Upgrade

All v0.6.6 art is original and self-contained. The game does not download images, fonts, sounds, or sprites from remote services.

- Tanks are drawn as stylized artillery vehicles with tread sprites, armored hull panels, angled body alignment on slopes, separate turrets, readable cannon direction, recoil, muzzle flash, low-health smoke, and destroyed wreck art.
- Terrain uses a layered Canvas render pass: base fill, procedural texture, strata, embedded stones, crater/scorch overlays, mound highlights, and a readable surface cap.
- Backgrounds are generated Canvas scenes with sky gradients, distant ridges, haze, and lightweight theme animation such as clouds, dust, or snow.
- Projectiles use generated shell/canister/bomblet sprites with motion trails; explosions add flash rings, smoke, debris, scorch marks, and restrained screen shake for heavier weapons.
- UI panels, buttons, health/shield bars, and mobile controls were polished for stronger contrast without changing the menu, shop, summary, or play flow.

## Mobile Browser Support

Phone landscape remains the intended mobile gameplay mode.

- Phones show one primary `Play` button that starts Single Player vs CPU.
- Desktop and larger layouts still show both `Two Player Local` and `Single Player vs CPU`.
- Phone portrait shows the rotate overlay unless the player chooses to continue.
- The mobile HUD uses compact pills for turn, HP, shield when charged, wind, selected weapon, angle, power, and ammo.
- The extra info row shows readable inventory labels instead of unexplained abbreviations.
- The mobile shop uses tighter cards, two-column purchase buttons, and a sticky start-round action area so buying does not bury the next step.
- In CPU mode, the mobile shop prioritizes the human purchase card and collapses CPU auto-shop details behind a small `Details` toggle.
- Touch controls remain translucent and corner-positioned for phone landscape playability.

### On-Screen Controls

| Control | Action |
| --- | --- |
| Left/right move buttons | Move active tank left/right while held |
| `↑` | Increase cannon angle while held |
| `↓` | Decrease cannon angle while held |
| `PWR-` / `PWR+` | Decrease/increase shot power while held |
| `FIRE` | Fire one shot per tap |
| `WPN` | Cycle weapons one tap at a time |
| `R` | Restart current round during live play |
| `N` | Continue from summary, or start the next round from the shop |
| Menu button | Return to the main menu |
| Sound button | Toggle mute |

Hold-to-repeat works for angle, power, and movement. Fire and weapon-cycle each trigger once per tap.

## Desktop Controls

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

## HUD and Inventory Clarity

The desktop HUD uses clear labels such as:

`$65 | Heavy 1 | Dirt 1 | Roller 0 | Napalm 0 | Cluster 0 | Mega 0 | Shield 60 | Aid 0 | Chute 0`

The mobile HUD uses compact but understandable labels such as `Hvy`, `Dirt`, `Roller`, `Napalm`, `Cluster`, `Mega`, `Shield`, `Aid`, and `Chute`.

Standard Shell ammo is not shown in inventory because it is unlimited. HP is shown in the health bar, not duplicated in the HUD inventory line.

## Shield Indicator

Shield Charge adds separate blue/cyan protection. It is not normal HP.

- Desktop player panels show HP plus a blue shield bar and numeric shield value.
- Mobile HP pills show `+Shield N` when shield is charged.
- Shop and summary inventory show `Shield: N`.
- Shield value decreases as it absorbs damage.
- The tank still draws a blue shield outline while charged.

## Weapons

| Weapon | Starting Ammo | Max Carried | Shop Ammo Item | Behavior |
| --- | ---: | ---: | --- | --- |
| `Standard Shell` | Unlimited | Unlimited | None | Balanced crater and damage. |
| `Heavy Shell` | 1 | 3 | `Heavy Shell Ammo` | Slower shell, larger crater, high damage. |
| `Dirt Bomb` | 1 | 4 | `Dirt Bomb Ammo` | Adds a large dirt mound with low tank damage. |
| `Roller Shell` | 0 | 3 | `Roller Shell Ammo` | Hits terrain, rolls along the slope, then explodes. |
| `Napalm Canister` | 0 | 3 | `Napalm Canister Ammo` | Creates a terrain-hugging ground fire patch with minimal terrain deformation. |
| `Cluster Bomb` | 0 | 2 | `Cluster Bomb Ammo` | Splits into 5 bomblets with multiple small craters. |
| `Mega Bomb` | 0 | 1 | `Mega Bomb Ammo` | Rare, expensive, large crater and high damage. |

Standard Shell is unlimited and has no ammo shop button. Every limited weapon can be selected only when it has ammo.

## Explosion Visuals

v0.6.6 upgrades the existing Canvas blast visuals while keeping weapon behavior unchanged:

- Standard Shell: medium expanding blast ring and flash.
- Heavy Shell: larger ring, stronger flash, more debris.
- Dirt Bomb: brown/green dirt puff and soft dust wave, not a fireball.
- Roller Shell: small/medium expanding blast after rolling.
- Napalm Canister: short-lived ground fire that spreads horizontally along the terrain surface, not a normal crater explosion.
- Cluster Bomb: several small expanding mini-blasts.
- Mega Bomb: largest shock ring, bright center flash, and heavier debris.
- Tank destruction: larger tank-centered final blast, debris flash, persistent wreck, and dark smoke.

## Generated Sounds

All sounds are generated locally with Web Audio. No audio files are used.

- Standard Shell: medium cannon thump and normal explosion.
- Heavy Shell: deeper launch and larger low-rumble impact.
- Dirt Bomb: softer launch and soil burst.
- Roller Shell: metallic launch, short rolling rumble, and medium explosion.
- Napalm Canister: pressurized launch and flame burst / whoosh with subtle crackles.
- Cluster Bomb: hollow launch, split pop, and small bomblet impacts.
- Mega Bomb: deepest launch and largest low-frequency explosion.
- Tank destruction: deep final boom, low rumble, metallic crack/pop, and falling debris noise.
- Shield absorption, First Aid Kit, parachute, purchase, and invalid purchase sounds remain distinct.

Mute still suppresses all generated sounds.

## Economy and Shop

Players keep money and inventory across rounds in a match. A new match resets both and opens the pre-round shop before Round 1.

Money earned after each round:

- `$1` per 2 damage dealt.
- `$50` base allowance.
- `$75` round win bonus.
- `$25` survival bonus.

### Shop Items

| Item | Price | Effect |
| --- | ---: | --- |
| `Heavy Shell Ammo` | `$100` | Refills Heavy Shell ammo to 3. Disabled when full. |
| `Dirt Bomb Ammo` | `$80` | Refills Dirt Bomb ammo to 4. Disabled when full. |
| `Roller Shell Ammo` | `$90` | Refills Roller Shell ammo to 3. Disabled when full. |
| `Napalm Canister Ammo` | `$95` | Refills Napalm Canister ammo to 3. Disabled when full. |
| `Cluster Bomb Ammo` | `$130` | Refills Cluster Bomb ammo to 2. Disabled when full. |
| `Mega Bomb Ammo` | `$175` | Refills Mega Bomb ammo to 1. Disabled when full. |
| `Shield Charge` | `$85` | Adds 60 shield charge, capped at 180. |
| `First Aid Kit` | `$110` | Fully heals to 100 HP at the start of the next round if damaged. |
| `Parachute` | `$45` | Reduces one fall-damage event. |

Ammo purchases refill the weapon to max carried ammo. If ammo is already full, the button is greyed out, says `Full`, cannot be bought, and does not charge money. The CPU uses the same money, inventory, and full-ammo rules as the human player.

On phone-sized screens, the shop is compact: the human player's money, inventory, and purchase buttons are the primary content, and the start-round controls stay reachable at the bottom of the shop panel. CPU purchases are summarized as `CPU bought N items.` or `CPU auto-shopped.`, with a `Details` toggle for the exact purchases and CPU inventory.

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
src/audio.js        Generated Web Audio effects and mute persistence
src/ui.js           Menu, HUD, settings persistence, summary and shop updates
src/touchInput.js   Pointer-event wiring for the on-screen touch control pad
```

## Troubleshooting

- If the page is blank, serve it over `http://localhost` instead of `file://`.
- If the port is busy, use another port such as `python -m http.server 8010`.
- If sound does not play, click or tap once in the page first. Browsers require user interaction before starting audio.
- If the sound button starts muted, localStorage has a saved mute preference. Press `M` or tap the sound button.
- If GitHub Pages shows an older version, hard refresh and confirm the main menu says `v0.6.6`.
- If match settings look wrong, clear `localStorage` for the site or change settings on the menu before starting a new match.

## Known Limitations

- CPU aiming is intentionally simple and does not drive the tank.
- Roller Shell follows the heightmap surface and uses conservative rolling limits so it cannot roll forever.
- Cluster Bomb uses a small fixed bomblet count for performance.
- Terrain is a heightmap, so it cannot represent caves or overhangs.
- There are no online, networked, campaign, save-file, backend, or persistent-profile features.
- Two Player Local is intentionally hidden on phone-sized viewports.

## Suggested Future Improvements

- Tune CPU weapon preferences after longer full-match playtests.
- Add optional mouse/finger drag aiming and power drag.
- Add CPU driving logic that uses movement fuel.
- Add local match presets for short, standard, and economy-heavy games.
