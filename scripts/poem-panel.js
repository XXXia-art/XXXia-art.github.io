const escapeHtml = (value) => value
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;");

function lineCursorEnd(range) {
  return range.end;
}

export async function initPoemPanel({ root, lines }) {
  if (!root || !Array.isArray(lines) || !lines.length) {
    return;
  }

  const viewport = root.querySelector("[data-poem-viewport]");
  const flow = root.querySelector("[data-poem-flow]");
  if (!viewport || !flow) {
    return;
  }

  const fallbackRender = () => {
    flow.innerHTML = lines.map((line, index) => `
      <p class="poem-line ${index === 0 ? "is-active" : ""}">${escapeHtml(line)}</p>
    `).join("");
  };

  try {
    const pretext = await import("https://esm.sh/@chenglou/pretext@latest");
    const {
      prepareWithSegments,
      layoutNextLineRange,
      materializeLineRange
    } = pretext;

    const state = {
      renderFrame: 0,
      visualIndex: 0,
      targetIndex: 0,
      preparedLines: [],
      lineHeight: 30,
      animationFrame: 0,
      wheelVelocity: 0,
      settleTimer: 0
    };

    const prepareAll = () => {
      const style = getComputedStyle(flow);
      const lineHeight = Number.parseFloat(style.lineHeight);
      state.lineHeight = Number.isFinite(lineHeight) ? lineHeight + 4 : 24;
      state.preparedLines = lines.map((line) => prepareWithSegments(line, style.font));
    };

    const queueRender = () => {
      if (state.renderFrame) {
        return;
      }

      state.renderFrame = requestAnimationFrame(render);
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

    const ensureAnimation = () => {
      if (state.animationFrame) {
        return;
      }

      state.animationFrame = requestAnimationFrame(animate);
    };

    const render = () => {
      state.renderFrame = 0;

      if (!state.preparedLines.length) {
        return;
      }

      const width = flow.clientWidth;
      if (!width) {
        return;
      }

      const lineLayouts = state.preparedLines.map((preparedLine, index) => {
        const fragments = [];
        let cursor = { segmentIndex: 0, graphemeIndex: 0 };
        let localY = 0;
        let guard = 0;

        while (guard < 100) {
          guard += 1;
          const availableWidth = width;
          const range = layoutNextLineRange(preparedLine, cursor, availableWidth);
          if (!range) {
            break;
          }

          const materialized = materializeLineRange(preparedLine, range);
          fragments.push({
            text: materialized.text,
            y: localY,
            width: availableWidth
          });

          cursor = lineCursorEnd(range);
          localY += state.lineHeight;
        }

        const height = Math.max(localY, state.lineHeight);
        return {
          index,
          fragments,
          height
        };
      });

      const gap = state.lineHeight * 1.12;
      const activeAnchor = Math.max(96, viewport.clientHeight * 0.24);
      const pivotIndex = Math.max(0, Math.min(lines.length - 1, Math.round(state.visualIndex)));
      const topPositions = [];
      topPositions[pivotIndex] = activeAnchor - lineLayouts[pivotIndex].height / 2;

      for (let index = pivotIndex - 1; index >= 0; index -= 1) {
        topPositions[index] = topPositions[index + 1] - lineLayouts[index].height - gap;
      }

      for (let index = pivotIndex + 1; index < lineLayouts.length; index += 1) {
        topPositions[index] = topPositions[index - 1] + lineLayouts[index - 1].height + gap;
      }

      const visualOffset = (state.visualIndex - pivotIndex) * (state.lineHeight + gap);
      const html = lineLayouts.map((layout) => {
        const relative = layout.index - state.visualIndex;
        const distance = Math.abs(relative);
        const isFocused = distance < 0.22;
        const opacity = isFocused ? 1 : Math.max(0.08, 0.62 - distance * 0.18);
        const blur = isFocused ? 0 : Math.min(9, distance * 2.2);
        const scale = isFocused ? 1 : Math.max(0.9, 1 - distance * 0.03);
        const weight = isFocused ? 760 : distance < 1 ? 560 : 420;
        return `
          <div
            class="poem-block${isFocused ? " is-active" : ""}"
            style="height:${layout.height}px;transform:translateY(${topPositions[layout.index] - visualOffset}px) scale(${scale});opacity:${opacity};filter:blur(${blur}px);font-weight:${weight}"
          >
            ${layout.fragments.map((fragment) => (
              `<span class="poem-fragment" style="max-width:${fragment.width}px;transform:translate(0px,${fragment.y}px)">${escapeHtml(fragment.text)}</span>`
            )).join("")}
          </div>
        `;
      }).join("");

      flow.innerHTML = html;
    };

    const moveBy = (delta) => {
      const nextIndex = Math.min(lines.length - 1, Math.max(0, state.targetIndex + delta));
      if (nextIndex === state.targetIndex) {
        return;
      }

      state.targetIndex = nextIndex;
      ensureAnimation();
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
        const snapped = Math.round(state.targetIndex);
        if (snapped !== state.targetIndex) {
          state.targetIndex = snapped;
          ensureAnimation();
        }
        state.wheelVelocity = 0;
      }, 160);
    }, { passive: false });

    const resizeObserver = new ResizeObserver(() => {
      prepareAll();
      queueRender();
    });

    resizeObserver.observe(flow);
    await document.fonts.ready;
    prepareAll();
    state.visualIndex = 0;
    state.targetIndex = 0;
    state.wheelVelocity = 0;
    queueRender();
  } catch {
    fallbackRender();
  }
}
