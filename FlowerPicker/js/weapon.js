(function() {
    const { C, DOM, STATE } = window.GS;

    function upgradeWeapon() {
        if (STATE.weaponLevel <= 0 || STATE.weaponLevel >= 4) {
            if (window.UI) window.UI.showHint('武器已满级或未获得武器！', 'warning');
            return;
        }
        const cost = C.WEAPON_UPGRADE_COSTS[STATE.weaponLevel];
        if (STATE.backpack.length < cost) {
            if (window.UI) window.UI.showHint(`升级到 Lv.${STATE.weaponLevel + 1} 需要 ${cost} 朵花，当前只有 ${STATE.backpack.length} 朵`, 'warning');
            return;
        }
        STATE.backpack.splice(STATE.backpack.length - cost, cost);
        STATE.weaponLevel++;
        // 升级武器增加躁狂
        if (window.GameCore) window.GameCore.increaseMania(1);
        if (window.UI) window.UI.showHint(`🗡️ 武器升级到 Lv.${STATE.weaponLevel}！怪物的要求将降低至 ${Math.round(C.WEAPON_DEMAND_PERCENTS[STATE.weaponLevel] * 100)}%。`, 'success');
        if (window.UI) window.UI.updateAll();
    }

    function getWeaponDemandPercent() {
        return C.WEAPON_DEMAND_PERCENTS[STATE.weaponLevel] || 0.5;
    }

    window.Weapon = {
        upgrade: upgradeWeapon,
        getDemandPercent: getWeaponDemandPercent
    };
})();