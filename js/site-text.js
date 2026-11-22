import { loadNotionData } from "./notion-data.js";

function applyMultiline(element, text) {
  if (!element || !text) return;
  const parts = text.split(/\n{2,}/).map((part) => part.trim()).filter(Boolean);
  if (parts.length <= 1) {
    element.textContent = text.trim();
    return;
  }
  element.replaceChildren(
    ...parts.map((part) => {
      const paragraph = document.createElement("p");
      paragraph.textContent = part;
      return paragraph;
    })
  );
}

async function initSiteText() {
  const homeIntro = document.querySelector(".home-intro");
  const aboutCharter = document.querySelector(".about-intro");
  if (!homeIntro && !aboutCharter) return;

  try {
    const data = await loadNotionData("site-text", "/site-text.json");
    const fields = data.fields ?? {};

    if (homeIntro && fields.homeIntro) {
      applyMultiline(homeIntro, fields.homeIntro);
    }
    if (aboutCharter && fields.aboutCharter) {
      applyMultiline(aboutCharter, fields.aboutCharter);
    }
  } catch (error) {
    console.error("Failed to load site text", error);
  }
}

initSiteText();