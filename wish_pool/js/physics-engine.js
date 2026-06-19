/**
 * Physics Engine Module
 * Handles collision detection between balls, walls, and paddle.
 * Computes bounce velocities and manages boundary constraints.
 */
const PhysicsEngine = (function () {
    'use strict';

    var _wallElasticity = 0.85;
    var _wallWidth = 4;
    var _gameWidth = 800;
    var _gameHeight = 600;
    var _gravity = 0;

    /**
     * Initialize the physics engine with game dimensions and wall properties.
     * @param {Object} config - Wall and game config from GameConfig
     */
    function init(config) {
        _wallElasticity = config.walls.elasticity;
        _wallWidth = config.walls.width;
        _gameWidth = config.game.width;
        _gameHeight = config.game.height;
        _gravity = config.physics ? (config.physics.gravity || 0) : 0;
    }

    /**
     * Check and resolve ball collision with all three walls (top, left, right).
     * Returns true if any wall collision occurred.
     * @param {Object} ball - Ball object with {x, y, vx, vy, radius}
     * @returns {boolean} Whether a collision occurred
     */
    function checkWallCollision(ball) {
        var collided = false;
        var r = ball.radius;

        // Top wall
        if (ball.y - r <= _wallWidth) {
            ball.y = _wallWidth + r;
            ball.vy = Math.abs(ball.vy) * _wallElasticity;
            collided = true;
        }

        // Left wall
        if (ball.x - r <= _wallWidth) {
            ball.x = _wallWidth + r;
            ball.vx = Math.abs(ball.vx) * _wallElasticity;
            collided = true;
        }

        // Right wall
        if (ball.x + r >= _gameWidth - _wallWidth) {
            ball.x = _gameWidth - _wallWidth - r;
            ball.vx = -Math.abs(ball.vx) * _wallElasticity;
            collided = true;
        }

        return collided;
    }

    /**
     * Check and resolve ball collision with the paddle.
     * Includes anti-tunneling margin for high-speed balls.
     * @param {Object} ball - Ball object with {x, y, vx, vy, radius}
     * @param {Object} paddle - Paddle object with {x, y, width, height}
     * @returns {boolean} Whether a collision occurred
     */
    function checkPaddleCollision(ball, paddle) {
        // Anti-tunneling margin: 1 frame of vertical movement at 60fps
        var speedMargin = Math.abs(ball.vy) / 60;

        // Quick bounding-box check with expanded vertical margin
        if (ball.y + ball.radius < paddle.y - speedMargin) return false;
        if (ball.y - ball.radius > paddle.y + paddle.height) return false;
        if (ball.x + ball.radius < paddle.x) return false;
        if (ball.x - ball.radius > paddle.x + paddle.width) return false;

        // Ball is moving downward — only reflect when falling
        if (ball.vy < 0) return false;

        // Calculate reflection based on where ball hits the paddle (for angled bounce)
        var hitPos = (ball.x - paddle.x) / paddle.width; // 0..1
        hitPos = Math.max(0, Math.min(1, hitPos));

        // Map hit position to angle: -60° to +60°
        var angle = (hitPos - 0.5) * Math.PI / 3;
        var speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);

        // Clamp minimum speed
        speed = Math.max(speed, 200);

        ball.vx = speed * Math.sin(angle);
        ball.vy = -Math.abs(speed * Math.cos(angle));

        // Push ball above paddle
        ball.y = paddle.y - ball.radius;

        return true;
    }

    /**
     * Update ball position by time delta, applying gravity.
     * @param {Object} ball - Ball object
     * @param {number} dt - Delta time in seconds
     */
    function updatePosition(ball, dt) {
        // Apply gravity
        ball.vy += _gravity * dt;
        ball.x += ball.vx * dt;
        ball.y += ball.vy * dt;
    }

    /**
     * Check if ball has fallen below the paddle (off screen bottom).
     * @param {Object} ball
     * @param {number} gameHeight
     * @returns {boolean}
     */
    function isBallLost(ball, gameHeight) {
        return ball.y - ball.radius > gameHeight;
    }

    /**
     * Generate a random spawn position along the left wall.
     * @returns {{x: number, y: number}}
     */
    function getLeftSpawnPosition() {
        var margin = 60;
        return {
            x: _wallWidth + 20,
            y: margin + Math.random() * (_gameHeight / 2 - margin)
        };
    }

    /**
     * Generate a random spawn position along the right wall.
     * @returns {{x: number, y: number}}
     */
    function getRightSpawnPosition() {
        var margin = 60;
        return {
            x: _gameWidth - _wallWidth - 20,
            y: margin + Math.random() * (_gameHeight / 2 - margin)
        };
    }

    /**
     * Get a random spawn position from the left or right wall.
     * @returns {{x: number, y: number, vx: number, vy: number}}
     */
    function getRandomSpawn() {
        var fromLeft = Math.random() < 0.5;
        var pos;

        if (fromLeft) {
            pos = getLeftSpawnPosition();
            pos.vx = 1;
            pos.vy = Math.random() * 0.5 + 0.2;
        } else {
            pos = getRightSpawnPosition();
            pos.vx = -1;
            pos.vy = Math.random() * 0.5 + 0.2;
        }

        return pos;
    }

    return {
        init: init,
        checkWallCollision: checkWallCollision,
        checkPaddleCollision: checkPaddleCollision,
        updatePosition: updatePosition,
        isBallLost: isBallLost,
        getRandomSpawn: getRandomSpawn
    };
})();