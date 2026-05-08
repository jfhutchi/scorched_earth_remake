import { WEAPONS } from './config.js';

export class UI {
    constructor() {
        this.menu = document.getElementById('menu');
        this.game = document.getElementById('game');
        this.winOverlay = document.getElementById('winOverlay');
        this.winText = document.getElementById('winText');
        this.winDetails = document.getElementById('winDetails');

        this.twoPlayerBtn = document.getElementById('twoPlayerBtn');
        this.cpuBtn = document.getElementById('cpuBtn');
        this.restartBtn = document.getElementById('restartBtn');
        this.nextRoundBtn = document.getElementById('nextRoundBtn');
        this.newMatchBtn = document.getElementById('newMatchBtn');
        this.menuBtn = document.getElementById('menuBtn');
        this.muteBtn = document.getElementById('muteBtn');
        this.menuMuteBtn = document.getElementById('menuMuteBtn');

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

    showWin(text, state) {
        this.winText.textContent = text;
        this.winDetails.textContent = `Score: Player 1 ${state.score[0]} - ${state.tanks[1].name} ${state.score[1]}`;
        this.winOverlay.classList.remove('hidden');
    }

    hideWin() {
        this.winOverlay.classList.add('hidden');
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

        this._updateHealth(p1, this.p1Health, this.p1HealthText);
        this._updateHealth(p2, this.p2Health, this.p2HealthText);

        this.p1Panel.classList.toggle('active', currentPlayer === 0 && !state.gameOver);
        this.p2Panel.classList.toggle('active', currentPlayer === 1 && !state.gameOver);
        this.p1Panel.classList.toggle('disabled', !p1.alive);
        this.p2Panel.classList.toggle('disabled', !p2.alive);

        this.turnLabel.textContent = this._turnText(state);
        this.turnLabel.style.color = currentPlayer === 0 ? '#f06b45' : '#2d75c7';
        this.statusVal.textContent = state.statusMessage;
        this.roundVal.textContent = String(state.roundNumber);
        this.modeVal.textContent = state.gameMode === 'cpu' ? 'Single Player vs CPU' : 'Two Player Local';

        this.angleVal.textContent = `${Math.round(active.angle)} deg`;
        this.powerVal.textContent = String(Math.round(active.power));
        this.windVal.textContent = formatWind(wind);
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
        if (state.gameOver) return 'Round Over';
        if (state.phase === 'projectile') return 'Shot In Flight';
        if (state.phase === 'resolving') return 'Resolving Impact';
        if (state.phase === 'cpuThinking') return `${state.active.name} Thinking`;
        return `${state.active.name}'s Turn`;
    }

    _controlsText(state) {
        if (state.gameOver) return 'N: Next Round   R: Restart Round   Esc: Menu   M: Mute';
        if (state.phase === 'cpuThinking') return 'CPU is aiming. Controls locked. M: Mute   Esc: Menu';
        if (state.phase !== 'aiming') return 'Controls locked until the shot resolves. M: Mute   Esc: Menu';
        if (state.active.isCpu) return 'CPU turn. M: Mute   Esc: Menu';
        if (state.active.movementFuel <= 0) {
            return 'Left/Right: Angle   Up/Down: Power   Movement exhausted   Space: Fire   Tab/W: Weapon   R: Restart   M: Mute   Esc: Menu';
        }
        return 'Left/Right: Angle   Up/Down: Power   A/D: Move   Space: Fire   Tab/W: Weapon   R: Restart   M: Mute   Esc: Menu';
    }
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
