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
        // 背包为空时隐藏支付选项
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
        // 检查可销毁地块（排除指引者/阶梯后），若无可销毁地块则跳过摧毁
        const destroyableCount = STATE.litTilesHistory.filter(t => {
            const cell = STATE.grid[t.row][t.col];
            return !cell.isStair && !cell.isGuide;
        }).length;
        if (destroyableCount <= 0) {
            if (window.UI) window.UI.showHint('所有点亮地块均为指引者或阶梯，怪物无法破坏！', 'success');
        } else {
            const d1 = window.GameCore.destroyRandomTile();
            if (!d1) {
                if (window.UI) window.UI.showHint('怪物试图破坏但无可摧毁地块！', 'warning');
            }
        }
        if (!STATE.inGuerrillaMode) {
            STATE.inGuerrillaMode = true;
            STATE.guerrillaTriggerCount = 0;
            if (window.UI) window.UI.showHint(`你拒绝了怪物！进入游击模式，每点亮${C.MONSTER_INTERVAL}块地会再次遇到怪物！`, 'warning');
        }
        DOM.monsterOverlay.style.display = 'none';
        STATE.monsterActive = false;
        if (window.UI) window.UI.updateAll();
    }

    function attackMonster() {
        if (STATE.weaponLevel === 0) return;

        // Lv.4 武器：攻击后直接进入下一层
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

        // 检查可销毁地块（排除指引者/阶梯后）
        const destroyableCount = STATE.litTilesHistory.filter(t => {
            const cell = STATE.grid[t.row][t.col];
            return !cell.isStair && !cell.isGuide;
        }).length;
        const d1 = destroyableCount > 0 ? window.GameCore.destroyRandomTile() : null;
        const d2 = destroyableCount > 1 ? window.GameCore.destroyRandomTile() : null;
        if (!d1 && !d2) {
            if (window.UI) window.UI.showHint('怪物被击退，但所有点亮地块均为指引者或阶梯，无法破坏！', 'warning');
        } else {
            const destroyedCount = (d1 ? 1 : 0) + (d2 ? 1 : 0);
            if (window.UI) window.UI.showHint(`⚔️ 你攻击了怪物！怪物摧毁了${destroyedCount}块地块后逃窜，进入游击模式！`, 'danger');
        }
        if (!STATE.inGuerrillaMode) {
            STATE.inGuerrillaMode = true;
            STATE.guerrillaTriggerCount = 0;
            STATE.guerrillaDemandPercent = 0.3;
            if (window.UI) window.UI.showHint(`进入游击模式！每点亮${C.MONSTER_INTERVAL}块地会再次遇到怪物，但索要比例降至30%。`, 'warning');
        }
        // 攻击怪物增加躁狂
        if (window.GameCore) window.GameCore.increaseMania(1);
        DOM.monsterOverlay.style.display = 'none';
        STATE.monsterActive = false;
        if (window.UI) window.UI.updateAll();
    }

    function triggerGuerrilla() {
        STATE.guerrillaTriggerCount = 0;
        if (STATE.monsterActive) return;
        STATE.monsterActive = true;
        const demand = Math.ceil(STATE.backpack.length * window.GameCore.getGuardDemandPercent());
        let stolenInfo = `游击怪物索要 ${demand} 朵花`;
        if (STATE.backpack.length === 0) stolenInfo = '游击怪物盯着你的空背包...';
        else if (STATE.backpack.length < demand) stolenInfo += '（花朵不足！）';
        DOM.monsterStolenInfo.textContent = stolenInfo;
        DOM.monsterTitle.textContent = `👾 游击怪物 Lv.${STATE.monsterDemandLevel}`;
        DOM.monsterDesc.textContent = '游击怪物再次出现！你可以回到阶梯处支付代价进入下一层。';
        // 背包为空时隐藏支付选项
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

    window.Monster = {
        triggerStair: triggerStair,
        pay: payMonster,
        refuse: refuseMonster,
        attack: attackMonster,
        triggerGuerrilla: triggerGuerrilla
    };
})();