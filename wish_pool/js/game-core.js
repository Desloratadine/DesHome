/**
 * Game Core Module
 * Manages the game state machine, main update loop,
 * ball spawning timer, score/countdown, and coordinates all sub-modules.
 */
const GameCore = (function () {
    'use strict';

    // Game states
    var STATE = {
        LOADING: 'LOADING',
        READY: 'READY',
        PLAYING: 'PLAYING',
        PAUSED: 'PAUSED',
        GAME_OVER: 'GAME_OVER'
    };

    var _state = STATE.LOADING;
    var _score = 0;
    var _countdown = 60;
    var _maxCountdown = 60;
    var _ballSpawnTimer = 0;
    var _ballSpawnInterval = 2.0;
    var _animFrameId = null;
    var _lastTime = 0;
    var _config = null;
    var _canvas = null;

    /**
     * Initialize game core - loads config first, then sets up game.
     * @param {HTMLCanvasElement} canvas
     * @param {Function} onReady - Callback when game is ready to start
     */
    function init(canvas, onReady) {
        _canvas = canvas;
        GameConfig.load().then(function (config) {
            _config = config;
            _maxCountdown = config.game.countdown;
            _ballSpawnInterval = config.game.ballSpawnInterval;

            // Initialize subsystems
            PhysicsEngine.init(config, config.game.width, config.game.height);
            Paddle.init(config.paddle, config.game.width, config.game.height);
            Ball.init(config.ballTypes, config.ball.maxSpeed);

            // Setup input
            InputHandler.init(canvas, onPaddleMove, onPauseToggle);

            _state = STATE.READY;

            if (onReady) onReady();
        });
    }

    /**
     * Start the game loop (requestAnimationFrame).
     * @param {HTMLCanvasElement} canvas
     */
    function start(canvas) {
        var w = _config.game.width;
        var h = _config.game.height;

        canvas.width = w;
        canvas.height = h;
        UIRenderer.init(canvas, w, h);

        _lastTime = performance.now();
        gameLoop(performance.now());
    }

    // --- Game Loop ---

    function gameLoop(timestamp) {
        var dt = (timestamp - _lastTime) / 1000;
        _lastTime = timestamp;

        // Cap delta to prevent tunneling at high speeds
        // Max 2 frames at 60fps (~33ms)
        if (dt > 0.033) dt = 0.033;

        update(dt);
        render();

        _animFrameId = requestAnimationFrame(gameLoop);
    }

    // --- Update ---

    function update(dt) {
        var gameWidth = _config.game.width;
        var gameHeight = _config.game.height;

        if (_state === STATE.PLAYING) {
            // Update countdown
            _countdown -= dt;
            if (_countdown <= 0) {
                _countdown = 0;
                setState(STATE.GAME_OVER);
                Audio.playGameOver();
                return;
            }

            // Spawn balls on timer
            _ballSpawnTimer += dt;
            if (_ballSpawnTimer >= _ballSpawnInterval) {
                _ballSpawnTimer -= _ballSpawnInterval;
                // Sync remaining time for spawn peak calculation
                Ball.setRemainingTime(_countdown);
                spawnBall();
            }

            // Update ball physics
            var balls = Ball.getAll();
            for (var i = balls.length - 1; i >= 0; i--) {
                var ball = balls[i];
                if (!ball.alive) continue;

                PhysicsEngine.updatePosition(ball, dt);

                // Wall collision
                if (PhysicsEngine.checkWallCollision(ball)) {
                    ball.bounceCount++;
                    _score += ball.points;
                    UIRenderer.addFloatingText(ball.x, ball.y, '+' + ball.points, ball.color);
                    Audio.playBounce(520 + ball.bounceCount * 30, 0.08);
                }

                // Paddle collision
                if (PhysicsEngine.checkPaddleCollision(ball, Paddle.getBounds())) {
                    ball.bounceCount++;
                    _score += ball.points;
                    Audio.playBounce(680, 0.1);
                }

                // Ball lost
                if (PhysicsEngine.isBallLost(ball, gameHeight)) {
                    _score -= ball.points;
                    Ball.removeBall(ball);
                    Audio.playPenalty();
                }
            }

            // Update ball lifetimes
            Ball.updateAll(dt);
            // Update floating score texts
            UIRenderer.updateFloatingTexts(dt);

        } else if (_state === STATE.READY || _state === STATE.GAME_OVER) {
            // Still need to update balls for visual effect
            Ball.updateAll(dt);
            // Keep floating texts animating
            UIRenderer.updateFloatingTexts(dt);
        }
    }

    // --- Render ---

    function render() {
        var ctx = UIRenderer.getContext();

        // Manage cursor based on state
        if (_canvas) {
            if (_state === STATE.PLAYING) {
                _canvas.style.cursor = 'none';
            } else {
                _canvas.style.cursor = 'default';
            }
        }

        UIRenderer.clear();
        UIRenderer.drawBackground();
        UIRenderer.drawWalls(_config.walls);

        // Draw paddle
        if (_state !== STATE.LOADING) {
            Paddle.draw(ctx);
        }

        // Draw balls
        Ball.drawAll(ctx);

        // Draw floating score texts
        UIRenderer.drawFloatingTexts();

        // State-specific overlays
        if (_state === STATE.PLAYING || _state === STATE.PAUSED) {
            UIRenderer.drawHUD(_score, _countdown, Ball.getCount());
        }

        if (_state === STATE.READY) {
            UIRenderer.drawReadyScreen();
        } else if (_state === STATE.GAME_OVER) {
            UIRenderer.drawGameOverScreen(_score);
        } else if (_state === STATE.PAUSED) {
            UIRenderer.drawPauseOverlay();
        }
    }

    // --- State Management ---

    function setState(newState) {
        _state = newState;
    }

    function getState() {
        return _state;
    }

    // --- Game Actions ---

    function startGame() {
        if (_state !== STATE.READY) return;

        _score = 0;
        _countdown = _maxCountdown;
        _ballSpawnTimer = 0;
        Ball.clearAll();
        Paddle.reset();
        Audio.resume();

        setState(STATE.PLAYING);
    }

    function restartGame() {
        _score = 0;
        _countdown = _maxCountdown;
        _ballSpawnTimer = 0;
        Ball.clearAll();
        Paddle.reset();
        Audio.resume();

        setState(STATE.PLAYING);
    }

    function togglePause() {
        if (_state === STATE.PLAYING) {
            setState(STATE.PAUSED);
        } else if (_state === STATE.PAUSED) {
            setState(STATE.PLAYING);
        }
    }

    // --- Callbacks ---

    function onPaddleMove(canvasX) {
        if (_state === STATE.PLAYING) {
            Paddle.moveTo(canvasX);
        }
    }

    function onPauseToggle() {
        togglePause();
    }

    function onCanvasClick(mx, my) {
        if (_state === STATE.READY) {
            if (UIRenderer.isStartButtonClicked(mx, my)) {
                startGame();
            }
        } else if (_state === STATE.GAME_OVER) {
            if (UIRenderer.isRestartButtonClicked(mx, my)) {
                restartGame();
            }
        }
    }

    // --- Helper ---

    function spawnBall() {
        var spawnData = PhysicsEngine.getRandomSpawn();
        var ball = Ball.spawn(spawnData);
        if (ball) {
            Audio.playBounce(400, 0.05);
        }
    }

    return {
        init: init,
        start: start,
        getState: getState,
        startGame: startGame,
        restartGame: restartGame,
        togglePause: togglePause,
        onCanvasClick: onCanvasClick,
        STATE: STATE
    };
})();