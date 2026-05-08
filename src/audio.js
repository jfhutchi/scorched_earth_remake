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

    playFire(weapon) {
        const low = weapon.id === 'heavy' ? 95 : 135;
        this._tone(low, 0.11, 'sawtooth', 0.08);
        this._tone(low * 1.8, 0.06, 'square', 0.035, 0.035);
        this._noise(0.08, 0.05);
    }

    playExplosion(weapon) {
        const duration = weapon.id === 'dirt' ? 0.42 : 0.32;
        this._noise(duration, weapon.id === 'heavy' ? 0.16 : 0.12);
        this._tone(72, duration * 0.7, 'sawtooth', 0.08);
    }

    playHit() {
        this._tone(210, 0.09, 'square', 0.055);
        this._tone(140, 0.12, 'square', 0.035, 0.055);
    }

    _ensureContext() {
        if (this.muted) return null;
        if (!this.context) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            this.context = new AudioContextClass();
        }
        if (this.context.state === 'suspended') this.context.resume();
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

    _noise(duration, volume) {
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
        gain.connect(ctx.destination);
        source.start(start);
        source.stop(end + 0.02);
    }
}
