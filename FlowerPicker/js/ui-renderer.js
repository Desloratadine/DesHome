(function() {
    const { C, DOM, STATE } = window.GS;

    function updateAll() {
        updateProgressUI();
        updateBackpackUI();
        if (window.GuideSystem) window.GuideSystem.updateGuideLogUI();
        updateWeaponUI();
        updateStatusPanel();
    }

    function updateWeaponUI() {
        if (STATE.weaponLevel > 0) {
            DOM.weaponPanel.style.display = 'flex';
            DOM.weaponLevelText.textContent = STATE.weaponLevel;
            const nextLevelCost = STATE.weaponLevel < 4 ? C.WEAPON_UPGRADE_COSTS[STATE.weaponLevel] : 0;
            if (STATE.weaponLevel >= 4) {
                DOM.btnWeaponUpgrade.textContent = '已满级';
                DOM.btnWeaponUpgrade.disabled = true;
            } else {
                DOM.btnWeaponUpgrade.textContent = `⬆ 升级 (${nextLevelCost}🌸)`;
                DOM.btnWeaponUpgrade.disabled = STATE.backpack.length < nextLevelCost;
            }
        } else {
            DOM.weaponPanel.style.display = 'none';
        }
    }

    function updateProgressUI() {
        DOM.currentLayer.textContent = STATE.currentLayer;
        DOM.totalLayers.textContent = C.TOTAL_LAYERS;
        let hallucinationText = '';
        if (STATE.maniaLevel > 0) hallucinationText += ` 💢${STATE.maniaLevel}`;
        if (STATE.greedLevel > 0) hallucinationText += ` 💰${STATE.greedLevel}`;
        DOM.progressNumber.textContent = `当前: ${STATE.litTilesHistory.length}/${C.MAX_LIT_TILES} | 碎片: ${STATE.treasureFragments}/3${hallucinationText}`;
        DOM.progressDots.innerHTML = '';
        for (let i = 0; i < C.TOTAL_LAYERS; i++) {
            const dot = document.createElement('span');
            dot.className = 'progress-dot';
            if (i < STATE.currentLayer - 1) {
                dot.classList.add('lit');
                dot.textContent = '✓';
            } else if (i === STATE.currentLayer - 1) {
                dot.classList.add('current');
                dot.textContent = STATE.currentLayer;
            }
            DOM.progressDots.appendChild(dot);
        }
        if (!(STATE.currentLayer === C.TOTAL_LAYERS && STATE.treasureFound)) {
            if (DOM.hintText.textContent === '点击已点亮的地块采集花朵 🌸' ||
                DOM.hintText.textContent.includes('宝藏')) {
            } else {
                DOM.hintText.textContent = '点击已点亮的地块采集花朵 🌸';
            }
        }
    }

    function updateBackpackUI() {
        DOM.backpackSlots.innerHTML = '';
        for (let i = 0; i < C.BACKPACK_CAPACITY; i++) {
            const slot = document.createElement('span');
            slot.className = 'backpack-slot';
            if (i < STATE.backpack.length) {
                slot.classList.add('filled');
                const flowerEmoji = document.createElement('span');
                flowerEmoji.className = 'flower-emoji';
                flowerEmoji.textContent = '🌸';
                slot.appendChild(flowerEmoji);
            }
            DOM.backpackSlots.appendChild(slot);
        }
        DOM.backpackCount.textContent = `${STATE.backpack.length}/${C.BACKPACK_CAPACITY}`;
        if (STATE.backpack.length >= C.BACKPACK_CAPACITY) {
            DOM.backpackCount.style.color = '#000';
        } else if (STATE.backpack.length >= window.GameCore.getFlowersToLight()) {
            DOM.backpackCount.style.color = '#000';
        } else {
            DOM.backpackCount.style.color = '#000';
        }
    }

    function updateStatusPanel() {
        const mania = STATE.maniaLevel || 0;
        const greed = STATE.greedLevel || 0;

        DOM.maniaLevelText.textContent = `${mania}/3`;
        DOM.greedLevelText.textContent = `${greed}/3`;

        DOM.maniaBarFill.style.width = `${(mania / 3) * 100}%`;
        DOM.greedBarFill.style.width = `${(greed / 3) * 100}%`;

        DOM.maniaLevelText.className = 'status-level' + (mania > 0 ? ' active' : '');
        DOM.greedLevelText.className = 'status-level' + (greed > 0 ? ' active' : '');

        const maniaDescs = [
            '情绪稳定。升级武器或攻击怪物会积累躁狂。',
            '躁狂初显。指引者信息变得模糊，仅显示方向。',
            '躁狂加剧。指引者完全沉默，无法提供帮助。',
            '躁狂极限！破坏欲难以抑制，可攻击指引者发泄！'
        ];
        const greedDescs = [
            '内心平静。点亮地块或背包满会积累贪婪。',
            '贪婪初现。注意管理背包空间。',
            '贪婪滋长。背包满时后果更严重！点击指引者祈祷可降级。',
            '贪婪极限！背包满时将触发特殊事件，失去所有花朵！'
        ];

        DOM.maniaDesc.textContent = maniaDescs[mania];
        DOM.greedDesc.textContent = greedDescs[greed];

        DOM.maniaDesc.className = 'status-desc' + (mania >= 3 ? ' danger' : mania >= 1 ? ' warning' : '');
        DOM.greedDesc.className = 'status-desc' + (greed >= 3 ? ' danger' : greed >= 1 ? ' warning' : '');
    }

    function shakeBackpack() {
        const slotsContainer = DOM.backpackSlots;
        slotsContainer.style.animation = 'none';
        slotsContainer.offsetHeight;
        slotsContainer.style.animation = 'shake 0.4s ease-out';
        setTimeout(() => {
            slotsContainer.style.animation = '';
        }, 400);
    }

    function showHint(msg, className) {
        DOM.hintText.textContent = msg;
        DOM.hintText.className = 'hint-text ' + (className || '');
    }

    window.UI = {
        updateAll: updateAll,
        updateWeaponUI: updateWeaponUI,
        updateProgressUI: updateProgressUI,
        updateBackpackUI: updateBackpackUI,
        updateStatusPanel: updateStatusPanel,
        shakeBackpack: shakeBackpack,
        showHint: showHint
    };
})();