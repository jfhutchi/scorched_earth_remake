const STORAGE_KEY = 'tank-artillery-muted';

export class AudioManager {
    constructor() {
        this.context = null;
        this.muted = localStorage.getItem(STORAGE_KEY) === 'true';
    }

    toggleMute() {
        this.muted = !this.muted;
        localStorage.setItem(STORAGE_KEY, String(this.muted));
        if (!this.muted) this.playMenu();
        return this.muted;
    }

    setMuted(muted) {
        this.muted = Boolean(muted);
        localStorage.setItem(STORAGE_KEY, String(this.muted));
    }

    playMenu() {
        this._tone(520, 0.055, 'triangle', 0.045);
        this._tone(760, 0.075, 'triangle', 0.035, 0.045);
    }

    playTurn() {
        this._tone(360, 0.07, 'sine', 0.035);
    }

    // v0.6: distinct firing voices per weapon.
    playFire(weapon) {
        switch (weapon.id) {
            case 'heavy':
                // Deeper, louder, longer cannon boom.
                this._tone(70, 0.34, 'sawtooth', 0.16);
                this._tone(118, 0.22, 'square', 0.085, 0.02);
                this._noise(0.18, 0.10);
                break;
            case 'dirt':
                // Softer puffy launch with airy noise, no metallic ring.
                this._tone(180, 0.10, 'sine', 0.05);
                this._tone(110, 0.18, 'sine', 0.045, 0.02);
                this._noise(0.22, 0.06, { lowPass: true });
                break;
            case 'roller':
                this._tone(118, 0.16, 'square', 0.08);
                this._tone(390, 0.10, 'triangle', 0.04, 0.03);
                this._noise(0.12, 0.045);
                break;
            case 'napalm':
                this._tone(170, 0.12, 'sine', 0.045);
                this._noise(0.30, 0.07, { highPass: true });
                break;
            case 'cluster':
                this._tone(105, 0.18, 'triangle', 0.08);
                this._tone(230, 0.10, 'sine', 0.045, 0.04);
                this._noise(0.14, 0.05, { lowPass: true });
                break;
            case 'mega':
                this._tone(46, 0.42, 'sawtooth', 0.18);
                this._tone(82, 0.32, 'square', 0.09, 0.02);
                this._noise(0.24, 0.11, { lowPass: true });
                break;
            case 'standard':
            default:
                // Medium pop/thump.
                this._tone(150, 0.13, 'sawtooth', 0.085);
                this._tone(280, 0.07, 'square', 0.04, 0.025);
                this._noise(0.09, 0.05);
                break;
        }
    }

    // v0.6: distinct impact voices per weapon.
    playExplosion(weapon) {
        switch (weapon.id) {
            case 'heavy':
                // Larger boom with low-frequency rumble.
                this._noise(0.45, 0.18);
                this._tone(58, 0.42, 'sawtooth', 0.12);
                this._tone(34, 0.55, 'sine', 0.09, 0.04);
                break;
            case 'dirt':
                // Soil burst / thud, less fiery, no big rumble.
                this._noise(0.32, 0.10, { lowPass: true });
                this._tone(96, 0.14, 'sine', 0.06);
                this._tone(60, 0.20, 'sine', 0.04, 0.05);
                break;
            case 'roller':
                this._noise(0.30, 0.13, { lowPass: true });
                this._tone(72, 0.24, 'sawtooth', 0.065);
                this._tone(210, 0.08, 'triangle', 0.032, 0.04);
                break;
            case 'napalm':
                this._noise(0.46, 0.12, { highPass: true });
                this._tone(180, 0.20, 'sine', 0.035);
                break;
            case 'cluster':
            case 'clusterBomblet':
                this._noise(0.18, 0.07);
                this._tone(120, 0.12, 'triangle', 0.035);
                this._tone(260, 0.06, 'square', 0.022, 0.02);
                break;
            case 'mega':
                this._noise(0.62, 0.20, { lowPass: true });
                this._tone(38, 0.72, 'sine', 0.13);
                this._tone(62, 0.50, 'sawtooth', 0.12, 0.04);
                this._tone(110, 0.22, 'square', 0.05, 0.08);
                break;
            case 'standard':
            default:
                this._noise(0.32, 0.13);
                this._tone(72, 0.22, 'sawtooth', 0.08);
                break;
        }
    }

    playClusterSplit() {
        this._tone(520, 0.055, 'triangle', 0.04);
        this._tone(740, 0.06, 'triangle', 0.03, 0.035);
        this._noise(0.08, 0.025);
    }

    playRollerRumble() {
        this._tone(88, 0.24, 'sawtooth', 0.035);
        this._noise(0.24, 0.035, { lowPass: true });
    }

    playHit() {
        this._tone(210, 0.09, 'square', 0.055);
        this._tone(140, 0.12, 'square', 0.035, 0.055);
    }

    // Shimmering/energy absorb tone for the shield.
    playShieldAbsorb() {
        this._tone(620, 0.10, 'sine', 0.05);
        this._tone(880, 0.14, 'triangle', 0.04, 0.04);
        this._tone(1240, 0.10, 'sine', 0.025, 0.07);
    }

    // Clean positive heal arpeggio for the First Aid Kit.
    playHeal() {
        this._tone(523, 0.12, 'sine', 0.05);
        this._tone(659, 0.14, 'sine', 0.05, 0.10);
        this._tone(784, 0.18, 'sine', 0.055, 0.20);
    }

    // Soft cushion/whoosh for parachute.
    playParachute() {
        this._noise(0.36, 0.05, { lowPass: true });
        this._tone(220, 0.30, 'sine', 0.03);
    }

    // Satisfying click/chime when buying.
    playPurchase() {
        this._tone(880, 0.06, 'triangle', 0.05);
        this._tone(1320, 0.10, 'sine', 0.045, 0.04);
    }

    // Subtle blocked sound for invalid purchases.
    playBlocked() {
        this._tone(180, 0.10, 'square', 0.04);
        this._tone(140, 0.12, 'square', 0.035, 0.03);
    }

    _ensureContext() {
        if (this.muted) return null;
        if (!this.context) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (!AudioContextClass) return null;
            try {
                this.context = new AudioContextClass();
            } catch (error) {
                return null;
            }
        }
        if (this.context.state === 'suspended') {
            try { this.context.resume(); } catch (_e) { /* ignore */ }
        }
        return this.context;
    }

    _tone(frequency, duration, type, volume, delay = 0) {
        const ctx = this._ensureContext();
        if (!ctx) return;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = ctx.currentTime + delay;
        const end = start + duration;

        osc.type = type;
        osc.frequency.setValueAtTime(frequency, start);
        osc.frequency.exponentialRampToValueAtTime(Math.max(30, frequency * 0.65), end);

        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(volume, start + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.0001, end);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(end + 0.02);
    }

    _noise(duration, volume, { lowPass = false, highPass = false } = {}) {
        const ctx = this._ensureContext();
        if (!ctx) return;

        const sampleCount = Math.max(1, Math.floor(ctx.sampleRate * duration));
        const buffer = ctx.createBuffer(1, sampleCount, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < sampleCount; i++) {
            const fade = 1 - i / sampleCount;
            data[i] = (Math.random() * 2 - 1) * fade;
        }

        const source = ctx.createBufferSource();
        const gain = ctx.createGain();
        const start = ctx.currentTime;
        const end = start + duration;

        source.buffer = buffer;
        gain.gain.setValueAtTime(volume, start);
        gain.gain.exponentialRampToValueAtTime(0.0001, end);

        source.connect(gain);

        if (lowPass || highPass) {
            const filter = ctx.createBiquadFilter();
            filter.type = lowPass ? 'lowpass' : 'highpass';
            filter.frequency.setValueAtTime(lowPass ? 420 : 650, start);
            filter.frequency.exponentialRampToValueAtTime(lowPass ? 220 : 980, end);
            gain.connect(filter);
            filter.connect(ctx.destination);
        } else {
            gain.connect(ctx.destination);
        }

        source.start(start);
        source.stop(end + 0.02);
    }
}
