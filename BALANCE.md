# Balance Reference

Current version: `v0.9.0`

BALANCE.md is the Crater Command tuning reference for weapons, economy, utility items, and CPU usage. It documents intent and current values; it does not claim the balance is final.

## Philosophy

- Standard Shell must remain useful because it is the unlimited fallback.
- Limited weapons should create tactical choices, not strict upgrades.
- Prices should reflect power, flexibility, and ammo scarcity.
- Terrain tools should change battlefield shape without dominating damage.
- Fire and split weapons should apply pressure without locking turn resolution.
- Splitter Shell and Cluster Bomb should stay tactically distinct: Splitter is a controlled fork shot, while Cluster Bomb is wide area saturation.
- Mega Bomb should feel premium but remain late-match, max-ammo-1, and not a guaranteed one-hit kill.
- CPU should look intentional but stay beatable, especially on Easy and Normal.

## Economy

Default starting money is `None ($0)`.

Round income:

- `$1` per 2 damage dealt.
- `$50` base allowance.
- `$75` round win bonus.
- `$25` survival bonus.

Castle Siege rewards:

- `$50` base clear reward.
- `$10`, `$25`, or `$50` star bonus for 1, 2, or 3 stars.
- `$100` first-clear bonus per level; replays do not repeat that first-clear bonus.

Castle Siege progression:

- World 1 / Outpost is unlocked by default and uses wood + crystal blocks.
- World 2 / Quarry unlocks at 6 total stars and introduces stone blocks.
- Levels unlock sequentially inside each unlocked world.

## Castle Siege Levels

| Level | World | Name | Shot Limit | Par Shots | Material Focus |
| --- | --- | --- | ---: | ---: | --- |
| `siege_001` | Outpost | Lone Pillar | 6 | 3 | Wood + crystal |
| `siege_002` | Outpost | Twin Stack | 7 | 3 | Wood + crystal |
| `siege_003` | Outpost | Footbridge | 8 | 4 | Wood + crystal |
| `siege_004` | Outpost | Old Watchtower | 8 | 4 | Wood + crystal |
| `siege_005` | Outpost | Lean-To | 8 | 4 | Wood + crystal |
| `siege_006` | Outpost | Stacked Tower | 9 | 4 | Wood + crystal |
| `siege_007` | Outpost | Sheltered Core | 9 | 5 | Wood + crystal |
| `siege_008` | Outpost | Outpost Citadel | 10 | 6 | Wood + crystal |
| `siege_009` | Quarry | Stone Cap | 8 | 4 | Stone cap + wood supports |
| `siege_010` | Quarry | Hard Wall | 9 | 4 | Stone wall + wood supports |
| `siege_011` | Quarry | Stone Pillars | 9 | 5 | Stone pillars + wood beam |
| `siege_012` | Quarry | The Vault | 10 | 5 | Stone shell + wood brace |
| `siege_013` | Quarry | Heavy Bridge | 9 | 5 | Stone bridge + wood rails |
| `siege_014` | Quarry | Layered Defense | 10 | 6 | Stone armor + wood weakpoints |
| `siege_015` | Quarry | Quarry Keep | 11 | 7 | Stone keep + wood weakpoints |
| `siege_016` | Quarry | Stronghold | 12 | 8 | Stone stronghold + wood weakpoints |

## Weapon Categories

- Basic Shells
- Precision Weapons
- Heavy Explosives
- Terrain Builders
- Terrain Destroyers
- Rolling Weapons
- Fire Weapons
- Split / Cluster Weapons
- Utility / Defense

## Weapon Table

| Weapon | Category | Role | Price | Max Ammo | Damage | Crater / Terrain | Arc | Special Behavior | CPU Notes |
| --- | --- | --- | ---: | ---: | --- | --- | --- | --- | --- |
| Standard Shell | Basic Shells | Baseline | None | Unlimited | Medium | Medium crater | Easy | Unlimited fallback | Always safe; high Easy preference |
| Precision Shell | Precision Weapons | Precision | $95 | 4 | High direct | Tiny crater | Medium | Small radius rewards direct hits | Good kill option when target is exposed |
| Heavy Shell | Heavy Explosives | Heavy damage | $100 | 3 | High | Large crater | Medium-heavy | Heavier arc than Standard | Good against damaged or shielded targets |
| Dirt Bomb | Terrain Builders | Terrain build | $80 | 4 | Low | Adds mound | Medium-heavy | Basic cover/shape tool | Low CPU weight; mostly after misses |
| Mound Maker | Terrain Builders | Terrain build | $110 | 3 | Very low | Large mound | Heavy | Stronger focused terrain builder | Very low CPU weight |
| Excavator Bomb | Terrain Destroyers | Terrain destroy | $115 | 3 | Low-medium | Very large crater | Heavy | Opens lines and drops cover | Useful if terrain blocks target |
| Roller Shell | Rolling Weapons | Rolling | $90 | 3 | Medium | Small rolling crater | Terrain-dependent | Rolls along slopes before detonating | Favored when target is downhill |
| Heavy Roller | Rolling Weapons | Heavy rolling | $150 | 2 | Medium-high | Medium rolling crater | Hard | Heavier, slower, limited rolling weapon | Conservative CPU use; downhill only |
| Napalm Canister | Fire Weapons | Fire | $95 | 3 | Medium | Scorch + burn | Medium-heavy | Initial flame hit plus 2 x -1 burn ticks | Useful on rough/exposed terrain |
| Firestorm Canister | Fire Weapons | Heavy fire | $180 | 2 | Medium area | Wide scorch | Heavy | Wider flame line plus 3 x -1 burn ticks | Low CPU weight; avoids low-value targets |
| Airburst Shell | Precision Weapons | Airburst | $120 | 3 | Medium area | Small overhead crater | Medium | Detonates above terrain or near exposed tanks | Useful for ridge pressure and exposed tanks |
| Splitter Shell | Split / Cluster Weapons | Controlled fork | $125 | 3 | Controlled fork | Three small child-shell craters | Medium-hard | Predictably forks into 3 child shells near arc peak | Useful for bracketing with a decent line/arc |
| Cluster Bomb | Split / Cluster Weapons | Cluster | $130 | 2 | Wide spread | Five small bomblet craters | Hard | Wide-scatter bomblets for area coverage | Favored for rough terrain, obstruction, long range, or repeated misses |
| Mega Bomb | Heavy Explosives | Premium | $375 | 1 | Extreme | Massive crater | Very heavy | Late-match premium blast | Hard-gated; avoids low-health waste |

## Utility Items

| Item | Price | Role | Notes |
| --- | ---: | --- | --- |
| Shield Charge | $85 | Defense | Adds 60 shield charge, capped at 60; absorbs 50% of explosion damage while charge remains |
| First Aid Kit | $110 | Recovery | Fully heals at next round start if damaged; not consumed at full health |
| Parachute | $35 | Fall protection | Automatically reduces meaningful fall damage after terrain collapses |

## CPU Shopping Notes

- CPU uses the same affordability, full-ammo, and refill-to-max rules as human players.
- Low-health CPU prioritizes First Aid before luxury weapons.
- Shield is preferred before premium weapon spending when shield charge is low.
- Mega Bomb is not bought when the CPU is unhealthy, under-shielded, or barely able to afford it.
- Terrain builders have low shop priority and low CPU purchase chance.
- Firestorm, Heavy Roller, Cluster Bomb, and Mega Bomb have conservative CPU weights.
- Splitter Shell has a moderate CPU purchase chance because it rewards better arcs and should not be spammed by Easy CPU.

## CPU Firing Notes

- CPU weapon choice reads catalog roles and available ammo.
- Easy CPU usually fires Standard Shell and makes occasional limited-weapon mistakes.
- Normal CPU uses role hints for distance, obstruction, downhill targets, exposed targets, and target health.
- Hard CPU uses the same rules with less hesitation, but still has aiming error and imperfect choices.
- CPU avoids Mega Bomb on low-health targets and avoids terrain builders as damage weapons.
- CPU considers Excavator Bomb or Airburst Shell when terrain obstructs the target.
- CPU considers Roller Shell and Heavy Roller when the target is downhill.
- CPU considers Cluster Bomb when it wants wide area coverage or probability hits.
- CPU considers Splitter Shell when it has a reasonable arc and wants a controlled multi-hit bracket.

## Splitter Shell vs Cluster Bomb

Splitter Shell is a controlled mid-air fork weapon. It splits near the top of its arc into three predictable child shells: one continues mostly forward while the side children fork outward and down. It should reward a decent initial shot and help bracket a target that is almost lined up.

Cluster Bomb is the chaotic area-saturation weapon. It splits into several lower-damage bomblets with wider scatter and smaller craters. It should be better for uneven terrain, loose area denial, and probability hits when exact aim is uncertain.

Neither should obsolete the other: Splitter is more predictable and aim-rewarding, while Cluster covers more ground and creates more terrain chaos.

Debug mode (`?debug=1`, then `Ctrl + Shift + D`) is available as a balancing aid for quickly granting money/ammo/utilities, setting wind, preparing flat/weapon test ranges, and forcing match flow without grinding through the normal economy.

## Known Balance Risks

- Airburst Shell may need tuning if overhead hits become too reliable on steep terrain.
- Mound Maker can reshape cover strongly; tank placement should be watched after repeated mounds.
- Firestorm Canister is intentionally expensive and limited, but wide fire damage may need real-match tuning.
- Splitter Shell and Cluster Bomb still need longer full-match tuning to confirm the controlled-fork vs wide-scatter split stays valuable.
- CPU does not drive tanks, so weapon selection cannot fully account for repositioning.

## Future Weapon Ideas

- Bouncer-style ricochet shell with conservative bounce count.
- Low-damage EMP-style shield disruptor.
- Wind-sensitive light dart.
- Defensive smoke or concealment item.
- Delayed-fuse burrower with strict terrain safeguards.
