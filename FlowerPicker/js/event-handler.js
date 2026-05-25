(function() {
    const { C, DOM, STATE } = window.GS;

    function getCanvasEventPos(e) {
        const rect = DOM.canvas.getBoundingClientRect();
        const scaleX = STATE.canvasCSSWidth / rect.width;
        const scaleY = STATE.canvasCSSHeight / rect.height;
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY,
        };
    }

    function handleCanvasClick(e) {
        if (STATE.monsterActive) return;
        const pos = getCanvasEventPos(e);
        const cell = window.GameCore.getCellFromPoint(pos.x, pos.y);
        if (!cell) return;
        const { row, col } = cell;
        const gridCell = STATE.grid[row][col];

        if (gridCell.withered) {
            if (!C.ALLOW_WITHERED_RESTORE) return;
            const flowersToLight = window.GameCore.getFlowersToLight();
            if (STATE.backpack.length >= flowersToLight) {
                window.GameCore.restoreWitheredTile(row, col);
            } else {
                window.UI.showHint(`需要 ${flowersToLight} 朵花恢复枯萎地块，当前 ${STATE.backpack.length} 朵`, 'danger');
                window.UI.shakeBackpack();
            }
        } else if (STATE.greedActive && !STATE.greedResolved && gridCell.greedSpecial) {
            window.GameCore.collectFlower(row, col);
        } else if (gridCell.lit) {
            // 优先处理指引者交互（未揭示的指引者）
            if (gridCell.isGuide && !STATE.greedActive) {
                const guideInfo = STATE.guideLocations.find(g => g.row === row && g.col === col);
                if (guideInfo && !guideInfo.revealed) {
                    if (window.GuideSystem) window.GuideSystem.activateGuide(row, col);
                    return;
                }
            }
            // 贪婪模式下点击指引者
            if (STATE.greedActive && !STATE.greedResolved && gridCell.isGuide) {
                window.GameCore.collectFlower(row, col);
                return;
            }
            if (gridCell.flowers.length > 0 || gridCell.greedSpecial) {
                window.GameCore.collectFlower(row, col);
            } else if (window.GameCore.isAdjacentToLit(row, col) === false && gridCell.lit) {
                window.UI.showHint('这块地块没有花了~ 扩展新地块吧 🌱', '');
            }
        } else if (window.GameCore.isAdjacentToLit(row, col)) {
            const flowersToLight = window.GameCore.getFlowersToLight();
            if (STATE.backpack.length >= flowersToLight) {
                window.GameCore.lightNewTurf(row, col);
            } else {
                window.UI.showHint(`需要 ${flowersToLight} 朵花点亮地块，当前 ${STATE.backpack.length} 朵`, 'danger');
                window.UI.shakeBackpack();
            }
        } else {
            window.UI.showHint('需要先扩展到相邻的地块哦~', '');
        }
    }

    function handleMouseMove(e) {
        const pos = getCanvasEventPos(e);
        STATE.hoveredCell = window.GameCore.getCellFromPoint(pos.x, pos.y);
    }

    function handleMouseLeave() {
        STATE.hoveredCell = null;
    }

    function handleTouchStart(e) {
        if (e.touches.length === 1) {
            const pos = getCanvasEventPos(e.touches[0]);
            STATE.hoveredCell = window.GameCore.getCellFromPoint(pos.x, pos.y);
        }
    }

    function handleTouchEnd() {
        STATE.hoveredCell = null;
    }

    function handleKeyDown(e) {
        if (e.key === 'Escape' && STATE.monsterActive) {
            DOM.monsterOverlay.style.display = 'none';
            STATE.monsterActive = false;
            window.UI.updateAll();
        }
        if (e.key === 'Escape' && DOM.guideInteractionContainer.classList.contains('show')) {
            if (window.GuideSystem) window.GuideSystem.closeGuideInteraction();
        }
        if (e.key === 'r' && DOM.winOverlay.style.display === 'flex') {
            DOM.winOverlay.style.display = 'none';
            window.GameCore.resetGame();
            window.CanvasRenderer.resize();
        }
    }

    function handleResize() {
        window.CanvasRenderer.resize();
    }

    // ==================== 注册事件 ====================
    function initEvents() {
        DOM.canvas.addEventListener('click', handleCanvasClick);
        DOM.canvas.addEventListener('mousemove', handleMouseMove);
        DOM.canvas.addEventListener('mouseleave', handleMouseLeave);
        DOM.canvas.addEventListener('touchstart', handleTouchStart, { passive: true });
        DOM.canvas.addEventListener('touchend', handleTouchEnd);
        DOM.btnMonsterPay.addEventListener('click', function() { window.Monster.pay(); });
        DOM.btnMonsterRefuse.addEventListener('click', function() { window.Monster.refuse(); });
        DOM.btnMonsterAttack.addEventListener('click', function() { window.Monster.attack(); });
        DOM.btnWeaponUpgrade.addEventListener('click', function() { window.Weapon.upgrade(); });
        DOM.btnWinOk.addEventListener('click', function() {
            DOM.winOverlay.style.display = 'none';
            window.GameCore.resetGame();
            window.CanvasRenderer.resize();
        });
        document.addEventListener('keydown', handleKeyDown);
        window.addEventListener('resize', handleResize);
    }

    // ==================== 启动游戏 ====================
    function startGame() {
        window.GameCore.resetGame();
        window.CanvasRenderer.resize();
        window.CanvasRenderer.startLoop();
        initEvents();
    }

    // DOM加载完成后启动
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startGame);
    } else {
        startGame();
    }
})();