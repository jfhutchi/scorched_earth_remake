import { Terrain } from './terrain.js';
import { Tank } from './tank.js';
import { Projectile, Explosion } from './projectile.js';
import { AudioManager } from './audio.js';
import { CPUController } from './cpu.js';
import { BackgroundRenderer } from './backgroundRenderer.js';
import { drawTankWreck } from './tankRenderer.js';
import { pickBattleTheme } from './themes.js';
import { CastleSiegeMode } from './siege/mode.js';
import { drawCastleSiegeBlocks, drawCastleSiegeHudOverlay, drawCastleSiegeObjectiveMarker } from './siege/renderer.js';
import { consumeCastleSiegeArmorySupplies } from './siege/armory.js';
import { getCastleSiegeLevel } from './siege/levels.js';
import { loadCastleSiegeProgress } from './siege/progress.js';
import { getNextLevelInCampaign, isLevelUnlocked } from './siege/worlds.js';
import { CONFIG, CPU_DIFFICULTY, GAME_VERSION, WEAPONS, clamp, clampShieldCharge, getWeaponById, limitedWeapons, maxAmmoFor } from './config.js';

export function getWinsNeededToClinch(matchLength) {
    const length = [1, 3, 5].includes(Number(matchLength)) ? Number(matchLength) : CONFIG.settings.defaults.roundsToWin;
    return Math.floor(length / 2) + 1;
}

export class Game {
    constructor(canvas, ui) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.ui = ui;
        this.audio = new AudioManager();
        this.cpu = new CPUController();
        this.backgroundRenderer = new BackgroundRenderer();

        this.width = canvas.width;
        this.height = canvas.height;
        this.visualTime = 0;
        this.theme = null;
        this.screenShakeTime = 0;
        this.screenShakeIntensity = 0;
        this.keys = new Set();
        this.lastFrame = performance.now();
        this.running = false;
        this.gameMode = 'two-player';
        this.siege = null;
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
        // Turn state ownership lives on the Game so future online multiplayer
        // can serialize/transfer it without untangling per-tank/per-key state.
        this.turnState = {
            activePlayerId: 0,
            turnNumber: 0,
            handoffPending: false,
            inputLocked: false,
            lastResultAudioRound: -1,
        };
        this.projectile = null;
        this.projectiles = [];
        this.explosions = [];
        this.wind = 0;
        this.lastResult = 'Choose a mode to start.';
        this.statusMessage = 'Main menu';
        this.shotInfo = null;
        this.roundStats = this._createRoundStats();
        this.lastSummary = null;
        this.lastSiegeArmorySupplies = [];
        this.shopCpuPurchased = false;
        this.lastCpuShopPurchases = [];
        this.roundStartMessages = [];
        this.roundStartHealEvents = [];
        this.feedbackTexts = [];
        this.pendingBurns = [];

        this._setupInput();
        this._setupPageLifecycle();
        this.ui.setMuted(this.audio.muted);
    }

    start(mode = 'two-player', settings = {}) {
        if (mode === 'siege') {
            this.startCastleSiege(settings);
            return;
        }

        this.settings = normalizeSettings(settings);
        this.gameMode = mode;
        this.siege = null;
        this.score = [0, 0];
        this.roundNumber = 0;
        this.matchWinnerIndex = null;
        this.turnState = {
            activePlayerId: 0,
            turnNumber: 0,
            handoffPending: false,
            inputLocked: false,
            lastResultAudioRound: -1,
        };
        this.playerData = this._createPlayerData();
        this.tanks = [];
        this.terrain = null;
        this.projectile = null;
        this.projectiles = [];
        this.explosions = [];
        this.visualTime = 0;
        this.screenShakeTime = 0;
        this.screenShakeIntensity = 0;
        this.gameOver = false;
        this.lastSummary = null;
        this.cpuTimer = 0;
        this.shotInfo = null;
        this.roundStats = this._createRoundStats();
        this.wind = 0;
        this.lastCpuShopPurchases = [];
        this.feedbackTexts = [];
        this.pendingBurns = [];
        this.audio.stopTankMoveLoop({ fade: 0, force: true });
        this.audio.stopAmbience();
        this.statusMessage = 'Pre-round shop. Default starts with no money; Start Round when ready.';
        this.lastResult = `Pre-round shop. Each player starts with $${this.playerData[0].money}.`;
        this.ui.hideAllOverlays();
        this._clearCanvas();

        // Open the shop before round 1 so starting money is useful.
        this._openShop({ preRound: true });

        if (!this.running) {
            this.running = true;
            this.lastFrame = performance.now();
            requestAnimationFrame(this.loop);
        }
    }

    startCastleSiege(settings = {}, levelId = 'siege_001') {
        this.siege = new CastleSiegeMode(levelId);
        const armoryUse = consumeCastleSiegeArmorySupplies();
        this.lastSiegeArmorySupplies = armoryUse.supplies;
        this.settings = normalizeSettings({
            ...settings,
            windMode: this.siege.level.windMode || settings.windMode,
            terrainRoughness: this.siege.level.terrainRoughness || settings.terrainRoughness,
        });
        this.gameMode = 'siege';
        this.score = [0, 0];
        this.roundNumber = 1;
        this.matchWinnerIndex = null;
        this.turnState = {
            activePlayerId: 0,
            turnNumber: 1,
            handoffPending: false,
            inputLocked: false,
            lastResultAudioRound: -1,
        };
        this.playerData = [{
            name: 'Player 1',
            money: 0,
            health: CONFIG.tank.maxHealth,
            ammo: createSiegeAmmo(this.siege.level.loadout, this.lastSiegeArmorySupplies),
            shieldCharge: 0,
            repairKits: 0,
            parachutes: 0,
        }];
        this.tanks = [];
        this.terrain = null;
        this.projectile = null;
        this.projectiles = [];
        this.explosions = [];
        this.visualTime = 0;
        this.screenShakeTime = 0;
        this.screenShakeIntensity = 0;
        this.gameOver = false;
        this.lastSummary = null;
        this.cpuTimer = 0;
        this.shotInfo = null;
        this.roundStats = this._createRoundStats();
        this.wind = 0;
        this.lastCpuShopPurchases = [];
        this.feedbackTexts = [];
        this.pendingBurns = [];
        this.shopCpuPurchased = false;
        this.audio.stopTankMoveLoop({ fade: 0, force: true });
        this.audio.stopAmbience();
        this.ui.hideAllOverlays();
        if (typeof this.ui.hideHandoff === 'function') this.ui.hideHandoff();
        if (typeof this.ui.hideCastleSiegeResult === 'function') this.ui.hideCastleSiegeResult();

        this.theme = pickBattleTheme(this.theme?.id || null);
        this.terrain = new Terrain(this.width, this.height, this.settings.terrainRoughness, this.theme.id);
        this._prepareCastleSiegeTerrain(this.siege.blocks, this.siege.level.playerStartX);

        const player = new Tank({
            id: 1,
            playerIndex: 0,
            name: 'Player 1',
            label: 'Player 1',
            x: this.siege.level.playerStartX,
            color: '#f16f45',
            facing: 1,
        });
        this.tanks = [player];
        this._syncTankFromPlayerData(0);
        player.settleOn(this.terrain);
        player.angle = this.siege.level.startingAngle;
        player.power = this.siege.level.startingPower;
        player.selectWeaponById('standard');

        this.currentPlayer = 0;
        this.keys.clear();
        this.cpu.resetRound();
        this._rollWind();
        this.audio.startAmbience(this.theme);
        this.phase = 'siegeAiming';
        const siegeHint = this.siege.level.hint || 'Destroy the castle core before you run out of shots.';
        this.statusMessage = `${this.siege.level.name}: ${siegeHint}`;
        const armoryText = formatSiegeArmorySupplies(this.lastSiegeArmorySupplies);
        this.lastResult = armoryText
            ? `Castle Siege ready. Armory loaded ${armoryText}. ${this.siege.shotsRemaining} shots available. Tip: ${siegeHint}`
            : `Castle Siege ready. ${this.siege.shotsRemaining} shots available. Tip: ${siegeHint}`;
        this._draw();
        this.ui.update(this._state());
        this.audio.playRoundStart();

        if (!this.running) {
            this.running = true;
            this.lastFrame = performance.now();
            requestAnimationFrame(this.loop);
        }
    }

    restartCastleSiegeLevel(levelId = this.siege ? this.siege.level.id : 'siege_001') {
        this.ui.showGame();
        this.startCastleSiege(this.settings, levelId);
    }

    getCastleSiegeResultForUi(result = this.siege ? this.siege.result : null) {
        return this._castleSiegeResultWithNext(result);
    }

    _prepareCastleSiegeTerrain(blocks, playerX) {
        if (!this.terrain) return;

        for (let x = 0; x < this.terrain.width; x++) {
            const ridge = Math.sin((x / this.terrain.width) * Math.PI) * 58;
            this.terrain.heights[x] = this.height * 0.76 - ridge + Math.sin(x * 0.012) * 5;
        }

        const playerGround = Math.round(this.height * 0.72);
        this._setTerrainRangeHeight(playerX - 72, playerX + 72, playerGround);

        const liveBlocks = Array.isArray(blocks) ? blocks : [];
        if (liveBlocks.length) {
            const minX = Math.min(...liveBlocks.map((block) => block.x));
            const maxX = Math.max(...liveBlocks.map((block) => block.x + block.width));
            const groundY = Math.max(...liveBlocks.map((block) => block.y + block.height));
            this._setTerrainRangeHeight(minX - 220, maxX + 44, groundY);
        }

        if (typeof this.terrain._smoothRange === 'function') {
            this.terrain._smoothRange(0, this.terrain.width - 1, 1);
        }
        this.terrain.craters = [];
        this.terrain.mounds = [];
        this.terrain.scorchMarks = [];
        if (typeof this.terrain._generateVisualDetails === 'function') this.terrain._generateVisualDetails();
    }

    _setTerrainRangeHeight(startX, endX, targetY) {
        if (!this.terrain) return;
        const start = Math.max(0, Math.floor(startX));
        const end = Math.min(this.terrain.width - 1, Math.ceil(endX));
        for (let x = start; x <= end; x++) {
            this.terrain.heights[x] = clamp(targetY, this.height * 0.38, this.height - 18);
        }
    }

    _clearCanvas() {
        if (!this.ctx) return;
        this.ctx.fillStyle = '#8ccced';
        this.ctx.fillRect(0, 0, this.width, this.height);
    }

    stop() {
        this.running = false;
        this.phase = 'menu';
        this.projectile = null;
        this.projectiles = [];
        this.explosions = [];
        this.feedbackTexts = [];
        this.pendingBurns = [];
        this.siege = null;
        this.cpuTimer = 0;
        this.keys.clear();
        this.audio.stopTankMoveLoop({ fade: 0, force: true });
        this.audio.stopAmbience();
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
        if (this.gameMode === 'siege') {
            this.restartCastleSiegeLevel();
            return;
        }
        this._setupRound({ incrementRound: false });
    }

    nextRound() {
        if (this.phase === 'handoff' && this.turnState.handoffPending) {
            this.acknowledgeHandoff();
            return;
        }
        if (this.phase === 'roundSummary') {
            this.openShop();
            return;
        }
        if (this.phase === 'shop') {
            this.startNextRoundFromShop();
        }
    }

    // Public entry: opens the between-round shop after a round summary.
    // The pre-round shop (before round 1) is opened from start() via _openShop.
    openShop() {
        if (this.phase !== 'roundSummary' || this.matchWinnerIndex !== null) return;
        this._openShop({ preRound: false });
    }

    _openShop({ preRound = false } = {}) {
        this.phase = 'shop';
        this.audio.stopTankMoveLoop();
        this.shopCpuPurchased = false;
        this.lastCpuShopPurchases = [];
        this._clampAllShields();
        if (this.gameMode === 'cpu') this._runCpuShop();
        this._clampAllShields();
        this.ui.showShop(this._state(), this.getShopItems());
    }

    startNextRoundFromShop() {
        if (this.phase !== 'shop' || this.matchWinnerIndex !== null) return;
        // Works for both pre-round (roundNumber 0 → 1) and between-round flows.
        this._setupRound({ incrementRound: true });
    }

    buyShopItem(playerIndex, itemId) {
        if (this.phase !== 'shop') return false;
        const player = this.playerData[playerIndex];
        const item = this._getShopItem(itemId);
        if (this.gameMode === 'cpu' && playerIndex === 1) return false;
        if (!player || !item) return false;

        if (!this._canPurchase(player, itemId)) {
            this.audio.playBlocked();
            return false;
        }
        if (player.money < item.price) {
            this.audio.playBlocked();
            return false;
        }

        player.money -= item.price;
        this._grantShopItem(player, itemId);
        this._syncTankInventoryFromPlayerData(playerIndex);
        this.audio.playPurchase();
        if (itemId === 'shield') this.audio.playShieldActivate();
        this.ui.showShop(this._state(), this.getShopItems());
        return true;
    }

    getShopItems() {
        const configuredItems = Object.entries(CONFIG.shop).map(([id, item]) => {
            const weapon = item.weaponId ? getWeaponById(item.weaponId) : null;
            return {
                id,
                ...item,
                description: item.description || weapon?.description || '',
                shortDescription: item.shortDescription || weapon?.shortDescription || weapon?.description || '',
                refillToMax: item.weaponId ? maxAmmoFor(item.weaponId) : null,
            };
        });
        const configuredWeaponIds = new Set(configuredItems
            .filter((item) => item.weaponId)
            .map((item) => item.weaponId));
        const generatedAmmoItems = limitedWeapons()
            .filter((weapon) => !configuredWeaponIds.has(weapon.id))
            .sort((a, b) => (a.shopPriority ?? 50) - (b.shopPriority ?? 50))
            .map((weapon) => ({
                id: `${weapon.id}Ammo`,
                label: `${weapon.name} Ammo`,
                refillLabel: `${weapon.name} Ammo`,
                fullLabel: `${weapon.name} Ammo Full`,
                price: weapon.price ?? weapon.shopRefillPrice,
                weaponId: weapon.id,
                refillToMax: maxAmmoFor(weapon.id),
                category: weapon.category,
                role: weapon.role,
                shopPriority: weapon.shopPriority ?? 50,
                description: weapon.shopDescription || weapon.description,
                shortDescription: weapon.shortDescription || weapon.shopDescription || weapon.description,
            }));
        const configuredAmmoItems = configuredItems.filter((item) => item.weaponId);
        const utilityItems = configuredItems.filter((item) => !item.weaponId);
        return [...configuredAmmoItems, ...generatedAmmoItems, ...utilityItems];
    }

    _getShopItem(itemId) {
        return this.getShopItems().find((item) => item.id === itemId) || null;
    }

    _canPurchase(player, itemId) {
        if (!player) return false;
        const item = this._getShopItem(itemId);
        if (!item) return false;
        if (item.weaponId) {
            const max = maxAmmoFor(item.weaponId);
            if (!Number.isFinite(max)) return true;
            return (player.ammo[item.weaponId] || 0) < max;
        }
        if (itemId === 'repair') {
            return player.health < CONFIG.tank.maxHealth;
        }
        if (itemId === 'shield') {
            player.shieldCharge = clampShieldCharge(player.shieldCharge);
            return player.shieldCharge < CONFIG.utilities.shieldMaxCharge;
        }
        return true;
    }

    toggleMute() {
        const muted = this.audio.toggleMute();
        this.ui.setMuted(muted);
        return muted;
    }

    // Map a touch action onto the same key the keyboard handler watches so
    // hold-to-repeat behavior matches between input methods.
    _touchHoldKey(action) {
        switch (action) {
            case 'aimLeft': return 'ArrowLeft';
            case 'aimRight': return 'ArrowRight';
            case 'powerUp': return 'ArrowUp';
            case 'powerDown': return 'ArrowDown';
            case 'moveLeft': return 'KeyA';
            case 'moveRight': return 'KeyD';
            default: return null;
        }
    }

    touchHoldStart(action) {
        const code = this._touchHoldKey(action);
        if (!code || !this.running) return;
        this.keys.add(code);
    }

    touchHoldEnd(action) {
        const code = this._touchHoldKey(action);
        if (!code) return;
        this.keys.delete(code);
    }

    touchTap(action) {
        if (action === 'fire') {
            if (this._canHumanControl()) this._fireSelectedWeapon();
            return;
        }
        if (action === 'weapon') {
            if (this._canHumanControl()) this._cycleWeapon();
            return;
        }
        if (action === 'restart') {
            if (['aiming', 'cpuThinking', 'projectile', 'resolving', 'siegeAiming', 'siegeProjectile', 'siegeResolving', 'siegeVictory', 'siegeFailure'].includes(this.phase)) {
                this.resetCurrentRound();
            }
            return;
        }
        if (action === 'next') {
            this.nextRound();
            return;
        }
        if (action === 'menu') {
            this.returnToMenu();
            return;
        }
        if (action === 'mute') {
            this.toggleMute();
            return;
        }
    }

    canHumanControl() {
        return this._canHumanControl();
    }

    isHandoffPending() {
        return Boolean(this.turnState && this.turnState.handoffPending);
    }

    getDebugTurnState() {
        const active = this._activeTank();
        return {
            mode: this.gameMode,
            phase: this.phase,
            roundNumber: this.roundNumber,
            turnNumber: this.turnState.turnNumber,
            activePlayerId: this.turnState.activePlayerId,
            activePlayerLabel: active ? active.label || active.name : null,
            inputLocked: this.turnState.inputLocked,
            handoffPending: this.turnState.handoffPending,
            gameOver: this.gameOver,
            matchWinnerIndex: this.matchWinnerIndex,
        };
    }

    getDebugMovementState() {
        return {
            mode: this.gameMode,
            phase: this.phase,
            activePlayerId: this.turnState.activePlayerId,
            movementInputActive: this._isMovementInputActive(),
            movementAudioActive: Boolean(this.audio.tankMoveLoop),
            tanks: this.tanks.map((tank, index) => ({
                playerIndex: tank.playerIndex ?? index,
                label: tank.label || tank.name,
                isCpu: !!tank.isCpu,
                alive: !!tank.alive,
                movementFuel: Math.round(tank.movementFuel),
                movementFuelMax: CONFIG.tank.movementFuelPerTurn,
                isActive: index === this.currentPlayer,
            })),
        };
    }

    exportDebugGameState() {
        // Returns a safe JSON-serializable snapshot for future multiplayer
        // serialization tests. DOM nodes, audio nodes, functions, and
        // circular references are intentionally excluded.
        return {
            version: GAME_VERSION,
            mode: this.gameMode,
            phase: this.phase,
            settings: { ...this.settings },
            roundNumber: this.roundNumber,
            roundsToWin: this.settings.roundsToWin,
            winsNeededToClinch: getWinsNeededToClinch(this.settings.roundsToWin),
            matchWinnerIndex: this.matchWinnerIndex,
            score: [...this.score],
            wind: this.wind,
            theme: this.theme ? { id: this.theme.id, label: this.theme.label || null } : null,
            terrain: this.terrain ? { width: this.terrain.width, height: this.terrain.height } : null,
            turnState: { ...this.turnState },
            currentPlayer: this.currentPlayer,
            players: this.playerData.map((player, index) => ({
                playerIndex: index,
                name: player.name,
                isCpu: this.gameMode === 'cpu' && index === 1,
                money: player.money,
                health: player.health,
                ammo: { ...player.ammo },
                shieldCharge: Math.round(clampShieldCharge(player.shieldCharge)),
                repairKits: player.repairKits || 0,
                parachutes: player.parachutes || 0,
            })),
            tanks: this.tanks.map((tank, index) => ({
                playerIndex: tank.playerIndex ?? index,
                id: tank.id,
                label: tank.label || tank.name,
                color: tank.color,
                facing: tank.facing,
                isCpu: !!tank.isCpu,
                alive: !!tank.alive,
                health: tank.health,
                x: Math.round(tank.x),
                y: Math.round(tank.y),
                angle: Math.round(tank.angle),
                power: Math.round(tank.power),
                movementFuel: Math.round(tank.movementFuel),
                movementFuelMax: CONFIG.tank.movementFuelPerTurn,
                shieldCharge: Math.round(clampShieldCharge(tank.shieldCharge)),
                repairKits: tank.repairKits || 0,
                parachutes: tank.parachutes || 0,
                selectedWeaponId: tank.selectedWeapon().id,
                ammo: WEAPONS.reduce((map, weapon) => {
                    const value = tank.ammoFor(weapon.id);
                    map[weapon.id] = Number.isFinite(value) ? value : 'unlimited';
                    return map;
                }, {}),
            })),
        };
    }

    _isMovementInputActive() {
        if (!this._canHumanControl()) return false;
        if (!this.keys || typeof this.keys.has !== 'function') return false;
        return this.keys.has('KeyA') || this.keys.has('KeyD');
    }

    clearTouchHolds() {
        ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'KeyA', 'KeyD'].forEach((code) => this.keys.delete(code));
        this.audio.stopTankMoveLoop();
    }

    advanceTime(ms) {
        if (!this.terrain) return;
        const steps = Math.max(1, Math.round(ms / (1000 / 60)));
        for (let i = 0; i < steps; i++) this._update(1 / 60);
        this._draw();
    }

    renderTextState() {
        const active = this.tanks[this.currentPlayer] || null;
        const siege = this.siege ? this.siege.summary() : null;
        const payload = {
            version: GAME_VERSION,
            coordinateSystem: 'Canvas pixels, origin top-left, x right, y down.',
            mode: this.gameMode,
            phase: this.phase,
            settings: this.settings,
            round: this.roundNumber,
            roundsToWin: this.settings.roundsToWin,
            winsNeededToClinch: getWinsNeededToClinch(this.settings.roundsToWin),
            score: {
                player1: this.score[0],
                player2: this.score[1],
            },
            currentPlayer: active ? active.name : null,
            controlsLocked: !this._canHumanControl(),
            wind: this.wind,
            theme: this.theme?.label || 'Pending',
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
                shieldCharge: Math.round(clampShieldCharge(tank.shieldCharge)),
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
            bomblets: this.projectiles.map((projectile) => ({
                x: Math.round(projectile.x),
                y: Math.round(projectile.y),
                weapon: projectile.weapon.name,
            })),
            siege: siege ? {
                levelId: siege.levelId,
                levelName: siege.levelName,
                shotsRemaining: siege.shotsRemaining,
                shotLimit: siege.shotLimit,
                victory: siege.victory,
                failure: siege.failure,
                objectiveHealth: siege.objectiveHealth,
                blocks: siege.blocks.map((block) => ({
                    id: block.id,
                    material: block.material,
                    x: Math.round(block.x),
                    y: Math.round(block.y),
                    hp: Math.max(0, Math.round(block.hp)),
                    maxHp: block.maxHp,
                    destroyed: block.destroyed,
                    supported: Boolean(block.supported),
                    falling: Boolean(block.falling),
                    velocityY: Math.round(block.velocityY || 0),
                    lastSupportedY: Math.round(block.lastSupportedY || block.y),
                    recentImpact: Number((block.recentImpact || 0).toFixed(2)),
                    tags: block.tags,
                })),
                result: siege.result,
            } : null,
        };
        return JSON.stringify(payload);
    }

    debugState() {
        return JSON.parse(this.renderTextState());
    }

    debugWeapons() {
        return WEAPONS.map((weapon) => ({
            id: weapon.id,
            name: weapon.name,
            category: weapon.category,
            role: weapon.role,
            price: weapon.price ?? weapon.shopRefillPrice,
            maxAmmo: Number.isFinite(maxAmmoFor(weapon.id)) ? maxAmmoFor(weapon.id) : 'unlimited',
            startingAmmo: Number.isFinite(weapon.startingAmmo) ? weapon.startingAmmo : 'unlimited',
            unlimitedAmmo: Boolean(weapon.unlimitedAmmo),
            speedScale: weapon.speedScale,
            damage: weapon.maxDamage,
            damageRadius: weapon.damageRadius,
            terrainRadius: weapon.terrainEffectRadius,
            terrainEffect: weapon.terrainEffect || weapon.terrainEffectType,
            cpuUseWeight: weapon.cpuUseWeight,
            shopPriority: weapon.shopPriority,
            arcDifficulty: weapon.arcDifficulty,
            splitPattern: weapon.splitPattern || weapon.splitBehavior?.pattern || null,
            spreadType: weapon.spreadType || weapon.splitBehavior?.spreadType || null,
            hasIconProfile: Boolean(weapon.iconProfile),
            hasVisualProfile: Boolean(weapon.visualProfile),
            hasSoundProfile: Boolean(weapon.soundProfile),
        }));
    }

    testWeaponCatalog() {
        const ids = new Set();
        const errors = [];
        const warnings = [];

        for (const weapon of WEAPONS) {
            if (!weapon.id) errors.push('Weapon missing id.');
            if (ids.has(weapon.id)) errors.push(`Duplicate weapon id: ${weapon.id}`);
            ids.add(weapon.id);
            if (!weapon.name) errors.push(`${weapon.id} missing name.`);
            if (!weapon.category) errors.push(`${weapon.id} missing category.`);
            if (!weapon.role) errors.push(`${weapon.id} missing role.`);
            if (!weapon.description) errors.push(`${weapon.id} missing description.`);
            if (!weapon.shortDescription) warnings.push(`${weapon.id} missing shortDescription.`);
            if (!weapon.iconProfile) errors.push(`${weapon.id} missing iconProfile.`);
            if (!weapon.visualProfile) errors.push(`${weapon.id} missing visualProfile.`);
            if (!weapon.soundProfile) errors.push(`${weapon.id} missing soundProfile.`);
            const maxAmmo = maxAmmoFor(weapon.id);
            if (!weapon.unlimitedAmmo && !Number.isFinite(maxAmmo)) errors.push(`${weapon.id} limited weapon missing finite maxAmmo.`);
            if (!weapon.unlimitedAmmo && maxAmmo > 0 && !Number.isFinite(weapon.price ?? weapon.shopRefillPrice)) {
                errors.push(`${weapon.id} purchasable limited weapon missing price.`);
            }
            if ((weapon.cpuUseWeight ?? 0) > 0 && (!weapon.role || !Number.isFinite(weapon.cpuUseWeight))) {
                errors.push(`${weapon.id} CPU-usable weapon missing CPU metadata.`);
            }
            if (weapon.behavior === 'roller' && !weapon.rollerBehavior) errors.push(`${weapon.id} rolling weapon missing rollerBehavior.`);
            if (weapon.behavior === 'airburst' && !weapon.airburstBehavior) errors.push(`${weapon.id} airburst weapon missing airburstBehavior.`);
            if (isSplitWeapon(weapon) && !weapon.splitBehavior) errors.push(`${weapon.id} split weapon missing splitBehavior.`);
        }

        return {
            ok: errors.length === 0,
            version: GAME_VERSION,
            count: WEAPONS.length,
            categories: [...new Set(WEAPONS.map((weapon) => weapon.category))],
            errors,
            warnings,
        };
    }

    setupWeaponTest(weaponId = 'standard') {
        const result = this.setupAimTest();
        const weapon = getWeaponById(weaponId);
        const player = this.tanks[0];
        if (player) player.selectWeaponById(weapon.id);
        this.wind = 0;
        this.lastResult = `Weapon test ready: all ammo full, wind 0, ${weapon.name} selected.`;
        this.statusMessage = 'Debug weapon test ready.';
        this._draw();
        this.ui.update(this._state());

        return {
            ...result,
            message: this.lastResult,
            selectedWeapon: weapon.name,
            catalog: this.testWeaponCatalog(),
        };
    }

    testWeaponImpact(weaponId = 'standard') {
        if (!this.terrain || !this.tanks.length || this.phase !== 'aiming' || this.projectile) {
            return { ok: false, message: 'Start a live aiming turn before testing weapon impacts.' };
        }

        const weapon = getWeaponById(weaponId);
        const shooterIndex = this.currentPlayer;
        const targetIndex = shooterIndex === 0 ? 1 : 0;
        const shooter = this.tanks[shooterIndex];
        const target = this.tanks[targetIndex] || this.tanks[0];
        const x = clamp(target.x + (weapon.id === 'dirt' ? -42 : 0), 20, this.width - 20);
        const y = this.terrain.heightAt(x);
        const weaponIndex = WEAPONS.findIndex((candidate) => candidate.id === weapon.id);
        if (shooter && weaponIndex !== -1) shooter.selectedWeaponIndex = weaponIndex;

        this.projectile = null;
        this.projectiles = [];
        this.shotInfo = {
            shooterIndex,
            targetIndex,
            weaponId: weapon.id,
            collision: 'terrain',
            impactX: x,
            impactY: y,
            enemyDamage: 0,
            selfDamage: 0,
            totalDamage: 0,
            shieldAbsorbed: 0,
            minTargetDistance: 0,
            clusterImpactCount: 0,
        };

        const result = this._applyExplosionDamage(x, y, weapon, 'terrain');
        if (weapon.behavior === 'napalm') this._queueNapalmBurns(result.affectedTankIndices, weapon);
        const terrainMessage = this._applyTerrainEffect(x, y, weapon);
        this._settleDestroyedTanks();
        const fallMessages = this._settleTanksWithFallDamage();
        const effectY = weapon.behavior === 'napalm' && this.terrain ? this.terrain.heightAt(x) : y;
        const explosion = new Explosion(
            x,
            effectY,
            weapon.explosionRadius,
            weapon,
            weapon.behavior === 'napalm' ? { surfacePoints: this._sampleNapalmSurface(x, weapon) } : undefined
        );
        this.explosions.push(explosion);
        this._addScreenShake(weapon);
        this.lastResult = `${result.message} ${terrainMessage}${fallMessages.length ? ` ${fallMessages.join(' ')}` : ''}`;
        this.statusMessage = `Debug impact: ${weapon.name}.`;
        this.phase = 'resolving';
        this.phaseTimer = Math.max(CONFIG.turn.impactDelaySeconds, this._remainingExplosionTime() + 0.15);
        this._draw();
        this.ui.update(this._state());

        return {
            ok: true,
            weapon: weapon.name,
            x: Math.round(x),
            y: Math.round(y),
            result: this.lastResult,
        };
    }

    testWeaponReach() {
        const shooter = this.tanks[0] || null;
        const target = this.tanks[1] || null;
        const currentTankDistance = shooter && target ? Math.round(Math.abs(target.x - shooter.x)) : null;
        const typicalEnemySpawnDistance = Math.max(CONFIG.terrain.minSpawnDistance, Math.round(this.width * 0.48));
        const power = CONFIG.tank.maxPower;
        const maxRangeAngle = 45;
        const highArcAngle = 60;

        return {
            ok: true,
            version: GAME_VERSION,
            angleRange: [CONFIG.tank.minAngle, CONFIG.tank.maxAngle],
            powerRange: [CONFIG.tank.minPower, CONFIG.tank.maxPower],
            power,
            windAssumption: 0,
            typicalEnemySpawnDistance,
            currentTankDistance,
            weapons: WEAPONS.map((weapon) => {
                const levelReach45 = estimateLevelReach(weapon, power, maxRangeAngle);
                const levelReach60 = estimateLevelReach(weapon, power, highArcAngle);
                const terrainReach45 = shooter && this.terrain
                    ? simulateTerrainReach({ shooter, terrain: this.terrain, weapon, angle: maxRangeAngle, power, wind: 0 })
                    : null;
                const bestReach = Math.max(levelReach45, levelReach60);
                const currentThreatReach = terrainReach45
                    ? Math.max(bestReach, terrainReach45.horizontalReach)
                    : bestReach;
                return {
                    id: weapon.id,
                    name: weapon.name,
                    category: weapon.category,
                    role: weapon.role,
                    speedScale: weapon.speedScale,
                    price: weapon.price ?? weapon.shopRefillPrice,
                    maxAmmo: maxAmmoFor(weapon.id),
                    maxDamage: weapon.maxDamage,
                    damageRadius: weapon.damageRadius,
                    damageFalloff: weapon.damageFalloff,
                    terrainEffectRadius: weapon.terrainEffectRadius,
                    approximateReachAt45: Math.round(levelReach45),
                    approximateReachAt60: Math.round(levelReach60),
                    currentTerrainReachAt45: terrainReach45 ? Math.round(terrainReach45.horizontalReach) : null,
                    canReachTypicalEnemySpawnDistance: bestReach + weapon.damageRadius >= typicalEnemySpawnDistance,
                    canThreatenCurrentEnemy: currentTankDistance === null
                        ? null
                        : currentThreatReach + weapon.damageRadius >= currentTankDistance,
                    notes: reachNotes(weapon),
                };
            }),
        };
    }

    setupAimTest() {
        this.ui.showGame();
        this.settings = normalizeSettings({
            ...this.settings,
            windMode: 'off',
            terrainRoughness: 'smooth',
            startingMoney: 'high',
        });
        this.gameMode = 'two-player';
        this.score = [0, 0];
        this.roundNumber = 1;
        this.matchWinnerIndex = null;
        this.gameOver = false;
        this.phaseTimer = 0;
        this.cpuTimer = 0;
        this.projectile = null;
        this.projectiles = [];
        this.explosions = [];
        this.shotInfo = null;
        this.roundStats = this._createRoundStats();
        this.lastSummary = null;
        this.shopCpuPurchased = false;
        this.lastCpuShopPurchases = [];
        this.theme = pickBattleTheme(null);
        this.terrain = new Terrain(this.width, this.height, 'smooth', this.theme.id);

        const baseline = Math.round(this.height * 0.66);
        for (let x = 0; x < this.terrain.width; x++) {
            this.terrain.heights[x] = baseline + Math.sin(x * 0.006) * 8;
        }
        this.terrain.craters = [];
        this.terrain.mounds = [];
        this.terrain.scorchMarks = [];
        if (typeof this.terrain._generateVisualDetails === 'function') this.terrain._generateVisualDetails();

        const x1 = 260;
        const x2 = 940;
        this.terrain.flattenPad(x1);
        this.terrain.flattenPad(x2);

        this.playerData = this._createPlayerData();
        for (const player of this.playerData) {
            player.money = CONFIG.economy.startingMoney.high;
            player.health = CONFIG.tank.maxHealth;
            player.shieldCharge = 0;
            player.repairKits = 0;
            player.parachutes = 1;
            for (const weapon of WEAPONS) {
                const maxAmmo = maxAmmoFor(weapon.id);
                player.ammo[weapon.id] = Number.isFinite(maxAmmo) ? maxAmmo : Infinity;
            }
        }

        const p1 = new Tank({ id: 1, playerIndex: 0, name: 'Player 1', label: 'Player 1', x: x1, color: '#f16f45', facing: 1 });
        const p2 = new Tank({ id: 2, playerIndex: 1, name: 'Player 2', label: 'Player 2', x: x2, color: '#3b87d6', facing: -1 });
        this.tanks = [p1, p2];
        this._syncTankFromPlayerData(0);
        this._syncTankFromPlayerData(1);
        p1.settleOn(this.terrain);
        p2.settleOn(this.terrain);
        p1.angle = 45;
        p1.power = 100;
        p2.angle = 45;
        p2.power = 100;
        p1.selectWeaponById('mega');

        this.currentPlayer = 0;
        this.wind = 0;
        this.keys.clear();
        this.cpu.resetRound();
        this.turnState.activePlayerId = 0;
        this.turnState.turnNumber = 0;
        this.turnState.handoffPending = false;
        this.turnState.inputLocked = false;
        this.audio.startAmbience(this.theme);
        this._startTurn(false);
        p1.angle = 45;
        p1.power = 100;
        p1.selectWeaponById('mega');
        this.lastResult = 'Debug aim test ready: wind 0, flat terrain, Mega Bomb selected at power 100.';
        this.statusMessage = 'Debug aim test ready.';
        this._draw();
        this.ui.update(this._state());

        if (!this.running) {
            this.running = true;
            this.lastFrame = performance.now();
            requestAnimationFrame(this.loop);
        }

        return {
            ok: true,
            message: 'Aim test ready. Mega Bomb is selected at power 100 with wind 0.',
            selectedWeapon: p1.selectedWeapon().name,
            tanks: this.tanks.map((tank) => ({ name: tank.name, x: Math.round(tank.x), y: Math.round(tank.y) })),
            reach: this.testWeaponReach(),
        };
    }

    forceRoundWin(playerIndex = 0) {
        if (!this.terrain || !this.tanks.length || this.phase === 'menu' || this.phase === 'roundSummary' || this.phase === 'shop') {
            return { ok: false, message: 'Start or resume a live round before forcing a round win.' };
        }

        const winnerIndex = playerIndex === 1 ? 1 : 0;
        const loserIndex = winnerIndex === 0 ? 1 : 0;
        this.projectile = null;
        this.projectiles = [];
        this.explosions = [];
        this.tanks[winnerIndex].alive = true;
        this.tanks[winnerIndex].health = Math.max(1, this.tanks[winnerIndex].health);
        this.tanks[loserIndex].health = 0;
        this.tanks[loserIndex].alive = false;
        this._syncPlayerDataFromTank(winnerIndex);
        this._syncPlayerDataFromTank(loserIndex);
        this._checkWinCondition();

        return {
            ok: true,
            winner: this.playerData[winnerIndex].name,
            phase: this.phase,
        };
    }

    testParachuteDrop() {
        if (!this.terrain || !this.tanks.length || this.phase === 'menu' || this.phase === 'roundSummary' || this.phase === 'shop') {
            this.setupAimTest();
        }

        const tank = this.tanks[0];
        if (!tank || !this.terrain) {
            return { ok: false, message: 'Could not prepare a parachute test.' };
        }

        this.phase = 'aiming';
        this.currentPlayer = 0;
        tank.health = CONFIG.tank.maxHealth;
        tank.alive = true;
        tank.parachutes = 1;
        this.roundStats = this._createRoundStats();
        this._syncPlayerDataFromTank(0);

        const before = {
            y: Math.round(tank.y),
            health: tank.health,
            parachutes: tank.parachutes,
        };
        const left = Math.max(0, Math.floor(tank.x - 38));
        const right = Math.min(this.terrain.width - 1, Math.ceil(tank.x + 38));
        for (let x = left; x <= right; x++) {
            this.terrain.heights[x] = clamp(this.terrain.heights[x] + 92, 70, this.terrain.height - 2);
        }
        if (typeof this.terrain._generateVisualDetails === 'function') this.terrain._generateVisualDetails();

        const messages = this._settleTanksWithFallDamage();
        this.lastResult = messages.length ? messages.join(' ') : 'Parachute drop test did not create fall damage.';
        this.statusMessage = 'Debug parachute drop resolved.';
        this._draw();
        this.ui.update(this._state());

        return {
            ok: true,
            before,
            after: {
                y: Math.round(tank.y),
                health: tank.health,
                parachutes: tank.parachutes,
                parachutesUsed: this.roundStats[0].parachutesUsed,
                fallDamageTaken: this.roundStats[0].fallDamageTaken,
                fallDamagePrevented: this.roundStats[0].fallDamagePrevented,
            },
            result: this.lastResult,
        };
    }

    debugGrantMoney(amount, playerIndex = 'active', { set = false } = {}) {
        const indices = this._debugResolvePlayerIndices(playerIndex);
        if (!indices.length) return { ok: false, message: 'No player data is available. Start a match or setup a test range first.' };
        const value = Math.max(0, Math.round(amount));
        for (const index of indices) {
            const player = this.playerData[index];
            player.money = set ? value : Math.max(0, Math.round(player.money || 0) + value);
            this._syncTankInventoryFromPlayerData(index);
        }
        return this._debugRefresh(set ? `Set money to $${value}.` : `Added $${value}.`);
    }

    debugRefillWeapons(playerIndex = 'active') {
        const indices = this._debugResolvePlayerIndices(playerIndex);
        if (!indices.length) return { ok: false, message: 'No player data is available. Start a match or setup a test range first.' };
        for (const index of indices) {
            const player = this.playerData[index];
            for (const weapon of WEAPONS) {
                const max = maxAmmoFor(weapon.id);
                player.ammo[weapon.id] = Number.isFinite(max) ? max : Infinity;
            }
            this._syncTankInventoryFromPlayerData(index);
        }
        return this._debugRefresh('Refilled all limited weapons; Standard Shell remains unlimited.');
    }

    debugRefillWeapon(weaponId, playerIndex = 'active') {
        const weapon = getWeaponById(weaponId);
        const indices = this._debugResolvePlayerIndices(playerIndex);
        if (!weapon || !indices.length) return { ok: false, message: 'Choose a valid weapon and player first.' };
        for (const index of indices) {
            const player = this.playerData[index];
            const max = maxAmmoFor(weapon.id);
            player.ammo[weapon.id] = Number.isFinite(max) ? max : Infinity;
            this._syncTankInventoryFromPlayerData(index);
            const tank = this.tanks[index];
            if (tank) tank.selectWeaponById(weapon.id);
        }
        return this._debugRefresh(`Refilled ${weapon.name}.`);
    }

    debugRefillUtilities(playerIndex = 'active', utility = 'all') {
        const indices = this._debugResolvePlayerIndices(playerIndex);
        if (!indices.length) return { ok: false, message: 'No player data is available. Start a match or setup a test range first.' };
        for (const index of indices) {
            const player = this.playerData[index];
            if (utility === 'all' || utility === 'shield') player.shieldCharge = CONFIG.utilities.shieldMaxCharge;
            if (utility === 'all' || utility === 'repair') player.repairKits = Math.max(player.repairKits || 0, 3);
            if (utility === 'all' || utility === 'parachute') player.parachutes = Math.max(player.parachutes || 0, 3);
            this._syncTankInventoryFromPlayerData(index);
        }
        return this._debugRefresh(utility === 'all' ? 'Refilled all utilities.' : `Refilled ${utility}.`);
    }

    debugHeal(playerIndex = 'active') {
        const indices = this._debugResolvePlayerIndices(playerIndex);
        if (!indices.length) return { ok: false, message: 'No player data is available. Start a match or setup a test range first.' };
        for (const index of indices) {
            const player = this.playerData[index];
            player.health = CONFIG.tank.maxHealth;
            const tank = this.tanks[index];
            if (tank) {
                tank.health = CONFIG.tank.maxHealth;
                tank.alive = true;
                tank.deathEffectPlayed = false;
                tank.wreckSmokeTime = 0;
            }
            this._syncTankInventoryFromPlayerData(index);
        }
        return this._debugRefresh('Healed selected tank state to full.');
    }

    debugDamageActiveEnemy(amount, { destroy = false } = {}) {
        if (!this.terrain || !this.tanks.length || this.phase === 'menu') {
            return { ok: false, message: 'Start a live round or setup a test range before damaging tanks.' };
        }
        const winnerIndex = this.currentPlayer === 0 ? 0 : 1;
        const enemyIndex = winnerIndex === 0 ? 1 : 0;
        const enemy = this.tanks[enemyIndex];
        if (!enemy) return { ok: false, message: 'Enemy tank is not available.' };
        if (destroy) {
            return this.forceRoundWin(winnerIndex);
        }
        const damage = Math.max(0, Math.round(amount));
        const wasAlive = enemy.alive;
        const actual = enemy.applyDamage(damage, { useShield: false });
        if (wasAlive && !enemy.alive) this._triggerTankDeathEffects([enemyIndex]);
        this._syncPlayerDataFromTank(enemyIndex);
        if (!enemy.alive) {
            this._checkWinCondition();
            return { ok: true, message: `${enemy.name} destroyed by debug damage.`, phase: this.phase };
        }
        return this._debugRefresh(`${enemy.name} took ${actual} debug damage.`);
    }

    debugClearShields() {
        for (let index = 0; index < this.playerData.length; index++) {
            this.playerData[index].shieldCharge = 0;
            if (this.tanks[index]) this.tanks[index].shieldCharge = 0;
            this._syncTankInventoryFromPlayerData(index);
        }
        return this._debugRefresh('Cleared all shields.');
    }

    debugAddShield(playerIndex = 'active') {
        const indices = this._debugResolvePlayerIndices(playerIndex);
        if (!indices.length) return { ok: false, message: 'No player data is available. Start a match or setup a test range first.' };
        for (const index of indices) {
            const player = this.playerData[index];
            player.shieldCharge = clampShieldCharge((player.shieldCharge || 0) + CONFIG.utilities.shieldPurchaseCharge);
            this._syncTankInventoryFromPlayerData(index);
        }
        this.audio.playShieldActivate();
        return this._debugRefresh('Added shield charge.');
    }

    debugSetWind(value) {
        if (!this.terrain || this.phase === 'menu') return { ok: false, message: 'Start a round or setup a test range before changing wind.' };
        this.wind = clamp(Number(value) || 0, CONFIG.wind.min, CONFIG.wind.max);
        return this._debugRefresh(`Wind set to ${this.wind}.`);
    }

    debugGiveAllTestingSupplies(playerIndex = 'all') {
        const money = this.debugGrantMoney(9999, playerIndex, { set: true });
        if (!money.ok) return money;
        this.debugRefillWeapons(playerIndex);
        this.debugRefillUtilities(playerIndex, 'all');
        return this._debugRefresh('Granted all weapons, utilities, and money for testing.');
    }

    debugSetupFlatTerrain() {
        const result = this.setupAimTest();
        this.lastResult = 'Debug flat terrain ready with wind 0.';
        this.statusMessage = 'Debug flat terrain ready.';
        this._draw();
        this.ui.update(this._state());
        return { ...result, message: this.lastResult };
    }

    debugEndTurn() {
        if (!this.terrain || !this.tanks.length || this.phase !== 'aiming' || this.gameOver) {
            return { ok: false, message: 'End Turn is only available during a live aiming turn.' };
        }
        this.projectile = null;
        this.projectiles = [];
        this.keys.clear();
        this.currentPlayer = this.currentPlayer === 0 ? 1 : 0;
        this.shotInfo = null;
        this._rollWind();
        this._startTurn(true);
        return { ok: true, message: 'Turn ended.', currentPlayer: this.currentPlayer };
    }

    debugForceMatchWin(playerIndex = 0) {
        if (!this.terrain || !this.tanks.length || this.phase === 'menu') this.setupAimTest();
        if (this.phase === 'roundSummary' || this.phase === 'shop') {
            this.phase = 'aiming';
            this.gameOver = false;
        }
        const winnerIndex = playerIndex === 1 ? 1 : 0;
        const loserIndex = winnerIndex === 0 ? 1 : 0;
        const winsNeeded = getWinsNeededToClinch(this.settings.roundsToWin);
        this.score[winnerIndex] = Math.max(this.score[winnerIndex], winsNeeded - 1);
        this.score[loserIndex] = Math.min(this.score[loserIndex], winsNeeded - 1);
        return this.forceRoundWin(winnerIndex);
    }

    _debugResolvePlayerIndices(playerIndex) {
        if (!this.playerData.length) return [];
        if (playerIndex === 'all') return this.playerData.map((_player, index) => index);
        if (playerIndex === 'active') return [clamp(this.currentPlayer || 0, 0, this.playerData.length - 1)];
        const numeric = Number(playerIndex);
        if (!Number.isInteger(numeric) || numeric < 0 || numeric >= this.playerData.length) return [];
        return [numeric];
    }

    _debugRefresh(message) {
        this.lastResult = message;
        this.statusMessage = message;
        this._clampAllShields();
        if (this.phase === 'shop') this.ui.showShop(this._state(), this.getShopItems());
        else if (this.tanks.length) this.ui.update(this._state());
        this._draw();
        return {
            ok: true,
            message,
            phase: this.phase,
            state: this.debugState(),
        };
    }

    _createPlayerData() {
        const startingMoney = CONFIG.economy.startingMoney[this.settings.startingMoney] ?? CONFIG.economy.startingMoney.none;
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

    _clampAllShields() {
        for (const player of this.playerData) {
            if (player) player.shieldCharge = clampShieldCharge(player.shieldCharge);
        }
        for (const tank of this.tanks) {
            if (tank) tank.shieldCharge = clampShieldCharge(tank.shieldCharge);
        }
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
            burnDamageDealt: 0,
            burnDamageTaken: 0,
            parachutesUsed: 0,
            fallDamagePrevented: 0,
        }));
    }

    _setupRound({ incrementRound }) {
        if (incrementRound || this.roundNumber === 0) this.roundNumber += 1;

        this.theme = pickBattleTheme(this.theme?.id || null);
        this.terrain = new Terrain(this.width, this.height, this.settings.terrainRoughness, this.theme.id);
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
        this.roundStartMessages = this._applyRepairKitsForNewRound();
        this._clampAllShields();

        const p1 = new Tank({
            id: 1,
            playerIndex: 0,
            name: 'Player 1',
            label: 'Player 1',
            x: x1,
            color: '#f16f45',
            facing: 1,
        });
        const p2 = new Tank({
            id: 2,
            playerIndex: 1,
            name: p2IsCpu ? 'CPU' : 'Player 2',
            label: p2IsCpu ? 'CPU' : 'Player 2',
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
        this.projectiles = [];
        this.explosions = [];
        this.feedbackTexts = [];
        this.pendingBurns = [];
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
        // Reset per-round turn ownership. Each round starts at turn 0; the
        // very first turn never shows the local handoff overlay.
        this.turnState.activePlayerId = 0;
        this.turnState.turnNumber = 0;
        this.turnState.handoffPending = false;
        this.turnState.inputLocked = false;
        this.turnState.lastResultAudioRound = -1;
        this._rollWind();
        this.audio.startAmbience(this.theme);

        this.lastResult = this.roundStartMessages.length
            ? `${this.roundStartMessages.join(' ')} Round ${this.roundNumber} ready.`
            : `Round ${this.roundNumber} ready.`;
        this.statusMessage = 'Player 1 is aiming.';
        this.ui.hideAllOverlays();
        if (typeof this.ui.hideHandoff === 'function') this.ui.hideHandoff();
        this._startTurn(false);
        for (const event of this.roundStartHealEvents) {
            const tank = this.tanks[event.index];
            if (tank) this._addFloatingText(tank.x, tank.y - tank.height - 34, `+${event.healed} HP`, '#6ee88d', { size: 18 });
        }
        this._draw();
        this.ui.update(this._state());
        this.audio.playRoundStart();
    }

    _applyRepairKitsForNewRound() {
        const messages = [];
        let anyHealed = false;
        this.roundStartHealEvents = [];
        for (let index = 0; index < this.playerData.length; index++) {
            const player = this.playerData[index];
            // v0.6: First Aid Kit fully restores health between rounds and is
            // only consumed when the tank is below max health.
            if (player.repairKits > 0 && player.health < CONFIG.tank.maxHealth) {
                player.repairKits -= 1;
                const healed = CONFIG.tank.maxHealth - player.health;
                player.health = CONFIG.tank.maxHealth;
                messages.push(`${player.name} used a First Aid Kit (+${healed} HP, fully healed).`);
                this.roundStartHealEvents.push({ index, healed });
                anyHealed = true;
            }
        }
        if (anyHealed) this.audio.playHeal();
        return messages;
    }

    _syncTankFromPlayerData(index) {
        const tank = this.tanks[index];
        const data = this.playerData[index];
        if (!tank || !data) return;

        tank.name = data.name;
        tank.health = clamp(Math.round(data.health), 1, CONFIG.tank.maxHealth);
        tank.alive = tank.health > 0;
        tank.money = Math.max(0, Math.round(data.money));
        data.shieldCharge = clampShieldCharge(data.shieldCharge);
        tank.shieldCharge = data.shieldCharge;
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
        tank.shieldCharge = clampShieldCharge(tank.shieldCharge);
        data.shieldCharge = tank.shieldCharge;
        data.repairKits = Math.max(0, tank.repairKits);
        data.parachutes = Math.max(0, tank.parachutes);
        data.ammo = ammoSnapshotFromTank(tank);
    }

    _syncTankInventoryFromPlayerData(index) {
        const tank = this.tanks[index];
        const data = this.playerData[index];
        if (!tank || !data) return;

        tank.money = Math.max(0, Math.round(data.money));
        data.shieldCharge = clampShieldCharge(data.shieldCharge);
        tank.shieldCharge = data.shieldCharge;
        tank.repairKits = Math.max(0, data.repairKits);
        tank.parachutes = Math.max(0, data.parachutes);
        tank.ammo = { ...data.ammo, standard: Infinity };
        tank.ensureAvailableWeapon();
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
            winsNeededToClinch: getWinsNeededToClinch(this.settings.roundsToWin),
            score: this.score,
            phase: this.phase,
            wind: this.wind,
            theme: this.theme,
            lastResult: this.lastResult,
            statusMessage: this.statusMessage,
            gameOver: this.gameOver,
            matchWinnerIndex: this.matchWinnerIndex,
            lastSummary: this.lastSummary,
            lastCpuShopPurchases: [...this.lastCpuShopPurchases],
            muted: this.audio.muted,
            turnState: { ...this.turnState },
            siege: this.siege ? this.siege.summary() : null,
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

            // Handoff overlay: Enter starts the next local human turn. Space
            // is intentionally NOT mapped here so the inactive player can't
            // accidentally fire a weapon by tapping the spacebar before
            // confirming the handoff.
            if (this.phase === 'handoff' && this.turnState.handoffPending) {
                if ((code === 'Enter' || code === 'NumpadEnter') && !e.repeat) {
                    e.preventDefault();
                    this.acknowledgeHandoff();
                }
                return;
            }

            if (code === 'KeyR' && !e.repeat) {
                e.preventDefault();
                if (this.phase === 'aiming' || this.phase === 'cpuThinking' || this.phase === 'projectile' || this.phase === 'resolving'
                    || this.phase === 'siegeAiming' || this.phase === 'siegeProjectile' || this.phase === 'siegeResolving'
                    || this.phase === 'siegeVictory' || this.phase === 'siegeFailure') {
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

    _setupPageLifecycle() {
        const hide = () => this._handlePageInactive();
        const show = () => this._handlePageActive();

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) hide();
            else show();
        });
        window.addEventListener('pagehide', hide);
        window.addEventListener('blur', hide);
        window.addEventListener('focus', show);
        if (typeof document.addEventListener === 'function') {
            document.addEventListener('freeze', hide);
        }
    }

    _handlePageInactive() {
        this.keys.clear();
        this.audio.handlePageHidden();
    }

    _handlePageActive() {
        this.audio.handlePageVisible();
        if (this.running && this.theme && ['aiming', 'cpuThinking', 'projectile', 'resolving', 'handoff', 'siegeAiming', 'siegeProjectile', 'siegeResolving'].includes(this.phase)) {
            this.audio.startAmbience(this.theme);
        }
    }

    _cycleWeapon() {
        if (!this._canHumanControl()) return;
        const tank = this._activeTank();
        const weapon = tank.cycleWeapon();
        this.statusMessage = `${tank.name} selected ${weapon.name}.`;
        this.audio.playWeaponCycle();
        if (typeof this.ui.showWeaponToast === 'function') this.ui.showWeaponToast(weapon, tank);
        this.ui.update(this._state());
    }

    _activeTank() {
        return this.tanks[this.currentPlayer];
    }

    _isProjectilePhase() {
        return this.phase === 'projectile' || this.phase === 'siegeProjectile';
    }

    _canHumanControl() {
        const active = this._activeTank();
        const aimingPhase = this.gameMode === 'siege' ? this.phase === 'siegeAiming' : this.phase === 'aiming';
        return Boolean(
            this.running &&
            !this.gameOver &&
            aimingPhase &&
            !this.turnState.inputLocked &&
            !this.turnState.handoffPending &&
            active &&
            active.alive &&
            !active.isCpu &&
            !this.projectile &&
            (!this.siege || this.siege.shotsRemaining > 0)
        );
    }

    _startTurn(playSound = true, { fromHandoff = false } = {}) {
        if (this.gameOver) return;
        const active = this._activeTank();
        if (!active) return;
        // Movement allowance is per-tank/per-turn. Only the active tank's fuel
        // is reset here; the inactive tank keeps its remaining fuel from its
        // own previous turn and will be reset when it next becomes active.
        active.ensureAvailableWeapon();
        active.resetMovementFuel();

        // Clear any stuck movement keys that may have leaked from the previous
        // player's input on shared-keyboard local play.
        ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'KeyA', 'KeyD', 'Space'].forEach((code) => this.keys.delete(code));
        this.audio.stopTankMoveLoop({ fade: 0, force: true });

        this.turnState.activePlayerId = this.currentPlayer;
        this.turnState.turnNumber = (this.turnState.turnNumber || 0) + 1;

        const needsLocalHandoff = !fromHandoff
            && this.gameMode === 'two-player'
            && !active.isCpu
            && this.turnState.turnNumber > 1;

        if (needsLocalHandoff) {
            this.turnState.handoffPending = true;
            this.turnState.inputLocked = true;
            this.phase = 'handoff';
            this.statusMessage = `${active.name}: pass the keyboard or device, then press Start Turn.`;
            this.lastResult = `${active.name} is up next. Pass the keyboard/device.`;
            if (typeof this.ui.showHandoff === 'function') {
                this.ui.showHandoff(this._state(), active);
            }
            this.ui.update(this._state());
            return;
        }

        this.turnState.handoffPending = false;
        this.turnState.inputLocked = false;
        if (typeof this.ui.hideHandoff === 'function') this.ui.hideHandoff();

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

    acknowledgeHandoff() {
        if (this.phase !== 'handoff' || !this.turnState.handoffPending) return false;
        this.turnState.handoffPending = false;
        this.turnState.inputLocked = false;
        if (typeof this.ui.hideHandoff === 'function') this.ui.hideHandoff();
        this.audio.playContinue();
        this._startTurn(true, { fromHandoff: true });
        return true;
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

        this.visualTime += dt;
        if (this.screenShakeTime > 0) {
            this.screenShakeTime = Math.max(0, this.screenShakeTime - dt);
            if (this.screenShakeTime === 0) this.screenShakeIntensity = 0;
        }

        if ((this.phase === 'aiming' || this.phase === 'siegeAiming') && this._canHumanControl()) {
            this._updateHumanAim(dt);
            this._updateHumanMovement(dt);
        } else {
            this.audio.stopTankMoveLoop();
        }

        if (this.phase === 'cpuThinking') {
            this.cpuTimer -= dt;
            if (this.cpuTimer <= 0) this._fireCpuShot();
        }

        this.tanks.forEach((tank) => tank.update(dt));
        if (this.gameMode === 'siege' && this.siege && !this.gameOver) {
            const collapse = this.siege.update(dt, this.terrain);
            if (collapse.impactDamage > 0) {
                this.lastResult = `Castle blocks settled with ${Math.round(collapse.impactDamage)} impact damage.`;
                if (collapse.destroyedCore) this.statusMessage = 'Castle core shattered during collapse.';
            }
        }
        this._updateFeedback(dt);
        this._updateBurns(dt);

        if ((this.projectile || this.projectiles.length > 0) && this._isProjectilePhase()) {
            this._updateProjectile(dt);
        }

        this.explosions.forEach((explosion) => explosion.update(dt));
        this.explosions = this.explosions.filter((explosion) => explosion.alive);

        if (this.phase === 'resolving' || this.phase === 'siegeResolving') {
            this.phaseTimer -= dt;
            const siegeSettling = this.gameMode === 'siege' && this.siege && this.siege.isSettling();
            if (this.phaseTimer <= 0 && this.pendingBurns.length === 0 && !siegeSettling) {
                if (this.gameMode === 'siege') this._finishCastleSiegeResolution();
                else this._finishShotResolution();
            }
        }

        this.ui.update(this._state());
    }

    _updateFeedback(dt) {
        for (const feedback of this.feedbackTexts) {
            feedback.age += dt;
        }
        this.feedbackTexts = this.feedbackTexts.filter((feedback) => feedback.age < feedback.duration);
    }

    _updateBurns(dt) {
        if (!this.pendingBurns.length) return;
        if (!this.shotInfo) {
            this.pendingBurns = [];
            return;
        }
        if (this.phase !== 'resolving' || this.gameOver) {
            this.pendingBurns = [];
            return;
        }

        const completed = [];
        for (const burn of this.pendingBurns) {
            burn.timer -= dt;
            if (burn.timer > 0) continue;

            const tank = this.tanks[burn.tankIndex];
            if (!tank || !tank.alive || burn.ticksRemaining <= 0) {
                completed.push(burn);
                continue;
            }

            const wasAlive = tank.alive;
            const actual = tank.applyDamage(burn.damage, { useShield: true });
            const absorbed = tank.lastShieldAbsorbed || 0;
            if (absorbed > 0) {
                this._addFloatingText(tank.x, tank.y - tank.height - 42, `Shield -${absorbed}`, '#9edbe6', { size: 14 });
                this.audio.playShieldAbsorb({ x: tank.x, width: this.width });
            }
            if (actual > 0) {
                this.roundStats[burn.tankIndex].damageTaken += actual;
                this.roundStats[burn.tankIndex].burnDamageTaken += actual;
                if (burn.tankIndex === this.shotInfo?.targetIndex) {
                    this.shotInfo.enemyDamage += actual;
                    this.roundStats[burn.shooterIndex].damageDealt += actual;
                    this.roundStats[burn.shooterIndex].burnDamageDealt += actual;
                } else if (burn.tankIndex === this.shotInfo?.shooterIndex) {
                    this.shotInfo.selfDamage += actual;
                }
                this.shotInfo.totalDamage += actual;
                this._addFloatingText(tank.x, tank.y - tank.height - 28, `Burn -${actual}`, '#ff9a3d', { size: 14 });
                this.audio.playHit({ x: tank.x, width: this.width });
            }
            if (wasAlive && !tank.alive) {
                const deathTime = this._triggerTankDeathEffects([burn.tankIndex]);
                this.phaseTimer = Math.max(this.phaseTimer, deathTime + 0.18);
            }
            this._syncPlayerDataFromTank(burn.tankIndex);

            burn.ticksRemaining -= 1;
            if (burn.ticksRemaining <= 0) {
                completed.push(burn);
            } else {
                burn.timer = burn.interval;
            }
        }

        if (completed.length) {
            this.pendingBurns = this.pendingBurns.filter((burn) => !completed.includes(burn));
        }
    }

    _addFloatingText(x, y, text, color, { size = 18, duration = 1.15 } = {}) {
        if (!Number.isFinite(x) || !Number.isFinite(y) || !text) return;
        const offset = (this.feedbackTexts.length % 4) * 12;
        this.feedbackTexts.push({
            x,
            y: y - offset,
            text,
            color,
            size,
            duration,
            age: 0,
        });
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
        if (tank.movementFuel <= 0) {
            this.audio.stopTankMoveLoop();
            return;
        }

        let direction = 0;
        if (this.keys.has('KeyA')) direction -= 1;
        if (this.keys.has('KeyD')) direction += 1;
        if (direction === 0) {
            this.audio.stopTankMoveLoop();
            return;
        }

        const distance = Math.min(CONFIG.tank.moveSpeed * dt, tank.movementFuel);
        if (distance <= 0) {
            this.audio.stopTankMoveLoop();
            return;
        }

        const moved = this._tryMoveTank(tank, direction * distance);
        if (moved) {
            tank.spendMovementFuel(Math.abs(moved));
            this.statusMessage = tank.movementFuel > 0
                ? `${tank.name} is repositioning.`
                : `${tank.name} has no movement fuel left.`;
            if (tank.movementFuel > 0) this.audio.startTankMoveLoop({ x: tank.x, width: this.width });
            else this.audio.stopTankMoveLoop();
        } else {
            this.audio.stopTankMoveLoop();
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
        const aimingPhase = this.gameMode === 'siege' ? 'siegeAiming' : 'aiming';
        if (this.gameOver || this.projectile || this.phase !== aimingPhase) return false;
        const shooter = this._activeTank();
        if (!shooter || !shooter.alive) return false;
        if (this.gameMode === 'siege' && (!this.siege || this.siege.shotsRemaining <= 0)) {
            if (this.siege) {
                this.siege.finishIfNeeded();
                if (this.siege.failure) this._showCastleSiegeFailure();
            }
            return false;
        }
        this.audio.stopTankMoveLoop();

        const weapon = shooter.selectedWeapon();
        if (!shooter.canUseWeapon(weapon.id)) {
            shooter.ensureAvailableWeapon();
            this.statusMessage = `${shooter.name} has no ammo for that weapon.`;
            return false;
        }

        if (!shooter.consumeSelectedAmmo()) return false;
        if (this.gameMode === 'siege' && !this.siege.consumeShot()) return false;
        this._syncPlayerDataFromTank(this.currentPlayer);
        this.roundStats[this.currentPlayer].shotsFired += 1;

        const muzzle = shooter.muzzlePosition();
        const velocity = shooter.fireVelocity(weapon);
        this.projectile = new Projectile(muzzle.x, muzzle.y, velocity.vx, velocity.vy, weapon);
        shooter.triggerFireVisual();
        this.projectiles = [];
        this.shotInfo = {
            shooterIndex: this.currentPlayer,
            targetIndex: this.gameMode === 'siege' ? null : (this.currentPlayer === 0 ? 1 : 0),
            weaponId: weapon.id,
            collision: 'miss',
            impactX: muzzle.x,
            impactY: muzzle.y,
            enemyDamage: 0,
            selfDamage: 0,
            totalDamage: 0,
            shieldAbsorbed: 0,
            minTargetDistance: Infinity,
            clusterImpactCount: 0,
        };
        this.phase = this.gameMode === 'siege' ? 'siegeProjectile' : 'projectile';
        this.statusMessage = `${shooter.name} fired ${weapon.name}.`;
        this.audio.playFire(weapon, { x: muzzle.x, width: this.width });
        this.ui.update(this._state());
        return true;
    }

    _updateProjectile(dt) {
        const windAccel = this.wind * CONFIG.physics.windAccelScale;
        let remaining = dt;

        while (remaining > 0 && (this.projectile || this.projectiles.length > 0)) {
            const step = Math.min(remaining, CONFIG.physics.projectileStep);
            if (this.projectile) this._updateOneProjectile(this.projectile, step, windAccel);
            for (const projectile of [...this.projectiles]) {
                this._updateOneProjectile(projectile, step, windAccel);
            }
            this.projectiles = this.projectiles.filter((projectile) => !projectile.done);
            if (!this.projectile && this.projectiles.length === 0 && this._isProjectilePhase()) {
                if (this.gameMode === 'siege') {
                    this._resolveCastleSiegeMiss(this.shotInfo?.impactX || 0, this.shotInfo?.impactY || 0);
                    remaining -= step;
                    continue;
                }
                const parentWeapon = this.shotInfo ? getWeaponById(this.shotInfo.weaponId) : null;
                if (parentWeapon && isSplitWeapon(parentWeapon)) {
                    this._completeSplitShot(parentWeapon);
                } else {
                    this._resolveMiss(this.shotInfo?.impactX || 0, this.shotInfo?.impactY || 0);
                }
            }
            remaining -= step;
        }
    }

    _updateOneProjectile(projectile, dt, windAccel) {
        if (!projectile || projectile.done || !this._isProjectilePhase()) return;

        if (projectile.rolling) {
            this._updateRollingProjectile(projectile, dt);
            return;
        }

        projectile.update(dt, CONFIG.physics.gravity, windAccel);
        this._trackProjectileDistance(projectile);

        if (isSplitWeapon(projectile.weapon) && !projectile.isBomblet && this._shouldSplitProjectile(projectile)) {
            this._splitProjectile(projectile);
            return;
        }

        this._checkProjectileCollision(projectile);
    }

    _trackProjectileDistance(projectile = this.projectile) {
        if (!projectile || !this.shotInfo) return;
        const target = this.tanks[this.shotInfo.targetIndex];
        if (!target) return;
        const circle = target.boundingCircle();
        const dx = projectile.x - circle.x;
        const dy = projectile.y - circle.y;
        this.shotInfo.minTargetDistance = Math.min(this.shotInfo.minTargetDistance, Math.sqrt(dx * dx + dy * dy));
    }

    _checkProjectileCollision(projectile = this.projectile) {
        if (this.gameOver || !projectile) return;

        const p = projectile;
        if (p.x < -80 || p.x > this.width + 80 || p.y > this.height + 90) {
            if (p.isBomblet) {
                p.done = true;
                this.shotInfo.impactX = p.x;
                this.shotInfo.impactY = p.y;
            } else if (this.gameMode === 'siege') {
                this._resolveCastleSiegeMiss(p.x, p.y);
            } else {
                this._resolveMiss(p.x, p.y);
            }
            return;
        }

        if (p.weapon.behavior === 'airburst') {
            const burst = this._airburstPoint(p);
            if (burst) {
                this._resolveProjectileImpact(p, burst.x, burst.y, 'airburst', { final: !p.isBomblet });
                return;
            }
        }

        if (this.gameMode === 'siege' && this.siege) {
            const hitBlock = this.siege.findBlockHit(p);
            if (hitBlock) {
                this._resolveCastleSiegeImpact(p, p.x, p.y, hitBlock, { final: !p.isBomblet });
                return;
            }
        }

        if (this.gameMode !== 'siege') {
            for (let i = 0; i < this.tanks.length; i++) {
                const tank = this.tanks[i];
                if (!tank.alive) continue;
                if (this.shotInfo && i === this.shotInfo.shooterIndex && p.age < 0.2) continue;

                const circle = tank.boundingCircle();
                const dx = p.x - circle.x;
                const dy = p.y - circle.y;
                const hitRadius = circle.r + p.radius;
                if (dx * dx + dy * dy <= hitRadius * hitRadius) {
                    this._resolveProjectileImpact(p, p.x, p.y, 'tank', { final: !p.isBomblet });
                    return;
                }
            }
        }

        if (p.x >= 0 && p.x < this.width) {
            const groundY = this.terrain.heightAt(p.x);
            if (p.y >= groundY) {
                if (p.weapon.behavior === 'roller' && !p.rolling) {
                    this._startRollingProjectile(p, groundY);
                    return;
                }
                if (this.gameMode === 'siege') {
                    this._resolveCastleSiegeTerrainImpact(p, p.x, groundY, { final: !p.isBomblet });
                    return;
                }
                this._resolveProjectileImpact(p, p.x, groundY, 'terrain', { final: !p.isBomblet });
            }
        }
    }

    _airburstPoint(projectile) {
        if (!this.terrain || !projectile || projectile.age < (projectile.weapon.airburstBehavior?.minAge ?? 0.35)) return null;
        if (projectile.x < 0 || projectile.x >= this.width) return null;

        const behavior = projectile.weapon.airburstBehavior || {};
        const triggerRadius = behavior.triggerRadius ?? projectile.weapon.damageRadius;
        const burstHeight = behavior.height ?? 36;
        const groundY = this.terrain.heightAt(projectile.x);
        const target = this.shotInfo ? this.tanks[this.shotInfo.targetIndex] : null;
        if (target && target.alive) {
            const circle = target.boundingCircle();
            const dx = projectile.x - circle.x;
            const dy = projectile.y - circle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance <= triggerRadius && projectile.y <= circle.y + circle.r * 0.4) {
                return { x: projectile.x, y: Math.min(projectile.y, groundY - burstHeight * 0.35) };
            }
        }

        if (projectile.vy >= -15 && projectile.y >= groundY - burstHeight && projectile.y < groundY + 4) {
            return { x: projectile.x, y: groundY - burstHeight };
        }

        return null;
    }

    _shouldSplitProjectile(projectile) {
        const split = projectile.weapon.splitBehavior || {};
        const minAge = split.minAge ?? projectile.weapon.clusterSplitMinAge ?? 0.4;
        const triggerVy = split.triggerVy ?? -20;
        return projectile.age >= minAge && projectile.vy >= triggerVy;
    }

    _splitProjectile(projectile) {
        const weapon = projectile.weapon;
        const split = weapon.splitBehavior || {};
        const count = split.count || weapon.bomblets || 5;
        const baseSpeed = Math.max(85, Math.abs(projectile.vx) * 0.35);
        const direction = Math.sign(projectile.vx) || 1;
        const pattern = split.pattern || weapon.splitPattern || 'wideScatter';
        this.projectile = null;
        const childWeapon = createBombletWeapon(weapon);
        for (let i = 0; i < count; i++) {
            const spread = i - (count - 1) / 2;
            const jitter = pattern === 'wideScatter'
                ? (Math.random() - 0.5) * baseSpeed * (split.randomSpread ?? 0.18)
                : 0;
            const childVx = pattern === 'controlledFork'
                ? projectile.vx * (spread === 0 ? (split.forwardVxScale ?? 0.78) : (split.forkVxScale ?? 0.66))
                    + spread * direction * baseSpeed * (split.forkSpreadScale ?? 0.18)
                : projectile.vx * (split.childVxScale ?? 0.38)
                    + spread * baseSpeed * (split.spreadScale ?? 0.34)
                    + jitter;
            const childVy = pattern === 'controlledFork'
                ? Math.max(36, projectile.vy * 0.18 + (split.childDownKick ?? 62) + Math.abs(spread) * 24)
                : Math.max(20, projectile.vy * (split.childVyScale ?? 0.35)) + Math.abs(spread) * 13 + Math.random() * 18;
            const bomblet = new Projectile(
                projectile.x + spread * 3,
                projectile.y,
                childVx,
                childVy,
                childWeapon
            );
            bomblet.isBomblet = true;
            bomblet.parentWeapon = weapon;
            this.projectiles.push(bomblet);
        }
        this.statusMessage = `${weapon.name} split into submunitions.`;
        this.audio.playClusterSplit({ x: projectile.x, width: this.width }, weapon);
    }

    _startRollingProjectile(projectile, groundY) {
        const behavior = projectile.weapon.rollerBehavior || {};
        projectile.rolling = true;
        projectile.rollAge = 0;
        projectile.rollDirection = Math.sign(projectile.vx) || this.tanks[this.shotInfo.shooterIndex].facing || 1;
        projectile.rollSpeed = clamp(
            Math.abs(projectile.vx) * 0.26,
            behavior.minSpeed ?? 58,
            behavior.maxSpeed ?? 128
        );
        projectile.x = clamp(projectile.x, 1, this.width - 2);
        projectile.y = groundY - projectile.radius;
        projectile.trail = [];
        this.statusMessage = `${projectile.weapon.name} is rolling along the slope.`;
        this.audio.playRollerRumble({ x: projectile.x, width: this.width });
    }

    _updateRollingProjectile(projectile, dt) {
        projectile.age += dt;
        projectile.rollAge += dt;
        projectile.spin = (projectile.spin || 0) + projectile.rollDirection * projectile.rollSpeed * dt * 0.12;
        projectile.trail.push({ x: projectile.x, y: projectile.y });
        if (projectile.trail.length > projectile.maxTrail) projectile.trail.shift();

        const previousX = projectile.x;
        const previousGround = this.terrain.heightAt(previousX);
        const nextX = previousX + projectile.rollDirection * projectile.rollSpeed * dt;
        if (nextX < 4 || nextX > this.width - 4) {
            if (this.gameMode === 'siege') {
                this._resolveCastleSiegeTerrainImpact(projectile, previousX, previousGround, { final: true });
                return;
            }
            this._resolveProjectileImpact(projectile, previousX, previousGround, 'terrain');
            return;
        }

        const behavior = projectile.weapon.rollerBehavior || {};
        const nextGround = this.terrain.heightAt(nextX);
        const slopeDelta = nextGround - previousGround;
        const obstruction = Math.abs(slopeDelta) > (behavior.obstructionDelta ?? 18);
        projectile.rollSpeed = clamp(
            projectile.rollSpeed + slopeDelta * projectile.rollDirection * (behavior.slopeAccel ?? 0.35) - (behavior.friction ?? 18) * dt,
            18,
            (behavior.maxSpeed ?? 128) + 14
        );
        projectile.x = nextX;
        projectile.y = nextGround - projectile.radius;
        this._trackProjectileDistance(projectile);

        if (this.gameMode === 'siege' && this.siege) {
            const hitBlock = this.siege.findBlockHit(projectile);
            if (hitBlock) {
                this._resolveCastleSiegeImpact(projectile, projectile.x, projectile.y, hitBlock, { final: true });
                return;
            }
        }

        if (this.gameMode !== 'siege') {
            for (let i = 0; i < this.tanks.length; i++) {
                const tank = this.tanks[i];
                if (!tank.alive) continue;
                if (this.shotInfo && i === this.shotInfo.shooterIndex && projectile.rollAge < 0.25) continue;
                const circle = tank.boundingCircle();
                const dx = projectile.x - circle.x;
                const dy = projectile.y - circle.y;
                const nearRadius = circle.r + projectile.radius + 10;
                if (dx * dx + dy * dy <= nearRadius * nearRadius) {
                    this._resolveProjectileImpact(projectile, projectile.x, this.terrain.heightAt(projectile.x), 'tank');
                    return;
                }
            }
        }

        if (obstruction || projectile.rollAge > (behavior.maxAge ?? 2.8) || projectile.rollSpeed <= 20) {
            if (this.gameMode === 'siege') {
                this._resolveCastleSiegeTerrainImpact(projectile, projectile.x, this.terrain.heightAt(projectile.x), { final: true });
                return;
            }
            this._resolveProjectileImpact(projectile, projectile.x, this.terrain.heightAt(projectile.x), 'terrain');
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

    _resolveCastleSiegeMiss(x, y) {
        if (!this.shotInfo || !this.siege) return;
        this.shotInfo.impactX = x;
        this.shotInfo.impactY = y;
        this.shotInfo.collision = 'miss';
        this.projectile = null;
        this.projectiles = [];
        this.siege.finishIfNeeded();
        this.phase = 'siegeResolving';
        this.phaseTimer = 0.55;
        this.lastResult = this.siege.failure
            ? 'Final shot missed. The castle core is still standing.'
            : 'Shot missed the castle.';
        this.statusMessage = 'Shot missed.';
    }

    _resolveCastleSiegeTerrainImpact(projectile, x, y, { final = true } = {}) {
        if (!projectile || !this.shotInfo || !this.siege) return;

        const weapon = projectile.weapon;
        this.shotInfo.impactX = x;
        this.shotInfo.impactY = y;
        this.shotInfo.collision = 'terrain';
        if (projectile === this.projectile) this.projectile = null;
        else projectile.done = true;

        const terrainMessage = this._applyTerrainEffect(x, y, weapon);
        const result = this.siege.applyImpact(x, y, weapon);
        this.shotInfo.totalDamage = result.totalDamage;
        if (result.totalDamage > 0) {
            this._addFloatingText(x, y - 18, `Castle -${Math.round(result.totalDamage)}`, '#ffe49b', { size: 17 });
            this.audio.playHit({ x, width: this.width });
        }
        if (result.blocksDestroyed > 0) {
            this._addFloatingText(x, y - 42, `${result.blocksDestroyed} block${result.blocksDestroyed === 1 ? '' : 's'} down`, '#9edbe6', { size: 16 });
        }
        const explosion = new Explosion(x, y, weapon.explosionRadius, weapon);
        this.explosions.push(explosion);
        this._addScreenShake(weapon);
        this.audio.playExplosion(weapon, { x, width: this.width });

        if (!final) return;
        this.phase = 'siegeResolving';
        this.phaseTimer = Math.max(0.7, this._remainingExplosionTime() + 0.12);
        this.lastResult = this.siege.failure
            ? `Final shot hit the ground. ${terrainMessage} The castle core is still standing.`
            : castleSiegeTerrainImpactText(terrainMessage, result);
        this.statusMessage = result.objectiveComplete ? 'Castle core destroyed.' : 'Impact resolving.';
    }

    _resolveImpact(x, y, collision) {
        if (!this.projectile || !this.shotInfo) return;
        this._resolveProjectileImpact(this.projectile, x, y, collision);
    }

    _resolveCastleSiegeImpact(projectile, x, y, hitBlock, { final = true } = {}) {
        if (!projectile || !this.shotInfo || !this.siege) return;

        const weapon = projectile.weapon;
        this.shotInfo.impactX = x;
        this.shotInfo.impactY = y;
        this.shotInfo.collision = 'castle';
        if (projectile === this.projectile) this.projectile = null;
        else projectile.done = true;

        const result = this.siege.applyImpact(x, y, weapon);
        this.shotInfo.totalDamage = result.totalDamage;
        if (result.totalDamage > 0) {
            this._addFloatingText(x, y - 18, `Castle -${Math.round(result.totalDamage)}`, '#ffe49b', { size: 17 });
        }
        if (result.blocksDestroyed > 0) {
            this._addFloatingText(x, y - 42, `${result.blocksDestroyed} block${result.blocksDestroyed === 1 ? '' : 's'} down`, '#9edbe6', { size: 16 });
        }

        const explosion = new Explosion(x, y, weapon.explosionRadius, weapon);
        this.explosions.push(explosion);
        this._addScreenShake(weapon);
        this.audio.playExplosion(weapon, { x, width: this.width });
        if (result.totalDamage > 0) this.audio.playHit({ x, width: this.width });

        if (!final) return;

        this.phase = 'siegeResolving';
        this.phaseTimer = Math.max(CONFIG.turn.impactDelaySeconds, this._remainingExplosionTime() + 0.15);
        this.lastResult = castleSiegeImpactText(hitBlock, result);
        this.statusMessage = result.objectiveComplete ? 'Castle core destroyed.' : 'Castle impact resolving.';
    }

    _resolveProjectileImpact(projectile, x, y, collision, { final = true } = {}) {
        if (!projectile || !this.shotInfo) return;

        const weapon = projectile.weapon;
        this.shotInfo.impactX = x;
        this.shotInfo.impactY = y;
        this.shotInfo.collision = collision;
        if (projectile === this.projectile) this.projectile = null;
        else projectile.done = true;

        const result = this._applyExplosionDamage(x, y, weapon, collision, { accumulate: projectile.isBomblet });
        if (weapon.behavior === 'napalm') this._queueNapalmBurns(result.affectedTankIndices, weapon);
        const terrainMessage = this._applyTerrainEffect(x, y, weapon);
        this._settleDestroyedTanks();
        const fallMessages = this._settleTanksWithFallDamage();
        if (projectile.isBomblet) {
            this.shotInfo.clusterImpactCount += 1;
        } else {
            this.lastResult = `${result.message} ${terrainMessage}${fallMessages.length ? ` ${fallMessages.join(' ')}` : ''}`;
        }
        this.statusMessage = 'Impact resolving.';

        const effectY = weapon.behavior === 'napalm' && this.terrain ? this.terrain.heightAt(x) : y;
        const explosion = new Explosion(
            x,
            effectY,
            weapon.explosionRadius,
            weapon,
            weapon.behavior === 'napalm' ? { surfacePoints: this._sampleNapalmSurface(x, weapon) } : undefined
        );
        this.explosions.push(explosion);
        this._addScreenShake(weapon);
        this.audio.playExplosion(weapon, { x, width: this.width });
        if (result.totalDamage > 0) this.audio.playHit({ x, width: this.width });
        if (result.shieldAbsorbed > 0) this.audio.playShieldAbsorb({ x, width: this.width });

        if (!final) return;

        this.phase = 'resolving';
        this.phaseTimer = Math.max(CONFIG.turn.impactDelaySeconds, this._remainingExplosionTime() + 0.15);
    }

    _completeSplitShot(parentWeapon = null) {
        if (!this.shotInfo) return;
        const weapon = parentWeapon || getWeaponById(this.shotInfo.weaponId);
        const target = this.tanks[this.shotInfo.targetIndex];
        const shooter = this.tanks[this.shotInfo.shooterIndex];
        const details = [];
        if (this.shotInfo.enemyDamage > 0) details.push(`${target.name} took ${this.shotInfo.enemyDamage} damage.`);
        if (this.shotInfo.selfDamage > 0) details.push(`${shooter.name} took ${this.shotInfo.selfDamage} self-damage.`);
        if (this.shotInfo.shieldAbsorbed > 0) details.push(`Shields absorbed ${this.shotInfo.shieldAbsorbed}.`);
        if (!details.length) details.push('No damage.');
        const impacts = this.shotInfo.clusterImpactCount || 0;
        const prefix = this.shotInfo.enemyDamage > 0 ? `${weapon.name} hit!` : `${weapon.name} spread.`;
        this.lastResult = `${prefix} ${impacts} submunitions impacted. ${details.join(' ')} ${weapon.terrainMessage}`;
        this.statusMessage = `${weapon.name} impacts resolving.`;
        this.phase = 'resolving';
        this.phaseTimer = Math.max(CONFIG.turn.impactDelaySeconds, this._remainingExplosionTime() + 0.18);
    }

    _applyTerrainEffect(x, y, weapon) {
        if (weapon.behavior === 'addTerrain') {
            this.terrain.addMound(x, y, weapon.terrainEffectRadius, weapon.terrainEffectStrength);
            return weapon.terrainMessage;
        }
        if (weapon.behavior === 'napalm') {
            this.terrain.scorch(x, y, (weapon.flameWidth || weapon.damageRadius * 2) / 2, weapon.id === 'firestorm' ? 'firestorm' : 'napalm');
            return weapon.terrainMessage;
        }
        if (weapon.behavior === 'airburst') {
            const groundY = this.terrain.heightAt(x);
            const offset = weapon.airburstBehavior?.terrainOffset ?? 8;
            this.terrain.explode(x, groundY - offset, weapon.terrainEffectRadius, weapon.terrainEffectStrength);
            return weapon.terrainMessage;
        }

        this.terrain.explode(x, y, weapon.terrainEffectRadius, weapon.terrainEffectStrength);
        return weapon.terrainMessage;
    }

    _sampleNapalmSurface(centerX, weapon) {
        if (!this.terrain) return [];
        const width = weapon.flameWidth || 140;
        const step = 8;
        const start = Math.max(0, Math.floor(centerX - width / 2));
        const end = Math.min(this.width - 1, Math.ceil(centerX + width / 2));
        const points = [];
        for (let x = start; x <= end; x += step) {
            points.push({
                x,
                y: this.terrain.heightAt(x),
                seed: Math.random(),
            });
        }
        const last = points[points.length - 1];
        if (!last || last.x < end) {
            points.push({ x: end, y: this.terrain.heightAt(end), seed: Math.random() });
        }
        return points;
    }

    _queueNapalmBurns(tankIndices, weapon) {
        if (!this.shotInfo || !Array.isArray(tankIndices) || tankIndices.length === 0) return;
        const ticks = Math.max(0, Math.round(weapon.burnTicks || 0));
        const damage = Math.max(0, Math.round(weapon.burnDamage || 0));
        if (ticks <= 0 || damage <= 0) return;

        const interval = Math.max(0.15, weapon.burnTickInterval || 0.45);
        for (const tankIndex of tankIndices) {
            const tank = this.tanks[tankIndex];
            if (!tank || !tank.alive) continue;
            const exists = this.pendingBurns.some((burn) => burn.tankIndex === tankIndex && burn.shooterIndex === this.shotInfo.shooterIndex);
            if (exists) continue;
            this.pendingBurns.push({
                tankIndex,
                shooterIndex: this.shotInfo.shooterIndex,
                ticksRemaining: ticks,
                damage,
                interval,
                timer: interval,
            });
        }
        if (this.pendingBurns.length) {
            this.phaseTimer = Math.max(this.phaseTimer, interval * ticks + 0.18);
            this.statusMessage = `${weapon.name} burn is ticking.`;
        }
    }

    _remainingExplosionTime() {
        return this.explosions.reduce((max, explosion) => {
            return Math.max(max, Math.max(0, explosion.duration - explosion.t));
        }, 0);
    }

    _triggerTankDeathEffects(tankIndices) {
        let triggered = 0;
        let longest = 0;
        for (const index of tankIndices) {
            const tank = this.tanks[index];
            if (!tank || tank.alive || tank.deathEffectPlayed) continue;
            tank.deathEffectPlayed = true;
            tank.wreckSmokeTime = 0;
            const delay = triggered * 0.16;
            const explosion = new Explosion(
                tank.x,
                tank.y - tank.height * 0.72,
                92,
                createTankDeathVisual(tank)
            );
            this.explosions.push(explosion);
            this._addScreenShake({ id: 'mega' });
            this.audio.playTankDestroyed(delay, { x: tank.x, width: this.width });
            longest = Math.max(longest, explosion.duration + delay);
            triggered += 1;
        }
        return longest;
    }

    _applyExplosionDamage(x, y, weapon, collision, { accumulate = false } = {}) {
        let totalDamage = 0;
        let enemyDamage = 0;
        let selfDamage = 0;
        let shieldAbsorbed = 0;
        const newlyDestroyed = [];
        const affectedTankIndices = [];
        const shooter = this.tanks[this.shotInfo.shooterIndex];
        const target = this.tanks[this.shotInfo.targetIndex];

        for (let i = 0; i < this.tanks.length; i++) {
            const tank = this.tanks[i];
            if (!tank.alive) continue;

            const circle = tank.boundingCircle();
            let falloff = 0;
            if (weapon.behavior === 'napalm') {
                const halfWidth = (weapon.flameWidth || weapon.damageRadius * 2) / 2;
                const horizontal = Math.abs(circle.x - x);
                const groundY = this.terrain ? this.terrain.heightAt(circle.x) : y;
                const verticalClearance = Math.max(0, Math.abs(circle.y - groundY) - circle.r);
                if (horizontal > halfWidth + circle.r * 0.45 || verticalClearance > tank.height + 14) continue;
                const normalized = clamp(1 - horizontal / Math.max(1, halfWidth), 0, 1);
                falloff = Math.pow(normalized, weapon.damageFalloff);
            } else {
                const dx = circle.x - x;
                const dy = circle.y - y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist > weapon.damageRadius + circle.r * 0.35) continue;

                const normalized = clamp(1 - dist / weapon.damageRadius, 0, 1);
                falloff = Math.pow(normalized, weapon.damageFalloff);
            }
            const directBonus = collision === 'tank' && i === this.shotInfo.targetIndex ? 1.08 : 1;
            if (collision === 'tank' && i === this.shotInfo.targetIndex) {
                falloff = Math.max(falloff, weapon.behavior === 'napalm' ? 0.78 : 0.82);
            }
            const rawDamage = Math.min(weapon.maxDamage, weapon.maxDamage * falloff * directBonus);
            const wasAlive = tank.alive;
            const damage = tank.applyDamage(rawDamage, { useShield: true });
            const absorbed = tank.lastShieldAbsorbed || 0;
            if (damage > 0 || absorbed > 0) affectedTankIndices.push(i);
            shieldAbsorbed += absorbed;
            totalDamage += damage;
            this.roundStats[i].damageTaken += damage;
            if (i === this.shotInfo.targetIndex) enemyDamage += damage;
            if (i === this.shotInfo.shooterIndex) selfDamage += damage;
            if (absorbed > 0) this._addFloatingText(tank.x, tank.y - tank.height - 42, `Shield -${absorbed}`, '#9edbe6', { size: 15 });
            if (damage > 0) this._addFloatingText(tank.x, tank.y - tank.height - 24, `-${damage}`, '#ff594f', { size: 20 });
            if (wasAlive && !tank.alive) newlyDestroyed.push(i);
            this._syncPlayerDataFromTank(i);
        }
        const deathEffectDuration = this._triggerTankDeathEffects(newlyDestroyed);

        if (accumulate) {
            this.shotInfo.totalDamage += totalDamage;
            this.shotInfo.enemyDamage += enemyDamage;
            this.shotInfo.selfDamage += selfDamage;
            this.shotInfo.shieldAbsorbed += shieldAbsorbed;
        } else {
            this.shotInfo.totalDamage = totalDamage;
            this.shotInfo.enemyDamage = enemyDamage;
            this.shotInfo.selfDamage = selfDamage;
            this.shotInfo.shieldAbsorbed = shieldAbsorbed;
        }
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
            shieldAbsorbed,
            deathEffectDuration,
            affectedTankIndices,
            message: `${prefix} ${details.join(' ')}`,
        };
    }

    _settleTanksWithFallDamage() {
        const messages = [];
        const newlyDestroyed = [];
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
                const reducedDamage = Math.max(0, Math.round(fallDamage * (1 - CONFIG.utilities.parachuteReduction)));
                const prevented = fallDamage - reducedDamage;
                if (prevented >= CONFIG.utilities.parachuteMinPreventedDamage) {
                    tank.parachutes -= 1;
                    fallDamage = reducedDamage;
                    this.roundStats[i].parachutesUsed += 1;
                    this.roundStats[i].fallDamagePrevented += prevented;
                    tank.parachuteTimer = 1.35;
                    tank.parachuteSeed = Math.random() * 1000;
                    messages.push(`${tank.name}'s parachute prevented ${prevented} fall damage.`);
                    this._addFloatingText(tank.x, tank.y - tank.height - 52, 'Parachute!', '#f5eee0', { size: 18, duration: 1.35 });
                    this.audio.playParachute({ x: tank.x, width: this.width });
                }
            }

            if (fallDamage > 0) {
                const wasAlive = tank.alive;
                const actual = tank.applyDamage(fallDamage);
                this.roundStats[i].damageTaken += actual;
                this.roundStats[i].fallDamageTaken += actual;
                messages.push(`${tank.name} took ${actual} fall damage.`);
                if (actual > 0) this._addFloatingText(tank.x, tank.y - tank.height - 28, `Fall -${actual}`, '#ffbf69', { size: 16 });
                if (wasAlive && !tank.alive) newlyDestroyed.push(i);
            }
            this._syncPlayerDataFromTank(i);
        }
        this._triggerTankDeathEffects(newlyDestroyed);
        return messages;
    }

    _settleDestroyedTanks() {
        if (!this.terrain) return;
        for (const tank of this.tanks) {
            if (!tank.alive) tank.settleOn(this.terrain);
        }
    }

    _finishShotResolution() {
        this._settleTanksWithFallDamage();

        if (this.gameMode === 'siege') {
            this._finishCastleSiegeResolution();
            return;
        }

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

    _finishCastleSiegeResolution() {
        if (!this.siege) return;
        this.siege.finishIfNeeded();

        if (this.siege.victory) {
            this._showCastleSiegeVictory();
            return;
        }

        if (this.siege.failure) {
            this._showCastleSiegeFailure();
            return;
        }

        this.currentPlayer = 0;
        this.shotInfo = null;
        this.projectile = null;
        this.projectiles = [];
        this._rollWind();
        this.phase = 'siegeAiming';
        this.statusMessage = `${this.siege.level.name}: line up the next shot.`;
        this.lastResult = `${this.siege.shotsRemaining} shot${this.siege.shotsRemaining === 1 ? '' : 's'} remaining.`;
        this.keys.clear();
        this.ui.update(this._state());
    }

    _showCastleSiegeVictory() {
        if (!this.siege) return;
        this.gameOver = true;
        this.phase = 'siegeVictory';
        this.projectile = null;
        this.projectiles = [];
        this.keys.clear();
        this.audio.stopTankMoveLoop();
        this.statusMessage = 'Castle Siege complete.';
        this.lastResult = `${this.siege.level.name} cleared with ${this.siege.calculateStars()} star${this.siege.calculateStars() === 1 ? '' : 's'}.`;
        if (typeof this.ui.showCastleSiegeResult === 'function') {
            this.ui.showCastleSiegeResult(this._castleSiegeResultWithNext(this.siege.result || this.siege.summary().result));
        }
        this.audio.playMatchWin();
    }

    _castleSiegeResultWithNext(result) {
        const progress = loadCastleSiegeProgress();
        if (!result || !result.victory) {
            return result ? { ...result, totalCoins: progress.coins, nextLevelId: null, nextLevelName: null } : result;
        }

        const next = getNextLevelInCampaign(result.levelId || this.siege?.level?.id);
        if (!next || !isLevelUnlocked(next.levelId, progress)) {
            return { ...result, totalCoins: progress.coins, nextLevelId: null, nextLevelName: null };
        }

        const nextLevel = getCastleSiegeLevel(next.levelId);
        return {
            ...result,
            totalCoins: progress.coins,
            nextLevelId: next.levelId,
            nextLevelName: nextLevel ? nextLevel.name : next.levelId,
            nextWorldId: next.worldId,
            nextCrossesWorld: next.crossesWorld,
        };
    }

    _showCastleSiegeFailure() {
        if (!this.siege) return;
        this.gameOver = true;
        this.phase = 'siegeFailure';
        this.projectile = null;
        this.projectiles = [];
        this.keys.clear();
        this.audio.stopTankMoveLoop();
        this.statusMessage = 'Castle Siege failed.';
        this.lastResult = 'Out of shots. The castle core survived.';
        if (typeof this.ui.showCastleSiegeResult === 'function') {
            this.ui.showCastleSiegeResult(this._castleSiegeResultWithNext(this.siege.result || this.siege.summary().result));
        }
        this.audio.playMatchLoss();
    }

    _checkWinCondition() {
        if (this.gameOver || this.phase === 'roundSummary' || this.phase === 'shop') return true;

        const alive = this.tanks
            .map((tank, index) => ({ tank, index }))
            .filter((entry) => entry.tank.alive);

        if (alive.length === this.tanks.length) return false;

        const winnerIndex = alive.length === 1 ? alive[0].index : null;
        if (winnerIndex !== null) this.score[winnerIndex] += 1;
        const winsNeeded = getWinsNeededToClinch(this.settings.roundsToWin);
        this.matchWinnerIndex = winnerIndex !== null && this.score[winnerIndex] >= winsNeeded
            ? winnerIndex
            : null;
        this._finalizeRoundEconomy(winnerIndex, alive.map((entry) => entry.index));

        this.gameOver = true;
        this.phase = 'roundSummary';
        this.projectile = null;
        this.projectiles = [];
        this.keys.clear();
        this.audio.stopTankMoveLoop();
        this.statusMessage = this.matchWinnerIndex === null ? 'Round summary.' : 'Match complete.';
        this.lastResult = winnerIndex === null
            ? `Round ${this.roundNumber} ended in a draw.`
            : `${this.tanks[winnerIndex].name} wins round ${this.roundNumber}.`;
        this.ui.showSummary(this._state());
        this._playResultAudio(winnerIndex);
        return true;
    }

    _playResultAudio(winnerIndex) {
        // Guard against duplicate result audio for the same round-end, in case
        // _checkWinCondition is reached more than once in a single resolution.
        if (this.turnState.lastResultAudioRound === this.roundNumber) return;
        this.turnState.lastResultAudioRound = this.roundNumber;

        if (winnerIndex === null) {
            this.audio.playNeutralRoundEnd();
            return;
        }

        const isMatch = this.matchWinnerIndex !== null;
        if (this.gameMode === 'cpu') {
            const humanWon = winnerIndex === 0;
            if (isMatch) {
                if (humanWon) this.audio.playMatchWin();
                else this.audio.playMatchLoss();
            } else if (humanWon) {
                this.audio.playRoundWin();
            } else {
                this.audio.playRoundLoss();
            }
            return;
        }

        // Two Player Local: the app does not have a "human player" perspective,
        // so use the neutral round-end stinger for round results and the
        // celebratory match-win stinger when the match concludes.
        if (isMatch) this.audio.playMatchWin();
        else this.audio.playNeutralRoundEnd();
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
            player.shieldCharge = clampShieldCharge(tank.shieldCharge);
            player.repairKits = Math.max(0, tank.repairKits);
            player.parachutes = Math.max(0, tank.parachutes);
            player.ammo = ammoSnapshotFromTank(tank);
            this._syncTankInventoryFromPlayerData(i);
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
        this.lastCpuShopPurchases = [];
        const cpuIndex = 1;
        const cpu = this.playerData[cpuIndex];
        const profile = CPU_DIFFICULTY[this.settings.cpuDifficulty] || CPU_DIFFICULTY.normal;
        if (!cpu) return;
        const purchases = [];

        const tryBuy = (itemId, chance) => {
            const item = this._getShopItem(itemId);
            const reserve = profile.reserveMoney ?? 0;
            const urgentRepair = itemId === 'repair' && cpu.health < 55;
            if (!item || cpu.money < item.price || Math.random() > chance) return false;
            // v0.6: never spend on a weapon refill or shield/repair that is already full.
            if (!this._canPurchase(cpu, itemId)) return false;
            if (!urgentRepair && cpu.money - item.price < reserve) return false;
            cpu.money -= item.price;
            this._grantShopItem(cpu, itemId);
            purchases.push(item.refillLabel || item.label);
            return true;
        };

        if (cpu.health < 85) tryBuy('repair', cpu.health < 55 ? Math.min(1, profile.repairBuyChance + 0.25) : profile.repairBuyChance);
        cpu.shieldCharge = clampShieldCharge(cpu.shieldCharge);
        if (cpu.shieldCharge < CONFIG.utilities.shieldMaxCharge) tryBuy('shield', profile.shieldBuyChance);
        const shopWeapons = limitedWeapons().sort((a, b) => (a.shopPriority ?? 50) - (b.shopPriority ?? 50));
        for (const weapon of shopWeapons) {
            if ((cpu.ammo[weapon.id] || 0) >= maxAmmoFor(weapon.id)) continue;
            if (weapon.role === 'premium' && (cpu.health < 70 || cpu.shieldCharge < CONFIG.utilities.shieldPurchaseCharge || cpu.money < (weapon.price ?? 0) + 80)) continue;
            if (weapon.role === 'terrainBuild' && cpu.health < 60) continue;
            tryBuy(`${weapon.id}Ammo`, cpuAmmoBuyChance(weapon.id, profile, cpu.money));
        }
        if (cpu.parachutes < 1) tryBuy('parachute', profile.shieldBuyChance * 0.45);
        this.lastCpuShopPurchases = purchases;
        this._syncTankInventoryFromPlayerData(cpuIndex);
    }

    _grantShopItem(player, itemId) {
        const item = this._getShopItem(itemId);
        if (item && item.weaponId) player.ammo[item.weaponId] = maxAmmoFor(item.weaponId);
        if (itemId === 'shield') {
            player.shieldCharge = Math.min(
                CONFIG.utilities.shieldMaxCharge,
                clampShieldCharge(player.shieldCharge) + CONFIG.utilities.shieldPurchaseCharge
            );
        }
        if (itemId === 'repair') player.repairKits += 1;
        if (itemId === 'parachute') player.parachutes += 1;
    }

    _draw() {
        if (!this.terrain) return;
        const ctx = this.ctx;
        const w = this.width;
        const h = this.height;

        this.backgroundRenderer.draw(ctx, w, h, this.theme, this.visualTime);

        ctx.save();
        const shake = this._screenShakeOffset();
        ctx.translate(shake.x, shake.y);
        this.terrain.draw(ctx);
        if (this.gameMode === 'siege' && this.siege) {
            drawCastleSiegeBlocks(ctx, this.siege.blocks, this.visualTime);
        }

        for (const tank of this.tanks) {
            if (tank.alive) tank.draw(ctx, this.terrain, this.visualTime);
            else this._drawWreck(ctx, tank);
        }

        if (this._canHumanControl()) {
            this._drawTrajectoryPreview(ctx, this._activeTank());
        }

        if (this.projectile) this.projectile.draw(ctx);
        for (const projectile of this.projectiles) projectile.draw(ctx);
        for (const explosion of this.explosions) explosion.draw(ctx);
        if (this.gameMode === 'siege' && this.siege) {
            drawCastleSiegeObjectiveMarker(ctx, this.siege);
        }
        this._drawFeedback(ctx);
        ctx.restore();

        this._drawWindIndicator(ctx);
        if (this.gameMode === 'siege' && this.siege) {
            drawCastleSiegeHudOverlay(ctx, this.siege);
        }
    }

    _drawFeedback(ctx) {
        if (!this.feedbackTexts.length) return;
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        for (const feedback of this.feedbackTexts) {
            const t = clamp(feedback.age / feedback.duration, 0, 1);
            const y = feedback.y - t * 28;
            const alpha = t < 0.72 ? 1 : Math.max(0, (1 - t) / 0.28);
            ctx.font = `900 ${feedback.size}px Georgia, serif`;
            ctx.lineWidth = 4;
            ctx.strokeStyle = `rgba(20, 24, 24, ${alpha * 0.72})`;
            ctx.strokeText(feedback.text, feedback.x, y);
            ctx.fillStyle = colorWithAlphaString(feedback.color, alpha);
            ctx.fillText(feedback.text, feedback.x, y);
        }
        ctx.restore();
    }

    _drawWreck(ctx, tank) {
        drawTankWreck(ctx, tank, { terrain: this.terrain, time: this.visualTime });
    }

    _addScreenShake(weapon) {
        const intensity = weapon.visualProfile?.screenShake ?? (weapon.id === 'mega' ? 6
            : (weapon.id === 'heavy' ? 4.2
                : (weapon.id === 'dirt' ? 2.6
                    : (weapon.id === 'clusterBomblet' ? 1.4 : 2.2))));
        this.screenShakeIntensity = Math.max(this.screenShakeIntensity, intensity);
        this.screenShakeTime = Math.max(this.screenShakeTime, weapon.id === 'mega' ? 0.28 : 0.18);
    }

    _screenShakeOffset() {
        if (this.screenShakeTime <= 0 || this.screenShakeIntensity <= 0) {
            return { x: 0, y: 0 };
        }
        const fade = clamp(this.screenShakeTime / 0.28, 0, 1);
        const amp = this.screenShakeIntensity * fade * fade;
        return {
            x: Math.sin(this.visualTime * 74.1) * amp,
            y: Math.cos(this.visualTime * 91.7) * amp * 0.65,
        };
    }

    _drawTrajectoryPreview(ctx, tank) {
        // Tank-Stars-style preview: simulate the same physics as the real shot,
        // but only render the first ~62% of the predicted path so the player
        // sees a helpful arc without the exact landing spot. Projectile flight
        // and collision use the real physics elsewhere; this is visual only.
        const weapon = tank.selectedWeapon();
        const muzzle = tank.muzzlePosition();
        const velocity = tank.fireVelocity(weapon);
        let x = muzzle.x;
        let y = muzzle.y;
        let vx = velocity.vx;
        let vy = velocity.vy;
        const dt = 1 / 30;
        const maxSteps = 96;
        const samples = [];
        let predictedSteps = maxSteps;

        for (let i = 0; i < maxSteps; i++) {
            vy += CONFIG.physics.gravity * dt;
            vx += this.wind * CONFIG.physics.windAccelScale * dt;
            x += vx * dt;
            y += vy * dt;
            samples.push({ x, y });

            if (x < 0 || x >= this.width || y >= this.height) {
                predictedSteps = i + 1;
                break;
            }
            if (y >= this.terrain.heightAt(x)) {
                predictedSteps = i + 1;
                break;
            }
            if (this.gameMode === 'siege' && this._previewPointInBlock(x, y)) {
                predictedSteps = i + 1;
                break;
            }
        }

        if (samples.length === 0) return;

        // Cap preview to roughly 62% of the predicted path, clamped so very
        // short shots still show something and long shots don't trail too far.
        const visibleSteps = clamp(Math.floor(predictedSteps * 0.62), 6, samples.length - 1);
        const dotStride = 3;
        const dots = [];
        for (let i = dotStride; i <= visibleSteps; i += dotStride) {
            const point = samples[i - 1];
            if (!point) break;
            const progress = i / visibleSteps;
            // Linear fade across the last 40% of the visible arc so the tail
            // stays readable without becoming a high-contrast impact marker.
            const fade = progress > 0.6 ? Math.max(0, 1 - (progress - 0.6) / 0.4) : 1;
            dots.push({ x: point.x, y: point.y, fade });
        }

        if (dots.length === 0) return;

        ctx.save();
        for (const dot of dots) {
            ctx.fillStyle = `rgba(0, 0, 0, ${0.36 * dot.fade})`;
            ctx.beginPath();
            ctx.arc(dot.x, dot.y, 5.3, 0, Math.PI * 2);
            ctx.fill();
        }
        for (const dot of dots) {
            ctx.fillStyle = `rgba(70, 225, 255, ${0.5 * dot.fade})`;
            ctx.beginPath();
            ctx.arc(dot.x, dot.y, 3.7, 0, Math.PI * 2);
            ctx.fill();
        }
        for (const dot of dots) {
            ctx.fillStyle = `rgba(255, 250, 120, ${0.92 * dot.fade})`;
            ctx.beginPath();
            ctx.arc(dot.x, dot.y, 2.35, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }

    _previewPointInBlock(x, y) {
        if (!this.siege || !Array.isArray(this.siege.blocks)) return false;
        for (const block of this.siege.blocks) {
            if (!block || block.destroyed) continue;
            if (x < block.x || x > block.x + block.width) continue;
            if (y < block.y || y > block.y + block.height) continue;
            return true;
        }
        return false;
    }

    _drawWindIndicator(ctx) {
        const cx = this.width / 2;
        const cy = 224;
        const direction = Math.sign(this.wind);
        const length = 24 + Math.abs(this.wind) * 13;

        ctx.save();
        ctx.font = 'bold 13px Georgia, serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(28, 38, 48, 0.72)';
        const directionText = direction === 0 ? 'calm' : (direction > 0 ? 'right' : 'left');
        ctx.fillText(`Wind ${this.wind === 0 ? '0 calm' : `${Math.abs(this.wind).toFixed(1)} ${directionText}`}`, cx, cy - 16);

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
        startingMoney: Object.prototype.hasOwnProperty.call(CONFIG.economy.startingMoney, next.startingMoney)
            ? next.startingMoney
            : defaults.startingMoney,
        terrainRoughness: CONFIG.terrain.roughness[next.terrainRoughness] ? next.terrainRoughness : defaults.terrainRoughness,
    };
}

function createStartingAmmo() {
    const ammo = {};
    for (const weapon of WEAPONS) {
        const maxAmmo = maxAmmoFor(weapon.id);
        ammo[weapon.id] = Number.isFinite(maxAmmo)
            ? Math.min(maxAmmo, Math.max(0, weapon.startingAmmo || 0))
            : Infinity;
    }
    return ammo;
}

function createSiegeAmmo(loadout = [], armorySupplies = []) {
    const ammo = {};
    for (const weapon of WEAPONS) {
        ammo[weapon.id] = weapon.unlimitedAmmo ? Infinity : 0;
    }

    for (const item of Array.isArray(loadout) ? loadout : []) {
        const weapon = getWeaponById(item.weaponId);
        const max = maxAmmoFor(weapon.id);
        ammo[weapon.id] = Number.isFinite(item.ammo)
            ? Math.max(0, Math.min(max, Math.round(item.ammo)))
            : Infinity;
    }

    for (const supply of Array.isArray(armorySupplies) ? armorySupplies : []) {
        if (!supply || !supply.weaponId || !Number.isFinite(supply.amount)) continue;
        const weapon = getWeaponById(supply.weaponId);
        if (!weapon || weapon.unlimitedAmmo) continue;
        const max = maxAmmoFor(weapon.id);
        const current = Number.isFinite(ammo[weapon.id]) ? ammo[weapon.id] : 0;
        ammo[weapon.id] = Math.min(max, current + Math.max(0, Math.round(supply.amount)));
    }

    ammo.standard = Infinity;
    return ammo;
}

function formatSiegeArmorySupplies(supplies = []) {
    if (!Array.isArray(supplies) || supplies.length === 0) return '';
    return supplies
        .filter((supply) => supply && supply.weaponId && supply.amount > 0)
        .map((supply) => {
            const weapon = getWeaponById(supply.weaponId);
            return `${weapon.compactName || weapon.name} +${supply.amount}`;
        })
        .join(', ');
}

function summarizeInventory(player) {
    return {
        money: player.money,
        ammo: { ...player.ammo },
        shieldCharge: Math.round(clampShieldCharge(player.shieldCharge)),
        repairKits: player.repairKits,
        parachutes: player.parachutes,
        health: player.health,
    };
}

function ammoSnapshotFromTank(tank) {
    const ammo = {};
    for (const weapon of WEAPONS) {
        ammo[weapon.id] = tank.ammoFor(weapon.id);
    }
    ammo.standard = Infinity;
    return ammo;
}

function createBombletWeapon(parent) {
    const split = parent.splitBehavior || {};
    const childId = split.childId || 'clusterBomblet';
    return {
        ...parent,
        id: childId,
        name: split.childName || 'Cluster Bomblet',
        compactName: split.childCompactName || 'Bomblet',
        behavior: 'crater',
        maxDamage: split.childDamage || parent.bombletMaxDamage || 18,
        damage: split.childDamage || parent.bombletMaxDamage || 18,
        damageRadius: split.childDamageRadius || parent.bombletDamageRadius || 24,
        damageFalloff: 1.1,
        explosionRadius: split.childExplosionRadius || 26,
        terrainEffectRadius: split.childTerrainRadius || parent.bombletTerrainRadius || 20,
        terrainRadius: split.childTerrainRadius || parent.bombletTerrainRadius || 20,
        terrainEffectStrength: split.childTerrainStrength || 0.46,
        projectileRadius: split.childProjectileRadius || 3.5,
        color: split.childColor || '#ffe28a',
        trailColor: split.childTrailColor || '255, 224, 138',
        impactVisual: split.childImpactVisual || 'clusterMiniBlast',
        visualProfile: {
            ...(parent.visualProfile || {}),
            projectile: childId,
            impact: split.childImpactVisual || 'clusterMiniBlast',
            trailLength: 10,
            screenShake: childId === 'splitterShard' ? 1.2 : 1.4,
        },
        iconProfile: { ...(parent.iconProfile || {}), shape: childId },
        soundProfile: { fire: parent.soundProfile?.fire || parent.fireSoundType, impact: parent.soundProfile?.impact || parent.impactSoundType },
        terrainMessage: split.childTerrainMessage || 'Cluster bomblet made a small crater.',
    };
}

function createTankDeathVisual(tank) {
    return {
        id: 'tankDeath',
        name: `${tank.name} destroyed`,
        impactVisual: 'tankDeath',
        color: tank.color,
    };
}

function cpuAmmoBuyChance(weaponId, profile, money) {
    const weapon = getWeaponById(weaponId);
    const base = profile.ammoBuyChance || 0.4;
    const price = weapon.price ?? weapon.shopRefillPrice ?? 0;
    if (weapon.role === 'terrainBuild') return base * 0.26;
    if (weapon.role === 'terrainDestroy') return base * 0.42;
    if (weapon.role === 'rolling') return base * 0.58;
    if (weapon.role === 'rollingHeavy') return base * 0.34;
    if (weapon.role === 'fire') return base * 0.54;
    if (weapon.role === 'fireHeavy') return money >= price + 90 ? base * 0.24 : 0;
    if (weapon.role === 'controlledFork') return base * 0.42;
    if (weapon.role === 'cluster') return base * 0.40;
    if (weapon.role === 'airburst') return base * 0.36;
    if (weapon.role === 'precision') return base * 0.52;
    if (weapon.role === 'premium') return money >= price + 80 ? base * 0.12 : 0;
    return base * Math.max(0.2, weapon.cpuUseWeight ?? 0.6);
}

function estimateLevelReach(weapon, power, angle) {
    const rad = angle * Math.PI / 180;
    const speed = power * CONFIG.tank.powerToSpeed * weapon.speedScale;
    return Math.max(0, (speed * speed * Math.sin(2 * rad)) / CONFIG.physics.gravity);
}

function simulateTerrainReach({ shooter, terrain, weapon, angle, power, wind }) {
    const rad = angle * Math.PI / 180;
    const speed = power * CONFIG.tank.powerToSpeed * weapon.speedScale;
    let x = shooter.x + Math.cos(rad) * shooter.barrelLength * shooter.facing;
    let y = shooter.y - shooter.height - Math.sin(rad) * shooter.barrelLength;
    let vx = Math.cos(rad) * speed * shooter.facing;
    let vy = -Math.sin(rad) * speed;
    const startX = x;
    const dt = CONFIG.physics.projectileStep;
    const windAccel = wind * CONFIG.physics.windAccelScale;

    for (let t = 0; t < 6; t += dt) {
        vy += CONFIG.physics.gravity * dt;
        vx += windAccel * dt;
        x += vx * dt;
        y += vy * dt;
        if (x < -80 || x > terrain.width + 80 || y > terrain.height + 90) break;
        if (x >= 0 && x < terrain.width && y >= terrain.heightAt(x)) break;
    }

    return {
        landingX: x,
        horizontalReach: Math.abs(x - startX),
    };
}

function isSplitWeapon(weapon) {
    return weapon && (weapon.behavior === 'cluster' || weapon.behavior === 'splitter');
}

function reachNotes(weapon) {
    if (weapon.role === 'rolling' || weapon.role === 'rollingHeavy') return 'Impacts terrain first, then rolls along the heightmap.';
    if (weapon.role === 'fire' || weapon.role === 'fireHeavy') return 'Area threat depends on flame width after impact.';
    if (weapon.role === 'airburst') return 'Detonates above terrain or near exposed tanks after the minimum fuse age.';
    if (weapon.role === 'controlledFork') return 'Carrier reach is shown; three predictable child shells fork near the arc peak.';
    if (weapon.role === 'cluster') return 'Carrier reach is shown; bomblets scatter widely after split.';
    if (weapon.role === 'precision') return 'Small radius and fast arc reward accurate direct shots.';
    if (weapon.role === 'terrainDestroy') return 'Low damage but a large terrain-removal radius.';
    if (weapon.role === 'terrainBuild') return 'Low damage utility mound; reach uses normal arcing ballistics.';
    if (weapon.id === 'dirt') return 'Low damage utility mound, reach uses normal arcing ballistics.';
    if (weapon.id === 'heavy') return 'v0.6.9 heavier arc than Standard Shell while keeping practical reach.';
    if (weapon.id === 'mega') return 'v0.6.9 late-match premium price, heavy arc, steep falloff, and largest crater.';
    return 'Normal arcing projectile.';
}

function castleSiegeImpactText(hitBlock, result) {
    const material = hitBlock ? hitBlock.material : 'castle';
    if (result.objectiveComplete) {
        return 'Core destroyed! The watchtower collapses out of the fight.';
    }
    if (result.blocksDestroyed > 0) {
        return `${capitalize(material)} block destroyed. ${result.blocksDamaged} block${result.blocksDamaged === 1 ? '' : 's'} damaged.`;
    }
    if (result.totalDamage > 0) {
        return `${capitalize(material)} block hit for ${Math.round(result.totalDamage)} total damage.`;
    }
    return `${capitalize(material)} block clipped. No meaningful damage.`;
}

function castleSiegeTerrainImpactText(terrainMessage, result) {
    const prefix = `Shot hit the ground. ${terrainMessage}`;
    if (result.objectiveComplete) return `${prefix} The blast destroyed the castle core.`;
    if (result.blocksDestroyed > 0) {
        return `${prefix} Splash destroyed ${result.blocksDestroyed} castle block${result.blocksDestroyed === 1 ? '' : 's'}.`;
    }
    if (result.totalDamage > 0) {
        return `${prefix} Splash dealt ${Math.round(result.totalDamage)} castle damage.`;
    }
    return prefix;
}

function capitalize(value) {
    const text = String(value || '');
    return text ? text.charAt(0).toUpperCase() + text.slice(1) : '';
}

function randomRange(min, max) {
    return min + Math.random() * (max - min);
}

function colorWithAlphaString(color, alpha) {
    if (typeof color === 'string' && color.startsWith('#') && (color.length === 7 || color.length === 4)) {
        const full = color.length === 4
            ? color.slice(1).split('').map((part) => part + part).join('')
            : color.slice(1);
        const num = parseInt(full, 16);
        if (Number.isFinite(num)) {
            const r = (num >> 16) & 255;
            const g = (num >> 8) & 255;
            const b = num & 255;
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        }
    }
    return color;
}
