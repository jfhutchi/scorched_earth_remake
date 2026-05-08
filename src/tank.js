import { CONFIG, WEAPONS, clamp, getWeaponById } from './config.js';

export class Tank {
    constructor({ id, name, x, color, facing, isCpu = false }) {
        this.id = id;
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
        this.ammo = {};

        for (const weapon of WEAPONS) {
            this.ammo[weapon.id] = weapon.ammo;
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
        if (this.damageTimer > 0) {
            this.damageTimer = Math.max(0, this.damageTimer - dt);
        }
        if (this.shieldFlashTimer > 0) {
            this.shieldFlashTimer = Math.max(0, this.shieldFlashTimer - dt);
        }
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

    draw(ctx) {
        const baseY = this.y;
        const bodyX = this.x - this.width / 2;
        const bodyY = baseY - this.height;
        const treadY = baseY - 6;

        ctx.save();

        ctx.fillStyle = 'rgba(0, 0, 0, 0.24)';
        ctx.beginPath();
        ctx.ellipse(this.x, baseY + 3, this.width / 2 + 5, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#20252c';
        roundRect(ctx, bodyX - 4, treadY, this.width + 8, 8, 4);
        ctx.fill();

        ctx.fillStyle = '#111820';
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.arc(bodyX + 4 + i * 9, treadY + 4, 2.1, 0, Math.PI * 2);
            ctx.fill();
        }

        const bodyGradient = ctx.createLinearGradient(bodyX, bodyY, bodyX, baseY);
        bodyGradient.addColorStop(0, shade(this.color, 18));
        bodyGradient.addColorStop(1, shade(this.color, -10));
        ctx.fillStyle = bodyGradient;
        roundRect(ctx, bodyX, bodyY, this.width, this.height, 5);
        ctx.fill();

        ctx.fillStyle = 'rgba(255, 255, 255, 0.16)';
        roundRect(ctx, bodyX + 5, bodyY + 3, this.width - 10, 4, 2);
        ctx.fill();

        const turretY = bodyY;
        const turretR = 10;
        ctx.fillStyle = shade(this.color, -18);
        ctx.beginPath();
        ctx.arc(this.x, turretY, turretR, Math.PI, Math.PI * 2);
        ctx.fill();

        const rad = this.angle * Math.PI / 180;
        const muzzle = this.muzzlePosition();
        ctx.strokeStyle = '#171b20';
        ctx.lineWidth = this.barrelThickness + 2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(this.x, turretY);
        ctx.lineTo(muzzle.x, muzzle.y);
        ctx.stroke();

        ctx.strokeStyle = '#343a42';
        ctx.lineWidth = this.barrelThickness;
        ctx.beginPath();
        ctx.moveTo(this.x, turretY);
        ctx.lineTo(muzzle.x, muzzle.y);
        ctx.stroke();

        ctx.fillStyle = '#111820';
        ctx.beginPath();
        ctx.arc(muzzle.x, muzzle.y, 3, 0, Math.PI * 2);
        ctx.fill();

        if (this.damageTimer > 0) {
            const alpha = Math.min(1, this.damageTimer / 1.35);
            ctx.fillStyle = `rgba(255, 76, 66, ${alpha})`;
            ctx.font = 'bold 19px Georgia, serif';
            ctx.textAlign = 'center';
            ctx.fillText(`-${this.recentDamage}`, this.x, bodyY - 22 - (1 - alpha) * 18);
        }

        if (this.shieldCharge > 0 || this.shieldFlashTimer > 0) {
            const chargeAlpha = Math.min(0.45, 0.14 + this.shieldCharge / 220);
            const flashAlpha = this.shieldFlashTimer > 0 ? this.shieldFlashTimer / 0.45 * 0.35 : 0;
            ctx.strokeStyle = `rgba(110, 210, 255, ${chargeAlpha + flashAlpha})`;
            ctx.lineWidth = 2 + Math.min(3, this.shieldCharge / 35);
            ctx.beginPath();
            ctx.ellipse(this.x, this.y - this.height / 2, this.width / 2 + 14, this.height + 12, 0, 0, Math.PI * 2);
            ctx.stroke();
        }

        ctx.restore();
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
    const c = hex.replace('#', '');
    const num = parseInt(c, 16);
    let r = (num >> 16) + Math.round((percent / 100) * 255);
    let g = ((num >> 8) & 0xff) + Math.round((percent / 100) * 255);
    let b = (num & 0xff) + Math.round((percent / 100) * 255);
    r = clamp(r, 0, 255);
    g = clamp(g, 0, 255);
    b = clamp(b, 0, 255);
    return `rgb(${r},${g},${b})`;
}
