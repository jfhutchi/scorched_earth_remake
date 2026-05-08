// Tank entity. Simple body + rotating cannon. Each player owns one.
// Player 1 fires to the right (angle 0 = horizontal right, 90 = straight up).
// Player 2 fires to the left; under the hood we mirror by drawing/firing direction.

export class Tank {
    constructor({ id, x, color, facing }) {
        this.id = id;            // 1 or 2
        this.x = x;              // horizontal position (center)
        this.y = 0;              // set by terrain.heightAt
        this.color = color;
        this.facing = facing;    // +1 = right, -1 = left
        this.health = 100;
        this.angle = 45;         // degrees: 0 horizontal forward, 90 straight up
        this.power = 50;         // 10..100
        this.width = 36;
        this.height = 14;
        this.barrelLength = 22;
        this.barrelThickness = 4;
        this.alive = true;
        this.recentDamage = 0;   // floating damage popup amount
        this.damageTimer = 0;    // seconds remaining for popup
    }

    // Place tank on ground for given terrain.
    settleOn(terrain) {
        this.y = terrain.heightAt(this.x);
    }

    // World position of the cannon muzzle, used as projectile spawn point.
    muzzlePosition() {
        const rad = this.angle * Math.PI / 180;
        const turretX = this.x;
        const turretY = this.y - this.height; // top of body
        const dx = Math.cos(rad) * this.barrelLength * this.facing;
        const dy = -Math.sin(rad) * this.barrelLength;
        return { x: turretX + dx, y: turretY + dy };
    }

    // Initial velocity vector for a fired shot.
    fireVelocity() {
        const rad = this.angle * Math.PI / 180;
        // Power 10..100 -> speed multiplier; tuned to feel arcade-like.
        const speed = this.power * 6;
        return {
            vx: Math.cos(rad) * speed * this.facing,
            vy: -Math.sin(rad) * speed,
        };
    }

    // Bounding circle used for projectile hit checks.
    boundingCircle() {
        return {
            x: this.x,
            y: this.y - this.height / 2,
            r: Math.max(this.width, this.height) / 2 + 2,
        };
    }

    applyDamage(amount) {
        const dmg = Math.round(amount);
        if (dmg <= 0) return;
        this.health = Math.max(0, this.health - dmg);
        this.recentDamage = dmg;
        this.damageTimer = 1.4;
        if (this.health <= 0) this.alive = false;
    }

    update(dt) {
        if (this.damageTimer > 0) this.damageTimer -= dt;
    }

    adjustAngle(delta) {
        // Clamp 5..89 so a player can't aim into the ground or straight up.
        this.angle = Math.max(5, Math.min(89, this.angle + delta));
    }

    adjustPower(delta) {
        this.power = Math.max(10, Math.min(100, this.power + delta));
    }

    draw(ctx) {
        const baseY = this.y;
        const bodyX = this.x - this.width / 2;
        const bodyY = baseY - this.height;

        // Track / shadow under tank.
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.beginPath();
        ctx.ellipse(this.x, baseY + 2, this.width / 2 + 2, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Body
        ctx.fillStyle = this.color;
        roundRect(ctx, bodyX, bodyY, this.width, this.height, 3);
        ctx.fill();

        // Treads
        ctx.fillStyle = '#222';
        roundRect(ctx, bodyX - 2, baseY - 5, this.width + 4, 5, 2);
        ctx.fill();

        // Turret dome
        const turretR = 8;
        ctx.fillStyle = shade(this.color, -20);
        ctx.beginPath();
        ctx.arc(this.x, bodyY, turretR, Math.PI, Math.PI * 2);
        ctx.fill();

        // Cannon barrel.
        const rad = this.angle * Math.PI / 180;
        const bx = this.x;
        const by = bodyY;
        const ex = bx + Math.cos(rad) * this.barrelLength * this.facing;
        const ey = by - Math.sin(rad) * this.barrelLength;
        ctx.strokeStyle = '#1a1a1a';
        ctx.lineWidth = this.barrelThickness;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.lineTo(ex, ey);
        ctx.stroke();

        // Damage popup
        if (this.damageTimer > 0) {
            const a = Math.min(1, this.damageTimer / 1.4);
            ctx.fillStyle = `rgba(255, 80, 80, ${a})`;
            ctx.font = 'bold 18px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(`-${this.recentDamage}`, this.x, bodyY - 18 - (1 - a) * 16);
        }
    }
}

function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
}

function shade(hex, percent) {
    // Lighten/darken a hex color by percent (-100..100).
    const c = hex.replace('#', '');
    const num = parseInt(c, 16);
    let r = (num >> 16) + Math.round((percent / 100) * 255);
    let g = ((num >> 8) & 0xff) + Math.round((percent / 100) * 255);
    let b = (num & 0xff) + Math.round((percent / 100) * 255);
    r = Math.max(0, Math.min(255, r));
    g = Math.max(0, Math.min(255, g));
    b = Math.max(0, Math.min(255, b));
    return `rgb(${r},${g},${b})`;
}
