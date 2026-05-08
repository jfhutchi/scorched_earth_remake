import { Game } from './game.js';
import { UI } from './ui.js';
import { CONFIG, GAME_VERSION } from './config.js';

const canvas = document.getElementById('gameCanvas');
canvas.width = CONFIG.canvas.width;
canvas.height = CONFIG.canvas.height;

const ui = new UI();
const game = new Game(canvas, ui);
const smallWarning = document.getElementById('smallWarning');

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
    if (game.buyShopItem(playerIndex, itemId)) game.audio.playMenu();
});

function fitCanvas() {
    const margin = 24;
    const hudReserve = window.innerHeight < 700 ? 8 : 0;
    const availableWidth = window.innerWidth - margin;
    const availableHeight = window.innerHeight - margin - hudReserve;
    const scale = Math.min(
        availableWidth / CONFIG.canvas.width,
        availableHeight / CONFIG.canvas.height,
        1
    );

    canvas.style.width = `${Math.floor(CONFIG.canvas.width * scale)}px`;
    canvas.style.height = `${Math.floor(CONFIG.canvas.height * scale)}px`;
    smallWarning.classList.toggle('hidden', scale >= 0.58);
}

window.addEventListener('resize', fitCanvas);
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
