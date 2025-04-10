const canvas = document.getElementById('lattice-canvas');
const ctx = canvas.getContext('2d');

let width, height;
function resizeCanvas() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Grid setup
const spacing = 15;
const glowRadius = 160;

// Mouse tracking
let mouse = { x: -1000, y: -1000 };
document.addEventListener('mousemove', (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});
document.addEventListener('touchmove', (e) => {
  const touch = e.touches[0];
  mouse.x = touch.clientX;
  mouse.y = touch.clientY;
});

// Click pulse
let clickPulses = [];
function triggerPulse(x, y) {
  clickPulses.push({ x, y, time: performance.now() });
}
document.addEventListener('click', (e) => triggerPulse(e.clientX, e.clientY));
document.addEventListener('touchstart', (e) => {
  const touch = e.touches[0];
  triggerPulse(touch.clientX, touch.clientY);
});

function drawLattice(timestamp) {
  ctx.clearRect(0, 0, width, height);
  ctx.lineWidth = 1;

  // --- Background grid ---
  ctx.strokeStyle = 'rgba(30, 71, 71, 0.2)';
  for (let x = 0; x < width; x += spacing) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += spacing) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // --- Cursor glow aura ---
  for (let x = 0; x < width; x += spacing) {
    for (let y = 0; y < height; y += spacing) {
      const dx = x - mouse.x;
      const dy = y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < glowRadius) {
        const fade = 1 - dist / glowRadius;
        const alpha = fade * 0.35;

        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 255, 255, ${alpha})`;
        ctx.fill();
      }

      // Random sparks near cursor
      if (Math.random() < 0.002 && dist < glowRadius / 2) {
        const nx = x + (Math.random() > 0.5 ? spacing : -spacing);
        const ny = y + (Math.random() > 0.5 ? spacing : -spacing);
        if (nx >= 0 && nx <= width && ny >= 0 && ny <= height) {
          ctx.strokeStyle = 'rgba(0, 0, 0, 0)';
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(nx, ny);
          ctx.stroke();
        }
      }
    }
  }

  // --- Click/tap ripple effect ---
  const now = performance.now();
  clickPulses = clickPulses.filter(p => now - p.time < 1000);
  for (const pulse of clickPulses) {
    const elapsed = now - pulse.time;
    const pulseRadius = (elapsed / 1000) * 200;

    for (let x = 0; x < width; x += spacing) {
      for (let y = 0; y < height; y += spacing) {
        const dx = x - pulse.x;
        const dy = y - pulse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const fade = 1 - Math.abs(dist - pulseRadius) / 20;
        if (fade > 0) {
          ctx.beginPath();
          ctx.arc(x, y, 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(0, 255, 180, ${fade * 0.15})`;
          ctx.fill();
        }
      }
    }
  }

  requestAnimationFrame(drawLattice);
}

requestAnimationFrame(drawLattice);
