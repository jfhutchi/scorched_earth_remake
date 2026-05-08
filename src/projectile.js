// Projectile physics + rendering. Uses simple Euler integration; gravity in
// pixels/sec^2, wind in pixels/sec^2 (horizontal acceleration).

export class Projectile {
    constructor(x, y, vx, vy) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.radius = 4;
        this.alive = true;
        this.trail = [];           // recent positions for trail rendering
        this.maxTrail = 18;
    }

    update(dt, gravity, wind) {
        // Save trail point before moving so the trail follows the head.
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > this.maxTrail) this.trail.shift();

        this.vy += gravity * dt;
        this.vx += wind * dt;
        this.x += this.vx * dt;
        this.y += this.vy * dt;
    }

    draw(ctx) {
        // Trail
        for (let i = 0; i < this.trail.length; i++) {
            const p = this.trail[i];
            const a = (i + 1) / this.trail.length;
            ctx.fillStyle = `rgba(255, 230, 120, ${a * 0.6})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, this.radius * a, 0, Math.PI * 2);
            ctx.fill();
        }
        // Head
        ctx.fillStyle = '#1a1a1a';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius + 1, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffd34a';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Animated explosion effect (does not affect physics).
export class Explosion {
    constructor(x, y, maxRadius) {
        this.x = x;
        this.y = y;
        this.maxRadius = maxRadius;
        this.t = 0;
        this.duration = 0.45;
        this.alive = true;
    }

    update(dt) {
        this.t += dt;
        if (this.t >= this.duration) this.alive = false;
    }

    draw(ctx) {
        const k = Math.min(1, this.t / this.duration);
        const r = this.maxRadius * (0.4 + k * 0.9);
        // Outer shockwave
        ctx.strokeStyle = `rgba(255, 220, 80, ${1 - k})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(this.x, this.y, r, 0, Math.PI * 2);
        ctx.stroke();
        // Hot core
        const core = this.maxRadius * (1 - k * 0.6);
        const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, core);
        grad.addColorStop(0, `rgba(255, 240, 200, ${1 - k})`);
        grad.addColorStop(0.5, `rgba(255, 140, 30, ${0.85 - k * 0.85})`);
        grad.addColorStop(1, `rgba(180, 30, 30, 0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(this.x, this.y, core, 0, Math.PI * 2);
        ctx.fill();
    }
}
