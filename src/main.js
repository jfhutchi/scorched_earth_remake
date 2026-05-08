// Entry point: wire up DOM controls, kick off the menu, and own canvas sizing.

import { Game } from './game.js';
import { UI } from './ui.js';

const BASE_W = 1280;
const BASE_H = 720;

const canvas = document.getElementById('gameCanvas');
canvas.width = BASE_W;
canvas.height = BASE_H;

const ui = new UI();
const game = new Game(canvas, ui);

// Buttons
ui.startBtn.addEventListener('click', (e) => {
    e.currentTarget.blur(); // so Space doesn't re-click the button mid-game
    ui.showGame();
    game.start();
});

ui.restartBtn.addEventListener('click', (e) => {
    e.currentTarget.blur();
    // Loop is still running — just reset state. Avoid kicking off a second
    // requestAnimationFrame chain.
    game.reset();
});

ui.menuBtn.addEventListener('click', (e) => {
    e.currentTarget.blur();
    game.stop();
    ui.showMenu();
});

// Keep canvas readable on smaller windows. We don't change the internal
// resolution so the game logic stays consistent — CSS scales it down.
function fitCanvas() {
    const margin = 24;
    const availW = window.innerWidth - margin;
    const availH = window.innerHeight - margin;
    const scale = Math.min(availW / BASE_W, availH / BASE_H, 1);
    canvas.style.width = `${BASE_W * scale}px`;
    canvas.style.height = `${BASE_H * scale}px`;
}

window.addEventListener('resize', fitCanvas);
fitCanvas();

// Show menu on load
ui.showMenu();
