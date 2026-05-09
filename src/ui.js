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
        this.p1ShieldRow = document.getElementById('p1ShieldRow');
        this.p2ShieldRow = document.getElementById('p2ShieldRow');
        this.p1ShieldFill = document.getElementById('p1ShieldFill');
        this.p2ShieldFill = document.getElementById('p2ShieldFill');
        this.p1ShieldText = document.getElementById('p1ShieldText');
        this.p2ShieldText = document.getElementById('p2ShieldText');
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
        this.weaponVal = document.getElementById('weaponVal');
        this.ammoVal = document.getElementById('ammoVal');
        this.moveVal = document.getElementById('moveVal');
        this.resultVal = document.getElementById('resultVal');
        this.controlsHint = document.getElementById('controlsHint');

        this.mhudTurn = document.getElementById('mhudTurn');
        this.mhudP1Hp = document.getElementById('mhudP1Hp');
        this.mhudP2Hp = document.getElementById('mhudP2Hp');
        this.mhudP1Shield = document.getElementById('mhudP1Shield');
        this.mhudP2Shield = document.getElementById('mhudP2Shield');
        this.mhudWeapon = document.getElementById('mhudWeapon');
        this.mhudAngle = document.getElementById('mhudAngle');
        this.mhudPower = document.getElementById('mhudPower');
        this.mhudAmmo = document.getElementById('mhudAmmo');
        this.mhudP1Inv = document.getElementById('mhudP1Inv');
        this.mhudP2Inv = document.getElementById('mhudP2Inv');
        this.mhudRound = document.getElementById('mhudRound');
        this.mhudResult = document.getElementById('mhudResult');

        this.loadSettings();
        this.setVersion(GAME_VERSION);
    }

    updateMobileHud(game, state) {
        if (!this.mhudTurn) return;
        const tanks = state ? state.tanks : (game && game.tanks);
        if (!tanks || tanks.length < 2) return;
        const active = state ? state.active : tanks[game.currentPlayer];
        if (!active) return;
        const currentPlayer = state ? state.currentPlayer : game.currentPlayer;
        const selectedWeapon = state ? state.selectedWeapon : (active.selectedWeapon ? active.selectedWeapon() : null);

        const p1 = tanks[0];
        const p2 = tanks[1];
        const cpuMode = (state && state.gameMode === 'cpu') || (game && game.gameMode === 'cpu');
        this.mhudTurn.textContent = currentPlayer === 0 ? 'P1' : (cpuMode ? 'CPU' : 'P2');
        this.mhudTurn.style.background = currentPlayer === 0 ? 'rgba(199, 82, 47, 0.86)' : 'rgba(45, 117, 199, 0.78)';
        this.mhudP1Hp.textContent = String(Math.max(0, Math.round(p1.health)));
        this.mhudP2Hp.textContent = String(Math.max(0, Math.round(p2.health)));
        if (this.mhudP1Shield) this.mhudP1Shield.textContent = formatShieldCompact(p1);
        if (this.mhudP2Shield) this.mhudP2Shield.textContent = formatShieldCompact(p2);
        if (selectedWeapon) this.mhudWeapon.textContent = shortWeaponName(selectedWeapon);
        this.mhudAngle.textContent = String(Math.round(active.angle));
        this.mhudPower.textContent = String(Math.round(active.power));
        if (selectedWeapon) {
            const a = active.ammoFor(selectedWeapon.id);
            this.mhudAmmo.textContent = Number.isFinite(a) ? String(a) : 'Inf';
        }

        if (this.mhudP1Inv) this.mhudP1Inv.textContent = `P1 ${shortInv(p1)}`;
        if (this.mhudP2Inv) this.mhudP2Inv.textContent = `P2 ${shortInv(p2)}`;
        if (this.mhudRound) {
            const round = state ? state.roundNumber : game.roundNumber;
            const target = state ? state.roundsToWin : (game.settings && game.settings.roundsToWin);
            this.mhudRound.textContent = `R ${round || 1}/${target || 3}`;
        }
        if (this.mhudResult) {
            const last = state ? state.lastResult : game.lastResult;
            this.mhudResult.textContent = last ? String(last).slice(0, 60) : '--';
        }
    }

    setVersion(version) {
        if (this.menuVersion) this.menuVersion.textContent = version;
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
                <p>${inventoryText(stat.inventory, { includeMoney: false, context: 'summary' })}</p>
            </section>
        `).join('');

        this.continueShopBtn.classList.toggle('hidden', summary.matchWinnerIndex !== null);
        this.summaryOverlay.classList.remove('hidden');
    }

    showShop(state, items) {
        this.summaryOverlay.classList.add('hidden');
        // When opening the shop before round 1 (roundNumber === 0),
        // the primary button reads "Start Round" instead of "Start Next Round".
        const isPreRound = state.roundNumber === 0;
        if (this.startNextRoundBtn) {
            this.startNextRoundBtn.textContent = isPreRound ? 'Start Round' : 'Start Next Round';
        }
        const shopHeading = this.shopOverlay && this.shopOverlay.querySelector('.title');
        if (shopHeading) {
            shopHeading.textContent = isPreRound ? 'Pre-Round Shop' : 'Between-Round Shop';
        }
        const shopSubtitle = this.shopOverlay && this.shopOverlay.querySelector('.subtitle');
        if (shopSubtitle) {
            shopSubtitle.textContent = isPreRound
                ? 'Spend your starting money before Round 1. Limited weapon ammo purchases refill that weapon to max.'
                : 'First Aid Kits fully heal between rounds. Ammo purchases refill that weapon to its carried max.';
        }
        // Player names and shop labels are static config values, not user
        // input. We render via DOM APIs so the security hook is satisfied
        // and any future user-supplied text remains safe.
        const root = this.shopContent;
        while (root.firstChild) root.removeChild(root.firstChild);

        const players = state.playerData;
        players.forEach((player, playerIndex) => {
            const isCpu = state.gameMode === 'cpu' && playerIndex === 1;
            const card = document.createElement('section');
            card.className = `shop-card ${isCpu ? 'cpu-shop-card' : 'human-shop-card'}`;

            const h3 = document.createElement('h3');
            h3.textContent = isCpu ? player.name : `${player.name} Purchases`;
            card.appendChild(h3);

            const money = document.createElement('p');
            money.className = 'money-line';
            money.textContent = `Money: $${player.money}`;
            card.appendChild(money);

            if (isCpu) {
                card.appendChild(createCpuShopSummary(player, state.lastCpuShopPurchases || []));
                root.appendChild(card);
                return;
            }

            const inv = document.createElement('div');
            inv.className = 'inventory-list';
            for (const line of inventoryLines(player)) {
                const row = document.createElement('p');
                row.textContent = line;
                inv.appendChild(row);
            }
            card.appendChild(inv);

            const actions = document.createElement('div');
            actions.className = 'shop-actions';

            for (const item of items) {
                const btn = document.createElement('button');
                btn.className = 'btn shop-buy';
                btn.dataset.player = String(playerIndex);
                btn.dataset.item = item.id;

                const full = isShopItemFull(player, item);
                const cantAfford = player.money < item.price;
                if (isCpu || cantAfford || full) btn.disabled = true;
                if (full) btn.classList.add('full');

                if (full) {
                    btn.textContent = item.fullLabel || `${item.label} Full`;
                } else if (item.weaponId && item.refillToMax) {
                    btn.textContent = `${item.refillLabel || item.label} (to ${item.refillToMax}) - $${item.price}`;
                } else {
                    btn.textContent = `${item.label} - $${item.price}`;
                }
                actions.appendChild(btn);
            }
            card.appendChild(actions);
            root.appendChild(card);
        });

        this.shopOverlay.classList.remove('hidden');
    }

    setMuted(muted) {
        const label = muted ? 'Sound: Off' : 'Sound: On';
        if (this.muteBtn) this.muteBtn.textContent = label;
        if (this.menuMuteBtn) this.menuMuteBtn.textContent = label;
    }

    update(state) {
        const { tanks, currentPlayer, active, selectedWeapon } = state;
        if (!tanks || tanks.length < 2 || !active) return;

        const p1 = tanks[0];
        const p2 = tanks[1];

        this.p1Name.textContent = p1.name;
        this.p2Name.textContent = p2.name;
        this.p1Score.textContent = String(state.score[0]);
        this.p2Score.textContent = String(state.score[1]);
        this.p1Inventory.textContent = inventoryText(p1, { context: 'hud' });
        this.p2Inventory.textContent = inventoryText(p2, { context: 'hud' });

        this._updateHealth(p1, this.p1Health, this.p1HealthText, this.p1ShieldRow, this.p1ShieldFill, this.p1ShieldText);
        this._updateHealth(p2, this.p2Health, this.p2HealthText, this.p2ShieldRow, this.p2ShieldFill, this.p2ShieldText);

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
        this.weaponVal.textContent = selectedWeapon.name;
        this.ammoVal.textContent = formatAmmo(active.ammoFor(selectedWeapon.id));
        this.moveVal.textContent = `${Math.round(active.movementFuel)} px`;
        this.moveVal.parentElement.classList.toggle('empty', active.movementFuel <= 0);
        this.moveVal.parentElement.classList.toggle('available', state.phase === 'aiming' && !active.isCpu && active.movementFuel > 0);
        this.resultVal.textContent = state.lastResult;
        this.controlsHint.textContent = this._controlsText(state);
    }

    _updateHealth(tank, bar, text, shieldRow, shieldFill, shieldText) {
        const percent = Math.max(0, Math.min(100, tank.health));
        bar.style.width = `${percent}%`;
        bar.style.background = healthColor(percent);
        text.textContent = `${tank.health}/100`;
        const shield = Math.max(0, Math.round(tank.shieldCharge || 0));
        if (shieldRow) shieldRow.classList.toggle('empty', shield <= 0);
        if (shieldFill) shieldFill.style.width = `${Math.min(100, shield / 180 * 100)}%`;
        if (shieldText) shieldText.textContent = String(shield);
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
        if (state.phase === 'roundSummary') return 'Keys: N continue, Esc menu, M mute. Touch: N or menu.';
        if (state.phase === 'shop') return 'Buy items, then Start Next Round. Keys: N next round. Touch: N.';
        if (state.gameOver) return 'Keys: N continue, Esc menu, M mute. Touch: N or menu.';
        if (state.phase === 'cpuThinking') return 'CPU is aiming. Controls locked.';
        if (state.phase !== 'aiming') return 'Controls locked until the shot resolves.';
        if (state.active.isCpu) return 'CPU turn. Controls locked.';
        if (state.active.movementFuel <= 0) {
            return 'Keys: arrows aim, Space fire, Tab/W weapon, R restart, M mute, Esc menu. Touch: up/down angle, PWR-/PWR+, FIRE, WPN, mute, menu.';
        }
        return 'Keys: arrows aim, A/D move, Space fire, Tab/W weapon, R restart, M mute, Esc menu. Touch: move, up/down angle, PWR-/PWR+, FIRE, WPN.';
    }
}

function inventoryText(entity, { includeMoney = true, context = 'hud' } = {}) {
    const money = Math.round(entity.money || 0);
    const shield = Math.round(entity.shieldCharge || 0);
    const repairs = entity.repairKits || 0;
    const parachutes = entity.parachutes || 0;
    const parts = [];
    if (includeMoney) parts.push(context === 'hud' ? `$${money}` : `Money: $${money}`);
    for (const weapon of WEAPONS.filter((candidate) => Number.isFinite(candidate.ammo))) {
        const have = ammoForEntity(entity, weapon.id);
        const label = context === 'hud' ? weapon.compactName : weapon.inventoryName;
        parts.push(context === 'hud'
            ? `${label} ${have}`
            : `${weapon.inventoryName}: ${have}/${weapon.ammo}`);
    }
    parts.push(context === 'hud' ? `Shield ${shield}` : `Shield: ${shield}`);
    parts.push(context === 'hud' ? `Aid ${repairs}` : `First Aid: ${repairs}`);
    parts.push(context === 'hud' ? `Chute ${parachutes}` : `Parachutes: ${parachutes}`);
    if (context !== 'hud' && Number.isFinite(entity.health)) parts.push(`HP: ${Math.round(entity.health)}/100`);
    return parts.join(' | ');
}

function inventoryLines(entity) {
    const lines = [];
    for (const weapon of WEAPONS.filter((candidate) => Number.isFinite(candidate.ammo))) {
        lines.push(`${weapon.inventoryName}: ${ammoForEntity(entity, weapon.id)}/${weapon.ammo}`);
    }
    lines.push(`Shield: ${Math.round(entity.shieldCharge || 0)}`);
    lines.push(`First Aid: ${entity.repairKits || 0}`);
    lines.push(`Parachutes: ${entity.parachutes || 0}`);
    if (Number.isFinite(entity.health)) lines.push(`HP: ${Math.round(entity.health)}/100`);
    return lines;
}

function createCpuShopSummary(player, purchases) {
    const fragment = document.createDocumentFragment();
    const count = purchases.length;

    const summary = document.createElement('p');
    summary.className = 'cpu-shop-note';
    summary.textContent = count > 0 ? `CPU bought ${count} item${count === 1 ? '' : 's'}.` : 'CPU auto-shopped.';
    fragment.appendChild(summary);

    const details = document.createElement('details');
    details.className = 'cpu-shop-details';
    details.open = !isCompactShopViewport();

    const toggle = document.createElement('summary');
    toggle.textContent = 'Details';
    details.appendChild(toggle);

    const list = document.createElement('div');
    list.className = 'cpu-purchase-list';
    const purchaseLine = document.createElement('p');
    purchaseLine.textContent = count > 0 ? purchases.join(', ') : 'No purchases this visit.';
    list.appendChild(purchaseLine);

    const inventoryLine = document.createElement('p');
    inventoryLine.textContent = inventoryText(player, { includeMoney: false, context: 'summary' });
    list.appendChild(inventoryLine);

    details.appendChild(list);
    fragment.appendChild(details);
    return fragment;
}

function isCompactShopViewport() {
    return typeof window !== 'undefined'
        && window.matchMedia
        && window.matchMedia('(max-width: 768px)').matches;
}

function ammoForEntity(entity, weaponId) {
    if (typeof entity.ammoFor === 'function') return entity.ammoFor(weaponId);
    const ammo = entity.ammo || {};
    return ammo[weaponId] ?? entity[`${weaponId}Ammo`] ?? 0;
}

function isShopItemFull(player, item) {
    if (!player || !item) return false;
    if (item.weaponId && Number.isFinite(item.refillToMax)) {
        const have = player.ammo?.[item.weaponId] || 0;
        return have >= item.refillToMax;
    }
    if (item.id === 'repair') {
        const max = 100;
        return (player.health || 0) >= max;
    }
    if (item.id === 'shield') {
        return (player.shieldCharge || 0) >= 180;
    }
    return false;
}

function formatShieldCompact(tank) {
    const shield = Math.round(tank.shieldCharge || 0);
    return shield > 0 ? `+Shield ${shield}` : '';
}

function shortWeaponName(weapon) {
    if (!weapon) return '';
    return weapon.compactName || (weapon.name.length > 8 ? weapon.name.slice(0, 8) : weapon.name);
}

function shortInv(tank) {
    if (!tank) return '';
    const money = Math.round(tank.money || 0);
    const parts = [`$${money}`];
    for (const weapon of WEAPONS.filter((candidate) => Number.isFinite(candidate.ammo))) {
        parts.push(`${weapon.compactName} ${ammoForEntity(tank, weapon.id)}`);
    }
    parts.push(`Shield ${Math.round(tank.shieldCharge || 0)}`);
    parts.push(`Aid ${tank.repairKits || 0}`);
    parts.push(`Chute ${tank.parachutes || 0}`);
    return parts.join(' | ');
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
