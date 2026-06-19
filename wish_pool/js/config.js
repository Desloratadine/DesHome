/**
 * Config Module
 * Provides synchronous access to the centralized game configuration.
 * Reads from CONFIG_DATA (defined in config-data.js via <script> tag).
 */
const GameConfig = (function () {
    'use strict';

    var _config = null;

    /**
     * Load configuration from the CONFIG_DATA global.
     * @returns {Promise<Object>} Resolves with the frozen config object.
     */
    function load() {
        if (_config) {
            return Promise.resolve(_config);
        }

        if (typeof CONFIG_DATA === 'undefined') {
            console.error('[Config] CONFIG_DATA is not defined. Using fallback defaults.');
            _config = deepFreeze(getDefaultConfig());
        } else {
            _config = deepFreeze(CONFIG_DATA);
        }

        return Promise.resolve(_config);
    }

    /**
     * Get a config value by dot-separated path.
     * @param {string} path - e.g. "game.countdown"
     * @param {*} fallback - Value returned if path not found
     * @returns {*} The config value or fallback
     */
    function get(path, fallback) {
        if (!_config) return fallback;

        var keys = path.split('.');
        var current = _config;

        for (var i = 0; i < keys.length; i++) {
            if (current == null || typeof current !== 'object') {
                return fallback;
            }
            current = current[keys[i]];
        }

        return current !== undefined ? current : fallback;
    }

    /**
     * Check if config has been loaded.
     * @returns {boolean}
     */
    function isLoaded() {
        return _config !== null;
    }

    /**
     * Get the raw config object (read-only).
     * @returns {Object|null}
     */
    function getAll() {
        return _config;
    }

    // --- Helpers ---

    function deepFreeze(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        var propNames = Object.getOwnPropertyNames(obj);
        for (var i = 0; i < propNames.length; i++) {
            var prop = obj[propNames[i]];
            obj[propNames[i]] = deepFreeze(prop);
        }
        return Object.freeze(obj);
    }

    function getDefaultConfig() {
        return {
            game: { countdown: 60, ballSpawnInterval: 2.0, width: 800, height: 600 },
            paddle: { width: 120, height: 14, color: '#1e88e5', yOffset: 30 },
            walls: { elasticity: 0.85, color: '#90caf9', width: 4 },
            ball: { radius: 10, initialSpeed: 300, maxSpeed: 500, color: '#0d47a1', trailAlpha: 0.3 },
            ballTypes: [
                { id: 'normal', bounceCount: 0, activeDuration: 15.0, spawnRate: 0.5, points: 10, radius: 10, color: '#0d47a1', initialSpeed: 300 }
            ]
        };
    }

    return {
        load: load,
        get: get,
        isLoaded: isLoaded,
        getAll: getAll
    };
})();