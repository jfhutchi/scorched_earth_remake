import {
    createCastleBlocks,
    findCastleBlockHit,
    applyCastleExplosionDamage,
    updateCastleBlockCollapse,
    isCastleObjectiveComplete,
    getCastleObjectiveHealth,
} from './blocks.js';
import { getCastleSiegeLevel, getNextCastleSiegeLevelId } from './levels.js';
import { loadCastleSiegeProgress, recordCastleSiegeResult } from './progress.js';

export class CastleSiegeMode {
    constructor(levelId = 'siege_001') {
        this.restart(levelId);
    }

    restart(levelId = this.level.id) {
        this.level = getCastleSiegeLevel(levelId);
        this.blocks = createCastleBlocks(this.level);
        this.shotsRemaining = this.level.shotLimit;
        this.shotsFired = 0;
        this.victory = false;
        this.failure = false;
        this.resultRecorded = false;
        this.result = null;
        this.lastImpact = null;
        this.lastCollapse = null;
        this.status = 'active';
        return this;
    }

    consumeShot() {
        if (this.victory || this.failure || this.shotsRemaining <= 0) return false;
        this.shotsRemaining = Math.max(0, this.shotsRemaining - 1);
        this.shotsFired += 1;
        return true;
    }

    findBlockHit(projectile) {
        return findCastleBlockHit(this.blocks, projectile);
    }

    applyImpact(x, y, weapon) {
        const summary = applyCastleExplosionDamage(this.blocks, x, y, weapon);
        summary.objectiveComplete = this.isObjectiveComplete();
        this.lastImpact = summary;
        return summary;
    }

    update(dt, terrain) {
        const summary = updateCastleBlockCollapse(this.blocks, terrain, dt);
        if (summary.changed) this.lastCollapse = summary;
        return summary;
    }

    isSettling() {
        return this.blocks.some((block) => block && !block.destroyed && block.falling);
    }

    isObjectiveComplete() {
        return isCastleObjectiveComplete(this.blocks, this.level.objective);
    }

    isOutOfShots() {
        return this.shotsRemaining <= 0 && !this.isObjectiveComplete();
    }

    finishIfNeeded() {
        if (this.victory || this.failure) return true;

        if (this.isObjectiveComplete()) {
            this.victory = true;
            this.status = 'victory';
            const stars = this.calculateStars();
            const rewards = recordCastleSiegeResult(this.level.id, {
                completed: true,
                stars,
                shotsRemaining: this.shotsRemaining,
            });
            this.resultRecorded = true;
            this.result = {
                outcome: 'victory',
                victory: true,
                failure: false,
                levelId: this.level.id,
                levelName: this.level.name,
                levelHint: this.level.hint || '',
                stars,
                coinsEarned: rewards.coinsEarned,
                totalCoins: rewards.progress.coins,
                firstClear: rewards.firstClear,
                shotsRemaining: this.shotsRemaining,
                shotsFired: this.shotsFired,
                bestStars: rewards.levelProgress.bestStars,
                bestShotsRemaining: rewards.levelProgress.bestShotsRemaining,
                timesCompleted: rewards.levelProgress.timesCompleted,
            };
            return true;
        }

        if (this.isOutOfShots()) {
            this.failure = true;
            this.status = 'failure';
            this.result = {
                outcome: 'failure',
                victory: false,
                failure: true,
                levelId: this.level.id,
                levelName: this.level.name,
                levelHint: this.level.hint || '',
                stars: 0,
                coinsEarned: 0,
                totalCoins: loadCastleSiegeProgress().coins,
                firstClear: false,
                shotsRemaining: this.shotsRemaining,
                shotsFired: this.shotsFired,
                bestStars: 0,
                bestShotsRemaining: 0,
                timesCompleted: 0,
            };
            return true;
        }

        return false;
    }

    calculateStars() {
        if (!this.victory && !this.isObjectiveComplete()) return 0;
        if (this.shotsRemaining >= 4) return 3;
        if (this.shotsRemaining >= 2) return 2;
        return 1;
    }

    calculateRewards() {
        const stars = this.calculateStars();
        if (stars <= 0) return 0;
        const progress = loadCastleSiegeProgress();
        const completed = progress.completedLevels[this.level.id]?.completed;
        const starBonus = stars >= 3 ? 50 : (stars >= 2 ? 25 : 10);
        return 50 + starBonus + (completed ? 0 : 100);
    }

    summary() {
        const progress = loadCastleSiegeProgress();
        const levelProgress = progress.completedLevels[this.level.id] || null;
        const objectiveHealth = getCastleObjectiveHealth(this.blocks, this.level.objective);
        return {
            levelId: this.level.id,
            levelName: this.level.name,
            nextLevelId: getNextCastleSiegeLevelId(this.level.id),
            shotLimit: this.level.shotLimit,
            shotsRemaining: this.shotsRemaining,
            shotsFired: this.shotsFired,
            victory: this.victory,
            failure: this.failure,
            status: this.status,
            stars: this.calculateStars(),
            possibleCoins: this.calculateRewards(),
            result: this.result,
            objective: this.level.objective,
            objectiveHealth,
            blocks: this.blocks,
            blocksRemaining: this.blocks.filter((block) => !block.destroyed).length,
            blocksDestroyed: this.blocks.filter((block) => block.destroyed).length,
            lastImpact: this.lastImpact,
            lastCollapse: this.lastCollapse,
            progress: {
                coins: progress.coins,
                completed: Boolean(levelProgress?.completed),
                bestStars: levelProgress?.bestStars || 0,
                bestShotsRemaining: levelProgress?.bestShotsRemaining || 0,
                timesCompleted: levelProgress?.timesCompleted || 0,
            },
        };
    }
}
