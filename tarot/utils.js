/**
 * Fisher-Yates 洗牌算法
 */
function shuffleArray(arr) {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * 从牌组中随机抽取指定数量（不重复）
 */
function drawCards(count) {
    const shuffled = shuffleArray(tarotDeck);
    const drawn = shuffled.slice(0, count);
    return drawn.map(card => ({
        ...card,
        isReversed: Math.random() < 0.5,
    }));
}

/**
 * 获取当前时间字符串
 */
function getTimestamp() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * 获取大阿卡纳的罗马数字显示
 */
function getCardNumberDisplay(card) {
    if (card.type === 'major') {
        return card.roman || String(card.number);
    }
    return String(card.number);
}

/**
 * 获取卡牌的完整序号标签
 */
function getCardFullNumberLabel(card) {
    if (card.type === 'major') {
        return `#${card.roman || card.number} (大阿卡纳)`;
    }
    return `#${card.number} (${card.suit})`;
}