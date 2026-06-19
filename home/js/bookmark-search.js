/**
 * Bookmark Search - Filter bookmark cards by keyword across categories
 */

function filterBookmarks() {
    const searchInput = document.getElementById('bookmarksSearch');
    if (!searchInput) return;

    const searchTerm = searchInput.value.toLowerCase().trim();
    const cards = document.querySelectorAll('.category-grid .card');

    // Track visibility per category
    const categoryVisibility = {};

    cards.forEach(card => {
        const titleEl = card.querySelector('.card-title');
        const descEl = card.querySelector('.card-description');
        const linkEl = card.querySelector('.link-external');

        const title = titleEl ? titleEl.textContent.toLowerCase() : '';
        const description = descEl ? descEl.textContent.toLowerCase() : '';
        const link = linkEl ? linkEl.textContent.toLowerCase() : '';

        const isMatch = searchTerm === '' ||
                       title.includes(searchTerm) ||
                       description.includes(searchTerm) ||
                       link.includes(searchTerm);

        card.classList.toggle('hidden', !isMatch);

        // Track visibility for this card's category
        const category = card.closest('.bookmark-category');
        if (category) {
            const categoryId = category.dataset.category;
            if (isMatch || searchTerm === '') {
                categoryVisibility[categoryId] = true;
            }
            // Don't set false here - another card in the same category might match
        }
    });

    // Show/hide entire categories and decorative card
    document.querySelectorAll('.bookmark-category').forEach(cat => {
        const catId = cat.dataset.category;
        // Show category if it has any visible card, or if search is empty
        cat.style.display = (searchTerm === '' || categoryVisibility[catId]) ? '' : 'none';
    });

    // Always show decorative card
    const decoCard = document.querySelector('.decorative-card');
    if (decoCard) {
        decoCard.style.display = '';
    }
}

// Support Enter key to clear search
document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.getElementById('bookmarksSearch');
    if (searchInput) {
        searchInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                this.value = '';
                filterBookmarks();
            }
        });
    }
});