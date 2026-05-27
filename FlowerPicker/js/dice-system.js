(function() {
    const { C, DOM, STATE } = window.GS;

    const DIRECTION_NAMES = { up: '上', down: '下', left: '左', right: '右' };
    const DIRECTION_ARROWS = { up: '↑', down: '↓', left: '←', right: '→' };
    let _isRolling = false;
    let _animatingDice = false;
    let _animTimeout = null;

    function rollAllDice() {
        if (_isRolling) return;
        // 取消旧的动画计时器，防止它清掉新骰子
        if (_animTimeout) {
            clearTimeout(_animTimeout);
            _animTimeout = null;
        }
        _animatingDice = false;
        _isRolling = true;
        const directions = ['up', 'down', 'left', 'right'];
        STATE.diceResults = [
            { type: 'rabbit', emoji: '🐰', name: '兔子', direction: directions[Math.floor(Math.random() * 4)] },
            { type: 'owl', emoji: '🦉', name: '猫头鹰', direction: directions[Math.floor(Math.random() * 4)] },
            { type: 'fox', emoji: '🦊', name: '狐狸', direction: directions[Math.floor(Math.random() * 4)] },
            { type: 'bear', emoji: '🐻', name: '熊', direction: directions[Math.floor(Math.random() * 4)] }
        ];
        STATE.diceRolled = true;

        checkAllSameCombo();
        updateDiceUI();
        _isRolling = false;
        if (window.UI) window.UI.showHint('🎲 骰子掷出！选择骰子指向的方向点亮地块触发效果', 'info');
    }

    function checkAllSameCombo() {
        if (!STATE.diceRolled || STATE.diceResults.length < 4) return false;
        const firstDir = STATE.diceResults[0].direction;
        const allSame = STATE.diceResults.every(d => d.direction === firstDir);
        if (allSame) {
            handleAllSameCombo(firstDir);
            return true;
        }
        return false;
    }

    function handleAllSameCombo(direction) {
        STATE.diceRolled = false;
        STATE.diceResults = [];
        updateDiceUI();

        const dirNames = { up: '上方', down: '下方', left: '左方', right: '右方' };
        if (window.UI) window.UI.showHint(`⚡ 所有骰子都指向${dirNames[direction]}！怪物被惊动，该方向地块直接被点亮！`, 'danger');

        const centerRow = Math.floor(C.GRID_SIZE / 2);
        const centerCol = Math.floor(C.GRID_SIZE / 2);
        let targetRow = centerRow, targetCol = centerCol;
        if (direction === 'up') targetRow = Math.max(0, centerRow - 1);
        else if (direction === 'down') targetRow = Math.min(C.GRID_SIZE - 1, centerRow + 1);
        else if (direction === 'left') targetCol = Math.max(0, centerCol - 1);
        else if (direction === 'right') targetCol = Math.min(C.GRID_SIZE - 1, centerCol + 1);

        const cell = STATE.grid[targetRow][targetCol];
        if (!cell.lit && !cell.withered) {
            if (window.GameCore) window.GameCore.lightNewTurf(targetRow, targetCol);
        }

        if (window.Monster) window.Monster.triggerStair();
    }

    function getTileDirection(row, col) {
        const fromRow = STATE.playerRow;
        const fromCol = STATE.playerCol;
        if (row === fromRow && col === fromCol) return null;
        const dRow = row - fromRow;
        const dCol = col - fromCol;
        if (Math.abs(dRow) >= Math.abs(dCol)) {
            return dRow < 0 ? 'up' : 'down';
        } else {
            return dCol < 0 ? 'left' : 'right';
        }
    }

    function getAlignedDice(row, col) {
        if (!STATE.diceRolled || STATE.diceResults.length === 0) return [];
        const tileDir = getTileDirection(row, col);
        if (!tileDir) return [];
        return STATE.diceResults.filter(d => d.direction === tileDir);
    }

    function triggerOnLight(row, col) {
        const aligned = getAlignedDice(row, col);
        if (aligned.length === 0) return;

        animateDiceItems(aligned);

        for (const dice of aligned) {
            executeDiceEffect(dice, row, col);
        }

        _animatingDice = true;
        _animTimeout = setTimeout(() => {
            _animTimeout = null;
            _animatingDice = false;
            STATE.diceRolled = false;
            STATE.diceResults = [];
            updateDiceUI();
        }, 550);

        STATE.diceRolled = false;
        STATE.diceResults = [];
    }

    function animateDiceItems(aligned) {
        const container = DOM.dicePanel;
        if (!container) return;
        const items = container.querySelectorAll('.dice-item');
        for (const dice of aligned) {
            const idx = STATE.diceResults.indexOf(dice);
            if (idx >= 0 && items[idx]) {
                items[idx].classList.add('activating');
            }
        }
    }

    function executeDiceEffect(dice, row, col) {
        const cell = STATE.grid[row][col];
        switch (dice.type) {
            case 'rabbit': {
                const extraFlowers = 3 + Math.floor(Math.random() * 3);
                const colors = ['#fff', '#f0f0f0', '#e0e0e0', '#d0d0d0'];
                for (let i = 0; i < extraFlowers; i++) {
                    cell.flowers.push({
                        x: Math.random() * (STATE.cellPixelSize - 10) + 5,
                        y: Math.random() * (STATE.cellPixelSize - 10) + 5,
                        color: colors[Math.floor(Math.random() * colors.length)]
                    });
                }
                if (window.UI) window.UI.showHint(`🐰 兔子骰子生效！地块(${row},${col})额外长出${extraFlowers}朵花！`, 'success');
                break;
            }
            case 'owl': {
                const activeHallucinations = [];
                if (STATE.maniaLevel > 0) activeHallucinations.push('mania');
                if (STATE.greedLevel > 0) activeHallucinations.push('greed');
                if (activeHallucinations.length > 0) {
                    const picked = activeHallucinations[Math.floor(Math.random() * activeHallucinations.length)];
                    if (picked === 'mania') {
                        STATE.maniaLevel = Math.max(0, STATE.maniaLevel - 1);
                        if (window.UI) window.UI.showHint(`🦉 猫头鹰骰子生效！躁狂等级降低至${STATE.maniaLevel}`, 'success');
                    } else {
                        STATE.greedLevel = Math.max(0, STATE.greedLevel - 1);
                        if (window.UI) window.UI.showHint(`🦉 猫头鹰骰子生效！贪婪等级降低至${STATE.greedLevel}`, 'success');
                    }
                } else {
                    if (window.UI) window.UI.showHint(`🦉 猫头鹰骰子生效！但所有幻觉等级已为0，无效果`, 'info');
                }
                break;
            }
            case 'fox': {
                const adjUnlit = [];
                const neighbors = [[row - 1, col], [row + 1, col], [row, col - 1], [row, col + 1]];
                for (const [nr, nc] of neighbors) {
                    if (nr >= 0 && nr < C.GRID_SIZE && nc >= 0 && nc < C.GRID_SIZE) {
                        const adjCell = STATE.grid[nr][nc];
                        if (!adjCell.lit && !adjCell.withered) {
                            adjUnlit.push({ row: nr, col: nc });
                        }
                    }
                }
                if (adjUnlit.length > 0) {
                    const target = adjUnlit[Math.floor(Math.random() * adjUnlit.length)];
                    const tCell = STATE.grid[target.row][target.col];
                    tCell.lit = true;
                    tCell.litIndex = STATE.litTilesHistory.length;
                    if (!tCell.isGuide) STATE.litCount++;
                    STATE.litTilesHistory.push({ row: target.row, col: target.col });
                    const flowerCount = window.GameCore ? window.GameCore.getNewTileFlowersMin() + Math.floor(Math.random() * (window.GameCore.getNewTileFlowersMax() - window.GameCore.getNewTileFlowersMin() + 1)) : 3;
                    const colors = ['#fff', '#f0f0f0', '#e0e0e0', '#d0d0d0'];
                    tCell.flowers = [];
                    for (let i = 0; i < flowerCount; i++) {
                        tCell.flowers.push({
                            x: Math.random() * (STATE.cellPixelSize - 10) + 5,
                            y: Math.random() * (STATE.cellPixelSize - 10) + 5,
                            color: colors[Math.floor(Math.random() * colors.length)]
                        });
                    }
                    const bounds = window.GameCore ? window.GameCore.getCellBounds(target.row, target.col) : null;
                    if (bounds && window.Particles) window.Particles.spawn(bounds.x + bounds.w / 2, bounds.y + bounds.h / 2, '#000', 8);
                    if (window.UI) window.UI.showHint(`🦊 狐狸骰子生效！额外点亮了地块(${target.row},${target.col})！`, 'success');
                } else {
                    if (window.UI) window.UI.showHint(`🦊 狐狸骰子生效！但无可扩展的相邻地块`, 'info');
                }
                break;
            }
            case 'bear': {
                if (STATE.maniaLevel < 3) {
                    STATE.maniaLevel = Math.min(3, STATE.maniaLevel + 1);
                    if (window.UI) window.UI.showHint(`🐻 熊骰子生效！躁狂等级提升至${STATE.maniaLevel}`, 'danger');
                } else if (STATE.greedLevel < 3) {
                    STATE.greedLevel = Math.min(3, STATE.greedLevel + 1);
                    if (window.UI) window.UI.showHint(`🐻 熊骰子生效！贪婪等级提升至${STATE.greedLevel}`, 'danger');
                } else {
                    if (window.UI) window.UI.showHint(`🐻 熊骰子生效！但幻觉等级已满，无效果`, 'warning');
                }
                break;
            }
        }
    }

    let _prevDiceKey = '';

    function updateDiceUI() {
        const container = DOM.dicePanel;
        if (!container) return;

        if (_animatingDice) return;

        const currentKey = STATE.diceRolled && STATE.diceResults.length > 0
            ? STATE.diceResults.map(d => d.type + d.direction).join(',')
            : '';
        if (currentKey === _prevDiceKey) return;
        _prevDiceKey = currentKey;

        let itemsContainer = container.querySelector('.dice-panel-items');
        if (!itemsContainer) {
            itemsContainer = document.createElement('div');
            itemsContainer.className = 'dice-panel-items';
            container.appendChild(itemsContainer);
        }

        itemsContainer.innerHTML = '';

        if (!STATE.diceRolled || STATE.diceResults.length === 0) return;

        for (const dice of STATE.diceResults) {
            const el = document.createElement('div');
            el.className = 'dice-item';
            el.innerHTML = `
                <span class="dice-emoji">${dice.emoji}</span>
                <span class="dice-name">${dice.name}</span>
                <span class="dice-direction">${DIRECTION_ARROWS[dice.direction]}</span>
            `;
            itemsContainer.appendChild(el);
        }
    }

    window.DiceSystem = {
        rollAllDice: rollAllDice,
        triggerOnLight: triggerOnLight,
        getAlignedDice: getAlignedDice,
        getTileDirection: getTileDirection,
        updateDiceUI: updateDiceUI
    };
})();