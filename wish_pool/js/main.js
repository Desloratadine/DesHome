/**
 * Main Entry Point
 * Initializes all game modules, sets up the canvas,
 * and starts the game when the DOM is ready.
 */
(function () {
    'use strict';

    var canvas = document.getElementById('gameCanvas');
    if (!canvas) {
        console.error('[Main] Canvas element #gameCanvas not found.');
        return;
    }

    // Initialize audio (requires user gesture to fully activate)
    Audio.init();

    // Initialize renderer
    UIRenderer.init(canvas, 800, 600);

    // Initialize game core (loads config-data.js internally)
    GameCore.init(canvas, function () {
        // Config loaded, game ready — start the render loop
        GameCore.start(canvas);
    });

    // Canvas click handler for start/restart buttons
    canvas.addEventListener('click', function (e) {
        var rect = canvas.getBoundingClientRect();
        var mx = e.clientX - rect.left;
        var my = e.clientY - rect.top;

        // Scale to canvas coordinate space
        var scaleX = canvas.width / rect.width;
        var scaleY = canvas.height / rect.height;
        mx *= scaleX;
        my *= scaleY;

        GameCore.onCanvasClick(mx, my);

        // Resume audio on first user interaction
        Audio.resume();
    });

})();