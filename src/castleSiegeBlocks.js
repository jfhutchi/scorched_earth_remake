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

const COLLAPSE_GRAVITY = 860;
const MAX_FALL_SPEED = 760;
const SUPPORT_TOLERANCE = 3;
const MIN_SUPPORT_OVERLAP = 6;
const SUPPORT_OVERLAP_RATIO = 0.45;
const TERRAIN_SAMPLE_COUNT = 5;

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
            supported: true,
            falling: false,
            velocityY: 0,
            lastSupportedY: Number(spec.y) || 0,
            recentImpact: 0,
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
        if (!circleIntersectsRect({ x: projectile.x, y: projectile.y, radius }, block)) continue;
        const distanceSq = distanceSqToRect(projectile.x, projectile.y, block);
        if (distanceSq >= bestDistance) continue;
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
        const impact = applyImpactDamageToBlock(block, damage);
        const actual = impact.damage;
        if (actual <= 0) continue;

        summary.blocksDamaged += 1;
        summary.totalDamage += actual;
        if (impact.destroyed) {
            summary.blocksDestroyed += 1;
            if (impact.destroyedCore) summary.destroyedCore = true;
        }
    }

    summary.objectiveComplete = isCastleObjectiveComplete(blocks, { targetTag: 'castle_core' });
    return summary;
}

export function updateCastleBlockCollapse(blocks, terrain, dt) {
    const summary = {
        blocksFalling: 0,
        blocksSettled: 0,
        blocksDestroyed: 0,
        destroyedCore: false,
        impactDamage: 0,
        changed: false,
        settling: false,
    };

    if (!Array.isArray(blocks) || !terrain || dt <= 0) return summary;
    const safeDt = clamp(Number(dt) || 0, 0, 1 / 20);
    const liveBlocks = blocks.filter((block) => block && !block.destroyed);

    for (const block of liveBlocks) {
        block.recentImpact = Math.max(0, (Number(block.recentImpact) || 0) - safeDt);
    }

    for (const block of liveBlocks) {
        if (block.falling) continue;
        const touchingTerrain = isBlockTouchingTerrain(block, terrain);
        const supporters = findSupportingBlocks(blocks, block);
        const supportedByBlocks = hasEnoughSupport(block, supporters);

        if (touchingTerrain || supportedByBlocks) {
            block.supported = true;
            block.velocityY = 0;
            block.lastSupportedY = block.y;
            continue;
        }

        block.supported = false;
        block.falling = true;
        block.velocityY = Math.max(0, Number(block.velocityY) || 0);
        summary.changed = true;
    }

    const fallingBlocks = liveBlocks
        .filter((block) => block.falling)
        .sort((a, b) => blockBottom(b) - blockBottom(a));

    for (const block of fallingBlocks) {
        if (block.destroyed) continue;
        const previousBottom = blockBottom(block);
        block.velocityY = clamp((Number(block.velocityY) || 0) + COLLAPSE_GRAVITY * safeDt, 0, MAX_FALL_SPEED);
        const nextY = block.y + block.velocityY * safeDt;
        const nextBottom = nextY + block.height;
        const surfaceY = findFallSurfaceY(block, blocks, terrain, previousBottom, nextBottom);

        if (surfaceY !== null) {
            const impactSpeed = block.velocityY;
            block.y = surfaceY - block.height;
            block.velocityY = 0;
            block.falling = false;
            block.supported = true;
            block.lastSupportedY = block.y;
            block.recentImpact = 0.42;
            summary.blocksSettled += 1;
            summary.changed = true;

            const impactDamage = collapseImpactDamage(impactSpeed);
            if (impactDamage > 0) {
                const impact = applyImpactDamageToBlock(block, impactDamage);
                summary.impactDamage += impact.damage;
                if (impact.destroyed) {
                    summary.blocksDestroyed += 1;
                    if (impact.destroyedCore) summary.destroyedCore = true;
                }
            }
            continue;
        }

        block.y = nextY;
        block.supported = false;
        summary.blocksFalling += 1;
        summary.changed = true;
    }

    summary.settling = blocks.some((block) => block && !block.destroyed && block.falling);
    return summary;
}

export function findSupportingBlocks(blocks, block) {
    if (!Array.isArray(blocks) || !block || block.destroyed) return [];
    const bottom = blockBottom(block);
    return blocks.filter((candidate) => {
        if (!candidate || candidate === block || candidate.destroyed || candidate.falling) return false;
        if (Math.abs(blockTop(candidate) - bottom) > SUPPORT_TOLERANCE) return false;
        return horizontalOverlapWidth(block, candidate) >= MIN_SUPPORT_OVERLAP;
    });
}

export function isBlockTouchingTerrain(block, terrain) {
    const surfaceY = terrainSurfaceY(block, terrain);
    if (surfaceY === null) return false;
    return blockBottom(block) >= surfaceY - SUPPORT_TOLERANCE;
}

export function applyImpactDamageToBlock(block, amount) {
    const damage = Math.max(0, Math.round(Number(amount) || 0));
    if (!block || block.destroyed || damage <= 0) {
        return { damage: 0, destroyed: false, destroyedCore: false };
    }

    const before = Math.max(0, Number(block.hp) || 0);
    block.hp = Math.max(0, before - damage);
    block.recentImpact = 0.45;
    const actual = before - block.hp;
    const destroyed = block.hp <= 0;
    if (destroyed) {
        block.destroyed = true;
        block.falling = false;
        block.supported = false;
        block.velocityY = 0;
    }

    return {
        damage: actual,
        destroyed,
        destroyedCore: destroyed && hasObjectiveTag(block, 'castle_core'),
    };
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

export function blockLeft(block) {
    return Number(block?.x) || 0;
}

export function blockRight(block) {
    return blockLeft(block) + (Number(block?.width) || 0);
}

export function blockTop(block) {
    return Number(block?.y) || 0;
}

export function blockBottom(block) {
    return blockTop(block) + (Number(block?.height) || 0);
}

export function rectsOverlap(a, b) {
    if (!a || !b) return false;
    return blockLeft(a) < blockRight(b)
        && blockRight(a) > blockLeft(b)
        && blockTop(a) < blockBottom(b)
        && blockBottom(a) > blockTop(b);
}

export function circleIntersectsRect(circle, rect) {
    if (!circle || !rect) return false;
    const radius = Math.max(0, Number(circle.radius) || 0);
    return distanceSqToRect(circle.x, circle.y, rect) <= radius * radius;
}

function hasObjectiveTag(block, tag) {
    return block.type === tag || (Array.isArray(block.tags) && block.tags.includes(tag));
}

function findFallSurfaceY(block, blocks, terrain, previousBottom, nextBottom) {
    const surfaces = [];
    const terrainY = terrainSurfaceY(block, terrain);
    if (terrainY !== null && terrainY >= previousBottom - SUPPORT_TOLERANCE && terrainY <= nextBottom + SUPPORT_TOLERANCE) {
        surfaces.push({ y: terrainY, type: 'terrain' });
    }

    const candidateBlocks = Array.isArray(blocks)
        ? blocks.filter((candidate) => {
            if (!candidate || candidate === block || candidate.destroyed || candidate.falling) return false;
            const top = blockTop(candidate);
            if (top < previousBottom - SUPPORT_TOLERANCE || top > nextBottom + SUPPORT_TOLERANCE) return false;
            return horizontalOverlapWidth(block, candidate) >= MIN_SUPPORT_OVERLAP;
        })
        : [];
    const surfaceYs = [...new Set(candidateBlocks.map((candidate) => Math.round(blockTop(candidate))))];
    for (const surfaceY of surfaceYs) {
        const supporters = candidateBlocks.filter((candidate) => Math.abs(blockTop(candidate) - surfaceY) <= SUPPORT_TOLERANCE);
        if (hasEnoughSupport(block, supporters)) surfaces.push({ y: surfaceY, type: 'block' });
    }

    if (!surfaces.length) return null;
    surfaces.sort((a, b) => a.y - b.y);
    return surfaces[0].y;
}

function terrainSurfaceY(block, terrain) {
    if (!block || !terrain || typeof terrain.heightAt !== 'function') return null;
    const left = blockLeft(block) + 2;
    const right = blockRight(block) - 2;
    let surfaceY = Infinity;
    for (let i = 0; i < TERRAIN_SAMPLE_COUNT; i++) {
        const t = TERRAIN_SAMPLE_COUNT === 1 ? 0.5 : i / (TERRAIN_SAMPLE_COUNT - 1);
        const x = clamp(left + (right - left) * t, 0, terrain.width - 1);
        surfaceY = Math.min(surfaceY, terrain.heightAt(x));
    }
    return Number.isFinite(surfaceY) ? surfaceY : null;
}

function hasEnoughSupport(block, supporters) {
    if (!Array.isArray(supporters) || !supporters.length) return false;
    const overlap = supporters.reduce((total, supporter) => total + horizontalOverlapWidth(block, supporter), 0);
    return overlap >= requiredSupportOverlap(block);
}

function requiredSupportOverlap(block) {
    return Math.max(MIN_SUPPORT_OVERLAP, (Number(block?.width) || 0) * SUPPORT_OVERLAP_RATIO);
}

function horizontalOverlapWidth(a, b) {
    return Math.max(0, Math.min(blockRight(a), blockRight(b)) - Math.max(blockLeft(a), blockLeft(b)));
}

function distanceSqToRect(x, y, rect) {
    const px = Number(x) || 0;
    const py = Number(y) || 0;
    const closestX = clamp(px, blockLeft(rect), blockRight(rect));
    const closestY = clamp(py, blockTop(rect), blockBottom(rect));
    const dx = px - closestX;
    const dy = py - closestY;
    return dx * dx + dy * dy;
}

function collapseImpactDamage(speed) {
    const impactSpeed = Math.max(0, Number(speed) || 0);
    if (impactSpeed < 240) return 0;
    return clamp(Math.round((impactSpeed - 220) / 42), 2, 14);
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}
