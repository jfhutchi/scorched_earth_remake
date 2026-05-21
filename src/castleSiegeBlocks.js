export const CASTLE_MATERIALS = {
    wood: {
        label: 'Wood',
        maxHp: 32,
        damageMultiplier: 1.25,
        fill: '#9b6238',
        stroke: '#5f3722',
    },
    stone: {
        label: 'Stone',
        maxHp: 70,
        damageMultiplier: 1,
        fill: '#7d8582',
        stroke: '#4b5352',
    },
    metal: {
        label: 'Metal',
        maxHp: 110,
        damageMultiplier: 0.65,
        fill: '#65707a',
        stroke: '#343d45',
    },
    crystal: {
        label: 'Crystal',
        maxHp: 82,
        damageMultiplier: 1,
        fill: '#73d9e6',
        stroke: '#2f7d91',
    },
};

export function createCastleBlocks(level) {
    const specs = Array.isArray(level?.blocks) ? level.blocks : [];
    return specs.map((spec, index) => {
        const material = CASTLE_MATERIALS[spec.material] ? spec.material : 'wood';
        const maxHp = Math.max(1, Math.round(Number(spec.hp) || CASTLE_MATERIALS[material].maxHp));
        const tags = Array.isArray(spec.tags) ? [...spec.tags] : [];
        if (spec.type === 'castle_core' && !tags.includes('castle_core')) tags.push('castle_core');

        return {
            id: spec.id || `castle_block_${index + 1}`,
            type: spec.type || 'block',
            material,
            x: Number(spec.x) || 0,
            y: Number(spec.y) || 0,
            width: Math.max(1, Number(spec.width) || 32),
            height: Math.max(1, Number(spec.height) || 32),
            hp: maxHp,
            maxHp,
            destroyed: false,
            tags,
        };
    });
}

export function findCastleBlockHit(blocks, projectile) {
    if (!Array.isArray(blocks) || !projectile) return null;
    const radius = Math.max(1, Number(projectile.radius) || 4);
    let best = null;
    let bestDistance = Infinity;

    for (const block of blocks) {
        if (!block || block.destroyed) continue;
        const closestX = clamp(projectile.x, block.x, block.x + block.width);
        const closestY = clamp(projectile.y, block.y, block.y + block.height);
        const dx = projectile.x - closestX;
        const dy = projectile.y - closestY;
        const distanceSq = dx * dx + dy * dy;
        if (distanceSq > radius * radius || distanceSq >= bestDistance) continue;
        best = block;
        bestDistance = distanceSq;
    }

    return best;
}

export function applyCastleExplosionDamage(blocks, x, y, weapon) {
    const radius = Math.max(1, Number(weapon?.damageRadius ?? weapon?.explosionRadius) || 1);
    const maxDamage = Math.max(0, Number(weapon?.maxDamage ?? weapon?.damage) || 0);
    const falloffPower = Math.max(0.1, Number(weapon?.damageFalloff) || 1.2);
    const summary = {
        blocksDamaged: 0,
        blocksDestroyed: 0,
        destroyedCore: false,
        objectiveComplete: false,
        totalDamage: 0,
    };

    if (!Array.isArray(blocks) || maxDamage <= 0) {
        summary.objectiveComplete = isCastleObjectiveComplete(blocks, { targetTag: 'castle_core' });
        return summary;
    }

    for (const block of blocks) {
        if (!block || block.destroyed) continue;
        const centerX = block.x + block.width / 2;
        const centerY = block.y + block.height / 2;
        const dx = centerX - x;
        const dy = centerY - y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const directHit = x >= block.x && x <= block.x + block.width && y >= block.y && y <= block.y + block.height;
        if (distance > radius && !directHit) continue;

        const material = CASTLE_MATERIALS[block.material] || CASTLE_MATERIALS.wood;
        const effectiveDistance = directHit ? Math.min(distance, radius * 0.18) : distance;
        const normalized = clamp(1 - effectiveDistance / radius, 0, 1);
        const rawDamage = maxDamage * Math.pow(normalized, falloffPower) * material.damageMultiplier;
        const damage = Math.max(1, Math.round(rawDamage));
        const before = block.hp;
        block.hp = Math.max(0, block.hp - damage);
        const actual = before - block.hp;
        if (actual <= 0) continue;

        summary.blocksDamaged += 1;
        summary.totalDamage += actual;
        if (block.hp <= 0) {
            block.destroyed = true;
            summary.blocksDestroyed += 1;
            if (hasObjectiveTag(block, 'castle_core')) summary.destroyedCore = true;
        }
    }

    summary.objectiveComplete = isCastleObjectiveComplete(blocks, { targetTag: 'castle_core' });
    return summary;
}

export function isCastleObjectiveComplete(blocks, objective) {
    const tag = objective?.targetTag || 'castle_core';
    const objectiveBlocks = Array.isArray(blocks)
        ? blocks.filter((block) => block && hasObjectiveTag(block, tag))
        : [];
    return objectiveBlocks.length > 0 && objectiveBlocks.every((block) => block.destroyed);
}

export function getCastleObjectiveHealth(blocks, objective) {
    const tag = objective?.targetTag || 'castle_core';
    const objectiveBlocks = Array.isArray(blocks)
        ? blocks.filter((block) => block && hasObjectiveTag(block, tag))
        : [];
    const maxHp = objectiveBlocks.reduce((total, block) => total + Math.max(0, block.maxHp || 0), 0);
    const hp = objectiveBlocks.reduce((total, block) => total + (block.destroyed ? 0 : Math.max(0, block.hp || 0)), 0);
    return {
        hp,
        maxHp,
        percent: maxHp > 0 ? hp / maxHp : 0,
    };
}

function hasObjectiveTag(block, tag) {
    return block.type === tag || (Array.isArray(block.tags) && block.tags.includes(tag));
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}
