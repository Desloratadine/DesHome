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
 *
 * 模拟真实切牌：整副牌洗好后统一决定牌叠朝向，抽出连续一段牌。
 * 逆位不是每张独立各 50%，而是取自一个连续逆位区间（约占总牌的 20%~45%），
 * 位置随机，使抽出的卡牌中逆位成片出现，更贴近现实中洗牌与翻转的效果。
 */
function drawCards(count, options) {
    options = options || {};
    const majorOnly = options.majorOnly;
    let source = tarotDeck;
    if (majorOnly) {
        source = tarotDeck.filter(card => card.type === 'major');
    }
    const deck = shuffleArray(source);
    const total = deck.length;

    // 随机选取一个连续的逆位区间 [start, start + reverseLen)
    const minLen = Math.floor(total * 0.2);
    const maxLen = Math.floor(total * 0.45);
    const reverseLen = minLen + Math.floor(Math.random() * (maxLen - minLen + 1));
    const start = Math.floor(Math.random() * (total - reverseLen + 1));

    // 从牌叠顶部抽取 count 张，判断每张是否落在逆位区间内
    return deck.slice(0, count).map((card, index) => ({
        ...card,
        isReversed: index >= start && index < start + reverseLen,
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