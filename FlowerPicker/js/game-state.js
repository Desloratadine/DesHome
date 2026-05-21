(function() {
    // ==================== 配置加载 ====================
    let CONFIG = {
        gridSize: 5,
        totalLayers: 4,
        backpackCapacity: 6,
        maxLitTiles: 6,
        monsterInterval: 2,
        initialFlowers: 6,
        newTurfFlowersMinBase: 3,
        newTurfFlowersMaxBase: 6,
        cellBaseSize: 80,
        cellGap: 5,
        canvasPadding: 30,
        monsterDemandPercent: 0.5,
        layerFlowersToLight: [3, 4, 5, 6],
        layerFlowerRanges: [
            {min: 3, max: 6},
            {min: 4, max: 7},
            {min: 5, max: 8},
            {min: 6, max: 9}
        ],
        weaponUpgradeCosts: [0, 5, 8, 12],
        weaponDemandPercents: [0.5, 0.4, 0.3, 0.2, 0]
    };

    if (typeof window.GAME_CONFIG !== 'undefined') {
        Object.assign(CONFIG, window.GAME_CONFIG);
    }

    // ==================== 常量 ====================
    const C = {
        GRID_SIZE: CONFIG.gridSize,
        TOTAL_LAYERS: CONFIG.totalLayers,
        BACKPACK_CAPACITY: CONFIG.backpackCapacity,
        MAX_LIT_TILES: CONFIG.maxLitTiles,
        MONSTER_INTERVAL: CONFIG.monsterInterval,
        INITIAL_FLOWERS: CONFIG.initialFlowers,
        CELL_BASE_SIZE: CONFIG.cellBaseSize,
        CELL_GAP: CONFIG.cellGap,
        CANVAS_PADDING: CONFIG.canvasPadding,
        MONSTER_DEMAND_PERCENT: CONFIG.monsterDemandPercent,
        WEAPON_UPGRADE_COSTS: CONFIG.weaponUpgradeCosts,
        WEAPON_DEMAND_PERCENTS: CONFIG.weaponDemandPercents,
        LAYER_FLOWERS_TO_LIGHT: CONFIG.layerFlowersToLight,
        layerFlowerRanges: CONFIG.layerFlowerRanges
    };

    // ==================== DOM元素引用 ====================
    const DOM = {
        canvas: document.getElementById('gameCanvas'),
        ctx: document.getElementById('gameCanvas').getContext('2d'),
        gameWrapper: document.getElementById('gameWrapper'),
        progressNumber: document.getElementById('progressNumber'),
        progressDots: document.getElementById('progressDots'),
        backpackSlots: document.getElementById('backpackSlots'),
        backpackCount: document.getElementById('backpackCount'),
        hintText: document.getElementById('hintText'),
        monsterOverlay: document.getElementById('monsterOverlay'),
        winOverlay: document.getElementById('winOverlay'),
        btnMonsterPay: document.getElementById('btnMonsterPay'),
        btnMonsterRefuse: document.getElementById('btnMonsterRefuse'),
        btnMonsterAttack: document.getElementById('btnMonsterAttack'),
        btnWinOk: document.getElementById('btnWinOk'),
        monsterStolenInfo: document.getElementById('monsterStolenInfo'),
        monsterButtons: document.getElementById('monsterButtons'),
        monsterTitle: document.getElementById('monsterTitle'),
        monsterDesc: document.getElementById('monsterDesc'),
        weaponPanel: document.getElementById('weaponPanel'),
        weaponLevelText: document.getElementById('weaponLevel'),
        btnWeaponUpgrade: document.getElementById('btnWeaponUpgrade'),
        guideLogContent: document.getElementById('guideLogContent'),
        currentLayer: document.getElementById('currentLayer'),
        totalLayers: document.getElementById('totalLayers'),
        winEmoji: document.getElementById('winEmoji'),
        winTitle: document.getElementById('winTitle'),
        winMessage: document.getElementById('winMessage'),
        winSubtitle: document.getElementById('winSubtitle'),
        guideInteractionContainer: document.getElementById('guideInteractionContainer'),
        guideInteractionTitle: document.getElementById('guideInteractionTitle'),
        guideInteractionDesc: document.getElementById('guideInteractionDesc'),
        btnGuidePray: document.getElementById('btnGuidePray'),
        btnGuideAttack: document.getElementById('btnGuideAttack'),
        btnGuidePrayGreed: document.getElementById('btnGuidePrayGreed'),
        btnGuideClose: document.getElementById('btnGuideClose'),
        statusPanel: document.getElementById('statusPanel'),
        maniaLevelText: document.getElementById('maniaLevelText'),
        greedLevelText: document.getElementById('greedLevelText'),
        maniaBarFill: document.getElementById('maniaBarFill'),
        greedBarFill: document.getElementById('greedBarFill'),
        maniaDesc: document.getElementById('maniaDesc'),
        greedDesc: document.getElementById('greedDesc')
    };

    // ==================== 游戏状态 ====================
    const STATE = {
        grid: [],
        backpack: [],
        currentLayer: 1,
        litCount: 0,
        expandedCount: 0,
        litTilesHistory: [],
        stairLocation: null,
        treasureLocation: null,
        monsterActive: false,
        monsterDemandLevel: 1,
        treasureFound: false,
        treasureFragments: 0,
        particles: [],
        hoveredCell: null,
        cellPixelSize: C.CELL_BASE_SIZE,
        canvasCSSWidth: 0,
        canvasCSSHeight: 0,
        inGuerrillaMode: false,
        guideLocations: [],
        guideLog: [],
        guerrillaTriggerCount: 0,
        regrowCooldown: 0,
        weaponLevel: 0,
        weaponLocation: null,
        guerrillaDemandPercent: 0.5,
        animFrameId: null,
        // 幻觉系统
        maniaLevel: 0,
        greedLevel: 0,
        greedTriggerCount: 0,
        greedLitThreshold: 4,
        // 贪婪特殊地块状态
        greedActive: false,
        greedSpecialTiles: [],
        greedResolved: false,
        // 指引者交互
        activeGuideForInteraction: null,
        // 替代胜利
        alternativeWinChecked: false
    };

    // ==================== 工具函数 ====================
    function shuffleArray(arr) {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    // 暴露到全局
    window.GS = {
        C: C,
        DOM: DOM,
        STATE: STATE,
        CONFIG: CONFIG,
        shuffleArray: shuffleArray
    };
})();