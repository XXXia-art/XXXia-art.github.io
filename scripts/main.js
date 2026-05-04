import { siteContent } from "../data/site-content.js?v=20260427";
import { initInteractive } from "./interactive.js?v=20260427";
import { initPoemPanel } from "./poem-panel.js?v=20260427";

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
    </div>
    <div class="photo-box">
      <img class="profile-photo" src="${header.photo.src}" alt="${header.photo.alt}">
      <div class="icon-row">
        <a href="https://github.com/XXXia-art" target="_blank" rel="noreferrer" aria-label="GitHub">
          <svg class="header-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
        </a>
        <a href="mailto:pz.xia@qq.com" aria-label="Email">
          <svg class="header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
        </a>
        <a href="https://v.douyin.com/9cOubR7hTTE" target="_blank" rel="noreferrer" aria-label="TikTok">
          <svg class="header-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
        </a>
      </div>
    </div>
  `;
};

const renderTimeline = (section) => `
  <ul class="timeline-list">
    ${section.items.map((item) => `
      <li>
        <span class="news-date">${item.date}</span><span class="news-text">${item.text}</span>
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
        <div class="exp-line">
          <img class="exp-logo" src="${item.badge.src}" alt="${item.badge.alt}">
          <span class="exp-org">${item.organization}</span>
          <span class="exp-role">${item.role}</span>
          <span class="exp-period">${item.period}</span>
        </div>
        <p class="exp-desc">${item.description}</p>
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
        ? section.items.map((item) => `${item.date}  ${item.text}`)
        : section.items.map((item) => `${item.title}.\n${item.description}`)
    )}'
  >
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

const showApp = () => {
  const app = document.getElementById("app");
  if (app) {
    app.classList.add("is-visible");
  }
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
