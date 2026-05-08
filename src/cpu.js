import { CONFIG, CPU_DIFFICULTY, WEAPONS, clamp } from './config.js';

export class CPUController {
    constructor() {
        this.missStreak = 0;
        this.lastMissX = 0;
    }

    resetRound() {
        this.missStreak = 0;
        this.lastMissX = 0;
    }

    recordShot({ hit, impactX, targetX }) {
        if (hit) {
            this.missStreak = 0;
            this.lastMissX = 0;
            return;
        }

        this.missStreak = Math.min(5, this.missStreak + 1);
        if (Number.isFinite(impactX) && Number.isFinite(targetX)) {
            this.lastMissX = impactX - targetX;
        }
    }

    chooseAction({ shooter, target, terrain, wind, difficulty = 'normal' }) {
        const profile = CPU_DIFFICULTY[difficulty] || CPU_DIFFICULTY.normal;
        const weapon = this._chooseWeapon(shooter, target, profile);
        const solution = this._findAimSolution(shooter, target, terrain, wind, weapon, profile);
        const learningScale = Math.max(0.45, 1 - this.missStreak * CONFIG.cpu.missLearning);
        const learnedPower = this.lastMissX * CONFIG.cpu.lastMissPowerCorrection;
        const aimError = randomRange(profile.aimErrorDegrees[0], profile.aimErrorDegrees[1]);
        const powerErrorPercent = randomRange(profile.powerErrorPercent[0], profile.powerErrorPercent[1]) / 100;

        return {
            weaponId: weapon.id,
            angle: clamp(
                solution.angle + randomRange(-aimError, aimError) * learningScale,
                CONFIG.tank.minAngle,
                CONFIG.tank.maxAngle
            ),
            power: clamp(
                solution.power + learnedPower + solution.power * randomRange(-powerErrorPercent, powerErrorPercent) * learningScale,
                CONFIG.tank.minPower,
                CONFIG.tank.maxPower
            ),
        };
    }

    _chooseWeapon(shooter, target, profile) {
        const available = WEAPONS.filter((weapon) => shooter.ammoFor(weapon.id) > 0);
        const heavy = available.find((weapon) => weapon.id === 'heavy');
        const dirt = available.find((weapon) => weapon.id === 'dirt');
        const standard = available.find((weapon) => weapon.id === 'standard') || available[0];

        if (heavy && target.health <= 68 && Math.random() < profile.heavyShellUseChance + 0.2) return heavy;
        if (heavy && this.missStreak <= 1 && Math.random() < profile.heavyShellUseChance) return heavy;
        if (dirt && this.missStreak >= 3 && Math.random() < profile.dirtBombUseChance) return dirt;
        if (dirt && Math.random() < profile.dirtBombUseChance * 0.4) return dirt;
        return standard;
    }

    _findAimSolution(shooter, target, terrain, wind, weapon, profile) {
        let best = { angle: shooter.angle, power: shooter.power, score: Infinity };
        const samples = Math.max(4, profile.shotSamples);
        const angleStep = (78 - 18) / Math.max(1, samples - 1);
        const powerStep = (100 - 24) / Math.max(1, samples - 1);

        for (let ai = 0; ai < samples; ai++) {
            const angle = 18 + ai * angleStep;
            for (let pi = 0; pi < samples; pi++) {
                const power = 24 + pi * powerStep;
                const score = simulateShot({ shooter, target, terrain, wind, weapon, angle, power });
                if (score < best.score) {
                    best = { angle, power, score };
                }
            }
        }

        return best;
    }
}

function simulateShot({ shooter, target, terrain, wind, weapon, angle, power }) {
    const rad = angle * Math.PI / 180;
    const turretY = shooter.y - shooter.height;
    let x = shooter.x + Math.cos(rad) * shooter.barrelLength * shooter.facing;
    let y = turretY - Math.sin(rad) * shooter.barrelLength;
    let vx = Math.cos(rad) * power * CONFIG.tank.powerToSpeed * weapon.speedScale * shooter.facing;
    let vy = -Math.sin(rad) * power * CONFIG.tank.powerToSpeed * weapon.speedScale;

    const targetCircle = target.boundingCircle();
    const windAccel = wind * CONFIG.physics.windAccelScale;
    const dt = 1 / 45;
    let minDistance = Infinity;
    let impactX = x;

    for (let t = 0; t < 5.2; t += dt) {
        vy += CONFIG.physics.gravity * dt;
        vx += windAccel * dt;
        x += vx * dt;
        y += vy * dt;

        const dx = x - targetCircle.x;
        const dy = y - targetCircle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        minDistance = Math.min(minDistance, distance);

        if (distance <= targetCircle.r + weapon.projectileRadius) {
            return distance - 120;
        }

        if (x < -80 || x > terrain.width + 80 || y > terrain.height + 80) {
            impactX = x;
            break;
        }

        if (x >= 0 && x < terrain.width && y >= terrain.heightAt(x)) {
            impactX = x;
            break;
        }
    }

    const landingDistance = Math.abs(impactX - target.x);
    const landingPenalty = landingDistance * 0.22;
    const damageBonus = Math.max(0, weapon.damageRadius - landingDistance) * (weapon.maxDamage / 100);
    const terrainBonus = weapon.behavior === 'crater'
        ? Math.max(0, weapon.terrainEffectRadius - landingDistance) * 0.28
        : -18;
    return minDistance + landingPenalty - damageBonus - terrainBonus;
}

function randomRange(min, max) {
    return min + Math.random() * (max - min);
}
