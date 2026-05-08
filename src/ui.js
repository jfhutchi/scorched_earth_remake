// Thin wrapper over the HTML overlay HUD elements. Centralizes DOM updates
// so game.js stays focused on game logic.

export class UI {
    constructor() {
        this.menu = document.getElementById('menu');
        this.game = document.getElementById('game');
        this.winOverlay = document.getElementById('winOverlay');
        this.winText = document.getElementById('winText');

        this.startBtn = document.getElementById('startBtn');
        this.restartBtn = document.getElementById('restartBtn');
        this.menuBtn = document.getElementById('menuBtn');

        this.p1Panel = document.getElementById('p1Panel');
        this.p2Panel = document.getElementById('p2Panel');
        this.p1Health = document.getElementById('p1Health');
        this.p2Health = document.getElementById('p2Health');
        this.p1HealthText = document.getElementById('p1HealthText');
        this.p2HealthText = document.getElementById('p2HealthText');

        this.turnLabel = document.getElementById('turnLabel');
        this.angleVal = document.getElementById('angleVal');
        this.powerVal = document.getElementById('powerVal');
        this.windVal = document.getElementById('windVal');
    }

    showMenu() {
        this.menu.classList.remove('hidden');
        this.game.classList.add('hidden');
        this.winOverlay.classList.add('hidden');
    }

    showGame() {
        this.menu.classList.add('hidden');
        this.game.classList.remove('hidden');
        this.winOverlay.classList.add('hidden');
    }

    showWin(text) {
        this.winText.textContent = text;
        this.winOverlay.classList.remove('hidden');
    }

    hideWin() {
        this.winOverlay.classList.add('hidden');
    }

    update(state) {
        const { tanks, currentPlayer, wind } = state;
        const p1 = tanks[0];
        const p2 = tanks[1];

        // Health bars
        this.p1Health.style.width = `${p1.health}%`;
        this.p2Health.style.width = `${p2.health}%`;
        this.p1HealthText.textContent = String(p1.health);
        this.p2HealthText.textContent = String(p2.health);
        this.p1Health.style.background = healthColor(p1.health);
        this.p2Health.style.background = healthColor(p2.health);

        // Active player highlight
        this.p1Panel.classList.toggle('active', currentPlayer === 0);
        this.p2Panel.classList.toggle('active', currentPlayer === 1);

        // Turn + stats reflect the active tank
        const active = tanks[currentPlayer];
        this.turnLabel.textContent = `Player ${currentPlayer + 1}'s Turn`;
        this.turnLabel.style.color = currentPlayer === 0 ? '#f78166' : '#58a6ff';
        this.angleVal.textContent = `${Math.round(active.angle)}°`;
        this.powerVal.textContent = String(Math.round(active.power));

        const windText = wind === 0
            ? '0'
            : `${wind > 0 ? '→' : '←'} ${Math.abs(wind).toFixed(1)}`;
        this.windVal.textContent = windText;
    }
}

function healthColor(hp) {
    if (hp > 60) return 'linear-gradient(90deg, #2ea043, #56d364)';
    if (hp > 30) return 'linear-gradient(90deg, #c69026, #f0c36b)';
    return 'linear-gradient(90deg, #c93c3c, #ff7b72)';
}
