import { CONFIG, WEAPONS, clamp, getWeaponById, maxAmmoFor } from './config.js';
import { drawTank } from './tankRenderer.js';

export class Tank {
    constructor({ id, name, x, color, facing, isCpu = false, playerIndex = 0, label = null }) {
        // Identity is intentionally per-tank so future online multiplayer
        // can serialize tanks without leaking shared global state.
        this.id = id;
        this.playerIndex = playerIndex;
        this.label = label || name;
        this.name = name;
        this.x = x;
        this.y = 0;
        this.color = color;
        this.facing = facing;
        this.isCpu = isCpu;
        this.width = CONFIG.tank.width;
        this.height = CONFIG.tank.height;
        this.barrelLength = CONFIG.tank.barrelLength;
        this.barrelThickness = CONFIG.tank.barrelThickness;
        this.angle = 45;
        this.power = 50;
        this.health = CONFIG.tank.maxHealth;
        this.alive = true;
        this.recentDamage = 0;
        this.damageTimer = 0;
        this.selectedWeaponIndex = 0;
        this.movementFuel = CONFIG.tank.movementFuelPerTurn;
        this.money = 0;
        this.shieldCharge = 0;
        this.repairKits = 0;
        this.parachutes = 0;
        this.lastShieldAbsorbed = 0;
        this.shieldFlashTimer = 0;
        this.parachuteTimer = 0;
        this.parachuteSeed = Math.random() * 1000;
        this.recoilTimer = 0;
        this.recoilDuration = 0.22;
        this.muzzleFlashTimer = 0;
        this.muzzleFlashDuration = 0.16;
        this.fireSeed = Math.random() * 1000;
        this.deathEffectPlayed = false;
        this.wreckSmokeTime = 0;
        this.wreckSeed = Math.random() * 1000;
        this.ammo = {};
        this.resetForRound();
    }

    resetForRound() {
        this.health = CONFIG.tank.maxHealth;
        this.alive = true;
        this.recentDamage = 0;
        this.damageTimer = 0;
        this.angle = 45;
        this.power = 50;
        this.selectedWeaponIndex = 0;
        this.movementFuel = CONFIG.tank.movementFuelPerTurn;
        this.lastShieldAbsorbed = 0;
        this.shieldFlashTimer = 0;
        this.parachuteTimer = 0;
        this.parachuteSeed = Math.random() * 1000;
        this.recoilTimer = 0;
        this.muzzleFlashTimer = 0;
        this.fireSeed = Math.random() * 1000;
        this.deathEffectPlayed = false;
        this.wreckSmokeTime = 0;
        this.wreckSeed = Math.random() * 1000;
        this.ammo = {};

        for (const weapon of WEAPONS) {
            this.ammo[weapon.id] = maxAmmoFor(weapon.id);
        }
    }

    settleOn(terrain) {
        this.x = clamp(this.x, CONFIG.tank.spawnMargin, terrain.width - CONFIG.tank.spawnMargin);
        this.y = clamp(terrain.heightAt(this.x), 70, terrain.height - 2);
    }

    muzzlePosition() {
        const rad = this.angle * Math.PI / 180;
        const turretX = this.x;
        const turretY = this.y - this.height;
        const dx = Math.cos(rad) * this.barrelLength * this.facing;
        const dy = -Math.sin(rad) * this.barrelLength;
        return { x: turretX + dx, y: turretY + dy };
    }

    fireVelocity(weapon) {
        const rad = this.angle * Math.PI / 180;
        const speed = this.power * CONFIG.tank.powerToSpeed * weapon.speedScale;
        return {
            vx: Math.cos(rad) * speed * this.facing,
            vy: -Math.sin(rad) * speed,
        };
    }

    boundingCircle() {
        return {
            x: this.x,
            y: this.y - this.height / 2,
            r: Math.max(this.width, this.height) / 2 + 3,
        };
    }

    selectedWeapon() {
        this.ensureAvailableWeapon();
        return WEAPONS[this.selectedWeaponIndex] || WEAPONS[0];
    }

    ammoFor(weaponId) {
        const value = this.ammo[weaponId];
        return value === undefined ? 0 : value;
    }

    canUseWeapon(weaponId) {
        return this.ammoFor(weaponId) > 0;
    }

    ensureAvailableWeapon() {
        const selected = WEAPONS[this.selectedWeaponIndex];
        if (selected && this.canUseWeapon(selected.id)) return;

        const next = WEAPONS.findIndex((weapon) => this.canUseWeapon(weapon.id));
        this.selectedWeaponIndex = next === -1 ? 0 : next;
    }

    cycleWeapon() {
        for (let offset = 1; offset <= WEAPONS.length; offset++) {
            const index = (this.selectedWeaponIndex + offset) % WEAPONS.length;
            if (this.canUseWeapon(WEAPONS[index].id)) {
                this.selectedWeaponIndex = index;
                return WEAPONS[index];
            }
        }

        this.selectedWeaponIndex = 0;
        return WEAPONS[0];
    }

    selectWeaponById(weaponId) {
        const index = WEAPONS.findIndex((weapon) => weapon.id === weaponId);
        if (index === -1 || !this.canUseWeapon(weaponId)) {
            this.ensureAvailableWeapon();
            return this.selectedWeapon();
        }

        this.selectedWeaponIndex = index;
        return WEAPONS[index];
    }

    consumeSelectedAmmo() {
        const weapon = this.selectedWeapon();
        if (!this.canUseWeapon(weapon.id)) return false;
        if (Number.isFinite(this.ammo[weapon.id])) {
            this.ammo[weapon.id] = Math.max(0, this.ammo[weapon.id] - 1);
        }
        this.ensureAvailableWeapon();
        return true;
    }

    applyDamage(amount, { useShield = false } = {}) {
        let adjustedAmount = Math.max(0, amount);
        this.lastShieldAbsorbed = 0;

        if (useShield && this.shieldCharge > 0 && adjustedAmount > 0) {
            const requestedAbsorb = adjustedAmount * CONFIG.utilities.shieldAbsorbRatio;
            const absorbed = Math.min(this.shieldCharge, requestedAbsorb);
            this.shieldCharge = Math.max(0, this.shieldCharge - absorbed);
            adjustedAmount = Math.max(0, adjustedAmount - absorbed);
            this.lastShieldAbsorbed = Math.round(absorbed);
            this.shieldFlashTimer = 0.45;
        }

        const dmg = Math.max(0, Math.round(adjustedAmount));
        if (dmg <= 0 || !this.alive) return 0;

        const before = this.health;
        this.health = Math.max(0, this.health - dmg);
        const actual = before - this.health;
        this.recentDamage = actual;
        this.damageTimer = 1.35;
        if (this.health <= 0) this.alive = false;
        return actual;
    }

    update(dt) {
        if (!this.alive) {
            this.wreckSmokeTime += dt;
        }
        if (this.damageTimer > 0) {
            this.damageTimer = Math.max(0, this.damageTimer - dt);
        }
        if (this.shieldFlashTimer > 0) {
            this.shieldFlashTimer = Math.max(0, this.shieldFlashTimer - dt);
        }
        if (this.parachuteTimer > 0) {
            this.parachuteTimer = Math.max(0, this.parachuteTimer - dt);
        }
        if (this.recoilTimer > 0) {
            this.recoilTimer = Math.max(0, this.recoilTimer - dt);
        }
        if (this.muzzleFlashTimer > 0) {
            this.muzzleFlashTimer = Math.max(0, this.muzzleFlashTimer - dt);
        }
    }

    triggerFireVisual() {
        this.recoilTimer = this.recoilDuration;
        this.muzzleFlashTimer = this.muzzleFlashDuration;
        this.fireSeed = Math.random() * 1000;
    }

    resetMovementFuel() {
        this.movementFuel = CONFIG.tank.movementFuelPerTurn;
    }

    spendMovementFuel(amount) {
        const spent = clamp(amount, 0, this.movementFuel);
        this.movementFuel = Math.max(0, this.movementFuel - spent);
        return spent;
    }

    adjustAngle(delta) {
        this.angle = clamp(this.angle + delta, CONFIG.tank.minAngle, CONFIG.tank.maxAngle);
    }

    adjustPower(delta) {
        this.power = clamp(this.power + delta, CONFIG.tank.minPower, CONFIG.tank.maxPower);
    }

    draw(ctx, terrain = null, time = 0) {
        drawTank(ctx, this, { terrain, time });
    }

    weaponSnapshot() {
        return WEAPONS.map((weapon) => ({
            id: weapon.id,
            name: weapon.name,
            ammo: this.ammoFor(weapon.id),
            selected: getWeaponById(weapon.id).id === this.selectedWeapon().id,
        }));
    }
}
