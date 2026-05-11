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
        const weapon = this._chooseWeapon(shooter, target, terrain, profile, difficulty);
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

    _chooseWeapon(shooter, target, terrain, profile, difficulty) {
        const available = WEAPONS.filter((weapon) => shooter.ammoFor(weapon.id) > 0);
        const standard = available.find((weapon) => weapon.id === 'standard') || available[0];
        if (!standard || available.length <= 1) return standard;

        const distance = Math.abs(target.x - shooter.x);
        const verticalDelta = terrain ? terrain.heightAt(target.x) - terrain.heightAt(shooter.x) : 0;
        const targetLower = verticalDelta > 18;
        const targetUphill = verticalDelta < -18;
        const targetSlope = terrain ? terrain.slopeAt(target.x, 26) : 0;
        const obstruction = terrain ? hasTerrainObstruction(shooter, target, terrain) : false;
        const exposed = targetSlope < 0.32 && !obstruction;
        const shielded = (target.shieldCharge || 0) > 25;
        const difficultyScale = difficulty === 'hard' ? 1.25 : (difficulty === 'easy' ? 0.58 : 1);

        if (difficulty === 'easy' && Math.random() < 0.56) return standard;

        const scored = available.map((weapon) => {
            let score = Math.max(0.02, weapon.cpuUseWeight ?? 0.15);
            const role = weapon.role || 'baseline';

            if (role === 'baseline') score += difficulty === 'easy' ? 0.9 : 0.32;
            if (role === 'precision') {
                score *= distance < 640 && exposed ? 1.45 : 0.72;
                if (target.health <= weapon.maxDamage + 8) score *= 1.65;
                if (this.missStreak >= 2) score *= 0.68;
            }
            if (role === 'heavyDamage') {
                score *= target.health <= 74 || shielded ? 1.55 : 1.05;
                if (distance > 760) score *= 0.72;
            }
            if (role === 'premium') {
                score *= difficulty === 'hard' ? 1.18 : 0.55;
                if (target.health <= 55) score *= 0.18;
                if (!shielded && target.health < 74) score *= 0.42;
                if (distance > 720 || this.missStreak >= 2) score *= 0.62;
            }
            if (role === 'rolling' || role === 'rollingHeavy') {
                score *= targetLower ? 1.8 : 0.34;
                if (targetUphill) score *= 0.35;
                if (this.missStreak >= 2 && targetLower) score *= 1.22;
            }
            if (role === 'fire' || role === 'fireHeavy') {
                score *= targetSlope > 0.42 || this.missStreak >= 1 ? 1.28 : 0.78;
                if (role === 'fireHeavy' && (target.health <= 38 || difficulty === 'easy')) score *= 0.48;
            }
            if (role === 'cluster') {
                score *= distance > 520 || this.missStreak >= 2 || obstruction || Math.abs(targetSlope) > 0.48 ? 1.46 : 0.72;
                if (difficulty === 'easy') score *= 0.45;
            }
            if (role === 'controlledFork') {
                score *= distance > 360 && distance < 760 && !obstruction ? 1.24 : 0.74;
                if (this.missStreak === 1) score *= 1.18;
                if (this.missStreak >= 3) score *= 0.72;
                if (difficulty === 'easy') score *= 0.36;
                if (difficulty === 'hard' && exposed) score *= 1.18;
            }
            if (role === 'airburst') {
                score *= obstruction || exposed ? 1.4 : 0.74;
                if (distance > 760) score *= 0.7;
            }
            if (role === 'terrainDestroy') {
                score *= obstruction ? 1.55 : 0.42;
                if (target.health <= 35) score *= 0.7;
            }
            if (role === 'terrainBuild') {
                score *= this.missStreak >= 3 && !targetLower ? 0.72 : 0.18;
                if (difficulty === 'hard') score *= 0.72;
            }

            if (difficulty === 'easy' && role !== 'baseline' && role !== 'heavyDamage' && Math.random() > 0.28) {
                score *= 0.35;
            }

            return {
                weapon,
                score: Math.max(0, score * difficultyScale * randomRange(0.82, 1.18)),
            };
        });

        const total = scored.reduce((sum, item) => sum + item.score, 0);
        if (total <= 0) return standard;
        let pick = Math.random() * total;
        for (const item of scored.sort((a, b) => b.score - a.score)) {
            pick -= item.score;
            if (pick <= 0) return item.weapon;
        }
        return scored[0].weapon || standard;
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

        if (weapon.behavior === 'airburst' && x >= 0 && x < terrain.width) {
            const groundY = terrain.heightAt(x);
            const burstHeight = weapon.airburstBehavior?.height ?? 36;
            if (t >= (weapon.airburstBehavior?.minAge ?? 0.35) && vy >= -20 && y >= groundY - burstHeight) {
                impactX = x;
                break;
            }
        }

        if (x >= 0 && x < terrain.width && y >= terrain.heightAt(x)) {
            impactX = x;
            break;
        }
    }

    const landingDistance = Math.abs(impactX - target.x);
    const landingPenalty = landingDistance * 0.22;
    const damageBonus = Math.max(0, weapon.damageRadius - landingDistance) * (weapon.maxDamage / 100);
    const terrainBonus = weapon.role === 'terrainDestroy'
        ? Math.max(0, weapon.terrainEffectRadius - landingDistance) * 0.34
        : (weapon.behavior === 'crater' || weapon.behavior === 'airburst'
            ? Math.max(0, weapon.terrainEffectRadius - landingDistance) * 0.28
            : -18);
    return minDistance + landingPenalty - damageBonus - terrainBonus;
}

function hasTerrainObstruction(shooter, target, terrain) {
    if (!terrain || !shooter || !target) return false;
    const start = shooter.muzzlePosition ? shooter.muzzlePosition() : { x: shooter.x, y: shooter.y - shooter.height };
    const end = target.boundingCircle ? target.boundingCircle() : { x: target.x, y: target.y - target.height / 2 };
    const steps = 14;
    for (let i = 3; i < steps; i++) {
        const t = i / steps;
        const x = start.x + (end.x - start.x) * t;
        if (x < 0 || x >= terrain.width) continue;
        const lineY = start.y + (end.y - start.y) * t;
        if (terrain.heightAt(x) < lineY - 10) return true;
    }
    return false;
}

function randomRange(min, max) {
    return min + Math.random() * (max - min);
}
