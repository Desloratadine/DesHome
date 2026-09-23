// DOM 元素
const drawBtn = document.getElementById('drawBtn');
const countInput = document.getElementById('countInput');
const questionInput = document.getElementById('questionInput');
const exportBtn = document.getElementById('exportBtn');
const waitingState = document.getElementById('waitingState');
const resultsContainer = document.getElementById('resultsContainer');
const rightPanel = document.getElementById('rightPanel');

// 模态框元素
const noteModal = document.getElementById('noteModal');
const noteModalOverlay = document.getElementById('noteModalOverlay');
const noteModalContainer = document.getElementById('noteModalContainer');
const noteModalTitle = document.getElementById('noteModalTitle');
const noteTextarea = document.getElementById('noteTextarea');
const noteModalCancel = document.getElementById('noteModalCancel');
const noteModalSave = document.getElementById('noteModalSave');
const noteModalDelete = document.getElementById('noteModalDelete');
const noteModalClose = document.getElementById('noteModalClose');

// 卡牌详情模态框
const cardDetailModal = document.getElementById('cardDetailModal');
const cardDetailModalOverlay = document.getElementById('cardDetailModalOverlay');
const cardDetailModalClose = document.getElementById('cardDetailModalClose');

// 笔记管理按钮
const exportNotesBtn = document.getElementById('exportNotesBtn');
const importNotesBtn = document.getElementById('importNotesBtn');
const importNotesFile = document.getElementById('importNotesFile');
const syncNotesBtn = document.getElementById('syncNotesBtn');
const syncNotesFile = document.getElementById('syncNotesFile');

// 提示词设置元素
const includePromptToggle = document.getElementById('includePromptToggle');
const aiPromptTextarea = document.getElementById('aiPromptTextarea');
const promptSaveBtn = document.getElementById('promptSaveBtn');
const promptResetBtn = document.getElementById('promptResetBtn');
const promptInsertBtn = document.getElementById('promptInsertBtn');

// 状态
let currentDrawResult = null;
let currentEditingCardId = null;
let overviewInitialized = false;
let notesInitialized = false;
let promptInitialized = false;

/**
 * 初始化
 */
function init() {
    // 抽卡按钮
    drawBtn.addEventListener('click', handleDraw);
    exportBtn.addEventListener('click', handleExport);
    document.getElementById('copyResultBtn').addEventListener('click', handleCopyResult);

    // 笔记模态框
    noteModalSave.addEventListener('click', handleSaveNote);
    noteModalCancel.addEventListener('click', closeNoteModal);
    noteModalDelete.addEventListener('click', handleDeleteNote);
    noteModalClose.addEventListener('click', closeNoteModal);
    noteModalOverlay.addEventListener('click', function(event) {
        if (event.target === noteModalOverlay) {
            closeNoteModal();
        }
    });

    // 卡牌详情模态框
    cardDetailModalClose.addEventListener('click', closeCardDetailModal);
    cardDetailModalOverlay.addEventListener('click', function(event) {
        if (event.target === cardDetailModalOverlay) {
            closeCardDetailModal();
        }
    });

    // 笔记管理
    exportNotesBtn.addEventListener('click', exportNotesToFile);
    importNotesBtn.addEventListener('click', function() {
        importNotesFile.click();
    });
    importNotesFile.addEventListener('change', function(event) {
        if (event.target.files.length > 0) {
            importNotesFromFile(event.target.files[0])
                .then(result => {
                    alert(`成功导入 ${result.importedCount} 条笔记，共 ${result.totalCount} 条笔记`);
                    if (notesInitialized) {
                        renderNotesList();
                    }
                })
                .catch(err => {
                    alert(`导入失败: ${err.message}`);
                });
        }
        importNotesFile.value = '';
    });
    syncNotesBtn.addEventListener('click', function() {
        syncNotesFile.click();
    });
    syncNotesFile.addEventListener('change', function(event) {
        if (event.target.files.length > 0) {
            syncNotesFromFile(event.target.files[0], 'merge')
                .then(result => {
                    alert(`同步完成！当前共有 ${result.finalCount} 条笔记`);
                    if (notesInitialized) {
                        renderNotesList();
                    }
                })
                .catch(err => {
                    alert(`同步失败: ${err.message}`);
                });
        }
        syncNotesFile.value = '';
    });

    // 提示词设置
    includePromptToggle.checked = getIncludePrompt();
    includePromptToggle.addEventListener('change', function() {
        setIncludePrompt(this.checked);
    });
    promptSaveBtn.addEventListener('click', handleSavePrompt);
    promptResetBtn.addEventListener('click', handleResetPrompt);
    promptInsertBtn.addEventListener('click', function() {
        insertPromptPlaceholder();
    });

    // 事件委托：笔记编辑按钮
    resultsContainer.addEventListener('click', function(event) {
        if (event.target.classList.contains('btn-edit-note')) {
            const cardId = event.target.dataset.cardId;
            openNoteModal(cardId);
        }
    });

    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('btn-edit-note')) {
            const cardId = event.target.dataset.cardId;
            openNoteModal(cardId);
        }
    });

    // 导航按钮
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const viewName = this.getAttribute('data-view');
            switchView(viewName);
        });
    });

    // 卡牌总览筛选
    document.getElementById('cardFilter').addEventListener('change', function() {
        renderCardOverview(this.value);
    });

    // 卡牌总览点击事件
    document.getElementById('cardGrid').addEventListener('click', function(event) {
        const gridItem = event.target.closest('.grid-card-item');
        if (gridItem) {
            const cardId = gridItem.dataset.cardId;
            const card = tarotDeck.find(c => c.id === cardId);
            if (card) {
                openCardDetailModal(card);
            }
        }
    });

    // 键盘快捷键
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Enter' && event.target !== noteTextarea && !event.target.matches('textarea')) {
            if (document.activeElement !== countInput && document.activeElement !== questionInput) {
                event.preventDefault();
            }
            handleDraw();
        }
        if (event.key === 'Escape') {
            if (noteModal.style.display === 'flex') {
                closeNoteModal();
            }
            if (cardDetailModal.style.display === 'flex') {
                closeCardDetailModal();
            }
        }
    });

    // 确保默认显示抽卡页
    switchView('draw');
}

/**
 * 切换视图
 */
function switchView(viewName) {
    // 更新导航按钮状态
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-view') === viewName);
    });

    // 隐藏所有视图
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });

    // 显示目标视图
    document.getElementById('view-' + viewName).classList.add('active');

    // 视图特定初始化
    if (viewName === 'overview' && !overviewInitialized) {
        renderCardOverview();
        overviewInitialized = true;
    } else if (viewName === 'notes' && !notesInitialized) {
        renderNotesList();
        notesInitialized = true;
    } else if (viewName === 'prompt') {
        // 每次进入提示词页都同步最新内容
        aiPromptTextarea.value = loadPromptText();
        includePromptToggle.checked = getIncludePrompt();
    }
}

/**
 * 抽卡逻辑
 */
function handleDraw() {
    let count = parseInt(countInput.value, 10);
    if (isNaN(count) || count < 1) {
        count = 1;
        countInput.value = '1';
    }
    if (count > 78) {
        count = 78;
        countInput.value = '78';
    }

    const question = questionInput.value.trim();
    const cards = drawCards(count);
    const timestamp = getTimestamp();
    currentDrawResult = { cards, question, count, timestamp };

    renderResults(cards, question, count, timestamp);
}

/**
 * 构建占卜结果文本
 */
function buildResultText() {
    if (!currentDrawResult) return '';

    const { cards, question, count, timestamp } = currentDrawResult;
    let text = '';
    text += '占卜记录\n';
    text += '============\n';
    text += `时间: ${timestamp}\n`;
    text += `问题: ${question || '(无)'}\n`;
    text += `抽取: ${count}张\n`;
    text += '\n';

    cards.forEach((card, index) => {
        text += `[牌 ${index + 1}]\n`;
        text += `${getCardFullNumberLabel(card)}\n`;
        text += `${card.name} [${card.isReversed ? '逆位' : '正位'}]\n`;
        text += `元素: ${card.element}`;
        if (card.type === 'minor') {
            text += ` | 系列: ${card.suit}`;
        }
        if (card.court) {
            text += ' (宫廷牌)';
        }
        const note = getNote(card.id);
        if (note) {
            text += `\n笔记: ${note}`;
        }
        text += '\n---\n';
    });
    return text;
}

/**
 * 导出格式
 */
function handleExport() {
    if (!currentDrawResult) {
        alert('请先抽取卡牌，才能导出结果。');
        return;
    }

    const text = buildPromptedResult(buildResultText());
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tarot_reading_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * 复制占卜结果到剪贴板
 */
function handleCopyResult() {
    if (!currentDrawResult) {
        alert('请先抽取卡牌，才能复制结果。');
        return;
    }

    const text = buildPromptedResult(buildResultText());
    const copyBtn = document.getElementById('copyResultBtn');
    copyBtn.textContent = '> 已复制!';
    setTimeout(() => { copyBtn.textContent = '> 复制结果'; }, 1500);

    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(function() {
            // 成功
        }, function() {
            fallbackCopy(text);
        });
    } else {
        fallbackCopy(text);
    }
}

/**
 * 剪贴板降级方案
 */
function fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
        document.execCommand('copy');
    } catch (e) {
        alert('复制失败，请使用导出功能。');
    }
    document.body.removeChild(textarea);
}

/**
 * 保存提示词
 */
function handleSavePrompt() {
    savePromptText(aiPromptTextarea.value);
    promptSaveBtn.textContent = '✓ 已保存';
    setTimeout(() => { promptSaveBtn.textContent = '✓ 保存提示词'; }, 1500);
}

/**
 * 恢复默认提示词
 */
function handleResetPrompt() {
    if (confirm('确定要恢复为默认提示词吗？当前内容将被覆盖。')) {
        resetPromptText();
        aiPromptTextarea.value = loadPromptText();
        promptResetBtn.textContent = '✓ 已恢复默认';
        setTimeout(() => { promptResetBtn.textContent = '↺ 恢复默认'; }, 1500);
    }
}

/**
 * 在提示词末尾插入占位标记 {{RESULTS}}
 */
function insertPromptPlaceholder() {
    aiPromptTextarea.value += '{{RESULTS}}';
    aiPromptTextarea.focus();
}

/**
 * 打开笔记编辑模态框
 */
function openNoteModal(cardId) {
    const card = tarotDeck.find(c => c.id === cardId);
    if (!card) return;

    currentEditingCardId = cardId;
    noteModalTitle.textContent = `编辑笔记: ${card.name}`;
    noteTextarea.value = getNote(cardId) || '';
    noteModal.style.display = 'flex';
    noteModalOverlay.style.display = 'flex';
    setTimeout(() => {
        noteModalOverlay.style.opacity = '1';
        noteModalContainer.style.transform = 'translateY(0) scale(1)';
    }, 10);
    noteTextarea.focus();
}

/**
 * 关闭笔记编辑模态框
 */
function closeNoteModal() {
    noteModalOverlay.style.opacity = '0';
    noteModalContainer.style.transform = 'translateY(-20px) scale(0.95)';
    setTimeout(() => {
        noteModal.style.display = 'none';
        noteModalOverlay.style.display = 'none';
    }, 200);
    currentEditingCardId = null;
}

/**
 * 保存笔记
 */
function handleSaveNote() {
    if (!currentEditingCardId) return;

    const text = noteTextarea.value.trim();
    setNote(currentEditingCardId, text);

    // 更新抽卡结果中的笔记显示
    const noteEl = document.getElementById('note-content-' + currentEditingCardId);
    if (noteEl) {
        if (text) {
            noteEl.textContent = text;
            noteEl.classList.add('has-note');
            noteEl.classList.remove('no-note');
        } else {
            noteEl.textContent = '暂无笔记，点击「编辑」添加';
            noteEl.classList.add('no-note');
            noteEl.classList.remove('has-note');
        }
    }

    // 更新卡牌详情中的笔记显示
    const detailNoteEl = document.getElementById('card-detail-note-' + currentEditingCardId);
    if (detailNoteEl) {
        if (text) {
            detailNoteEl.textContent = text;
            detailNoteEl.classList.remove('no-note');
        } else {
            detailNoteEl.textContent = '暂无笔记，点击「编辑」添加';
            detailNoteEl.classList.add('no-note');
        }
    }

    // 更新笔记列表
    if (notesInitialized) {
        renderNotesList();
    }

    closeNoteModal();
}

/**
 * 删除笔记
 */
function handleDeleteNote() {
    if (!currentEditingCardId) return;

    if (confirm('确定要删除这张卡牌的笔记吗？')) {
        deleteNote(currentEditingCardId);

        const noteEl = document.getElementById('note-content-' + currentEditingCardId);
        if (noteEl) {
            noteEl.textContent = '暂无笔记，点击「编辑」添加';
            noteEl.classList.add('no-note');
            noteEl.classList.remove('has-note');
        }

        const detailNoteEl = document.getElementById('card-detail-note-' + currentEditingCardId);
        if (detailNoteEl) {
            detailNoteEl.textContent = '暂无笔记，点击「编辑」添加';
            detailNoteEl.classList.add('no-note');
        }

        if (notesInitialized) {
            renderNotesList();
        }

        closeNoteModal();
    }
}

/**
 * 打开卡牌详情模态框
 */
function openCardDetailModal(card) {
    renderCardDetailModal(card);
    cardDetailModal.style.display = 'flex';
    cardDetailModalOverlay.style.display = 'flex';
    setTimeout(() => {
        cardDetailModalOverlay.style.opacity = '1';
        document.getElementById('cardDetailModalContainer').style.transform = 'translateY(0) scale(1)';
    }, 10);
}

/**
 * 关闭卡牌详情模态框
 */
function closeCardDetailModal() {
    cardDetailModalOverlay.style.opacity = '0';
    document.getElementById('cardDetailModalContainer').style.transform = 'translateY(-20px) scale(0.95)';
    setTimeout(() => {
        cardDetailModal.style.display = 'none';
        cardDetailModalOverlay.style.display = 'none';
    }, 200);
}

// 初始化
init();
