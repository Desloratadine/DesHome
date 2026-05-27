// 游戏配置文件
window.GAME_CONFIG = {
    "gridSize": 7,
    "totalLayers": 4,
    "backpackCapacity": 6,
    "maxLitTiles": 4,
    "monsterInterval": 3,
    // 怪物摧毁地块后是否允许用花朵恢复
    "allowWitheredRestore": false,
    // 怪物一次拒绝时摧毁的地块数目
    "monsterRefuseDestroyCount": 1,
    // 怪物一次攻击时摧毁的地块数目
    "monsterAttackDestroyCount": 1,
    // 怪物的攻击范围是否包括灰色地块
    "monsterAttackGrayTiles": false,
    "initialFlowers": 3,
    "cellBaseSize": 80,
    "cellGap": 5,
    "canvasPadding": 30,
    "monsterDemandPercent": 0.5,
    // 玩家进入下一层时幻觉等级是否重置
    "resetHallucinationsOnLayer": false,
    // 第1~4层点亮新地块所需的花朵数量
    "layerFlowersToLight": [2, 3, 4, 5],
    // 第1~4层点亮时生成花朵的数量范围
    "layerFlowerRanges": [
        {"min": 3, "max": 4},
        {"min": 4, "max": 7},
        {"min": 5, "max": 8},
        {"min": 6, "max": 9}
    ],
    // 武器系统配置
    "weaponUpgradeCosts": [0, 3, 4, 5],
    "weaponDemandPercents": [0.5, 0.4, 0.3, 0.2, 0]
};
