/**
 * Tab Slider - Slide/swipe tab switching for the main content
 * Supports click navigation and touch swipe on mobile
 */

document.addEventListener('DOMContentLoaded', function () {
    const track = document.getElementById('tabSliderTrack');
    const tabs = document.querySelectorAll('.tab-btn');
    const panels = document.querySelectorAll('.tab-panel');
    const slider = document.querySelector('.tab-slider');

    if (!track || tabs.length === 0) return;

    let currentIndex = 0;
    let isAnimating = false;

    // --- Switch tab ---
    function switchTab(index) {
        if (isAnimating || index === currentIndex || index < 0 || index >= tabs.length) return;

        isAnimating = true;

        // Update buttons
        tabs.forEach((btn, i) => {
            btn.classList.toggle('active', i === index);
        });

        // Update panels
        panels.forEach((panel, i) => {
            panel.classList.toggle('active', i === index);
        });

        // Slide the track
        track.style.transform = 'translateX(-' + (index * 100) + '%)';

        currentIndex = index;

        setTimeout(() => {
            isAnimating = false;
        }, 350); // match CSS transition duration
    }

    // --- Click handlers ---
    tabs.forEach((btn, index) => {
        btn.addEventListener('click', function () {
            switchTab(index);
        });
    });

    // --- Touch / Swipe support ---
    let touchStartX = 0;
    let touchEndX = 0;
    let isSwiping = false;

    slider.addEventListener('touchstart', function (e) {
        touchStartX = e.changedTouches[0].screenX;
        isSwiping = true;
    }, { passive: true });

    slider.addEventListener('touchmove', function (e) {
        if (!isSwiping) return;
        touchEndX = e.changedTouches[0].screenX;
    }, { passive: true });

    slider.addEventListener('touchend', function () {
        if (!isSwiping) return;
        isSwiping = false;

        const swipeThreshold = 50; // minimum px to trigger swipe
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0 && currentIndex < tabs.length - 1) {
                // Swipe left → next tab
                switchTab(currentIndex + 1);
            } else if (diff < 0 && currentIndex > 0) {
                // Swipe right → previous tab
                switchTab(currentIndex - 1);
            }
        }
    }, { passive: true });

    // --- Keyboard navigation (optional) ---
    tabs.forEach((btn) => {
        btn.addEventListener('keydown', function (e) {
            const current = Array.from(tabs).indexOf(this);
            if (e.key === 'ArrowRight' && current < tabs.length - 1) {
                switchTab(current + 1);
            } else if (e.key === 'ArrowLeft' && current > 0) {
                switchTab(current - 1);
            }
        });
    });
});