const textureCache = new Map();
const projectileCache = new Map();
const treadCache = new Map();

export function createRenderCanvas(width, height) {
    if (typeof OffscreenCanvas !== 'undefined') {
        return new OffscreenCanvas(width, height);
    }
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return canvas;
}

export function getTerrainTexture(theme) {
    const key = `terrain:${theme.id}`;
    if (textureCache.has(key)) return textureCache.get(key);

    const canvas = createRenderCanvas(128, 128);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = theme.terrain.base;
    ctx.fillRect(0, 0, 128, 128);

    for (let i = 0; i < 180; i++) {
        const x = seededNoise(i, 3) * 128;
        const y = seededNoise(i, 9) * 128;
        const r = 0.6 + seededNoise(i, 15) * 2.6;
        const tint = seededNoise(i, 21);
        ctx.fillStyle = tint > 0.55
            ? colorWithAlpha(theme.terrain.mid, 0.16 + seededNoise(i, 33) * 0.18)
            : colorWithAlpha(theme.terrain.highlight, 0.07 + seededNoise(i, 37) * 0.12);
        ctx.beginPath();
        ctx.ellipse(x, y, r * 1.45, r, seededNoise(i, 41) * Math.PI, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.strokeStyle = colorWithAlpha(theme.terrain.deep, 0.13);
    ctx.lineWidth = 1;
    for (let y = 18; y < 128; y += 24) {
        ctx.beginPath();
        for (let x = 0; x <= 128; x += 8) {
            const wave = Math.sin(x * 0.16 + y * 0.07) * 2.2;
            if (x === 0) ctx.moveTo(x, y + wave);
            else ctx.lineTo(x, y + wave);
        }
        ctx.stroke();
    }

    textureCache.set(key, canvas);
    return canvas;
}

export function getProjectileSprite(weapon) {
    const key = `projectile:${weapon.id}`;
    if (projectileCache.has(key)) return projectileCache.get(key);

    const canvas = createRenderCanvas(48, 48);
    const ctx = canvas.getContext('2d');
    ctx.translate(24, 24);

    const color = weapon.color || '#ffd257';
    const dark = shadeColor(color, -44);
    const light = shadeColor(color, 32);

    ctx.shadowColor = colorWithAlpha(color, 0.42);
    ctx.shadowBlur = weapon.id === 'mega' || weapon.id === 'napalm' ? 8 : 4;

    if (weapon.id === 'napalm') {
        roundRect(ctx, -13, -8, 26, 16, 6);
        ctx.fillStyle = dark;
        ctx.fill();
        roundRect(ctx, -9, -6, 18, 12, 5);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.fillStyle = 'rgba(255, 236, 150, 0.72)';
        ctx.fillRect(-5, -5, 4, 10);
        ctx.fillRect(3, -5, 3, 10);
    } else if (weapon.id === 'dirt') {
        ctx.fillStyle = '#3b2a1c';
        ctx.beginPath();
        ctx.arc(0, 0, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(-1, -1, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(85, 60, 35, 0.62)';
        ctx.beginPath();
        ctx.arc(4, 3, 3, 0, Math.PI * 2);
        ctx.fill();
    } else if (weapon.id === 'roller') {
        ctx.fillStyle = '#1d2428';
        ctx.beginPath();
        ctx.arc(0, 0, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#d8e2e6';
        ctx.lineWidth = 2;
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.arc(0, 0, 4 + i * 2, 0, Math.PI * 1.55);
            ctx.stroke();
        }
    } else if (weapon.id === 'cluster' || weapon.id === 'clusterBomblet') {
        const scale = weapon.id === 'clusterBomblet' ? 0.68 : 1;
        ctx.scale(scale, scale);
        roundRect(ctx, -12, -6, 24, 12, 5);
        ctx.fillStyle = dark;
        ctx.fill();
        roundRect(ctx, -8, -5, 16, 10, 4);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.fillStyle = colorWithAlpha(light, 0.9);
        ctx.fillRect(-5, -4, 3, 8);
        ctx.fillRect(2, -4, 3, 8);
    } else {
        const shellScale = weapon.id === 'mega' ? 1.22 : (weapon.id === 'heavy' ? 1.1 : 0.92);
        ctx.scale(shellScale, shellScale);
        ctx.fillStyle = '#151719';
        ctx.beginPath();
        ctx.moveTo(12, 0);
        ctx.lineTo(3, -7);
        ctx.lineTo(-12, -6);
        ctx.lineTo(-15, 0);
        ctx.lineTo(-12, 6);
        ctx.lineTo(3, 7);
        ctx.closePath();
        ctx.fill();
        const gradient = ctx.createLinearGradient(-13, -7, 10, 7);
        gradient.addColorStop(0, dark);
        gradient.addColorStop(0.55, color);
        gradient.addColorStop(1, light);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(10, 0);
        ctx.quadraticCurveTo(5, -7, -11, -5);
        ctx.lineTo(-14, 0);
        ctx.lineTo(-11, 5);
        ctx.quadraticCurveTo(5, 7, 10, 0);
        ctx.fill();

        if (weapon.id === 'mega') {
            ctx.strokeStyle = '#ffcf3f';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(-5, -6);
            ctx.lineTo(2, 6);
            ctx.stroke();
            ctx.strokeStyle = '#111318';
            ctx.lineWidth = 1.4;
            ctx.beginPath();
            ctx.moveTo(-1, -6);
            ctx.lineTo(6, 5);
            ctx.stroke();
        }
    }

    projectileCache.set(key, canvas);
    return canvas;
}

export function drawWeaponIcon(ctx, weapon, x, y, size = 44) {
    const sprite = getProjectileSprite(weapon);
    ctx.save();
    ctx.translate(x, y);
    const bg = ctx.createRadialGradient(0, 0, 2, 0, 0, size * 0.54);
    bg.addColorStop(0, 'rgba(255, 244, 200, 0.18)');
    bg.addColorStop(1, 'rgba(10, 15, 16, 0.08)');
    ctx.fillStyle = bg;
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.48, 0, Math.PI * 2);
    ctx.fill();
    ctx.rotate(weapon.id === 'roller' ? 0 : -0.22);
    ctx.drawImage(sprite, -size / 2, -size / 2, size, size);
    ctx.restore();
}

export function drawUtilityIcon(ctx, type, x, y, size = 44) {
    ctx.save();
    ctx.translate(x, y);
    const radius = size * 0.46;
    ctx.fillStyle = 'rgba(10, 15, 16, 0.18)';
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();

    if (type === 'shield') {
        ctx.fillStyle = '#2a8fb8';
        ctx.strokeStyle = '#bcecff';
        ctx.lineWidth = Math.max(2, size * 0.06);
        ctx.beginPath();
        ctx.moveTo(0, -size * 0.34);
        ctx.lineTo(size * 0.25, -size * 0.22);
        ctx.lineTo(size * 0.20, size * 0.16);
        ctx.quadraticCurveTo(0, size * 0.34, -size * 0.20, size * 0.16);
        ctx.lineTo(-size * 0.25, -size * 0.22);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
        ctx.beginPath();
        ctx.moveTo(0, -size * 0.26);
        ctx.lineTo(size * 0.13, -size * 0.18);
        ctx.lineTo(0, size * 0.22);
        ctx.closePath();
        ctx.fill();
    } else if (type === 'repair') {
        roundRect(ctx, -size * 0.30, -size * 0.23, size * 0.60, size * 0.48, size * 0.08);
        ctx.fillStyle = '#f4f0df';
        ctx.fill();
        ctx.strokeStyle = '#8b2e25';
        ctx.lineWidth = Math.max(2, size * 0.05);
        ctx.stroke();
        ctx.fillStyle = '#d94232';
        ctx.fillRect(-size * 0.06, -size * 0.17, size * 0.12, size * 0.34);
        ctx.fillRect(-size * 0.18, -size * 0.05, size * 0.36, size * 0.12);
        ctx.strokeStyle = '#d6caa8';
        ctx.lineWidth = Math.max(1, size * 0.035);
        ctx.beginPath();
        ctx.moveTo(-size * 0.12, -size * 0.23);
        ctx.quadraticCurveTo(0, -size * 0.37, size * 0.12, -size * 0.23);
        ctx.stroke();
    } else {
        ctx.strokeStyle = '#f5eee0';
        ctx.lineWidth = Math.max(2, size * 0.055);
        ctx.beginPath();
        ctx.arc(0, -size * 0.02, size * 0.26, Math.PI * 1.05, Math.PI * 1.95);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-size * 0.24, -size * 0.02);
        ctx.lineTo(-size * 0.10, size * 0.22);
        ctx.moveTo(0, -size * 0.28);
        ctx.lineTo(0, size * 0.23);
        ctx.moveTo(size * 0.24, -size * 0.02);
        ctx.lineTo(size * 0.10, size * 0.22);
        ctx.stroke();
        roundRect(ctx, -size * 0.16, size * 0.18, size * 0.32, size * 0.14, size * 0.04);
        ctx.fillStyle = '#d9b27f';
        ctx.fill();
    }
    ctx.restore();
}

export function getTreadSprite(color) {
    const key = `tread:${color}`;
    if (treadCache.has(key)) return treadCache.get(key);

    const canvas = createRenderCanvas(96, 28);
    const ctx = canvas.getContext('2d');
    ctx.translate(48, 14);

    roundRect(ctx, -43, -10, 86, 20, 9);
    ctx.fillStyle = '#15191e';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.strokeStyle = 'rgba(0, 0, 0, 0.36)';
    ctx.lineWidth = 3;
    for (let x = -36; x <= 36; x += 10) {
        ctx.beginPath();
        ctx.moveTo(x - 4, -9);
        ctx.lineTo(x + 2, 9);
        ctx.stroke();
    }

    for (let x = -30; x <= 30; x += 15) {
        const wheel = ctx.createRadialGradient(x, 2, 1, x, 2, 6);
        wheel.addColorStop(0, shadeColor(color, 20));
        wheel.addColorStop(0.55, '#303943');
        wheel.addColorStop(1, '#101318');
        ctx.fillStyle = wheel;
        ctx.beginPath();
        ctx.arc(x, 2, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
        ctx.beginPath();
        ctx.arc(x - 1.5, 0, 2, 0, Math.PI * 2);
        ctx.fill();
    }

    treadCache.set(key, canvas);
    return canvas;
}

export function drawProjectileTrail(ctx, projectile) {
    if (!projectile.trail.length) return;
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (let i = 1; i < projectile.trail.length; i++) {
        const prev = projectile.trail[i - 1];
        const point = projectile.trail[i];
        const alpha = i / projectile.trail.length;
        ctx.strokeStyle = `rgba(${projectile.weapon.trailColor}, ${alpha * 0.42})`;
        ctx.lineWidth = Math.max(1, projectile.radius * alpha * 1.6);
        ctx.beginPath();
        ctx.moveTo(prev.x, prev.y);
        ctx.lineTo(point.x, point.y);
        ctx.stroke();
    }
    ctx.restore();
}

export function drawProjectileSprite(ctx, projectile) {
    const sprite = getProjectileSprite(projectile.weapon);
    const angle = projectile.rolling
        ? (projectile.spin || projectile.age * 8)
        : Math.atan2(projectile.vy, projectile.vx);
    const size = Math.max(22, projectile.radius * 7);

    ctx.save();
    ctx.translate(projectile.x, projectile.y);
    ctx.rotate(angle);
    ctx.drawImage(sprite, -size / 2, -size / 2, size, size);
    ctx.restore();
}

export function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
}

export function shadeColor(hex, percent) {
    const parsed = parseHex(hex);
    const amount = Math.round((percent / 100) * 255);
    const r = clamp(parsed.r + amount, 0, 255);
    const g = clamp(parsed.g + amount, 0, 255);
    const b = clamp(parsed.b + amount, 0, 255);
    return `rgb(${r}, ${g}, ${b})`;
}

export function colorWithAlpha(hex, alpha) {
    const parsed = parseHex(hex);
    return `rgba(${parsed.r}, ${parsed.g}, ${parsed.b}, ${alpha})`;
}

export function mixHex(a, b, t) {
    const ca = parseHex(a);
    const cb = parseHex(b);
    const r = Math.round(ca.r + (cb.r - ca.r) * t);
    const g = Math.round(ca.g + (cb.g - ca.g) * t);
    const blue = Math.round(ca.b + (cb.b - ca.b) * t);
    return `rgb(${r}, ${g}, ${blue})`;
}

function parseHex(value) {
    const fallback = { r: 255, g: 255, b: 255 };
    const rgb = typeof value === 'string'
        ? value.match(/^rgb\(\s*(\d+),\s*(\d+),\s*(\d+)/)
        : null;
    if (rgb) {
        return {
            r: clamp(Number(rgb[1]), 0, 255),
            g: clamp(Number(rgb[2]), 0, 255),
            b: clamp(Number(rgb[3]), 0, 255),
        };
    }
    if (!value || value[0] !== '#') return fallback;
    const c = value.slice(1);
    const full = c.length === 3 ? c.split('').map((part) => part + part).join('') : c;
    const num = parseInt(full, 16);
    if (!Number.isFinite(num)) return fallback;
    return {
        r: (num >> 16) & 255,
        g: (num >> 8) & 255,
        b: num & 255,
    };
}

function seededNoise(i, salt) {
    const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
    return x - Math.floor(x);
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}
