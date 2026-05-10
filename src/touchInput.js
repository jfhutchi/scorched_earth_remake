// Touch / pointer input wiring for the on-screen mobile control pad.
// Hold buttons (aim, power, move) repeat their associated key while pressed;
// one-shot buttons (fire, weapon, restart, next, menu, mute) trigger once per tap.

const REPEAT_ACTIONS = new Set([
    'aimLeft', 'aimRight', 'powerUp', 'powerDown', 'moveLeft', 'moveRight',
]);

export function initTouchInput(game, container) {
    if (!container) return;

    const buttons = Array.from(container.querySelectorAll('[data-touch-action]'));
    const activePointers = new Map();

    function release(button) {
        if (!button) return;
        const action = button.dataset.touchAction;
        button.classList.remove('pressed');
        if (REPEAT_ACTIONS.has(action)) game.touchHoldEnd(action);
    }

    for (const button of buttons) {
        const action = button.dataset.touchAction;

        // Suppress synthetic mouse events that follow touch and prevent the
        // browser from interpreting fast taps as a zoom gesture.
        button.addEventListener('contextmenu', (e) => e.preventDefault());
        button.addEventListener('dblclick', (e) => e.preventDefault());

        button.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            if (e.pointerType !== 'mouse') {
                try { button.setPointerCapture(e.pointerId); } catch (_err) { /* ignore */ }
            }
            if (button.disabled) return;
            activePointers.set(e.pointerId, button);
            button.classList.add('pressed');

            if (REPEAT_ACTIONS.has(action)) {
                game.touchHoldStart(action);
            } else {
                game.touchTap(action);
            }
            // Avoid focus stealing so the canvas keeps keyboard focus on hybrid devices.
            if (button.blur) setTimeout(() => button.blur(), 0);
        });

        const endHandler = (e) => {
            const target = activePointers.get(e.pointerId);
            activePointers.delete(e.pointerId);
            release(target || button);
        };

        button.addEventListener('pointerup', endHandler);
        button.addEventListener('pointercancel', endHandler);
        button.addEventListener('pointerleave', (e) => {
            // Releasing only on leave when the button was actually pressed by this pointer.
            if (activePointers.get(e.pointerId) === button) {
                activePointers.delete(e.pointerId);
                release(button);
            }
        });
    }

    // Safety net: if pointer events are lost (orientation change, page hidden,
    // window blur) clear all hold states so the tank doesn't drift.
    const releaseAll = () => {
        activePointers.forEach((btn) => release(btn));
        activePointers.clear();
        if (typeof game.clearTouchHolds === 'function') game.clearTouchHolds();
    };
    window.addEventListener('blur', releaseAll);
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) releaseAll();
    });
    window.addEventListener('orientationchange', releaseAll);

    // Block the iOS double-tap zoom on the touch container itself.
    container.addEventListener('touchmove', (e) => {
        if (e.target && e.target.closest('[data-touch-action]')) e.preventDefault();
    }, { passive: false });
    container.addEventListener('gesturestart', (e) => e.preventDefault());

    return { releaseAll };
}

// Updates the touch container visibility and per-button enabled state based on
// game phase. Hold-action buttons are dimmed and disabled when the human
// player can't act; one-shot navigation buttons remain available.
export function updateTouchControlsState(game, container) {
    if (!container) return;
    const phase = game.phase;
    const canControl = game.canHumanControl();
    const inMenu = phase === 'menu';

    container.classList.toggle('hidden', inMenu);
    container.setAttribute('aria-hidden', inMenu ? 'true' : 'false');

    const interactiveActions = ['aimLeft', 'aimRight', 'powerUp', 'powerDown', 'moveLeft', 'moveRight', 'fire', 'weapon'];
    const buttons = container.querySelectorAll('[data-touch-action]');
    buttons.forEach((btn) => {
        const action = btn.dataset.touchAction;
        if (interactiveActions.includes(action)) {
            btn.disabled = !canControl;
            btn.classList.toggle('locked', !canControl);
        } else if (action === 'next') {
            const matchComplete = phase === 'roundSummary' && game.matchWinnerIndex !== null;
            btn.disabled = matchComplete;
            btn.classList.toggle('locked', matchComplete);
        } else {
            btn.disabled = false;
            btn.classList.remove('locked');
        }
    });
}
