(function() {
    const { C, DOM, STATE } = window.GS;

    function triggerStair() {
        STATE.monsterActive = true;
        const demand = Math.ceil(STATE.backpack.length * window.GameCore.getGuardDemandPercent());
        let stolenInfo = `怪物索要 ${demand} 朵花`;
        if (STATE.backpack.length === 0) stolenInfo = '怪物注视着你空荡荡的背包...';
        else if (STATE.backpack.length < demand) stolenInfo += '（花朵不足！）';
        DOM.monsterStolenInfo.textContent = stolenInfo;
        DOM.monsterTitle.textContent = `👾 守关怪物 Lv.${STATE.monsterDemandLevel}`;
        DOM.monsterDesc.textContent = '贪婪的怪物索要你的花朵作为通行代价！';
        if (STATE.backpack.length === 0) {
            DOM.btnMonsterPay.style.display = 'none';
        } else {
            DOM.btnMonsterPay.style.display = 'inline-block';
        }
        if (STATE.weaponLevel > 0) {
            DOM.btnMonsterAttack.style.display = 'inline-block';
        } else {
            DOM.btnMonsterAttack.style.display = 'none';
        }
        DOM.monsterOverlay.style.display = 'flex';
    }

    function payMonster() {
        const demand = Math.ceil(STATE.backpack.length * window.GameCore.getGuardDemandPercent());
        if (STATE.backpack.length === 0) {
            if (window.UI) window.UI.showHint(`背包里没有花，无法支付！请选择"拒绝支付"。`, 'danger');
            DOM.monsterOverlay.style.display = 'none';
            STATE.monsterActive = false;
            if (window.UI) window.UI.updateAll();
            return;
        }
        if (STATE.backpack.length >= demand) {
            STATE.backpack.splice(STATE.backpack.length - demand, demand);
            if (window.UI) window.UI.showHint(`支付了 ${demand} 朵花，怪物满意地离开了！进入下一层！💰`, STATE.inGuerrillaMode ? 'success' : 'warning');
            STATE.inGuerrillaMode = false;
            STATE.guerrillaTriggerCount = 0;
            window.GameCore.advanceToNextLayer();
        } else {
            if (window.UI) window.UI.showHint(`花朵不足，无法支付！`, 'danger');
        }
        DOM.monsterOverlay.style.display = 'none';
        STATE.monsterActive = false;
        if (window.UI) window.UI.updateAll();
    }

    function refuseMonster() {
        const destroyableCount = window.GameCore.getDestroyableTileCount();
        let destroyedAny = false;
        if (destroyableCount <= 0) {
            if (window.UI) window.UI.showHint('所有点亮地块均为指引者或阶梯，怪物无法破坏！', 'success');
        } else {
            const count = Math.min(C.MONSTER_REFUSE_DESTROY_COUNT, destroyableCount);
            for (let i = 0; i < count; i++) {
                if (window.GameCore.destroyRandomTile()) {
                    destroyedAny = true;
                }
            }
            if (!destroyedAny) {
                if (window.UI) window.UI.showHint('怪物试图破坏但无可摧毁地块！', 'warning');
            }
        }
        if (!STATE.inGuerrillaMode) {
            STATE.inGuerrillaMode = true;
            STATE.guerrillaTriggerCount = 0;
            if (window.UI) window.UI.showHint(`你拒绝了怪物！进入游击模式，每点亮${C.MONSTER_INTERVAL}块地会遭到突袭预告！`, 'warning');
        }
        DOM.monsterOverlay.style.display = 'none';
        STATE.monsterActive = false;
        if (window.UI) window.UI.updateAll();
    }

    function attackMonster() {
        if (STATE.weaponLevel === 0) return;

        if (STATE.weaponLevel >= 4) {
            if (window.UI) window.UI.showHint('⚔️ 神剑之威！怪物被直接击退！你昂首进入下一层！', 'success');
            STATE.inGuerrillaMode = false;
            STATE.guerrillaTriggerCount = 0;
            DOM.monsterOverlay.style.display = 'none';
            STATE.monsterActive = false;
            if (window.GameCore) window.GameCore.increaseMania(1);
            if (window.UI) window.UI.updateAll();
            if (window.GameCore) window.GameCore.advanceToNextLayer();
            return;
        }

        const destroyableCount = window.GameCore.getDestroyableTileCount();
        const destroyCount = Math.min(C.MONSTER_ATTACK_DESTROY_COUNT, destroyableCount);
        let destroyedAny = false;
        let destroyedTotal = 0;
        for (let i = 0; i < destroyCount; i++) {
            if (window.GameCore.destroyRandomTile()) {
                destroyedAny = true;
                destroyedTotal++;
            }
        }
        if (!destroyedAny) {
            if (window.UI) window.UI.showHint('怪物被击退，但所有点亮地块均为指引者或阶梯，无法破坏！', 'warning');
        } else {
            const destroyedCount = destroyedTotal;
            if (window.UI) window.UI.showHint(`⚔️ 你攻击了怪物！怪物摧毁了${destroyedCount}块地块后逃窜，进入游击模式！`, 'danger');
        }
        if (!STATE.inGuerrillaMode) {
            STATE.inGuerrillaMode = true;
            STATE.guerrillaTriggerCount = 0;
            STATE.guerrillaDemandPercent = 0.3;
            if (window.UI) window.UI.showHint(`进入游击模式！每点亮${C.MONSTER_INTERVAL}块地会遭到突袭预告，索要比例降至30%。`, 'warning');
        }
        if (window.GameCore) window.GameCore.increaseMania(1);
        DOM.monsterOverlay.style.display = 'none';
        STATE.monsterActive = false;
        if (window.UI) window.UI.updateAll();
    }

    function markGuerrillaTiles() {
        STATE.guerrillaTriggerCount = 0;
        if (STATE.monsterActive || STATE.guerrillaWarningActive) return;

        const candidates = STATE.litTilesHistory.filter(t => {
            const cell = STATE.grid[t.row][t.col];
            return !cell.isGuide && !cell.isStair && !cell.isWeapon && !cell.withered;
        });

        if (candidates.length < 1) {
            showGuerrillaOverlay();
            return;
        }

        const markCount = Math.min(2, candidates.length);
        const shuffled = window.GS.shuffleArray(candidates);
        STATE.guerrillaMarkedTiles = [];
        for (let i = 0; i < markCount; i++) {
            STATE.guerrillaMarkedTiles.push({ row: shuffled[i].row, col: shuffled[i].col, protected: false });
        }
        STATE.guerrillaWarningActive = true;

        const names = STATE.guerrillaMarkedTiles.map(t => `(${t.row},${t.col})`).join('、');
        if (window.UI) window.UI.showHint(`⚠️ 怪物标记了 ${markCount} 个地块：${names}，点击其中一块可保护它，然后继续点亮新地块`, 'danger');
        if (window.UI) window.UI.updateAll();
    }

    function selectProtectedTile(row, col) {
        if (!STATE.guerrillaWarningActive) return;
        const tile = STATE.guerrillaMarkedTiles.find(t => t.row === row && t.col === col);
        if (!tile) return;
        tile.protected = !tile.protected;
        if (window.UI) window.UI.showHint(tile.protected ? `🛡️ 已保护地块 (${row},${col})，继续点亮新地块触发突袭` : `已取消保护 (${row},${col})`, 'info');
        if (window.UI) window.UI.updateAll();
    }

    function executeGuerrillaStrike() {
        if (!STATE.guerrillaWarningActive) return;

        const markedTiles = STATE.guerrillaMarkedTiles.slice();
        STATE.guerrillaMarkedTiles = [];
        STATE.guerrillaWarningActive = false;

        const protectedTiles = markedTiles.filter(t => t.protected);
        const tilesToDestroy = markedTiles.filter(t => !t.protected);

        let destroyedCount = 0;
        for (const tile of tilesToDestroy) {
            const cell = STATE.grid[tile.row][tile.col];
            if (cell.lit && !cell.isGuide && !cell.isStair) {
                cell.withered = true;
                cell.lit = false;
                cell.litIndex = -1;
                cell.flowers = [];
                STATE.litCount--;
                STATE.litTilesHistory = STATE.litTilesHistory.filter(t => !(t.row === tile.row && t.col === tile.col));
                for (let i = 0; i < STATE.litTilesHistory.length; i++) {
                    const t = STATE.litTilesHistory[i];
                    STATE.grid[t.row][t.col].litIndex = i;
                }
                const bounds = window.GameCore.getCellBounds(tile.row, tile.col);
                window.Particles.spawn(bounds.x + bounds.w / 2, bounds.y + bounds.h / 2, '#000', 12);
                destroyedCount++;
            }
        }

        if (destroyedCount > 0) {
            if (protectedTiles.length > 0) {
                if (window.UI) window.UI.showHint(`🛡️ ${protectedTiles.length}个警告地块被保护！其余${destroyedCount}个预告地块被摧毁！`, 'danger');
            } else {
                if (window.UI) window.UI.showHint(`💥 没有保护任何警告地块，${destroyedCount}个预告地块全被摧毁！`, 'danger');
            }
        }

        showGuerrillaOverlay();
    }

    function showGuerrillaOverlay() {
        if (STATE.monsterActive) return;
        STATE.monsterActive = true;
        const demand = Math.ceil(STATE.backpack.length * window.GameCore.getGuardDemandPercent());
        let stolenInfo = `游击怪物索要 ${demand} 朵花`;
        if (STATE.backpack.length === 0) stolenInfo = '游击怪物盯着你的空背包...';
        else if (STATE.backpack.length < demand) stolenInfo += '（花朵不足！）';
        DOM.monsterStolenInfo.textContent = stolenInfo;
        DOM.monsterTitle.textContent = `👾 游击怪物 Lv.${STATE.monsterDemandLevel}`;
        DOM.monsterDesc.textContent = '游击怪物再次出现！你可以回到阶梯处支付代价进入下一层。';
        if (STATE.backpack.length === 0) {
            DOM.btnMonsterPay.style.display = 'none';
        } else {
            DOM.btnMonsterPay.style.display = 'inline-block';
        }
        if (STATE.weaponLevel > 0) {
            DOM.btnMonsterAttack.style.display = 'inline-block';
        } else {
            DOM.btnMonsterAttack.style.display = 'none';
        }
        DOM.monsterOverlay.style.display = 'flex';
        if (window.UI) window.UI.updateAll();
    }

    function isMarkedTile(row, col) {
        return STATE.guerrillaMarkedTiles.some(t => t.row === row && t.col === col);
    }

    window.Monster = {
        triggerStair: triggerStair,
        pay: payMonster,
        refuse: refuseMonster,
        attack: attackMonster,
        markGuerrillaTiles: markGuerrillaTiles,
        executeGuerrillaStrike: executeGuerrillaStrike,
        selectProtectedTile: selectProtectedTile,
        isMarkedTile: isMarkedTile
    };
})();