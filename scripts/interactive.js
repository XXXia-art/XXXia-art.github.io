const escapeHtml = (value) => value
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;");

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export async function initInteractive({
  stage,
  flow,
  iconWrap,
  icon,
  lines
}) {
  if (!stage || !flow || !iconWrap || !icon || !Array.isArray(lines) || !lines.length) {
    return;
  }

  const state = {
    obstaclePadding: 12,
    lineHeight: 29,
    preparedLines: [],
    renderFrame: 0,
    motionFrame: 0,
    pointerX: 0,
    pointerY: 0,
    currentX: 0,
    currentY: 0,
    iconWidth: 60,
    iconHeight: 49,
    active: false
  };

  const fallbackRender = () => {
    flow.innerHTML = lines.map((line) => `<p class="fallback-copy">${escapeHtml(line)}</p>`).join("");
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
      state.preparedLines = lines.map((line) => prepareWithSegments(line, style.font));
    };

    const updateBounds = () => {
      const stageWidth = stage.clientWidth;
      const stageHeight = stage.clientHeight;
      state.iconWidth = clamp(stageWidth * 0.08, 48, 64);
      state.iconHeight = state.iconWidth * 0.82;

      const minX = 8;
      const maxX = Math.max(minX, stageWidth - state.iconWidth - 8);
      const minY = 18;
      const maxY = Math.max(minY, stageHeight - state.iconHeight - 24);

      state.pointerX = clamp(state.pointerX || stageWidth * 0.16, minX, maxX);
      state.pointerY = clamp(state.pointerY || stageHeight * 0.2, minY, maxY);
      state.currentX = clamp(state.currentX || state.pointerX, minX, maxX);
      state.currentY = clamp(state.currentY || state.pointerY, minY, maxY);
    };

    const positionIcon = () => {
      iconWrap.style.transform = `translate(${state.currentX}px, ${state.currentY}px)`;
      iconWrap.style.opacity = state.active ? "1" : "0";
    };

    const bandBounds = (y, top, height, leftStart, leftEnd, rightStart, rightEnd) => {
      if (y < top || y > top + height) {
        return null;
      }

      const t = (y - top) / height;
      return {
        left: leftStart + (leftEnd - leftStart) * t,
        right: rightStart + (rightEnd - rightStart) * t
      };
    };

    const obstacleForLine = (lineTop, lineBottom) => {
      if (!state.active) {
        return null;
      }

      const left = state.currentX;
      const top = state.currentY;
      const width = state.iconWidth;
      const height = state.iconHeight;
      let minLeft = Number.POSITIVE_INFINITY;
      let maxRight = Number.NEGATIVE_INFINITY;
      let found = false;

      const rootTop = top + height * 0.08;
      const rootHeight = height * 0.78;
      const overbarTop = top;
      const overbarHeight = height * 0.12;
      const threeTop = top + height * 0.16;
      const threeHeight = height * 0.64;

      for (let y = lineTop; y <= lineBottom; y += 2) {
        const bands = [];

        if (y >= overbarTop && y <= overbarTop + overbarHeight) {
          bands.push({
            left: left + width * 0.43,
            right: left + width * 0.95
          });
        }

        const lowerHook = bandBounds(
          y,
          rootTop + rootHeight * 0.52,
          rootHeight * 0.3,
          left + width * 0.02,
          left + width * 0.12,
          left + width * 0.16,
          left + width * 0.27
        );
        if (lowerHook) {
          bands.push(lowerHook);
        }

        const risingStem = bandBounds(
          y,
          rootTop + rootHeight * 0.34,
          rootHeight * 0.42,
          left + width * 0.14,
          left + width * 0.37,
          left + width * 0.22,
          left + width * 0.47
        );
        if (risingStem) {
          bands.push(risingStem);
        }

        if (y >= threeTop && y <= threeTop + threeHeight) {
          const relativeY = (y - threeTop) / threeHeight;
          const centerX = left + width * 0.72;
          const upperArc = Math.abs(relativeY - 0.27) <= 0.22
            ? Math.sqrt(1 - ((relativeY - 0.27) / 0.22) ** 2) * width * 0.17
            : 0;
          const lowerArc = Math.abs(relativeY - 0.72) <= 0.22
            ? Math.sqrt(1 - ((relativeY - 0.72) / 0.22) ** 2) * width * 0.18
            : 0;
          const arcWidth = Math.max(upperArc, lowerArc);
          if (arcWidth > 0) {
            bands.push({
              left: centerX - arcWidth * 0.52,
              right: centerX + arcWidth
            });
          }
        }

        if (!bands.length) {
          continue;
        }

        bands.forEach((band) => {
          found = true;
          minLeft = Math.min(minLeft, band.left);
          maxRight = Math.max(maxRight, band.right);
        });
      }

      if (!found) {
        return null;
      }

      return {
        left: clamp(minLeft - state.obstaclePadding, 0, flow.clientWidth),
        right: clamp(maxRight + state.obstaclePadding, 0, flow.clientWidth)
      };
    };

    const consumeSegment = (cursor, width, preparedLine) => {
      if (width <= 0) {
        return null;
      }

      const range = layoutNextLineRange(preparedLine, cursor, width);
      if (!range) {
        return null;
      }

      const line = materializeLineRange(preparedLine, range);
      return { cursor: range.end, line };
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

      const segments = [];
      let y = 0;

      state.preparedLines.forEach((preparedLine, itemIndex) => {
        let cursor = { segmentIndex: 0, graphemeIndex: 0 };
        let localGuard = 0;
        let consumedAny = false;

        while (localGuard < 400) {
          localGuard += 1;
          const lineTop = y;
          const lineBottom = y + state.lineHeight;
          const obstacle = obstacleForLine(lineTop, lineBottom);

          if (!obstacle) {
            const piece = consumeSegment(cursor, width, preparedLine);
            if (!piece) {
              break;
            }

            segments.push({
              text: piece.line.text,
              x: 0,
              y,
              width,
              itemIndex
            });

            cursor = piece.cursor;
            y += state.lineHeight;
            consumedAny = true;
            continue;
          }

          const leftWidth = Math.max(0, obstacle.left);
          const rightX = Math.min(width, obstacle.right);
          const rightWidth = Math.max(0, width - rightX);
          let moved = false;

          if (leftWidth > 54) {
            const leftPiece = consumeSegment(cursor, leftWidth, preparedLine);
            if (leftPiece && leftPiece.line.text) {
              segments.push({
                text: leftPiece.line.text,
                x: 0,
                y,
                width: leftWidth,
                itemIndex
              });
              cursor = leftPiece.cursor;
              moved = true;
              consumedAny = true;
            }
          }

          if (rightWidth > 54) {
            const rightPiece = consumeSegment(cursor, rightWidth, preparedLine);
            if (rightPiece && rightPiece.line.text) {
              segments.push({
                text: rightPiece.line.text,
                x: rightX,
                y,
                width: rightWidth,
                itemIndex
              });
              cursor = rightPiece.cursor;
              moved = true;
              consumedAny = true;
            }
          }

          if (!moved) {
            break;
          }

          y += state.lineHeight;
        }

        y += consumedAny ? state.lineHeight * 0.8 : state.lineHeight * 1.8;
      });

      flow.style.height = `${Math.max(y + 8, state.iconHeight + 90)}px`;
      flow.innerHTML = segments.map((segment) => (
        `<span class="flow-fragment" data-flow-item="${segment.itemIndex}" style="max-width:${segment.width}px;transform:translate(${segment.x}px,${segment.y}px)">${segment.text}</span>`
      )).join("");
    };

    const queueRender = () => {
      if (state.renderFrame) {
        return;
      }

      state.renderFrame = requestAnimationFrame(render);
    };

    const animatePointer = () => {
      state.motionFrame = 0;
      const dx = state.pointerX - state.currentX;
      const dy = state.pointerY - state.currentY;

      state.currentX += dx * 0.16;
      state.currentY += dy * 0.16;
      positionIcon();
      queueRender();

      if (Math.abs(dx) > 0.4 || Math.abs(dy) > 0.4) {
        state.motionFrame = requestAnimationFrame(animatePointer);
      } else {
        state.currentX = state.pointerX;
        state.currentY = state.pointerY;
        positionIcon();
        queueRender();
      }
    };

    const queueMotion = () => {
      if (!state.motionFrame) {
        state.motionFrame = requestAnimationFrame(animatePointer);
      }
    };

    const updatePointer = (clientX, clientY) => {
      const rect = stage.getBoundingClientRect();
      const minX = 8;
      const maxX = Math.max(minX, rect.width - state.iconWidth - 8);
      const minY = 18;
      const maxY = Math.max(minY, rect.height - state.iconHeight - 24);

      state.pointerX = clamp(clientX - rect.left - state.iconWidth * 0.5, minX, maxX);
      state.pointerY = clamp(clientY - rect.top - state.iconHeight * 0.52, minY, maxY);
      queueMotion();
    };

    stage.addEventListener("pointermove", (event) => {
      updatePointer(event.clientX, event.clientY);
    });

    stage.addEventListener("pointerenter", (event) => {
      state.active = true;
      document.body.classList.add("hide-global-sqrt-cursor");
      updatePointer(event.clientX, event.clientY);
    });

    stage.addEventListener("pointerleave", () => {
      state.active = false;
      document.body.classList.remove("hide-global-sqrt-cursor");
      positionIcon();
      queueRender();
    });

    const resizeObserver = new ResizeObserver(() => {
      updatePrepared();
      updateBounds();
      positionIcon();
      queueRender();
    });

    resizeObserver.observe(stage);

    await document.fonts.ready;
    updatePrepared();
    updateBounds();
    state.active = false;
    positionIcon();
    queueRender();
  } catch {
    fallbackRender();
  }
}
