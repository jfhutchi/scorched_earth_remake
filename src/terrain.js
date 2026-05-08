import { CONFIG, clamp } from './config.js';

// Terrain is a height map: heights[x] is the top of the ground at canvas x.
// Smaller y is higher terrain because canvas coordinates grow downward.
export class Terrain {
    constructor(width, height, roughness = 'normal') {
        this.width = width;
        this.height = height;
        this.roughness = roughness;
        this.heights = new Float32Array(width);
        this.craters = [];
        this.mounds = [];
        this.color = '#735433';
        this.deepColor = '#4d3524';
        this.grassColor = '#3f9f4d';
        this.generate();
    }

    generate() {
        const profile = CONFIG.terrain.roughness[this.roughness] || CONFIG.terrain.roughness.normal;
        const controlSpacing = 96;
        const controlCount = Math.ceil(this.width / controlSpacing) + 3;
        const controls = [];
        let current = this.height * randomRange(0.57, 0.73);

        for (let i = 0; i < controlCount; i++) {
            current += randomRange(-profile.variation, profile.variation);
            current = clamp(current, this.height * 0.42, this.height * 0.83);
            controls.push(current);
        }

        const wavePhaseA = Math.random() * Math.PI * 2;
        const wavePhaseB = Math.random() * Math.PI * 2;

        for (let x = 0; x < this.width; x++) {
            const scaled = x / controlSpacing;
            const i = Math.floor(scaled);
            const t = smoothstep(scaled - i);
            const base = lerp(controls[i], controls[i + 1], t);
            const rolling = Math.sin(x * 0.008 + wavePhaseA) * profile.rolling;
            const small = Math.sin(x * 0.024 + wavePhaseB) * profile.small;
            this.heights[x] = clamp(base + rolling + small, this.height * 0.34, this.height - 36);
        }

        this._smooth(profile.smoothing);
        this.craters = [];
        this.mounds = [];
    }

    heightAt(x) {
        if (this.width <= 0) return this.height;
        const clamped = clamp(x, 0, this.width - 1);
        const xi = Math.floor(clamped);
        const next = Math.min(this.width - 1, xi + 1);
        const t = clamped - xi;
        return lerp(this.heights[xi], this.heights[next], t);
    }

    slopeAt(x, halfWidth = 14) {
        const left = this.heightAt(x - halfWidth);
        const right = this.heightAt(x + halfWidth);
        return Math.abs(right - left) / Math.max(1, halfWidth * 2);
    }

    findStableSpawn(minRatio, maxRatio, avoidX = null) {
        const minX = Math.floor(this.width * minRatio);
        const maxX = Math.floor(this.width * maxRatio);
        let bestX = Math.floor((minX + maxX) / 2);
        let bestScore = -Infinity;

        for (let x = minX; x <= maxX; x += 4) {
            const ground = this.heightAt(x);
            const slope = this.slopeAt(x, 24);
            const heightScore = -Math.abs(ground - this.height * 0.66) * 0.08;
            const slopeScore = -slope * 120;
            const edgeScore = Math.min(x - minX, maxX - x) * 0.01;
            const distanceScore = avoidX === null
                ? 0
                : clamp(Math.abs(x - avoidX) - CONFIG.terrain.minSpawnDistance, -180, 160) * 0.25;
            const score = heightScore + slopeScore + edgeScore + distanceScore + Math.random() * 3;

            if (score > bestScore) {
                bestScore = score;
                bestX = x;
            }
        }

        return bestX;
    }

    flattenPad(centerX, halfWidth = CONFIG.terrain.padHalfWidth) {
        const xMin = Math.max(0, Math.floor(centerX - halfWidth));
        const xMax = Math.min(this.width - 1, Math.ceil(centerX + halfWidth));
        let total = 0;

        for (let x = xMin; x <= xMax; x++) total += this.heights[x];
        const target = total / Math.max(1, xMax - xMin + 1);

        for (let x = xMin; x <= xMax; x++) {
            const dist = Math.abs(x - centerX);
            const blend = dist > halfWidth * 0.72 ? 0.65 : 1;
            this.heights[x] = lerp(this.heights[x], target, blend);
        }

        this._smoothRange(xMin - 18, xMax + 18, 2);
    }

    explode(cx, cy, radius, strength = 1) {
        if (!Number.isFinite(cx) || !Number.isFinite(cy) || radius <= 0) return;

        const xMin = Math.max(0, Math.floor(cx - radius));
        const xMax = Math.min(this.width - 1, Math.ceil(cx + radius));

        for (let x = xMin; x <= xMax; x++) {
            const dx = x - cx;
            const inside = radius * radius - dx * dx;
            if (inside <= 0) continue;

            const halfChord = Math.sqrt(inside);
            const bottomOfHole = cy + halfChord * strength;
            if (bottomOfHole > this.heights[x]) {
                this.heights[x] = clamp(bottomOfHole, 0, this.height);
            }
        }

        this.craters.push({ x: cx, y: cy, radius });
        if (this.craters.length > 24) this.craters.shift();
        this._smoothRange(xMin - 3, xMax + 3, 1);
    }

    addMound(cx, cy, radius, maxMoundHeight) {
        if (!Number.isFinite(cx) || !Number.isFinite(cy) || radius <= 0 || maxMoundHeight <= 0) return;

        const xMin = Math.max(0, Math.floor(cx - radius));
        const xMax = Math.min(this.width - 1, Math.ceil(cx + radius));
        const minGroundY = this.height * 0.18;

        for (let x = xMin; x <= xMax; x++) {
            const distance = Math.abs(x - cx);
            const t = Math.max(0, 1 - distance / radius);
            const moundHeight = maxMoundHeight * t * t;
            this.heights[x] = clamp(this.heights[x] - moundHeight, minGroundY, this.height);
        }

        this.mounds.push({ x: cx, y: cy, radius });
        if (this.mounds.length > 16) this.mounds.shift();
        // v0.6: lighter smoothing so the larger mound stays visibly tall and
        // does not get flattened back down by averaging.
        this._smoothRange(xMin - 8, xMax + 8, 1);
    }

    draw(ctx) {
        const w = this.width;
        const h = this.height;

        const groundGradient = ctx.createLinearGradient(0, h * 0.35, 0, h);
        groundGradient.addColorStop(0, this.color);
        groundGradient.addColorStop(1, this.deepColor);

        ctx.beginPath();
        ctx.moveTo(0, h);
        ctx.lineTo(0, this.heights[0]);
        for (let x = 1; x < w; x++) ctx.lineTo(x, this.heights[x]);
        ctx.lineTo(w, h);
        ctx.closePath();
        ctx.fillStyle = groundGradient;
        ctx.fill();

        this._drawStrata(ctx);
        this._drawCraterShadows(ctx);
        this._drawMoundHighlights(ctx);

        ctx.beginPath();
        ctx.moveTo(0, this.heights[0]);
        for (let x = 1; x < w; x++) ctx.lineTo(x, this.heights[x]);
        ctx.strokeStyle = this.grassColor;
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.stroke();
    }

    _smooth(iterations) {
        for (let i = 0; i < iterations; i++) {
            this._smoothRange(0, this.width - 1, 1);
        }
    }

    _smoothRange(startX, endX, iterations) {
        const start = Math.max(0, Math.floor(startX));
        const end = Math.min(this.width - 1, Math.ceil(endX));
        if (end <= start) return;

        for (let pass = 0; pass < iterations; pass++) {
            const copy = new Float32Array(this.heights);
            for (let x = start; x <= end; x++) {
                const left = copy[Math.max(0, x - 1)];
                const center = copy[x];
                const right = copy[Math.min(this.width - 1, x + 1)];
                this.heights[x] = (left + center * 2 + right) / 4;
            }
        }
    }

    _drawStrata(ctx) {
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 225, 170, 0.11)';
        ctx.lineWidth = 1;
        for (let layer = 0; layer < 4; layer++) {
            const offset = 30 + layer * 34;
            ctx.beginPath();
            for (let x = 0; x < this.width; x += 8) {
                const y = Math.min(this.height, this.heightAt(x) + offset + Math.sin(x * 0.018 + layer) * 5);
                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
        }
        ctx.restore();
    }

    _drawCraterShadows(ctx) {
        ctx.save();
        for (const crater of this.craters) {
            ctx.strokeStyle = 'rgba(50, 32, 22, 0.32)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            const start = Math.max(0, Math.floor(crater.x - crater.radius));
            const end = Math.min(this.width - 1, Math.ceil(crater.x + crater.radius));
            for (let x = start; x <= end; x += 2) {
                const y = this.heightAt(x) + 2;
                if (x === start) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
        }
        ctx.restore();
    }

    _drawMoundHighlights(ctx) {
        ctx.save();
        for (const mound of this.mounds) {
            ctx.strokeStyle = 'rgba(143, 191, 76, 0.24)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            const start = Math.max(0, Math.floor(mound.x - mound.radius));
            const end = Math.min(this.width - 1, Math.ceil(mound.x + mound.radius));
            for (let x = start; x <= end; x += 2) {
                const y = this.heightAt(x) - 1;
                if (x === start) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
        }
        ctx.restore();
    }
}

function smoothstep(t) {
    return t * t * (3 - 2 * t);
}

function lerp(a, b, t) {
    return a + (b - a) * t;
}

function randomRange(min, max) {
    return min + Math.random() * (max - min);
}
