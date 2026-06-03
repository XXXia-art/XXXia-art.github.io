export function initPhysicsIcons(container) {
  if (!container) return;

  let width = container.clientWidth || 280;
  let height = container.clientHeight || 380;
  let lastHeight = height;

  const icons = [
    { name: "Huawei", src: "assets/huawei.svg", bg: "#ffffff" },
    { name: "TikTok", src: "assets/tiktok-icon.svg", bg: "#ffffff" },
    { name: "Claude", src: "assets/claude-logo.svg", bg: "#FDF6F0" },
    { name: "Codex", src: "assets/openai-icon.svg", bg: "#ffffff" },
    { name: "SEU", src: "assets/seu-logo.svg", bg: "#ffffff" }
  ];

  const balls = icons.map((icon, i) => {
    const el = document.createElement("div");
    el.className = "physics-ball";
    el.style.cssText = `
      position: absolute;
      width: 66px;
      height: 66px;
      border-radius: 50%;
      background: ${icon.bg};
      display: flex;
      align-items: center;
      justify-content: center;
      user-select: none;
      will-change: transform;
      box-shadow: 0 4px 12px rgba(0,0,0,0.12);
      overflow: hidden;
      border: 1px solid rgba(0,0,0,0.06);
    `;
    const img = document.createElement("img");
    img.src = icon.src;
    img.alt = icon.name;
    img.style.cssText = "width: 100%; height: 100%; object-fit: cover; pointer-events: none;";
    el.appendChild(img);
    container.appendChild(el);

    const radius = 33;
    return {
      x: width / 2 + (Math.random() - 0.5) * 80,
      y: height - radius - i * (radius * 2 + 8),
      vx: (Math.random() - 0.5) * 0.5,
      vy: 0,
      radius,
      mass: radius,
      el
    };
  });

  const gravity = 0.125;
  const friction = 0.985;
  const bounce = 0.72;

  function resolveCollision(a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const minDist = a.radius + b.radius;

    if (dist < minDist && dist > 0.001) {
      const overlap = minDist - dist;
      const nx = dx / dist;
      const ny = dy / dist;

      a.x -= nx * overlap * 0.5;
      a.y -= ny * overlap * 0.5;
      b.x += nx * overlap * 0.5;
      b.y += ny * overlap * 0.5;

      const dvx = b.vx - a.vx;
      const dvy = b.vy - a.vy;
      const dvDotN = dvx * nx + dvy * ny;

      if (dvDotN > 0) return;

      const impulse = (2 * dvDotN / (a.mass + b.mass)) * 0.85;
      a.vx += impulse * b.mass * nx;
      a.vy += impulse * b.mass * ny;
      b.vx -= impulse * a.mass * nx;
      b.vy -= impulse * a.mass * ny;
    }
  }

  function update() {
    // Ground rises and falls with container size
    width = container.clientWidth || 280;
    height = container.clientHeight || 380;

    const groundDelta = height - lastHeight;
    const groundRose = groundDelta < 0;

    for (const ball of balls) {
      // If ground rose up, lift the ball with it
      if (groundRose) {
        ball.y += groundDelta;
      }

      ball.vy += gravity;
      ball.vx *= friction;
      ball.vy *= friction;

      ball.x += ball.vx;
      ball.y += ball.vy;

      if (ball.x - ball.radius < 0) {
        ball.x = ball.radius;
        ball.vx *= -bounce;
      }
      if (ball.x + ball.radius > width) {
        ball.x = width - ball.radius;
        ball.vx *= -bounce;
      }
      if (ball.y + ball.radius > height) {
        ball.y = height - ball.radius;
        ball.vy *= -bounce;
        if (Math.abs(ball.vy) < gravity * 2) ball.vy = 0;
      }
      if (ball.y - ball.radius < 0) {
        ball.y = ball.radius;
        ball.vy *= -bounce;
      }
    }

    lastHeight = height;

    for (let i = 0; i < balls.length; i++) {
      for (let j = i + 1; j < balls.length; j++) {
        resolveCollision(balls[i], balls[j]);
      }
    }

    for (const ball of balls) {
      ball.el.style.transform = `translate(${ball.x - ball.radius}px, ${ball.y - ball.radius}px)`;
    }

    requestAnimationFrame(update);
  }

  let lastScrollY = window.scrollY;
  let ticking = false;

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          const delta = currentScrollY - lastScrollY;
          lastScrollY = currentScrollY;

          const force = delta * 0.045;
          for (const ball of balls) {
            ball.vy -= force;
            ball.vx += (Math.random() - 0.5) * Math.abs(force) * 0.6;
          }
          ticking = false;
        });
        ticking = true;
      }
    },
    { passive: true }
  );

  update();
}
