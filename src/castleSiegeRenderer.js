import { CASTLE_MATERIALS } from './castleSiegeBlocks.js';

export function drawCastleSiegeBlocks(ctx, blocks, visualTime = currentTimeSeconds()) {
    if (!ctx || !Array.isArray(blocks)) return;

    for (const block of blocks) {
        if (!block || block.destroyed) continue;
        drawBlockShadow(ctx, block);
    }

    for (const block of blocks) {
        if (!block || block.destroyed) continue;
        drawBlock(ctx, block, visualTime);
    }
}

export function drawCastleSiegeObjectiveMarker(ctx, siegeState) {
    const core = findCoreBlock(siegeState);
    if (!ctx || !core || core.destroyed) return;

    const time = typeof performance !== 'undefined' ? performance.now() / 1000 : 0;
    const pulse = 0.5 + Math.sin(time * 4.8) * 0.5;
    const cx = core.x + core.width / 2;
    const cy = core.y + core.height / 2;

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = `rgba(128, 238, 255, ${0.34 + pulse * 0.24})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, Math.max(core.width, core.height) * (0.72 + pulse * 0.12), 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.font = '900 13px Georgia, serif';
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'rgba(18, 24, 24, 0.72)';
    ctx.fillStyle = '#d9fbff';
    ctx.strokeText('Core', cx, core.y - 12);
    ctx.fillText('Core', cx, core.y - 12);
    ctx.fillStyle = `rgba(128, 238, 255, ${0.64 + pulse * 0.26})`;
    ctx.beginPath();
    ctx.moveTo(cx, core.y - 8);
    ctx.lineTo(cx - 7, core.y - 21);
    ctx.lineTo(cx + 7, core.y - 21);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
}

export function drawCastleSiegeHudOverlay(ctx, siegeState) {
    if (!ctx || !siegeState) return;
    const summary = typeof siegeState.summary === 'function' ? siegeState.summary() : siegeState;
    const health = summary.objectiveHealth || { hp: 0, maxHp: 0, percent: 0 };
    const canvas = ctx.canvas || { width: 1280, height: 720 };
    const x = 18;
    const y = canvas.height - 118;
    const w = 292;
    const h = 82;

    ctx.save();
    ctx.fillStyle = 'rgba(15, 22, 23, 0.82)';
    ctx.strokeStyle = 'rgba(255, 236, 190, 0.24)';
    ctx.lineWidth = 1;
    ctx.fillRect(x, y, w, h);
    ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);

    ctx.fillStyle = '#ffe49b';
    ctx.font = '900 16px Georgia, serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(summary.levelName || 'Castle Siege', x + 14, y + 12);

    ctx.fillStyle = '#d7cfbb';
    ctx.font = '800 13px Georgia, serif';
    const status = summary.victory ? 'Castle breached' : (summary.failure ? 'Out of shots' : 'Destroy the castle core');
    ctx.fillText(status, x + 14, y + 34);

    ctx.fillStyle = '#9edbe6';
    ctx.fillText(`Shots ${summary.shotsRemaining}/${summary.shotLimit}`, x + 14, y + 56);

    const barX = x + 132;
    const barY = y + 58;
    const barW = 138;
    const barH = 10;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.fillRect(barX, barY, barW, barH);
    ctx.fillStyle = '#73d9e6';
    ctx.fillRect(barX, barY, Math.max(0, Math.min(1, health.percent)) * barW, barH);
    ctx.strokeStyle = 'rgba(255, 236, 190, 0.24)';
    ctx.strokeRect(barX + 0.5, barY + 0.5, barW - 1, barH - 1);

    ctx.fillStyle = '#d9fbff';
    ctx.font = '900 11px Georgia, serif';
    ctx.textAlign = 'right';
    ctx.fillText(`Core ${Math.ceil(health.hp)}/${health.maxHp}`, barX + barW, barY - 14);
    ctx.restore();
}

function drawBlockShadow(ctx, block) {
    ctx.save();
    ctx.fillStyle = 'rgba(16, 20, 20, 0.28)';
    ctx.fillRect(block.x + 4, block.y + 5, block.width, block.height);
    ctx.restore();
}

function drawBlock(ctx, block, visualTime) {
    const material = CASTLE_MATERIALS[block.material] || CASTLE_MATERIALS.wood;
    const damageRatio = block.maxHp > 0 ? 1 - block.hp / block.maxHp : 0;
    const core = isCore(block);

    ctx.save();
    if (block.falling) drawFallStreak(ctx, block);
    if (core) drawCoreGlow(ctx, block, damageRatio, visualTime);

    const gradient = ctx.createLinearGradient(block.x, block.y, block.x, block.y + block.height);
    gradient.addColorStop(0, lighten(material.fill, core ? 36 : 18));
    gradient.addColorStop(0.55, material.fill);
    gradient.addColorStop(1, darken(material.fill, core ? 18 : 24));
    ctx.fillStyle = gradient;
    ctx.fillRect(block.x, block.y, block.width, block.height);

    ctx.strokeStyle = material.stroke;
    ctx.lineWidth = 2;
    ctx.strokeRect(block.x + 1, block.y + 1, block.width - 2, block.height - 2);

    ctx.strokeStyle = core ? 'rgba(225, 255, 255, 0.42)' : 'rgba(255, 235, 178, 0.22)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(block.x + 5, block.y + 5);
    ctx.lineTo(block.x + block.width - 8, block.y + 5);
    ctx.stroke();

    if (block.material === 'wood') drawWoodGrain(ctx, block);
    if (core) drawCrystalFacets(ctx, block);
    if (damageRatio > 0.18) drawCracks(ctx, block, damageRatio);
    if (block.recentImpact > 0) drawRecentImpact(ctx, block);
    ctx.restore();
}

function drawCoreGlow(ctx, block, damageRatio, visualTime) {
    const pulse = 0.55 + Math.sin(visualTime * 5.2) * 0.45;
    const cx = block.x + block.width / 2;
    const cy = block.y + block.height / 2;
    const radius = Math.max(block.width, block.height) * (0.72 + pulse * 0.18);
    const alpha = Math.max(0.18, 0.52 - damageRatio * 0.22);
    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    glow.addColorStop(0, `rgba(150, 245, 255, ${alpha})`);
    glow.addColorStop(1, 'rgba(70, 190, 215, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
}

function drawFallStreak(ctx, block) {
    const speed = Math.min(1, Math.max(0, (block.velocityY || 0) / 620));
    if (speed <= 0.05) return;
    ctx.fillStyle = `rgba(18, 22, 22, ${0.12 + speed * 0.14})`;
    ctx.fillRect(block.x + 3, block.y - 8 - speed * 10, block.width - 6, 8 + speed * 12);
}

function drawRecentImpact(ctx, block) {
    const alpha = Math.min(1, Math.max(0, block.recentImpact / 0.45));
    ctx.strokeStyle = `rgba(255, 238, 176, ${0.25 + alpha * 0.4})`;
    ctx.lineWidth = 2;
    ctx.strokeRect(block.x + 3, block.y + 3, block.width - 6, block.height - 6);
}

function drawWoodGrain(ctx, block) {
    ctx.strokeStyle = 'rgba(68, 36, 20, 0.28)';
    ctx.lineWidth = 1;
    for (let y = block.y + 10; y < block.y + block.height - 5; y += 12) {
        ctx.beginPath();
        ctx.moveTo(block.x + 5, y);
        ctx.lineTo(block.x + block.width - 6, y + Math.sin(y * 0.08) * 2);
        ctx.stroke();
    }
}

function drawCrystalFacets(ctx, block) {
    ctx.strokeStyle = 'rgba(224, 255, 255, 0.5)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(block.x + block.width * 0.48, block.y + 6);
    ctx.lineTo(block.x + block.width * 0.26, block.y + block.height - 8);
    ctx.moveTo(block.x + block.width * 0.52, block.y + 6);
    ctx.lineTo(block.x + block.width * 0.78, block.y + block.height - 10);
    ctx.moveTo(block.x + 8, block.y + block.height * 0.46);
    ctx.lineTo(block.x + block.width - 8, block.y + block.height * 0.42);
    ctx.stroke();
}

function drawCracks(ctx, block, damageRatio) {
    const count = Math.max(1, Math.round(damageRatio * 5));
    ctx.strokeStyle = `rgba(32, 24, 22, ${0.38 + damageRatio * 0.38})`;
    ctx.lineWidth = 1.5;
    const seed = hashId(block.id);
    for (let i = 0; i < count; i++) {
        const sx = block.x + 8 + ((seed + i * 23) % Math.max(1, block.width - 16));
        const sy = block.y + 8 + ((seed + i * 17) % Math.max(1, block.height - 16));
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx + ((i % 2 === 0) ? 12 : -10), sy + 8 + i * 2);
        ctx.lineTo(sx + ((i % 2 === 0) ? 6 : -4), sy + 18 + i);
        ctx.stroke();
    }
}

function findCoreBlock(siegeState) {
    const blocks = siegeState?.blocks || [];
    return blocks.find((block) => block && !block.destroyed && isCore(block)) || null;
}

function isCore(block) {
    return block.type === 'castle_core' || (Array.isArray(block.tags) && block.tags.includes('castle_core'));
}

function hashId(id) {
    const text = String(id || '');
    let hash = 0;
    for (let i = 0; i < text.length; i++) hash = (hash * 31 + text.charCodeAt(i)) % 997;
    return hash;
}

function lighten(hex, amount) {
    return shiftHex(hex, amount);
}

function darken(hex, amount) {
    return shiftHex(hex, -amount);
}

function shiftHex(hex, amount) {
    if (typeof hex !== 'string' || !/^#[0-9a-f]{6}$/i.test(hex)) return hex;
    const value = parseInt(hex.slice(1), 16);
    const r = clamp(((value >> 16) & 255) + amount, 0, 255);
    const g = clamp(((value >> 8) & 255) + amount, 0, 255);
    const b = clamp((value & 255) + amount, 0, 255);
    return `rgb(${r}, ${g}, ${b})`;
}

function currentTimeSeconds() {
    return typeof performance !== 'undefined' ? performance.now() / 1000 : 0;
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}
