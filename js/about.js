import { loadNotionData } from "./notion-data.js";

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function renderPerson(person) {
  const paragraphs = person.paragraphs.length
    ? person.paragraphs
        .map((text) => `<p>${escapeHtml(text)}</p>`)
        .join("\n        ")
    : '<p class="bio-empty">Bio coming soon.</p>';

  return `<article class="bio-block">
        <h2>${escapeHtml(person.name)}</h2>
        ${paragraphs}
      </article>`;
}

async function initAbout() {
  const root = document.getElementById("about-people");
  if (!root) return;

  try {
    const data = await loadNotionData("about", "/about.json");
    if (!data.people?.length) {
      root.innerHTML = '<p class="library-empty">No bios yet.</p>';
      return;
    }

    root.innerHTML = data.people.map(renderPerson).join("\n\n      ");
  } catch (error) {
    console.error("Failed to load about page", error);
    root.innerHTML =
      '<p class="library-empty">Bios could not be loaded. Try again later.</p>';
  }
}

initAbout();