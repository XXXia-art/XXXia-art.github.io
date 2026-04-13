const escapeHtml = (value) => value
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;");

function lineCursorEnd(range) {
  return range.end;
}

export async function initPoemPanel({ root, stanzas }) {
  if (!root || !Array.isArray(stanzas) || !stanzas.length) {
    return;
  }

  const flow = root.querySelector("[data-poem-flow]");
  if (!flow) {
    return;
  }

  const fallbackRender = () => {
    flow.innerHTML = stanzas.map((stanza) => `
      <div class="poem-stanza">
        ${stanza.map((line) => `<p class="poem-line">${escapeHtml(line)}</p>`).join("")}
      </div>
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
      lineHeight: 20,
      preparedStanzas: []
    };

    const slantedObstacle = (y) => {
      if (y > 110) {
        return 0;
      }

      const base = 108 - y * 0.72;
      return Math.max(0, Math.min(base, flow.clientWidth * 0.58));
    };

    const prepareAll = () => {
      const style = getComputedStyle(flow);
      const lineHeight = Number.parseFloat(style.lineHeight);
      state.lineHeight = Number.isFinite(lineHeight) ? lineHeight : 20;
      state.preparedStanzas = stanzas.map((stanza) => (
        stanza.map((line) => prepareWithSegments(line, style.font))
      ));
    };

    const queueRender = () => {
      if (state.renderFrame) {
        return;
      }

      state.renderFrame = requestAnimationFrame(render);
    };

    const render = () => {
      state.renderFrame = 0;

      if (!state.preparedStanzas.length) {
        return;
      }

      const width = flow.clientWidth;
      if (!width) {
        return;
      }

      const fragments = [];
      let y = 0;

      state.preparedStanzas.forEach((stanza, stanzaIndex) => {
        stanza.forEach((preparedLine) => {
          let cursor = { segmentIndex: 0, graphemeIndex: 0 };
          let guard = 0;

          while (guard < 100) {
            guard += 1;
            const leftInset = slantedObstacle(y);
            const availableWidth = width - leftInset;
            if (availableWidth <= 24) {
              y += state.lineHeight;
              continue;
            }

            const range = layoutNextLineRange(preparedLine, cursor, availableWidth);
            if (!range) {
              break;
            }

            const materialized = materializeLineRange(preparedLine, range);
            fragments.push({
              text: materialized.text,
              x: leftInset,
              y,
              width: availableWidth
            });

            cursor = lineCursorEnd(range);
            y += state.lineHeight;
          }
        });

        if (stanzaIndex < state.preparedStanzas.length - 1) {
          y += state.lineHeight * 0.9;
        }
      });

      flow.style.height = `${Math.max(y + 10, 420)}px`;
      flow.innerHTML = fragments.map((fragment) => (
        `<span class="poem-fragment" style="max-width:${fragment.width}px;transform:translate(${fragment.x}px,${fragment.y}px)">${escapeHtml(fragment.text)}</span>`
      )).join("");
    };

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
