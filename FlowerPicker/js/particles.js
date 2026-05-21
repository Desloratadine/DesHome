(function() {
    const { STATE, DOM } = window.GS;

    function spawnParticles(x, y, color, count) {
        for (let i = 0; i < count; i++) {
            STATE.particles.push({
                x, y,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6 - 3,
                life: 1,
                decay: 0.02 + Math.random() * 0.04,
                color,
                size: 2 + Math.random() * 4,
            });
        }
    }

    function updateParticles() {
        for (let i = STATE.particles.length - 1; i >= 0; i--) {
            const p = STATE.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.1;
            p.life -= p.decay;
            if (p.life <= 0) STATE.particles.splice(i, 1);
        }
    }

    function drawParticles(ctx) {
        for (const p of STATE.particles) {
            ctx.save();
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    window.Particles = {
        spawn: spawnParticles,
        update: updateParticles,
        draw: drawParticles
    };
})();