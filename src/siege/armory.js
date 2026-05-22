import { getWeaponById, maxAmmoFor } from '../config.js';
import { loadCastleSiegeProgress, saveCastleSiegeProgress } from './progress.js';

export const CASTLE_SIEGE_ARMORY_ITEMS = [
    {
        id: 'precision',
        label: 'Precision Shell Cache',
        weaponId: 'precision',
        amount: 1,
        price: 80,
        maxCarry: 3,
        description: 'Adds one Precision Shell to the next Castle Siege attempt.',
    },
    {
        id: 'heavy',
        label: 'Heavy Shell Cache',
        weaponId: 'heavy',
        amount: 1,
        price: 90,
        maxCarry: 3,
        description: 'Adds one Heavy Shell to the next Castle Siege attempt.',
    },
    {
        id: 'excavator',
        label: 'Excavator Bomb Cache',
        weaponId: 'excavator',
        amount: 1,
        price: 105,
        maxCarry: 2,
        description: 'Adds one Excavator Bomb to the next Castle Siege attempt.',
    },
    {
        id: 'cluster',
        label: 'Cluster Bomb Cache',
        weaponId: 'cluster',
        amount: 1,
        price: 125,
        maxCarry: 2,
        description: 'Adds one Cluster Bomb to the next Castle Siege attempt.',
    },
];

export function getCastleSiegeArmoryItem(itemId) {
    return CASTLE_SIEGE_ARMORY_ITEMS.find((item) => item.id === itemId) || null;
}

export function purchaseCastleSiegeArmoryItem(itemId) {
    const progress = loadCastleSiegeProgress();
    const item = getCastleSiegeArmoryItem(itemId);
    if (!item) {
        return {
            ok: false,
            reason: 'unknown-item',
            message: 'Unknown armory supply.',
            progress,
        };
    }

    const owned = getArmoryItemCount(progress, item.id);
    if (owned >= item.maxCarry) {
        return {
            ok: false,
            reason: 'max-carry',
            message: `${item.label} is already stocked.`,
            item,
            progress,
        };
    }

    if (progress.coins < item.price) {
        return {
            ok: false,
            reason: 'not-enough-coins',
            message: `Need $${item.price - progress.coins} more siege coins.`,
            item,
            progress,
        };
    }

    progress.coins = Math.max(0, progress.coins - item.price);
    progress.armory[item.id] = owned + 1;
    const saved = saveCastleSiegeProgress(progress);
    return {
        ok: true,
        message: `${item.label} stocked for the next attempt.`,
        item,
        progress: saved,
    };
}

export function consumeCastleSiegeArmorySupplies() {
    const progress = loadCastleSiegeProgress();
    const supplies = [];

    for (const item of CASTLE_SIEGE_ARMORY_ITEMS) {
        const count = getArmoryItemCount(progress, item.id);
        if (count <= 0) continue;

        supplies.push({
            id: item.id,
            label: item.label,
            weaponId: item.weaponId,
            amount: item.amount * count,
            count,
        });
        delete progress.armory[item.id];
    }

    return {
        supplies,
        progress: supplies.length ? saveCastleSiegeProgress(progress) : progress,
    };
}

export function summarizeCastleSiegeArmory(progress) {
    const items = CASTLE_SIEGE_ARMORY_ITEMS.map((item) => ({
        ...item,
        weapon: getWeaponById(item.weaponId),
        owned: getArmoryItemCount(progress, item.id),
        maxAmmo: maxAmmoFor(item.weaponId),
    }));
    const totalSupplies = items.reduce((total, item) => total + item.owned, 0);
    const loadedText = items
        .filter((item) => item.owned > 0)
        .map((item) => `${item.weapon.compactName || item.weapon.name} +${item.owned * item.amount}`)
        .join(', ');

    return {
        coins: Math.max(0, Math.round(Number(progress?.coins) || 0)),
        totalSupplies,
        loadedText,
        items,
    };
}

function getArmoryItemCount(progress, itemId) {
    const count = progress?.armory?.[itemId];
    return Math.max(0, Math.round(Number(count) || 0));
}
