import { colorWithAlpha } from './visualAssets.js';

export class BackgroundRenderer {
    draw(ctx, width, height, theme, time = 0) {
        this._drawSky(ctx, width, height, theme);
        this._drawSun(ctx, width, height, theme, time);
        this._drawRidges(ctx, width, height, theme, time);
        this._drawAtmosphere(ctx, width, height, theme, time);
    }

    _drawSky(ctx, width, height, theme) {
        const sky = ctx.createLinearGradient(0, 0, 0, height);
        sky.addColorStop(0, theme.sky[0]);
        sky.addColorStop(0.58, theme.sky[1]);
        sky.addColorStop(1, theme.sky[2]);
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, width, height);

        const horizon = ctx.createLinearGradient(0, height * 0.42, 0, height * 0.72);
        horizon.addColorStop(0, 'rgba(255, 255, 255, 0)');
        horizon.addColorStop(1, theme.haze);
        ctx.fillStyle = horizon;
        ctx.fillRect(0, height * 0.42, width, height * 0.32);
    }

    _drawSun(ctx, width, height, theme, time) {
        const isDesert = theme.id === 'desert';
        const x = width * (isDesert ? 0.76 : 0.82);
        const y = height * (theme.id === 'snow' ? 0.18 : 0.16);
        const radius = theme.id === 'desert' ? 46 : 38;

        ctx.save();
        const glow = ctx.createRadialGradient(x, y, 0, x, y, radius * 2.4);
        glow.addColorStop(0, colorWithAlpha(theme.sun, 0.6));
        glow.addColorStop(1, 'rgba(255, 245, 190, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x, y, radius * 2.4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = theme.sun;
        ctx.beginPath();
        ctx.arc(x + Math.sin(time * 0.08) * 2, y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    _drawRidges(ctx, width, height, theme, time) {
        drawRidge(ctx, width, height, {
            baseY: height * 0.52,
            amp: theme.id === 'snow' ? 62 : 36,
            color: colorWithAlpha(theme.far, 0.62),
            seed: 0.7,
            step: 92,
            drift: Math.sin(time * 0.018) * 7,
            jagged: theme.id === 'snow',
        });
        drawRidge(ctx, width, height, {
            baseY: height * 0.61,
            amp: theme.id === 'desert' ? 70 : 48,
            color: colorWithAlpha(theme.mid, 0.78),
            seed: 1.9,
            step: theme.id === 'desert' ? 82 : 118,
            drift: Math.sin(time * 0.014 + 1.4) * 4,
            jagged: theme.id !== 'green',
        });
        drawRidge(ctx, width, height, {
            baseY: height * 0.70,
            amp: theme.id === 'green' ? 38 : 54,
            color: colorWithAlpha(theme.near, 0.56),
            seed: 3.4,
            step: 132,
            drift: 0,
            jagged: theme.id === 'desert',
        });
    }

    _drawAtmosphere(ctx, width, height, theme, time) {
        if (theme.particles === 'clouds') {
            drawCloud(ctx, width * 0.16 + (time * 6) % (width * 0.08), height * 0.17, 1.15, theme.cloud);
            drawCloud(ctx, width * 0.43 + Math.sin(time * 0.06) * 12, height * 0.12, 0.82, theme.cloud);
            drawCloud(ctx, width * 0.66 - (time * 4) % (width * 0.06), height * 0.25, 0.95, theme.cloud);
            return;
        }

        if (theme.particles === 'dust') {
            ctx.save();
            ctx.fillStyle = 'rgba(118, 77, 44, 0.12)';
            for (let i = 0; i < 22; i++) {
                const x = ((i * 97 + time * 18) % (width + 90)) - 45;
                const y = height * (0.28 + seededNoise(i, 4) * 0.35);
                const r = 2 + seededNoise(i, 9) * 4;
                ctx.beginPath();
                ctx.ellipse(x, y + Math.sin(time * 0.8 + i) * 3, r * 2.4, r, 0, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
            return;
        }

        if (theme.particles === 'snow') {
            ctx.save();
            ctx.fillStyle = 'rgba(255, 255, 255, 0.52)';
            for (let i = 0; i < 36; i++) {
                const x = (i * 43 + time * (10 + seededNoise(i, 6) * 15)) % width;
                const y = (height * 0.05 + i * 31 + time * (7 + seededNoise(i, 7) * 10)) % (height * 0.62);
                const r = 0.9 + seededNoise(i, 11) * 1.2;
                ctx.beginPath();
                ctx.arc(x, y, r, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        }
    }
}

function drawRidge(ctx, width, height, { baseY, amp, color, seed, step, drift, jagged }) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(-40, height);
    ctx.lineTo(-40, baseY);
    for (let x = -40; x <= width + 80; x += step) {
        const noise = seededNoise(Math.floor(x / step) + seed * 13, seed);
        const peak = baseY - amp * (0.35 + noise * 0.9);
        const nextX = x + step * 0.52 + drift;
        if (jagged) {
            ctx.lineTo(nextX - step * 0.25, baseY - amp * 0.24);
            ctx.lineTo(nextX, peak);
            ctx.lineTo(nextX + step * 0.25, baseY - amp * 0.2);
        } else {
            ctx.quadraticCurveTo(x + step * 0.28 + drift, peak, x + step + drift, baseY - amp * 0.2);
        }
    }
    ctx.lineTo(width + 80, height);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
}

function drawCloud(ctx, x, y, scale, color) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x - 30 * scale, y + 9 * scale, 17 * scale, 0, Math.PI * 2);
    ctx.arc(x - 9 * scale, y, 25 * scale, 0, Math.PI * 2);
    ctx.arc(x + 18 * scale, y + 8 * scale, 18 * scale, 0, Math.PI * 2);
    ctx.arc(x + 38 * scale, y + 12 * scale, 13 * scale, 0, Math.PI * 2);
    ctx.rect(x - 35 * scale, y + 8 * scale, 76 * scale, 16 * scale);
    ctx.fill();
    ctx.restore();
}

function seededNoise(i, salt) {
    const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
    return x - Math.floor(x);
}
