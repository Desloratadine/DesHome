/**
 * 渲染等待状态
 */
function renderWaitingState() {
    waitingState.style.display = 'block';
    resultsContainer.style.display = 'none';
    resultsContainer.innerHTML = '';
    currentDrawResult = null;
    rightPanel.style.justifyContent = 'center';
    rightPanel.style.alignItems = 'center';
}

/**
 * 渲染抽卡结果
 */
function renderResults(cards, question, drawCount, timestamp) {
    waitingState.style.display = 'none';
    resultsContainer.style.display = 'flex';
    resultsContainer.innerHTML = '';
    rightPanel.style.justifyContent = 'flex-start';
    rightPanel.style.alignItems = 'center';

    // 结果摘要
    const summaryDiv = document.createElement('div');
    summaryDiv.className = 'results-summary';
    const questionDisplay = question.trim() || '(未提问)';
    summaryDiv.textContent = `问题: ${questionDisplay} | 抽取: ${drawCount}张 | ${timestamp}`;
    resultsContainer.appendChild(summaryDiv);

    // 分隔线
    const divider = document.createElement('div');
    divider.className = 'divider-dots';
    divider.textContent = '* * *';
    divider.setAttribute('aria-hidden', 'true');
    resultsContainer.appendChild(divider);

    // 渲染每张卡牌
    cards.forEach((card, index) => {
        const cardItem = document.createElement('div');
        cardItem.className = 'card-item';
        if (card.isReversed) {
            cardItem.classList.add('reversed');
        }

        // 左侧：牌图
        const imgWrap = document.createElement('div');
        imgWrap.className = 'card-image-wrap';

        const img = document.createElement('img');
        img.className = 'card-image';
        img.src = card.image;
        img.alt = card.name + (card.isReversed ? ' (逆位)' : ' (正位)');
        img.loading = 'lazy';
        imgWrap.appendChild(img);

        // 右侧：文本与信息
        const infoWrap = document.createElement('div');
        infoWrap.className = 'card-info-wrap';

        // 头部行：序号 + 位置
        const headerRow = document.createElement('div');
        headerRow.className = 'card-header-row';

        const numberSpan = document.createElement('span');
        numberSpan.className = 'card-number';
        numberSpan.textContent = getCardFullNumberLabel(card);

        const positionSpan = document.createElement('span');
        positionSpan.className = 'card-position';
        if (card.isReversed) {
            positionSpan.classList.add('reversed-pos');
            positionSpan.textContent = '[逆位]';
        } else {
            positionSpan.textContent = '[正位]';
        }

        headerRow.appendChild(numberSpan);
        headerRow.appendChild(positionSpan);
        infoWrap.appendChild(headerRow);

        // 牌名
        const nameDiv = document.createElement('div');
        nameDiv.className = 'card-name';
        nameDiv.textContent = card.name;
        infoWrap.appendChild(nameDiv);

        // 详细信息
        const detailsDiv = document.createElement('div');
        detailsDiv.className = 'card-details';

        const elementItem = document.createElement('span');
        elementItem.className = 'card-detail-item';
        const elementLabel = document.createElement('span');
        elementLabel.className = 'card-detail-label';
        elementLabel.textContent = '元素:';
        const elementValue = document.createElement('span');
        elementValue.className = 'card-detail-value';
        elementValue.textContent = card.element;
        elementItem.appendChild(elementLabel);
        elementItem.appendChild(elementValue);
        detailsDiv.appendChild(elementItem);

        if (card.type === 'minor') {
            const suitItem = document.createElement('span');
            suitItem.className = 'card-detail-item';
            const suitLabel = document.createElement('span');
            suitLabel.className = 'card-detail-label';
            suitLabel.textContent = '系列:';
            const suitBadge = document.createElement('span');
            suitBadge.className = 'card-suit-badge';
            suitBadge.textContent = card.suit;
            suitItem.appendChild(suitLabel);
            suitItem.appendChild(suitBadge);
            detailsDiv.appendChild(suitItem);
        } else {
            const majorItem = document.createElement('span');
            majorItem.className = 'card-detail-item';
            const majorBadge = document.createElement('span');
            majorBadge.className = 'card-suit-badge';
            majorBadge.textContent = '大阿卡纳';
            majorItem.appendChild(majorBadge);
            detailsDiv.appendChild(majorItem);
        }

        if (card.court) {
            const courtItem = document.createElement('span');
            courtItem.className = 'card-detail-item';
            const courtBadge = document.createElement('span');
            courtBadge.className = 'card-suit-badge';
            courtBadge.textContent = '宫廷牌';
            courtItem.appendChild(courtBadge);
            detailsDiv.appendChild(courtItem);
        }

        infoWrap.appendChild(detailsDiv);

        // 笔记区域
        const noteDiv = document.createElement('div');
        noteDiv.className = 'card-note-section';
        
        const noteHeader = document.createElement('div');
        noteHeader.className = 'card-note-header';
        const noteTitle = document.createElement('span');
        noteTitle.className = 'card-note-title';
        noteTitle.textContent = '卡牌笔记';
        
        const editBtn = document.createElement('button');
        editBtn.className = 'btn btn-edit-note';
        editBtn.textContent = '编辑';
        editBtn.dataset.cardId = card.id;
        editBtn.dataset.cardIndex = index;
        
        noteHeader.appendChild(noteTitle);
        noteHeader.appendChild(editBtn);
        noteDiv.appendChild(noteHeader);
        
        const noteContent = document.createElement('div');
        noteContent.className = 'card-note-content';
        noteContent.id = 'note-content-' + card.id;
        
        const noteText = getNote(card.id);
        if (noteText) {
            noteContent.textContent = noteText;
            noteContent.classList.add('has-note');
        } else {
            noteContent.textContent = '暂无笔记，点击「编辑」添加';
            noteContent.classList.add('no-note');
        }
        
        noteDiv.appendChild(noteContent);
        infoWrap.appendChild(noteDiv);

        // 组合左右两侧
        cardItem.appendChild(imgWrap);
        cardItem.appendChild(infoWrap);

        resultsContainer.appendChild(cardItem);

        // 牌之间的装饰分隔（除最后一张）
        if (index < cards.length - 1) {
            const miniDivider = document.createElement('div');
            miniDivider.className = 'divider-dots';
            miniDivider.textContent = '- - -';
            miniDivider.setAttribute('aria-hidden', 'true');
            resultsContainer.appendChild(miniDivider);
        }
    });

    // 底部装饰
    const bottomDivider = document.createElement('div');
    bottomDivider.className = 'divider-dots';
    bottomDivider.textContent = '= = = = =';
    bottomDivider.setAttribute('aria-hidden', 'true');
    resultsContainer.appendChild(bottomDivider);

    rightPanel.scrollTop = 0;
}

/**
 * 渲染卡牌总览
 */
function renderCardOverview(filter = 'all') {
    const cardGrid = document.getElementById('cardGrid');
    cardGrid.innerHTML = '';

    let filteredCards = tarotDeck;
    if (filter === 'major') {
        filteredCards = tarotDeck.filter(c => c.type === 'major');
    } else if (filter !== 'all') {
        filteredCards = tarotDeck.filter(c => c.suit === filter);
    }

    filteredCards.forEach(card => {
        const gridItem = document.createElement('div');
        gridItem.className = 'grid-card-item';
        gridItem.dataset.cardId = card.id;

        const img = document.createElement('img');
        img.src = card.image;
        img.alt = card.name;
        img.loading = 'lazy';
        gridItem.appendChild(img);

        const nameDiv = document.createElement('div');
        nameDiv.className = 'grid-card-name';
        nameDiv.textContent = card.name;
        gridItem.appendChild(nameDiv);

        const badgesDiv = document.createElement('div');
        badgesDiv.className = 'grid-card-badges';

        if (card.type === 'major') {
            const badge = document.createElement('span');
            badge.className = 'grid-card-badge';
            badge.textContent = '大阿卡纳';
            badgesDiv.appendChild(badge);
        } else {
            const suitBadge = document.createElement('span');
            suitBadge.className = 'grid-card-badge';
            suitBadge.textContent = card.suit;
            badgesDiv.appendChild(suitBadge);

            if (card.court) {
                const courtBadge = document.createElement('span');
                courtBadge.className = 'grid-card-badge';
                courtBadge.textContent = '宫廷';
                badgesDiv.appendChild(courtBadge);
            }
        }

        gridItem.appendChild(badgesDiv);

        cardGrid.appendChild(gridItem);
    });

    const cardCount = document.getElementById('cardCount');
    cardCount.textContent = `共 ${filteredCards.length} 张卡牌`;
}

/**
 * 渲染笔记管理列表
 */
function renderNotesList() {
    const notesList = document.getElementById('notesList');
    const notesStats = document.getElementById('notesStats');
    notesList.innerHTML = '';

    const notes = loadNotes();
    const noteIds = Object.keys(notes);

    notesStats.textContent = `已记录 ${noteIds.length} 张卡牌的笔记`;

    if (noteIds.length === 0) {
        const emptyMsg = document.createElement('div');
        emptyMsg.style.textAlign = 'center';
        emptyMsg.style.padding = '40px';
        emptyMsg.style.color = '#666';
        emptyMsg.textContent = '暂无笔记，快去为卡牌添加笔记吧~';
        notesList.appendChild(emptyMsg);
        return;
    }

    noteIds.forEach(cardId => {
        const card = tarotDeck.find(c => c.id === cardId);
        if (!card) return;

        const noteItem = document.createElement('div');
        noteItem.className = 'note-list-item';

        const headerDiv = document.createElement('div');
        headerDiv.className = 'note-list-item-header';

        const titleDiv = document.createElement('div');
        titleDiv.className = 'note-list-item-title';
        titleDiv.textContent = card.name;

        const editBtn = document.createElement('button');
        editBtn.className = 'btn btn-edit-note';
        editBtn.textContent = '编辑';
        editBtn.dataset.cardId = cardId;
        editBtn.style.width = 'auto';
        editBtn.style.padding = '6px 16px';

        headerDiv.appendChild(titleDiv);
        headerDiv.appendChild(editBtn);
        noteItem.appendChild(headerDiv);

        const contentDiv = document.createElement('div');
        contentDiv.className = 'note-list-item-content';
        contentDiv.textContent = notes[cardId];
        noteItem.appendChild(contentDiv);

        notesList.appendChild(noteItem);
    });
}

/**
 * 渲染卡牌详情模态框
 */
function renderCardDetailModal(card) {
    const modalBody = document.getElementById('cardDetailModalBody');
    modalBody.innerHTML = '';

    const contentDiv = document.createElement('div');
    contentDiv.className = 'card-detail-content';

    const img = document.createElement('img');
    img.className = 'card-detail-image';
    img.src = card.image;
    img.alt = card.name;
    contentDiv.appendChild(img);

    const infoDiv = document.createElement('div');
    infoDiv.className = 'card-detail-info';

    const nameDiv = document.createElement('div');
    nameDiv.className = 'card-detail-name';
    nameDiv.textContent = card.name;
    infoDiv.appendChild(nameDiv);

    const tagsDiv = document.createElement('div');
    tagsDiv.className = 'card-detail-tags';

    if (card.type === 'major') {
        const tag = document.createElement('span');
        tag.className = 'card-detail-tag';
        tag.textContent = '大阿卡纳';
        tagsDiv.appendChild(tag);
    } else {
        const suitTag = document.createElement('span');
        suitTag.className = 'card-detail-tag';
        suitTag.textContent = card.suit;
        tagsDiv.appendChild(suitTag);

        if (card.court) {
            const courtTag = document.createElement('span');
            courtTag.className = 'card-detail-tag';
            courtTag.textContent = '宫廷牌';
            tagsDiv.appendChild(courtTag);
        }
    }

    const elementTag = document.createElement('span');
    elementTag.className = 'card-detail-tag';
    elementTag.textContent = card.element;
    tagsDiv.appendChild(elementTag);

    infoDiv.appendChild(tagsDiv);

    const noteSection = document.createElement('div');
    noteSection.className = 'card-detail-note-section';

    const noteHeader = document.createElement('div');
    noteHeader.className = 'card-detail-note-header';

    const noteTitle = document.createElement('span');
    noteTitle.className = 'card-note-title';
    noteTitle.textContent = '卡牌笔记';

    const editBtn = document.createElement('button');
    editBtn.className = 'btn btn-edit-note';
    editBtn.textContent = '编辑';
    editBtn.dataset.cardId = card.id;
    editBtn.style.width = 'auto';

    noteHeader.appendChild(noteTitle);
    noteHeader.appendChild(editBtn);
    noteSection.appendChild(noteHeader);

    const noteContent = document.createElement('div');
    noteContent.className = 'card-detail-note-content';
    noteContent.id = 'card-detail-note-' + card.id;

    const noteText = getNote(card.id);
    if (noteText) {
        noteContent.textContent = noteText;
    } else {
        noteContent.textContent = '暂无笔记，点击「编辑」添加';
        noteContent.classList.add('no-note');
    }

    noteSection.appendChild(noteContent);
    infoDiv.appendChild(noteSection);
    contentDiv.appendChild(infoDiv);
    modalBody.appendChild(contentDiv);

    const modalTitle = document.getElementById('cardDetailModalTitle');
    modalTitle.textContent = '卡牌详情';
}
