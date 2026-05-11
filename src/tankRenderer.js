import { CONFIG, clamp } from './config.js';
import { colorWithAlpha, getTreadSprite, roundRect, shadeColor } from './visualAssets.js';

const MAX_TILT = 16 * Math.PI / 180;

export function drawTank(ctx, tank, { terrain = null, time = 0 } = {}) {
    const tilt = terrain ? tankTerrainTilt(tank, terrain) : 0;
    const healthRatio = clamp(tank.health / CONFIG.tank.maxHealth, 0, 1);
    const fireT = tank.recoilDuration > 0 ? clamp(tank.recoilTimer / tank.recoilDuration, 0, 1) : 0;
    const recoil = Math.sin(fireT * Math.PI) * 1;
    const aimRad = tank.angle * Math.PI / 180;
    const aim = {
        x: Math.cos(aimRad) * tank.facing,
        y: -Math.sin(aimRad),
    };
    const bodyNudge = {
        x: -aim.x * recoil * 2.6,
        y: -aim.y * recoil * 0.8,
    };
    const baseX = tank.x + bodyNudge.x;
    const baseY = tank.y + bodyNudge.y;

    ctx.save();
    drawGroundShadow(ctx, tank, baseX, baseY, tilt);
    drawParachute(ctx, tank, time);
    drawBodyStack(ctx, tank, baseX, baseY, tilt, healthRatio);
    const turret = turretCenter(tank, baseX, baseY, tilt);
    drawTurretAndCannon(ctx, tank, turret, aim, recoil, healthRatio);
    drawDamageDetails(ctx, tank, turret, time, healthRatio);
    drawShield(ctx, tank, tilt, time);
    ctx.restore();
}

export function drawTankWreck(ctx, tank, { terrain = null, time = 0 } = {}) {
    const tilt = terrain ? tankTerrainTilt(tank, terrain) * 0.78 : -0.08 * tank.facing;
    const smokeTime = tank.wreckSmokeTime || time;

    ctx.save();
    drawGroundShadow(ctx, tank, tank.x, tank.y, tilt, 0.36);

    for (let i = 0; i < 7; i++) {
        const cycle = (smokeTime * 0.28 + i * 0.19 + (tank.wreckSeed || 0) * 0.017) % 1;
        const rise = 16 + cycle * 72;
        const drift = Math.sin(smokeTime * 1.05 + i * 1.7 + (tank.wreckSeed || 0)) * (6 + cycle * 13);
        const alpha = (1 - cycle) * 0.27;
        const radius = 8 + cycle * 20;
        ctx.fillStyle = `rgba(34, 33, 31, ${alpha})`;
        ctx.beginPath();
        ctx.ellipse(tank.x + drift, tank.y - tank.height - rise, radius * 1.28, radius, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.translate(tank.x, tank.y - tank.height / 2);
    ctx.rotate(tilt);

    const w = tank.width;
    const h = tank.height;
    const charred = ctx.createLinearGradient(0, -h, 0, h);
    charred.addColorStop(0, '#343130');
    charred.addColorStop(0.5, '#17191a');
    charred.addColorStop(1, '#070809');

    ctx.fillStyle = '#101216';
    roundRect(ctx, -w / 2 - 6, h / 2 - 8, w + 12, 9, 4);
    ctx.fill();

    ctx.fillStyle = charred;
    ctx.beginPath();
    ctx.moveTo(-w / 2 - 3, 1);
    ctx.lineTo(-w / 2 + 8, -h / 2 - 6);
    ctx.lineTo(w / 2 - 4, -h / 2 - 4);
    ctx.lineTo(w / 2 + 4, h / 2 - 1);
    ctx.lineTo(w / 2 - 8, h / 2 + 5);
    ctx.lineTo(-w / 2 + 4, h / 2 + 4);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 89, 38, 0.42)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-w * 0.32, -2);
    ctx.lineTo(-w * 0.14, 7);
    ctx.lineTo(2, 0);
    ctx.lineTo(w * 0.22, 8);
    ctx.stroke();

    ctx.fillStyle = '#111315';
    ctx.beginPath();
    ctx.arc(-3, -h / 2 - 6, 11, Math.PI, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#0b0d0f';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(3, -h / 2 - 7);
    ctx.lineTo(22 * tank.facing, -h / 2 + 8);
    ctx.stroke();

    ctx.fillStyle = 'rgba(255, 92, 28, 0.58)';
    ctx.beginPath();
    ctx.arc(-w * 0.25, h * 0.16, 3.2, 0, Math.PI * 2);
    ctx.arc(w * 0.24, h * 0.02, 2.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

function drawBodyStack(ctx, tank, baseX, baseY, tilt, healthRatio) {
    const w = tank.width;
    const h = tank.height;
    const accent = tank.color;

    ctx.save();
    ctx.translate(baseX, baseY - h / 2);
    ctx.rotate(tilt);

    const tread = getTreadSprite(accent);
    ctx.drawImage(tread, -w / 2 - 9, h / 2 - 14, w + 18, 22);

    const lower = ctx.createLinearGradient(0, -h / 2, 0, h / 2 + 6);
    lower.addColorStop(0, shadeColor(accent, -28));
    lower.addColorStop(1, shadeColor(accent, -52));
    ctx.fillStyle = lower;
    ctx.beginPath();
    ctx.moveTo(-w / 2 - 1, h / 2 - 5);
    ctx.lineTo(w / 2 + 1, h / 2 - 6);
    ctx.lineTo(w / 2 - 4, h / 2 + 3);
    ctx.lineTo(-w / 2 + 4, h / 2 + 4);
    ctx.closePath();
    ctx.fill();

    const hull = ctx.createLinearGradient(0, -h / 2 - 8, 0, h / 2);
    hull.addColorStop(0, shadeColor(accent, 24));
    hull.addColorStop(0.42, accent);
    hull.addColorStop(1, shadeColor(accent, -24));
    ctx.fillStyle = hull;
    ctx.beginPath();
    ctx.moveTo(-w / 2 - 4, -1);
    ctx.lineTo(-w / 2 + 8, -h / 2 - 7);
    ctx.lineTo(w / 2 - 7, -h / 2 - 6);
    ctx.lineTo(w / 2 + 4, -1);
    ctx.lineTo(w / 2 - 1, h / 2 - 4);
    ctx.lineTo(-w / 2 + 1, h / 2 - 3);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(15, 18, 20, 0.58)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
    roundRect(ctx, -w / 2 + 8, -h / 2 - 4, w - 16, 4, 2);
    ctx.fill();

    ctx.fillStyle = colorWithAlpha(shadeColor(accent, -36), 0.56);
    roundRect(ctx, -w / 2 + 6, -1, w - 12, 5, 2);
    ctx.fill();

    ctx.fillStyle = colorWithAlpha('#ffffff', 0.18);
    ctx.beginPath();
    ctx.moveTo(-w * 0.28, -h / 2 - 4);
    ctx.lineTo(-w * 0.02, -h / 2 - 5);
    ctx.lineTo(-w * 0.12, -1);
    ctx.lineTo(-w * 0.39, -1);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = colorWithAlpha(accent, 0.72);
    roundRect(ctx, w * 0.08, -h / 2 - 3, w * 0.28, 5, 2);
    ctx.fill();

    if (healthRatio < 0.72) {
        ctx.strokeStyle = 'rgba(37, 33, 31, 0.54)';
        ctx.lineWidth = 1.5;
        drawScratch(ctx, -w * 0.26, -h * 0.22, 10, -4);
        drawScratch(ctx, w * 0.18, h * 0.02, 8, 5);
    }
    if (healthRatio < 0.38) {
        ctx.fillStyle = 'rgba(30, 26, 24, 0.34)';
        ctx.beginPath();
        ctx.ellipse(w * 0.25, h * 0.04, 9, 5, -0.15, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.restore();
}

function drawTurretAndCannon(ctx, tank, turret, aim, recoil, healthRatio) {
    const turretR = 11.5;
    const barrelLength = tank.barrelLength - recoil * 10;
    const barrelStart = {
        x: turret.x + aim.x * 4,
        y: turret.y + aim.y * 4,
    };
    const muzzle = {
        x: turret.x + aim.x * barrelLength,
        y: turret.y + aim.y * barrelLength,
    };

    ctx.save();
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#101317';
    ctx.lineWidth = tank.barrelThickness + 3;
    ctx.beginPath();
    ctx.moveTo(barrelStart.x, barrelStart.y);
    ctx.lineTo(muzzle.x, muzzle.y);
    ctx.stroke();

    const barrelGradient = ctx.createLinearGradient(barrelStart.x, barrelStart.y - 6, muzzle.x, muzzle.y + 6);
    barrelGradient.addColorStop(0, '#3e4750');
    barrelGradient.addColorStop(0.55, '#252b31');
    barrelGradient.addColorStop(1, '#11161c');
    ctx.strokeStyle = barrelGradient;
    ctx.lineWidth = tank.barrelThickness;
    ctx.beginPath();
    ctx.moveTo(barrelStart.x, barrelStart.y);
    ctx.lineTo(muzzle.x, muzzle.y);
    ctx.stroke();

    ctx.fillStyle = '#0f1419';
    ctx.beginPath();
    ctx.arc(muzzle.x, muzzle.y, 3.5, 0, Math.PI * 2);
    ctx.fill();

    const turretGradient = ctx.createRadialGradient(turret.x - 5, turret.y - 6, 2, turret.x, turret.y, turretR + 5);
    turretGradient.addColorStop(0, shadeColor(tank.color, 30));
    turretGradient.addColorStop(0.55, shadeColor(tank.color, -10));
    turretGradient.addColorStop(1, shadeColor(tank.color, -44));
    ctx.fillStyle = turretGradient;
    ctx.beginPath();
    ctx.arc(turret.x, turret.y, turretR, Math.PI, Math.PI * 2);
    ctx.lineTo(turret.x + turretR * 0.78, turret.y + 4);
    ctx.lineTo(turret.x - turretR * 0.78, turret.y + 4);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(12, 15, 18, 0.58)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = colorWithAlpha('#ffffff', healthRatio > 0.38 ? 0.18 : 0.08);
    ctx.beginPath();
    ctx.arc(turret.x - 4, turret.y - 5, 3, 0, Math.PI * 2);
    ctx.fill();

    if (tank.muzzleFlashTimer > 0) {
        drawMuzzleFlash(ctx, muzzle, aim, tank.muzzleFlashTimer / tank.muzzleFlashDuration, tank.fireSeed || 0);
    }

    ctx.restore();
}

function drawMuzzleFlash(ctx, muzzle, aim, k, seed) {
    const alpha = clamp(k, 0, 1);
    const size = 11 + alpha * 16;
    const perp = { x: -aim.y, y: aim.x };

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const tip = {
        x: muzzle.x + aim.x * size,
        y: muzzle.y + aim.y * size,
    };
    ctx.fillStyle = `rgba(255, 246, 180, ${0.92 * alpha})`;
    ctx.beginPath();
    ctx.moveTo(muzzle.x + perp.x * 4, muzzle.y + perp.y * 4);
    ctx.lineTo(tip.x + Math.sin(seed) * 2, tip.y + Math.cos(seed) * 2);
    ctx.lineTo(muzzle.x - perp.x * 4, muzzle.y - perp.y * 4);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = `rgba(255, 112, 34, ${0.62 * alpha})`;
    ctx.beginPath();
    ctx.ellipse(muzzle.x + aim.x * 8, muzzle.y + aim.y * 8, size * 0.72, size * 0.32, Math.atan2(aim.y, aim.x), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

function drawDamageDetails(ctx, tank, turret, time, healthRatio) {
    if (healthRatio >= 0.55) return;
    const smokeCount = healthRatio < 0.28 ? 5 : 3;
    ctx.save();
    for (let i = 0; i < smokeCount; i++) {
        const cycle = (time * (0.18 + i * 0.015) + i * 0.24 + (tank.wreckSeed || 0) * 0.011) % 1;
        const rise = 10 + cycle * (healthRatio < 0.28 ? 46 : 30);
        const drift = Math.sin(time * 1.1 + i * 2.2 + tank.wreckSeed) * (4 + cycle * 8);
        const alpha = (1 - cycle) * (healthRatio < 0.28 ? 0.24 : 0.13);
        const r = 5 + cycle * (healthRatio < 0.28 ? 15 : 10);
        ctx.fillStyle = `rgba(45, 43, 39, ${alpha})`;
        ctx.beginPath();
        ctx.ellipse(turret.x + drift, turret.y - rise, r * 1.22, r, 0, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();
}

function drawShield(ctx, tank, tilt, time) {
    const chargeRatio = clamp(tank.shieldCharge / CONFIG.utilities.shieldMaxCharge, 0, 1);
    const flashRatio = tank.shieldFlashTimer > 0 ? clamp(tank.shieldFlashTimer / 0.45, 0, 1) : 0;
    const breakRatio = tank.shieldBreakTimer > 0 ? clamp(tank.shieldBreakTimer / 0.78, 0, 1) : 0;
    if (chargeRatio <= 0 && flashRatio <= 0 && breakRatio <= 0) return;

    const pulse = (Math.sin(time * 4.8 + tank.id * 1.7) + 1) * 0.5;
    const shimmer = time * 2.4 + tank.id * 0.73;
    const activeAlpha = chargeRatio > 0 ? 0.42 + chargeRatio * 0.24 + pulse * 0.08 : 0;
    const flashAlpha = flashRatio * 0.42;
    const breakAlpha = breakRatio * 0.58;
    const rimAlpha = clamp(activeAlpha + flashAlpha + breakAlpha * 0.35, 0, 1);
    const innerAlpha = clamp(0.5 + activeAlpha * 0.38 + flashAlpha, 0, 1);
    const rx = tank.width / 2 + 23 + pulse * 1.8 + breakAlpha * 9;
    const ry = tank.height + 22 + pulse * 2.4 + breakAlpha * 10;

    ctx.save();
    ctx.translate(tank.x, tank.y - tank.height / 2);
    ctx.rotate(tilt * 0.35);

    if (chargeRatio > 0) {
        const fill = ctx.createRadialGradient(-rx * 0.18, -ry * 0.18, ry * 0.12, 0, 0, ry * 1.05);
        fill.addColorStop(0, `rgba(255, 255, 255, ${0.09 + chargeRatio * 0.04})`);
        fill.addColorStop(0.58, `rgba(104, 234, 255, ${0.10 + chargeRatio * 0.05})`);
        fill.addColorStop(1, 'rgba(64, 178, 255, 0.02)');
        ctx.fillStyle = fill;
        ctx.beginPath();
        ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowColor = `rgba(70, 224, 255, ${0.6 + flashRatio * 0.25})`;
    ctx.shadowBlur = 14 + flashRatio * 12 + chargeRatio * 7;
    ctx.strokeStyle = `rgba(28, 58, 66, ${0.5 + activeAlpha * 0.4 + breakAlpha * 0.25})`;
    ctx.lineWidth = 8 + flashRatio * 2 + breakAlpha * 4;
    ctx.beginPath();
    ctx.ellipse(0, 0, rx + 1, ry + 1, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.shadowBlur = 9 + flashRatio * 10;
    ctx.strokeStyle = `rgba(103, 239, 255, ${rimAlpha})`;
    ctx.lineWidth = 4.4 + chargeRatio * 1.3 + flashRatio * 2.4;
    ctx.beginPath();
    ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.shadowBlur = 4;
    ctx.strokeStyle = `rgba(255, 255, 255, ${innerAlpha})`;
    ctx.lineWidth = 1.4 + flashRatio * 0.8;
    ctx.beginPath();
    ctx.ellipse(0, 0, rx - 4, ry - 4, 0, 0, Math.PI * 2);
    ctx.stroke();

    if (chargeRatio > 0) {
        for (let i = 0; i < 4; i++) {
            const start = shimmer + i * Math.PI * 0.62;
            const length = 0.34 + chargeRatio * 0.12;
            ctx.strokeStyle = i % 2 === 0
                ? `rgba(255, 255, 255, ${0.34 + pulse * 0.18})`
                : `rgba(137, 247, 255, ${0.28 + pulse * 0.16})`;
            ctx.lineWidth = 2 + chargeRatio * 0.8;
            drawEllipseArc(ctx, rx + 2, ry + 2, start, start + length);
        }

        ctx.fillStyle = `rgba(245, 255, 255, ${0.48 + pulse * 0.18})`;
        for (let i = 0; i < 5; i++) {
            const angle = -shimmer * 0.65 + i * Math.PI * 0.76;
            const sparkAlpha = 0.25 + ((Math.sin(time * 5 + i * 1.9) + 1) * 0.18);
            ctx.globalAlpha = sparkAlpha;
            ctx.beginPath();
            ctx.arc(Math.cos(angle) * (rx + 1), Math.sin(angle) * (ry + 1), 1.5 + chargeRatio * 0.8, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
    }

    if (breakRatio > 0) {
        drawShieldBreakBurst(ctx, rx, ry, 1 - breakRatio, breakAlpha, tank.id);
    }

    ctx.restore();
}

function drawEllipseArc(ctx, rx, ry, start, end) {
    const steps = 12;
    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
        const t = start + (end - start) * (i / steps);
        const x = Math.cos(t) * rx;
        const y = Math.sin(t) * ry;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.stroke();
}

function drawShieldBreakBurst(ctx, rx, ry, progress, alpha, seed) {
    const burst = clamp(progress, 0, 1);
    ctx.save();
    ctx.shadowColor = `rgba(255, 255, 255, ${alpha})`;
    ctx.shadowBlur = 18;
    ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.lineWidth = 2.4;
    for (let i = 0; i < 10; i++) {
        const angle = i * Math.PI * 0.2 + Math.sin(seed * 1.3 + i) * 0.08;
        const inner = 0.92 + burst * 0.12;
        const outer = 1.06 + burst * 0.46;
        ctx.beginPath();
        ctx.moveTo(Math.cos(angle) * rx * inner, Math.sin(angle) * ry * inner);
        ctx.lineTo(Math.cos(angle) * rx * outer, Math.sin(angle) * ry * outer);
        ctx.stroke();
    }

    ctx.strokeStyle = `rgba(116, 237, 255, ${alpha * 0.82})`;
    ctx.lineWidth = 3 + burst * 2;
    ctx.beginPath();
    ctx.ellipse(0, 0, rx + burst * 14, ry + burst * 14, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
}

function drawParachute(ctx, tank, time) {
    if (!tank.parachuteTimer || tank.parachuteTimer <= 0) return;
    const k = clamp(tank.parachuteTimer / 1.35, 0, 1);
    const alpha = Math.min(1, k * 1.4);
    const sway = Math.sin(time * 7 + (tank.parachuteSeed || 0)) * 4;
    const canopyY = tank.y - tank.height - 54 - (1 - k) * 8;
    const canopyW = 54;
    const canopyH = 26;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = 'rgba(250, 242, 220, 0.78)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(tank.x - canopyW * 0.34 + sway, canopyY + canopyH * 0.40);
    ctx.lineTo(tank.x - 9, tank.y - tank.height - 5);
    ctx.moveTo(tank.x + sway, canopyY + canopyH * 0.46);
    ctx.lineTo(tank.x, tank.y - tank.height - 3);
    ctx.moveTo(tank.x + canopyW * 0.34 + sway, canopyY + canopyH * 0.40);
    ctx.lineTo(tank.x + 9, tank.y - tank.height - 5);
    ctx.stroke();

    const gradient = ctx.createLinearGradient(tank.x, canopyY - canopyH * 0.35, tank.x, canopyY + canopyH);
    gradient.addColorStop(0, '#fff5d6');
    gradient.addColorStop(0.55, '#e2b46e');
    gradient.addColorStop(1, '#9b6637');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(tank.x - canopyW / 2 + sway, canopyY + canopyH * 0.36);
    ctx.quadraticCurveTo(tank.x - canopyW * 0.26 + sway, canopyY - canopyH * 0.54, tank.x + sway, canopyY - canopyH * 0.48);
    ctx.quadraticCurveTo(tank.x + canopyW * 0.26 + sway, canopyY - canopyH * 0.54, tank.x + canopyW / 2 + sway, canopyY + canopyH * 0.36);
    ctx.quadraticCurveTo(tank.x + canopyW * 0.18 + sway, canopyY + canopyH * 0.52, tank.x + sway, canopyY + canopyH * 0.38);
    ctx.quadraticCurveTo(tank.x - canopyW * 0.18 + sway, canopyY + canopyH * 0.52, tank.x - canopyW / 2 + sway, canopyY + canopyH * 0.36);
    ctx.fill();
    ctx.strokeStyle = 'rgba(80, 55, 30, 0.36)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
}

function drawGroundShadow(ctx, tank, baseX, baseY, tilt, alpha = 0.25) {
    ctx.save();
    ctx.translate(baseX, baseY + 4);
    ctx.rotate(tilt * 0.35);
    ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
    ctx.beginPath();
    ctx.ellipse(0, 0, tank.width / 2 + 12, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

function turretCenter(tank, baseX, baseY, tilt) {
    const localX = 0;
    const localY = -tank.height - 2;
    return {
        x: baseX + localX * Math.cos(tilt) - localY * Math.sin(tilt),
        y: baseY + localX * Math.sin(tilt) + localY * Math.cos(tilt),
    };
}

function tankTerrainTilt(tank, terrain) {
    const half = Math.max(18, tank.width * 0.45);
    const left = terrain.heightAt(tank.x - half);
    const right = terrain.heightAt(tank.x + half);
    return clamp(Math.atan2(right - left, half * 2), -MAX_TILT, MAX_TILT);
}

function drawScratch(ctx, x, y, w, h) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + w * 0.45, y + h * 0.35);
    ctx.lineTo(x + w, y + h);
    ctx.stroke();
}
