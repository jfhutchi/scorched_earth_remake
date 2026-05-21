import { Game } from './game.js';
import { UI } from './ui.js';
import { CONFIG, GAME_VERSION, WEAPONS } from './config.js';
import { initTouchInput, updateTouchControlsState } from './touchInput.js';

const canvas = document.getElementById('gameCanvas');
canvas.width = CONFIG.canvas.width;
canvas.height = CONFIG.canvas.height;

const ui = new UI();
const game = new Game(canvas, ui);
const smallWarning = document.getElementById('smallWarning');
const orientationHint = document.getElementById('orientationHint');
const touchContainer = document.getElementById('touchControls');
const rotateOverlay = document.getElementById('rotateOverlay');
const rotateContinueBtn = document.getElementById('rotateContinueBtn');
const rotateMenuBtn = document.getElementById('rotateMenuBtn');
const mhudInfoBtn = document.getElementById('mhudInfoBtn');
const mhudExtra = document.getElementById('mhudExtra');
const fullscreenBtn = document.getElementById('fullscreenBtn');
const pwaHint = document.getElementById('pwaHint');
const pwaHintText = document.getElementById('pwaHintText');
const pwaHintDismissBtn = document.getElementById('pwaHintDismissBtn');

const MOBILE_BREAKPOINT = 768;
const PWA_HINT_DISMISSED_KEY = 'crater-command-pwa-hint-dismissed';

function isPhoneViewport() {
    return window.innerWidth < MOBILE_BREAKPOINT;
}

function isCoarsePointer() {
    return window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
}

function isPortrait() {
    return window.innerHeight > window.innerWidth;
}

function visualViewportSize() {
    return {
        width: Math.min(window.innerWidth, window.visualViewport ? window.visualViewport.width : window.innerWidth),
        height: Math.min(window.innerHeight, window.visualViewport ? window.visualViewport.height : window.innerHeight),
    };
}

function updateAppHeight() {
    const height = visualViewportSize().height;
    document.documentElement.style.setProperty('--app-height', `${Math.max(320, Math.round(height))}px`);
}

function isStandaloneDisplay() {
    return Boolean(
        window.navigator.standalone === true
        || (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches)
        || (window.matchMedia && window.matchMedia('(display-mode: fullscreen)').matches)
    );
}

function isLikelyIphoneSafari() {
    const ua = navigator.userAgent || '';
    const isiPhone = /iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1 && window.innerWidth < 900);
    const webkit = /WebKit/.test(ua);
    const nonSafariShell = /CriOS|FxiOS|EdgiOS/.test(ua);
    return isiPhone && webkit && !nonSafariShell;
}

function updatePwaHint() {
    document.body.classList.toggle('is-standalone', isStandaloneDisplay());
    if (!pwaHint || !pwaHintText) return;
    const dismissed = localStorage.getItem(PWA_HINT_DISMISSED_KEY) === 'true';
    const shouldHide = dismissed || isStandaloneDisplay();
    pwaHint.classList.toggle('hidden', shouldHide);
    if (shouldHide) return;

    pwaHintText.textContent = isLikelyIphoneSafari()
        ? 'For the best fullscreen experience on iPhone, tap Share -> Add to Home Screen, then launch Crater Command from the home screen.'
        : 'Use Try Fullscreen for supported browsers, or install Crater Command to your home screen for a more app-like layout.';
}

// State the user toggles when choosing "Continue Anyway" from the rotate
// overlay, so we don't keep showing it for the rest of the match.
let allowPortraitPlay = false;

function applyEnvClasses() {
    const body = document.body;
    const onGameScreen = !ui.menu.classList.contains('hidden') ? false
        : !ui.game.classList.contains('hidden');
    const phone = isPhoneViewport() || (isCoarsePointer() && Math.min(window.innerWidth, window.innerHeight) < 820);
    const mobileGame = phone && onGameScreen;

    body.classList.toggle('is-phone', phone);
    body.classList.toggle('is-mobile-game', mobileGame);
    body.classList.toggle('is-portrait', isPortrait());
    body.classList.toggle('is-landscape', !isPortrait());
    body.classList.toggle('allow-portrait', allowPortraitPlay);

    if (rotateOverlay) {
        const showRotate = mobileGame && isPortrait() && !allowPortraitPlay;
        rotateOverlay.classList.toggle('hidden', !showRotate);
    }

    const mobileHud = document.getElementById('mobileHud');
    if (mobileHud) {
        mobileHud.setAttribute('aria-hidden', mobileGame ? 'false' : 'true');
    }

    // Small landscape-recommend chip: only show in mobile-game landscape if the
    // user explicitly chose to continue in portrait but then rotated back, or
    // when the viewport is very narrow landscape. Keep it tiny and out of the
    // way; it must not block HUD pills.
    if (orientationHint) {
        const showHint = mobileGame && !isPortrait() && window.innerHeight < 360;
        orientationHint.classList.toggle('hidden', !showHint);
    }
}

function fitCanvas() {
    const onGameScreen = ui.game && !ui.game.classList.contains('hidden');
    const phone = isPhoneViewport() || (isCoarsePointer() && Math.min(window.innerWidth, window.innerHeight) < 820);
    const mobileGame = phone && onGameScreen;

    const { width: viewW, height: viewH } = visualViewportSize();

    let availableWidth, availableHeight;

    if (mobileGame) {
        if (isPortrait()) {
            // Phone portrait (only reached when user dismissed rotate overlay).
            // Reserve enough room for compact HUD on top and bottom controls.
            availableWidth = viewW - 6;
            availableHeight = viewH - 48 /* HUD */ - 110 /* controls */;
        } else {
            // PHONE LANDSCAPE — landscape-first layout.
            // Touch clusters live in the SIDE margins (left/right corners) and
            // the utility row in the top-right corner. They are absolutely
            // positioned and translucent, so the canvas can claim nearly the
            // full viewport height; horizontal margins around the centered
            // 16:9 canvas naturally house the side clusters.
            availableWidth = viewW - 6;
            availableHeight = viewH - 6;
        }
    } else {
        const margin = 24;
        const baseReserve = viewH < 700 ? 8 : 0;
        availableWidth = viewW - margin;
        availableHeight = viewH - margin - baseReserve;
    }

    const scale = Math.min(
        availableWidth / CONFIG.canvas.width,
        availableHeight / CONFIG.canvas.height,
        1,
    );
    const targetW = Math.max(160, Math.floor(CONFIG.canvas.width * scale));
    const targetH = Math.max(90, Math.floor(CONFIG.canvas.height * scale));
    canvas.style.width = `${targetW}px`;
    canvas.style.height = `${targetH}px`;
    canvas.style.marginTop = '';

    // Desktop-only "small window" hint.
    if (smallWarning) {
        smallWarning.classList.toggle('hidden', mobileGame || scale >= 0.42);
    }
}

function refreshTouchControls() {
    updateTouchControlsState(game, touchContainer);
}

function refreshLayout() {
    updateAppHeight();
    applyEnvClasses();
    fitCanvas();
    refreshTouchControls();
    updatePwaHint();
    if (typeof ui.updateMobileHud === 'function') ui.updateMobileHud(game);
}

window.addEventListener('resize', refreshLayout);
window.addEventListener('orientationchange', refreshLayout);
if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', refreshLayout);
    window.visualViewport.addEventListener('scroll', refreshLayout);
}

// Wrap UI updates so the compact mobile HUD stays in sync with the desktop one.
const originalUiUpdate = ui.update.bind(ui);
ui.update = (state) => {
    originalUiUpdate(state);
    refreshTouchControls();
    if (typeof ui.updateMobileHud === 'function') ui.updateMobileHud(game, state);
};

const originalShowMenu = ui.showMenu.bind(ui);
ui.showMenu = () => {
    originalShowMenu();
    if (touchContainer) touchContainer.classList.add('hidden');
    if (orientationHint) orientationHint.classList.add('hidden');
    if (rotateOverlay) rotateOverlay.classList.add('hidden');
    allowPortraitPlay = false;
    refreshLayout();
};

const originalShowGame = ui.showGame.bind(ui);
ui.showGame = () => {
    originalShowGame();
    refreshLayout();
};

function tryFullscreen({ quiet = true } = {}) {
    // Best-effort fullscreen. iPhone Safari does not guarantee true fullscreen
    // in a normal tab, so rejected attempts only update the install guidance.
    const target = document.documentElement;
    if (!target || typeof target.requestFullscreen !== 'function') {
        if (!quiet) updatePwaHint();
        return Promise.resolve(false);
    }
    let request = null;
    try {
        request = target.requestFullscreen({ navigationUI: 'hide' });
    } catch (_err) {
        if (!quiet) updatePwaHint();
        return Promise.resolve(false);
    }
    // Best-effort orientation lock; ignore failures.
    if (window.screen && window.screen.orientation && typeof window.screen.orientation.lock === 'function') {
        try {
            const p = window.screen.orientation.lock('landscape');
            if (p && typeof p.catch === 'function') p.catch(() => {});
        } catch (_err) {
            /* ignore */
        }
    }
    if (request && typeof request.then === 'function') {
        return request
            .then(() => {
                refreshLayout();
                return true;
            })
            .catch(() => {
                if (!quiet) updatePwaHint();
                return false;
            });
    }
    refreshLayout();
    return Promise.resolve(true);
}

function startMatch(mode) {
    ui.showGame();
    game.audio.playStartMatch();
    game.start(mode, ui.getSettings());
}

if (ui.campaignBtn) {
    ui.campaignBtn.addEventListener('click', (e) => {
        e.currentTarget.blur();
        if (isPhoneViewport() || isCoarsePointer()) tryFullscreen({ quiet: true });
        startMatch('siege');
    });
}

ui.twoPlayerBtn.addEventListener('click', (e) => {
    e.currentTarget.blur();
    startMatch('two-player');
});

ui.cpuBtn.addEventListener('click', (e) => {
    e.currentTarget.blur();
    startMatch('cpu');
});

if (fullscreenBtn) {
    fullscreenBtn.addEventListener('click', (e) => {
        e.currentTarget.blur();
        tryFullscreen({ quiet: false });
    });
}

if (pwaHintDismissBtn && pwaHint) {
    pwaHintDismissBtn.addEventListener('click', (e) => {
        e.currentTarget.blur();
        localStorage.setItem(PWA_HINT_DISMISSED_KEY, 'true');
        pwaHint.classList.add('hidden');
    });
}

if (rotateContinueBtn) {
    rotateContinueBtn.addEventListener('click', (e) => {
        e.currentTarget.blur();
        allowPortraitPlay = true;
        refreshLayout();
    });
}
if (rotateMenuBtn) {
    rotateMenuBtn.addEventListener('click', (e) => {
        e.currentTarget.blur();
        game.returnToMenu();
    });
}

if (mhudInfoBtn && mhudExtra) {
    mhudInfoBtn.addEventListener('click', (e) => {
        e.currentTarget.blur();
        mhudExtra.classList.toggle('hidden');
    });
}

if (ui.handoffStartBtn) {
    ui.handoffStartBtn.addEventListener('click', (e) => {
        e.currentTarget.blur();
        game.acknowledgeHandoff();
    });
}

ui.continueShopBtn.addEventListener('click', (e) => {
    e.currentTarget.blur();
    game.audio.playContinue();
    game.openShop();
});

ui.startNextRoundBtn.addEventListener('click', (e) => {
    e.currentTarget.blur();
    game.audio.playContinue();
    game.startNextRoundFromShop();
});

ui.summaryNewMatchBtn.addEventListener('click', (e) => {
    e.currentTarget.blur();
    game.audio.playStartMatch();
    game.startNewMatch(game.gameMode, ui.getSettings());
});

ui.shopNewMatchBtn.addEventListener('click', (e) => {
    e.currentTarget.blur();
    game.audio.playStartMatch();
    game.startNewMatch(game.gameMode, ui.getSettings());
});

ui.summaryMenuBtn.addEventListener('click', (e) => {
    e.currentTarget.blur();
    game.audio.playUiClick();
    game.returnToMenu();
});

ui.shopMenuBtn.addEventListener('click', (e) => {
    e.currentTarget.blur();
    game.audio.playUiClick();
    game.returnToMenu();
});

if (ui.siegeReplayBtn) {
    ui.siegeReplayBtn.addEventListener('click', (e) => {
        e.currentTarget.blur();
        game.audio.playStartMatch();
        game.restartCastleSiegeLevel();
    });
}

if (ui.siegeMenuBtn) {
    ui.siegeMenuBtn.addEventListener('click', (e) => {
        e.currentTarget.blur();
        game.audio.playUiClick();
        game.returnToMenu();
    });
}

ui.muteBtn.addEventListener('click', (e) => {
    e.currentTarget.blur();
    game.toggleMute();
});

ui.menuMuteBtn.addEventListener('click', (e) => {
    e.currentTarget.blur();
    game.toggleMute();
});

if (ui.helpBtn) {
    ui.helpBtn.addEventListener('click', (e) => {
        e.currentTarget.blur();
        game.audio.playUiClick();
        ui.showHelp();
    });
}

if (ui.helpCloseBtn) {
    ui.helpCloseBtn.addEventListener('click', (e) => {
        e.currentTarget.blur();
        game.audio.playUiClick();
        ui.hideHelp();
    });
}

ui.shopContent.addEventListener('click', (e) => {
    const button = e.target.closest('button[data-player][data-item]');
    if (!button) return;
    button.blur();
    const playerIndex = Number(button.dataset.player);
    const itemId = button.dataset.item;
    game.buyShopItem(playerIndex, itemId);
});

initTouchInput(game, touchContainer);

// Suppress page-level pinch zoom and accidental gesture scrolls during play.
document.addEventListener('gesturestart', (e) => e.preventDefault());
document.addEventListener('touchmove', (e) => {
    if (!ui.menu || ui.menu.classList.contains('hidden')) {
        // Game screen: allow scroll only inside overlays so the shop/summary
        // remain usable on small screens.
        const scrollableContent = e.target && e.target.closest('.overlay-card, .debug-panel, .menu-card');
        if (!scrollableContent) e.preventDefault();
    }
}, { passive: false });

window.render_game_to_text = () => game.renderTextState();
window.advanceTime = (ms) => game.advanceTime(ms);

const debugAllowed = CONFIG.debug || new URLSearchParams(window.location.search).get('debug') === '1';
window.DEBUG_MODE = debugAllowed;

if (debugAllowed) {
    window.debugGameState = () => game.debugState();
    window.debugWeapons = () => game.debugWeapons();
    window.testWeaponCatalog = () => game.testWeaponCatalog();
    window.testWeaponImpact = (weaponId) => game.testWeaponImpact(weaponId);
    window.testWeaponReach = () => game.testWeaponReach();
    window.setupWeaponTest = (weaponId) => {
        const result = game.setupWeaponTest(weaponId);
        refreshLayout();
        return result;
    };
    window.setupAimTest = () => {
        const result = game.setupAimTest();
        refreshLayout();
        return result;
    };
    window.forceRoundWin = (playerIndex) => game.forceRoundWin(playerIndex);
    window.testParachuteDrop = () => game.testParachuteDrop();
    // v0.6.10 turn/movement/state helpers for future multiplayer testing.
    window.debugTurnState = () => game.getDebugTurnState();
    window.debugMovementState = () => game.getDebugMovementState();
    window.exportDebugGameState = () => game.exportDebugGameState();
    window.debugGrantMoney = (amount, playerId = 'active') => game.debugGrantMoney(amount, playerId);
    window.debugSetMoney = (amount, playerId = 'active') => game.debugGrantMoney(amount, playerId, { set: true });
    window.debugRefillWeapons = (playerId = 'active') => game.debugRefillWeapons(playerId);
    window.debugRefillWeapon = (weaponId, playerId = 'active') => game.debugRefillWeapon(weaponId, playerId);
    window.debugRefillUtilities = (playerId = 'active', utility = 'all') => game.debugRefillUtilities(playerId, utility);
    window.debugHeal = (playerId = 'active') => game.debugHeal(playerId);
    window.debugDamageActiveEnemy = (amount, options = {}) => game.debugDamageActiveEnemy(amount, options);
    window.debugClearShields = () => game.debugClearShields();
    window.debugAddShield = (playerId = 'active') => game.debugAddShield(playerId);
    window.debugSetWind = (value) => game.debugSetWind(value);
    window.debugGiveAllTestingSupplies = (playerId = 'all') => game.debugGiveAllTestingSupplies(playerId);
    window.debugSetupFlatTerrain = () => game.debugSetupFlatTerrain();
    window.debugEndTurn = () => game.debugEndTurn();
    window.debugForceRoundWin = (playerIndex = 0) => game.forceRoundWin(playerIndex);
    window.debugForceMatchWin = (playerIndex = 0) => game.debugForceMatchWin(playerIndex);
    window.debugSetupWeaponTest = (weaponId = 'standard') => {
        const result = game.setupWeaponTest(weaponId);
        refreshLayout();
        return result;
    };
    window.enableDebugMode = () => {
        window.DEBUG_MODE = true;
        return true;
    };
    window.disableDebugMode = () => {
        window.DEBUG_MODE = false;
        const panel = document.getElementById('debugPanel');
        if (panel) panel.classList.add('hidden');
        return true;
    };
}

window.GAME_VERSION = GAME_VERSION;

installDebugShortcut();
if (debugAllowed) installDebugPanel();
refreshLayout();
ui.showMenu();

function installDebugShortcut() {
    window.addEventListener('keydown', (e) => {
        if (!(e.ctrlKey && e.shiftKey && e.code === 'KeyD') || e.repeat) return;
        e.preventDefault();
        if (!debugAllowed || window.DEBUG_MODE === false) {
            showDebugNotice('Debug mode requires ?debug=1');
            return;
        }
        const panel = document.getElementById('debugPanel');
        if (!panel) return;
        panel.classList.toggle('hidden');
    });
}

function showDebugNotice(message) {
    let notice = document.getElementById('debugNotice');
    if (!notice) {
        notice = document.createElement('div');
        notice.id = 'debugNotice';
        notice.className = 'debug-notice hidden';
        document.body.appendChild(notice);
    }
    notice.textContent = message;
    notice.classList.remove('hidden');
    window.clearTimeout(showDebugNotice.timer);
    showDebugNotice.timer = window.setTimeout(() => notice.classList.add('hidden'), 1800);
}

function installDebugPanel() {
    const panel = document.createElement('aside');
    panel.id = 'debugPanel';
    panel.className = 'debug-panel hidden';
    panel.setAttribute('aria-label', 'Developer debug panel');

    const weaponOptions = WEAPONS.map((weapon) => `<option value="${weapon.id}">${weapon.name}</option>`).join('');
    panel.innerHTML = `
        <div class="debug-panel-head">
            <strong>Debug Tools</strong>
            <button type="button" class="debug-collapse" data-debug-action="collapse" aria-label="Collapse debug panel">-</button>
        </div>
        <div class="debug-panel-body">
            <label class="debug-select-label">Weapon
                <select id="debugWeaponSelect">${weaponOptions}</select>
            </label>
            <section>
                <h2>Money</h2>
                <button data-debug-action="money100">+$100 Active</button>
                <button data-debug-action="money500">+$500 Active</button>
                <button data-debug-action="money9999">Active $9999</button>
                <button data-debug-action="p1money9999">P1 $9999</button>
                <button data-debug-action="p2money9999">P2/CPU $9999</button>
            </section>
            <section>
                <h2>Weapons</h2>
                <button data-debug-action="refillActiveWeapons">All Active</button>
                <button data-debug-action="refillP1Weapons">All P1</button>
                <button data-debug-action="refillP2Weapons">All P2/CPU</button>
                <button data-debug-action="refillSelectedWeapon">Selected</button>
                <button data-debug-action="maxLimitedAmmo">Max Limited Ammo</button>
            </section>
            <section>
                <h2>Utilities</h2>
                <button data-debug-action="refillShield">Shield</button>
                <button data-debug-action="refillRepair">First Aid</button>
                <button data-debug-action="refillParachute">Parachute</button>
                <button data-debug-action="refillAllUtilities">All Utilities</button>
            </section>
            <section>
                <h2>Tank State</h2>
                <button data-debug-action="healActive">Heal Active</button>
                <button data-debug-action="healAll">Heal All</button>
                <button data-debug-action="damage25">Damage Enemy 25</button>
                <button data-debug-action="damage75">Damage Enemy 75</button>
                <button data-debug-action="destroyEnemy">Destroy Enemy</button>
                <button data-debug-action="clearShields">Clear Shields</button>
                <button data-debug-action="addShield">Add Shield</button>
            </section>
            <section>
                <h2>Test Setup</h2>
                <button data-debug-action="wind0">Wind 0</button>
                <button data-debug-action="windLeft">Wind Light Left</button>
                <button data-debug-action="windRight">Wind Light Right</button>
                <button data-debug-action="weaponTest">Weapon Test Range</button>
                <button data-debug-action="parachuteTest">Parachute/Fall Test</button>
                <button data-debug-action="flatTerrain">Flat Terrain</button>
                <button data-debug-action="giveAll">All Supplies</button>
            </section>
            <section>
                <h2>Flow</h2>
                <button data-debug-action="endTurn">End Turn</button>
                <button data-debug-action="p1Round">P1 Round Win</button>
                <button data-debug-action="p2Round">P2/CPU Round Win</button>
                <button data-debug-action="p1Match">P1 Match Win</button>
                <button data-debug-action="p2Match">P2/CPU Match Win</button>
                <button data-debug-action="menu">Main Menu</button>
            </section>
            <p id="debugPanelStatus" class="debug-panel-status">Ctrl+Shift+D toggles this panel.</p>
        </div>
    `;

    document.body.appendChild(panel);
    panel.addEventListener('click', (e) => {
        const button = e.target.closest('button[data-debug-action]');
        if (!button) return;
        e.preventDefault();
        button.blur();
        runDebugAction(button.dataset.debugAction);
    });
}

function runDebugAction(action) {
    const weaponSelect = document.getElementById('debugWeaponSelect');
    const selectedWeapon = weaponSelect ? weaponSelect.value : 'standard';
    const handlers = {
        collapse: () => document.getElementById('debugPanel')?.classList.add('hidden') || { ok: true, message: 'Debug panel collapsed.' },
        money100: () => game.debugGrantMoney(100, 'active'),
        money500: () => game.debugGrantMoney(500, 'active'),
        money9999: () => game.debugGrantMoney(9999, 'active', { set: true }),
        p1money9999: () => game.debugGrantMoney(9999, 0, { set: true }),
        p2money9999: () => game.debugGrantMoney(9999, 1, { set: true }),
        refillActiveWeapons: () => game.debugRefillWeapons('active'),
        refillP1Weapons: () => game.debugRefillWeapons(0),
        refillP2Weapons: () => game.debugRefillWeapons(1),
        refillSelectedWeapon: () => game.debugRefillWeapon(selectedWeapon, 'active'),
        maxLimitedAmmo: () => game.debugRefillWeapons('active'),
        refillShield: () => game.debugRefillUtilities('active', 'shield'),
        refillRepair: () => game.debugRefillUtilities('active', 'repair'),
        refillParachute: () => game.debugRefillUtilities('active', 'parachute'),
        refillAllUtilities: () => game.debugRefillUtilities('active', 'all'),
        healActive: () => game.debugHeal('active'),
        healAll: () => game.debugHeal('all'),
        damage25: () => game.debugDamageActiveEnemy(25),
        damage75: () => game.debugDamageActiveEnemy(75),
        destroyEnemy: () => game.debugDamageActiveEnemy(0, { destroy: true }),
        clearShields: () => game.debugClearShields(),
        addShield: () => game.debugAddShield('active'),
        wind0: () => game.debugSetWind(0),
        windLeft: () => game.debugSetWind(-1),
        windRight: () => game.debugSetWind(1),
        weaponTest: () => game.setupWeaponTest(selectedWeapon),
        parachuteTest: () => game.testParachuteDrop(),
        flatTerrain: () => game.debugSetupFlatTerrain(),
        giveAll: () => game.debugGiveAllTestingSupplies('all'),
        endTurn: () => game.debugEndTurn(),
        p1Round: () => game.forceRoundWin(0),
        p2Round: () => game.forceRoundWin(1),
        p1Match: () => game.debugForceMatchWin(0),
        p2Match: () => game.debugForceMatchWin(1),
        menu: () => {
            game.returnToMenu();
            return { ok: true, message: 'Returned to main menu.' };
        },
    };
    const result = handlers[action] ? handlers[action]() : { ok: false, message: `Unknown debug action: ${action}` };
    const status = document.getElementById('debugPanelStatus');
    if (status) status.textContent = result?.message || (result?.ok ? 'Debug action complete.' : 'Debug action failed.');
    refreshLayout();
}
