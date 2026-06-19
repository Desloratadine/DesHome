/**
 * TRPG Dice System - Main Script
 * Supports standard dice notation: NdN±M
 * Handles d4, d6, d8, d10, d12, d20, d100
 * Advantage / Disadvantage support (D&D 5e)
 */
(function () {
    'use strict';

    // ---- DOM References ----

    var diceInput = document.getElementById('diceInput');
    var rollBtn = document.getElementById('rollBtn');
    var resultArea = document.getElementById('resultArea');
    var diceFace = document.getElementById('diceFace');
    var totalValue = document.getElementById('totalValue');
    var resultBreakdown = document.getElementById('resultBreakdown');
    var resultFormula = document.getElementById('resultFormula');
    var historyList = document.getElementById('historyList');
    var clearHistoryBtn = document.getElementById('clearHistoryBtn');

    var quickBtns = document.querySelectorAll('[data-dice]');

    // ---- Anko DOM ----
    var ankoText = document.getElementById('ankoText');
    var insertRollBtn = document.getElementById('insertRollBtn');
    var insertSepBtn = document.getElementById('insertSepBtn');
    var toggleColorBtn = document.getElementById('toggleColorBtn');
    var exportLogBtn = document.getElementById('exportLogBtn');
    var importLogBtn = document.getElementById('importLogBtn');
    var clearLogBtn = document.getElementById('clearLogBtn');
    var fileInput = document.getElementById('fileInput');
    var ankoStatus = document.getElementById('ankoStatus');

    // ---- State ----
    var history = [];
    var _lastRollResult = null;

    // ---- Parse Dice Notation ----

    /**
     * Parse a dice expression like "2d6+3", "1d20-1", "3d10", "d20".
     * @param {string} expr - The dice expression
     * @returns {{count: number, sides: number, modifier: number}|null}
     */
    function parseDice(expr) {
        if (!expr || typeof expr !== 'string') return null;

        // Remove whitespace
        expr = expr.replace(/\s/g, '');

        // Match pattern: optional number + 'd' + number + optional modifier
        var match = expr.match(/^(\d+)?d(\d+)([+-]\d+)?$/i);
        if (!match) return null;

        var count = parseInt(match[1] || '1', 10);
        var sides = parseInt(match[2], 10);
        var modifier = match[3] ? parseInt(match[3], 10) : 0;

        // Validate
        if (count < 1 || count > 100) return null;
        if (![4, 6, 8, 10, 12, 20, 100].includes(sides)) return null;

        return { count: count, sides: sides, modifier: modifier };
    }

    // ---- Dice Rolling ----

    /**
     * Roll a single die.
     * @param {number} sides
     * @returns {number}
     */
    function rollDie(sides) {
        return Math.floor(Math.random() * sides) + 1;
    }

    /**
     * Roll multiple dice and return results.
     * @param {number} count
     * @param {number} sides
     * @returns {number[]}
     */
    function rollDice(count, sides) {
        var results = [];
        for (var i = 0; i < count; i++) {
            results.push(rollDie(sides));
        }
        return results;
    }

    /**
     * Execute a full dice roll with optional advantage/disadvantage.
     * @param {string} expr - Dice expression
     * @param {string} [advantage] - 'advantage', 'disadvantage', or undefined
     * @returns {{total: number, rolls: number[], sides: number, modifier: number, formula: string, breakdown: string, label: string}|null}
     */
    function executeRoll(expr, advantage) {
        if (advantage) {
            // Advantage/disadvantage: roll 2d20, take highest/lowest
            var parsed = parseDice('1d20');
            if (!parsed) return null;

            var roll1 = rollDie(20);
            var roll2 = rollDie(20);
            var chosen = advantage === 'advantage' ? Math.max(roll1, roll2) : Math.min(roll1, roll2);
            var total = chosen + parsed.modifier;

            var label = advantage === 'advantage' ? '优势' : '劣势';
            var breakdown = roll1 + ', ' + roll2 + ' → ' + label + ' ' + chosen;
            if (parsed.modifier !== 0) {
                breakdown += ' ' + (parsed.modifier > 0 ? '+' : '') + parsed.modifier;
            }
            var formula = '2d20' + (parsed.modifier !== 0 ? (parsed.modifier > 0 ? '+' : '') + parsed.modifier : '');

            return {
                total: total,
                rolls: [roll1, roll2],
                sides: 20,
                modifier: parsed.modifier,
                formula: formula + ' (' + label + ')',
                breakdown: breakdown,
                label: label
            };
        }

        var parsed = parseDice(expr);
        if (!parsed) return null;

        var rolls = rollDice(parsed.count, parsed.sides);
        var sum = rolls.reduce(function (a, b) { return a + b; }, 0);
        var total = sum + parsed.modifier;

        var formula = parsed.count + 'd' + parsed.sides;
        if (parsed.modifier !== 0) {
            formula += (parsed.modifier > 0 ? '+' : '') + parsed.modifier;
        }

        var breakdown = rolls.join(' + ');
        if (parsed.count > 1) {
            breakdown += ' = ' + sum;
        }
        if (parsed.modifier !== 0) {
            breakdown += ' ' + (parsed.modifier > 0 ? '+' : '') + parsed.modifier;
        }

        return {
            total: total,
            rolls: rolls,
            sides: parsed.sides,
            modifier: parsed.modifier,
            formula: formula,
            breakdown: breakdown,
            label: parsed.count + 'd' + parsed.sides
        };
    }

    // ---- UI Updates ----

    /**
     * Animate the dice face.
     */
    function animateDice() {
        diceFace.classList.remove('rolling');
        // Force reflow to restart animation
        void diceFace.offsetWidth;
        diceFace.classList.add('rolling');
    }

    /**
     * Display the roll result.
     * @param {Object} result
     */
    function displayResult(result) {
        // Animate dice
        animateDice();

        // Update dice face with the last roll value
        var displayValue = result.rolls[result.rolls.length - 1];
        diceFace.textContent = displayValue;

        // Update total
        totalValue.textContent = result.total;

        // Update breakdown
        resultBreakdown.textContent = result.breakdown;

        // Update formula
        resultFormula.textContent = result.formula;
    }

    /**
     * Reset the result display to idle state.
     */
    function resetDisplay() {
        totalValue.textContent = '—';
        resultBreakdown.textContent = '';
        resultFormula.textContent = '';
        diceFace.textContent = '?';
    }

    // ---- History ----

    /**
     * Add a roll to history.
     * @param {Object} result
     */
    function addHistory(result) {
        var entry = {
            total: result.total,
            formula: result.formula,
            breakdown: result.breakdown,
            time: new Date()
        };
        history.unshift(entry);
        renderHistory();

        // Limit history to 50 entries
        if (history.length > 50) {
            history.pop();
        }
    }

    /**
     * Render the history list.
     */
    function renderHistory() {
        if (history.length === 0) {
            historyList.innerHTML = '<p class="history-empty">暂无记录</p>';
            return;
        }

        var html = '';
        for (var i = 0; i < history.length; i++) {
            var h = history[i];
            var timeStr = pad(h.time.getHours()) + ':' + pad(h.time.getMinutes()) + ':' + pad(h.time.getSeconds());
            html += '' +
                '<div class="history-item">' +
                '  <div class="history-item-formula">' + escapeHtml(h.formula) + '</div>' +
                '  <div class="history-item-result">' +
                '    <span class="history-item-total">' + h.total + '</span>' +
                '    <span class="history-item-detail">' + escapeHtml(h.breakdown) + '</span>' +
                '  </div>' +
                '  <div class="history-item-time">' + timeStr + '</div>' +
                '</div>';
        }
        historyList.innerHTML = html;
        // Scroll to top
        historyList.scrollTop = 0;
    }

    /**
     * Clear all history.
     */
    function clearHistory() {
        history = [];
        renderHistory();
    }

    // ---- Helpers ----

    function pad(n) {
        return n < 10 ? '0' + n : '' + n;
    }

    function escapeHtml(str) {
        var div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }

    // ---- Main Roll Action ----

    /**
     * Perform a roll from the input or given expression.
     * @param {string} [expr] - Optional expression override
     * @param {string} [advantage] - Optional advantage type
     */
    function doRoll(expr, advantage) {
        var expression = expr || diceInput.value.trim();

        if (!expression) {
            diceInput.focus();
            return;
        }

        var result = executeRoll(expression, advantage);
        if (!result) {
            // Invalid expression — shake the input
            diceInput.style.borderColor = '#ef5350';
            setTimeout(function () {
                diceInput.style.borderColor = '';
            }, 600);
            return;
        }

        // Update input with the formula for consistency
        diceInput.value = expression;

        // Display result
        displayResult(result);
        addHistory(result);

        // Save last result for insertion into anko text
        _lastRollResult = result;
    }

    // ---- Anko: Text Insertion ----

    /**
     * Insert the last roll result at the cursor position in the anko textarea.
     */
    function insertRollResult() {
        if (!_lastRollResult) {
            ankoStatus.textContent = '! 请先掷骰';
            return;
        }

        var text = ankoText.value;
        var start = ankoText.selectionStart;
        var end = ankoText.selectionEnd;

        // Build insertion string: [formula → total]
        var insertion = '[' + _lastRollResult.formula + ' → ' + _lastRollResult.total + ']';

        // Insert at cursor
        ankoText.value = text.substring(0, start) + insertion + text.substring(end);

        // Move cursor after the inserted text
        var newPos = start + insertion.length;
        ankoText.selectionStart = newPos;
        ankoText.selectionEnd = newPos;
        ankoText.focus();

        ankoStatus.textContent = '已插入 ' + insertion;
        saveAnkoText();
    }

    // ---- Anko: localStorage Auto-Save ----

    var STORAGE_KEY = 'trpg_anko_text';

    function saveAnkoText() {
        try {
            localStorage.setItem(STORAGE_KEY, ankoText.value);
        } catch (e) {
            // Storage full or unavailable — silent fail
        }
    }

    function loadAnkoText() {
        try {
            var saved = localStorage.getItem(STORAGE_KEY);
            if (saved !== null) {
                ankoText.value = saved;
            }
        } catch (e) {
            // Silent fail
        }
    }

    // ---- Anko: Export & Import ----

    function exportLog() {
        var text = ankoText.value;
        if (!text.trim()) {
            ankoStatus.textContent = '! 文本为空，无需导出';
            return;
        }

        var blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'anko_log_' + getDateStr() + '.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        ankoStatus.textContent = '已导出 ' + a.download;
    }

    function importLog() {
        fileInput.click();
    }

    function handleFileImport(e) {
        var file = e.target.files[0];
        if (!file) return;

        var reader = new FileReader();
        reader.onload = function (event) {
            ankoText.value = event.target.result;
            saveAnkoText();
            ankoStatus.textContent = '已导入 ' + file.name + ' (' + file.size + ' 字节)';
        };
        reader.onerror = function () {
            ankoStatus.textContent = '! 读取文件失败';
        };
        reader.readAsText(file, 'UTF-8');

        // Reset file input so the same file can be re-imported
        fileInput.value = '';
    }

    function clearAnkoText() {
        if (ankoText.value.trim() && !confirm('确定清空所有文本？')) {
            return;
        }
        ankoText.value = '';
        saveAnkoText();
        ankoStatus.textContent = '文本已清空';
        ankoText.focus();
    }

    function getDateStr() {
        var d = new Date();
        return d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate());
    }

    // ---- Anko: Color Toggle ----

    var COLOR_KEY = 'trpg_anko_color';

    function toggleColor() {
        var isWhite = ankoText.classList.toggle('white-mode');
        toggleColorBtn.classList.toggle('btn-toggle-on', isWhite);
        try { localStorage.setItem(COLOR_KEY, isWhite ? 'white' : 'black'); } catch (e) {}
        ankoStatus.textContent = isWhite ? '已切换为白底黑字' : '已切换为黑底白字';
    }

    function loadColorPref() {
        try {
            var pref = localStorage.getItem(COLOR_KEY);
            if (pref === 'white') {
                ankoText.classList.add('white-mode');
                toggleColorBtn.classList.add('btn-toggle-on');
            }
        } catch (e) {}
    }

    // ---- Anko: Separator Insert ----

    function insertSeparator() {
        var text = ankoText.value;
        var start = ankoText.selectionStart;
        var end = ankoText.selectionEnd;

        var sep = '\n' + '——————————' + '\n';

        // If cursor is not at start of line, insert newline before separator
        var insertion = sep;
        if (start > 0 && text.charAt(start - 1) !== '\n') {
            insertion = '\n' + sep;
        }

        ankoText.value = text.substring(0, start) + insertion + text.substring(end);

        var newPos = start + insertion.length;
        ankoText.selectionStart = newPos;
        ankoText.selectionEnd = newPos;
        ankoText.focus();

        ankoStatus.textContent = '已插入分隔线';
        saveAnkoText();
    }

    // ---- Anko: Keyboard Shortcuts ----

    function setupAnkoShortcuts() {
        ankoText.addEventListener('keydown', function (e) {
            // Ctrl+Enter: insert roll result
            if (e.ctrlKey && e.key === 'Enter') {
                e.preventDefault();
                insertRollResult();
                return;
            }
            // Ctrl+Shift+- : insert separator
            if (e.ctrlKey && e.shiftKey && e.key === '-') {
                e.preventDefault();
                insertSeparator();
                return;
            }
        });
    }

    // ---- Anko: Auto-save on input ----

    function setupAnkoAutoSave() {
        var timer = null;
        ankoText.addEventListener('input', function () {
            if (timer) clearTimeout(timer);
            timer = setTimeout(function () {
                saveAnkoText();
                ankoStatus.textContent = '已自动保存';
                setTimeout(function () {
                    ankoStatus.textContent = '';
                }, 1500);
            }, 500);
        });
    }

    // ---- Event Binding ----

    // Roll button
    rollBtn.addEventListener('click', function () {
        doRoll();
    });

    // Enter key in input
    diceInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            doRoll();
        }
    });

    // Quick roll buttons
    for (var i = 0; i < quickBtns.length; i++) {
        (function (btn) {
            btn.addEventListener('click', function () {
                var dice = btn.getAttribute('data-dice');
                var adv = btn.getAttribute('data-advantage');
                doRoll(dice, adv);
            });
        })(quickBtns[i]);
    }

    // Clear history
    clearHistoryBtn.addEventListener('click', clearHistory);

    // ---- Anko Event Bindings ----
    insertRollBtn.addEventListener('click', insertRollResult);
    insertSepBtn.addEventListener('click', insertSeparator);
    toggleColorBtn.addEventListener('click', toggleColor);
    exportLogBtn.addEventListener('click', exportLog);
    importLogBtn.addEventListener('click', importLog);
    fileInput.addEventListener('change', handleFileImport);
    clearLogBtn.addEventListener('click', clearAnkoText);

    // ---- Init ----

    // Focus the dice input
    diceInput.focus();
    diceInput.select();

    // Load saved anko text from localStorage
    loadAnkoText();
    loadColorPref();
    setupAnkoAutoSave();
    setupAnkoShortcuts();

    // Show status
    ankoStatus.textContent = '就绪';

})();