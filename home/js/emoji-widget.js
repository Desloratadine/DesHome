/**
 * Emoji Widget - Click to cycle through cute emoji faces
 */

const emojiList = [
    '=⩌⩊⩌=', '(´▽`ʃ♡ƪ)', '(♡∀♡)', 'ᶻz ₍^_   ̫ _^₎', 
    'ㅎㅇㅎ', '(｡･ω･｡)', '(^▽^)', 'ㅇㅂㅇ',
    '(≧∇≦)', '(o゜▽゜)', '(☆▽☆)'
];

let currentEmojiIndex = 0;
const emojiWidget = document.getElementById('emojiWidget');

function changeEmoji() {
    currentEmojiIndex = (currentEmojiIndex + 1) % emojiList.length;
    emojiWidget.textContent = emojiList[currentEmojiIndex];

    // Click animation sequence
    emojiWidget.style.transform = 'scale(0.8) rotate(-5deg)';
    setTimeout(() => {
        emojiWidget.style.transform = 'scale(1.15) rotate(5deg)';
        setTimeout(() => {
            emojiWidget.style.transform = '';
        }, 200);
    }, 100);
}