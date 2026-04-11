import { siteContent } from "../data/site-content.js";
import { initInteractive } from "./interactive.js";

const appHeader = document.getElementById("site-header");
const appMain = document.getElementById("site-main");
const appFooter = document.getElementById("site-footer");

const createLinkMarkup = ({ href, label }) => (
  `<a href="${href}" target="_blank" rel="noreferrer">${label}</a>`
);

const createBadgeMarkup = ({ href, src, alt }) => {
  const image = `<img src="${src}" alt="${alt}">`;
  return href ? `<a href="${href}" target="_blank" rel="noreferrer">${image}</a>` : image;
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
      <label for="rotation-control">
        ${section.controlLabel}
        <input id="rotation-control" type="range" min="0" max="360" step="1" value="0">
      </label>
      <div class="rotation-value" id="rotation-value">0deg</div>
    </div>
    <div class="interactive-stage" id="interactive-stage">
      <div class="interactive-flow" id="interactive-flow" aria-live="polite"></div>
      <div class="icon-wrap" id="icon-wrap" aria-hidden="true">
        <img
          class="interactive-icon"
          id="interactive-icon"
          src="https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/openai.svg"
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
    rotationControl: document.getElementById("rotation-control"),
    rotationValue: document.getElementById("rotation-value"),
    copy: interactiveSection.interactiveCopy
  });
}
