import { Terrain } from './terrain.js';
import { Tank } from './tank.js';
import { Projectile, Explosion } from './projectile.js';

// Tunables
const GRAVITY = 520;            // px/s^2
const WIND_ACCEL_SCALE = 30;    // wind value -> px/s^2
const EXPLOSION_RADIUS = 45;
const MAX_DAMAGE = 55;
const PROJECTILE_DT_CAP = 1 / 60; // sub-step cap for stable collisions

export class Game {
    constructor(canvas, ui) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.ui = ui;

        this.width = canvas.width;
        this.height = canvas.height;

        this.keys = new Set();
        this.lastFrame = performance.now();
        this.running = false;
        this.gameOver = false;

        this.terrain = null;
        this.tanks = [];
        this.currentPlayer = 0;
        this.projectile = null;
        this.explosions = [];
        this.wind = 0; // signed value, randomised each turn

        // Per-frame angle/power adjust accumulators.
        this._angleAcc = 0;
        this._powerAcc = 0;

        this._setupInput();
    }

    start() {
        this.reset();
        this.running = true;
        this.lastFrame = performance.now();
        requestAnimationFrame(this.loop);
    }

    stop() {
        this.running = false;
    }

    reset() {
        this.terrain = new Terrain(this.width, this.height);
        const t1 = new Tank({ id: 1, x: this.width * 0.12, color: '#ff7b3a', facing: +1 });
        const t2 = new Tank({ id: 2, x: this.width * 0.88, color: '#58a6ff', facing: -1 });
        // Player 2's default angle should arc to the left.
        t2.angle = 45;

        // Make sure tanks sit on something flat-ish — flatten a small pad
        // under each tank so they don't spawn on a steep slope.
        this._flattenAround(t1.x, 24);
        this._flattenAround(t2.x, 24);

        t1.settleOn(this.terrain);
        t2.settleOn(this.terrain);
        this.tanks = [t1, t2];
        this.currentPlayer = 0;
        this.projectile = null;
        this.explosions = [];
        this.gameOver = false;
        this._rollWind();
        this.ui.hideWin();
        this.ui.update(this._state());
    }

    _flattenAround(x, halfWidth) {
        const xMin = Math.max(0, Math.floor(x - halfWidth));
        const xMax = Math.min(this.width - 1, Math.ceil(x + halfWidth));
        let avg = 0;
        for (let i = xMin; i <= xMax; i++) avg += this.terrain.heights[i];
        avg /= (xMax - xMin + 1);
        for (let i = xMin; i <= xMax; i++) this.terrain.heights[i] = avg;
    }

    _rollWind() {
        // Wind in [-3, 3], rounded to one decimal.
        this.wind = Math.round((Math.random() * 6 - 3) * 10) / 10;
    }

    _state() {
        return {
            tanks: this.tanks,
            currentPlayer: this.currentPlayer,
            wind: this.wind,
        };
    }

    _setupInput() {
        window.addEventListener('keydown', (e) => {
            // Only handle keys when game is running and visible.
            if (!this.running) return;
            if (e.repeat) {
                this.keys.add(e.key);
                return;
            }
            this.keys.add(e.key);

            if (e.key === ' ' || e.code === 'Space') {
                e.preventDefault();
                this._tryFire();
            } else if (e.key === 'r' || e.key === 'R') {
                this.reset();
            } else if (e.key === 'Escape') {
                this._returnToMenu();
            } else if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
                e.preventDefault();
            }
        });
        window.addEventListener('keyup', (e) => {
            this.keys.delete(e.key);
        });
    }

    _returnToMenu() {
        this.running = false;
        this.ui.showMenu();
    }

    _activeTank() {
        return this.tanks[this.currentPlayer];
    }

    _tryFire() {
        if (this.gameOver) return;
        if (this.projectile) return; // already mid-shot
        const tank = this._activeTank();
        if (!tank.alive) return;
        const muzzle = tank.muzzlePosition();
        const v = tank.fireVelocity();
        this.projectile = new Projectile(muzzle.x, muzzle.y, v.vx, v.vy);
    }

    _endTurn() {
        if (this.gameOver) return;
        this.currentPlayer = (this.currentPlayer + 1) % 2;
        this._rollWind();
        // Tanks may shift if terrain changed beneath them.
        this.tanks.forEach((t) => t.settleOn(this.terrain));
        this._checkWinCondition();
    }

    _checkWinCondition() {
        const alive = this.tanks.filter((t) => t.alive);
        if (alive.length === 1) {
            this.gameOver = true;
            const winner = alive[0];
            this.ui.showWin(`Player ${winner.id} Wins!`);
        } else if (alive.length === 0) {
            this.gameOver = true;
            this.ui.showWin(`Draw!`);
        }
    }

    // --- Frame loop ---
    loop = (now) => {
        if (!this.running) return;
        let dt = (now - this.lastFrame) / 1000;
        this.lastFrame = now;
        if (dt > 0.05) dt = 0.05; // avoid huge dt after tab switch
        this._update(dt);
        this._draw();
        requestAnimationFrame(this.loop);
    };

    _update(dt) {
        // Aim controls only apply when no projectile is in flight.
        if (!this.projectile && !this.gameOver) {
            const tank = this._activeTank();
            const angleSpeed = 60;  // deg/sec
            const powerSpeed = 50;  // pwr/sec

            // Angle is stored in the tank's local frame (0 = forward along
            // facing, 90 = straight up). Left arrow = raise barrel, right
            // arrow = lower barrel for both players. This means each player's
            // controls feel mirrored on screen, but consistent ("left = up,
            // right = down") regardless of which side they're on.
            let angleDelta = 0;
            if (this.keys.has('ArrowLeft')) angleDelta += 1;
            if (this.keys.has('ArrowRight')) angleDelta -= 1;
            tank.adjustAngle(angleDelta * angleSpeed * dt);

            let powerDelta = 0;
            if (this.keys.has('ArrowUp')) powerDelta += 1;
            if (this.keys.has('ArrowDown')) powerDelta -= 1;
            tank.adjustPower(powerDelta * powerSpeed * dt);
        }

        // Tank damage popups
        this.tanks.forEach((t) => t.update(dt));

        // Projectile + collisions (sub-step for fast shots so we don't tunnel).
        if (this.projectile) {
            const wind = this.wind * WIND_ACCEL_SCALE;
            let remaining = dt;
            while (remaining > 0 && this.projectile) {
                const step = Math.min(remaining, PROJECTILE_DT_CAP);
                this.projectile.update(step, GRAVITY, wind);
                this._checkProjectileCollision();
                remaining -= step;
            }
        }

        // Explosions
        for (const ex of this.explosions) ex.update(dt);
        this.explosions = this.explosions.filter((e) => e.alive);

        this.ui.update(this._state());
    }

    _checkProjectileCollision() {
        const p = this.projectile;
        if (!p) return;

        // Out of bounds (off sides or above sky beyond a margin we ignore;
        // top is fine, bottom counts as terrain below screen).
        if (p.x < -50 || p.x > this.width + 50 || p.y > this.height + 50) {
            this.projectile = null;
            this._endTurn();
            return;
        }

        // Tank collision
        for (const tank of this.tanks) {
            if (!tank.alive) continue;
            const c = tank.boundingCircle();
            const dx = p.x - c.x;
            const dy = p.y - c.y;
            if (dx * dx + dy * dy <= (c.r + p.radius) * (c.r + p.radius)) {
                this._explodeAt(p.x, p.y);
                this.projectile = null;
                this._endTurn();
                return;
            }
        }

        // Terrain collision: hit when projectile is at or below ground top.
        if (p.x >= 0 && p.x < this.width) {
            const groundY = this.terrain.heightAt(p.x);
            if (p.y >= groundY) {
                this._explodeAt(p.x, groundY);
                this.projectile = null;
                this._endTurn();
                return;
            }
        }
    }

    _explodeAt(x, y) {
        const radius = EXPLOSION_RADIUS;
        // Carve terrain
        this.terrain.explode(x, y, radius);
        // Damage tanks within radius (distance-based falloff)
        for (const tank of this.tanks) {
            if (!tank.alive) continue;
            const tx = tank.x;
            const ty = tank.y - tank.height / 2;
            const dx = tx - x;
            const dy = ty - y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist <= radius) {
                const dmg = MAX_DAMAGE * (1 - dist / radius);
                tank.applyDamage(dmg);
            }
        }
        // Visual
        this.explosions.push(new Explosion(x, y, radius));
    }

    _draw() {
        const ctx = this.ctx;
        const w = this.width;
        const h = this.height;

        // Sky gradient
        const sky = ctx.createLinearGradient(0, 0, 0, h);
        sky.addColorStop(0, '#7ec4f0');
        sky.addColorStop(1, '#cfe9fb');
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, w, h);

        // Decorative sun
        ctx.fillStyle = 'rgba(255, 240, 180, 0.9)';
        ctx.beginPath();
        ctx.arc(w * 0.85, h * 0.18, 36, 0, Math.PI * 2);
        ctx.fill();

        // Terrain
        this.terrain.draw(ctx);

        // Tanks
        for (const t of this.tanks) {
            if (t.alive) t.draw(ctx);
            else this._drawWreck(ctx, t);
        }

        // Aim indicator on active tank (dashed faint line) when idle.
        if (!this.projectile && !this.gameOver) {
            this._drawAimGuide(ctx, this._activeTank());
        }

        // Projectile
        if (this.projectile) this.projectile.draw(ctx);

        // Explosions
        for (const ex of this.explosions) ex.draw(ctx);

        // Wind indicator (subtle arrow at top center of canvas)
        this._drawWindIndicator(ctx);
    }

    _drawWreck(ctx, tank) {
        // Burnt-out tank silhouette + smoke wisp
        const bodyX = tank.x - tank.width / 2;
        const bodyY = tank.y - tank.height;
        ctx.fillStyle = '#3a3a3a';
        ctx.fillRect(bodyX, bodyY, tank.width, tank.height);
        ctx.fillStyle = 'rgba(80,80,80,0.5)';
        ctx.beginPath();
        ctx.arc(tank.x, bodyY - 8, 6, 0, Math.PI * 2);
        ctx.arc(tank.x + 4, bodyY - 18, 8, 0, Math.PI * 2);
        ctx.fill();
    }

    _drawAimGuide(ctx, tank) {
        const muzzle = tank.muzzlePosition();
        const rad = tank.angle * Math.PI / 180;
        const len = 30 + tank.power * 0.4;
        const ex = muzzle.x + Math.cos(rad) * len * tank.facing;
        const ey = muzzle.y - Math.sin(rad) * len;
        ctx.save();
        ctx.strokeStyle = 'rgba(255,255,255,0.65)';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 5]);
        ctx.beginPath();
        ctx.moveTo(muzzle.x, muzzle.y);
        ctx.lineTo(ex, ey);
        ctx.stroke();
        ctx.restore();
    }

    _drawWindIndicator(ctx) {
        const w = this.width;
        const cx = w / 2;
        const cy = 92;
        if (this.wind === 0) return;
        const dir = Math.sign(this.wind);
        const len = 20 + Math.abs(this.wind) * 10;
        ctx.save();
        ctx.strokeStyle = 'rgba(255,255,255,0.85)';
        ctx.fillStyle = 'rgba(255,255,255,0.85)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx - dir * len / 2, cy);
        ctx.lineTo(cx + dir * len / 2, cy);
        ctx.stroke();
        // Arrowhead
        ctx.beginPath();
        ctx.moveTo(cx + dir * len / 2, cy);
        ctx.lineTo(cx + dir * (len / 2 - 6), cy - 4);
        ctx.lineTo(cx + dir * (len / 2 - 6), cy + 4);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }
}
