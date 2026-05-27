(function() {
    const { C, DOM, STATE, shuffleArray } = window.GS;

    // ==================== 层数相关计算 ====================
    function getFlowersToLight() {
        const layerIndex = Math.min(STATE.currentLayer - 1, C.LAYER_FLOWERS_TO_LIGHT.length - 1);
        return C.LAYER_FLOWERS_TO_LIGHT[layerIndex];
    }

    function getNewTileFlowersMin() {
        const layerIndex = Math.min(STATE.currentLayer - 1, C.layerFlowerRanges.length - 1);
        return C.layerFlowerRanges[layerIndex].min;
    }

    function getNewTileFlowersMax() {
        const layerIndex = Math.min(STATE.currentLayer - 1, C.layerFlowerRanges.length - 1);
        return C.layerFlowerRanges[layerIndex].max;
    }

    function getLayerTheme() {
        const themes = ['浅草', '湿地', '荆棘', '深渊'];
        return themes[STATE.currentLayer - 1] || '浅草';
    }

    // ==================== 网格计算 ====================
    function getGridOffset() {
        const totalGridSize = C.GRID_SIZE * STATE.cellPixelSize + (C.GRID_SIZE - 1) * C.CELL_GAP;
        const offsetX = (STATE.canvasCSSWidth - totalGridSize) / 2;
        const offsetY = (STATE.canvasCSSHeight - totalGridSize) / 2;
        return { offsetX, offsetY, totalGridSize };
    }

    function getCellBounds(row, col) {
        const { offsetX, offsetY } = getGridOffset();
        const x = offsetX + col * (STATE.cellPixelSize + C.CELL_GAP);
        const y = offsetY + row * (STATE.cellPixelSize + C.CELL_GAP);
        return { x, y, w: STATE.cellPixelSize, h: STATE.cellPixelSize };
    }

    function getCellFromPoint(px, py) {
        const { offsetX, offsetY } = getGridOffset();
        for (let row = 0; row < C.GRID_SIZE; row++) {
            for (let col = 0; col < C.GRID_SIZE; col++) {
                const cx = offsetX + col * (STATE.cellPixelSize + C.CELL_GAP);
                const cy = offsetY + row * (STATE.cellPixelSize + C.CELL_GAP);
                if (px >= cx && px <= cx + STATE.cellPixelSize &&
                    py >= cy && py <= cy + STATE.cellPixelSize) {
                    return { row, col };
                }
            }
        }
        return null;
    }

    function isAdjacentToLit(row, col) {
        if (STATE.grid[row][col].lit) return false;
        const neighbors = [
            [row - 1, col], [row + 1, col],
            [row, col - 1], [row, col + 1]
        ];
        for (const [nr, nc] of neighbors) {
            if (nr >= 0 && nr < C.GRID_SIZE && nc >= 0 && nc < C.GRID_SIZE &&
                STATE.grid[nr][nc].lit) {
                return true;
            }
        }
        return false;
    }

    function getAdjacentLitCells(row, col) {
        const neighbors = [
            [row - 1, col], [row + 1, col],
            [row, col - 1], [row, col + 1]
        ];
        const litNeighbors = [];
        for (const [nr, nc] of neighbors) {
            if (nr >= 0 && nr < C.GRID_SIZE && nc >= 0 && nc < C.GRID_SIZE &&
                STATE.grid[nr][nc].lit) {
                litNeighbors.push({ row: nr, col: nc });
            }
        }
        return litNeighbors;
    }

    // ==================== 花朵生成 ====================
    function generateFlowersForCell(row, col, count) {
        const cell = STATE.grid[row][col];
        cell.flowers = [];
        const margin = 12;
        const maxAttempts = 80;
        const flowerRadius = 8;
        const colors = ['#000', '#000', '#000', '#000',
            '#000', '#000', '#000', '#000',
            '#000', '#000', '#000', '#000',
        ];
        for (let i = 0; i < count; i++) {
            let placed = false;
            for (let attempt = 0; attempt < maxAttempts; attempt++) {
                const fx = margin + Math.random() * (STATE.cellPixelSize - margin * 2);
                const fy = margin + Math.random() * (STATE.cellPixelSize - margin * 2);
                let overlaps = false;
                for (const existing of cell.flowers) {
                    const dx = fx - existing.x;
                    const dy = fy - existing.y;
                    if (Math.sqrt(dx * dx + dy * dy) < flowerRadius * 2.5) {
                        overlaps = true;
                        break;
                    }
                }
                if (!overlaps) {
                    cell.flowers.push({
                        x: fx, y: fy,
                        color: colors[Math.floor(Math.random() * colors.length)],
                    });
                    placed = true;
                    break;
                }
            }
            if (!placed) {
                const last = cell.flowers[cell.flowers.length - 1] || { x: STATE.cellPixelSize / 2, y: STATE.cellPixelSize / 2 };
                cell.flowers.push({
                    x: last.x + (Math.random() - 0.5) * 25,
                    y: last.y + (Math.random() - 0.5) * 25,
                    color: colors[Math.floor(Math.random() * colors.length)],
                });
            }
        }
    }

    // ==================== 幻觉系统 ====================
    function increaseMania(amount) {
        STATE.maniaLevel = Math.min((STATE.maniaLevel || 0) + amount, 3);
        if (window.UI) {
            if (STATE.maniaLevel >= 3) {
                window.UI.showHint('躁狂达到极限！你感到难以抑制的破坏欲！', 'danger');
            } else {
                window.UI.showHint(`躁狂等级 ${STATE.maniaLevel}/3`, 'warning');
            }
        }
    }

    function increaseGreed(amount) {
        STATE.greedLevel = Math.min((STATE.greedLevel || 0) + amount, 3);
        if (window.UI) {
            if (STATE.greedLevel >= 3) {
                window.UI.showHint('贪婪达到极限！背包满了会触发特殊事件！', 'danger');
            } else {
                window.UI.showHint(`贪婪等级 ${STATE.greedLevel}/3`, 'warning');
            }
        }
    }

    function resetHallucinations() {
        STATE.maniaLevel = 0;
        STATE.greedLevel = 0;
        STATE.greedTriggerCount = 0;
        STATE.greedActive = false;
        STATE.greedSpecialTiles = [];
        STATE.greedResolved = false;
    }

    // 触发票包满时的贪婪特殊事件
    function triggerGreedEvent() {
        if (STATE.greedLevel <= 0) return;
        STATE.greedActive = true;
        STATE.greedResolved = false;
        STATE.greedSpecialTiles = [];

        // Step 1: 将所有非指引者点亮地块退化为灰色
        for (let row = 0; row < C.GRID_SIZE; row++) {
            for (let col = 0; col < C.GRID_SIZE; col++) {
                const cell = STATE.grid[row][col];
                if (cell.lit && !cell.isGuide) {
                    cell.lit = false;
                    cell.litIndex = -1;
                    cell.flowers = [];
                    STATE.litTilesHistory = STATE.litTilesHistory.filter(
                        t => !(t.row === row && t.col === col)
                    );
                }
            }
        }
        STATE.litCount = STATE.litTilesHistory.filter(
            t => !STATE.grid[t.row][t.col].isGuide
        ).length;

        // Step 2: 将所有灰色地块变为贪婪之地
        for (let row = 0; row < C.GRID_SIZE; row++) {
            for (let col = 0; col < C.GRID_SIZE; col++) {
                const cell = STATE.grid[row][col];
                if (!cell.lit) {
                    cell.greedSpecial = true;
                    STATE.greedSpecialTiles.push({ row, col });
                }
            }
        }
                if (window.UI) window.UI.showHint('贪婪发作！除指引者外的所有地块沦为贪婪之地！点击任何灰色地块将失去所有花朵！', 'danger');
        if (window.UI) window.UI.updateAll();
    }

    // 处理贪婪特殊地块点击
    function handleGreedTileClick(row, col) {
        if (!STATE.greedActive || STATE.greedResolved) return false;
        const cell = STATE.grid[row][col];
        if (!cell.greedSpecial) return false;

        // 失去所有花朵
        STATE.backpack = [];
        cell.greedSpecial = false;

        // 点亮该地块
        cell.lit = true;
        cell.litIndex = STATE.litTilesHistory.length;
        if (!cell.isGuide) {
            STATE.litCount++;
        }
        STATE.litTilesHistory.push({ row, col });

        const flowerCount = getNewTileFlowersMin() + Math.floor(Math.random() * (getNewTileFlowersMax() - getNewTileFlowersMin() + 1));
        generateFlowersForCell(row, col, flowerCount);

        // 阶梯触发怪物
        if (cell.isStair) {
            if (window.UI) window.UI.showHint('找到了通往下一层的阶梯！守关怪物出现了！', '');
            finishGreedEvent();
            if (window.UI) window.UI.updateAll();
            if (window.Monster) window.Monster.triggerStair();
            return true;
        }

        // 第四层宝藏
        if (STATE.currentLayer === C.TOTAL_LAYERS && !STATE.treasureFound &&
            row === STATE.treasureLocation.row && col === STATE.treasureLocation.col) {
            STATE.treasureFound = true;
            finishGreedEvent();
            triggerTreasureFound();
            return true;
        }

        // 武器箱
        if (cell.isWeapon && STATE.weaponLevel === 0) {
            STATE.weaponLevel = 1;
            if (window.UI) window.UI.showHint('获得武器 Lv.1！现在可以攻击怪物了！', 'success');
        }

        if (window.UI) window.UI.showHint('你失去了所有花朵！但贪婪之地化为了可耕种的土地...', 'warning');
        finishGreedEvent();
        if (window.UI) window.UI.updateAll();
        return true;
    }

    // 处理贪婪时点击指引者
    function handleGreedGuideClick(row, col) {
        if (!STATE.greedActive || STATE.greedResolved) return false;
        const cell = STATE.grid[row][col];
        if (!cell.lit || !cell.isGuide) return false;

        STATE.greedLevel = Math.max(0, STATE.greedLevel - 1);
        if (window.UI) window.UI.showHint(`向指引者祈祷，贪婪等级降至 ${STATE.greedLevel}`, 'success');
        finishGreedEvent();
        if (window.UI) window.UI.updateAll();
        return true;
    }

    function finishGreedEvent() {
        STATE.greedActive = false;
        STATE.greedResolved = true;
        // 清除所有剩余贪婪地块标记，恢复灰色状态
        for (let row = 0; row < C.GRID_SIZE; row++) {
            for (let col = 0; col < C.GRID_SIZE; col++) {
                const cell = STATE.grid[row][col];
                if (cell.greedSpecial) {
                    cell.greedSpecial = false;
                }
            }
        }
        STATE.greedSpecialTiles = [];
        // 贪婪事件重置棋盘后，掷新骰为重建提供方向
        if (window.DiceSystem) window.DiceSystem.rollAllDice();
    }

    // 检查替代胜利条件（游击模式下点亮所有非枯萎地块）
    function checkAlternativeWin() {
        if (!STATE.inGuerrillaMode) return false;
        if (STATE.alternativeWinChecked) return false;
        let allLit = true;
        for (let row = 0; row < C.GRID_SIZE; row++) {
            for (let col = 0; col < C.GRID_SIZE; col++) {
                const cell = STATE.grid[row][col];
                if (!cell.lit && !cell.withered) {
                    allLit = false;
                    break;
                }
            }
            if (!allLit) break;
        }
        if (allLit) {
            STATE.alternativeWinChecked = true;
            if (STATE.currentLayer < C.TOTAL_LAYERS) {
                if (window.UI) window.UI.showHint('你点亮了所有地块！可以进入下一层（但不会获得碎片）', 'success');
            } else {
                if (window.UI) window.UI.showHint('你点亮了所有地块！', 'success');
            }
            return true;
        }
        return false;
    }

    // ==================== 初始化网格 ====================
    function initGrid() {
        STATE.grid = [];
        for (let row = 0; row < C.GRID_SIZE; row++) {
            STATE.grid[row] = [];
            for (let col = 0; col < C.GRID_SIZE; col++) {
                STATE.grid[row][col] = {
                    lit: false,
                    flowers: [],
                    litIndex: -1,
                    isStair: false,
                    withered: false,
                    isGuide: false,
                    guideIndex: -1,
                    isWeapon: false,
                };
            }
        }

        const centerRow = Math.floor(C.GRID_SIZE / 2);
        const centerCol = Math.floor(C.GRID_SIZE / 2);
        STATE.grid[centerRow][centerCol].lit = true;
        STATE.grid[centerRow][centerCol].litIndex = 0;
        STATE.litCount = 1;
        STATE.expandedCount = 0;
        STATE.litTilesHistory = [{ row: centerRow, col: centerCol }];
        generateFlowersForCell(centerRow, centerCol, C.INITIAL_FLOWERS);

        // 阶梯位置
        let stairRow, stairCol;
        do {
            stairRow = Math.floor(Math.random() * C.GRID_SIZE);
            stairCol = Math.floor(Math.random() * C.GRID_SIZE);
        } while (
            (stairRow === centerRow && stairCol === centerCol) ||
            (Math.abs(stairRow - centerRow) <= 1 && Math.abs(stairCol - centerCol) <= 1)
        );
        STATE.stairLocation = { row: stairRow, col: stairCol };
        STATE.grid[stairRow][stairCol].isStair = true;

        // 第四层宝藏
        if (STATE.currentLayer === C.TOTAL_LAYERS) {
            let treasureRow, treasureCol;
            do {
                treasureRow = Math.floor(Math.random() * C.GRID_SIZE);
                treasureCol = Math.floor(Math.random() * C.GRID_SIZE);
            } while (
                (treasureRow === centerRow && treasureCol === centerCol) ||
                (treasureRow === stairRow && treasureCol === stairCol)
            );
            STATE.treasureLocation = { row: treasureRow, col: treasureCol };
            STATE.treasureFound = false;
        } else {
            STATE.treasureLocation = null;
        }

        // 重置怪物状态
        STATE.monsterDemandLevel = 1;
        STATE.inGuerrillaMode = false;
        STATE.guerrillaTriggerCount = 0;
        STATE.guerrillaDemandPercent = 0.5;

        // 武器箱
        STATE.weaponLocation = null;
        if (STATE.currentLayer < C.TOTAL_LAYERS) {
            let weaponRow, weaponCol;
            do {
                weaponRow = Math.floor(Math.random() * C.GRID_SIZE);
                weaponCol = Math.floor(Math.random() * C.GRID_SIZE);
            } while (
                (weaponRow === centerRow && weaponCol === centerCol) ||
                (Math.abs(weaponRow - centerRow) <= 1 && Math.abs(weaponCol - centerCol) <= 1) ||
                (weaponRow === stairRow && weaponCol === stairCol)
            );
            STATE.weaponLocation = { row: weaponRow, col: weaponCol };
            STATE.grid[weaponRow][weaponCol].isWeapon = true;
        }

        // 指引者
        STATE.guideLocations = [];
        const occupiedPositions = new Set();
        occupiedPositions.add(`${centerRow},${centerCol}`);
        occupiedPositions.add(`${stairRow},${stairCol}`);
        if (STATE.weaponLocation) occupiedPositions.add(`${STATE.weaponLocation.row},${STATE.weaponLocation.col}`);
        if (STATE.treasureLocation) occupiedPositions.add(`${STATE.treasureLocation.row},${STATE.treasureLocation.col}`);

        const guideTypes = shuffleArray(['stair', 'weapon', 'reveal']);
        for (let i = 0; i < 3; i++) {
            let guideRow, guideCol;
            let attempts = 0;
            do {
                guideRow = Math.floor(Math.random() * C.GRID_SIZE);
                guideCol = Math.floor(Math.random() * C.GRID_SIZE);
                attempts++;
                if (attempts > 100) break;
            } while (occupiedPositions.has(`${guideRow},${guideCol}`));

            occupiedPositions.add(`${guideRow},${guideCol}`);
            STATE.guideLocations.push({
                row: guideRow, col: guideCol,
                type: guideTypes[i], revealed: false
            });
            STATE.grid[guideRow][guideCol].isGuide = true;
            STATE.grid[guideRow][guideCol].guideIndex = i;
        }
    }

    // ==================== 重置游戏 ====================
    function resetGame() {
        STATE.currentLayer = 1;
        STATE.treasureFragments = 0;
        STATE.guideLog = [];
        STATE.weaponLevel = 0;
        STATE.guerrillaDemandPercent = 0.5;
        STATE.guerrillaMarkedTiles = [];
        STATE.guerrillaWarningActive = false;
        resetHallucinations();
        STATE.alternativeWinChecked = false;
        STATE.diceResults = [];
        STATE.diceRolled = false;
        initGrid();
        STATE.backpack = [];
        STATE.treasureFound = false;
        STATE.monsterActive = false;
        STATE.particles = [];
        STATE.hoveredCell = null;
        const centerRow = Math.floor(C.GRID_SIZE / 2);
        const centerCol = Math.floor(C.GRID_SIZE / 2);
        STATE.playerRow = centerRow;
        STATE.playerCol = centerCol;
        if (window.DiceSystem) window.DiceSystem.rollAllDice();
        if (window.UI) window.UI.updateAll();
        if (window.UI) window.UI.showHint('点击已点亮的地块采集花朵。寻找通往下一层的阶梯和指引者', '');
    }

    // ==================== 采集花朵 ====================
    function collectFlower(row, col) {
        if (STATE.treasureFound || STATE.monsterActive) return false;
        const cell = STATE.grid[row][col];

        // 处理贪婪特殊地块（允许灰色状态点击）
        if (cell.greedSpecial && STATE.greedActive && !STATE.greedResolved) {
            return handleGreedTileClick(row, col);
        }

        if (!cell.lit) return false;

        // 贪婪时点击指引者
        if (STATE.greedActive && !STATE.greedResolved && cell.isGuide) {
            return handleGreedGuideClick(row, col);
        }

        if (cell.flowers.length === 0) return false;
        if (STATE.backpack.length >= C.BACKPACK_CAPACITY) {
            if (window.UI) window.UI.showHint('背包已满！消耗花朵点亮新草皮吧', 'warning');
            if (window.UI) window.UI.shakeBackpack();
            return false;
        }
        const flower = cell.flowers.pop();
        STATE.backpack.push(flower.color);
        const bounds = getCellBounds(row, col);
        window.Particles.spawn(bounds.x + flower.x, bounds.y + flower.y, flower.color, 6);

        // 背包满时触发贪婪检查
        if (STATE.backpack.length >= C.BACKPACK_CAPACITY) {
            if (STATE.greedLevel < 3) {
                increaseGreed(1);
            }
            if (STATE.greedLevel >= 3 && !STATE.greedActive) {
                triggerGreedEvent();
            }
        }

        if (window.UI) window.UI.updateAll();
        if (cell.flowers.length === 0 && STATE.backpack.length < C.BACKPACK_CAPACITY) {
            if (window.UI) window.UI.showHint('这块草皮的花采完了~ 看看其他草皮吧', '');
        } else if (STATE.backpack.length >= C.BACKPACK_CAPACITY) {
            if (window.UI) window.UI.showHint('背包满了！消耗花朵来点亮新草皮吧', 'warning');
        } else {
            if (window.UI) window.UI.showHint('继续采集花朵吧~', '');
        }
        return true;
    }

    // ==================== 点亮新地块 ====================
    function lightNewTurf(row, col) {
        if (STATE.monsterActive) return false;
        if (STATE.grid[row][col].lit) return false;
        if (!isAdjacentToLit(row, col)) return false;

        const flowersToLight = getFlowersToLight();
        if (STATE.backpack.length < flowersToLight) {
            if (window.UI) window.UI.showHint(`需要 ${flowersToLight} 朵花才能点亮新地块！当前只有 ${STATE.backpack.length} 朵`, 'danger');
            if (window.UI) window.UI.shakeBackpack();
            return false;
        }

        STATE.backpack.splice(STATE.backpack.length - flowersToLight, flowersToLight);

        // 统计非指引者地块数量，用于上限判断
        let diceJustRolled = false;
        const nonGuideLitTiles = STATE.litTilesHistory.filter(t => !STATE.grid[t.row][t.col].isGuide);
        if (nonGuideLitTiles.length >= C.MAX_LIT_TILES) {
            // 退化所有非指引者地块，只保留新点亮的地块
            const evicted = STATE.litTilesHistory.filter(t => !STATE.grid[t.row][t.col].isGuide);
            for (const tile of evicted) {
                STATE.grid[tile.row][tile.col].lit = false;
                STATE.grid[tile.row][tile.col].litIndex = -1;
                STATE.grid[tile.row][tile.col].flowers = [];
            }
            STATE.litTilesHistory = STATE.litTilesHistory.filter(t => STATE.grid[t.row][t.col].isGuide);
            STATE.litCount = 0;
            for (let i = 0; i < STATE.litTilesHistory.length; i++) {
                STATE.grid[STATE.litTilesHistory[i].row][STATE.litTilesHistory[i].col].litIndex = i;
            }
            if (window.UI) window.UI.showHint(`地块已满！所有旧地块退化，掷骰决定方向！`, 'warning');
            if (window.DiceSystem) {
                window.DiceSystem.rollAllDice();
                diceJustRolled = true;
            }
        }

        STATE.grid[row][col].lit = true;
        STATE.grid[row][col].litIndex = STATE.litTilesHistory.length;
        if (!STATE.grid[row][col].isGuide) {
            STATE.litCount++;
        }
        STATE.expandedCount++;
        STATE.litTilesHistory.push({ row, col });

        const flowerCount = getNewTileFlowersMin() + Math.floor(Math.random() * (getNewTileFlowersMax() - getNewTileFlowersMin() + 1));
        generateFlowersForCell(row, col, flowerCount);

        // 骰子效果触发：检测新点亮地块的方向是否与已有的骰子指向一致
        // 退化时刚掷的骰子留给下一次点亮操作，不消耗在当前地块
        if (STATE.diceRolled && !diceJustRolled && window.DiceSystem) {
            window.DiceSystem.triggerOnLight(row, col);
        }

        // 更新玩家位置（非指引者地块）
        if (!STATE.grid[row][col].isGuide) {
            STATE.playerRow = row;
            STATE.playerCol = col;
        }

        // 阶梯触发怪物
        if (STATE.grid[row][col].isStair) {
            if (window.UI) window.UI.showHint(`🎉 找到了通往下一层的阶梯！守关怪物出现了！`, '');
            if (window.Monster) window.Monster.triggerStair();
            return true;
        }

        // 第四层宝藏
        if (STATE.currentLayer === C.TOTAL_LAYERS && !STATE.treasureFound &&
            row === STATE.treasureLocation.row && col === STATE.treasureLocation.col) {
            STATE.treasureFound = true;
            if (window.UI) window.UI.showHint('💎 你找到了大地之心！游戏胜利！', '');
            triggerTreasureFound();
            return true;
        }

        // 激活指引者
        if (window.GuideSystem) window.GuideSystem.activateGuide(row, col);

        // 武器箱
        if (STATE.grid[row][col].isWeapon && STATE.weaponLevel === 0) {
            STATE.weaponLevel = 1;
            if (window.UI) window.UI.showHint('获得武器 Lv.1！现在可以攻击怪物了！', 'success');
        }

        // 指引者地块不触发游击和贪婪计数
        if (!STATE.grid[row][col].isGuide) {
            // 游击模式检查
            if (STATE.inGuerrillaMode) {
                if (STATE.guerrillaWarningActive) {
                    // 预告激活中 → 点亮即触发突袭摧毁
                    if (window.Monster) window.Monster.executeGuerrillaStrike();
                } else {
                    STATE.guerrillaTriggerCount++;
                    if (STATE.guerrillaTriggerCount >= C.MONSTER_INTERVAL) {
                        if (window.Monster) window.Monster.markGuerrillaTiles();
                    }
                }
            }

            // 贪婪计数：点亮地块增加贪婪
            STATE.greedTriggerCount++;
            if (STATE.greedTriggerCount >= STATE.greedLitThreshold && STATE.greedLevel < 3 && !STATE.greedActive) {
                STATE.greedTriggerCount = 0;
                increaseGreed(1);
            }
        }

        // 检查替代胜利
        checkAlternativeWin();

        if (window.UI) window.UI.updateAll();
        return true;
    }

    // ==================== 恢复枯萎地块 ====================
    function restoreWitheredTile(row, col) {
        const cell = STATE.grid[row][col];
        if (!cell.withered) return false;
        const flowersToLight = getFlowersToLight();
        if (STATE.backpack.length < flowersToLight) return false;
        STATE.backpack.splice(STATE.backpack.length - flowersToLight, flowersToLight);
        cell.withered = false;
        cell.lit = true;
        cell.litIndex = STATE.litTilesHistory.length;
        STATE.litCount++;
        STATE.litTilesHistory.push({ row, col });
        const flowerCount = getNewTileFlowersMin() + Math.floor(Math.random() * (getNewTileFlowersMax() - getNewTileFlowersMin() + 1));
        generateFlowersForCell(row, col, flowerCount);
        const bounds = getCellBounds(row, col);
        window.Particles.spawn(bounds.x + bounds.w / 2, bounds.y + bounds.h / 2, '#000', 12);
        if (window.UI) window.UI.updateAll();
        if (window.UI) window.UI.showHint(`枯萎地块恢复！上面有 ${flowerCount} 朵花~`, '');
        return true;
    }

    // ==================== 层数推进 ====================
    function advanceToNextLayer() {
        STATE.guerrillaMarkedTiles = [];
        STATE.guerrillaWarningActive = false;
        STATE.diceResults = [];
        STATE.diceRolled = false;
        if (window.DiceSystem) window.DiceSystem.updateDiceUI();
        if (STATE.currentLayer < C.TOTAL_LAYERS) {
            STATE.treasureFragments++;
            if (window.UI) window.UI.showHint(`🎊 进入第${STATE.currentLayer + 1}层！获得宝藏碎片 ${STATE.treasureFragments}/3`, '');
            STATE.currentLayer++;
            STATE.guideLog = [];
            if (C.RESET_HALLUCINATIONS_ON_LAYER) {
                resetHallucinations();
            }
            STATE.alternativeWinChecked = false;
            initGrid();
            const nextCenterRow = Math.floor(C.GRID_SIZE / 2);
            const nextCenterCol = Math.floor(C.GRID_SIZE / 2);
            STATE.playerRow = nextCenterRow;
            STATE.playerCol = nextCenterCol;
            if (window.DiceSystem) window.DiceSystem.rollAllDice();
            if (window.UI) window.UI.updateAll();
            if (window.UI) window.UI.showHint(`进入第${STATE.currentLayer}层：${getLayerTheme()}，点亮需要${getFlowersToLight()}朵花`, '');
        } else {
            triggerTreasureFound();
        }
    }

    // ==================== 宝藏触发 ====================
    function triggerTreasureFound() {
        STATE.treasureFound = true;
        if (window.UI) window.UI.updateAll();
        DOM.winEmoji.textContent = '💎';
        DOM.winTitle.textContent = '大地之心找到了！';
        DOM.winMessage.innerHTML = `你成功穿越了<strong>${C.TOTAL_LAYERS}层深渊</strong>，集齐了所有宝藏碎片！<br>最终在深渊底层发现了传说中的"大地之心"!`;
        DOM.winSubtitle.textContent = '真正的冒险者懂得在限制中寻找机会！';
        setTimeout(() => {
            DOM.winOverlay.style.display = 'flex';
            window.Particles.spawn(STATE.canvasCSSWidth / 2, STATE.canvasCSSHeight / 2, '#000', 30);
        }, 400);
        if (window.UI) window.UI.showHint('🎉 大地之心找到了！游戏胜利！', '');
    }

    // ==================== 获取怪物索要比例 ====================
    function getGuardDemandPercent() {
        if (STATE.inGuerrillaMode && STATE.guerrillaDemandPercent < 0.5) {
            return STATE.guerrillaDemandPercent;
        }
        return C.WEAPON_DEMAND_PERCENTS[STATE.weaponLevel] || 0.5;
    }

    // ==================== 随机摧毁地块（禁止销毁指引者/阶梯） ====================
    function getDestroyableTileCount() {
        if (C.MONSTER_ATTACK_GRAY_TILES) {
            let count = 0;
            for (let row = 0; row < C.GRID_SIZE; row++) {
                for (let col = 0; col < C.GRID_SIZE; col++) {
                    const cell = STATE.grid[row][col];
                    if (!cell.isStair && !cell.isGuide && !cell.withered) {
                        count++;
                    }
                }
            }
            return count;
        }
        return STATE.litTilesHistory.filter(t => {
            const cell = STATE.grid[t.row][t.col];
            return !cell.isStair && !cell.isGuide;
        }).length;
    }

    function destroyRandomTile() {
        let candidates;
        if (C.MONSTER_ATTACK_GRAY_TILES) {
            candidates = [];
            for (let row = 0; row < C.GRID_SIZE; row++) {
                for (let col = 0; col < C.GRID_SIZE; col++) {
                    const cell = STATE.grid[row][col];
                    if (!cell.isStair && !cell.isGuide && !cell.withered) {
                        candidates.push({ row, col });
                    }
                }
            }
        } else {
            if (STATE.litTilesHistory.length <= 1) return null;
            candidates = STATE.litTilesHistory.filter(t => {
                const cell = STATE.grid[t.row][t.col];
                return !cell.isStair && !cell.isGuide;
            });
        }
        if (candidates.length === 0) return null;
        const target = candidates[Math.floor(Math.random() * candidates.length)];
        const cell = STATE.grid[target.row][target.col];
        if (cell.lit) {
            cell.lit = false;
            cell.litIndex = -1;
            cell.flowers = [];
            STATE.litCount--;
            STATE.litTilesHistory = STATE.litTilesHistory.filter(t => !(t.row === target.row && t.col === target.col));
            for (let i = 0; i < STATE.litTilesHistory.length; i++) {
                const tile = STATE.litTilesHistory[i];
                STATE.grid[tile.row][tile.col].litIndex = i;
            }
        }
        cell.withered = true;
        const bounds = getCellBounds(target.row, target.col);
        window.Particles.spawn(bounds.x + bounds.w / 2, bounds.y + bounds.h / 2, '#000', 15);
        return target;
    }

    // 暴露公共接口
    window.GameCore = {
        getFlowersToLight: getFlowersToLight,
        getNewTileFlowersMin: getNewTileFlowersMin,
        getNewTileFlowersMax: getNewTileFlowersMax,
        getLayerTheme: getLayerTheme,
        getGridOffset: getGridOffset,
        getCellBounds: getCellBounds,
        getCellFromPoint: getCellFromPoint,
        isAdjacentToLit: isAdjacentToLit,
        getAdjacentLitCells: getAdjacentLitCells,
        generateFlowersForCell: generateFlowersForCell,
        initGrid: initGrid,
        resetGame: resetGame,
        collectFlower: collectFlower,
        lightNewTurf: lightNewTurf,
        restoreWitheredTile: restoreWitheredTile,
        advanceToNextLayer: advanceToNextLayer,
        triggerTreasureFound: triggerTreasureFound,
        getGuardDemandPercent: getGuardDemandPercent,
        destroyRandomTile: destroyRandomTile,
        getDestroyableTileCount: getDestroyableTileCount,
        increaseMania: increaseMania,
        increaseGreed: increaseGreed,
        resetHallucinations: resetHallucinations,
        triggerGreedEvent: triggerGreedEvent,
        handleGreedTileClick: handleGreedTileClick,
        handleGreedGuideClick: handleGreedGuideClick,
        checkAlternativeWin: checkAlternativeWin
    };
})();