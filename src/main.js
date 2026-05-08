import { Game } from './game.js';
import { UI } from './ui.js';
import { CONFIG } from './config.js';

const canvas = document.getElementById('gameCanvas');
canvas.width = CONFIG.canvas.width;
canvas.height = CONFIG.canvas.height;

const ui = new UI();
const game = new Game(canvas, ui);
const smallWarning = document.getElementById('smallWarning');

ui.twoPlayerBtn.addEventListener('click', (e) => {
    e.currentTarget.blur();
    ui.showGame();
    game.audio.playMenu();
    game.start('two-player');
});

ui.cpuBtn.addEventListener('click', (e) => {
    e.currentTarget.blur();
    ui.showGame();
    game.audio.playMenu();
    game.start('cpu');
});

ui.restartBtn.addEventListener('click', (e) => {
    e.currentTarget.blur();
    game.audio.playMenu();
    game.resetCurrentRound();
});

ui.nextRoundBtn.addEventListener('click', (e) => {
    e.currentTarget.blur();
    game.audio.playMenu();
    game.nextRound();
});

ui.newMatchBtn.addEventListener('click', (e) => {
    e.currentTarget.blur();
    game.audio.playMenu();
    game.startNewMatch(game.gameMode);
});

ui.menuBtn.addEventListener('click', (e) => {
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

ui.showMenu();
