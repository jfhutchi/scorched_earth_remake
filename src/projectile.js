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
        this.maxTrail = weapon.id === 'heavy' || weapon.id === 'mega' ? 26 : (weapon.id === 'clusterBomblet' ? 10 : 18);
        this.rolling = false;
        this.done = false;
    }

    update(dt, gravity, wind) {
        this.age += dt;
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > this.maxTrail) this.trail.shift();

        this.vy += gravity * dt;
        this.vx += wind * dt;
        this.x += this.vx * dt;
        this.y += this.vy * dt;
    }

    draw(ctx) {
        for (let i = 0; i < this.trail.length; i++) {
            const point = this.trail[i];
            const alpha = (i + 1) / this.trail.length;
            ctx.fillStyle = `rgba(${this.weapon.trailColor}, ${alpha * 0.48})`;
            ctx.beginPath();
            ctx.arc(point.x, point.y, Math.max(1, this.radius * alpha), 0, Math.PI * 2);
            ctx.fill();
        }

        if (this.rolling) {
            ctx.strokeStyle = 'rgba(35, 38, 42, 0.42)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius + 4, 0, Math.PI * 2);
            ctx.stroke();
        }

        ctx.fillStyle = '#1b1d20';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius + 1.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = this.weapon.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

export class Explosion {
    constructor(x, y, maxRadius, weapon) {
        this.x = x;
        this.y = y;
        this.maxRadius = maxRadius;
        this.weapon = weapon;
        this.t = 0;
        const visual = weapon.impactVisual;
        this.duration = visual === 'megaBlast' ? 0.95
            : (visual === 'heavyBlast' ? 0.78
                : (visual === 'napalmFlame' ? 1.05
                    : (visual === 'dirtPuff' ? 0.72 : 0.56)));
        this.alive = true;
        const fragmentCount = visual === 'megaBlast' ? 34
            : (visual === 'heavyBlast' ? 22
                : (visual === 'dirtPuff' ? 28
                    : (visual === 'napalmFlame' ? 24
                        : (visual === 'clusterMiniBlast' ? 8 : 13))));
        this.fragments = Array.from({ length: fragmentCount }, () => {
            const upwardBias = visual === 'dirtPuff' || visual === 'napalmFlame'
                ? -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.95
                : Math.random() * Math.PI * 2;
            return {
                angle: upwardBias,
                speed: 18 + Math.random() * maxRadius * (visual === 'megaBlast' ? 1.55 : (visual === 'heavyBlast' ? 1.35 : 1.1)),
                size: 1.5 + Math.random() * (visual === 'dirtPuff' || visual === 'napalmFlame' ? 4.5 : 3),
                drift: visual === 'dirtPuff' || visual === 'napalmFlame' ? (Math.random() - 0.5) * 18 : 0,
                soilTint: Math.random(),
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
        if (this.weapon.impactVisual === 'napalmFlame') {
            this._drawNapalm(ctx, k);
            return;
        }

        const shockRadius = this.maxRadius * (0.25 + k * 1.05);
        const coreRadius = this.maxRadius * (0.95 - k * 0.45);
        const isHeavy = this.weapon.impactVisual === 'heavyBlast';
        const isMega = this.weapon.impactVisual === 'megaBlast';
        const isCluster = this.weapon.impactVisual === 'clusterMiniBlast';

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
        const width = this.weapon.flameWidth || this.maxRadius * 1.6;
        const height = this.maxRadius * (0.22 + k * 0.24);
        const alpha = Math.max(0, 0.86 - k * 0.72);

        ctx.save();

        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, width * 0.62);
        gradient.addColorStop(0, `rgba(255, 246, 176, ${alpha})`);
        gradient.addColorStop(0.35, `rgba(255, 126, 36, ${alpha * 0.86})`);
        gradient.addColorStop(0.72, `rgba(195, 44, 25, ${alpha * 0.45})`);
        gradient.addColorStop(1, 'rgba(80, 18, 12, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.ellipse(this.x, this.y - height * 0.16, width * (0.42 + k * 0.15), height, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = `rgba(255, 198, 74, ${0.62 - k * 0.48})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(this.x, this.y, width * (0.42 + k * 0.2), this.maxRadius * 0.28, 0, 0, Math.PI * 2);
        ctx.stroke();

        for (const fragment of this.fragments) {
            const d = fragment.speed * k * 0.72;
            const fx = this.x + Math.cos(fragment.angle) * d + fragment.drift * k;
            const fy = this.y + Math.sin(fragment.angle) * d * 0.62 + this.maxRadius * 0.2 * k;
            ctx.fillStyle = fragment.soilTint > 0.5
                ? `rgba(255, 212, 86, ${0.74 - k * 0.56})`
                : `rgba(224, 68, 28, ${0.72 - k * 0.54})`;
            ctx.beginPath();
            ctx.arc(fx, fy, fragment.size * (1 - k * 0.32), 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }
}
