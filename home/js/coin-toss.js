/**
 * Coin Toss Module - Flip a coin to decide
 */

const coinSides = [
    { text: "正面", emoji: "🤯" },
    { text: "反面", emoji: "🤩" }
];

document.addEventListener('DOMContentLoaded', function () {
    const coin = document.getElementById('coin');
    const tossBtn = document.getElementById('tossBtn');
    const coinResult = document.getElementById('coinResult');
    const resultText = document.getElementById('resultText');

    if (!tossBtn || !coin) return;

    tossBtn.addEventListener('click', function () {
        // Disable button during animation
        tossBtn.disabled = true;
        tossBtn.textContent = "抛ing...";

        // Spin animation
        coin.style.transform = "rotateY(1800deg)";

        setTimeout(() => {
            const randomSide = Math.floor(Math.random() * 2);
            const selectedSide = coinSides[randomSide];

            coin.textContent = selectedSide.emoji;
            resultText.textContent = selectedSide.text + " (" + selectedSide.emoji + ")";
            coinResult.style.display = "block";

            tossBtn.disabled = false;
            tossBtn.textContent = "再抛一次";
        }, 500);
    });
});