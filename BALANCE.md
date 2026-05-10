# Balance Reference

Current version: `v0.7.0`

BALANCE.md is the tuning reference for weapons, economy, utility items, and CPU usage. It documents intent and current values; it does not claim the balance is final.

## Philosophy

- Standard Shell must remain useful because it is the unlimited fallback.
- Limited weapons should create tactical choices, not strict upgrades.
- Prices should reflect power, flexibility, and ammo scarcity.
- Terrain tools should change battlefield shape without dominating damage.
- Fire and split weapons should apply pressure without locking turn resolution.
- Mega Bomb should feel premium but remain late-match, max-ammo-1, and not a guaranteed one-hit kill.
- CPU should look intentional but stay beatable, especially on Easy and Normal.

## Economy

Default starting money is `None ($0)`.

Round income:

- `$1` per 2 damage dealt.
- `$50` base allowance.
- `$75` round win bonus.
- `$25` survival bonus.

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
| Splitter Shell | Split / Cluster Weapons | Split | $125 | 3 | Spread | Three small shard craters | Medium-hard | Splits into 3 medium shards near arc peak | Safer pressure after misses or obstruction |
| Cluster Bomb | Split / Cluster Weapons | Cluster | $130 | 2 | Wide spread | Five small bomblet craters | Hard | Splits into 5 lighter bomblets | Favored at long range or after misses |
| Mega Bomb | Heavy Explosives | Premium | $375 | 1 | Extreme | Massive crater | Very heavy | Late-match premium blast | Hard-gated; avoids low-health waste |

## Utility Items

| Item | Price | Role | Notes |
| --- | ---: | --- | --- |
| Shield Charge | $85 | Defense | Adds 60 shield charge, capped at 180; absorbs 50% of explosion damage while charge remains |
| First Aid Kit | $110 | Recovery | Fully heals at next round start if damaged; not consumed at full health |
| Parachute | $35 | Fall protection | Automatically reduces meaningful fall damage after terrain collapses |

## CPU Shopping Notes

- CPU uses the same affordability, full-ammo, and refill-to-max rules as human players.
- Low-health CPU prioritizes First Aid before luxury weapons.
- Shield is preferred before premium weapon spending when shield charge is low.
- Mega Bomb is not bought when the CPU is unhealthy, under-shielded, or barely able to afford it.
- Terrain builders have low shop priority and low CPU purchase chance.
- Firestorm, Heavy Roller, Cluster Bomb, and Mega Bomb have conservative CPU weights.

## CPU Firing Notes

- CPU weapon choice reads catalog roles and available ammo.
- Easy CPU usually fires Standard Shell and makes occasional limited-weapon mistakes.
- Normal CPU uses role hints for distance, obstruction, downhill targets, exposed targets, and target health.
- Hard CPU uses the same rules with less hesitation, but still has aiming error and imperfect choices.
- CPU avoids Mega Bomb on low-health targets and avoids terrain builders as damage weapons.
- CPU considers Excavator Bomb or Airburst Shell when terrain obstructs the target.
- CPU considers Roller Shell and Heavy Roller when the target is downhill.

## Known Balance Risks

- Airburst Shell may need tuning if overhead hits become too reliable on steep terrain.
- Mound Maker can reshape cover strongly; tank placement should be watched after repeated mounds.
- Firestorm Canister is intentionally expensive and limited, but wide fire damage may need real-match tuning.
- Splitter Shell and Cluster Bomb overlap in pressure role; Splitter should stay fewer/stronger, Cluster wider/lighter.
- CPU does not drive tanks, so weapon selection cannot fully account for repositioning.

## Future Weapon Ideas

- Bouncer-style ricochet shell with conservative bounce count.
- Low-damage EMP-style shield disruptor.
- Wind-sensitive light dart.
- Defensive smoke or concealment item.
- Delayed-fuse burrower with strict terrain safeguards.
