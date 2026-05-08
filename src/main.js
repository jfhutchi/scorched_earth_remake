import { Game } from './game.js';
import { UI } from './ui.js';
import { CONFIG, GAME_VERSION } from './config.js';
import { initTouchInput, updateTouchControlsState } from './touchInput.js';

const canvas = document.getElementById('gameCanvas');
canvas.width = CONFIG.canvas.width;
canvas.height = CONFIG.canvas.height;

const ui = new UI();
const game = new Game(canvas, ui);
const smallWarning = document.getElementById('smallWarning');
const orientationHint = document.getElementById('orientationHint');
const touchContainer = document.getElementById('touchControls');
const mobilePlayBtn = document.getElementById('mobilePlayBtn');
const rotateOverlay = document.getElementById('rotateOverlay');
const rotateContinueBtn = document.getElementById('rotateContinueBtn');
const rotateMenuBtn = document.getElementById('rotateMenuBtn');
const mhudInfoBtn = document.getElementById('mhudInfoBtn');
const mhudExtra = document.getElementById('mhudExtra');

const MOBILE_BREAKPOINT = 768;

function isPhoneViewport() {
    return window.innerWidth < MOBILE_BREAKPOINT;
}

function isCoarsePointer() {
    return window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
}

function isPortrait() {
    return window.innerHeight > window.innerWidth;
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

    // Use the smaller of dvh/svh/innerHeight to avoid sliding under the URL bar
    // on iOS Safari when it expands.
    const viewH = Math.min(
        window.innerHeight,
        window.visualViewport ? window.visualViewport.height : window.innerHeight,
    );
    const viewW = Math.min(
        window.innerWidth,
        window.visualViewport ? window.visualViewport.width : window.innerWidth,
    );

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
    applyEnvClasses();
    fitCanvas();
    refreshTouchControls();
    if (typeof ui.updateMobileHud === 'function') ui.updateMobileHud(game);
}

window.addEventListener('resize', refreshLayout);
window.addEventListener('orientationchange', refreshLayout);
if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', refreshLayout);
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

function tryFullscreen() {
    // Best-effort fullscreen on phone Play. Fail silently on desktop or when
    // denied. This is run from a user-gesture handler, so it will not be
    // immediately rejected by the browser.
    const target = document.documentElement;
    if (!target || typeof target.requestFullscreen !== 'function') return;
    try {
        const p = target.requestFullscreen({ navigationUI: 'hide' });
        if (p && typeof p.catch === 'function') p.catch(() => {});
    } catch (_err) {
        /* ignore */
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
}

function startMatch(mode) {
    ui.showGame();
    game.audio.playMenu();
    game.start(mode, ui.getSettings());
}

ui.twoPlayerBtn.addEventListener('click', (e) => {
    e.currentTarget.blur();
    startMatch('two-player');
});

ui.cpuBtn.addEventListener('click', (e) => {
    e.currentTarget.blur();
    startMatch('cpu');
});

if (mobilePlayBtn) {
    mobilePlayBtn.addEventListener('click', (e) => {
        e.currentTarget.blur();
        // On phones, attempt fullscreen + landscape lock as a best-effort
        // before starting Single Player vs CPU. Both are wrapped in try/catch
        // so failure cannot break gameplay.
        if (isPhoneViewport() || isCoarsePointer()) tryFullscreen();
        startMatch('cpu');
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

ui.continueShopBtn.addEventListener('click', (e) => {
    e.currentTarget.blur();
    game.audio.playMenu();
    game.openShop();
});

ui.startNextRoundBtn.addEventListener('click', (e) => {
    e.currentTarget.blur();
    game.audio.playMenu();
    game.startNextRoundFromShop();
});

ui.summaryNewMatchBtn.addEventListener('click', (e) => {
    e.currentTarget.blur();
    game.audio.playMenu();
    game.startNewMatch(game.gameMode, ui.getSettings());
});

ui.shopNewMatchBtn.addEventListener('click', (e) => {
    e.currentTarget.blur();
    game.audio.playMenu();
    game.startNewMatch(game.gameMode, ui.getSettings());
});

ui.summaryMenuBtn.addEventListener('click', (e) => {
    e.currentTarget.blur();
    game.audio.playMenu();
    game.returnToMenu();
});

ui.shopMenuBtn.addEventListener('click', (e) => {
    e.currentTarget.blur();
    game.audio.playMenu();
    game.returnToMenu();
});

ui.muteBtn.addEventListener('click', (e) => {
    e.currentTarget.blur();
    game.toggleMute();
});

ui.menuMuteBtn.addEventListener('click', (e) => {
    e.currentTarget.blur();
    game.toggleMute();
});

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
        const overlayContent = e.target && e.target.closest('.overlay-card');
        if (!overlayContent) e.preventDefault();
    }
}, { passive: false });

refreshLayout();

window.render_game_to_text = () => game.renderTextState();
window.advanceTime = (ms) => game.advanceTime(ms);

const debugEnabled = CONFIG.debug || new URLSearchParams(window.location.search).has('debug');
if (debugEnabled) {
    window.debugGameState = () => game.debugState();
    window.testWeaponImpact = (weaponId) => game.testWeaponImpact(weaponId);
    window.forceRoundWin = (playerIndex) => game.forceRoundWin(playerIndex);
}

window.GAME_VERSION = GAME_VERSION;

ui.showMenu();
