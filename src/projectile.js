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
        this.maxTrail = weapon.id === 'heavy' ? 24 : 18;
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
        this.duration = weapon.id === 'heavy' ? 0.78 : (weapon.id === 'dirt' ? 0.72 : 0.56);
        this.alive = true;
        const fragmentCount = weapon.id === 'heavy' ? 22 : (weapon.id === 'dirt' ? 28 : 13);
        this.fragments = Array.from({ length: fragmentCount }, () => {
            const upwardBias = weapon.id === 'dirt' ? -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.95 : Math.random() * Math.PI * 2;
            return {
                angle: upwardBias,
                speed: 18 + Math.random() * maxRadius * (weapon.id === 'heavy' ? 1.35 : 1.1),
                size: 1.5 + Math.random() * (weapon.id === 'dirt' ? 4.5 : 3),
                drift: weapon.id === 'dirt' ? (Math.random() - 0.5) * 18 : 0,
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

        const shockRadius = this.maxRadius * (0.25 + k * 1.05);
        const coreRadius = this.maxRadius * (0.95 - k * 0.45);
        const isHeavy = this.weapon.impactVisual === 'heavyBlast';

        ctx.save();

        ctx.strokeStyle = isHeavy
            ? `rgba(255, 230, 120, ${0.95 - k * 0.82})`
            : `rgba(255, 238, 145, ${0.78 - k * 0.66})`;
        ctx.lineWidth = isHeavy ? 4 : 3;
        ctx.beginPath();
        ctx.arc(this.x, this.y, shockRadius, 0, Math.PI * 2);
        ctx.stroke();

        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, coreRadius);
        gradient.addColorStop(0, `rgba(255, 248, 218, ${isHeavy ? 0.95 - k * 0.55 : 0.82 - k * 0.58})`);
        gradient.addColorStop(0.36, `rgba(255, 137, 38, ${isHeavy ? 0.86 - k * 0.48 : 0.68 - k * 0.50})`);
        gradient.addColorStop(1, `rgba(120, 40, 24, ${isHeavy ? 0.08 * (1 - k) : 0})`);
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
}
