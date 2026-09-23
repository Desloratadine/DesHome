// ==================== AI 提示词管理模块 ====================
const PROMPT_STORAGE_KEY = 'tarot_ai_prompt';
const PROMPT_INCLUDE_KEY = 'tarot_include_prompt';

// 默认提示词
const DEFAULT_AI_PROMPT = `你是一位精通韦特塔罗的资深占卜师。请根据以下占卜记录，为求问者提供专业、友善且富有洞察力的解读。

解读要求：
1. 先简要说明每张牌在对应位置的核心含义（正位/逆位）。
2. 结合牌面元素（火/水/风/土）与其象征的领域展开分析。
3. 注意卡牌之间的关联与整体牌势。
4. 针对求问者的问题给出切实可行的建议。
5. 语言温和体贴，用词积极，避免宿命论式的绝对断言。
6. 最后做一段简短的总结。

以下为具体占卜记录，请据此解读：
{{RESULTS}}`;

// 从 localStorage 加载提示词
function loadPromptText() {
    const saved = localStorage.getItem(PROMPT_STORAGE_KEY);
    return saved !== null ? saved : DEFAULT_AI_PROMPT;
}

// 保存提示词到 localStorage
function savePromptText(text) {
    localStorage.setItem(PROMPT_STORAGE_KEY, text);
}

// 恢复默认提示词
function resetPromptText() {
    localStorage.removeItem(PROMPT_STORAGE_KEY);
}

// 获取是否附带提示词
function getIncludePrompt() {
    return localStorage.getItem(PROMPT_INCLUDE_KEY) === '1';
}

// 设置是否附带提示词
function setIncludePrompt(include) {
    localStorage.setItem(PROMPT_INCLUDE_KEY, include ? '1' : '0');
}

// 将提示词与占卜结果合并
function buildPromptedResult(resultText) {
    if (!getIncludePrompt()) return resultText;

    let prompt = loadPromptText().trim();
    if (!prompt) return resultText;

    if (prompt.indexOf('{{RESULTS}}') !== -1) {
        // 有占位符则替换占位符
        return prompt.replace(/\{\{RESULTS\}\}/g, resultText);
    }
    // 无占位符时，结果追加在提示词末尾
    return prompt + '\n\n============ 占卜结果 ============\n\n' + resultText;
}