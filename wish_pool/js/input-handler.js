/**
 * Input Handler Module
 * Manages mouse and keyboard input for paddle control and game actions.
 */
const InputHandler = (function () {
    'use strict';

    var _paddleMoveCallback = null;
    var _pauseToggleCallback = null;
    var _canvas = null;
    var _canvasRect = null;

    /**
     * Initialize input handling.
     * @param {HTMLCanvasElement} canvas
     * @param {Function} onPaddleMove - Called with mouse x position relative to canvas
     * @param {Function} onPauseToggle - Called when Space is pressed
     */
    function init(canvas, onPaddleMove, onPauseToggle) {
        _canvas = canvas;
        _paddleMoveCallback = onPaddleMove;
        _pauseToggleCallback = onPauseToggle;

        // Mouse move
        _canvas.addEventListener('mousemove', onMouseMove);

        // Touch move for mobile
        _canvas.addEventListener('touchmove', onTouchMove, { passive: true });

        // Keyboard
        window.addEventListener('keydown', onKeyDown);
    }

    /**
     * Update cached canvas rect (call on resize or when needed).
     */
    function updateRect() {
        if (_canvas) {
            _canvasRect = _canvas.getBoundingClientRect();
        }
    }

    /**
     * Destroy event listeners.
     */
    function destroy() {
        if (_canvas) {
            _canvas.removeEventListener('mousemove', onMouseMove);
            _canvas.removeEventListener('touchmove', onTouchMove);
        }
        window.removeEventListener('keydown', onKeyDown);
        _paddleMoveCallback = null;
        _pauseToggleCallback = null;
    }

    // --- Event handlers ---

    function onMouseMove(e) {
        if (!_canvas || !_paddleMoveCallback) return;
        updateRect();
        var rect = _canvasRect;
        var canvasX = (e.clientX - rect.left) * (_canvas.width / rect.width);
        _paddleMoveCallback(canvasX);
    }

    function onTouchMove(e) {
        if (!_canvas || !_paddleMoveCallback) return;
        e.preventDefault();
        updateRect();
        var rect = _canvasRect;
        var touch = e.touches[0];
        if (touch) {
            var canvasX = (touch.clientX - rect.left) * (_canvas.width / rect.width);
            _paddleMoveCallback(canvasX);
        }
    }

    function onKeyDown(e) {
        // Space for pause toggle
        if (e.code === 'Space') {
            e.preventDefault();
            if (_pauseToggleCallback) {
                _pauseToggleCallback();
            }
        }
    }

    return {
        init: init,
        updateRect: updateRect,
        destroy: destroy
    };
})();