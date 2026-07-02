// Particle Background Animation
// Responsive interactive constellation of nodes

(function () {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let particles = [];
  const maxParticles = window.innerWidth < 768 ? 40 : 100;
  const connectionDistance = 120;
  const mouse = {
    x: null,
    y: null,
    radius: 150
  };

  // Track mouse coordinates
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  // Track resize
  window.addEventListener('resize', () => {
    resizeCanvas();
    initParticles();
  });

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  // Get dynamic colors based on CSS variables
  function getColorConfig() {
    const styles = getComputedStyle(document.documentElement);
    const hue = styles.getPropertyValue('--hue-color').trim() || '190';
    const isDark = document.body.classList.contains('dark-theme');
    
    if (isDark) {
      return {
        particle: `hsla(${hue}, 69%, 61%, 0.8)`,
        lineColor: `hsla(${hue}, 69%, 61%, `,
        glow: `hsla(${hue}, 69%, 61%, 0.5)`
      };
    } else {
      return {
        particle: `hsla(${hue}, 60%, 45%, 0.65)`,
        lineColor: `hsla(${hue}, 60%, 45%, `,
        glow: 'transparent'
      };
    }
  }

  class Particle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * 0.5;
      this.vy = (Math.random() - 0.5) * 0.5;
      this.radius = Math.random() * 2 + 1; // 1px to 3px
    }

    update() {
      // Move particle
      this.x += this.vx;
      this.y += this.vy;

      // Bounce off walls
      if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
      if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

      // Mouse interactive push effect
      if (mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.hypot(dx, dy);
        
        if (distance < mouse.radius) {
          const force = (mouse.radius - distance) / mouse.radius;
          const angle = Math.atan2(dy, dx);
          // Push particles away gently
          this.x -= Math.cos(angle) * force * 1.2;
          this.y -= Math.sin(angle) * force * 1.2;
        }
      }
    }

    draw(config) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = config.particle;
      
      if (config.glow !== 'transparent') {
        ctx.shadowBlur = 6;
        ctx.shadowColor = config.glow;
      } else {
        ctx.shadowBlur = 0;
      }
      
      ctx.fill();
    }
  }

  function initParticles() {
    particles = [];
    const count = Math.min(maxParticles, (canvas.width * canvas.height) / 15000);
    for (let i = 0; i < count; i++) {
      particles.push(new Particle());
    }
  }

  function drawConnections(config) {
    ctx.shadowBlur = 0; // Turn off shadows for lines to boost performance
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const p1 = particles[i];
        const p2 = particles[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const distance = Math.hypot(dx, dy);

        if (distance < connectionDistance) {
          const opacity = (connectionDistance - distance) / connectionDistance * 0.15;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = config.lineColor + opacity + ')';
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const config = getColorConfig();

    // Draw and update particles
    particles.forEach(p => {
      p.update();
      p.draw(config);
    });

    // Connect particles
    drawConnections(config);

    requestAnimationFrame(animate);
  }

  // Startup
  resizeCanvas();
  initParticles();
  animate();
})();
