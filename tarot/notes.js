// ==================== 笔记管理模块 ====================
const NOTE_STORAGE_KEY = 'tarot_card_notes';

// 从 localStorage 加载笔记
function loadNotes() {
    const saved = localStorage.getItem(NOTE_STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
}

// 保存笔记到 localStorage
function saveNotes(notes) {
    localStorage.setItem(NOTE_STORAGE_KEY, JSON.stringify(notes));
}

// 获取单张卡牌的笔记
function getNote(cardId) {
    const notes = loadNotes();
    return notes[cardId] || '';
}

// 设置单张卡牌的笔记
function setNote(cardId, content) {
    const notes = loadNotes();
    if (content.trim()) {
        notes[cardId] = content.trim();
    } else {
        delete notes[cardId]; // 内容为空时删除该笔记
    }
    saveNotes(notes);
}

// 删除单张卡牌的笔记
function deleteNote(cardId) {
    const notes = loadNotes();
    delete notes[cardId];
    saveNotes(notes);
}

// 批量获取卡牌笔记
function getNotesForCards(cardIds) {
    const notes = loadNotes();
    const result = {};
    cardIds.forEach(id => {
        result[id] = notes[id] || '';
    });
    return result;
}

// ==================== 本地文件导入/导出功能 ====================

// 导出笔记到本地 JSON 文件
function exportNotesToFile() {
    const notes = loadNotes();
    const data = {
        version: '1.0',
        exportTime: new Date().toISOString(),
        notes: notes
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    a.download = `tarot_notes_${timestamp}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// 从本地 JSON 文件导入笔记
function importNotesFromFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);
                if (data && data.notes) {
                    const existingNotes = loadNotes();
                    const mergedNotes = { ...existingNotes, ...data.notes };
                    saveNotes(mergedNotes);
                    resolve({
                        importedCount: Object.keys(data.notes).length,
                        totalCount: Object.keys(mergedNotes).length
                    });
                } else {
                    reject(new Error('无效的笔记文件格式'));
                }
            } catch (err) {
                reject(err);
            }
        };
        reader.onerror = function() {
            reject(new Error('读取文件失败'));
        };
        reader.readAsText(file);
    });
}

// 同步本地文件和浏览器（浏览器优先合并）
function syncNotesFromFile(file, mode = 'merge') {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);
                if (data && data.notes) {
                    const browserNotes = loadNotes();
                    let finalNotes = {};
                    
                    if (mode === 'merge') {
                        // 合并模式：浏览器和本地文件都保留，浏览器优先
                        finalNotes = { ...data.notes, ...browserNotes };
                    } else if (mode === 'overwrite') {
                        // 覆盖模式：本地文件完全覆盖浏览器
                        finalNotes = data.notes;
                    } else if (mode === 'keep') {
                        // 保留模式：浏览器优先，只添加新的
                        finalNotes = { ...browserNotes };
                        Object.keys(data.notes).forEach(id => {
                            if (!finalNotes[id]) {
                                finalNotes[id] = data.notes[id];
                            }
                        });
                    }
                    
                    saveNotes(finalNotes);
                    resolve({
                        mode: mode,
                        finalCount: Object.keys(finalNotes).length
                    });
                } else {
                    reject(new Error('无效的笔记文件格式'));
                }
            } catch (err) {
                reject(err);
            }
        };
        reader.onerror = function() {
            reject(new Error('读取文件失败'));
        };
        reader.readAsText(file);
    });
}

