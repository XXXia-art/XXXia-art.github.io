export function initPoemPanel({ root, lines }) {
  if (!root || !Array.isArray(lines) || !lines.length) {
    return;
  }

  const viewport = root.querySelector("[data-poem-viewport]");
  const flow = root.querySelector("[data-poem-flow]");
  if (!viewport || !flow) {
    return;
  }

  // Let the browser wrap and measure each line. The poem no longer depends on
  // a remote layout module that can replace visible text with empty fragments.
  const blocks = lines.map((line) => {
    const block = document.createElement("div");
    block.className = "poem-block";
    block.textContent = line;
    flow.appendChild(block);
    return block;
  });

  const state = {
    renderFrame: 0,
    animationFrame: 0,
    visualIndex: 0,
    targetIndex: 0,
    wheelVelocity: 0,
    settleTimer: 0
  };

  const render = () => {
    state.renderFrame = 0;
    if (!flow.clientWidth) {
      return;
    }

    const style = getComputedStyle(flow);
    const computedLineHeight = Number.parseFloat(style.lineHeight);
    const lineHeight = Number.isFinite(computedLineHeight) ? computedLineHeight + 4 : 24;
    const gap = lineHeight * 1.12;
    const activeAnchor = Math.max(96, viewport.clientHeight * 0.24);

    blocks.forEach((block, index) => {
      const distance = Math.abs(index - state.visualIndex);
      const isFocused = distance < 0.22;
      block.classList.toggle("is-active", isFocused);
      block.style.opacity = isFocused ? 1 : Math.max(0.08, 0.62 - distance * 0.18);
      block.style.filter = `blur(${isFocused ? 0 : Math.min(9, distance * 2.2)}px)`;
      block.style.fontWeight = isFocused ? 760 : distance < 1 ? 560 : 420;
    });

    const heights = blocks.map((block) => block.offsetHeight);
    const centers = [heights[0] / 2];
    for (let index = 1; index < blocks.length; index += 1) {
      centers[index] = centers[index - 1]
        + heights[index - 1] / 2 + gap + heights[index] / 2;
    }

    const lowerIndex = Math.floor(state.visualIndex);
    const upperIndex = Math.min(blocks.length - 1, lowerIndex + 1);
    const progress = state.visualIndex - lowerIndex;
    const focusedCenter = centers[lowerIndex]
      + (centers[upperIndex] - centers[lowerIndex]) * progress;

    blocks.forEach((block, index) => {
      const top = activeAnchor + centers[index] - focusedCenter - heights[index] / 2;
      const scale = Math.max(0.9, 1 - Math.abs(index - state.visualIndex) * 0.03);
      block.style.transform = `translateY(${top}px) scale(${scale})`;
    });
  };

  const queueRender = () => {
    if (!state.renderFrame) {
      state.renderFrame = requestAnimationFrame(render);
    }
  };

  const animate = () => {
    state.animationFrame = 0;
    const delta = state.targetIndex - state.visualIndex;
    if (Math.abs(delta) < 0.001) {
      state.visualIndex = state.targetIndex;
      queueRender();
      return;
    }

    state.visualIndex += delta * 0.14;
    queueRender();
    state.animationFrame = requestAnimationFrame(animate);
  };

  const moveBy = (delta) => {
    const nextIndex = Math.min(blocks.length - 1, Math.max(0, state.targetIndex + delta));
    if (nextIndex === state.targetIndex) {
      return;
    }
    state.targetIndex = nextIndex;
    if (!state.animationFrame) {
      state.animationFrame = requestAnimationFrame(animate);
    }
  };

  viewport.addEventListener("wheel", (event) => {
    event.preventDefault();
    const direction = event.deltaY > 0 ? 1 : -1;
    const intensity = Math.min(1.35, Math.max(0.45, Math.abs(event.deltaY) / 95));
    state.wheelVelocity += direction * intensity;
    const delta = Math.trunc(state.wheelVelocity);
    if (delta !== 0) {
      state.wheelVelocity -= delta;
      moveBy(delta);
    }

    window.clearTimeout(state.settleTimer);
    state.settleTimer = window.setTimeout(() => {
      state.wheelVelocity = 0;
    }, 160);
  }, { passive: false });

  const resizeObserver = new ResizeObserver(queueRender);
  resizeObserver.observe(flow);
  window.addEventListener("resize", queueRender, { passive: true });
  document.fonts.ready.then(queueRender);
  queueRender();
}
