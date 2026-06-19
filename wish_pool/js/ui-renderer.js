/**
 * UI Renderer Module
 * Handles all canvas-based rendering: background, walls, HUD,
 * score display, countdown, game states.
 */
const UIRenderer = (function () {
    'use strict';

    var _canvas = null;
    var _ctx = null;
    var _width = 800;
    var _height = 600;
    var _floatingTexts = [];

    /**
     * Initialize renderer with a canvas element.
     * @param {HTMLCanvasElement} canvas
     * @param {number} width
     * @param {number} height
     */
    function init(canvas, width, height) {
        _canvas = canvas;
        _ctx = canvas.getContext('2d');
        _width = width;
        _height = height;
        _canvas.width = width;
        _canvas.height = height;
    }

    /**
     * Clear the entire canvas.
     */
    function clear() {
        _ctx.clearRect(0, 0, _width, _height);
    }

    /**
     * Draw the dot-pattern background.
     */
    function drawBackground() {
        var ctx = _ctx;

        // Gradient base
        var grad = ctx.createLinearGradient(0, 0, 0, _height);
        grad.addColorStop(0, '#e6f2ff');
        grad.addColorStop(1, '#ffffff');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, _width, _height);

        // Dots pattern
        ctx.fillStyle = 'rgba(144, 202, 249, 0.25)';
        var spacing = 30;
        for (var x = 0; x < _width; x += spacing) {
            for (var y = 0; y < _height; y += spacing) {
                ctx.beginPath();
                ctx.arc(x, y, 1.5, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    /**
     * Draw the three elastic walls (top, left, right).
     * @param {Object} wallConfig - Wall config from GameConfig
     */
    function drawWalls(wallConfig) {
        var ctx = _ctx;
        var w = wallConfig.width;
        var color = wallConfig.color;

        ctx.fillStyle = color;

        // Top wall
        ctx.fillRect(0, 0, _width, w);

        // Left wall
        ctx.fillRect(0, 0, w, _height);

        // Right wall
        ctx.fillRect(_width - w, 0, w, _height);

        // Wall glow effect
        ctx.shadowColor = 'rgba(144, 202, 249, 0.3)';
        ctx.shadowBlur = 10;
        ctx.fillRect(0, 0, _width, w);
        ctx.shadowBlur = 0;
    }

    /**
     * Draw the HUD: score, countdown, active balls count.
     * @param {number} score
     * @param {number} countdown
     * @param {number} ballCount
     */
    function drawHUD(score, countdown, ballCount) {
        var ctx = _ctx;

        // Score (top-left area)
        ctx.fillStyle = '#0d47a1';
        ctx.font = '600 22px "Segoe UI", "Microsoft YaHei", sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('得分: ' + Math.floor(score), 16, 36);

        // Ball count
        ctx.fillStyle = '#42a5f5';
        ctx.font = '14px "Segoe UI", "Microsoft YaHei", sans-serif';
        ctx.fillText('弹球: ' + ballCount, 16, 58);

        // Countdown (top-right)
        ctx.textAlign = 'right';
        var timeColor = countdown <= 10 ? '#e53935' : '#0d47a1';
        ctx.fillStyle = timeColor;
        ctx.font = '600 28px "Segoe UI", "Microsoft YaHei", sans-serif';
        ctx.fillText('剩余: ' + Math.ceil(countdown) + 's', _width - 16, 36);

        // Timer bar below top wall
        var barWidth = _width - 16;
        var barHeight = 4;
        var barX = 8;
        var barY = 8;
        var maxTime = GameConfig.get('game.countdown', 60);
        var fillRatio = Math.max(0, countdown / maxTime);

        ctx.fillStyle = 'rgba(0,0,0,0.08)';
        ctx.beginPath();
        ctx.roundRect(barX, barY, barWidth, barHeight, 2);
        ctx.fill();

        ctx.fillStyle = fillRatio > 0.3 ? '#43a047' : (fillRatio > 0.15 ? '#fdd835' : '#e53935');
        ctx.beginPath();
        ctx.roundRect(barX, barY, barWidth * fillRatio, barHeight, 2);
        ctx.fill();
    }

    /**
     * Draw the ready/start screen overlay.
     */
    function drawReadyScreen() {
        var ctx = _ctx;

        // Semi-transparent overlay
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.fillRect(0, 0, _width, _height);

        // Title
        ctx.fillStyle = '#0d47a1';
        ctx.font = '600 36px "Segoe UI", "Microsoft YaHei", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('弹球游戏', _width / 2, _height / 2 - 80);

        // Instructions
        ctx.fillStyle = '#1e88e5';
        ctx.font = '18px "Segoe UI", "Microsoft YaHei", sans-serif';
        ctx.fillText('鼠标左右移动控制球拍', _width / 2, _height / 2 - 30);

        ctx.fillStyle = '#42a5f5';
        ctx.font = '14px "Segoe UI", "Microsoft YaHei", sans-serif';
        ctx.fillText('接住弹球得分 · 掉落扣分 · 倒计时内争取最高分', _width / 2, _height / 2 + 5);

        // Start button
        var btnX = _width / 2 - 80;
        var btnY = _height / 2 + 50;
        var btnW = 160;
        var btnH = 48;

        ctx.fillStyle = '#1e88e5';
        ctx.beginPath();
        ctx.roundRect(btnX, btnY, btnW, btnH, 8);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = '600 20px "Segoe UI", "Microsoft YaHei", sans-serif';
        ctx.fillText('开始游戏', _width / 2, btnY + 31);

        // Store button bounds for click detection
        _startBtnBounds = { x: btnX, y: btnY, w: btnW, h: btnH };
    }

    var _startBtnBounds = null;

    /**
     * Check if a point is inside the start button.
     * @param {number} mx - Mouse x
     * @param {number} my - Mouse y
     * @returns {boolean}
     */
    function isStartButtonClicked(mx, my) {
        if (!_startBtnBounds) return false;
        var b = _startBtnBounds;
        return mx >= b.x && mx <= b.x + b.w && my >= b.y && my <= b.y + b.h;
    }

    /**
     * Draw the game over screen with final score.
     * @param {number} score
     */
    function drawGameOverScreen(score) {
        var ctx = _ctx;

        ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.fillRect(0, 0, _width, _height);

        ctx.fillStyle = '#0d47a1';
        ctx.font = '600 36px "Segoe UI", "Microsoft YaHei", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('游戏结束', _width / 2, _height / 2 - 80);

        ctx.fillStyle = '#1e88e5';
        ctx.font = '600 28px "Segoe UI", "Microsoft YaHei", sans-serif';
        ctx.fillText('最终得分: ' + Math.floor(score), _width / 2, _height / 2 - 25);

        // Restart button
        var btnX = _width / 2 - 80;
        var btnY = _height / 2 + 30;
        var btnW = 160;
        var btnH = 48;

        ctx.fillStyle = '#1e88e5';
        ctx.beginPath();
        ctx.roundRect(btnX, btnY, btnW, btnH, 8);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = '600 20px "Segoe UI", "Microsoft YaHei", sans-serif';
        ctx.fillText('再来一局', _width / 2, btnY + 31);

        _restartBtnBounds = { x: btnX, y: btnY, w: btnW, h: btnH };
    }

    var _restartBtnBounds = null;

    /**
     * Check if a point is inside the restart button.
     * @param {number} mx
     * @param {number} my
     * @returns {boolean}
     */
    function isRestartButtonClicked(mx, my) {
        if (!_restartBtnBounds) return false;
        var b = _restartBtnBounds;
        return mx >= b.x && mx <= b.x + b.w && my >= b.y && my <= b.y + b.h;
    }

    /**
     * Draw the pause overlay.
     */
    function drawPauseOverlay() {
        var ctx = _ctx;

        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.fillRect(0, 0, _width, _height);

        ctx.fillStyle = '#0d47a1';
        ctx.font = '600 32px "Segoe UI", "Microsoft YaHei", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('暂停', _width / 2, _height / 2 - 10);

        ctx.fillStyle = '#42a5f5';
        ctx.font = '14px "Segoe UI", "Microsoft YaHei", sans-serif';
        ctx.fillText('按 Space 键继续', _width / 2, _height / 2 + 30);
    }

    /**
     * Get the canvas dimensions.
     * @returns {{width: number, height: number}}
     */
    function getDimensions() {
        return { width: _width, height: _height };
    }

    /**
     * Add a floating score text at the given position.
     * @param {number} x
     * @param {number} y
     * @param {string} text - e.g. "+10"
     * @param {string} color - CSS color
     */
    function addFloatingText(x, y, text, color) {
        _floatingTexts.push({
            x: x,
            y: y,
            text: text,
            color: color,
            alpha: 1.0,
            vy: -60,
            life: 1.2
        });
    }

    /**
     * Update floating texts (movement, fade, cleanup).
     * @param {number} dt - Delta time in seconds
     */
    function updateFloatingTexts(dt) {
        for (var i = _floatingTexts.length - 1; i >= 0; i--) {
            var ft = _floatingTexts[i];
            ft.life -= dt;
            if (ft.life <= 0) {
                _floatingTexts.splice(i, 1);
                continue;
            }
            ft.y += ft.vy * dt;
            ft.alpha = Math.max(0, ft.life / 1.2);
        }
    }

    /**
     * Draw all floating score texts.
     */
    function drawFloatingTexts() {
        var ctx = _ctx;
        for (var i = 0; i < _floatingTexts.length; i++) {
            var ft = _floatingTexts[i];
            ctx.save();
            ctx.globalAlpha = ft.alpha;
            ctx.fillStyle = ft.color;
            ctx.font = 'bold 20px "Segoe UI", "Microsoft YaHei", sans-serif';
            ctx.textAlign = 'center';
            ctx.shadowColor = 'rgba(0,0,0,0.15)';
            ctx.shadowBlur = 4;
            ctx.fillText(ft.text, ft.x, ft.y);
            ctx.restore();
        }
    }

    /**
     * Get the canvas context.
     * @returns {CanvasRenderingContext2D}
     */
    function getContext() {
        return _ctx;
    }

    return {
        init: init,
        clear: clear,
        drawBackground: drawBackground,
        drawWalls: drawWalls,
        drawHUD: drawHUD,
        drawReadyScreen: drawReadyScreen,
        drawGameOverScreen: drawGameOverScreen,
        drawPauseOverlay: drawPauseOverlay,
        drawFloatingTexts: drawFloatingTexts,
        addFloatingText: addFloatingText,
        updateFloatingTexts: updateFloatingTexts,
        isStartButtonClicked: isStartButtonClicked,
        isRestartButtonClicked: isRestartButtonClicked,
        getDimensions: getDimensions,
        getContext: getContext
    };
})();