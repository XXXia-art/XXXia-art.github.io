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
      activeIndex: 0,
      preparedLines: [],
      lineHeight: 22
    };

    const prepareAll = () => {
      const style = getComputedStyle(flow);
      const lineHeight = Number.parseFloat(style.lineHeight);
      state.lineHeight = Number.isFinite(lineHeight) ? lineHeight : 20;
      state.preparedLines = lines.map((line) => prepareWithSegments(line, style.font));
    };

    const queueRender = () => {
      if (state.renderFrame) {
        return;
      }

      state.renderFrame = requestAnimationFrame(render);
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

      const gap = state.lineHeight * 0.95;
      const centerY = viewport.clientHeight * 0.42;
      const topPositions = [];
      topPositions[state.activeIndex] = centerY - lineLayouts[state.activeIndex].height / 2;

      for (let index = state.activeIndex - 1; index >= 0; index -= 1) {
        topPositions[index] = topPositions[index + 1] - lineLayouts[index].height - gap;
      }

      for (let index = state.activeIndex + 1; index < lineLayouts.length; index += 1) {
        topPositions[index] = topPositions[index - 1] + lineLayouts[index - 1].height + gap;
      }

      const html = lineLayouts.map((layout) => {
        const distance = Math.abs(layout.index - state.activeIndex);
        const opacity = layout.index === state.activeIndex ? 1 : Math.max(0.12, 0.46 - distance * 0.08);
        const scale = layout.index === state.activeIndex ? 1 : Math.max(0.9, 0.97 - distance * 0.02);
        return `
          <div
            class="poem-block${layout.index === state.activeIndex ? " is-active" : ""}"
            style="height:${layout.height}px;transform:translateY(${topPositions[layout.index]}px) scale(${scale});opacity:${opacity}"
          >
            ${layout.fragments.map((fragment) => (
              `<span class="poem-fragment" style="max-width:${fragment.width}px;transform:translate(0px,${fragment.y}px)">${escapeHtml(fragment.text)}</span>`
            )).join("")}
          </div>
        `;
      }).join("");

      flow.innerHTML = html;
    };

    const advance = (direction) => {
      const nextIndex = Math.min(lines.length - 1, Math.max(0, state.activeIndex + direction));
      if (nextIndex === state.activeIndex) {
        return;
      }

      state.activeIndex = nextIndex;
      queueRender();
    };

    let wheelLock = false;
    viewport.addEventListener("wheel", (event) => {
      event.preventDefault();
      if (wheelLock) {
        return;
      }

      wheelLock = true;
      advance(event.deltaY > 0 ? 1 : -1);
      window.setTimeout(() => {
        wheelLock = false;
      }, 85);
    }, { passive: false });

    const resizeObserver = new ResizeObserver(() => {
      prepareAll();
      queueRender();
    });

    resizeObserver.observe(flow);
    await document.fonts.ready;
    prepareAll();
    queueRender();
  } catch {
    fallbackRender();
  }
}
