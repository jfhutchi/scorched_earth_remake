export const CONFIG = {
    canvas: {
        width: 1280,
        height: 720,
    },
    physics: {
        gravity: 520,
        windAccelScale: 30,
        projectileStep: 1 / 120,
    },
    wind: {
        min: -3,
        max: 3,
    },
    tank: {
        maxHealth: 100,
        width: 44,
        height: 18,
        barrelLength: 31,
        barrelThickness: 5,
        minAngle: 5,
        maxAngle: 85,
        minPower: 12,
        maxPower: 100,
        powerToSpeed: 6,
        spawnMargin: 120,
        movementFuelPerTurn: 90,
        moveSpeed: 150,
        maxClimbDelta: 24,
        minTankSeparation: 58,
    },
    terrain: {
        padHalfWidth: 32,
        minSpawnDistance: 460,
    },
    turn: {
        cpuThinkSeconds: 0.85,
        cpuThinkJitterSeconds: 0.45,
        impactDelaySeconds: 1.05,
    },
    cpu: {
        baseAngleError: 6,
        basePowerError: 8,
        missLearning: 0.13,
        lastMissPowerCorrection: 0.032,
    },
};

export const WEAPONS = [
    {
        id: 'standard',
        name: 'Standard Shell',
        behavior: 'crater',
        ammo: Infinity,
        maxDamage: 38,
        damageRadius: 42,
        damageFalloff: 1.15,
        explosionRadius: 42,
        terrainEffectRadius: 42,
        terrainEffectStrength: 0.92,
        speedScale: 1,
        projectileRadius: 4,
        color: '#ffd257',
        trailColor: '255, 222, 120',
        terrainMessage: 'Standard Shell cratered the ground.',
        description: 'Balanced damage and crater size. Unlimited ammo.',
    },
    {
        id: 'heavy',
        name: 'Heavy Shell',
        behavior: 'crater',
        ammo: 3,
        maxDamage: 68,
        damageRadius: 65,
        damageFalloff: 1.35,
        explosionRadius: 65,
        terrainEffectRadius: 62,
        terrainEffectStrength: 1.25,
        speedScale: 0.82,
        projectileRadius: 5.5,
        color: '#ff8a45',
        trailColor: '255, 155, 88',
        terrainMessage: 'Heavy Shell caused a major blast.',
        description: 'High damage and a larger crater. Limited ammo.',
    },
    {
        id: 'dirt',
        name: 'Dirt Bomb',
        behavior: 'addTerrain',
        ammo: 4,
        maxDamage: 10,
        damageRadius: 35,
        damageFalloff: 1.7,
        explosionRadius: 50,
        terrainEffectRadius: 58,
        terrainEffectStrength: 34,
        speedScale: 0.92,
        projectileRadius: 6,
        color: '#90bf4c',
        trailColor: '160, 196, 83',
        terrainMessage: 'Dirt Bomb added terrain.',
        description: 'Builds a mound or fills a crater with low tank damage.',
    },
];

export function getWeaponById(id) {
    return WEAPONS.find((weapon) => weapon.id === id) || WEAPONS[0];
}

export function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}
