import { CASTLE_SIEGE_LEVELS } from './levels.js';

export const CASTLE_SIEGE_WORLDS = [
    {
        id: 'world1',
        name: 'Outpost',
        subtitle: 'Wood watchtowers on the frontier.',
        themeId: 'green',
        starsToUnlock: 0,
        levelIds: [
            'siege_001',
            'siege_002',
            'siege_003',
            'siege_004',
            'siege_005',
            'siege_006',
            'siege_007',
            'siege_008',
        ],
    },
    {
        id: 'world2',
        name: 'Quarry',
        subtitle: 'Stone forts rise from the cliffs.',
        themeId: 'desert',
        starsToUnlock: 6,
        levelIds: [
            'siege_009',
            'siege_010',
            'siege_011',
            'siege_012',
            'siege_013',
            'siege_014',
            'siege_015',
            'siege_016',
        ],
    },
];

export function getWorld(worldId) {
    return CASTLE_SIEGE_WORLDS.find((world) => world.id === worldId) || null;
}

export function getWorldForLevel(levelId) {
    return CASTLE_SIEGE_WORLDS.find((world) => world.levelIds.includes(levelId)) || null;
}

export function getAllCastleSiegeLevelIds() {
    return CASTLE_SIEGE_WORLDS.flatMap((world) => world.levelIds);
}

export function getStarsEarnedInWorld(worldId, progress) {
    const world = getWorld(worldId);
    if (!world || !progress || !progress.completedLevels) return 0;
    return world.levelIds.reduce((total, id) => {
        const entry = progress.completedLevels[id];
        return total + (entry && Number.isFinite(entry.bestStars) ? entry.bestStars : 0);
    }, 0);
}

export function isWorldUnlocked(worldId, progress) {
    const world = getWorld(worldId);
    if (!world) return false;
    if (world.starsToUnlock <= 0) return true;
    return getStarsTotalFromProgress(progress) >= world.starsToUnlock;
}

export function isLevelUnlocked(levelId, progress) {
    const world = getWorldForLevel(levelId);
    if (!world) return false;
    if (!isWorldUnlocked(world.id, progress)) return false;

    const index = world.levelIds.indexOf(levelId);
    if (index <= 0) return true;
    const previousId = world.levelIds[index - 1];
    return Boolean(progress?.completedLevels?.[previousId]?.completed);
}

export function findNextUnlockedLevelId(progress) {
    for (const world of CASTLE_SIEGE_WORLDS) {
        if (!isWorldUnlocked(world.id, progress)) continue;
        for (const levelId of world.levelIds) {
            if (!progress?.completedLevels?.[levelId]?.completed) return levelId;
        }
    }
    return CASTLE_SIEGE_WORLDS[0]?.levelIds[0] || null;
}

export function getNextLevelInCampaign(currentLevelId) {
    const world = getWorldForLevel(currentLevelId);
    if (!world) return null;
    const index = world.levelIds.indexOf(currentLevelId);
    if (index >= 0 && index < world.levelIds.length - 1) {
        return { levelId: world.levelIds[index + 1], worldId: world.id, crossesWorld: false };
    }

    const worldIndex = CASTLE_SIEGE_WORLDS.indexOf(world);
    const nextWorld = CASTLE_SIEGE_WORLDS[worldIndex + 1];
    if (!nextWorld) return null;
    return { levelId: nextWorld.levelIds[0], worldId: nextWorld.id, crossesWorld: true };
}

function getStarsTotalFromProgress(progress) {
    if (!progress || !progress.completedLevels) return 0;
    let total = 0;
    for (const entry of Object.values(progress.completedLevels)) {
        if (entry && Number.isFinite(entry.bestStars)) total += entry.bestStars;
    }
    return total;
}

export function summarizeCampaignProgress(progress) {
    const totalLevels = CASTLE_SIEGE_WORLDS.reduce((sum, world) => sum + world.levelIds.length, 0);
    const completed = Object.values(progress?.completedLevels || {}).filter((entry) => entry && entry.completed).length;
    return {
        totalLevels,
        completed,
        stars: getStarsTotalFromProgress(progress),
        maxStars: totalLevels * 3,
        coins: progress?.coins || 0,
    };
}

export function getLevelById(levelId) {
    return CASTLE_SIEGE_LEVELS[levelId] || null;
}
