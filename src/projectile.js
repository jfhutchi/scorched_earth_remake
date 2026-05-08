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
        this.duration = weapon.id === 'heavy' ? 0.7 : 0.58;
        this.alive = true;
        this.fragments = Array.from({ length: weapon.id === 'dirt' ? 18 : 13 }, () => ({
            angle: Math.random() * Math.PI * 2,
            speed: 18 + Math.random() * maxRadius * 1.1,
            size: 1.5 + Math.random() * 3,
        }));
    }

    update(dt) {
        this.t += dt;
        if (this.t >= this.duration) this.alive = false;
    }

    draw(ctx) {
        const k = Math.min(1, this.t / this.duration);
        const shockRadius = this.maxRadius * (0.25 + k * 1.05);
        const coreRadius = this.maxRadius * (0.95 - k * 0.45);

        ctx.save();

        ctx.strokeStyle = `rgba(255, 238, 145, ${1 - k})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(this.x, this.y, shockRadius, 0, Math.PI * 2);
        ctx.stroke();

        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, coreRadius);
        gradient.addColorStop(0, `rgba(255, 248, 218, ${0.9 - k * 0.6})`);
        gradient.addColorStop(0.38, `rgba(255, 137, 38, ${0.78 - k * 0.55})`);
        gradient.addColorStop(1, 'rgba(120, 40, 24, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, coreRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = this.weapon.id === 'dirt'
            ? `rgba(98, 64, 38, ${0.75 - k * 0.55})`
            : `rgba(55, 45, 38, ${0.55 - k * 0.45})`;
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
}
