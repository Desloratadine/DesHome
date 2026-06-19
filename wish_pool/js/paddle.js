/**
 * Paddle Module
 * Manages paddle position, dimensions, and rendering on the canvas.
 */
const Paddle = (function () {
    'use strict';

    var _paddle = {
        x: 0,
        y: 0,
        width: 120,
        height: 14,
        color: '#1e88e5'
    };

    var _gameWidth = 800;
    var _gameHeight = 600;
    var _yOffset = 30;

    /**
     * Create and place the paddle at starting position.
     * @param {Object} config - Paddle configuration from GameConfig
     * @param {number} gameWidth - Canvas width
     * @param {number} gameHeight - Canvas height
     */
    function init(config, gameWidth, gameHeight) {
        _paddle.width = config.width;
        _paddle.height = config.height;
        _paddle.color = config.color;
        _yOffset = config.yOffset;
        _gameWidth = gameWidth;
        _gameHeight = gameHeight;

        _paddle.x = (_gameWidth - _paddle.width) / 2;
        _paddle.y = _gameHeight - _paddle.height - _yOffset;
    }

    /**
     * Move paddle to an x position (clamped within bounds).
     * @param {number} targetX - Desired center x position
     */
    function moveTo(targetX) {
        _paddle.x = targetX - _paddle.width / 2;

        // Clamp within game bounds
        if (_paddle.x < 0) _paddle.x = 0;
        if (_paddle.x + _paddle.width > _gameWidth) {
            _paddle.x = _gameWidth - _paddle.width;
        }
    }

    /**
     * Reset paddle to center position.
     */
    function reset() {
        _paddle.x = (_gameWidth - _paddle.width) / 2;
        _paddle.y = _gameHeight - _paddle.height - _yOffset;
    }

    /**
     * Get paddle bounding box data for collision detection.
     * @returns {{x: number, y: number, width: number, height: number}}
     */
    function getBounds() {
        return {
            x: _paddle.x,
            y: _paddle.y,
            width: _paddle.width,
            height: _paddle.height
        };
    }

    /**
     * Render the paddle on the canvas context.
     * @param {CanvasRenderingContext2D} ctx
     */
    function draw(ctx) {
        // Main body
        ctx.fillStyle = _paddle.color;
        ctx.beginPath();
        ctx.roundRect(_paddle.x, _paddle.y, _paddle.width, _paddle.height, 6);
        ctx.fill();

        // Glossy highlight
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        ctx.beginPath();
        ctx.roundRect(
            _paddle.x + 4,
            _paddle.y + 3,
            _paddle.width - 8,
            _paddle.height / 2 - 2,
            3
        );
        ctx.fill();
    }

    return {
        init: init,
        moveTo: moveTo,
        reset: reset,
        getBounds: getBounds,
        draw: draw
    };
})();