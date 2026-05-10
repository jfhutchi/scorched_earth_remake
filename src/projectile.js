import { drawProjectileSprite, drawProjectileTrail } from './visualAssets.js';

export class Projectile {
    constructor(x, y, vx, vy, weapon) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.weapon = weapon;
        this.radius = weapon.projectileRadius;
        this.age = 0;
        this.trail = [];
        this.maxTrail = weapon.visualProfile?.trailLength
            ?? (weapon.id === 'heavy' || weapon.id === 'mega' ? 26 : (weapon.id === 'clusterBomblet' ? 10 : 18));
        this.rolling = false;
        this.done = false;
        this.spin = Math.random() * Math.PI * 2;
    }

    update(dt, gravity, wind) {
        this.age += dt;
        this.spin += dt * (this.weapon.id === 'roller' ? 18 : 8);
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > this.maxTrail) this.trail.shift();

        this.vy += gravity * dt;
        this.vx += wind * dt;
        this.x += this.vx * dt;
        this.y += this.vy * dt;
    }

    draw(ctx) {
        drawProjectileTrail(ctx, this);
        if (this.rolling) {
            ctx.strokeStyle = 'rgba(35, 38, 42, 0.42)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius + 4, 0, Math.PI * 2);
            ctx.stroke();
        }
        drawProjectileSprite(ctx, this);
    }
}

export class Explosion {
    constructor(x, y, maxRadius, weapon, options = {}) {
        this.x = x;
        this.y = y;
        this.maxRadius = maxRadius;
        this.weapon = weapon;
        this.surfacePoints = options.surfacePoints || null;
        this.seed = Math.random() * 1000;
        this.t = 0;
        const visual = weapon.impactVisual;
        const isFireVisual = visual === 'napalmFlame' || visual === 'firestormFlame';
        this.duration = visual === 'tankDeath' ? 1.32
            : (visual === 'megaBlast' ? 0.95
                : (visual === 'heavyBlast' || visual === 'heavyRollerBlast' || visual === 'excavatorBlast' ? 0.78
                    : (isFireVisual ? (weapon.flameDuration || 2.2)
                        : (visual === 'dirtPuff' ? 0.72
                            : (visual === 'airburstPulse' ? 0.66 : 0.56)))));
        this.alive = true;
        const fragmentCount = visual === 'tankDeath' ? 30
            : (visual === 'megaBlast' ? 34
                : (visual === 'heavyBlast' || visual === 'heavyRollerBlast' || visual === 'excavatorBlast' ? 22
                    : (visual === 'dirtPuff' ? 28
                        : (isFireVisual ? 20
                            : (visual === 'clusterMiniBlast' || visual === 'splitterSpark' || visual === 'precisionSpark' ? 8
                                : (visual === 'airburstPulse' ? 16 : 13))))));
        this.fragments = Array.from({ length: fragmentCount }, () => {
            const upwardBias = visual === 'dirtPuff' || isFireVisual || visual === 'tankDeath'
                ? -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.95
                : Math.random() * Math.PI * 2;
            return {
                angle: upwardBias,
                speed: 18 + Math.random() * maxRadius * (visual === 'tankDeath' ? 1.45 : (visual === 'megaBlast' ? 1.55 : (visual === 'heavyBlast' ? 1.35 : 1.1))),
                size: 1.5 + Math.random() * (visual === 'dirtPuff' || isFireVisual ? 4.5 : (visual === 'tankDeath' ? 5.2 : 3)),
                drift: visual === 'dirtPuff' || isFireVisual || visual === 'tankDeath' ? (Math.random() - 0.5) * 18 : 0,
                soilTint: Math.random(),
                spin: Math.random() * Math.PI,
            };
        });
    }

    update(dt) {
        this.t += dt;
        if (this.t >= this.duration) this.alive = false;
    }

    draw(ctx) {
        const k = Math.min(1, this.t / this.duration);
        if (this.weapon.impactVisual === 'dirtPuff') {
            this._drawDirtPuff(ctx, k);
            return;
        }
        if (this.weapon.impactVisual === 'napalmFlame' || this.weapon.impactVisual === 'firestormFlame') {
            this._drawNapalm(ctx, k);
            return;
        }
        if (this.weapon.impactVisual === 'airburstPulse') {
            this._drawAirburst(ctx, k);
            return;
        }
        if (this.weapon.impactVisual === 'tankDeath') {
            this._drawTankDeath(ctx, k);
            return;
        }

        const shockRadius = this.maxRadius * (0.25 + k * 1.05);
        const coreRadius = this.maxRadius * (0.95 - k * 0.45);
        const isHeavy = this.weapon.impactVisual === 'heavyBlast'
            || this.weapon.impactVisual === 'heavyRollerBlast'
            || this.weapon.impactVisual === 'excavatorBlast';
        const isMega = this.weapon.impactVisual === 'megaBlast';
        const isCluster = this.weapon.impactVisual === 'clusterMiniBlast'
            || this.weapon.impactVisual === 'splitterSpark'
            || this.weapon.impactVisual === 'precisionSpark';

        ctx.save();

        ctx.strokeStyle = isMega
            ? `rgba(255, 245, 190, ${0.98 - k * 0.76})`
            : (isHeavy
                ? `rgba(255, 230, 120, ${0.95 - k * 0.82})`
                : `rgba(255, 238, 145, ${0.78 - k * 0.66})`);
        ctx.lineWidth = isMega ? 6 : (isHeavy ? 4 : (isCluster ? 2 : 3));
        ctx.beginPath();
        ctx.arc(this.x, this.y, shockRadius, 0, Math.PI * 2);
        ctx.stroke();

        if (isMega || isHeavy) {
            ctx.strokeStyle = `rgba(255, 115, 58, ${0.42 - k * 0.35})`;
            ctx.lineWidth = isMega ? 3 : 2;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.maxRadius * (0.42 + k * 0.88), 0, Math.PI * 2);
            ctx.stroke();
        }

        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, coreRadius);
        gradient.addColorStop(0, `rgba(255, 248, 218, ${isMega ? 1 - k * 0.48 : (isHeavy ? 0.95 - k * 0.55 : 0.82 - k * 0.58)})`);
        gradient.addColorStop(0.36, `rgba(255, 137, 38, ${isMega ? 0.94 - k * 0.45 : (isHeavy ? 0.86 - k * 0.48 : 0.68 - k * 0.50)})`);
        gradient.addColorStop(1, `rgba(120, 40, 24, ${isMega ? 0.18 * (1 - k) : (isHeavy ? 0.08 * (1 - k) : 0)})`);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, coreRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = isHeavy
            ? `rgba(45, 38, 32, ${0.7 - k * 0.55})`
            : `rgba(55, 45, 38, ${0.5 - k * 0.4})`;
        for (const fragment of this.fragments) {
            const d = fragment.speed * k;
            ctx.beginPath();
            ctx.arc(
                this.x + Math.cos(fragment.angle) * d,
                this.y + Math.sin(fragment.angle) * d,
                fragment.size * (1 - k * 0.5),
                0,
                Math.PI * 2
            );
            ctx.fill();
        }

        const smokeAlpha = (isMega ? 0.42 : (isHeavy ? 0.34 : 0.22)) * Math.min(1, k * 2.2) * (1 - k * 0.62);
        if (smokeAlpha > 0.02) {
            ctx.fillStyle = `rgba(48, 42, 36, ${smokeAlpha})`;
            for (let i = 0; i < this.fragments.length; i += isCluster ? 3 : 4) {
                const fragment = this.fragments[i];
                const d = fragment.speed * k * 0.48;
                const radius = fragment.size * (2.4 + k * (isMega ? 5 : 3));
                ctx.beginPath();
                ctx.ellipse(
                    this.x + Math.cos(fragment.angle) * d + Math.sin(this.t * 3 + i) * 4,
                    this.y + Math.sin(fragment.angle) * d - this.maxRadius * k * 0.22,
                    radius * 1.25,
                    radius,
                    0,
                    0,
                    Math.PI * 2
                );
                ctx.fill();
            }
        }

        ctx.restore();
    }

    _drawDirtPuff(ctx, k) {
        const puffRadius = this.maxRadius * (0.35 + k * 0.72);
        const alpha = Math.max(0, 0.7 - k * 0.62);

        ctx.save();

        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, puffRadius);
        gradient.addColorStop(0, `rgba(141, 112, 66, ${alpha})`);
        gradient.addColorStop(0.48, `rgba(104, 82, 48, ${alpha * 0.68})`);
        gradient.addColorStop(1, 'rgba(70, 50, 30, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.ellipse(this.x, this.y - this.maxRadius * 0.1 * k, puffRadius * 1.08, puffRadius * 0.62, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = `rgba(81, 122, 56, ${0.42 - k * 0.32})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.maxRadius * (0.35 + k * 0.54), Math.PI * 0.08, Math.PI * 0.92);
        ctx.stroke();

        for (const fragment of this.fragments) {
            const d = fragment.speed * k;
            const gravityDrop = this.maxRadius * 0.42 * k * k;
            const fx = this.x + Math.cos(fragment.angle) * d + fragment.drift * k;
            const fy = this.y + Math.sin(fragment.angle) * d + gravityDrop;
            ctx.fillStyle = fragment.soilTint > 0.72
                ? `rgba(91, 132, 57, ${0.72 - k * 0.52})`
                : `rgba(104, 75, 42, ${0.78 - k * 0.56})`;
            ctx.beginPath();
            ctx.arc(fx, fy, fragment.size * (1 - k * 0.38), 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    _drawNapalm(ctx, k) {
        const points = this.surfacePoints && this.surfacePoints.length
            ? this.surfacePoints
            : [{ x: this.x, y: this.y, seed: 0.5 }];
        const width = this.weapon.flameWidth || this.maxRadius * 1.8;
        const halfWidth = width / 2;
        const spread = Math.min(1, 0.36 + k * 2.15);
        const visibleHalf = halfWidth * spread;
        const fade = k < 0.74 ? 1 : Math.max(0, (1 - k) / 0.26);
        const alpha = 0.9 * fade;
        const firestorm = this.weapon.impactVisual === 'firestormFlame';
        const outerColor = firestorm ? '168, 20, 22' : '125, 24, 12';
        const midColor = firestorm ? '255, 70, 22' : '255, 92, 24';
        const hotColor = firestorm ? '255, 226, 88' : '255, 208, 72';
        const flameOuter = firestorm ? '228, 38, 24' : '204, 42, 20';
        const flameInner = firestorm ? '255, 214, 76' : '255, 185, 56';

        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        const visiblePoints = points.filter((point) => Math.abs(point.x - this.x) <= visibleHalf + 2);
        if (visiblePoints.length > 1) {
            ctx.beginPath();
            visiblePoints.forEach((point, index) => {
                const y = point.y + 2;
                if (index === 0) ctx.moveTo(point.x, y);
                else ctx.lineTo(point.x, y);
            });
            ctx.strokeStyle = `rgba(${outerColor}, ${alpha * 0.46})`;
            ctx.lineWidth = 18;
            ctx.stroke();

            ctx.beginPath();
            visiblePoints.forEach((point, index) => {
                const y = point.y - 1;
                if (index === 0) ctx.moveTo(point.x, y);
                else ctx.lineTo(point.x, y);
            });
            ctx.strokeStyle = `rgba(${midColor}, ${alpha * 0.58})`;
            ctx.lineWidth = 10;
            ctx.stroke();

            ctx.beginPath();
            visiblePoints.forEach((point, index) => {
                const y = point.y - 3;
                if (index === 0) ctx.moveTo(point.x, y);
                else ctx.lineTo(point.x, y);
            });
            ctx.strokeStyle = `rgba(${hotColor}, ${alpha * 0.42})`;
            ctx.lineWidth = 4;
            ctx.stroke();
        }

        for (let i = 0; i < visiblePoints.length; i += 2) {
            const point = visiblePoints[i];
            const distanceFactor = clamp01(1 - Math.abs(point.x - this.x) / Math.max(1, halfWidth));
            const flicker = 0.72 + Math.sin(this.t * 17 + point.seed * 13 + this.seed) * 0.22;
            const flameHeight = (16 + point.seed * 26) * distanceFactor * flicker * (0.76 + spread * 0.24);
            const baseWidth = 5 + distanceFactor * 7;
            const lean = Math.sin(this.t * 9 + point.seed * 8) * 5;
            const outerAlpha = alpha * (0.32 + distanceFactor * 0.54);
            if (outerAlpha <= 0.01) continue;

            ctx.fillStyle = `rgba(${flameOuter}, ${outerAlpha})`;
            ctx.beginPath();
            ctx.moveTo(point.x - baseWidth, point.y + 1);
            ctx.quadraticCurveTo(point.x - baseWidth * 0.55 + lean, point.y - flameHeight * 0.42, point.x + lean, point.y - flameHeight);
            ctx.quadraticCurveTo(point.x + baseWidth * 0.64 + lean * 0.35, point.y - flameHeight * 0.38, point.x + baseWidth, point.y + 1);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = `rgba(${flameInner}, ${outerAlpha * 0.78})`;
            ctx.beginPath();
            ctx.moveTo(point.x - baseWidth * 0.45, point.y);
            ctx.quadraticCurveTo(point.x + lean * 0.26, point.y - flameHeight * 0.42, point.x + lean * 0.55, point.y - flameHeight * 0.72);
            ctx.quadraticCurveTo(point.x + baseWidth * 0.38, point.y - flameHeight * 0.32, point.x + baseWidth * 0.45, point.y);
            ctx.closePath();
            ctx.fill();
        }

        for (let i = 1; i < visiblePoints.length; i += 4) {
            const point = visiblePoints[i];
            const distanceFactor = clamp01(1 - Math.abs(point.x - this.x) / Math.max(1, halfWidth));
            const smokeAlpha = alpha * distanceFactor * (0.10 + k * 0.16);
            if (smokeAlpha <= 0.01) continue;
            const rise = 14 + k * 54 + point.seed * 12;
            const drift = Math.sin(this.t * 2.5 + point.seed * 10) * 10;
            const radius = 6 + point.seed * 8 + k * 5;
            ctx.fillStyle = `rgba(48, 43, 38, ${smokeAlpha})`;
            ctx.beginPath();
            ctx.ellipse(point.x + drift, point.y - rise, radius * 1.25, radius, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    _drawAirburst(ctx, k) {
        const fade = Math.max(0, 1 - k);
        const pulse = this.maxRadius * (0.32 + k * 1.1);
        const inner = this.maxRadius * (0.16 + k * 0.42);

        ctx.save();
        ctx.globalCompositeOperation = 'lighter';

        ctx.strokeStyle = `rgba(185, 240, 255, ${0.86 * fade})`;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(this.x, this.y, pulse, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = `rgba(90, 190, 255, ${0.46 * fade})`;
        ctx.lineWidth = 2;
        for (let i = 0; i < 8; i++) {
            const angle = i * Math.PI / 4 + this.seed;
            ctx.beginPath();
            ctx.moveTo(
                this.x + Math.cos(angle) * inner,
                this.y + Math.sin(angle) * inner
            );
            ctx.lineTo(
                this.x + Math.cos(angle) * pulse * 0.92,
                this.y + Math.sin(angle) * pulse * 0.92
            );
            ctx.stroke();
        }

        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.maxRadius * (0.75 + k * 0.35));
        gradient.addColorStop(0, `rgba(255, 255, 235, ${0.7 * fade})`);
        gradient.addColorStop(0.42, `rgba(98, 204, 255, ${0.34 * fade})`);
        gradient.addColorStop(1, 'rgba(55, 120, 180, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.maxRadius * (0.78 + k * 0.42), 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    _drawTankDeath(ctx, k) {
        const flash = Math.max(0, 1 - k * 3.1);
        const smokeAlpha = Math.max(0, 0.58 - k * 0.42);
        const ringRadius = this.maxRadius * (0.18 + k * 0.92);

        ctx.save();

        if (flash > 0) {
            const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.maxRadius * 0.72);
            gradient.addColorStop(0, `rgba(255, 245, 205, ${flash})`);
            gradient.addColorStop(0.38, `rgba(255, 118, 42, ${flash * 0.72})`);
            gradient.addColorStop(1, 'rgba(120, 36, 18, 0)');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.maxRadius * (0.48 + k * 0.12), 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.strokeStyle = `rgba(255, 214, 112, ${0.78 - k * 0.68})`;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(this.x, this.y, ringRadius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = `rgba(44, 36, 30, ${0.62 - k * 0.46})`;
        ctx.lineWidth = 9;
        ctx.beginPath();
        ctx.arc(this.x, this.y + this.maxRadius * 0.08, this.maxRadius * (0.12 + k * 0.56), Math.PI * 1.04, Math.PI * 1.96);
        ctx.stroke();

        ctx.fillStyle = `rgba(42, 38, 34, ${smokeAlpha})`;
        ctx.beginPath();
        ctx.ellipse(this.x, this.y - this.maxRadius * (0.08 + k * 0.58), this.maxRadius * (0.36 + k * 0.26), this.maxRadius * (0.22 + k * 0.34), 0, 0, Math.PI * 2);
        ctx.fill();

        for (const fragment of this.fragments) {
            const d = fragment.speed * k;
            const gravityDrop = this.maxRadius * 0.28 * k * k;
            const fx = this.x + Math.cos(fragment.angle) * d + fragment.drift * k;
            const fy = this.y + Math.sin(fragment.angle) * d + gravityDrop;
            const alpha = Math.max(0, 0.82 - k * 0.7);
            ctx.save();
            ctx.translate(fx, fy);
            ctx.rotate(fragment.angle + fragment.spin);
            ctx.fillStyle = fragment.soilTint > 0.55
                ? `rgba(32, 33, 34, ${alpha})`
                : `rgba(115, 78, 48, ${alpha})`;
            ctx.fillRect(-fragment.size * 0.75, -fragment.size * 0.36, fragment.size * 1.5, fragment.size * 0.72);
            ctx.restore();
        }

        ctx.restore();
    }
}

function clamp01(value) {
    return Math.max(0, Math.min(1, value));
}
