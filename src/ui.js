import { CONFIG, GAME_VERSION, MAX_SHIELD, WEAPONS, clampShieldCharge, maxAmmoFor } from './config.js';
import { CASTLE_SIEGE_ARMORY_ITEMS, summarizeCastleSiegeArmory } from './siege/armory.js';
import { getCastleSiegeLevel } from './siege/levels.js';
import {
    CASTLE_SIEGE_WORLDS,
    getStarsEarnedInWorld,
    isLevelUnlocked,
    isWorldUnlocked,
    summarizeCampaignProgress,
} from './siege/worlds.js';
import { drawUtilityIcon, drawWeaponIcon } from './visualAssets.js';

export class UI {
    constructor() {
        this.menu = document.getElementById('menu');
        this.game = document.getElementById('game');
        this.summaryOverlay = document.getElementById('summaryOverlay');
        this.shopOverlay = document.getElementById('shopOverlay');
        this.summaryTitle = document.getElementById('summaryTitle');
        this.summaryScore = document.getElementById('summaryScore');
        this.summaryStats = document.getElementById('summaryStats');
        this.summaryNote = document.getElementById('summaryNote');
        this.shopContent = document.getElementById('shopContent');
        this.menuVersion = document.getElementById('menuVersion');
        this.helpOverlay = document.getElementById('helpOverlay');
        this.helpBtn = document.getElementById('helpBtn');
        this.helpCloseBtn = document.getElementById('helpCloseBtn');
        this.siegeResultOverlay = document.getElementById('siegeResultOverlay');
        this.siegeResultTitle = document.getElementById('siegeResultTitle');
        this.siegeResultStars = document.getElementById('siegeResultStars');
        this.siegeResultStats = document.getElementById('siegeResultStats');
        this.siegeReplayBtn = document.getElementById('siegeReplayBtn');
        this.siegeMenuBtn = document.getElementById('siegeMenuBtn');
        this.siegeNextBtn = document.getElementById('siegeNextBtn');
        this.siegeArmoryBtn = document.getElementById('siegeArmoryBtn');
        this.siegeLevelSelectBtn = document.getElementById('siegeLevelSelectBtn');
        this.levelSelectOverlay = document.getElementById('levelSelectOverlay');
        this.levelSelectWorlds = document.getElementById('levelSelectWorlds');
        this.levelSelectSummary = document.getElementById('levelSelectSummary');
        this.levelSelectArmoryBtn = document.getElementById('levelSelectArmoryBtn');
        this.levelSelectBackBtn = document.getElementById('levelSelectBackBtn');
        this.armoryOverlay = document.getElementById('armoryOverlay');
        this.armorySummary = document.getElementById('armorySummary');
        this.armoryItems = document.getElementById('armoryItems');
        this.armoryCloseBtn = document.getElementById('armoryCloseBtn');

        this.handoffOverlay = document.getElementById('handoffOverlay');
        this.handoffTitle = document.getElementById('handoffTitle');
        this.handoffSubtitle = document.getElementById('handoffSubtitle');
        this.handoffTag = document.getElementById('handoffTag');
        this.handoffStartBtn = document.getElementById('handoffStartBtn');
        this.handoffCard = this.handoffOverlay ? this.handoffOverlay.querySelector('.handoff-card') : null;

        this.twoPlayerBtn = document.getElementById('twoPlayerBtn');
        this.cpuBtn = document.getElementById('cpuBtn');
        this.campaignBtn = document.getElementById('campaignBtn');
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
        this.weaponIcon = document.getElementById('weaponIcon');
        this.ammoVal = document.getElementById('ammoVal');
        this.moveVal = document.getElementById('moveVal');
        this.windVal = document.getElementById('windVal');
        this.resultVal = document.getElementById('resultVal');
        this.controlsHint = document.getElementById('controlsHint');

        this.mhudTurn = document.getElementById('mhudTurn');
        this.mhudP1Hp = document.getElementById('mhudP1Hp');
        this.mhudP2Hp = document.getElementById('mhudP2Hp');
        this.mhudP1Shield = document.getElementById('mhudP1Shield');
        this.mhudP2Shield = document.getElementById('mhudP2Shield');
        this.mhudWeapon = document.getElementById('mhudWeapon');
        this.mhudWeaponIcon = document.getElementById('mhudWeaponIcon');
        this.mhudAngle = document.getElementById('mhudAngle');
        this.mhudPower = document.getElementById('mhudPower');
        this.mhudAmmo = document.getElementById('mhudAmmo');
        this.mhudP1Inv = document.getElementById('mhudP1Inv');
        this.mhudP2Inv = document.getElementById('mhudP2Inv');
        this.mhudRound = document.getElementById('mhudRound');
        this.mhudResult = document.getElementById('mhudResult');
        this.weaponToast = document.getElementById('weaponToast');

        this.loadSettings();
        this.setVersion(GAME_VERSION);
    }

    updateMobileHud(game, state) {
        if (!this.mhudTurn) return;
        const tanks = state ? state.tanks : (game && game.tanks);
        const siege = state ? state.siege : (game && game.siege && game.siege.summary());
        if ((state && state.gameMode === 'siege') || (game && game.gameMode === 'siege')) {
            this._updateSiegeMobileHud(tanks && tanks[0], siege, state);
            return;
        }
        if (!tanks || tanks.length < 2) return;
        const active = state ? state.active : tanks[game.currentPlayer];
        if (!active) return;
        const currentPlayer = state ? state.currentPlayer : game.currentPlayer;
        const selectedWeapon = state ? state.selectedWeapon : (active.selectedWeapon ? active.selectedWeapon() : null);

        const p1 = tanks[0];
        const p2 = tanks[1];
        const cpuMode = (state && state.gameMode === 'cpu') || (game && game.gameMode === 'cpu');
        this.mhudTurn.textContent = currentPlayer === 0 ? 'P1' : (cpuMode ? 'CPU' : 'P2');
        this.mhudTurn.style.background = currentPlayer === 0
            ? 'rgba(199, 82, 47, 0.86)'
            : (cpuMode ? 'rgba(145, 89, 193, 0.86)' : 'rgba(45, 117, 199, 0.78)');
        this.mhudP1Hp.textContent = String(Math.max(0, Math.round(p1.health)));
        this.mhudP2Hp.textContent = String(Math.max(0, Math.round(p2.health)));
        if (this.mhudP1Shield) this.mhudP1Shield.textContent = formatShieldCompact(p1);
        if (this.mhudP2Shield) this.mhudP2Shield.textContent = formatShieldCompact(p2);
        if (selectedWeapon) {
            this.mhudWeapon.textContent = shortWeaponName(selectedWeapon);
            drawHudWeaponIcon(this.mhudWeaponIcon, selectedWeapon, 28);
        }
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
        if (this.siegeResultOverlay) this.siegeResultOverlay.classList.add('hidden');
        if (this.levelSelectOverlay) this.levelSelectOverlay.classList.add('hidden');
        if (this.armoryOverlay) this.armoryOverlay.classList.add('hidden');
        if (this.helpOverlay) this.helpOverlay.classList.add('hidden');
        if (this.handoffOverlay) this.handoffOverlay.classList.add('hidden');
    }

    showLevelSelect(progress, { onSelect, onBack } = {}) {
        if (!this.levelSelectOverlay || !this.levelSelectWorlds) return;
        this.hideAllOverlays();

        const summary = summarizeCampaignProgress(progress);
        const armory = summarizeCastleSiegeArmory(progress);
        if (this.levelSelectSummary) {
            this.levelSelectSummary.replaceChildren(
                createLevelSelectNote('Start here: pick the first unlocked level, aim for the objective block, and use Replay to learn the arc quickly.'),
                createLevelSelectPill(`${summary.completed}/${summary.totalLevels} cleared`),
                createLevelSelectPill(`${summary.stars}/${summary.maxStars} stars`),
                createLevelSelectPill(`$${summary.coins} siege coins`),
                createLevelSelectPill(`${armory.totalSupplies} armory supplies`),
            );
        }

        const worldCards = CASTLE_SIEGE_WORLDS.map((world) => {
            const unlocked = isWorldUnlocked(world.id, progress);
            const worldStars = getStarsEarnedInWorld(world.id, progress);
            const card = document.createElement('section');
            card.className = `level-select-world${unlocked ? '' : ' locked'}`;

            const header = document.createElement('div');
            header.className = 'level-select-world-header';

            const title = document.createElement('h2');
            title.textContent = world.name;
            header.appendChild(title);

            const subtitle = document.createElement('p');
            subtitle.className = 'subtitle';
            subtitle.textContent = world.subtitle;
            header.appendChild(subtitle);

            const status = document.createElement('span');
            status.className = unlocked ? 'stars' : 'lock';
            status.textContent = unlocked
                ? `${worldStars}/${world.levelIds.length * 3} stars`
                : `Unlocks at ${world.starsToUnlock} total stars`;
            header.appendChild(status);
            card.appendChild(header);

            const grid = document.createElement('div');
            grid.className = 'level-select-grid';
            for (const levelId of world.levelIds) {
                grid.appendChild(createLevelSelectButton(levelId, progress, {
                    onSelect,
                    unlocked: unlocked && isLevelUnlocked(levelId, progress),
                }));
            }
            card.appendChild(grid);
            return card;
        });
        this.levelSelectWorlds.replaceChildren(...worldCards);

        if (this.levelSelectBackBtn) {
            this.levelSelectBackBtn.onclick = () => {
                if (typeof onBack === 'function') onBack();
                else this.hideLevelSelect();
            };
        }

        this.levelSelectOverlay.classList.remove('hidden');
        const firstUnlocked = this.levelSelectWorlds.querySelector('.level-card:not(:disabled)');
        const focusTarget = firstUnlocked || this.levelSelectBackBtn;
        if (focusTarget) {
            try { focusTarget.focus({ preventScroll: true }); } catch (_err) { /* ignore */ }
        }
    }

    hideLevelSelect() {
        if (this.levelSelectOverlay) this.levelSelectOverlay.classList.add('hidden');
    }

    showCastleSiegeArmory(progress, { onBuy, onClose, message = '' } = {}) {
        if (!this.armoryOverlay || !this.armoryItems) return;
        this.hideAllOverlays();

        const summary = summarizeCastleSiegeArmory(progress);
        if (this.armorySummary) {
            const status = message || (summary.loadedText
                ? `Stocked for next attempt: ${summary.loadedText}.`
                : 'Buy supplies with siege coins. Stocked supplies auto-load into your next Castle Siege attempt.');
            this.armorySummary.replaceChildren(
                createLevelSelectPill(`$${summary.coins} siege coins`),
                createLevelSelectPill(`${summary.totalSupplies} supplies stocked`),
                createArmoryNote(status),
            );
        }

        const cards = CASTLE_SIEGE_ARMORY_ITEMS.map((item) => {
            const itemSummary = summary.items.find((candidate) => candidate.id === item.id) || item;
            return createArmoryItemCard(itemSummary, summary.coins, {
                onBuy: (itemId) => {
                    const result = typeof onBuy === 'function' ? onBuy(itemId) : null;
                    this.showCastleSiegeArmory(result?.progress || progress, {
                        onBuy,
                        onClose,
                        message: result?.message || '',
                    });
                },
            });
        });
        this.armoryItems.replaceChildren(...cards);

        if (this.armoryCloseBtn) {
            this.armoryCloseBtn.onclick = () => {
                if (typeof onClose === 'function') onClose();
                else this.hideCastleSiegeArmory();
            };
        }

        this.armoryOverlay.classList.remove('hidden');
        const firstBuy = this.armoryItems.querySelector('button:not(:disabled)');
        const focusTarget = firstBuy || this.armoryCloseBtn;
        if (focusTarget) {
            try { focusTarget.focus({ preventScroll: true }); } catch (_err) { /* ignore */ }
        }
    }

    hideCastleSiegeArmory() {
        if (this.armoryOverlay) this.armoryOverlay.classList.add('hidden');
    }

    showHandoff(state, activeTank) {
        if (!this.handoffOverlay) return;
        const tank = activeTank || (state && state.active);
        const isP1 = tank ? tank.playerIndex === 0 : (state && state.currentPlayer === 0);
        const label = tank ? (tank.label || tank.name) : (isP1 ? 'Player 1' : 'Player 2');
        const tagText = isP1 ? 'P1' : 'P2';

        if (this.handoffTitle) this.handoffTitle.textContent = `${label} Turn`;
        if (this.handoffSubtitle) this.handoffSubtitle.textContent = `Pass the keyboard or device to ${label}.`;
        if (this.handoffTag) this.handoffTag.textContent = tagText;
        if (this.handoffCard) {
            this.handoffCard.classList.toggle('is-p1', isP1);
            this.handoffCard.classList.toggle('is-p2', !isP1);
        }
        this.handoffOverlay.classList.remove('hidden');
        if (this.handoffStartBtn) {
            try { this.handoffStartBtn.focus({ preventScroll: true }); } catch (_err) { /* ignore */ }
        }
    }

    hideHandoff() {
        if (!this.handoffOverlay) return;
        this.handoffOverlay.classList.add('hidden');
    }

    showHelp() {
        if (this.helpOverlay) this.helpOverlay.classList.remove('hidden');
    }

    hideHelp() {
        if (this.helpOverlay) this.helpOverlay.classList.add('hidden');
    }

    showSummary(state) {
        this.shopOverlay.classList.add('hidden');
        if (this.siegeResultOverlay) this.siegeResultOverlay.classList.add('hidden');
        if (this.armoryOverlay) this.armoryOverlay.classList.add('hidden');
        const summary = state.lastSummary;
        const matchWinner = summary.matchWinnerIndex !== null ? state.tanks[summary.matchWinnerIndex].name : null;
        const roundWinner = summary.winnerIndex === null ? 'Draw' : `${state.tanks[summary.winnerIndex].name} wins the round`;

        this.summaryTitle.textContent = matchWinner ? `${matchWinner} Wins Match!` : 'Round Summary';
        this.summaryScore.textContent = `${roundWinner} | Score: ${state.tanks[0].name} ${summary.score[0]} - ${state.tanks[1].name} ${summary.score[1]}`;
        this.summaryStats.innerHTML = summary.stats.map((stat) => {
            const ammo = inventoryAmmoText(stat.inventory);
            const utility = inventoryUtilityText(stat.inventory);
            return `
                <section class="summary-card summary-player-card">
                    <div class="summary-card-head">
                        <h3>${stat.name}</h3>
                        <span class="summary-money">$${stat.money}</span>
                    </div>
                    <div class="summary-stat-list">
                        <p><span>Damage dealt</span><b>${stat.damageDealt}</b></p>
                        <p><span>Shots fired</span><b>${stat.shotsFired}</b></p>
                        <p><span>Direct / near</span><b>${stat.directHits} / ${stat.nearHits}</b></p>
                        <p><span>Burn damage</span><b>${stat.burnDamageDealt || 0}</b></p>
                        <p><span>Fall damage</span><b>${stat.fallDamageTaken || 0}</b></p>
                        <p><span>Parachutes used</span><b>${stat.parachutesUsed || 0}</b></p>
                        <p><span>Money earned</span><b>$${stat.moneyEarned}</b></p>
                    </div>
                    <p class="summary-inventory"><b>Ammo</b> ${ammo}</p>
                    <p class="summary-inventory"><b>Items</b> ${utility}</p>
                </section>
            `;
        }).join('');

        this.continueShopBtn.classList.toggle('hidden', summary.matchWinnerIndex !== null);
        if (this.summaryNote) {
            this.summaryNote.textContent = summary.matchWinnerIndex !== null
                ? 'Match complete. Use New Match or Main Menu.'
                : 'Keyboard: N continues when a shop is available, Escape returns to menu. On touch, use the on-screen N or menu buttons.';
        }
        this.summaryOverlay.classList.remove('hidden');
    }

    showShop(state, items) {
        this.summaryOverlay.classList.add('hidden');
        if (this.siegeResultOverlay) this.siegeResultOverlay.classList.add('hidden');
        if (this.armoryOverlay) this.armoryOverlay.classList.add('hidden');
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
                ? 'Default starts with $0. Earn money through combat; limited ammo purchases refill that weapon to max.'
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
            card.className = `shop-card shop-player-card ${isCpu ? 'cpu-shop-card' : 'human-shop-card'}`;

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

            const hint = document.createElement('p');
            hint.className = 'shop-player-hint';
            hint.textContent = player.money <= 0
                ? 'No starting cash. Standard Shell is unlimited; start the round to earn money.'
                : 'Buy ammo and utilities. Weapon ammo refills to its carried max.';
            card.appendChild(hint);

            const actions = document.createElement('div');
            actions.className = 'shop-actions';

            for (const item of items) {
                actions.appendChild(createShopItemCard(player, playerIndex, item));
            }
            card.appendChild(actions);
            root.appendChild(card);
        });

        this.shopOverlay.classList.remove('hidden');
    }

    showCastleSiegeResult(result) {
        if (!this.siegeResultOverlay || !result) return;
        this.summaryOverlay.classList.add('hidden');
        this.shopOverlay.classList.add('hidden');
        if (this.levelSelectOverlay) this.levelSelectOverlay.classList.add('hidden');
        if (this.armoryOverlay) this.armoryOverlay.classList.add('hidden');
        if (this.helpOverlay) this.helpOverlay.classList.add('hidden');
        if (this.handoffOverlay) this.handoffOverlay.classList.add('hidden');

        const title = result.victory ? 'Victory!' : 'Out of Shots';
        if (this.siegeResultTitle) this.siegeResultTitle.textContent = title;
        if (this.siegeResultStars) {
            this.siegeResultStars.textContent = `Stars ${result.stars || 0}/3`;
            this.siegeResultStars.dataset.stars = String(result.stars || 0);
        }
        if (this.siegeResultStats) {
            this.siegeResultStats.innerHTML = '';
            this.siegeResultStats.appendChild(createSiegeResultCard('Level', result.levelName || 'Old Watchtower'));
            this.siegeResultStats.appendChild(createSiegeResultCard('Coins Earned', `$${result.coinsEarned || 0}`));
            this.siegeResultStats.appendChild(createSiegeResultCard('Shots Remaining', String(result.shotsRemaining || 0)));
            this.siegeResultStats.appendChild(createSiegeResultCard('Total Siege Coins', `$${result.totalCoins || 0}`));
            if (!result.victory && result.levelHint) {
                this.siegeResultStats.appendChild(createSiegeResultCard('Retry Tip', result.levelHint, { wide: true }));
            }
        }
        if (this.siegeNextBtn) {
            const hasNext = Boolean(result.victory && result.nextLevelId);
            this.siegeNextBtn.classList.toggle('hidden', !hasNext);
            this.siegeNextBtn.disabled = !hasNext;
            this.siegeNextBtn.dataset.levelId = hasNext ? result.nextLevelId : '';
            this.siegeNextBtn.textContent = result.nextLevelName ? `Next: ${result.nextLevelName}` : 'Next Level';
        }
        this.siegeResultOverlay.classList.remove('hidden');
        if (this.siegeReplayBtn) {
            try { this.siegeReplayBtn.focus({ preventScroll: true }); } catch (_err) { /* ignore */ }
        }
    }

    hideCastleSiegeResult() {
        if (this.siegeResultOverlay) this.siegeResultOverlay.classList.add('hidden');
        if (this.siegeNextBtn) this.siegeNextBtn.dataset.levelId = '';
    }

    setMuted(muted) {
        const label = muted ? 'Sound: Off' : 'Sound: On';
        if (this.muteBtn) this.muteBtn.textContent = label;
        if (this.menuMuteBtn) this.menuMuteBtn.textContent = label;
    }

    update(state) {
        const { tanks, currentPlayer, active, selectedWeapon } = state;
        if (state.gameMode === 'siege') {
            this._updateSiegeHud(state);
            return;
        }
        if (!tanks || tanks.length < 2 || !active) return;

        const p1 = tanks[0];
        const p2 = tanks[1];
        if (this.p2Panel) this.p2Panel.classList.remove('hidden');

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
        this.turnLabel.style.color = turnLabelColor(currentPlayer, state);
        this.statusVal.textContent = state.statusMessage;
        this.roundVal.textContent = `${state.roundNumber}/${state.roundsToWin}`;
        this.modeVal.textContent = state.gameMode === 'cpu'
            ? `CPU ${state.settings.cpuDifficulty}`
            : 'Two Player Local';

        this.angleVal.textContent = `${Math.round(active.angle)} deg`;
        this.powerVal.textContent = String(Math.round(active.power));
        this.weaponVal.textContent = selectedWeapon.name;
        drawHudWeaponIcon(this.weaponIcon, selectedWeapon, 32);
        this.ammoVal.textContent = formatAmmo(active.ammoFor(selectedWeapon.id));
        this.moveVal.textContent = `${Math.round(active.movementFuel)} px`;
        this.moveVal.parentElement.classList.toggle('empty', active.movementFuel <= 0);
        this.moveVal.parentElement.classList.toggle('available', state.phase === 'aiming' && !active.isCpu && active.movementFuel > 0);
        if (this.windVal) this.windVal.textContent = formatWind(state.wind);
        this.resultVal.textContent = state.lastResult;
        this.controlsHint.textContent = this._controlsText(state);
    }

    _updateSiegeHud(state) {
        const tank = state.active || state.tanks[0];
        const siege = state.siege || {};
        if (!tank) return;

        if (this.p2Panel) this.p2Panel.classList.remove('hidden');
        this.p1Name.textContent = 'Player 1';
        this.p2Name.textContent = 'Castle Core';
        this.p1Score.textContent = '0';
        this.p2Score.textContent = 'Obj';
        this.p1Inventory.textContent = `Shots ${siege.shotsRemaining}/${siege.shotLimit} | Siege coins $${siege.progress?.coins || 0}`;
        this.p2Inventory.textContent = `Blocks ${siege.blocksRemaining || 0} standing | Best ${siege.progress?.bestStars || 0}/3`;

        this._updateHealth(tank, this.p1Health, this.p1HealthText, this.p1ShieldRow, this.p1ShieldFill, this.p1ShieldText);
        const core = siege.objectiveHealth || { hp: 0, maxHp: 0, percent: 0 };
        const corePercent = Math.max(0, Math.min(100, (core.percent || 0) * 100));
        this.p2Health.style.width = `${corePercent}%`;
        this.p2Health.style.background = healthColor(corePercent);
        this.p2HealthText.textContent = `${Math.ceil(core.hp || 0)}/${core.maxHp || 0}`;
        if (this.p2ShieldRow) this.p2ShieldRow.classList.add('empty');
        if (this.p2ShieldFill) this.p2ShieldFill.style.width = '0%';
        if (this.p2ShieldText) this.p2ShieldText.textContent = '0';

        this.p1Panel.classList.toggle('active', state.phase === 'siegeAiming' && !state.gameOver);
        this.p2Panel.classList.remove('active');
        this.p1Panel.classList.remove('disabled');
        this.p2Panel.classList.toggle('disabled', siege.victory || siege.failure);

        this.turnLabel.textContent = siege.victory ? 'Castle Breached' : (siege.failure ? 'Out of Shots' : 'Castle Siege');
        this.turnLabel.style.color = '#f06b45';
        this.statusVal.textContent = state.statusMessage;
        this.roundVal.textContent = siege.levelId || 'siege_001';
        this.modeVal.textContent = 'Campaign';

        this.angleVal.textContent = `${Math.round(tank.angle)} deg`;
        this.powerVal.textContent = String(Math.round(tank.power));
        this.weaponVal.textContent = state.selectedWeapon.name;
        drawHudWeaponIcon(this.weaponIcon, state.selectedWeapon, 32);
        this.ammoVal.textContent = `${siege.shotsRemaining}/${siege.shotLimit}`;
        this.moveVal.textContent = `${Math.round(tank.movementFuel)} px`;
        this.moveVal.parentElement.classList.toggle('empty', tank.movementFuel <= 0);
        this.moveVal.parentElement.classList.toggle('available', state.phase === 'siegeAiming' && tank.movementFuel > 0);
        if (this.windVal) this.windVal.textContent = formatWind(state.wind);
        this.resultVal.textContent = state.lastResult;
        this.controlsHint.textContent = this._controlsText(state);
    }

    _updateSiegeMobileHud(tank, siege, state) {
        if (!tank || !siege) return;
        const selectedWeapon = state ? state.selectedWeapon : (tank.selectedWeapon ? tank.selectedWeapon() : null);
        this.mhudTurn.textContent = siege.victory ? 'WIN' : (siege.failure ? 'OUT' : 'P1');
        this.mhudTurn.style.background = siege.victory
            ? 'rgba(47, 158, 68, 0.86)'
            : (siege.failure ? 'rgba(145, 89, 193, 0.86)' : 'rgba(199, 82, 47, 0.86)');
        this.mhudP1Hp.textContent = String(Math.max(0, Math.round(tank.health)));
        const core = siege.objectiveHealth || { hp: 0, maxHp: 0 };
        this.mhudP2Hp.textContent = `Core ${Math.ceil(core.hp || 0)}`;
        if (this.mhudP1Shield) this.mhudP1Shield.textContent = '';
        if (this.mhudP2Shield) this.mhudP2Shield.textContent = '';
        if (selectedWeapon) {
            this.mhudWeapon.textContent = shortWeaponName(selectedWeapon);
            drawHudWeaponIcon(this.mhudWeaponIcon, selectedWeapon, 28);
        }
        this.mhudAngle.textContent = String(Math.round(tank.angle));
        this.mhudPower.textContent = String(Math.round(tank.power));
        this.mhudAmmo.textContent = `${siege.shotsRemaining}/${siege.shotLimit}`;
        if (this.mhudP1Inv) this.mhudP1Inv.textContent = `Shots ${siege.shotsRemaining}/${siege.shotLimit}`;
        if (this.mhudP2Inv) this.mhudP2Inv.textContent = `Core ${Math.ceil(core.hp || 0)}/${core.maxHp || 0}`;
        if (this.mhudRound) this.mhudRound.textContent = siege.levelId || 'siege_001';
        if (this.mhudResult) this.mhudResult.textContent = state && state.lastResult ? String(state.lastResult).slice(0, 60) : '--';
    }

    showWeaponToast(weapon, tank) {
        if (!this.weaponToast || !weapon || !tank) return;
        this.weaponToast.innerHTML = '';
        const icon = document.createElement('canvas');
        icon.width = 36;
        icon.height = 36;
        icon.className = 'weapon-toast-icon';
        drawHudWeaponIcon(icon, weapon, 36);

        const text = document.createElement('div');
        const title = document.createElement('strong');
        title.textContent = weapon.name;
        const detail = document.createElement('span');
        detail.textContent = `${weapon.shortDescription || weapon.description} · Ammo ${formatAmmo(tank.ammoFor(weapon.id))}`;
        text.appendChild(title);
        text.appendChild(detail);

        this.weaponToast.appendChild(icon);
        this.weaponToast.appendChild(text);
        this.weaponToast.classList.remove('hidden');
        window.clearTimeout(this.weaponToastTimer);
        this.weaponToastTimer = window.setTimeout(() => {
            this.weaponToast.classList.add('hidden');
        }, 1450);
    }

    _updateHealth(tank, bar, text, shieldRow, shieldFill, shieldText) {
        const percent = Math.max(0, Math.min(100, tank.health));
        bar.style.width = `${percent}%`;
        bar.style.background = healthColor(percent);
        text.textContent = `${tank.health}/100`;
        const shield = Math.round(clampShieldCharge(tank.shieldCharge));
        if (shieldRow) shieldRow.classList.toggle('empty', shield <= 0);
        if (shieldFill) shieldFill.style.width = `${Math.min(100, shield / MAX_SHIELD * 100)}%`;
        if (shieldText) shieldText.textContent = String(shield);
    }

    _turnText(state) {
        if (state.phase === 'roundSummary') return state.matchWinnerIndex !== null ? 'Match Complete' : 'Round Summary';
        if (state.phase === 'shop') return 'Shop';
        if (state.phase === 'handoff') return `${state.active ? state.active.name : 'Next Player'} - Pass Device`;
        if (state.gameOver) return 'Round Over';
        if (state.phase === 'projectile') return 'Shot In Flight';
        if (state.phase === 'resolving') return 'Resolving Impact';
        if (state.phase === 'cpuThinking') return `${state.active.name} Thinking`;
        return `${state.active.name}'s Turn`;
    }

    _controlsText(state) {
        if (state.gameMode === 'siege') {
            if (state.phase === 'siegeVictory' || state.phase === 'siegeFailure') return 'Use Replay or Main Menu.';
            if (state.phase !== 'siegeAiming') return 'Controls locked until the shot resolves.';
            return 'Keys: arrows aim, A/D move, Space fire, R restart, M mute, Esc menu. Touch controls are available on mobile.';
        }
        if (state.phase === 'handoff') return 'Press Enter or tap Start Turn to begin the next local turn. Inputs are locked.';
        if (state.phase === 'roundSummary' && state.matchWinnerIndex !== null) return 'Match complete. Use New Match or Main Menu.';
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
    const shield = Math.round(clampShieldCharge(entity.shieldCharge));
    const repairs = entity.repairKits || 0;
    const parachutes = entity.parachutes || 0;
    const parts = [];
    if (includeMoney) parts.push(context === 'hud' ? `$${money}` : `Money: $${money}`);
    const limited = WEAPONS.filter((candidate) => Number.isFinite(maxAmmoFor(candidate.id)));
    const hudWeapons = context === 'hud'
        ? limited.filter((weapon) => ammoForEntity(entity, weapon.id) > 0)
        : limited;
    const shownWeapons = context === 'hud' ? hudWeapons.slice(0, 5) : hudWeapons;
    for (const weapon of shownWeapons) {
        const have = ammoForEntity(entity, weapon.id);
        const label = context === 'hud' ? weapon.compactName : weapon.inventoryName;
        parts.push(context === 'hud'
            ? `${label} ${have}`
            : `${weapon.inventoryName}: ${have}/${maxAmmoFor(weapon.id)}`);
    }
    if (context === 'hud' && hudWeapons.length > shownWeapons.length) {
        parts.push(`+${hudWeapons.length - shownWeapons.length} wpn`);
    }
    parts.push(context === 'hud' ? `Shield ${shield}` : `Shield: ${shield}`);
    parts.push(context === 'hud' ? `Aid ${repairs}` : `First Aid: ${repairs}`);
    parts.push(context === 'hud' ? `Chute ${parachutes}` : `Parachutes: ${parachutes}`);
    if (context !== 'hud' && Number.isFinite(entity.health)) parts.push(`HP: ${Math.round(entity.health)}/100`);
    return parts.join(' | ');
}

function inventoryLines(entity) {
    const lines = [];
    for (const weapon of WEAPONS.filter((candidate) => Number.isFinite(maxAmmoFor(candidate.id)))) {
        lines.push(`${weapon.inventoryName}: ${ammoForEntity(entity, weapon.id)}/${maxAmmoFor(weapon.id)}`);
    }
    lines.push(`Shield: ${Math.round(clampShieldCharge(entity.shieldCharge))}`);
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

function createSiegeResultCard(label, value, { wide = false } = {}) {
    const card = document.createElement('section');
    card.className = 'summary-card siege-result-stat';
    if (wide) card.classList.add('wide');

    const h3 = document.createElement('h3');
    h3.textContent = label;
    card.appendChild(h3);

    const p = document.createElement('p');
    p.textContent = value;
    card.appendChild(p);

    return card;
}

function createLevelSelectPill(text) {
    const pill = document.createElement('span');
    pill.className = 'pill';
    pill.textContent = text;
    return pill;
}

function createLevelSelectButton(levelId, progress, { onSelect, unlocked }) {
    const level = getCastleSiegeLevel(levelId);
    const levelProgress = progress?.completedLevels?.[levelId] || null;
    const completed = Boolean(levelProgress?.completed);
    const bestStars = levelProgress?.bestStars || 0;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = `level-card${unlocked ? '' : ' locked'}${completed ? ' completed' : ''}`;
    button.disabled = !unlocked;
    button.dataset.levelId = levelId;
    if (unlocked && typeof onSelect === 'function') {
        button.addEventListener('click', () => onSelect(levelId));
    }

    const name = document.createElement('span');
    name.className = 'level-card-name';
    name.textContent = level.name;
    button.appendChild(name);

    const meta = document.createElement('span');
    meta.className = 'level-card-meta';
    meta.textContent = unlocked ? `${formatLevelNumber(levelId)} | ${level.shotLimit} shots` : 'Locked';
    button.appendChild(meta);

    const stars = document.createElement('span');
    stars.className = 'level-card-stars';
    stars.textContent = completed ? `Best ${bestStars}/3` : 'Stars 0/3';
    button.appendChild(stars);

    if (level.hint) {
        const hint = document.createElement('span');
        hint.className = 'level-card-hint';
        hint.textContent = level.hint;
        button.appendChild(hint);
    }

    return button;
}

function createLevelSelectNote(text) {
    const note = document.createElement('span');
    note.className = 'level-select-note';
    note.textContent = text;
    return note;
}

function createArmoryNote(text) {
    const note = document.createElement('span');
    note.className = 'armory-note';
    note.textContent = text;
    return note;
}

function createArmoryItemCard(item, coins, { onBuy }) {
    const card = document.createElement('article');
    card.className = 'armory-item-card';

    const iconWrap = document.createElement('div');
    iconWrap.className = 'shop-item-icon';
    const icon = document.createElement('canvas');
    icon.width = 48;
    icon.height = 48;
    const iconCtx = icon.getContext('2d');
    if (iconCtx && item.weapon) drawWeaponIcon(iconCtx, item.weapon, 24, 24, 42);
    iconWrap.appendChild(icon);
    card.appendChild(iconWrap);

    const body = document.createElement('div');
    body.className = 'armory-item-body';

    const title = document.createElement('h3');
    title.textContent = item.label;
    body.appendChild(title);

    const description = document.createElement('p');
    description.textContent = item.description;
    body.appendChild(description);

    const meta = document.createElement('p');
    meta.className = 'armory-item-meta';
    meta.textContent = `Stocked ${item.owned}/${item.maxCarry} | Next attempt +${item.amount} ${item.weapon.compactName || item.weapon.name}`;
    body.appendChild(meta);
    card.appendChild(body);

    const action = document.createElement('div');
    action.className = 'armory-item-action';

    const price = document.createElement('span');
    price.className = 'shop-item-price';
    price.textContent = `$${item.price}`;
    action.appendChild(price);

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'btn armory-buy';
    button.dataset.item = item.id;
    const atMax = item.owned >= item.maxCarry;
    const canAfford = coins >= item.price;
    button.disabled = atMax || !canAfford;
    button.textContent = atMax ? 'Stocked' : (canAfford ? 'Buy' : 'Need Coins');
    if (!button.disabled && typeof onBuy === 'function') {
        button.addEventListener('click', () => onBuy(item.id));
    }
    action.appendChild(button);
    card.appendChild(action);

    return card;
}

function formatLevelNumber(levelId) {
    const match = /_(\d+)$/.exec(String(levelId || ''));
    return match ? `Level ${Number(match[1])}` : String(levelId || 'Level');
}

function createShopItemCard(player, playerIndex, item) {
    const weapon = item.weaponId ? WEAPONS.find((candidate) => candidate.id === item.weaponId) : null;
    const full = isShopItemFull(player, item);
    const cantAfford = player.money < item.price;
    const disabled = full || cantAfford;
    const card = document.createElement('article');
    card.className = 'shop-item-card';
    if (full) card.classList.add('is-full');
    if (cantAfford && !full) card.classList.add('is-too-expensive');

    const iconWrap = document.createElement('div');
    iconWrap.className = 'shop-item-icon';
    const icon = document.createElement('canvas');
    icon.width = 48;
    icon.height = 48;
    const iconCtx = icon.getContext('2d');
    if (iconCtx && weapon) drawWeaponIcon(iconCtx, weapon, 24, 24, 42);
    else if (iconCtx) drawUtilityIcon(iconCtx, item.id, 24, 24, 42);
    iconWrap.appendChild(icon);
    card.appendChild(iconWrap);

    const body = document.createElement('div');
    body.className = 'shop-item-body';
    const name = document.createElement('h4');
    name.textContent = item.label;
    body.appendChild(name);

    if (weapon && weapon.category) {
        const category = document.createElement('p');
        category.className = 'shop-item-category';
        category.textContent = weapon.category;
        body.appendChild(category);
    }

    const description = document.createElement('p');
    description.className = 'shop-item-description';
    description.textContent = item.shortDescription || item.description || weapon?.shortDescription || weapon?.description || '';
    body.appendChild(description);

    const stats = document.createElement('p');
    stats.className = 'shop-item-stats';
    stats.textContent = shopStatLine(player, item, weapon);
    body.appendChild(stats);
    card.appendChild(body);

    const action = document.createElement('div');
    action.className = 'shop-item-action';
    const price = document.createElement('span');
    price.className = 'shop-item-price';
    price.textContent = `$${item.price}`;
    action.appendChild(price);

    const btn = document.createElement('button');
    btn.className = 'btn shop-buy';
    btn.dataset.player = String(playerIndex);
    btn.dataset.item = item.id;
    btn.disabled = disabled;
    if (full) btn.classList.add('full');
    if (full) {
        btn.textContent = 'Full';
    } else if (cantAfford) {
        btn.textContent = 'Too Expensive';
    } else if (item.weaponId) {
        btn.textContent = ammoForEntity(player, item.weaponId) > 0 ? 'Refill' : 'Buy';
    } else {
        btn.textContent = 'Buy';
    }
    action.appendChild(btn);
    card.appendChild(action);

    return card;
}

function shopStatLine(player, item, weapon) {
    if (weapon) {
        const have = ammoForEntity(player, weapon.id);
        const ammo = `Ammo: ${have}/${maxAmmoFor(weapon.id)}`;
        const tags = weapon.statTags || [];
        const filtered = tags.filter((tag) => !tag.startsWith('Ammo:'));
        return [...filtered.slice(0, 3), ammo].join(' | ');
    }
    if (item.id === 'shield') {
        const shield = Math.round(clampShieldCharge(player.shieldCharge));
        return shield >= MAX_SHIELD ? `Shield: Full (${MAX_SHIELD}/${MAX_SHIELD})` : `Owned shield: ${shield}/${MAX_SHIELD} | Price: $${item.price}`;
    }
    if (item.id === 'repair') {
        return `Owned: ${player.repairKits || 0} | Heal: Full | Price: $${item.price}`;
    }
    if (item.id === 'parachute') {
        return `Owned: ${player.parachutes || 0} | Fall protection | Price: $${item.price}`;
    }
    return `Price: $${item.price}`;
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
        return clampShieldCharge(player.shieldCharge) >= MAX_SHIELD;
    }
    return false;
}

function drawHudWeaponIcon(canvas, weapon, size) {
    if (!canvas || !weapon) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const width = canvas.width || size;
    const height = canvas.height || size;
    ctx.clearRect(0, 0, width, height);
    drawWeaponIcon(ctx, weapon, width / 2, height / 2, size);
}

function inventoryAmmoText(inventory) {
    if (!inventory || !inventory.ammo) return 'No limited ammo data.';
    return WEAPONS
        .filter((weapon) => Number.isFinite(maxAmmoFor(weapon.id)))
        .map((weapon) => `${weapon.compactName} ${inventory.ammo[weapon.id] ?? 0}/${maxAmmoFor(weapon.id)}`)
        .join(' | ');
}

function inventoryUtilityText(inventory) {
    if (!inventory) return 'No item data.';
    return `Shield ${Math.round(clampShieldCharge(inventory.shieldCharge))} | First Aid ${inventory.repairKits || 0} | Parachutes ${inventory.parachutes || 0} | HP ${Math.round(inventory.health || 0)}/100`;
}

function formatShieldCompact(tank) {
    const shield = Math.round(clampShieldCharge(tank.shieldCharge));
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
    const ownedWeapons = WEAPONS
        .filter((candidate) => Number.isFinite(maxAmmoFor(candidate.id)))
        .filter((weapon) => ammoForEntity(tank, weapon.id) > 0);
    for (const weapon of ownedWeapons.slice(0, 4)) {
        parts.push(`${weapon.compactName} ${ammoForEntity(tank, weapon.id)}`);
    }
    if (ownedWeapons.length > 4) parts.push(`+${ownedWeapons.length - 4} wpn`);
    parts.push(`Shield ${Math.round(clampShieldCharge(tank.shieldCharge))}`);
    parts.push(`Aid ${tank.repairKits || 0}`);
    parts.push(`Chute ${tank.parachutes || 0}`);
    return parts.join(' | ');
}

function formatAmmo(ammo) {
    return Number.isFinite(ammo) ? String(ammo) : 'Unlimited';
}

function formatWind(wind) {
    if (!Number.isFinite(wind) || wind === 0) return '0 calm';
    return `${Math.abs(wind).toFixed(1)} ${wind > 0 ? 'right' : 'left'}`;
}

function healthColor(hp) {
    if (hp > 60) return 'linear-gradient(90deg, #2f9e44, #69db7c)';
    if (hp > 30) return 'linear-gradient(90deg, #f08c00, #ffd43b)';
    return 'linear-gradient(90deg, #c92a2a, #ff6b6b)';
}

function turnLabelColor(currentPlayer, state) {
    if (currentPlayer === 0) return '#f06b45';
    // Visually distinguish CPU from Player 2 for player identity clarity.
    if (state && state.gameMode === 'cpu') return '#9159c1';
    return '#2d75c7';
}

export function weaponListText(tank) {
    return WEAPONS
        .map((weapon) => `${weapon.name}: ${formatAmmo(tank.ammoFor(weapon.id))}`)
        .join(' | ');
}
