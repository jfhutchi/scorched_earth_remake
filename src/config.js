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
        ammo: Infinity,
        damage: 48,
        craterRadius: 44,
        speedScale: 1,
        projectileRadius: 4,
        color: '#ffd257',
        trailColor: '255, 222, 120',
        description: 'Balanced damage and crater size. Unlimited ammo.',
    },
    {
        id: 'heavy',
        name: 'Heavy Shell',
        ammo: 3,
        damage: 72,
        craterRadius: 60,
        speedScale: 0.82,
        projectileRadius: 5.5,
        color: '#ff8a45',
        trailColor: '255, 155, 88',
        description: 'High damage and a larger crater. Limited ammo.',
    },
    {
        id: 'dirt',
        name: 'Dirt Bomb',
        ammo: 3,
        damage: 18,
        craterRadius: 76,
        speedScale: 0.74,
        projectileRadius: 6,
        color: '#a87238',
        trailColor: '190, 142, 79',
        description: 'Low tank damage with major terrain deformation.',
    },
];

export function getWeaponById(id) {
    return WEAPONS.find((weapon) => weapon.id === id) || WEAPONS[0];
}

export function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}
