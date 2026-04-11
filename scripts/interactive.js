const escapeHtml = (value) => value
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;");

export async function initInteractive({
  stage,
  flow,
  iconWrap,
  icon,
  rotationControl,
  rotationValue,
  copy
}) {
  if (!stage || !flow || !iconWrap || !icon || !rotationControl || !rotationValue || !copy) {
    return;
  }

  const state = {
    rotationDeg: Number.parseFloat(rotationControl.value) || 0,
    obstaclePadding: 14,
    lineHeight: 29,
    rowBounds: [],
    prepared: null,
    renderFrame: 0
  };

  const fallbackRender = () => {
    flow.innerHTML = `<p class="fallback-copy">${escapeHtml(copy)}</p>`;
    flow.style.minHeight = "0px";
    iconWrap.style.display = "none";
  };

  try {
    const pretext = await import("https://esm.sh/@chenglou/pretext@latest");
    const {
      prepareWithSegments,
      layoutNextLineRange,
      materializeLineRange
    } = pretext;

    const updatePrepared = () => {
      const style = getComputedStyle(flow);
      const lineHeight = Number.parseFloat(style.lineHeight);
      state.lineHeight = Number.isFinite(lineHeight) ? lineHeight : 32;
      state.prepared = prepareWithSegments(copy, style.font);
    };

    const iconMetrics = () => {
      const stageRect = stage.getBoundingClientRect();
      const wrapRect = iconWrap.getBoundingClientRect();
      return {
        left: wrapRect.left - stageRect.left,
        top: wrapRect.top - stageRect.top,
        size: wrapRect.width
      };
    };

    const buildRowBounds = () => {
      const orbit = 0.23;
      const radius = 0.19;
      const metrics = iconMetrics();
      const size = metrics.size;
      const center = size / 2;
      const angleOffset = state.rotationDeg * Math.PI / 180;
      const circles = Array.from({ length: 6 }, (_, index) => {
        const angle = angleOffset + index * Math.PI / 3;
        return {
          x: center + Math.cos(angle) * orbit * size,
          y: center + Math.sin(angle) * orbit * size,
          r: radius * size
        };
      });

      state.rowBounds = Array.from({ length: Math.ceil(size) }, (_, row) => {
        const y = row + 0.5;
        let left = Number.POSITIVE_INFINITY;
        let right = Number.NEGATIVE_INFINITY;

        circles.forEach((circle) => {
          const dy = y - circle.y;
          if (Math.abs(dy) > circle.r) {
            return;
          }

          const dx = Math.sqrt(circle.r * circle.r - dy * dy);
          left = Math.min(left, circle.x - dx);
          right = Math.max(right, circle.x + dx);
        });

        if (!Number.isFinite(left) || !Number.isFinite(right)) {
          return null;
        }

        return {
          left: metrics.left + left,
          right: metrics.left + right,
          top: metrics.top + row
        };
      });
    };

    const obstacleForLine = (lineTop, lineBottom) => {
      const metrics = iconMetrics();
      const startRow = Math.max(0, Math.floor(lineTop - metrics.top));
      const endRow = Math.min(state.rowBounds.length - 1, Math.ceil(lineBottom - metrics.top));
      let left = Number.POSITIVE_INFINITY;
      let right = Number.NEGATIVE_INFINITY;
      let found = false;

      for (let row = startRow; row <= endRow; row += 1) {
        const bounds = state.rowBounds[row];
        if (!bounds) {
          continue;
        }

        found = true;
        left = Math.min(left, bounds.left);
        right = Math.max(right, bounds.right);
      }

      if (!found) {
        return null;
      }

      return {
        left: Math.max(0, left - state.obstaclePadding),
        right: right + state.obstaclePadding
      };
    };

    const consumeSegment = (cursor, width) => {
      if (width <= 0) {
        return null;
      }

      const range = layoutNextLineRange(state.prepared, cursor, width);
      if (!range) {
        return null;
      }

      const line = materializeLineRange(state.prepared, range);
      return { cursor: range.end, line };
    };

    const render = () => {
      state.renderFrame = 0;

      if (!state.prepared) {
        return;
      }

      const width = flow.clientWidth;
      if (!width) {
        return;
      }

      const segments = [];
      let cursor = { segmentIndex: 0, graphemeIndex: 0 };
      let y = 0;
      let guard = 0;

      while (guard < 4000) {
        guard += 1;
        const lineTop = y;
        const lineBottom = y + state.lineHeight;
        const obstacle = obstacleForLine(lineTop, lineBottom);

        if (!obstacle) {
          const piece = consumeSegment(cursor, width);
          if (!piece) {
            break;
          }

          segments.push({
            text: piece.line.text,
            x: 0,
            y,
            width
          });

          cursor = piece.cursor;
          y += state.lineHeight;
          continue;
        }

        const leftWidth = Math.max(0, obstacle.left);
        const rightX = Math.min(width, obstacle.right);
        const rightWidth = Math.max(0, width - rightX);
        let moved = false;

        if (leftWidth > 44) {
          const leftPiece = consumeSegment(cursor, leftWidth);
          if (leftPiece && leftPiece.line.text) {
            segments.push({
              text: leftPiece.line.text,
              x: 0,
              y,
              width: leftWidth
            });
            cursor = leftPiece.cursor;
            moved = true;
          }
        }

        if (rightWidth > 44) {
          const rightPiece = consumeSegment(cursor, rightWidth);
          if (rightPiece && rightPiece.line.text) {
            segments.push({
              text: rightPiece.line.text,
              x: rightX,
              y,
              width: rightWidth
            });
            cursor = rightPiece.cursor;
            moved = true;
          }
        }

        y += state.lineHeight;

        if (!moved && !leftWidth && !rightWidth) {
          continue;
        }
      }

      flow.style.height = `${Math.max(y + 8, 260)}px`;
      flow.innerHTML = segments.map((segment) => (
        `<span class="flow-fragment" style="max-width:${segment.width}px;transform:translate(${segment.x}px,${segment.y}px)">${escapeHtml(segment.text)}</span>`
      )).join("");
    };

    const queueRender = () => {
      if (state.renderFrame) {
        return;
      }

      state.renderFrame = requestAnimationFrame(render);
    };

    const syncRotation = () => {
      rotationValue.textContent = `${state.rotationDeg}deg`;
      icon.style.transform = `rotate(${state.rotationDeg}deg)`;
      buildRowBounds();
      queueRender();
    };

    rotationControl.addEventListener("input", () => {
      state.rotationDeg = Number.parseFloat(rotationControl.value) || 0;
      syncRotation();
    });

    const resizeObserver = new ResizeObserver(() => {
      updatePrepared();
      buildRowBounds();
      queueRender();
    });

    resizeObserver.observe(stage);

    await document.fonts.ready;
    updatePrepared();
    syncRotation();
  } catch {
    fallbackRender();
  }
}
