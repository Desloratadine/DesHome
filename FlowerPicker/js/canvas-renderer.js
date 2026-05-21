(function() {
    const { C, DOM, STATE } = window.GS;

    // ==================== Canvas尺寸管理 ====================
    function resizeCanvas() {
        const containerWidth = DOM.gameWrapper.clientWidth;
        const maxSize = Math.min(containerWidth, 460);
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const cssSize = maxSize;
        DOM.canvas.style.width = cssSize + 'px';
        DOM.canvas.style.height = cssSize + 'px';
        DOM.canvas.width = cssSize * dpr;
        DOM.canvas.height = cssSize * dpr;
        DOM.ctx.setTransform(1, 0, 0, 1, 0, 0);
        DOM.ctx.scale(dpr, dpr);
        STATE.canvasCSSWidth = cssSize;
        STATE.canvasCSSHeight = cssSize;
        const availableSpace = cssSize - C.CANVAS_PADDING * 2;
        STATE.cellPixelSize = Math.floor((availableSpace - (C.GRID_SIZE - 1) * C.CELL_GAP) / C.GRID_SIZE);
        if (STATE.cellPixelSize < 40) STATE.cellPixelSize = 40;
    }

    // ==================== 绘制花朵（黑白轮廓风格） ====================
    function drawFlower(ctx, fx, fy, color) {
        ctx.save();
        const petalCount = 5;
        const petalRadius = 5;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1.5;
        for (let i = 0; i < petalCount; i++) {
            const angle = (i / petalCount) * Math.PI * 2 - Math.PI / 2;
            const px = fx + Math.cos(angle) * (petalRadius * 0.85);
            const py = fy + Math.sin(angle) * (petalRadius * 0.85);
            ctx.beginPath();
            ctx.arc(px, py, petalRadius * 0.7, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(fx, fy, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    // ==================== 绘制单元格 ====================
    function drawCell(ctx, row, col, bounds) {
        const { x, y, w, h } = bounds;
        const cell = STATE.grid[row][col];
        const radius = 12;
        const isHovered = STATE.hoveredCell && STATE.hoveredCell.row === row && STATE.hoveredCell.col === col;

        ctx.save();

        if (cell.withered) {
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.roundRect(x, y, w, h, radius);
            ctx.fill();
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 1.5;
            ctx.setLineDash([4, 3]);
            ctx.beginPath();
            ctx.roundRect(x, y, w, h, radius);
            ctx.stroke();
            ctx.setLineDash([]);
            // X 图案
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x + 8, y + 8);
            ctx.lineTo(x + w - 8, y + h - 8);
            ctx.moveTo(x + w - 8, y + 8);
            ctx.lineTo(x + 8, y + h - 8);
            ctx.stroke();
            ctx.fillStyle = '#000';
            ctx.font = 'bold 14px "Courier New",monospace';
            ctx.textAlign = 'center';
            ctx.fillText('x', x + w / 2, y + h / 2 + 5);
            ctx.fillStyle = '#000';
            ctx.font = '9px "Courier New",monospace';
            ctx.textAlign = 'center';
            ctx.fillText(`${window.GameCore.getFlowersToLight()}🌸恢复`, x + w / 2, y + h - 6);
        } else if (cell.greedSpecial) {
            // 贪婪之地：白底 + 脉冲黑色虚线边框
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.roundRect(x, y, w, h, radius);
            ctx.fill();
            const pulse = 0.3 + 0.7 * Math.sin(Date.now() / 600);
            ctx.strokeStyle = `rgba(0,0,0,${pulse})`;
            ctx.lineWidth = 2;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.roundRect(x, y, w, h, radius);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.fillStyle = '#000';
            ctx.font = 'bold 16px "Courier New",monospace';
            ctx.textAlign = 'center';
            ctx.fillText('$', x + w / 2, y + h / 2 + 6);
            ctx.fillStyle = '#000';
            ctx.font = '9px "Courier New",monospace';
            ctx.textAlign = 'center';
            ctx.fillText('贪婪之地', x + w / 2, y + h - 6);
        } else if (cell.lit) {
            // 指引者地块使用反色风格（黑底白字）
            if (cell.isGuide) {
                const guideInfo = STATE.guideLocations.find(g => g.row === row && g.col === col);
                const isUsed = guideInfo && guideInfo.revealed;
                ctx.fillStyle = '#000';
                ctx.beginPath();
                ctx.roundRect(x, y, w, h, radius);
                ctx.fill();
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 2.5;
                ctx.beginPath();
                ctx.roundRect(x, y, w, h, radius);
                ctx.stroke();
                // 内虚线框
                ctx.strokeStyle = 'rgba(255,255,255,0.4)';
                ctx.lineWidth = 1;
                ctx.setLineDash([3, 3]);
                ctx.beginPath();
                ctx.roundRect(x + 3, y + 3, w - 6, h - 6, radius - 2);
                ctx.stroke();
                ctx.setLineDash([]);
                // 悬停效果
                if (isHovered) {
                    ctx.fillStyle = 'rgba(255,255,255,0.1)';
                    ctx.beginPath();
                    ctx.roundRect(x, y, w, h, radius);
                    ctx.fill();
                    ctx.strokeStyle = '#fff';
                    ctx.lineWidth = 3;
                    ctx.beginPath();
                    ctx.roundRect(x, y, w, h, radius);
                    ctx.stroke();
                }
                // 花朵
                for (const flower of cell.flowers) {
                    ctx.save();
                    ctx.strokeStyle = '#fff';
                    ctx.lineWidth = 1;
                    const fx = x + flower.x;
                    const fy = y + flower.y;
                    for (let i = 0; i < 5; i++) {
                        const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
                        const px = fx + Math.cos(a) * 3.5;
                        const py = fy + Math.sin(a) * 3.5;
                        ctx.beginPath();
                        ctx.arc(px, py, 3, 0, Math.PI * 2);
                        ctx.stroke();
                    }
                    ctx.fillStyle = '#fff';
                    ctx.beginPath();
                    ctx.arc(fx, fy, 1.5, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                }
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 14px "Courier New",monospace';
                ctx.textAlign = 'center';
                ctx.fillText(isUsed ? 'OK' : '?', x + w / 2, y + 22);
            } else {
                ctx.fillStyle = '#fff';
                ctx.beginPath();
                ctx.roundRect(x, y, w, h, radius);
                ctx.fill();
                ctx.fillStyle = '#000';
                for (let i = 0; i < 6; i++) {
                    const tx = x + ((i * 17 + row * 3 + col * 7) % w);
                    const ty = y + ((i * 23 + col * 5 + row * 11) % h);
                    ctx.beginPath();
                    ctx.arc(tx, ty, 1, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 2.5;
                ctx.beginPath();
                ctx.roundRect(x, y, w, h, radius);
                ctx.stroke();
                ctx.strokeStyle = 'rgba(0,0,0,0.15)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.roundRect(x + 3, y + 3, w - 6, h - 6, radius - 2);
                ctx.stroke();
                if (isHovered && cell.flowers.length > 0 && STATE.backpack.length < C.BACKPACK_CAPACITY) {
                    ctx.fillStyle = 'rgba(0,0,0,0.06)';
                    ctx.beginPath();
                    ctx.roundRect(x, y, w, h, radius);
                    ctx.fill();
                    ctx.strokeStyle = '#000';
                    ctx.lineWidth = 3;
                    ctx.beginPath();
                    ctx.roundRect(x, y, w, h, radius);
                    ctx.stroke();
                }
                for (const flower of cell.flowers) {
                    drawFlower(ctx, x + flower.x, y + flower.y, flower.color);
                }
                if (cell.flowers.length >= 4) {
                    ctx.fillStyle = '#000';
                    ctx.font = 'bold 11px "Courier New",monospace';
                    ctx.textAlign = 'right';
                    ctx.fillText('x' + cell.flowers.length, x + w - 8, y + 16);
                }
                if (cell.isStair) {
                    ctx.fillStyle = '#000';
                    ctx.font = 'bold 12px "Courier New",monospace';
                    ctx.textAlign = 'center';
                    ctx.fillText('STAIR', x + w / 2, y + 22);
                }
                if (cell.isWeapon) {
                    const hasWeapon = STATE.weaponLevel > 0;
                    ctx.fillStyle = '#000';
                    ctx.font = 'bold 12px "Courier New",monospace';
                    ctx.textAlign = 'center';
                    ctx.fillText(hasWeapon ? 'DONE' : 'SWORD', x + w / 2, y + 22);
                }
            }
        } else {
            const isExpandable = window.GameCore.isAdjacentToLit(row, col);
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.roundRect(x, y, w, h, radius);
            ctx.fill();
            if (isExpandable) {
                const pulse = 0.2 + 0.5 * Math.sin(Date.now() / 800);
                ctx.fillStyle = `rgba(0,0,0,${pulse})`;
                ctx.beginPath();
                ctx.roundRect(x, y, w, h, radius);
                ctx.fill();
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 2;
                ctx.setLineDash([]);
                ctx.beginPath();
                ctx.roundRect(x, y, w, h, radius);
                ctx.stroke();
                ctx.fillStyle = '#fff';
                ctx.font = '18px "Courier New",monospace';
                ctx.textAlign = 'center';
                ctx.fillText('+', x + w / 2, y + h / 2 + 7);
                if (isHovered && STATE.backpack.length >= window.GameCore.getFlowersToLight()) {
                    ctx.fillStyle = 'rgba(0,0,0,0.15)';
                    ctx.beginPath();
                    ctx.roundRect(x, y, w, h, radius);
                    ctx.fill();
                    ctx.strokeStyle = '#000';
                    ctx.lineWidth = 3;
                    ctx.setLineDash([]);
                    ctx.beginPath();
                    ctx.roundRect(x, y, w, h, radius);
                    ctx.stroke();
                }
                ctx.fillStyle = '#000';
                ctx.font = '9px "Courier New",monospace';
                ctx.textAlign = 'center';
                ctx.fillText(`${window.GameCore.getFlowersToLight()}`, x + w / 2, y + h - 6);
            } else {
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 1;
                ctx.setLineDash([3, 4]);
                ctx.beginPath();
                ctx.roundRect(x, y, w, h, radius);
                ctx.stroke();
                ctx.setLineDash([]);
            }
            if (cell.isGuide) {
                ctx.fillStyle = '#000';
                ctx.font = 'bold 12px "Courier New",monospace';
                ctx.textAlign = 'center';
                ctx.fillText('?', x + w / 2, y + 20);
            }
            if (cell.isWeapon) {
                ctx.fillStyle = '#000';
                ctx.font = 'bold 10px "Courier New",monospace';
                ctx.textAlign = 'center';
                ctx.fillText('WPN', x + w / 2, y + 20);
            }
        }

        ctx.restore();
    }

    // ==================== 主绘制循环 ====================
    function drawGame() {
        if (STATE.canvasCSSWidth === 0 || STATE.canvasCSSHeight === 0) return;

        const ctx = DOM.ctx;
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, STATE.canvasCSSWidth, STATE.canvasCSSHeight);

        ctx.fillStyle = 'rgba(0,0,0,0.03)';
        for (let i = 0; i < 20; i++) {
            const seed = i * 137.5;
            const dx = (Math.sin(seed) * 0.6 + 0.5) * STATE.canvasCSSWidth;
            const dy = (Math.cos(seed * 1.7) * 0.6 + 0.5) * STATE.canvasCSSHeight;
            ctx.beginPath();
            ctx.arc(dx, dy, 1.5, 0, Math.PI * 2);
            ctx.fill();
        }

        for (let row = 0; row < C.GRID_SIZE; row++) {
            for (let col = 0; col < C.GRID_SIZE; col++) {
                const bounds = window.GameCore.getCellBounds(row, col);
                drawCell(ctx, row, col, bounds);
            }
        }

        window.Particles.draw(ctx);

        const centerBounds = window.GameCore.getCellBounds(Math.floor(C.GRID_SIZE / 2), Math.floor(C.GRID_SIZE / 2));
        if (STATE.grid[Math.floor(C.GRID_SIZE / 2)][Math.floor(C.GRID_SIZE / 2)].lit && STATE.litCount === 1) {
            const cx = centerBounds.x + centerBounds.w / 2;
            const cy = centerBounds.y - 10;
            ctx.fillStyle = '#000';
            ctx.font = 'bold 11px "Courier New",monospace';
            ctx.textAlign = 'center';
            const bounce = Math.sin(Date.now() / 1200) * 3;
            ctx.fillText('HOME', cx, cy + bounce);
        }
    }

    // ==================== 游戏循环 ====================
    function gameLoop() {
        window.Particles.update();
        drawGame();
        STATE.animFrameId = requestAnimationFrame(gameLoop);
    }

    window.CanvasRenderer = {
        resize: resizeCanvas,
        draw: drawGame,
        startLoop: gameLoop
    };
})();