import { siteContent } from "../data/site-content.js?v=20260413g";
import { initInteractive } from "./interactive.js?v=20260413g";
import { initPoemPanel } from "./poem-panel.js?v=20260413g";

window.__resumeBooted = true;

const appPoemSidebar = document.getElementById("poem-sidebar");
const appHeader = document.getElementById("site-header");
const appMain = document.getElementById("site-main");
const appFooter = document.getElementById("site-footer");

const initGlobalSqrtCursor = () => {
  if (window.matchMedia("(pointer: coarse)").matches) {
    return;
  }

  const cursor = document.createElement("div");
  cursor.className = "global-sqrt-cursor";
  cursor.setAttribute("aria-hidden", "true");
  cursor.innerHTML = `
    <img src="assets/sqrt3-handwritten-c.svg" alt="">
  `;
  document.body.appendChild(cursor);

  const state = {
    x: window.innerWidth * 0.5,
    y: window.innerHeight * 0.5,
    targetX: window.innerWidth * 0.5,
    targetY: window.innerHeight * 0.5,
    frame: 0,
    active: false
  };

  const render = () => {
    state.frame = 0;
    state.x += (state.targetX - state.x) * 0.26;
    state.y += (state.targetY - state.y) * 0.26;
    cursor.style.transform = `translate(${state.x}px, ${state.y}px)`;

    if (Math.abs(state.targetX - state.x) > 0.2 || Math.abs(state.targetY - state.y) > 0.2) {
      state.frame = requestAnimationFrame(render);
    }
  };

  const queue = () => {
    if (!state.frame) {
      state.frame = requestAnimationFrame(render);
    }
  };

  window.addEventListener("pointermove", (event) => {
    state.targetX = event.clientX;
    state.targetY = event.clientY;
    if (!state.active) {
      state.active = true;
      cursor.classList.add("is-visible");
    }
    queue();
  });

  window.addEventListener("pointerdown", () => {
    cursor.classList.add("is-pressed");
  });

  window.addEventListener("pointerup", () => {
    cursor.classList.remove("is-pressed");
  });
};

const renderBootError = (error) => {
  const message = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
  if (appHeader) {
    appHeader.innerHTML = `
      <div style="width:100%">
        <h1 class="name">Page Load Error</h1>
        <p class="subtitle">The page shell loaded, but the content renderer stopped.</p>
        <p class="research" style="color:#991b1b">${message}</p>
      </div>
    `;
  }

  if (appMain) {
    appMain.innerHTML = `
      <section class="section">
        <h2 class="section-title">Debug Hint</h2>
        <p>Please open the browser console and copy the first red error line.</p>
      </section>
    `;
  }
};

const createLinkMarkup = ({ href, label }) => (
  `<a href="${href}" target="_blank" rel="noreferrer">${label}</a>`
);

const createBadgeMarkup = ({ href, src, alt }) => {
  const image = `<img src="${src}" alt="${alt}">`;
  return href ? `<a href="${href}" target="_blank" rel="noreferrer">${image}</a>` : image;
};

const renderPoemSidebar = (poemPanel) => {
  appPoemSidebar.innerHTML = `
    <div class="poem-shell">
      <div class="poem-meta poem-meta-top">
        <p class="poem-title">${poemPanel.title}</p>
        <p class="poem-author">${poemPanel.author}</p>
        <a href="${poemPanel.sourceHref}" target="_blank" rel="noreferrer">${poemPanel.sourceLabel}</a>
      </div>
      <div class="poem-viewport" data-poem-viewport>
        <div class="poem-flow" data-poem-flow></div>
      </div>
    </div>
  `;
};

const renderHeader = (header) => {
  appHeader.innerHTML = `
    <div class="intro">
      <h1 class="name">${header.name}</h1>
      <p class="subtitle">${header.subtitle}</p>
      ${header.summary.map((paragraph) => `<p class="research">${paragraph}</p>`).join("")}
      <div class="links">${header.links.map(createLinkMarkup).join(" / ")}</div>
      <div class="badge-row">${header.badges.map(createBadgeMarkup).join("")}</div>
    </div>
    <div class="photo-box">
      <img class="profile-photo" src="${header.photo.src}" alt="${header.photo.alt}">
    </div>
  `;
};

const renderTimeline = (section) => `
  <ul class="timeline-list">
    ${section.items.map((item) => `
      <li>
        <span class="date">[${item.date}]</span>${item.text}
      </li>
    `).join("")}
  </ul>
`;

const renderList = (section) => `
  <ul class="content-list">
    ${section.items.map((item) => `
      <li>
        <strong>${item.title}</strong><br>
        ${item.description}
      </li>
    `).join("")}
  </ul>
`;

const renderExperience = (section) => `
  <ul class="experience-list">
    ${section.items.map((item) => `
      <li>
        <div class="company-inline">
          <img src="${item.badge.src}" alt="${item.badge.alt}">
        </div>
        <br>
        <strong>${item.organization}</strong>, ${item.role}<br>
        ${item.period}<br>
        ${item.description}
      </li>
    `).join("")}
  </ul>
`;

const renderMediaGrid = (section) => `
  <div class="interests-block">
    <p class="section-intro">${section.intro}</p>
    <div class="interest-grid">
      ${section.items.map((item) => `
        <article class="interest-card panel">
          <div class="interest-media">
            <img src="${item.image}" alt="${item.imageAlt}">
          </div>
          <div class="interest-copy">
            <p class="interest-label">${item.title}</p>
            <h3 class="interest-name">${item.name}</h3>
            <p class="interest-meta">${item.meta}</p>
            <p>${item.description}</p>
            <p class="interest-credit">
              <a href="${item.creditHref}" target="_blank" rel="noreferrer">${item.creditLabel}</a>
            </p>
          </div>
        </article>
      `).join("")}
    </div>
  </div>
`;

const renderReflow = (section) => `
  <div
    class="interactive-card reflow-card"
    data-reflow-section
    data-reflow-lines='${JSON.stringify(
      section.id === "news"
        ? section.items.map((item) => `[${item.date}] ${item.text}`)
        : section.items.map((item) => `${item.title}. ${item.description}`)
    )}'
  >
    <div class="interactive-controls">
      <p class="interactive-instruction">${section.instruction}</p>
    </div>
    <div class="interactive-stage" data-reflow-stage>
      <div class="interactive-flow" data-reflow-flow aria-live="polite"></div>
      <div class="icon-wrap" data-reflow-icon-wrap aria-hidden="true">
        <img
          class="interactive-icon"
          data-reflow-icon
          src="assets/sqrt3-handwritten-c.svg"
          alt=""
        >
      </div>
    </div>
  </div>
`;

const sectionRenderers = {
  timeline: renderTimeline,
  list: renderList,
  experience: renderExperience,
  "media-grid": renderMediaGrid,
  reflow: renderReflow
};

const renderSections = (sections) => {
  appMain.innerHTML = sections.map((section) => `
    <section class="section" id="${section.id}">
      <h2 class="section-title">${section.title}</h2>
      ${sectionRenderers[section.type](section)}
    </section>
  `).join("");
};

const renderFooter = (footer) => {
  appFooter.textContent = `Last updated: ${footer.updated}`;
};

try {
  initGlobalSqrtCursor();
  renderPoemSidebar(siteContent.poemPanel);
  renderHeader(siteContent.header);
  renderSections(siteContent.sections);
  renderFooter(siteContent.footer);

  document.querySelectorAll("[data-reflow-section]").forEach((sectionElement) => {
    initInteractive({
      stage: sectionElement.querySelector("[data-reflow-stage]"),
      flow: sectionElement.querySelector("[data-reflow-flow]"),
      iconWrap: sectionElement.querySelector("[data-reflow-icon-wrap]"),
      icon: sectionElement.querySelector("[data-reflow-icon]"),
      lines: JSON.parse(sectionElement.dataset.reflowLines || "[]")
    });
  });

  initPoemPanel({
    root: appPoemSidebar,
    lines: siteContent.poemPanel.lines
  });
} catch (error) {
  console.error(error);
  renderBootError(error);
}
