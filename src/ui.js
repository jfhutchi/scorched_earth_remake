import { CONFIG, GAME_VERSION, WEAPONS } from './config.js';

export class UI {
    constructor() {
        this.menu = document.getElementById('menu');
        this.game = document.getElementById('game');
        this.summaryOverlay = document.getElementById('summaryOverlay');
        this.shopOverlay = document.getElementById('shopOverlay');
        this.summaryTitle = document.getElementById('summaryTitle');
        this.summaryScore = document.getElementById('summaryScore');
        this.summaryStats = document.getElementById('summaryStats');
        this.shopContent = document.getElementById('shopContent');
        this.menuVersion = document.getElementById('menuVersion');
        this.versionChip = document.getElementById('versionChip');

        this.twoPlayerBtn = document.getElementById('twoPlayerBtn');
        this.cpuBtn = document.getElementById('cpuBtn');
        this.menuMuteBtn = document.getElementById('menuMuteBtn');
        this.muteBtn = document.getElementById('muteBtn');
        this.continueShopBtn = document.getElementById('continueShopBtn');
        this.startNextRoundBtn = document.getElementById('startNextRoundBtn');
        this.summaryNewMatchBtn = document.getElementById('summaryNewMatchBtn');
        this.summaryMenuBtn = document.getElementById('summaryMenuBtn');
        this.shopNewMatchBtn = document.getElementById('shopNewMatchBtn');
        this.shopMenuBtn = document.getElementById('shopMenuBtn');

        this.roundsToWinSelect = document.getElementById('roundsToWinSelect');
        this.cpuDifficultySelect = document.getElementById('cpuDifficultySelect');
        this.windModeSelect = document.getElementById('windModeSelect');
        this.startingMoneySelect = document.getElementById('startingMoneySelect');
        this.terrainRoughnessSelect = document.getElementById('terrainRoughnessSelect');

        this.p1Panel = document.getElementById('p1Panel');
        this.p2Panel = document.getElementById('p2Panel');
        this.p1Name = document.getElementById('p1Name');
        this.p2Name = document.getElementById('p2Name');
        this.p1Health = document.getElementById('p1Health');
        this.p2Health = document.getElementById('p2Health');
        this.p1HealthText = document.getElementById('p1HealthText');
        this.p2HealthText = document.getElementById('p2HealthText');
        this.p1Score = document.getElementById('p1Score');
        this.p2Score = document.getElementById('p2Score');
        this.p1Inventory = document.getElementById('p1Inventory');
        this.p2Inventory = document.getElementById('p2Inventory');

        this.turnLabel = document.getElementById('turnLabel');
        this.statusVal = document.getElementById('statusVal');
        this.roundVal = document.getElementById('roundVal');
        this.modeVal = document.getElementById('modeVal');
        this.angleVal = document.getElementById('angleVal');
        this.powerVal = document.getElementById('powerVal');
        this.windVal = document.getElementById('windVal');
        this.weaponVal = document.getElementById('weaponVal');
        this.ammoVal = document.getElementById('ammoVal');
        this.moveVal = document.getElementById('moveVal');
        this.resultVal = document.getElementById('resultVal');
        this.controlsHint = document.getElementById('controlsHint');

        this.loadSettings();
        this.setVersion(GAME_VERSION);
    }

    setVersion(version) {
        if (this.menuVersion) this.menuVersion.textContent = version;
        if (this.versionChip) this.versionChip.textContent = version;
    }

    loadSettings() {
        const defaults = CONFIG.settings.defaults;
        let saved = {};
        try {
            saved = JSON.parse(localStorage.getItem(CONFIG.settings.storageKey) || '{}');
        } catch (error) {
            console.warn('Could not load saved match settings; using defaults.', error);
            saved = {};
        }
        const settings = { ...defaults, ...saved };
        this.roundsToWinSelect.value = String(settings.roundsToWin);
        this.cpuDifficultySelect.value = settings.cpuDifficulty;
        this.windModeSelect.value = settings.windMode;
        this.startingMoneySelect.value = settings.startingMoney;
        this.terrainRoughnessSelect.value = settings.terrainRoughness;
    }

    getSettings() {
        const settings = {
            roundsToWin: Number(this.roundsToWinSelect.value),
            cpuDifficulty: this.cpuDifficultySelect.value,
            windMode: this.windModeSelect.value,
            startingMoney: this.startingMoneySelect.value,
            terrainRoughness: this.terrainRoughnessSelect.value,
        };
        localStorage.setItem(CONFIG.settings.storageKey, JSON.stringify(settings));
        return settings;
    }

    showMenu() {
        this.menu.classList.remove('hidden');
        this.game.classList.add('hidden');
        this.hideAllOverlays();
    }

    showGame() {
        this.menu.classList.add('hidden');
        this.game.classList.remove('hidden');
        this.hideAllOverlays();
    }

    hideAllOverlays() {
        this.summaryOverlay.classList.add('hidden');
        this.shopOverlay.classList.add('hidden');
    }

    showSummary(state) {
        this.shopOverlay.classList.add('hidden');
        const summary = state.lastSummary;
        const matchWinner = summary.matchWinnerIndex !== null ? state.tanks[summary.matchWinnerIndex].name : null;
        const roundWinner = summary.winnerIndex === null ? 'Draw' : `${state.tanks[summary.winnerIndex].name} wins the round`;

        this.summaryTitle.textContent = matchWinner ? `${matchWinner} Wins Match!` : 'Round Summary';
        this.summaryScore.textContent = `${roundWinner} | Score: Player 1 ${summary.score[0]} - ${state.tanks[1].name} ${summary.score[1]}`;
        this.summaryStats.innerHTML = summary.stats.map((stat) => `
            <section class="summary-card">
                <h3>${stat.name}</h3>
                <p>Damage dealt: <b>${stat.damageDealt}</b></p>
                <p>Shots fired: <b>${stat.shotsFired}</b></p>
                <p>Direct / near hits: <b>${stat.directHits} / ${stat.nearHits}</b></p>
                <p>Money earned: <b>$${stat.moneyEarned}</b></p>
                <p>Money now: <b>$${stat.money}</b></p>
                <p>${inventoryText(stat.inventory, { includeMoney: false })}</p>
            </section>
        `).join('');

        this.continueShopBtn.classList.toggle('hidden', summary.matchWinnerIndex !== null);
        this.summaryOverlay.classList.remove('hidden');
    }

    showShop(state, items) {
        this.summaryOverlay.classList.add('hidden');
        const players = state.playerData;
        this.shopContent.innerHTML = players.map((player, playerIndex) => {
            const isCpu = state.gameMode === 'cpu' && playerIndex === 1;
            const buttons = items.map((item) => {
                const disabled = isCpu || player.money < item.price ? 'disabled' : '';
                return `<button class="btn shop-buy" data-player="${playerIndex}" data-item="${item.id}" ${disabled}>${item.label} - $${item.price}</button>`;
            }).join('');
            return `
                <section class="shop-card">
                    <h3>${player.name}${isCpu ? ' (auto-bought)' : ''}</h3>
                    <p class="money-line">$${player.money}</p>
                    <p>${inventoryText(player)}</p>
                    <div class="shop-actions">${buttons}</div>
                </section>
            `;
        }).join('');
        this.shopOverlay.classList.remove('hidden');
    }

    setMuted(muted) {
        const label = muted ? 'Sound: Off' : 'Sound: On';
        if (this.muteBtn) this.muteBtn.textContent = label;
        if (this.menuMuteBtn) this.menuMuteBtn.textContent = label;
    }

    update(state) {
        const { tanks, currentPlayer, active, selectedWeapon, wind } = state;
        if (!tanks || tanks.length < 2 || !active) return;

        const p1 = tanks[0];
        const p2 = tanks[1];

        this.p1Name.textContent = p1.name;
        this.p2Name.textContent = p2.name;
        this.p1Score.textContent = String(state.score[0]);
        this.p2Score.textContent = String(state.score[1]);
        this.p1Inventory.textContent = inventoryText(p1);
        this.p2Inventory.textContent = inventoryText(p2);

        this._updateHealth(p1, this.p1Health, this.p1HealthText);
        this._updateHealth(p2, this.p2Health, this.p2HealthText);

        this.p1Panel.classList.toggle('active', currentPlayer === 0 && !state.gameOver);
        this.p2Panel.classList.toggle('active', currentPlayer === 1 && !state.gameOver);
        this.p1Panel.classList.toggle('disabled', !p1.alive);
        this.p2Panel.classList.toggle('disabled', !p2.alive);

        this.turnLabel.textContent = this._turnText(state);
        this.turnLabel.style.color = currentPlayer === 0 ? '#f06b45' : '#2d75c7';
        this.statusVal.textContent = state.statusMessage;
        this.roundVal.textContent = `${state.roundNumber}/${state.roundsToWin}`;
        this.modeVal.textContent = state.gameMode === 'cpu'
            ? `CPU ${state.settings.cpuDifficulty}`
            : 'Two Player Local';

        this.angleVal.textContent = `${Math.round(active.angle)} deg`;
        this.powerVal.textContent = String(Math.round(active.power));
        this.windVal.textContent = `${formatWind(wind)} (${state.settings.windMode})`;
        this.weaponVal.textContent = selectedWeapon.name;
        this.ammoVal.textContent = formatAmmo(active.ammoFor(selectedWeapon.id));
        this.moveVal.textContent = `${Math.round(active.movementFuel)} px`;
        this.moveVal.parentElement.classList.toggle('empty', active.movementFuel <= 0);
        this.moveVal.parentElement.classList.toggle('available', state.phase === 'aiming' && !active.isCpu && active.movementFuel > 0);
        this.resultVal.textContent = state.lastResult;
        this.controlsHint.textContent = this._controlsText(state);
    }

    _updateHealth(tank, bar, text) {
        const percent = Math.max(0, Math.min(100, tank.health));
        bar.style.width = `${percent}%`;
        bar.style.background = healthColor(percent);
        text.textContent = `${tank.health}/100`;
    }

    _turnText(state) {
        if (state.phase === 'roundSummary') return 'Round Summary';
        if (state.phase === 'shop') return 'Shop';
        if (state.gameOver) return 'Round Over';
        if (state.phase === 'projectile') return 'Shot In Flight';
        if (state.phase === 'resolving') return 'Resolving Impact';
        if (state.phase === 'cpuThinking') return `${state.active.name} Thinking`;
        return `${state.active.name}'s Turn`;
    }

    _controlsText(state) {
        if (state.phase === 'roundSummary') return 'N: Continue to shop   Esc: Menu   M: Mute';
        if (state.phase === 'shop') return 'Use shop buttons, then Start Next Round. N also starts the next round.';
        if (state.gameOver) return 'N: Continue   Esc: Menu   M: Mute';
        if (state.phase === 'cpuThinking') return 'CPU is aiming. Controls locked. M: Mute   Esc: Menu';
        if (state.phase !== 'aiming') return 'Controls locked until the shot resolves. M: Mute   Esc: Menu';
        if (state.active.isCpu) return 'CPU turn. M: Mute   Esc: Menu';
        if (state.active.movementFuel <= 0) {
            return 'Left/Right: Angle   Up/Down: Power   Movement exhausted   Space: Fire   Tab/W: Weapon   R: Restart   M: Mute   Esc: Menu';
        }
        return 'Left/Right: Angle   Up/Down: Power   A/D: Move   Space: Fire   Tab/W: Weapon   R: Restart   M: Mute   Esc: Menu';
    }
}

function inventoryText(entity, { includeMoney = true } = {}) {
    const money = Math.round(entity.money || 0);
    const ammo = entity.ammo || {};
    const heavy = typeof entity.ammoFor === 'function'
        ? entity.ammoFor('heavy')
        : (ammo.heavy ?? entity.heavyAmmo ?? 0);
    const dirt = typeof entity.ammoFor === 'function'
        ? entity.ammoFor('dirt')
        : (ammo.dirt ?? entity.dirtAmmo ?? 0);
    const shield = Math.round(entity.shieldCharge || 0);
    const repairs = entity.repairKits || 0;
    const parachutes = entity.parachutes || 0;
    const parts = [];
    if (includeMoney) parts.push(`$${money}`);
    parts.push(`H ${heavy} D ${dirt}`);
    parts.push(`Sh ${shield} R ${repairs} P ${parachutes}`);
    if (Number.isFinite(entity.health)) parts.push(`HP ${Math.round(entity.health)}`);
    return parts.join(' | ');
}

function formatWind(wind) {
    if (wind === 0) return '0';
    return `${wind > 0 ? 'right' : 'left'} ${Math.abs(wind).toFixed(1)}`;
}

function formatAmmo(ammo) {
    return Number.isFinite(ammo) ? String(ammo) : 'Unlimited';
}

function healthColor(hp) {
    if (hp > 60) return 'linear-gradient(90deg, #2f9e44, #69db7c)';
    if (hp > 30) return 'linear-gradient(90deg, #f08c00, #ffd43b)';
    return 'linear-gradient(90deg, #c92a2a, #ff6b6b)';
}

export function weaponListText(tank) {
    return WEAPONS
        .map((weapon) => `${weapon.name}: ${formatAmmo(tank.ammoFor(weapon.id))}`)
        .join(' | ');
}
