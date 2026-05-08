export const GAME_VERSION = 'v0.6.1';

export const CONFIG = {
    debug: false,
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
    windModes: {
        off: { label: 'Off', min: 0, max: 0 },
        light: { label: 'Light', min: -1.2, max: 1.2 },
        normal: { label: 'Normal', min: -3, max: 3 },
        wild: { label: 'Wild', min: -5, max: 5 },
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
        roughness: {
            smooth: { label: 'Smooth', variation: 42, rolling: 20, small: 6, smoothing: 6 },
            normal: { label: 'Normal', variation: 70, rolling: 32, small: 13, smoothing: 4 },
            rough: { label: 'Rough', variation: 92, rolling: 46, small: 20, smoothing: 2 },
        },
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
    economy: {
        damageMoneyDivisor: 2,
        winBonus: 75,
        survivalBonus: 25,
        baseAllowance: 50,
        startingMoney: {
            low: 100,
            normal: 150,
            high: 250,
        },
    },
    utilities: {
        shieldPurchaseCharge: 60,
        shieldMaxCharge: 180,
        shieldAbsorbRatio: 0.5,
        // First Aid Kit fully restores health between rounds (v0.6).
        firstAidFullHeal: true,
        fallDamageDropThreshold: 45,
        fallDamageScale: 0.6,
        fallDamageMax: 40,
        parachuteReduction: 0.8,
        rebuildHealthAfterDeath: 50,
    },
    // v0.6: ammo purchases now refill to max carried ammo for that weapon.
    shop: {
        heavyAmmo: { label: 'Refill Heavy Shells', refillLabel: 'Refill Heavy Shells', fullLabel: 'Heavy Shells Full', price: 100, weaponId: 'heavy' },
        dirtAmmo: { label: 'Refill Dirt Bombs', refillLabel: 'Refill Dirt Bombs', fullLabel: 'Dirt Bombs Full', price: 80, weaponId: 'dirt' },
        shield: { label: 'Shield Charge', price: 85 },
        repair: { label: 'First Aid Kit', price: 110 },
        parachute: { label: 'Parachute', price: 45 },
    },
    settings: {
        storageKey: 'tank-artillery-settings',
        defaults: {
            roundsToWin: 3,
            cpuDifficulty: 'normal',
            windMode: 'normal',
            startingMoney: 'normal',
            terrainRoughness: 'normal',
        },
    },
};

export const CPU_DIFFICULTY = {
    easy: {
        label: 'Easy',
        aimErrorDegrees: [10, 16],
        powerErrorPercent: [18, 28],
        thinkingDelayMs: [900, 1400],
        shotSamples: 4,
        heavyShellUseChance: 0.10,
        dirtBombUseChance: 0.12,
        shieldBuyChance: 0.15,
        repairBuyChance: 0.25,
        ammoBuyChance: 0.30,
        reserveMoney: 60,
    },
    normal: {
        label: 'Normal',
        aimErrorDegrees: [5, 9],
        powerErrorPercent: [10, 16],
        thinkingDelayMs: [700, 1100],
        shotSamples: 8,
        heavyShellUseChance: 0.25,
        dirtBombUseChance: 0.08,
        shieldBuyChance: 0.35,
        repairBuyChance: 0.55,
        ammoBuyChance: 0.55,
        reserveMoney: 45,
    },
    hard: {
        label: 'Hard',
        aimErrorDegrees: [2, 5],
        powerErrorPercent: [4, 9],
        thinkingDelayMs: [500, 900],
        shotSamples: 14,
        heavyShellUseChance: 0.45,
        dirtBombUseChance: 0.05,
        shieldBuyChance: 0.65,
        repairBuyChance: 0.80,
        ammoBuyChance: 0.75,
        reserveMoney: 30,
    },
};

// `ammo` doubles as the carried-max for refill purchases (Infinity = unlimited).
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
        impactVisual: 'blast',
        terrainMessage: 'Standard Shell cratered the ground.',
        description: 'Balanced damage and crater size. Unlimited ammo.',
    },
    {
        id: 'heavy',
        name: 'Heavy Shell',
        behavior: 'crater',
        ammo: 3,
        maxDamage: 70,
        damageRadius: 68,
        damageFalloff: 1.35,
        explosionRadius: 72,
        terrainEffectRadius: 66,
        terrainEffectStrength: 1.36,
        speedScale: 0.8,
        projectileRadius: 6,
        color: '#ff8a45',
        trailColor: '255, 155, 88',
        impactVisual: 'heavyBlast',
        terrainMessage: 'Heavy Shell caused a major blast.',
        description: 'High damage and a larger crater. Limited ammo.',
    },
    {
        // v0.6: Dirt Bomb buffed to ~3x visible mound effect (wider radius +
        // taller mound with reduced post-smoothing).
        id: 'dirt',
        name: 'Dirt Bomb',
        behavior: 'addTerrain',
        ammo: 4,
        maxDamage: 10,
        damageRadius: 34,
        damageFalloff: 1.7,
        explosionRadius: 70,
        terrainEffectRadius: 88,
        terrainEffectStrength: 92,
        speedScale: 0.92,
        projectileRadius: 6,
        color: '#8fbd52',
        trailColor: '130, 110, 68',
        impactVisual: 'dirtPuff',
        terrainMessage: 'Dirt Bomb piled up a large mound.',
        description: 'Builds a much larger mound or fills a crater with low tank damage.',
    },
];

export function getWeaponById(id) {
    return WEAPONS.find((weapon) => weapon.id === id) || WEAPONS[0];
}

export function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

export function maxAmmoFor(weaponId) {
    const weapon = getWeaponById(weaponId);
    return weapon ? weapon.ammo : 0;
}
