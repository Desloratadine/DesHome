/**
 * Clock Module - Local time display and greeting message
 */

function updateLocalTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const timeEl = document.getElementById('local-time');
    if (timeEl) {
        timeEl.textContent = `${hours}:${minutes}:${seconds}`;
    }
}

function updateGreeting() {
    const now = new Date();
    const hour = now.getHours();
    const greetingEl = document.getElementById('greeting');
    if (!greetingEl) return;

    if (hour >= 0 && hour < 12) {
        greetingEl.textContent = '早上好~';
    } else if (hour >= 12 && hour < 14) {
        greetingEl.textContent = '中午好~';
    } else if (hour >= 14 && hour < 18) {
        greetingEl.textContent = '下午好~';
    } else {
        greetingEl.textContent = '晚上好~';
    }
}

// Initialize
updateLocalTime();
setInterval(updateLocalTime, 1000);
updateGreeting();
setInterval(updateGreeting, 60000);