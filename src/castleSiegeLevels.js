export const CASTLE_SIEGE_LEVELS = {
    siege_001: {
        id: 'siege_001',
        name: 'Old Watchtower',
        shotLimit: 8,
        playerStartX: 160,
        startingAngle: 43,
        startingPower: 62,
        objective: {
            type: 'destroy_core',
            targetTag: 'castle_core',
        },
        windMode: 'light',
        terrainRoughness: 'smooth',
        loadout: [
            { weaponId: 'standard', ammo: Infinity },
        ],
        blocks: [
            { id: 'watchtower_base_left', type: 'block', material: 'wood', x: 760, y: 536, width: 66, height: 36, tags: ['foundation'] },
            { id: 'watchtower_base_mid', type: 'block', material: 'wood', x: 826, y: 536, width: 66, height: 36, tags: ['foundation'] },
            { id: 'watchtower_base_right', type: 'block', material: 'wood', x: 892, y: 536, width: 66, height: 36, tags: ['foundation'] },
            { id: 'watchtower_core', type: 'castle_core', material: 'crystal', x: 720, y: 484, width: 138, height: 52, hp: 28, tags: ['castle_core', 'objective'] },
            { id: 'watchtower_guard_right', type: 'block', material: 'wood', x: 892, y: 486, width: 58, height: 50, tags: ['guard'] },
            { id: 'watchtower_roof_left', type: 'block', material: 'wood', x: 792, y: 444, width: 66, height: 40, hp: 12, tags: ['cover'] },
            { id: 'watchtower_roof_right', type: 'block', material: 'wood', x: 858, y: 444, width: 66, height: 40, hp: 12, tags: ['cover'] },
        ],
    },
};

export function getCastleSiegeLevel(levelId = 'siege_001') {
    return CASTLE_SIEGE_LEVELS[levelId] || CASTLE_SIEGE_LEVELS.siege_001;
}

export function getNextCastleSiegeLevelId(levelId) {
    const ids = Object.keys(CASTLE_SIEGE_LEVELS);
    const index = ids.indexOf(levelId);
    if (index === -1 || index >= ids.length - 1) return null;
    return ids[index + 1];
}
