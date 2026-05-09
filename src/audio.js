const STORAGE_KEY = 'tank-artillery-muted';
const DEFAULT_FIELD_WIDTH = 1280;

const MIX = {
    master: 0.78,
    weapons: 0.66,
    explosions: 0.72,
    impacts: 0.46,
    ui: 0.42,
    utilities: 0.50,
    movement: 0.34,
    ambience: 0.22,
};

export class AudioManager {
    constructor() {
        this.context = null;
        this.masterGain = null;
        this.limiter = null;
        this.categoryGains = new Map();
        this.muted = localStorage.getItem(STORAGE_KEY) === 'true';
        this.ambience = null;
        this.ambienceTheme = null;
        this.tankMoveLoop = null;
        this.activeSounds = new Set();
        this.pageActive = typeof document === 'undefined' ? true : !document.hidden;
    }

    toggleMute() {
        this.setMuted(!this.muted);
        if (!this.muted) this.playUiClick();
        return this.muted;
    }

    setMuted(muted) {
        this.muted = Boolean(muted);
        localStorage.setItem(STORAGE_KEY, String(this.muted));
        if (this.muted) {
            this._setMasterVolume(0);
            this.stopAllSounds({ rememberAmbienceTheme: true });
            return;
        }

        this._setMasterVolume(MIX.master);
        if (this.pageActive && this.ambienceTheme) this.startAmbience(this.ambienceTheme);
    }

    playMenu() {
        this.playUiClick();
    }

    playUiClick() {
        this._noiseLayer({ category: 'ui', duration: 0.028, volume: 0.022, filterType: 'highpass', frequency: 820 });
        this._oscLayer({ category: 'ui', type: 'triangle', frequency: 520, endFrequency: 610, duration: 0.070, volume: 0.034 });
    }

    playStartMatch() {
        this._oscLayer({ category: 'ui', type: 'sine', frequency: 150, endFrequency: 112, duration: 0.18, volume: 0.052 });
        this._oscLayer({ category: 'ui', type: 'triangle', frequency: 520, endFrequency: 760, duration: 0.16, volume: 0.042, delay: 0.035 });
        this._noiseLayer({ category: 'ui', duration: 0.080, volume: 0.020, filterType: 'highpass', frequency: 1100, delay: 0.025 });
    }

    playContinue() {
        this._oscLayer({ category: 'ui', type: 'triangle', frequency: 460, endFrequency: 660, duration: 0.10, volume: 0.034 });
        this._oscLayer({ category: 'ui', type: 'sine', frequency: 880, endFrequency: 980, duration: 0.08, volume: 0.024, delay: 0.045 });
    }

    playTurn() {
        this._oscLayer({ category: 'ui', type: 'triangle', frequency: 330, endFrequency: 390, duration: 0.075, volume: 0.026 });
    }

    playRoundStart() {
        this._noiseLayer({ category: 'ui', duration: 0.060, volume: 0.020, filterType: 'highpass', frequency: 900 });
        this._oscLayer({ category: 'ui', type: 'triangle', frequency: 260, endFrequency: 390, duration: 0.13, volume: 0.036 });
        this._oscLayer({ category: 'ui', type: 'sine', frequency: 620, endFrequency: 720, duration: 0.11, volume: 0.026, delay: 0.07 });
    }

    playRoundWin() {
        this._oscLayer({ category: 'ui', type: 'triangle', frequency: 440, endFrequency: 660, duration: 0.16, volume: 0.042 });
        this._oscLayer({ category: 'ui', type: 'sine', frequency: 660, endFrequency: 880, duration: 0.18, volume: 0.038, delay: 0.12 });
        this._noiseLayer({ category: 'ui', duration: 0.12, volume: 0.018, filterType: 'highpass', frequency: 1400, delay: 0.05 });
    }

    playMatchWin() {
        this.playRoundWin();
        this._oscLayer({ category: 'ui', type: 'sine', frequency: 990, endFrequency: 1320, duration: 0.22, volume: 0.036, delay: 0.25 });
        this._noiseLayer({ category: 'ui', duration: 0.18, volume: 0.024, filterType: 'highpass', frequency: 1700, delay: 0.18 });
    }

    playWeaponCycle() {
        this._noiseLayer({ category: 'ui', duration: 0.020, volume: 0.018, filterType: 'highpass', frequency: 1200 });
        this._oscLayer({ category: 'ui', type: 'triangle', frequency: 680, endFrequency: 520, duration: 0.055, volume: 0.026 });
    }

    playFire(weapon, spatial = {}) {
        const id = weapon?.id || 'standard';
        switch (id) {
            case 'heavy':
                this._cannonFire(spatial, { body: 78, sub: 48, crack: 0.060, pressure: 0.21, tail: 0.32, metal: 360, volume: 1.05 });
                break;
            case 'dirt':
                this._oscLayer({ category: 'weapons', ...spatial, type: 'sine', frequency: 96, endFrequency: 58, duration: 0.22, volume: 0.070 });
                this._noiseLayer({ category: 'weapons', ...spatial, duration: 0.30, volume: 0.075, filterType: 'lowpass', frequency: 520, color: 'brown' });
                this._noiseLayer({ category: 'weapons', ...spatial, duration: 0.12, volume: 0.036, filterType: 'bandpass', frequency: 760, delay: 0.025, color: 'dust' });
                break;
            case 'roller':
                this._cannonFire(spatial, { body: 118, sub: 68, crack: 0.044, pressure: 0.13, tail: 0.18, metal: 620, volume: 0.82 });
                this._rattle(spatial, 5, 0.03, 0.16, 0.014);
                break;
            case 'napalm':
                this._oscLayer({ category: 'weapons', ...spatial, type: 'sine', frequency: 132, endFrequency: 86, duration: 0.18, volume: 0.052 });
                this._noiseLayer({ category: 'weapons', ...spatial, duration: 0.40, volume: 0.078, filterType: 'highpass', frequency: 720, endFrequency: 1480, color: 'soft' });
                this._noiseLayer({ category: 'weapons', ...spatial, duration: 0.26, volume: 0.042, filterType: 'bandpass', frequency: 1320, delay: 0.08, color: 'crackle' });
                break;
            case 'cluster':
                this._cannonFire(spatial, { body: 104, sub: 62, crack: 0.044, pressure: 0.16, tail: 0.22, metal: 430, volume: 0.88 });
                this._oscLayer({ category: 'weapons', ...spatial, type: 'triangle', frequency: 250, endFrequency: 180, duration: 0.12, volume: 0.030, delay: 0.06 });
                break;
            case 'mega':
                this._cannonFire(spatial, { body: 58, sub: 34, crack: 0.072, pressure: 0.28, tail: 0.46, metal: 260, volume: 1.18 });
                this._noiseLayer({ category: 'weapons', ...spatial, duration: 0.48, volume: 0.070, filterType: 'lowpass', frequency: 300, endFrequency: 120, delay: 0.08, color: 'brown' });
                break;
            case 'standard':
            default:
                this._cannonFire(spatial, { body: 130, sub: 82, crack: 0.046, pressure: 0.13, tail: 0.17, metal: 470, volume: 0.82 });
                break;
        }
    }

    playExplosion(weapon, spatial = {}) {
        const id = weapon?.id || 'standard';
        switch (id) {
            case 'heavy':
                this._explosion(spatial, { crack: 0.092, boom: 58, rumble: 34, blast: 0.22, debris: 11, duration: 0.58, volume: 1.08 });
                break;
            case 'dirt':
                this._noiseLayer({ category: 'explosions', ...spatial, duration: 0.38, volume: 0.130, filterType: 'lowpass', frequency: 430, endFrequency: 180, color: 'brown' });
                this._oscLayer({ category: 'explosions', ...spatial, type: 'sine', frequency: 82, endFrequency: 48, duration: 0.25, volume: 0.070 });
                this._debris(spatial, 9, 0.05, 0.30, 0.020, 'dust');
                break;
            case 'roller':
                this._rattle(spatial, 4, 0, 0.08, 0.012);
                this._explosion(spatial, { crack: 0.058, boom: 74, rumble: 44, blast: 0.15, debris: 7, duration: 0.36, volume: 0.82 });
                break;
            case 'napalm':
                this._noiseLayer({ category: 'explosions', ...spatial, duration: 0.70, volume: 0.125, filterType: 'highpass', frequency: 520, endFrequency: 1300, color: 'soft' });
                this._noiseLayer({ category: 'explosions', ...spatial, duration: 0.48, volume: 0.070, filterType: 'bandpass', frequency: 1700, delay: 0.08, color: 'crackle' });
                this._oscLayer({ category: 'explosions', ...spatial, type: 'sine', frequency: 108, endFrequency: 76, duration: 0.22, volume: 0.038, delay: 0.02 });
                this._debris(spatial, 7, 0.10, 0.65, 0.014, 'crackle');
                break;
            case 'cluster':
            case 'clusterBomblet':
                this._explosion(spatial, { crack: 0.042, boom: 112, rumble: 70, blast: 0.080, debris: 4, duration: 0.22, volume: 0.46 });
                break;
            case 'mega':
                this._explosion(spatial, { crack: 0.110, boom: 42, rumble: 28, blast: 0.28, debris: 16, duration: 0.86, volume: 1.25 });
                this._noiseLayer({ category: 'explosions', ...spatial, duration: 0.78, volume: 0.115, filterType: 'lowpass', frequency: 260, endFrequency: 90, delay: 0.08, color: 'brown' });
                break;
            case 'standard':
            default:
                this._explosion(spatial, { crack: 0.070, boom: 74, rumble: 46, blast: 0.15, debris: 8, duration: 0.38, volume: 0.82 });
                break;
        }
    }

    playClusterSplit(spatial = {}) {
        this._noiseLayer({ category: 'weapons', ...spatial, duration: 0.045, volume: 0.035, filterType: 'highpass', frequency: 1200 });
        this._oscLayer({ category: 'weapons', ...spatial, type: 'triangle', frequency: 470, endFrequency: 720, duration: 0.075, volume: 0.036 });
        this._oscLayer({ category: 'weapons', ...spatial, type: 'triangle', frequency: 680, endFrequency: 930, duration: 0.070, volume: 0.026, delay: 0.045 });
    }

    playRollerRumble(spatial = {}) {
        this._oscLayer({ category: 'weapons', ...spatial, type: 'sawtooth', frequency: 88, endFrequency: 62, duration: 0.26, volume: 0.032 });
        this._rattle(spatial, 8, 0, 0.24, 0.012);
    }

    playTankDestroyed(delay = 0, spatial = {}) {
        this._explosion(spatial, { crack: 0.120, boom: 38, rumble: 26, blast: 0.24, debris: 18, duration: 0.78, volume: 1.16, delay });
        this._oscLayer({ category: 'explosions', ...spatial, type: 'square', frequency: 360, endFrequency: 180, duration: 0.070, volume: 0.036, delay: delay + 0.045 });
        this._oscLayer({ category: 'explosions', ...spatial, type: 'triangle', frequency: 840, endFrequency: 510, duration: 0.060, volume: 0.026, delay: delay + 0.090 });
        this._noiseLayer({ category: 'explosions', ...spatial, duration: 0.62, volume: 0.072, filterType: 'lowpass', frequency: 340, endFrequency: 110, delay: delay + 0.18, color: 'brown' });
    }

    playHit(spatial = {}) {
        this._noiseLayer({ category: 'impacts', ...spatial, duration: 0.050, volume: 0.042, filterType: 'bandpass', frequency: 620 });
        this._oscLayer({ category: 'impacts', ...spatial, type: 'square', frequency: 210, endFrequency: 130, duration: 0.10, volume: 0.030 });
    }

    playShieldActivate() {
        this._oscLayer({ category: 'utilities', type: 'sine', frequency: 420, endFrequency: 760, duration: 0.18, volume: 0.038 });
        this._oscLayer({ category: 'utilities', type: 'triangle', frequency: 930, endFrequency: 1280, duration: 0.20, volume: 0.028, delay: 0.06 });
    }

    playShieldAbsorb(spatial = {}) {
        this._noiseLayer({ category: 'utilities', ...spatial, duration: 0.080, volume: 0.024, filterType: 'highpass', frequency: 1800 });
        this._oscLayer({ category: 'utilities', ...spatial, type: 'sine', frequency: 620, endFrequency: 920, duration: 0.12, volume: 0.042 });
        this._oscLayer({ category: 'utilities', ...spatial, type: 'triangle', frequency: 1080, endFrequency: 760, duration: 0.15, volume: 0.030, delay: 0.04 });
    }

    playHeal() {
        this._oscLayer({ category: 'utilities', type: 'sine', frequency: 523, endFrequency: 560, duration: 0.12, volume: 0.040 });
        this._oscLayer({ category: 'utilities', type: 'sine', frequency: 659, endFrequency: 700, duration: 0.14, volume: 0.038, delay: 0.10 });
        this._oscLayer({ category: 'utilities', type: 'sine', frequency: 784, endFrequency: 880, duration: 0.18, volume: 0.040, delay: 0.20 });
        this._noiseLayer({ category: 'utilities', duration: 0.12, volume: 0.012, filterType: 'highpass', frequency: 1800, delay: 0.10 });
    }

    playParachute(spatial = {}) {
        this._noiseLayer({ category: 'utilities', ...spatial, duration: 0.42, volume: 0.055, filterType: 'lowpass', frequency: 700, endFrequency: 240, color: 'soft' });
        this._oscLayer({ category: 'utilities', ...spatial, type: 'sine', frequency: 210, endFrequency: 130, duration: 0.34, volume: 0.026, delay: 0.02 });
    }

    playPurchase() {
        this._noiseLayer({ category: 'ui', duration: 0.024, volume: 0.018, filterType: 'highpass', frequency: 1300 });
        this._oscLayer({ category: 'ui', type: 'triangle', frequency: 660, endFrequency: 880, duration: 0.10, volume: 0.040 });
        this._oscLayer({ category: 'ui', type: 'sine', frequency: 1180, endFrequency: 1320, duration: 0.13, volume: 0.032, delay: 0.045 });
    }

    playBlocked() {
        this._oscLayer({ category: 'ui', type: 'triangle', frequency: 180, endFrequency: 130, duration: 0.12, volume: 0.034 });
        this._noiseLayer({ category: 'ui', duration: 0.045, volume: 0.018, filterType: 'lowpass', frequency: 360, delay: 0.02, color: 'brown' });
    }

    startTankMoveLoop(spatial = {}) {
        if (this.muted || !this.pageActive || this.tankMoveLoop) return;

        const ctx = this._ensureContext();
        if (!ctx) return;

        const start = ctx.currentTime + 0.01;
        const tread = ctx.createBufferSource();
        tread.buffer = this._createTreadBuffer(0.36);
        tread.loop = true;

        const treadFilter = ctx.createBiquadFilter();
        treadFilter.type = 'bandpass';
        treadFilter.frequency.setValueAtTime(260, start);
        treadFilter.Q.setValueAtTime(0.85, start);

        const treadGain = ctx.createGain();
        treadGain.gain.setValueAtTime(0.0001, start);
        treadGain.gain.linearRampToValueAtTime(0.030, start + 0.055);

        tread.connect(treadFilter);
        treadFilter.connect(treadGain);
        const treadCleanup = this._connectToCategory(treadGain, 'movement', spatial);

        const thump = ctx.createOscillator();
        thump.type = 'triangle';
        thump.frequency.setValueAtTime(36 + Math.random() * 4, start);

        const thumpGain = ctx.createGain();
        thumpGain.gain.setValueAtTime(0.0001, start);
        thumpGain.gain.linearRampToValueAtTime(0.0065, start + 0.055);

        thump.connect(thumpGain);
        const thumpCleanup = this._connectToCategory(thumpGain, 'movement', spatial);

        const loop = {
            sources: [tread, thump],
            gains: [treadGain, thumpGain],
            stopped: false,
            cleanup: () => {
                treadCleanup([tread, treadFilter, treadGain]);
                thumpCleanup([thump, thumpGain]);
            },
        };

        const finish = () => {
            if (loop.stopped) return;
            loop.stopped = true;
            loop.cleanup();
            if (this.tankMoveLoop === loop) this.tankMoveLoop = null;
        };

        tread.onended = finish;
        thump.onended = finish;
        this.tankMoveLoop = loop;
        tread.start(start);
        thump.start(start);
    }

    stopTankMoveLoop({ fade = 0.07, force = false } = {}) {
        const loop = this.tankMoveLoop;
        if (!loop) return;

        const ctx = this.context;
        const finish = () => {
            if (loop.stopped) return;
            loop.stopped = true;
            loop.cleanup();
            if (this.tankMoveLoop === loop) this.tankMoveLoop = null;
        };

        if (force || !ctx || ctx.state === 'closed') {
            for (const source of loop.sources) {
                try { source.onended = null; } catch (_err) { /* ignore */ }
                try { source.stop(0); } catch (_err) { /* already stopped */ }
            }
            finish();
            return;
        }

        const end = ctx.currentTime + Math.max(0, fade);
        for (const gain of loop.gains) {
            try {
                gain.gain.cancelScheduledValues(ctx.currentTime);
                gain.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.018);
            } catch (_err) {
                /* ignore */
            }
        }
        for (const source of loop.sources) {
            try { source.stop(end + 0.03); } catch (_err) { /* already stopped */ }
        }
    }

    stopAllSounds({ rememberAmbienceTheme = false } = {}) {
        this.stopTankMoveLoop({ fade: 0, force: true });
        this.stopAmbience({ rememberTheme: rememberAmbienceTheme });

        const stopAt = this.context ? this.context.currentTime : 0;
        for (const entry of [...this.activeSounds]) {
            this.activeSounds.delete(entry);
            try { entry.source.onended = null; } catch (_err) { /* ignore */ }
            try { entry.source.stop(stopAt); } catch (_err) { /* already stopped or not started */ }
            try { entry.cleanup(entry.nodes); } catch (_err) { /* already disconnected */ }
        }
    }

    handlePageHidden() {
        this.pageActive = false;
        this.stopAllSounds({ rememberAmbienceTheme: true });
        if (this.context && this.context.state !== 'closed') {
            try {
                const suspend = this.context.suspend();
                if (suspend && typeof suspend.catch === 'function') suspend.catch(() => {});
            } catch (_err) {
                /* ignore */
            }
        }
    }

    handlePageVisible() {
        this.pageActive = true;
    }

    startAmbience(theme) {
        this.ambienceTheme = theme || { id: 'green' };
        if (this.muted || !this.pageActive) {
            this.stopAmbience({ rememberTheme: true });
            return;
        }

        const ctx = this._ensureContext();
        if (!ctx) return;

        const themeId = this.ambienceTheme.id || 'green';
        if (this.ambience && this.ambience.themeId === themeId) return;

        this.stopAmbience({ rememberTheme: true });

        const start = ctx.currentTime + 0.02;
        const nodes = [];
        const sources = [];
        const settings = ambienceSettings(themeId);

        const wind = ctx.createBufferSource();
        wind.buffer = this._createNoiseBuffer(settings.duration, settings.color, true);
        wind.loop = true;
        const windFilter = ctx.createBiquadFilter();
        windFilter.type = settings.filterType;
        windFilter.frequency.setValueAtTime(settings.frequency, start);
        windFilter.Q.setValueAtTime(settings.q, start);
        const windGain = ctx.createGain();
        windGain.gain.setValueAtTime(settings.volume, start);

        wind.connect(windFilter);
        windFilter.connect(windGain);
        windGain.connect(this._categoryGain('ambience'));
        wind.start(start);

        nodes.push(wind, windFilter, windGain);
        sources.push(wind);

        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(settings.lfoRate, start);
        lfoGain.gain.setValueAtTime(settings.lfoDepth, start);
        lfo.connect(lfoGain);
        lfoGain.connect(windFilter.detune);
        lfo.start(start);
        nodes.push(lfo, lfoGain);
        sources.push(lfo);

        if (settings.toneFrequency) {
            const tone = ctx.createOscillator();
            const toneGain = ctx.createGain();
            tone.type = 'sine';
            tone.frequency.setValueAtTime(settings.toneFrequency, start);
            toneGain.gain.setValueAtTime(settings.toneVolume, start);
            tone.connect(toneGain);
            toneGain.connect(this._categoryGain('ambience'));
            tone.start(start);
            nodes.push(tone, toneGain);
            sources.push(tone);
        }

        this.ambience = { themeId, nodes, sources };
    }

    stopAmbience({ rememberTheme = false } = {}) {
        if (this.ambience) {
            const ctx = this.context;
            const stopAt = ctx ? ctx.currentTime + 0.02 : 0;
            for (const source of this.ambience.sources) {
                try { source.stop(stopAt); } catch (_err) { /* already stopped */ }
            }
            for (const node of this.ambience.nodes) {
                try { node.disconnect(); } catch (_err) { /* already disconnected */ }
            }
            this.ambience = null;
        }
        if (!rememberTheme) this.ambienceTheme = null;
    }

    _cannonFire(spatial, { body, sub, crack, pressure, tail, metal, volume }) {
        this._noiseLayer({ category: 'weapons', ...spatial, duration: 0.035, volume: crack * volume, filterType: 'highpass', frequency: 900, color: 'crackle' });
        this._oscLayer({ category: 'weapons', ...spatial, type: 'sawtooth', frequency: body, endFrequency: body * 0.48, duration: tail, volume: 0.095 * volume, attack: 0.006 });
        this._oscLayer({ category: 'weapons', ...spatial, type: 'sine', frequency: sub, endFrequency: Math.max(24, sub * 0.62), duration: tail * 1.12, volume: 0.060 * volume, delay: 0.012, attack: 0.012 });
        this._noiseLayer({ category: 'weapons', ...spatial, duration: tail * 0.82, volume: pressure * 0.42 * volume, filterType: 'lowpass', frequency: 560, endFrequency: 170, delay: 0.020, color: 'soft' });
        this._oscLayer({ category: 'weapons', ...spatial, type: 'triangle', frequency: metal, endFrequency: metal * 0.62, duration: 0.055, volume: 0.026 * volume, delay: 0.026 });
    }

    _explosion(spatial, { crack, boom, rumble, blast, debris, duration, volume, delay = 0 }) {
        this._noiseLayer({ category: 'explosions', ...spatial, duration: 0.050, volume: crack * volume, filterType: 'highpass', frequency: 960, delay, color: 'crackle' });
        this._oscLayer({ category: 'explosions', ...spatial, type: 'sine', frequency: boom, endFrequency: Math.max(24, boom * 0.52), duration: duration * 0.70, volume: 0.105 * volume, delay: delay + 0.012, attack: 0.010 });
        this._oscLayer({ category: 'explosions', ...spatial, type: 'sawtooth', frequency: rumble, endFrequency: Math.max(22, rumble * 0.62), duration, volume: 0.060 * volume, delay: delay + 0.055, attack: 0.025 });
        this._noiseLayer({ category: 'explosions', ...spatial, duration: duration * 0.64, volume: blast * 0.70 * volume, filterType: 'lowpass', frequency: 680, endFrequency: 170, delay: delay + 0.030, color: 'soft' });
        this._noiseLayer({ category: 'explosions', ...spatial, duration: duration * 0.72, volume: 0.032 * volume, filterType: 'bandpass', frequency: 1550, delay: delay + 0.095, color: 'dust' });
        this._debris(spatial, debris, delay + 0.09, duration * 0.78, 0.018 * volume, 'dust');
    }

    _rattle(spatial, count, startDelay, span, volume) {
        for (let i = 0; i < count; i++) {
            const delay = startDelay + Math.random() * span;
            this._noiseLayer({ category: 'weapons', ...spatial, duration: 0.020 + Math.random() * 0.025, volume, filterType: 'bandpass', frequency: 900 + Math.random() * 900, delay, color: 'crackle' });
            this._oscLayer({ category: 'weapons', ...spatial, type: 'triangle', frequency: 480 + Math.random() * 360, endFrequency: 260, duration: 0.030, volume: volume * 0.72, delay });
        }
    }

    _debris(spatial, count, startDelay, span, volume, color) {
        for (let i = 0; i < count; i++) {
            this._noiseLayer({
                category: 'explosions',
                ...spatial,
                duration: 0.035 + Math.random() * 0.080,
                volume: volume * randomRange(0.55, 1.18),
                filterType: Math.random() > 0.45 ? 'bandpass' : 'highpass',
                frequency: randomRange(620, 2400),
                delay: startDelay + Math.random() * span,
                color,
            });
        }
    }

    _oscLayer({
        category = 'weapons',
        type = 'sine',
        frequency = 220,
        endFrequency = null,
        duration = 0.1,
        volume = 0.05,
        delay = 0,
        attack = 0.008,
        x = null,
        width = DEFAULT_FIELD_WIDTH,
        pitchJitter = 0.035,
        volumeJitter = 0.08,
    } = {}) {
        const ctx = this._ensureContext();
        if (!ctx || duration <= 0 || volume <= 0) return;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = ctx.currentTime + Math.max(0, delay);
        const end = start + duration * randomRange(0.94, 1.08);
        const pitch = randomRange(1 - pitchJitter, 1 + pitchJitter);
        const startFreq = Math.max(20, frequency * pitch);
        const finishFreq = Math.max(20, (endFrequency ?? frequency * 0.68) * pitch);
        const level = volume * randomRange(1 - volumeJitter, 1 + volumeJitter);

        osc.type = type;
        osc.frequency.setValueAtTime(startFreq, start);
        osc.frequency.exponentialRampToValueAtTime(finishFreq, end);

        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, level), start + Math.min(attack, duration * 0.45));
        gain.gain.exponentialRampToValueAtTime(0.0001, end);

        osc.connect(gain);
        const cleanup = this._connectToCategory(gain, category, { x, width });
        this._trackSource(osc, [osc, gain], cleanup);
        osc.start(start);
        osc.stop(end + 0.04);
    }

    _noiseLayer({
        category = 'weapons',
        duration = 0.1,
        volume = 0.04,
        delay = 0,
        attack = 0.006,
        filterType = null,
        frequency = 700,
        endFrequency = null,
        q = 0.8,
        color = 'white',
        x = null,
        width = DEFAULT_FIELD_WIDTH,
        volumeJitter = 0.10,
    } = {}) {
        const ctx = this._ensureContext();
        if (!ctx || duration <= 0 || volume <= 0) return;

        const source = ctx.createBufferSource();
        const gain = ctx.createGain();
        const filter = filterType ? ctx.createBiquadFilter() : null;
        const start = ctx.currentTime + Math.max(0, delay);
        const actualDuration = duration * randomRange(0.92, 1.12);
        const end = start + actualDuration;
        const level = volume * randomRange(1 - volumeJitter, 1 + volumeJitter);

        source.buffer = this._createNoiseBuffer(actualDuration, color);
        if (filter) {
            filter.type = filterType;
            filter.frequency.setValueAtTime(Math.max(20, frequency), start);
            filter.frequency.exponentialRampToValueAtTime(Math.max(20, endFrequency ?? frequency * 0.55), end);
            filter.Q.setValueAtTime(q, start);
            source.connect(filter);
            filter.connect(gain);
        } else {
            source.connect(gain);
        }

        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, level), start + Math.min(attack, actualDuration * 0.4));
        gain.gain.exponentialRampToValueAtTime(0.0001, end);

        const nodes = filter ? [source, filter, gain] : [source, gain];
        const cleanup = this._connectToCategory(gain, category, { x, width });
        this._trackSource(source, nodes, cleanup);
        source.start(start);
        source.stop(end + 0.04);
    }

    _trackSource(source, nodes, cleanup) {
        const entry = { source, nodes, cleanup };
        this.activeSounds.add(entry);
        source.onended = () => {
            if (!this.activeSounds.delete(entry)) return;
            cleanup(nodes);
        };
        return entry;
    }

    _createNoiseBuffer(duration, color = 'white', looping = false) {
        const ctx = this.context;
        const sampleCount = Math.max(1, Math.floor(ctx.sampleRate * duration));
        const buffer = ctx.createBuffer(1, sampleCount, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        let last = 0;
        const phase = Math.random() * Math.PI * 2;

        for (let i = 0; i < sampleCount; i++) {
            const t = i / sampleCount;
            const white = Math.random() * 2 - 1;
            if (color === 'brown' || color === 'dust') {
                last = (last + 0.055 * white) / 1.055;
                data[i] = last * (color === 'dust' ? 3.2 : 4.6);
            } else if (color === 'crackle') {
                data[i] = Math.random() > 0.82 ? white : white * 0.18;
            } else if (color === 'soft') {
                last = last * 0.72 + white * 0.28;
                data[i] = last;
            } else {
                data[i] = white;
            }

            if (looping) {
                const gust = 0.42 + 0.58 * Math.pow(0.5 + 0.5 * Math.sin(t * Math.PI * 4 + phase), 2);
                data[i] *= gust;
            } else {
                const fade = Math.pow(1 - t, 0.55);
                data[i] *= fade;
            }
        }
        return buffer;
    }

    _createTreadBuffer(duration) {
        const ctx = this.context;
        const sampleCount = Math.max(1, Math.floor(ctx.sampleRate * duration));
        const buffer = ctx.createBuffer(1, sampleCount, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        let last = 0;
        const beatLength = 0.085;
        const phase = Math.random() * beatLength;

        for (let i = 0; i < sampleCount; i++) {
            const time = i / ctx.sampleRate;
            const beat = ((time + phase) % beatLength) / beatLength;
            const pulse = Math.exp(-beat * 10.5);
            const white = Math.random() * 2 - 1;
            last = last * 0.68 + white * 0.32;
            data[i] = last * (0.16 + pulse * 0.84) * 0.62;
        }

        return buffer;
    }

    _connectToCategory(node, category, spatial) {
        const ctx = this.context;
        const bus = this._categoryGain(category);
        const extraNodes = [];
        let output = node;

        const pan = panFromSpatial(spatial);
        if (Math.abs(pan) > 0.001 && typeof ctx.createStereoPanner === 'function') {
            const panner = ctx.createStereoPanner();
            panner.pan.setValueAtTime(pan, ctx.currentTime);
            output.connect(panner);
            output = panner;
            extraNodes.push(panner);
        }

        output.connect(bus);
        return (nodes = []) => {
            for (const cleanupNode of [...nodes, ...extraNodes]) {
                try { cleanupNode.disconnect(); } catch (_err) { /* already disconnected */ }
            }
        };
    }

    _ensureContext() {
        if (this.muted || !this.pageActive) return null;
        if (!this.context) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (!AudioContextClass) return null;
            try {
                this.context = new AudioContextClass();
                this._setupGraph();
            } catch (_error) {
                return null;
            }
        }
        if (this.context.state === 'suspended') {
            try {
                const resume = this.context.resume();
                if (resume && typeof resume.catch === 'function') resume.catch(() => {});
            } catch (_error) {
                return null;
            }
        }
        return this.context;
    }

    _setupGraph() {
        const ctx = this.context;
        this.masterGain = ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.muted ? 0 : MIX.master, ctx.currentTime);

        this.limiter = ctx.createDynamicsCompressor();
        this.limiter.threshold.setValueAtTime(-16, ctx.currentTime);
        this.limiter.knee.setValueAtTime(18, ctx.currentTime);
        this.limiter.ratio.setValueAtTime(8, ctx.currentTime);
        this.limiter.attack.setValueAtTime(0.004, ctx.currentTime);
        this.limiter.release.setValueAtTime(0.18, ctx.currentTime);

        this.masterGain.connect(this.limiter);
        this.limiter.connect(ctx.destination);
        Object.keys(MIX)
            .filter((category) => category !== 'master')
            .forEach((category) => this._categoryGain(category));
    }

    _categoryGain(category) {
        if (this.categoryGains.has(category)) return this.categoryGains.get(category);
        const ctx = this.context;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(MIX[category] ?? 0.5, ctx.currentTime);
        gain.connect(this.masterGain);
        this.categoryGains.set(category, gain);
        return gain;
    }

    _setMasterVolume(volume) {
        if (!this.context || !this.masterGain) return;
        this.masterGain.gain.setTargetAtTime(volume, this.context.currentTime, 0.025);
    }
}

function ambienceSettings(themeId) {
    if (themeId === 'desert') {
        return {
            duration: 3.6,
            color: 'dust',
            filterType: 'bandpass',
            frequency: 620,
            q: 0.8,
            volume: 0.040,
            lfoRate: 0.055,
            lfoDepth: 360,
            toneFrequency: null,
            toneVolume: 0,
        };
    }
    if (themeId === 'snow') {
        return {
            duration: 4.2,
            color: 'soft',
            filterType: 'bandpass',
            frequency: 440,
            q: 0.7,
            volume: 0.034,
            lfoRate: 0.045,
            lfoDepth: 280,
            toneFrequency: 116,
            toneVolume: 0.0035,
        };
    }
    return {
        duration: 3.8,
        color: 'soft',
        filterType: 'lowpass',
        frequency: 880,
        q: 0.65,
        volume: 0.030,
        lfoRate: 0.065,
        lfoDepth: 300,
        toneFrequency: null,
        toneVolume: 0,
    };
}

function panFromSpatial({ x = null, width = DEFAULT_FIELD_WIDTH } = {}) {
    if (!Number.isFinite(x) || !Number.isFinite(width) || width <= 0) return 0;
    return clamp((x / width) * 2 - 1, -1, 1) * 0.42;
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function randomRange(min, max) {
    return min + Math.random() * (max - min);
}
