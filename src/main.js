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
        // On phones, Play always starts Single Player vs CPU since shared
        // local two-player play does not work on a single small touchscreen.
        startMatch('cpu');
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

const ORIGINAL_HUD_RESERVE_THRESHOLD = 700;
const TOUCH_HUD_RESERVE = 130;
const MOBILE_BREAKPOINT = 768;

function isPhoneViewport() {
    return window.innerWidth < MOBILE_BREAKPOINT;
}

function fitCanvas() {
    const margin = isPhoneViewport() ? 8 : 24;
    const baseReserve = window.innerHeight < ORIGINAL_HUD_RESERVE_THRESHOLD ? 8 : 0;
    // Reserve vertical room for the on-screen control pad on phone-sized
    // viewports so the canvas does not slide under the buttons.
    const touchReserve = isPhoneViewport() ? TOUCH_HUD_RESERVE : 0;
    const availableWidth = window.innerWidth - margin;
    const availableHeight = window.innerHeight - margin - baseReserve - touchReserve;
    const scale = Math.min(
        availableWidth / CONFIG.canvas.width,
        availableHeight / CONFIG.canvas.height,
        1
    );

    canvas.style.width = `${Math.max(160, Math.floor(CONFIG.canvas.width * scale))}px`;
    canvas.style.height = `${Math.max(90, Math.floor(CONFIG.canvas.height * scale))}px`;
    smallWarning.classList.toggle('hidden', scale >= 0.42);

    const isPhonePortrait = isPhoneViewport() && window.innerHeight > window.innerWidth;
    if (orientationHint) {
        orientationHint.classList.toggle('hidden', !isPhonePortrait || ui.menu.classList.contains('hidden') === false);
    }
}

function refreshTouchControls() {
    updateTouchControlsState(game, touchContainer);
}

window.addEventListener('resize', () => {
    fitCanvas();
    refreshTouchControls();
});
window.addEventListener('orientationchange', () => {
    fitCanvas();
    refreshTouchControls();
});

// Wrap the UI update so we can refresh the touch-control disabled state
// alongside the rest of the HUD without modifying the UI class internals.
const originalUiUpdate = ui.update.bind(ui);
ui.update = (state) => {
    originalUiUpdate(state);
    refreshTouchControls();
};

const originalShowMenu = ui.showMenu.bind(ui);
ui.showMenu = () => {
    originalShowMenu();
    if (touchContainer) touchContainer.classList.add('hidden');
    if (orientationHint) orientationHint.classList.add('hidden');
};

const originalShowGame = ui.showGame.bind(ui);
ui.showGame = () => {
    originalShowGame();
    refreshTouchControls();
    fitCanvas();
};

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

fitCanvas();

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
