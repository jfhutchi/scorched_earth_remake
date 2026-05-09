import { colorWithAlpha, getTerrainTexture, roundRect } from './visualAssets.js';

export function drawTerrain(ctx, terrain) {
    const theme = terrain.theme;
    const w = terrain.width;
    const h = terrain.height;

    ctx.save();
    buildTerrainPath(ctx, terrain);
    const groundGradient = ctx.createLinearGradient(0, h * 0.34, 0, h);
    groundGradient.addColorStop(0, theme.terrain.base);
    groundGradient.addColorStop(0.58, theme.terrain.mid);
    groundGradient.addColorStop(1, theme.terrain.deep);
    ctx.fillStyle = groundGradient;
    ctx.fill();

    buildTerrainPath(ctx, terrain);
    ctx.clip();
    const texture = getTerrainTexture(theme);
    const pattern = ctx.createPattern(texture, 'repeat');
    if (pattern) {
        ctx.save();
        ctx.globalAlpha = theme.id === 'snow' ? 0.38 : 0.54;
        ctx.fillStyle = pattern;
        ctx.translate(terrain.textureOffsetX || 0, terrain.textureOffsetY || 0);
        ctx.fillRect(-(terrain.textureOffsetX || 0), -(terrain.textureOffsetY || 0), w + 128, h + 128);
        ctx.restore();
    }
    drawStrata(ctx, terrain);
    drawEmbeddedStones(ctx, terrain);
    ctx.restore();

    drawCraterAndScorchMarks(ctx, terrain);
    drawSurface(ctx, terrain);
    drawForegroundDetails(ctx, terrain);
}

export function buildTerrainPath(ctx, terrain) {
    const w = terrain.width;
    const h = terrain.height;
    ctx.beginPath();
    ctx.moveTo(0, h);
    ctx.lineTo(0, terrain.heights[0]);
    for (let x = 1; x < w; x++) ctx.lineTo(x, terrain.heights[x]);
    ctx.lineTo(w, h);
    ctx.closePath();
}

function drawStrata(ctx, terrain) {
    const theme = terrain.theme;
    ctx.save();
    ctx.strokeStyle = theme.terrain.strata;
    ctx.lineWidth = 1.25;
    for (let layer = 0; layer < 5; layer++) {
        const offset = 24 + layer * 32;
        ctx.beginPath();
        for (let x = 0; x < terrain.width; x += 8) {
            const y = Math.min(
                terrain.height,
                terrain.heightAt(x) + offset + Math.sin(x * 0.016 + layer * 1.7 + terrain.visualSeed) * 5
            );
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
    }
    ctx.restore();
}

function drawEmbeddedStones(ctx, terrain) {
    const colors = terrain.theme.terrain.stones;
    ctx.save();
    for (const stone of terrain.detailStones) {
        ctx.fillStyle = colorWithAlpha(colors[stone.colorIndex % colors.length], stone.alpha);
        ctx.beginPath();
        ctx.ellipse(stone.x, stone.y, stone.rx, stone.ry, stone.rotation, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();
}

function drawCraterAndScorchMarks(ctx, terrain) {
    const theme = terrain.theme;
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (const mark of terrain.scorchMarks) {
        const start = Math.max(0, Math.floor(mark.x - mark.radius));
        const end = Math.min(terrain.width - 1, Math.ceil(mark.x + mark.radius));
        const lineWidth = mark.type === 'napalm' ? 14 : Math.max(7, mark.radius * 0.22);
        ctx.beginPath();
        for (let x = start; x <= end; x += 3) {
            const d = Math.abs(x - mark.x) / Math.max(1, mark.radius);
            const y = terrain.heightAt(x) + 2 + Math.sin(x * 0.08 + mark.seed) * (1 - d) * 2;
            if (x === start) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = mark.type === 'napalm'
            ? `rgba(64, 24, 14, ${0.44 * mark.alpha})`
            : `rgba(30, 24, 20, ${0.34 * mark.alpha})`;
        ctx.lineWidth = lineWidth;
        ctx.stroke();

        ctx.beginPath();
        for (let x = start; x <= end; x += 4) {
            const y = terrain.heightAt(x) - 1;
            if (x === start) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = mark.type === 'napalm'
            ? `rgba(214, 80, 24, ${0.13 * mark.alpha})`
            : theme.terrain.scorch;
        ctx.lineWidth = Math.max(2, lineWidth * 0.28);
        ctx.stroke();
    }

    for (const crater of terrain.craters) {
        const start = Math.max(0, Math.floor(crater.x - crater.radius));
        const end = Math.min(terrain.width - 1, Math.ceil(crater.x + crater.radius));
        ctx.beginPath();
        for (let x = start; x <= end; x += 2) {
            const y = terrain.heightAt(x) + 3;
            if (x === start) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = 'rgba(18, 15, 13, 0.32)';
        ctx.lineWidth = Math.max(3, crater.radius * 0.09);
        ctx.stroke();

        ctx.beginPath();
        for (let x = start; x <= end; x += 2) {
            const y = terrain.heightAt(x) - 2;
            if (x === start) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = colorWithAlpha(theme.terrain.highlight, 0.16);
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    for (const mound of terrain.mounds) {
        const start = Math.max(0, Math.floor(mound.x - mound.radius));
        const end = Math.min(terrain.width - 1, Math.ceil(mound.x + mound.radius));
        ctx.beginPath();
        for (let x = start; x <= end; x += 3) {
            const y = terrain.heightAt(x) - 2;
            if (x === start) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = colorWithAlpha(theme.terrain.highlight, 0.24);
        ctx.lineWidth = 4;
        ctx.stroke();
    }

    ctx.restore();
}

function drawSurface(ctx, terrain) {
    const theme = terrain.theme;
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(0, terrain.heights[0] + 4);
    for (let x = 1; x < terrain.width; x++) ctx.lineTo(x, terrain.heights[x] + 4);
    ctx.strokeStyle = 'rgba(25, 18, 14, 0.28)';
    ctx.lineWidth = 8;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, terrain.heights[0]);
    for (let x = 1; x < terrain.width; x++) ctx.lineTo(x, terrain.heights[x]);
    ctx.strokeStyle = theme.terrain.top;
    ctx.lineWidth = theme.id === 'snow' ? 7 : 6;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, terrain.heights[0] - 2);
    for (let x = 1; x < terrain.width; x++) ctx.lineTo(x, terrain.heights[x] - 2);
    ctx.strokeStyle = colorWithAlpha(theme.terrain.highlight, theme.id === 'snow' ? 0.72 : 0.42);
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.restore();
}

function drawForegroundDetails(ctx, terrain) {
    if (!terrain.surfaceDetails.length) return;
    ctx.save();
    const theme = terrain.theme;
    for (const detail of terrain.surfaceDetails) {
        const x = detail.x;
        const y = terrain.heightAt(x);
        if (detail.kind === 'grass') {
            ctx.strokeStyle = colorWithAlpha(theme.terrain.highlight, 0.45);
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(x, y - 1);
            ctx.lineTo(x + detail.lean, y - detail.height);
            ctx.stroke();
        } else if (detail.kind === 'pebble') {
            ctx.fillStyle = colorWithAlpha(theme.terrain.stones[detail.colorIndex % theme.terrain.stones.length], 0.62);
            ctx.beginPath();
            ctx.ellipse(x, y - 2, detail.size * 1.5, detail.size, 0, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.save();
            ctx.translate(x, y - detail.height * 0.5);
            ctx.rotate(detail.rotation);
            roundRect(ctx, -detail.size, -detail.size * 0.38, detail.size * 2, detail.size * 0.76, detail.size * 0.25);
            ctx.fillStyle = colorWithAlpha(theme.terrain.stones[detail.colorIndex % theme.terrain.stones.length], 0.5);
            ctx.fill();
            ctx.restore();
        }
    }
    ctx.restore();
}
