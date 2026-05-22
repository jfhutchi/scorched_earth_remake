const STORAGE_KEY = 'crater-command-siege-progress-v1';
const VERSION = 1;

export function getDefaultCastleSiegeProgress() {
    return {
        version: VERSION,
        coins: 0,
        armory: {},
        completedLevels: {},
    };
}

export function loadCastleSiegeProgress() {
    if (!canUseLocalStorage()) return getDefaultCastleSiegeProgress();

    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return getDefaultCastleSiegeProgress();
        return sanitizeProgress(JSON.parse(raw));
    } catch (error) {
        console.warn('Could not load Castle Siege progress; using defaults.', error);
        return getDefaultCastleSiegeProgress();
    }
}

export function saveCastleSiegeProgress(progress) {
    const safeProgress = sanitizeProgress(progress);
    if (!canUseLocalStorage()) return safeProgress;

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(safeProgress));
    } catch (error) {
        console.warn('Could not save Castle Siege progress.', error);
    }

    return safeProgress;
}

export function recordCastleSiegeResult(levelId, result) {
    const progress = loadCastleSiegeProgress();
    const completed = Boolean(result && result.completed);
    if (!levelId || !completed) {
        return {
            progress,
            levelProgress: progress.completedLevels[levelId] || null,
            coinsEarned: 0,
            firstClear: false,
        };
    }

    const previous = sanitizeLevelProgress(progress.completedLevels[levelId]);
    const firstClear = !previous.completed;
    const stars = clampInt(result.bestStars ?? result.stars, 0, 3);
    const shotsRemaining = Math.max(0, Math.round(Number(result.bestShotsRemaining ?? result.shotsRemaining) || 0));
    const coinsEarned = calculateCoins(stars, firstClear);

    progress.coins = Math.max(0, Math.round(progress.coins + coinsEarned));
    progress.completedLevels[levelId] = {
        completed: true,
        bestStars: Math.max(previous.bestStars, stars),
        bestShotsRemaining: Math.max(previous.bestShotsRemaining, shotsRemaining),
        timesCompleted: previous.timesCompleted + 1,
    };

    saveCastleSiegeProgress(progress);
    return {
        progress,
        levelProgress: progress.completedLevels[levelId],
        coinsEarned,
        firstClear,
    };
}

function canUseLocalStorage() {
    return typeof localStorage !== 'undefined';
}

function sanitizeProgress(value) {
    const progress = getDefaultCastleSiegeProgress();
    if (!value || typeof value !== 'object') return progress;

    progress.coins = Math.max(0, Math.round(Number(value.coins) || 0));
    progress.armory = sanitizeArmory(value.armory);
    const completedLevels = value.completedLevels && typeof value.completedLevels === 'object'
        ? value.completedLevels
        : {};

    for (const [levelId, levelProgress] of Object.entries(completedLevels)) {
        if (!levelId) continue;
        const safeLevel = sanitizeLevelProgress(levelProgress);
        if (safeLevel.completed || safeLevel.timesCompleted > 0 || safeLevel.bestStars > 0) {
            progress.completedLevels[levelId] = safeLevel;
        }
    }

    return progress;
}

function sanitizeArmory(value) {
    const armory = {};
    if (!value || typeof value !== 'object') return armory;

    for (const [itemId, count] of Object.entries(value)) {
        if (!itemId) continue;
        const safeCount = clampInt(count, 0, 99);
        if (safeCount > 0) armory[itemId] = safeCount;
    }

    return armory;
}

function sanitizeLevelProgress(value) {
    const level = value && typeof value === 'object' ? value : {};
    return {
        completed: Boolean(level.completed),
        bestStars: clampInt(level.bestStars, 0, 3),
        bestShotsRemaining: Math.max(0, Math.round(Number(level.bestShotsRemaining) || 0)),
        timesCompleted: Math.max(0, Math.round(Number(level.timesCompleted) || 0)),
    };
}

function calculateCoins(stars, firstClear) {
    const starBonus = stars >= 3 ? 50 : (stars >= 2 ? 25 : (stars >= 1 ? 10 : 0));
    return 50 + starBonus + (firstClear ? 100 : 0);
}

function clampInt(value, min, max) {
    const numeric = Math.round(Number(value) || 0);
    return Math.max(min, Math.min(max, numeric));
}

export function getStarsTotal(progress) {
    if (!progress || !progress.completedLevels) return 0;
    let total = 0;
    for (const entry of Object.values(progress.completedLevels)) {
        if (entry && Number.isFinite(entry.bestStars)) total += entry.bestStars;
    }
    return total;
}

export function getLevelProgress(progress, levelId) {
    if (!progress || !progress.completedLevels || !levelId) return null;
    const entry = progress.completedLevels[levelId];
    return entry ? sanitizeLevelProgress(entry) : null;
}
