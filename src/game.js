import { Terrain } from './terrain.js';
import { Tank } from './tank.js';
import { Projectile, Explosion } from './projectile.js';
import { AudioManager } from './audio.js';
import { CPUController } from './cpu.js';
import { CONFIG, CPU_DIFFICULTY, WEAPONS, clamp } from './config.js';

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
        this.settings = normalizeSettings();
        this.roundNumber = 0;
        this.score = [0, 0];
        this.phase = 'menu';
        this.phaseTimer = 0;
        this.cpuTimer = 0;
        this.gameOver = false;
        this.matchWinnerIndex = null;
        this.terrain = null;
        this.tanks = [];
        this.playerData = [];
        this.currentPlayer = 0;
        this.projectile = null;
        this.explosions = [];
        this.wind = 0;
        this.lastResult = 'Choose a mode to start.';
        this.statusMessage = 'Main menu';
        this.shotInfo = null;
        this.roundStats = this._createRoundStats();
        this.lastSummary = null;
        this.shopCpuPurchased = false;

        this._setupInput();
        this.ui.setMuted(this.audio.muted);
    }

    start(mode = 'two-player', settings = {}) {
        this.settings = normalizeSettings(settings);
        this.gameMode = mode;
        this.score = [0, 0];
        this.roundNumber = 0;
        this.matchWinnerIndex = null;
        this.playerData = this._createPlayerData();
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

    startNewMatch(mode = this.gameMode, settings = this.settings) {
        this.start(mode, settings);
    }

    resetCurrentRound() {
        if (this.phase === 'menu') return;
        this._setupRound({ incrementRound: false });
    }

    nextRound() {
        if (this.phase === 'roundSummary') {
            this.openShop();
            return;
        }
        if (this.phase === 'shop') {
            this.startNextRoundFromShop();
        }
    }

    openShop() {
        if (this.phase !== 'roundSummary' || this.matchWinnerIndex !== null) return;
        this.phase = 'shop';
        this.shopCpuPurchased = false;
        if (this.gameMode === 'cpu') this._runCpuShop();
        this.ui.showShop(this._state(), this.getShopItems());
    }

    startNextRoundFromShop() {
        if (this.phase !== 'shop') return;
        this._setupRound({ incrementRound: true });
    }

    buyShopItem(playerIndex, itemId) {
        if (this.phase !== 'shop') return false;
        const player = this.playerData[playerIndex];
        const item = CONFIG.shop[itemId];
        if (!player || !item || player.money < item.price) return false;

        player.money -= item.price;
        this._grantShopItem(player, itemId);
        this._syncTankFromPlayerData(playerIndex);
        this.ui.showShop(this._state(), this.getShopItems());
        return true;
    }

    getShopItems() {
        return Object.entries(CONFIG.shop).map(([id, item]) => ({ id, ...item }));
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
            settings: this.settings,
            round: this.roundNumber,
            roundsToWin: this.settings.roundsToWin,
            score: {
                player1: this.score[0],
                player2: this.score[1],
            },
            currentPlayer: active ? active.name : null,
            controlsLocked: !this._canHumanControl(),
            wind: this.wind,
            lastResult: this.lastResult,
            status: this.statusMessage,
            summary: this.lastSummary,
            tanks: this.tanks.map((tank) => ({
                name: tank.name,
                x: Math.round(tank.x),
                y: Math.round(tank.y),
                health: tank.health,
                alive: tank.alive,
                angle: Math.round(tank.angle),
                power: Math.round(tank.power),
                movementFuel: Math.round(tank.movementFuel),
                money: tank.money,
                shieldCharge: Math.round(tank.shieldCharge),
                repairKits: tank.repairKits,
                parachutes: tank.parachutes,
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

    _createPlayerData() {
        const startingMoney = CONFIG.economy.startingMoney[this.settings.startingMoney] ?? CONFIG.economy.startingMoney.normal;
        return [0, 1].map((index) => ({
            name: index === 0 ? 'Player 1' : (this.gameMode === 'cpu' ? 'CPU' : 'Player 2'),
            money: startingMoney,
            health: CONFIG.tank.maxHealth,
            ammo: createStartingAmmo(),
            shieldCharge: 0,
            repairKits: 0,
            parachutes: 0,
        }));
    }

    _createRoundStats() {
        return [0, 1].map(() => ({
            damageDealt: 0,
            damageTaken: 0,
            shotsFired: 0,
            directHits: 0,
            nearHits: 0,
            moneyEarned: 0,
            fallDamageTaken: 0,
        }));
    }

    _setupRound({ incrementRound }) {
        if (incrementRound || this.roundNumber === 0) this.roundNumber += 1;

        this.terrain = new Terrain(this.width, this.height, this.settings.terrainRoughness);
        const x1 = this.terrain.findStableSpawn(0.11, 0.33);
        this.terrain.flattenPad(x1);
        let x2 = this.terrain.findStableSpawn(0.67, 0.89, x1);
        if (Math.abs(x2 - x1) < CONFIG.terrain.minSpawnDistance) {
            x2 = clamp(x1 + CONFIG.terrain.minSpawnDistance, this.width * 0.62, this.width * 0.9);
        }
        this.terrain.flattenPad(x2);

        const p2IsCpu = this.gameMode === 'cpu';
        this.playerData[0].name = 'Player 1';
        this.playerData[1].name = p2IsCpu ? 'CPU' : 'Player 2';
        this._applyRepairKitsForNewRound();

        const p1 = new Tank({ id: 1, name: 'Player 1', x: x1, color: '#f16f45', facing: 1 });
        const p2 = new Tank({
            id: 2,
            name: p2IsCpu ? 'CPU' : 'Player 2',
            x: x2,
            color: '#3b87d6',
            facing: -1,
            isCpu: p2IsCpu,
        });

        this.tanks = [p1, p2];
        this._syncTankFromPlayerData(0);
        this._syncTankFromPlayerData(1);
        p1.settleOn(this.terrain);
        p2.settleOn(this.terrain);

        this.currentPlayer = 0;
        this.projectile = null;
        this.explosions = [];
        this.phaseTimer = 0;
        this.cpuTimer = 0;
        this.gameOver = false;
        this.matchWinnerIndex = null;
        this.shotInfo = null;
        this.roundStats = this._createRoundStats();
        this.lastSummary = null;
        this.shopCpuPurchased = false;
        this.cpu.resetRound();
        this.keys.clear();
        this._rollWind();

        this.lastResult = `Round ${this.roundNumber} ready.`;
        this.statusMessage = 'Player 1 is aiming.';
        this.ui.hideAllOverlays();
        this._startTurn(false);
        this._draw();
        this.ui.update(this._state());
    }

    _applyRepairKitsForNewRound() {
        for (const player of this.playerData) {
            if (player.repairKits > 0 && player.health < CONFIG.tank.maxHealth) {
                player.repairKits -= 1;
                player.health = Math.min(CONFIG.tank.maxHealth, player.health + CONFIG.utilities.repairHeal);
            }
        }
    }

    _syncTankFromPlayerData(index) {
        const tank = this.tanks[index];
        const data = this.playerData[index];
        if (!tank || !data) return;

        tank.name = data.name;
        tank.health = clamp(Math.round(data.health), 1, CONFIG.tank.maxHealth);
        tank.alive = tank.health > 0;
        tank.money = Math.max(0, Math.round(data.money));
        tank.shieldCharge = Math.max(0, data.shieldCharge);
        tank.repairKits = Math.max(0, data.repairKits);
        tank.parachutes = Math.max(0, data.parachutes);
        tank.ammo = { ...data.ammo, standard: Infinity };
        tank.ensureAvailableWeapon();
    }

    _syncPlayerDataFromTank(index) {
        const tank = this.tanks[index];
        const data = this.playerData[index];
        if (!tank || !data) return;

        data.money = Math.max(0, Math.round(tank.money));
        data.health = clamp(tank.health, 0, CONFIG.tank.maxHealth);
        data.shieldCharge = Math.max(0, tank.shieldCharge);
        data.repairKits = Math.max(0, tank.repairKits);
        data.parachutes = Math.max(0, tank.parachutes);
        data.ammo = {
            standard: Infinity,
            heavy: tank.ammoFor('heavy'),
            dirt: tank.ammoFor('dirt'),
        };
    }

    _state() {
        const active = this.tanks[this.currentPlayer] || null;
        const selectedWeapon = active ? active.selectedWeapon() : WEAPONS[0];
        return {
            tanks: this.tanks,
            playerData: this.playerData,
            currentPlayer: this.currentPlayer,
            active,
            selectedWeapon,
            gameMode: this.gameMode,
            settings: this.settings,
            roundNumber: this.roundNumber,
            roundsToWin: this.settings.roundsToWin,
            score: this.score,
            phase: this.phase,
            wind: this.wind,
            lastResult: this.lastResult,
            statusMessage: this.statusMessage,
            gameOver: this.gameOver,
            matchWinnerIndex: this.matchWinnerIndex,
            lastSummary: this.lastSummary,
            muted: this.audio.muted,
        };
    }

    _rollWind() {
        const profile = CONFIG.windModes[this.settings.windMode] || CONFIG.windModes.normal;
        if (profile.min === 0 && profile.max === 0) {
            this.wind = 0;
            return;
        }
        const raw = profile.min + Math.random() * (profile.max - profile.min);
        this.wind = Math.round(raw * 10) / 10;
        if (Math.abs(this.wind) < 0.15) this.wind = 0;
    }

    _setupInput() {
        window.addEventListener('keydown', (e) => {
            const code = e.code;

            if (code === 'KeyM') {
                e.preventDefault();
                this.toggleMute();
                return;
            }

            if (!this.running) return;

            if (code === 'Escape') {
                e.preventDefault();
                this.returnToMenu();
                return;
            }

            if (code === 'KeyR' && !e.repeat) {
                e.preventDefault();
                if (this.phase === 'aiming' || this.phase === 'cpuThinking' || this.phase === 'projectile' || this.phase === 'resolving') {
                    this.resetCurrentRound();
                }
                return;
            }

            if (code === 'KeyN' && !e.repeat) {
                e.preventDefault();
                this.nextRound();
                return;
            }

            if ((code === 'Tab' || code === 'KeyW') && !e.repeat) {
                e.preventDefault();
                this._cycleWeapon();
                return;
            }

            if (code === 'Space') {
                e.preventDefault();
                if (!e.repeat && this._canHumanControl()) this._fireSelectedWeapon();
                return;
            }

            if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'KeyA', 'KeyD'].includes(code)) {
                e.preventDefault();
                this.keys.add(code);
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys.delete(e.code);
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
            const profile = CPU_DIFFICULTY[this.settings.cpuDifficulty] || CPU_DIFFICULTY.normal;
            this.phase = 'cpuThinking';
            this.cpuTimer = randomRange(profile.thinkingDelayMs[0], profile.thinkingDelayMs[1]) / 1000;
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
        if (this.keys.has('ArrowLeft')) angleDelta -= 1;
        if (this.keys.has('ArrowRight')) angleDelta += 1;
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
        if (this.keys.has('KeyA')) direction -= 1;
        if (this.keys.has('KeyD')) direction += 1;
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
            difficulty: this.settings.cpuDifficulty,
        });

        shooter.selectWeaponById(action.weaponId);
        shooter.angle = action.angle;
        shooter.power = action.power;
        this.phase = 'aiming';
        this._fireSelectedWeapon();
    }

    _fireSelectedWeapon() {
        if (this.gameOver || this.projectile || this.phase !== 'aiming') return false;
        const shooter = this._activeTank();
        if (!shooter || !shooter.alive) return false;

        const weapon = shooter.selectedWeapon();
        if (!shooter.canUseWeapon(weapon.id)) {
            shooter.ensureAvailableWeapon();
            this.statusMessage = `${shooter.name} has no ammo for that weapon.`;
            return false;
        }

        if (!shooter.consumeSelectedAmmo()) return false;
        this._syncPlayerDataFromTank(this.currentPlayer);
        this.roundStats[this.currentPlayer].shotsFired += 1;

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
        const fallMessages = this._settleTanksWithFallDamage();
        this.lastResult = `${result.message} ${terrainMessage}${fallMessages.length ? ` ${fallMessages.join(' ')}` : ''}`;
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
        let shieldAbsorbed = 0;
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
            const rawDamage = Math.min(weapon.maxDamage, weapon.maxDamage * falloff * directBonus);
            const damage = tank.applyDamage(rawDamage, { useShield: true });
            shieldAbsorbed += tank.lastShieldAbsorbed;
            totalDamage += damage;
            this.roundStats[i].damageTaken += damage;
            if (i === this.shotInfo.targetIndex) enemyDamage += damage;
            if (i === this.shotInfo.shooterIndex) selfDamage += damage;
            this._syncPlayerDataFromTank(i);
        }

        this.shotInfo.totalDamage = totalDamage;
        this.shotInfo.enemyDamage = enemyDamage;
        this.shotInfo.selfDamage = selfDamage;
        this.roundStats[this.shotInfo.shooterIndex].damageDealt += enemyDamage;

        const prefix = collision === 'tank' || enemyDamage >= weapon.maxDamage * 0.55
            ? 'Direct hit!'
            : (enemyDamage > 0 || this.shotInfo.minTargetDistance <= weapon.damageRadius + 48)
                ? 'Near miss!'
                : 'Missed.';

        if (prefix === 'Direct hit!') this.roundStats[this.shotInfo.shooterIndex].directHits += 1;
        if (prefix === 'Near miss!') this.roundStats[this.shotInfo.shooterIndex].nearHits += 1;

        const details = [];
        if (enemyDamage > 0) details.push(`${target.name} took ${enemyDamage} damage.`);
        if (selfDamage > 0) details.push(`${shooter.name} took ${selfDamage} self-damage.`);
        if (shieldAbsorbed > 0) details.push(`Shields absorbed ${shieldAbsorbed}.`);
        if (details.length === 0) details.push('No damage.');

        return {
            totalDamage,
            message: `${prefix} ${details.join(' ')}`,
        };
    }

    _settleTanksWithFallDamage() {
        const messages = [];
        for (let i = 0; i < this.tanks.length; i++) {
            const tank = this.tanks[i];
            if (!tank.alive) continue;

            const beforeY = tank.y;
            tank.settleOn(this.terrain);
            const drop = tank.y - beforeY;
            if (drop <= CONFIG.utilities.fallDamageDropThreshold) {
                this._syncPlayerDataFromTank(i);
                continue;
            }

            let fallDamage = Math.min(
                CONFIG.utilities.fallDamageMax,
                Math.floor((drop - CONFIG.utilities.fallDamageDropThreshold) * CONFIG.utilities.fallDamageScale)
            );
            if (fallDamage <= 0) continue;

            if (tank.parachutes > 0) {
                tank.parachutes -= 1;
                fallDamage = Math.max(0, Math.round(fallDamage * (1 - CONFIG.utilities.parachuteReduction)));
                messages.push(`${tank.name}'s parachute reduced fall damage.`);
            }

            if (fallDamage > 0) {
                const actual = tank.applyDamage(fallDamage);
                this.roundStats[i].damageTaken += actual;
                this.roundStats[i].fallDamageTaken += actual;
                messages.push(`${tank.name} took ${actual} fall damage.`);
            }
            this._syncPlayerDataFromTank(i);
        }
        return messages;
    }

    _finishShotResolution() {
        this._settleTanksWithFallDamage();

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

        const winnerIndex = alive.length === 1 ? alive[0].index : null;
        if (winnerIndex !== null) this.score[winnerIndex] += 1;
        this.matchWinnerIndex = winnerIndex !== null && this.score[winnerIndex] >= this.settings.roundsToWin
            ? winnerIndex
            : null;
        this._finalizeRoundEconomy(winnerIndex, alive.map((entry) => entry.index));

        this.gameOver = true;
        this.phase = 'roundSummary';
        this.projectile = null;
        this.keys.clear();
        this.statusMessage = this.matchWinnerIndex === null ? 'Round summary.' : 'Match complete.';
        this.lastResult = winnerIndex === null
            ? `Round ${this.roundNumber} ended in a draw.`
            : `${this.tanks[winnerIndex].name} wins round ${this.roundNumber}.`;
        this.ui.showSummary(this._state());
        this.audio.playTurn();
        return true;
    }

    _finalizeRoundEconomy(winnerIndex, aliveIndices) {
        for (let i = 0; i < this.tanks.length; i++) {
            const tank = this.tanks[i];
            const player = this.playerData[i];
            const survived = aliveIndices.includes(i);
            const damageMoney = Math.floor(this.roundStats[i].damageDealt / CONFIG.economy.damageMoneyDivisor);
            const winMoney = winnerIndex === i ? CONFIG.economy.winBonus : 0;
            const survivalMoney = survived ? CONFIG.economy.survivalBonus : 0;
            const earned = CONFIG.economy.baseAllowance + damageMoney + winMoney + survivalMoney;

            this.roundStats[i].moneyEarned = earned;
            player.money = Math.max(0, player.money + earned);
            player.health = survived
                ? clamp(tank.health, 1, CONFIG.tank.maxHealth)
                : CONFIG.utilities.rebuildHealthAfterDeath;
            player.shieldCharge = Math.max(0, tank.shieldCharge);
            player.repairKits = Math.max(0, tank.repairKits);
            player.parachutes = Math.max(0, tank.parachutes);
            player.ammo = {
                standard: Infinity,
                heavy: tank.ammoFor('heavy'),
                dirt: tank.ammoFor('dirt'),
            };
        }

        this.lastSummary = {
            round: this.roundNumber,
            winnerIndex,
            matchWinnerIndex: this.matchWinnerIndex,
            score: [...this.score],
            stats: this.roundStats.map((stat, index) => ({
                ...stat,
                name: this.playerData[index].name,
                money: this.playerData[index].money,
                inventory: summarizeInventory(this.playerData[index]),
            })),
        };
    }

    _runCpuShop() {
        if (this.shopCpuPurchased) return;
        this.shopCpuPurchased = true;
        const cpuIndex = 1;
        const cpu = this.playerData[cpuIndex];
        const profile = CPU_DIFFICULTY[this.settings.cpuDifficulty] || CPU_DIFFICULTY.normal;
        if (!cpu) return;

        const tryBuy = (itemId, chance) => {
            const item = CONFIG.shop[itemId];
            if (!item || cpu.money < item.price || Math.random() > chance) return false;
            cpu.money -= item.price;
            this._grantShopItem(cpu, itemId);
            return true;
        };

        if (cpu.health < 85) tryBuy('repair', profile.repairBuyChance);
        if (cpu.shieldCharge < 90) tryBuy('shield', profile.shieldBuyChance);
        if (cpu.ammo.heavy < 2) tryBuy('heavyAmmo', profile.ammoBuyChance);
        if (cpu.ammo.dirt < 2) tryBuy('dirtAmmo', profile.ammoBuyChance * 0.55);
        if (cpu.parachutes < 1) tryBuy('parachute', profile.shieldBuyChance * 0.45);
        this._syncTankFromPlayerData(cpuIndex);
    }

    _grantShopItem(player, itemId) {
        if (itemId === 'heavyAmmo') player.ammo.heavy += 1;
        if (itemId === 'dirtAmmo') player.ammo.dirt += 1;
        if (itemId === 'shield') player.shieldCharge += CONFIG.utilities.shieldPurchaseCharge;
        if (itemId === 'repair') player.repairKits += 1;
        if (itemId === 'parachute') player.parachutes += 1;
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

function normalizeSettings(settings = {}) {
    const defaults = CONFIG.settings.defaults;
    const next = { ...defaults, ...settings };
    return {
        roundsToWin: [1, 3, 5].includes(Number(next.roundsToWin)) ? Number(next.roundsToWin) : defaults.roundsToWin,
        cpuDifficulty: CPU_DIFFICULTY[next.cpuDifficulty] ? next.cpuDifficulty : defaults.cpuDifficulty,
        windMode: CONFIG.windModes[next.windMode] ? next.windMode : defaults.windMode,
        startingMoney: CONFIG.economy.startingMoney[next.startingMoney] ? next.startingMoney : defaults.startingMoney,
        terrainRoughness: CONFIG.terrain.roughness[next.terrainRoughness] ? next.terrainRoughness : defaults.terrainRoughness,
    };
}

function createStartingAmmo() {
    const ammo = {};
    for (const weapon of WEAPONS) {
        ammo[weapon.id] = weapon.ammo;
    }
    return ammo;
}

function summarizeInventory(player) {
    return {
        money: player.money,
        heavyAmmo: player.ammo.heavy,
        dirtAmmo: player.ammo.dirt,
        shieldCharge: Math.round(player.shieldCharge),
        repairKits: player.repairKits,
        parachutes: player.parachutes,
        health: player.health,
    };
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

function randomRange(min, max) {
    return min + Math.random() * (max - min);
}
