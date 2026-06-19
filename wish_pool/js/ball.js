/**
 * Ball Module
 * Manages ball entities: creation from ball types, lifecycle tracking,
 * rendering with trail effects.
 */
const Ball = (function () {
    'use strict';

    var _balls = [];
    var _ballTypes = [];
    var _maxSpeed = 500;
    var _remainingTime = 0;

    /**
     * Initialize ball system with ball type definitions.
     * @param {Array} ballTypes - Array of ball type configs from GameConfig
     * @param {number} maxSpeed - Global max speed cap
     */
    function init(ballTypes, maxSpeed) {
        _ballTypes = ballTypes;
        _maxSpeed = maxSpeed;
        _balls = [];
    }

    /**
     * Spawn a new ball at a given position with given velocity, using a random ball type.
     * @param {{x: number, y: number, vx: number, vy: number}} spawnData
     * @returns {Object|null} The created ball, or null if no type available
     */
    function spawn(spawnData) {
        var type = pickRandomType();
        if (!type) return null;

        var speed = type.initialSpeed || 300;
        var norm = Math.sqrt(spawnData.vx * spawnData.vx + spawnData.vy * spawnData.vy);
        if (norm === 0) norm = 1;

        var ball = {
            id: Date.now() + '_' + Math.random().toString(36).substr(2, 5),
            x: spawnData.x,
            y: spawnData.y,
            vx: (spawnData.vx / norm) * speed,
            vy: (spawnData.vy / norm) * speed,
            radius: type.radius,
            color: type.color,
            points: type.points,
            activeDuration: type.activeDuration,
            elapsed: 0,
            bounceCount: 0,
            typeId: type.id,
            alive: true,
            trail: []
        };

        _balls.push(ball);
        return ball;
    }

    /**
     * Update all active balls (position, collision states, lifetime).
     * @param {number} dt - Delta time in seconds
     */
    function updateAll(dt) {
        for (var i = _balls.length - 1; i >= 0; i--) {
            var ball = _balls[i];
            if (!ball.alive) {
                _balls.splice(i, 1);
                continue;
            }

            // Update lifetime
            ball.elapsed += dt;
            if (ball.elapsed >= ball.activeDuration) {
                ball.alive = false;
                _balls.splice(i, 1);
                continue;
            }

            // Cap speed
            var speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
            if (speed > _maxSpeed) {
                var scale = _maxSpeed / speed;
                ball.vx *= scale;
                ball.vy *= scale;
            }

            // Store trail position
            ball.trail.push({ x: ball.x, y: ball.y });
            if (ball.trail.length > 8) {
                ball.trail.shift();
            }
        }
    }

    /**
     * Draw all active balls with trail effects.
     * @param {CanvasRenderingContext2D} ctx
     */
    function drawAll(ctx) {
        for (var i = 0; i < _balls.length; i++) {
            var ball = _balls[i];
            if (!ball.alive) continue;

            // Draw trail
            for (var t = 0; t < ball.trail.length; t++) {
                var alpha = (t / ball.trail.length) * 0.3;
                ctx.fillStyle = ball.color + Math.round(alpha * 255).toString(16).padStart(2, '0');
                ctx.beginPath();
                ctx.arc(ball.trail[t].x, ball.trail[t].y, ball.radius * (t / ball.trail.length) * 0.6, 0, Math.PI * 2);
                ctx.fill();
            }

            // Draw ball
            ctx.fillStyle = ball.color;
            ctx.shadowColor = ball.color;
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            // Highlight
            ctx.fillStyle = 'rgba(255,255,255,0.35)';
            ctx.beginPath();
            ctx.arc(ball.x - ball.radius * 0.25, ball.y - ball.radius * 0.25, ball.radius * 0.35, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    /**
     * Mark a ball as no longer alive (removed on next update).
     * @param {Object} ball
     */
    function removeBall(ball) {
        ball.alive = false;
    }

    /**
     * Get all currently active balls.
     * @returns {Array}
     */
    function getAll() {
        return _balls;
    }

    /**
     * Get count of active balls.
     * @returns {number}
     */
    function getCount() {
        return _balls.length;
    }

    /**
     * Set current remaining countdown time (used for spawn peak calculation).
     * @param {number} remaining - Seconds remaining in the game
     */
    function setRemainingTime(remaining) {
        _remainingTime = remaining;
    }

    /**
     * Clear all balls.
     */
    function clearAll() {
        _balls = [];
    }

    // --- Private ---

    /**
     * Check if a ball type is currently in its spawn peak period.
     * @param {Object} type - Ball type config object
     * @returns {number} Effective spawn rate multiplier (1 if not in peak)
     */
    function getPeakMultiplier(type) {
        var peak = type.spawnPeak;
        if (!peak) return 1;
        // Check if remaining time falls within [endRemaining, startRemaining]
        if (_remainingTime <= peak.startRemaining && _remainingTime >= peak.endRemaining) {
            return peak.multiplier;
        }
        return 1;
    }

    function pickRandomType() {
        // Compute effective spawn rates with peak multipliers
        var effectiveRates = [];
        var effectiveTotal = 0;
        for (var i = 0; i < _ballTypes.length; i++) {
            var mult = getPeakMultiplier(_ballTypes[i]);
            var effectiveRate = _ballTypes[i].spawnRate * mult;
            effectiveRates.push(effectiveRate);
            effectiveTotal += effectiveRate;
        }

        if (effectiveTotal <= 0) return _ballTypes[0] || null;

        var roll = Math.random() * effectiveTotal;
        var cumulative = 0;
        for (var j = 0; j < _ballTypes.length; j++) {
            cumulative += effectiveRates[j];
            if (roll <= cumulative) {
                return _ballTypes[j];
            }
        }
        return _ballTypes[_ballTypes.length - 1] || null;
    }

    return {
        init: init,
        spawn: spawn,
        updateAll: updateAll,
        drawAll: drawAll,
        removeBall: removeBall,
        getAll: getAll,
        getCount: getCount,
        clearAll: clearAll,
        setRemainingTime: setRemainingTime
    };
})();