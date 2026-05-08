import { Terrain } from './terrain.js';
import { Tank } from './tank.js';
import { Projectile, Explosion } from './projectile.js';
import { AudioManager } from './audio.js';
import { CPUController } from './cpu.js';
import { CONFIG, WEAPONS, clamp, getWeaponById } from './config.js';

export class Game {
    constructor(canvas, ui) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.ui = ui;
        this.audio = new AudioManager();
        this.cpu = new CPUController();

        this.width = canvas.width;
        this.height = canvas.height;
        this.keys = new Set();
        this.lastFrame = performance.now();
        this.running = false;
        this.gameMode = 'two-player';
        this.roundNumber = 0;
        this.score = [0, 0];
        this.phase = 'menu';
        this.phaseTimer = 0;
        this.cpuTimer = 0;
        this.gameOver = false;
        this.terrain = null;
        this.tanks = [];
        this.currentPlayer = 0;
        this.projectile = null;
        this.explosions = [];
        this.wind = 0;
        this.lastResult = 'Choose a mode to start.';
        this.statusMessage = 'Main menu';
        this.shotInfo = null;

        this._setupInput();
        this.ui.setMuted(this.audio.muted);
    }

    start(mode = 'two-player') {
        this.gameMode = mode;
        this.score = [0, 0];
        this.roundNumber = 0;
        this._setupRound({ incrementRound: true });

        if (!this.running) {
            this.running = true;
            this.lastFrame = performance.now();
            requestAnimationFrame(this.loop);
        }
    }

    stop() {
        this.running = false;
        this.phase = 'menu';
        this.keys.clear();
    }

    returnToMenu() {
        this.stop();
        this.ui.showMenu();
    }

    startNewMatch(mode = this.gameMode) {
        this.gameMode = mode;
        this.score = [0, 0];
        this.roundNumber = 0;
        this._setupRound({ incrementRound: true });

        if (!this.running) {
            this.running = true;
            this.lastFrame = performance.now();
            requestAnimationFrame(this.loop);
        }
    }

    resetCurrentRound() {
        if (this.phase === 'menu') return;
        this._setupRound({ incrementRound: false });
    }

    nextRound() {
        if (!this.gameOver) return;
        this._setupRound({ incrementRound: true });
    }

    toggleMute() {
        const muted = this.audio.toggleMute();
        this.ui.setMuted(muted);
        return muted;
    }

    advanceTime(ms) {
        if (!this.terrain) return;
        const steps = Math.max(1, Math.round(ms / (1000 / 60)));
        for (let i = 0; i < steps; i++) this._update(1 / 60);
        this._draw();
    }

    renderTextState() {
        const active = this.tanks[this.currentPlayer] || null;
        const payload = {
            coordinateSystem: 'Canvas pixels, origin top-left, x right, y down.',
            mode: this.gameMode,
            phase: this.phase,
            round: this.roundNumber,
            score: {
                player1: this.score[0],
                player2: this.score[1],
            },
            currentPlayer: active ? active.name : null,
            controlsLocked: !this._canHumanControl(),
            wind: this.wind,
            lastResult: this.lastResult,
            status: this.statusMessage,
            tanks: this.tanks.map((tank) => ({
                name: tank.name,
                x: Math.round(tank.x),
                y: Math.round(tank.y),
                health: tank.health,
                alive: tank.alive,
                angle: Math.round(tank.angle),
                power: Math.round(tank.power),
                movementFuel: Math.round(tank.movementFuel),
                isCpu: tank.isCpu,
                selectedWeapon: tank.selectedWeapon().name,
                ammo: tank.weaponSnapshot().map((weapon) => ({
                    name: weapon.name,
                    ammo: Number.isFinite(weapon.ammo) ? weapon.ammo : 'unlimited',
                    selected: weapon.selected,
                })),
            })),
            projectile: this.projectile
                ? {
                    x: Math.round(this.projectile.x),
                    y: Math.round(this.projectile.y),
                    weapon: this.projectile.weapon.name,
                }
                : null,
        };
        return JSON.stringify(payload);
    }

    _setupRound({ incrementRound }) {
        if (incrementRound || this.roundNumber === 0) this.roundNumber += 1;

        this.terrain = new Terrain(this.width, this.height);
        const x1 = this.terrain.findStableSpawn(0.11, 0.33);
        this.terrain.flattenPad(x1);
        let x2 = this.terrain.findStableSpawn(0.67, 0.89, x1);
        if (Math.abs(x2 - x1) < CONFIG.terrain.minSpawnDistance) {
            x2 = clamp(x1 + CONFIG.terrain.minSpawnDistance, this.width * 0.62, this.width * 0.9);
        }
        this.terrain.flattenPad(x2);

        const p2IsCpu = this.gameMode === 'cpu';
        const p1 = new Tank({ id: 1, name: 'Player 1', x: x1, color: '#f16f45', facing: 1 });
        const p2 = new Tank({
            id: 2,
            name: p2IsCpu ? 'CPU' : 'Player 2',
            x: x2,
            color: '#3b87d6',
            facing: -1,
            isCpu: p2IsCpu,
        });

        p1.settleOn(this.terrain);
        p2.settleOn(this.terrain);

        this.tanks = [p1, p2];
        this.currentPlayer = 0;
        this.projectile = null;
        this.explosions = [];
        this.phaseTimer = 0;
        this.cpuTimer = 0;
        this.gameOver = false;
        this.shotInfo = null;
        this.cpu.resetRound();
        this.keys.clear();
        this._rollWind();

        this.lastResult = `Round ${this.roundNumber} ready.`;
        this.statusMessage = 'Player 1 is aiming.';
        this.ui.hideWin();
        this._startTurn(false);
        this._draw();
        this.ui.update(this._state());
    }

    _rollWind() {
        const raw = CONFIG.wind.min + Math.random() * (CONFIG.wind.max - CONFIG.wind.min);
        this.wind = Math.round(raw * 10) / 10;
        if (Math.abs(this.wind) < 0.15) this.wind = 0;
    }

    _state() {
        const active = this.tanks[this.currentPlayer] || null;
        const selectedWeapon = active ? active.selectedWeapon() : WEAPONS[0];
        return {
            tanks: this.tanks,
            currentPlayer: this.currentPlayer,
            active,
            selectedWeapon,
            gameMode: this.gameMode,
            roundNumber: this.roundNumber,
            score: this.score,
            phase: this.phase,
            wind: this.wind,
            lastResult: this.lastResult,
            statusMessage: this.statusMessage,
            gameOver: this.gameOver,
            muted: this.audio.muted,
        };
    }

    _setupInput() {
        window.addEventListener('keydown', (e) => {
            if (e.key === 'm' || e.key === 'M') {
                e.preventDefault();
                this.toggleMute();
                return;
            }

            if (!this.running) return;

            if (e.key === 'Escape') {
                e.preventDefault();
                this.returnToMenu();
                return;
            }

            if ((e.key === 'r' || e.key === 'R') && !e.repeat) {
                e.preventDefault();
                this.resetCurrentRound();
                return;
            }

            if ((e.key === 'n' || e.key === 'N') && !e.repeat) {
                e.preventDefault();
                this.nextRound();
                return;
            }

            if ((e.key === 'Tab' || e.key === 'w' || e.key === 'W') && !e.repeat) {
                e.preventDefault();
                this._cycleWeapon();
                return;
            }

            if (e.key === ' ' || e.code === 'Space') {
                e.preventDefault();
                if (!e.repeat && this._canHumanControl()) this._fireSelectedWeapon();
                return;
            }

            if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'a', 'A', 'd', 'D'].includes(e.key)) {
                e.preventDefault();
                this.keys.add(e.key);
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys.delete(e.key);
        });
    }

    _cycleWeapon() {
        if (!this._canHumanControl()) return;
        const tank = this._activeTank();
        const weapon = tank.cycleWeapon();
        this.statusMessage = `${tank.name} selected ${weapon.name}.`;
        this.ui.update(this._state());
    }

    _activeTank() {
        return this.tanks[this.currentPlayer];
    }

    _canHumanControl() {
        const active = this._activeTank();
        return Boolean(
            this.running &&
            !this.gameOver &&
            this.phase === 'aiming' &&
            active &&
            active.alive &&
            !active.isCpu &&
            !this.projectile
        );
    }

    _startTurn(playSound = true) {
        if (this.gameOver) return;
        const active = this._activeTank();
        active.ensureAvailableWeapon();
        active.resetMovementFuel();

        if (active.isCpu) {
            this.phase = 'cpuThinking';
            this.cpuTimer = CONFIG.turn.cpuThinkSeconds + Math.random() * CONFIG.turn.cpuThinkJitterSeconds;
            this.statusMessage = `${active.name} is thinking.`;
        } else {
            this.phase = 'aiming';
            this.statusMessage = `${active.name} is aiming.`;
        }

        if (playSound) this.audio.playTurn();
        this.ui.update(this._state());
    }

    loop = (now) => {
        if (!this.running) return;

        let dt = (now - this.lastFrame) / 1000;
        this.lastFrame = now;
        if (dt > 0.05) dt = 0.05;

        this._update(dt);
        this._draw();
        requestAnimationFrame(this.loop);
    };

    _update(dt) {
        if (!this.terrain) return;

        if (this.phase === 'aiming' && this._canHumanControl()) {
            this._updateHumanAim(dt);
            this._updateHumanMovement(dt);
        }

        if (this.phase === 'cpuThinking') {
            this.cpuTimer -= dt;
            if (this.cpuTimer <= 0) this._fireCpuShot();
        }

        this.tanks.forEach((tank) => tank.update(dt));

        if (this.projectile && this.phase === 'projectile') {
            this._updateProjectile(dt);
        }

        this.explosions.forEach((explosion) => explosion.update(dt));
        this.explosions = this.explosions.filter((explosion) => explosion.alive);

        if (this.phase === 'resolving') {
            this.phaseTimer -= dt;
            if (this.phaseTimer <= 0) this._finishShotResolution();
        }

        this.ui.update(this._state());
    }

    _updateHumanAim(dt) {
        const tank = this._activeTank();
        const angleSpeed = 60;
        const powerSpeed = 50;

        let angleDelta = 0;
        if (this.keys.has('ArrowLeft')) angleDelta += 1;
        if (this.keys.has('ArrowRight')) angleDelta -= 1;
        if (angleDelta !== 0) tank.adjustAngle(angleDelta * angleSpeed * dt);

        let powerDelta = 0;
        if (this.keys.has('ArrowUp')) powerDelta += 1;
        if (this.keys.has('ArrowDown')) powerDelta -= 1;
        if (powerDelta !== 0) tank.adjustPower(powerDelta * powerSpeed * dt);
    }

    _updateHumanMovement(dt) {
        const tank = this._activeTank();
        if (tank.movementFuel <= 0) return;

        let direction = 0;
        if (this.keys.has('a') || this.keys.has('A')) direction -= 1;
        if (this.keys.has('d') || this.keys.has('D')) direction += 1;
        if (direction === 0) return;

        const distance = Math.min(CONFIG.tank.moveSpeed * dt, tank.movementFuel);
        if (distance <= 0) return;

        const moved = this._tryMoveTank(tank, direction * distance);
        if (moved) {
            tank.spendMovementFuel(Math.abs(moved));
            this.statusMessage = tank.movementFuel > 0
                ? `${tank.name} is repositioning.`
                : `${tank.name} has no movement fuel left.`;
        } else {
            this.statusMessage = `${tank.name} cannot drive there.`;
        }
    }

    _tryMoveTank(tank, deltaX) {
        if (!this.terrain || deltaX === 0) return 0;

        const nextX = tank.x + deltaX;
        const halfWidth = tank.width / 2;
        const minX = Math.max(CONFIG.tank.spawnMargin * 0.35, halfWidth + 4);
        const maxX = Math.min(this.width - CONFIG.tank.spawnMargin * 0.35, this.width - halfWidth - 4);
        if (nextX < minX || nextX > maxX) return 0;

        for (const other of this.tanks) {
            if (other === tank || !other.alive) continue;
            if (Math.abs(nextX - other.x) < CONFIG.tank.minTankSeparation) return 0;
        }

        const nextY = this.terrain.heightAt(nextX);
        const leftY = this.terrain.heightAt(nextX - halfWidth);
        const rightY = this.terrain.heightAt(nextX + halfWidth);
        const acrossDelta = Math.abs(leftY - rightY);
        const stepDelta = Math.abs(nextY - tank.y);
        if (acrossDelta > CONFIG.tank.maxClimbDelta || stepDelta > CONFIG.tank.maxClimbDelta) {
            return 0;
        }

        tank.x = nextX;
        tank.settleOn(this.terrain);
        return deltaX;
    }

    _fireCpuShot() {
        if (this.gameOver || this.phase !== 'cpuThinking') return;
        const shooter = this._activeTank();
        if (!shooter || !shooter.isCpu || !shooter.alive) return;

        const target = this.tanks[0];
        const action = this.cpu.chooseAction({
            shooter,
            target,
            terrain: this.terrain,
            wind: this.wind,
        });

        shooter.selectWeaponById(action.weaponId);
        shooter.angle = action.angle;
        shooter.power = action.power;
        this.phase = 'aiming';
        this._fireSelectedWeapon();
    }

    _fireSelectedWeapon() {
        if (this.gameOver || this.projectile) return false;
        const shooter = this._activeTank();
        if (!shooter || !shooter.alive) return false;

        const weapon = shooter.selectedWeapon();
        if (!shooter.canUseWeapon(weapon.id)) {
            shooter.ensureAvailableWeapon();
            this.statusMessage = `${shooter.name} has no ammo for that weapon.`;
            return false;
        }

        if (!shooter.consumeSelectedAmmo()) return false;

        const muzzle = shooter.muzzlePosition();
        const velocity = shooter.fireVelocity(weapon);
        this.projectile = new Projectile(muzzle.x, muzzle.y, velocity.vx, velocity.vy, weapon);
        this.shotInfo = {
            shooterIndex: this.currentPlayer,
            targetIndex: this.currentPlayer === 0 ? 1 : 0,
            weaponId: weapon.id,
            collision: 'miss',
            impactX: muzzle.x,
            impactY: muzzle.y,
            enemyDamage: 0,
            selfDamage: 0,
            totalDamage: 0,
            minTargetDistance: Infinity,
        };
        this.phase = 'projectile';
        this.statusMessage = `${shooter.name} fired ${weapon.name}.`;
        this.audio.playFire(weapon);
        this.ui.update(this._state());
        return true;
    }

    _updateProjectile(dt) {
        const windAccel = this.wind * CONFIG.physics.windAccelScale;
        let remaining = dt;

        while (remaining > 0 && this.projectile) {
            const step = Math.min(remaining, CONFIG.physics.projectileStep);
            this.projectile.update(step, CONFIG.physics.gravity, windAccel);
            this._trackProjectileDistance();
            this._checkProjectileCollision();
            remaining -= step;
        }
    }

    _trackProjectileDistance() {
        if (!this.projectile || !this.shotInfo) return;
        const target = this.tanks[this.shotInfo.targetIndex];
        if (!target) return;
        const circle = target.boundingCircle();
        const dx = this.projectile.x - circle.x;
        const dy = this.projectile.y - circle.y;
        this.shotInfo.minTargetDistance = Math.min(this.shotInfo.minTargetDistance, Math.sqrt(dx * dx + dy * dy));
    }

    _checkProjectileCollision() {
        if (this.gameOver || !this.projectile) return;

        const p = this.projectile;
        if (p.x < -80 || p.x > this.width + 80 || p.y > this.height + 90) {
            this._resolveMiss(p.x, p.y);
            return;
        }

        for (let i = 0; i < this.tanks.length; i++) {
            const tank = this.tanks[i];
            if (!tank.alive) continue;
            if (this.shotInfo && i === this.shotInfo.shooterIndex && p.age < 0.2) continue;

            const circle = tank.boundingCircle();
            const dx = p.x - circle.x;
            const dy = p.y - circle.y;
            const hitRadius = circle.r + p.radius;
            if (dx * dx + dy * dy <= hitRadius * hitRadius) {
                this._resolveImpact(p.x, p.y, 'tank');
                return;
            }
        }

        if (p.x >= 0 && p.x < this.width) {
            const groundY = this.terrain.heightAt(p.x);
            if (p.y >= groundY) {
                this._resolveImpact(p.x, groundY, 'terrain');
            }
        }
    }

    _resolveMiss(x, y) {
        if (!this.shotInfo) return;
        this.shotInfo.impactX = x;
        this.shotInfo.impactY = y;
        this.shotInfo.collision = 'miss';
        this.projectile = null;
        this.phase = 'resolving';
        this.phaseTimer = 0.55;
        this.lastResult = 'Missed. No damage.';
        this.statusMessage = 'Shot missed.';
    }

    _resolveImpact(x, y, collision) {
        if (!this.projectile || !this.shotInfo) return;

        const weapon = this.projectile.weapon;
        this.shotInfo.impactX = x;
        this.shotInfo.impactY = y;
        this.shotInfo.collision = collision;
        this.projectile = null;

        const result = this._applyExplosionDamage(x, y, weapon, collision);
        const terrainMessage = this._applyTerrainEffect(x, y, weapon);
        this.tanks.forEach((tank) => tank.settleOn(this.terrain));
        this.lastResult = `${result.message} ${terrainMessage}`;
        this.statusMessage = 'Impact resolving.';

        const explosion = new Explosion(x, y, weapon.explosionRadius, weapon);
        this.explosions.push(explosion);
        this.phase = 'resolving';
        this.phaseTimer = Math.max(CONFIG.turn.impactDelaySeconds, explosion.duration + 0.15);

        this.audio.playExplosion(weapon);
        if (result.totalDamage > 0) this.audio.playHit();
    }

    _applyTerrainEffect(x, y, weapon) {
        if (weapon.behavior === 'addTerrain') {
            this.terrain.addMound(x, y, weapon.terrainEffectRadius, weapon.terrainEffectStrength);
            return weapon.terrainMessage;
        }

        this.terrain.explode(x, y, weapon.terrainEffectRadius, weapon.terrainEffectStrength);
        return weapon.terrainMessage;
    }

    _applyExplosionDamage(x, y, weapon, collision) {
        let totalDamage = 0;
        let enemyDamage = 0;
        let selfDamage = 0;
        const shooter = this.tanks[this.shotInfo.shooterIndex];
        const target = this.tanks[this.shotInfo.targetIndex];

        for (let i = 0; i < this.tanks.length; i++) {
            const tank = this.tanks[i];
            if (!tank.alive) continue;

            const circle = tank.boundingCircle();
            const dx = circle.x - x;
            const dy = circle.y - y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > weapon.damageRadius + circle.r * 0.35) continue;

            const normalized = clamp(1 - dist / weapon.damageRadius, 0, 1);
            let falloff = Math.pow(normalized, weapon.damageFalloff);
            const directBonus = collision === 'tank' && i === this.shotInfo.targetIndex ? 1.08 : 1;
            if (collision === 'tank' && i === this.shotInfo.targetIndex) {
                falloff = Math.max(falloff, 0.82);
            }
            const damage = tank.applyDamage(Math.min(weapon.maxDamage, weapon.maxDamage * falloff * directBonus));
            totalDamage += damage;
            if (i === this.shotInfo.targetIndex) enemyDamage += damage;
            if (i === this.shotInfo.shooterIndex) selfDamage += damage;
        }

        this.shotInfo.totalDamage = totalDamage;
        this.shotInfo.enemyDamage = enemyDamage;
        this.shotInfo.selfDamage = selfDamage;

        const prefix = collision === 'tank' || enemyDamage >= weapon.maxDamage * 0.55
            ? 'Direct hit!'
            : (enemyDamage > 0 || this.shotInfo.minTargetDistance <= weapon.damageRadius + 48)
                ? 'Near miss!'
                : 'Missed.';

        const details = [];
        if (enemyDamage > 0) {
            details.push(`${target.name} took ${enemyDamage} damage.`);
        }
        if (selfDamage > 0) {
            details.push(`${shooter.name} took ${selfDamage} self-damage.`);
        }
        if (details.length === 0) {
            details.push('No damage.');
        }

        return {
            totalDamage,
            message: `${prefix} ${details.join(' ')}`,
        };
    }

    _finishShotResolution() {
        this.tanks.forEach((tank) => tank.settleOn(this.terrain));

        if (this.shotInfo && this.shotInfo.shooterIndex === 1 && this.tanks[1].isCpu) {
            this.cpu.recordShot({
                hit: this.shotInfo.enemyDamage > 0,
                impactX: this.shotInfo.impactX,
                targetX: this.tanks[0].x,
            });
        }

        if (this._checkWinCondition()) {
            this.ui.update(this._state());
            return;
        }

        this.currentPlayer = this.currentPlayer === 0 ? 1 : 0;
        this.shotInfo = null;
        this._rollWind();
        this._startTurn(true);
    }

    _checkWinCondition() {
        const alive = this.tanks
            .map((tank, index) => ({ tank, index }))
            .filter((entry) => entry.tank.alive);

        if (alive.length === this.tanks.length) return false;

        this.gameOver = true;
        this.phase = 'gameOver';
        this.projectile = null;
        this.keys.clear();

        if (alive.length === 1) {
            const winner = alive[0];
            this.score[winner.index] += 1;
            this.lastResult = `${winner.tank.name} wins round ${this.roundNumber}.`;
            this.statusMessage = 'Round over.';
            this.ui.showWin(`${winner.tank.name} Wins!`, this._state());
        } else {
            this.lastResult = `Round ${this.roundNumber} ended in a draw.`;
            this.statusMessage = 'Round over.';
            this.ui.showWin('Draw!', this._state());
        }

        this.audio.playTurn();
        return true;
    }

    _draw() {
        if (!this.terrain) return;
        const ctx = this.ctx;
        const w = this.width;
        const h = this.height;

        const sky = ctx.createLinearGradient(0, 0, 0, h);
        sky.addColorStop(0, '#80c8ed');
        sky.addColorStop(0.58, '#d3ecf7');
        sky.addColorStop(1, '#edf8fa');
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, w, h);

        this._drawSkyDetails(ctx);
        this.terrain.draw(ctx);

        for (const tank of this.tanks) {
            if (tank.alive) tank.draw(ctx);
            else this._drawWreck(ctx, tank);
        }

        if (this._canHumanControl()) {
            this._drawTrajectoryPreview(ctx, this._activeTank());
        }

        if (this.projectile) this.projectile.draw(ctx);
        for (const explosion of this.explosions) explosion.draw(ctx);

        this._drawWindIndicator(ctx);
    }

    _drawSkyDetails(ctx) {
        const w = this.width;
        const h = this.height;

        ctx.fillStyle = 'rgba(255, 236, 166, 0.95)';
        ctx.beginPath();
        ctx.arc(w * 0.84, h * 0.16, 38, 0, Math.PI * 2);
        ctx.fill();

        drawCloud(ctx, w * 0.16, h * 0.16, 1.1);
        drawCloud(ctx, w * 0.44, h * 0.12, 0.8);
        drawCloud(ctx, w * 0.68, h * 0.24, 0.95);
    }

    _drawWreck(ctx, tank) {
        const bodyX = tank.x - tank.width / 2;
        const bodyY = tank.y - tank.height;
        ctx.save();
        ctx.fillStyle = '#2a2a2a';
        ctx.fillRect(bodyX, bodyY, tank.width, tank.height);
        ctx.fillStyle = 'rgba(65, 65, 65, 0.55)';
        ctx.beginPath();
        ctx.arc(tank.x - 5, bodyY - 8, 7, 0, Math.PI * 2);
        ctx.arc(tank.x + 5, bodyY - 20, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    _drawTrajectoryPreview(ctx, tank) {
        const weapon = tank.selectedWeapon();
        const muzzle = tank.muzzlePosition();
        const velocity = tank.fireVelocity(weapon);
        let x = muzzle.x;
        let y = muzzle.y;
        let vx = velocity.vx;
        let vy = velocity.vy;
        const dt = 1 / 30;
        const points = [];

        for (let i = 0; i < 54; i++) {
            vy += CONFIG.physics.gravity * dt;
            vx += this.wind * CONFIG.physics.windAccelScale * dt;
            x += vx * dt;
            y += vy * dt;
            if (x < 0 || x >= this.width || y >= this.height) break;
            if (i % 3 === 0) points.push({ x, y, alpha: 1 - i / 62 });
            if (y >= this.terrain.heightAt(x)) break;
        }

        ctx.save();
        for (const point of points) {
            ctx.fillStyle = `rgba(0, 0, 0, ${0.18 + point.alpha * 0.42})`;
            ctx.beginPath();
            ctx.arc(point.x, point.y, 4.1, 0, Math.PI * 2);
            ctx.fill();
        }
        for (const point of points) {
            ctx.fillStyle = `rgba(255, 245, 120, ${0.32 + point.alpha * 0.63})`;
            ctx.beginPath();
            ctx.arc(point.x, point.y, 2.45, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }

    _drawWindIndicator(ctx) {
        const cx = this.width / 2;
        const cy = 88;
        const direction = Math.sign(this.wind);
        const length = 24 + Math.abs(this.wind) * 13;

        ctx.save();
        ctx.font = 'bold 13px Georgia, serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(28, 38, 48, 0.72)';
        ctx.fillText(`Wind ${this.wind === 0 ? '0' : Math.abs(this.wind).toFixed(1)}`, cx, cy - 16);

        ctx.strokeStyle = 'rgba(28, 38, 48, 0.7)';
        ctx.fillStyle = 'rgba(28, 38, 48, 0.7)';
        ctx.lineWidth = 2;
        ctx.beginPath();

        if (direction === 0) {
            ctx.moveTo(cx - 14, cy);
            ctx.lineTo(cx + 14, cy);
            ctx.stroke();
        } else {
            ctx.moveTo(cx - direction * length / 2, cy);
            ctx.lineTo(cx + direction * length / 2, cy);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(cx + direction * length / 2, cy);
            ctx.lineTo(cx + direction * (length / 2 - 8), cy - 5);
            ctx.lineTo(cx + direction * (length / 2 - 8), cy + 5);
            ctx.closePath();
            ctx.fill();
        }

        ctx.restore();
    }
}

function drawCloud(ctx, x, y, scale) {
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.72)';
    ctx.beginPath();
    ctx.arc(x - 24 * scale, y + 8 * scale, 16 * scale, 0, Math.PI * 2);
    ctx.arc(x - 6 * scale, y, 21 * scale, 0, Math.PI * 2);
    ctx.arc(x + 18 * scale, y + 8 * scale, 16 * scale, 0, Math.PI * 2);
    ctx.rect(x - 28 * scale, y + 7 * scale, 58 * scale, 14 * scale);
    ctx.fill();
    ctx.restore();
}
