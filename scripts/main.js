import { siteContent } from "../data/site-content.js";
import { initInteractive } from "./interactive.js";
import { initPoemPanel } from "./poem-panel.js";

window.__resumeBooted = true;

const appPoemSidebar = document.getElementById("poem-sidebar");
const appHeader = document.getElementById("site-header");
const appMain = document.getElementById("site-main");
const appFooter = document.getElementById("site-footer");

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

const renderInteractive = (section) => `
  <div class="interactive-card panel" id="interactive-card">
    <p class="interactive-kicker">${section.kicker}</p>
    <h3 class="interactive-heading">${section.heading}</h3>
    <p class="interactive-note">${section.note}</p>
    <div class="interactive-controls">
      <p class="interactive-instruction">${section.controlLabel}</p>
    </div>
    <div class="interactive-stage" id="interactive-stage">
      <div class="interactive-flow" id="interactive-flow" aria-live="polite"></div>
      <div class="icon-wrap" id="icon-wrap" aria-hidden="true">
        <svg
          class="interactive-icon interactive-root-icon"
          id="interactive-icon"
          viewBox="0 0 320 320"
          role="presentation"
        >
          <path
            d="M34 183h42l32 73L154 82h132"
            fill="none"
            stroke="currentColor"
            stroke-width="28"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <text
            x="200"
            y="220"
            text-anchor="middle"
            font-size="148"
            font-weight="700"
            font-family="Georgia, Times New Roman, serif"
          >3</text>
        </svg>
      </div>
    </div>
  </div>
`;

const sectionRenderers = {
  timeline: renderTimeline,
  list: renderList,
  experience: renderExperience,
  "media-grid": renderMediaGrid,
  interactive: renderInteractive
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
  renderPoemSidebar(siteContent.poemPanel);
  renderHeader(siteContent.header);
  renderSections(siteContent.sections);
  renderFooter(siteContent.footer);

  const interactiveSection = siteContent.sections.find((section) => section.type === "interactive");

  if (interactiveSection) {
    initInteractive({
      stage: document.getElementById("interactive-stage"),
      flow: document.getElementById("interactive-flow"),
      iconWrap: document.getElementById("icon-wrap"),
      icon: document.getElementById("interactive-icon"),
      copy: interactiveSection.interactiveCopy
    });
  }

  initPoemPanel({
    root: appPoemSidebar,
    lines: siteContent.poemPanel.lines
  });
} catch (error) {
  console.error(error);
  renderBootError(error);
}
