(function() {
    const { C, DOM, STATE } = window.GS;

    const container = DOM.guideInteractionContainer;
    const closeBtn = DOM.btnGuideClose;

    function activateGuide(row, col) {
        if (STATE.monsterActive) return false;
        const cell = STATE.grid[row][col];
        if (!cell.lit || !cell.isGuide) return false;

        const guideInfo = STATE.guideLocations.find(g => g.row === row && g.col === col);
        if (!guideInfo || guideInfo.revealed) return false;

        STATE.activeGuideForInteraction = { row, col };
        showGuideInteractionContainer(guideInfo);
        return true;
    }

    function showGuideInteractionContainer(guideInfo) {
        const { row, col } = guideInfo;

        DOM.guideInteractionTitle.textContent = `指引者 (${row},${col})`;
        DOM.guideInteractionDesc.textContent = '你的灯光照亮了一尊雕像。';

        // 选项A：祈求指引（默认可用）
        DOM.btnGuidePray.style.display = '';
        DOM.btnGuidePray.onclick = function() {
            handleGuidePray(guideInfo);
        };

        // 选项B：攻击雕像（躁狂满级时可用）
        if (STATE.maniaLevel >= 3) {
            DOM.btnGuideAttack.style.display = '';
            DOM.btnGuideAttack.textContent = `*攻击雕像 (躁狂 ${STATE.maniaLevel}/3)*`;
            DOM.btnGuideAttack.onclick = function() {
                handleGuideAttack(guideInfo);
            };
        } else {
            DOM.btnGuideAttack.style.display = 'none';
        }

        // 选项C：向雕像祈祷（贪婪时可用）
        if (STATE.greedLevel > 0) {
            DOM.btnGuidePrayGreed.style.display = '';
            DOM.btnGuidePrayGreed.textContent = `*向雕像祈祷 (贪婪 ${STATE.greedLevel}/3)*`;
            DOM.btnGuidePrayGreed.onclick = function() {
                handleGuidePrayGreed(guideInfo);
            };
        } else {
            DOM.btnGuidePrayGreed.style.display = 'none';
        }

        container.classList.add('show');
    }

    function closeGuideInteraction() {
        container.classList.remove('show');
        STATE.activeGuideForInteraction = null;
    }

    // 关闭按钮
    if (closeBtn) {
        closeBtn.addEventListener('click', closeGuideInteraction);
    }

    function getGuideHintText(guideInfo, accuracy) {
        const { row, col } = guideInfo;
        let hintText = '';

        if (STATE.currentLayer === C.TOTAL_LAYERS) {
            if (accuracy === 'full') {
                hintText = `我看到一个重要的碎片，在 (${STATE.treasureLocation.row}, ${STATE.treasureLocation.col}) 处。`;
            } else if (accuracy === 'partial') {
                const dir = getDirectionHint(STATE.treasureLocation.row, STATE.treasureLocation.col);
                hintText = `我看到一个珍贵的碎片，在${dir}方向...`;
            } else {
                hintText = `雕像的双眼已经碎裂，什么也看不见...`;
            }
        } else if (guideInfo.type === 'stair') {
            if (accuracy === 'full') {
                hintText = `我看到一个重要的东西，在 (${STATE.stairLocation.row}, ${STATE.stairLocation.col}) 处。`;
            } else if (accuracy === 'partial') {
                const dir = getDirectionHint(STATE.stairLocation.row, STATE.stairLocation.col);
                hintText = `那个重要的东西在${dir}方向...`;
            } else {
                hintText = `雕像的双眼已经碎裂，什么也看不见...`;
            }
        } else if (guideInfo.type === 'weapon') {
            const wl = STATE.weaponLocation || { row: '?', col: '?' };
            if (accuracy === 'full') {
                hintText = `我看到一个重要的东西，在 (${wl.row}, ${wl.col}) 处。`;
            } else if (accuracy === 'partial') {
                const dir = getDirectionHint(wl.row, wl.col);
                hintText = `那个东西在${dir}方向...`;
            } else {
                hintText = `雕像的双眼已经碎裂，什么也看不见...`;
            }
        } else if (guideInfo.type === 'reveal') {
            const others = STATE.guideLocations.filter(g => g !== guideInfo && !g.revealed);
            if (others.length > 0) {
                const target = others[Math.floor(Math.random() * others.length)];
                const targetType = target.type === 'stair' ? '阶梯' : (target.type === 'weapon' ? '武器箱' : '指引者');
                if (accuracy === 'full') {
                    hintText = `位于 (${target.row},${target.col}) 处的指引者指向的是${targetType}。`;
                } else if (accuracy === 'partial') {
                    hintText = `某个指引者指向的是${targetType}，但位置已经模糊了...`;
                } else {
                    hintText = `雕像的双眼已经碎裂，什么也看不见...`;
                }
            } else {
                hintText = `所有指引者已经揭示过了...`;
            }
        }

        return hintText;
    }

    function getDirectionHint(targetRow, targetCol) {
        const centerRow = Math.floor(C.GRID_SIZE / 2);
        const centerCol = Math.floor(C.GRID_SIZE / 2);
        const dr = targetRow - centerRow;
        const dc = targetCol - centerCol;
        let dir = '';
        if (dr < 0) dir += '北';
        else if (dr > 0) dir += '南';
        if (dc < 0) dir += '西';
        else if (dc > 0) dir += '东';
        return dir || '正中央';
    }

    // 选项A：祈求指引
    function handleGuidePray(guideInfo) {
        const accuracy = getGuideAccuracy();
        const hintText = getGuideHintText(guideInfo, accuracy);

        guideInfo.revealed = true;
        addGuideLog(`位于 (${guideInfo.row},${guideInfo.col}) 的指引者说：${hintText}`, 'hint');
        if (window.UI) window.UI.showHint(`指引者：${hintText}`, '');
        if (window.UI) window.UI.updateAll();
        closeGuideInteraction();
    }

    // 根据躁狂等级决定信息精度
    function getGuideAccuracy() {
        if (STATE.maniaLevel <= 0) return 'full';
        if (STATE.maniaLevel === 1) return 'partial';
        return 'none';
    }

    // 选项B：攻击雕像（躁狂专用）
    function handleGuideAttack(guideInfo) {
        STATE.maniaLevel = Math.max(0, STATE.maniaLevel - 1);

        let msg = '';
        if (STATE.maniaLevel === 0) {
            msg = '出于对怪物的恐惧，你用武器攻击了指引者。等你回过神来时，雕像变得更破旧了……躁狂消失了。';
        } else {
            msg = `你用武器攻击了指引者！雕像更加破碎了……躁狂等级降至 ${STATE.maniaLevel}/3。`;
        }

        addGuideLog(`位于 (${guideInfo.row},${guideInfo.col}) 的指引者被攻击了！${msg}`, 'warning');
        if (window.UI) window.UI.showHint(`⚔️ ${msg}`, 'danger');

        guideInfo.revealed = true;
        if (window.UI) window.UI.updateAll();
        closeGuideInteraction();
    }

    // 选项C：向雕像祈祷（贪婪专用）
    function handleGuidePrayGreed(guideInfo) {
        STATE.greedLevel = Math.max(0, STATE.greedLevel - 1);

        let msg = `为了压抑自己膨胀的内心，你向雕像祈祷……贪婪等级降至 ${STATE.greedLevel}/3。`;
        addGuideLog(`位于 (${guideInfo.row},${guideInfo.col}) 的指引者回应了你的祈祷。${msg}`, 'success');
        if (window.UI) window.UI.showHint(`🙏 ${msg}`, 'success');

        guideInfo.revealed = true;
        if (window.UI) window.UI.updateAll();
        closeGuideInteraction();
    }

    function addGuideLog(message, className = 'normal') {
        const entry = {
            text: message,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            class: className
        };
        STATE.guideLog.unshift(entry);
        if (STATE.guideLog.length > 15) STATE.guideLog.pop();
        updateGuideLogUI();
    }

    function updateGuideLogUI() {
        if (!DOM.guideLogContent) return;
        let html = '';
        if (STATE.guideLog.length > 0) {
            html += '<div style="margin:0 0 6px;font-size:0.85em;color:#000;font-weight:600;">指引者记录</div>';
            for (const entry of STATE.guideLog) {
                html += `<div class="guide-log-entry ${entry.class}">
                    <span style="color:#000;font-size:0.8em;">${entry.time}</span><br>
                    ${entry.text}
                </div>`;
            }
        } else {
            html = '<div class="guide-log-empty">点亮指引者地块后自动获得坐标信息</div>';
        }
        DOM.guideLogContent.innerHTML = html;
        DOM.guideLogContent.scrollTop = 0;
    }

    window.GuideSystem = {
        activateGuide: activateGuide,
        addGuideLog: addGuideLog,
        updateGuideLogUI: updateGuideLogUI,
        closeGuideInteraction: closeGuideInteraction
    };
})();