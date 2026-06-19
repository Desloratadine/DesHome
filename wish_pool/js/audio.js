/**
 * Audio Module
 * Provides simple sound effects using the Web Audio API.
 * All sounds are generated procedurally (no external audio files needed).
 */
const Audio = (function () {
    'use strict';

    var _ctx = null;
    var _enabled = true;

    /**
     * Initialize the AudioContext (must be called from a user gesture).
     */
    function init() {
        try {
            _ctx = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('[Audio] Web Audio API not available.');
            _enabled = false;
        }
    }

    /**
     * Enable or disable audio.
     * @param {boolean} enabled
     */
    function setEnabled(enabled) {
        _enabled = enabled;
    }

    /**
     * Resume AudioContext if suspended (required by browser autoplay policy).
     */
    function resume() {
        if (_ctx && _ctx.state === 'suspended') {
            _ctx.resume();
        }
    }

    /**
     * Play a collision sound (short ping).
     * @param {number} pitch - Frequency in Hz (default: 520)
     * @param {number} duration - Duration in seconds (default: 0.1)
     */
    function playBounce(pitch, duration) {
        if (!_enabled || !_ctx) return;
        pitch = pitch || 520;
        duration = duration || 0.1;

        var osc = _ctx.createOscillator();
        var gain = _ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(pitch, _ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(pitch * 1.5, _ctx.currentTime + duration);

        gain.gain.setValueAtTime(0.15, _ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, _ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(_ctx.destination);

        osc.start();
        osc.stop(_ctx.currentTime + duration);
    }

    /**
     * Play a score sound (ascending chime).
     */
    function playScore() {
        if (!_enabled || !_ctx) return;

        var now = _ctx.currentTime;
        var notes = [523, 659, 784]; // C5, E5, G5

        for (var i = 0; i < notes.length; i++) {
            var osc = _ctx.createOscillator();
            var gain = _ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(notes[i], now + i * 0.08);
            gain.gain.setValueAtTime(0.1, now + i * 0.08);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.15);
            osc.connect(gain);
            gain.connect(_ctx.destination);
            osc.start(now + i * 0.08);
            osc.stop(now + i * 0.08 + 0.15);
        }
    }

    /**
     * Play a penalty sound (low buzz).
     */
    function playPenalty() {
        if (!_enabled || !_ctx) return;

        var now = _ctx.currentTime;
        var osc = _ctx.createOscillator();
        var gain = _ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.3);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

        osc.connect(gain);
        gain.connect(_ctx.destination);

        osc.start(now);
        osc.stop(now + 0.3);
    }

    /**
     * Play a game over sound.
     */
    function playGameOver() {
        if (!_enabled || !_ctx) return;

        var now = _ctx.currentTime;
        var notes = [523, 440, 350, 260];

        for (var i = 0; i < notes.length; i++) {
            var osc = _ctx.createOscillator();
            var gain = _ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(notes[i], now + i * 0.12);
            gain.gain.setValueAtTime(0.1, now + i * 0.12);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.25);
            osc.connect(gain);
            gain.connect(_ctx.destination);
            osc.start(now + i * 0.12);
            osc.stop(now + i * 0.12 + 0.25);
        }
    }

    return {
        init: init,
        setEnabled: setEnabled,
        resume: resume,
        playBounce: playBounce,
        playScore: playScore,
        playPenalty: playPenalty,
        playGameOver: playGameOver
    };
})();