import { loadNotionData } from "./notion-data.js";

function renderSections(sections) {
  return sections
    .map((section) => {
      const links = section.items
        .map(
          (item) =>
            `<li><a href="${escapeAttr(item.href)}" rel="noopener noreferrer">${escapeHtml(item.title)}</a></li>`
        )
        .join("\n          ");

      const blurb = section.blurb
        ? `<p>${escapeHtml(section.blurb)}</p>`
        : "";

      return `<section class="research-section" id="${escapeAttr(section.id)}">
        <div>
          <h2 class="section-heading">${escapeHtml(section.type)}</h2>
          ${blurb}
        </div>
        <ul class="research-links">
          ${links}
        </ul>
      </section>`;
    })
    .join("\n\n      ");
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function escapeAttr(value) {
  return escapeHtml(value).replaceAll("'", "&#39;");
}

async function initLibrary() {
  const root = document.getElementById("library-root");
  if (!root) return;

  try {
    const data = await loadNotionData("library", "/library.json");
    if (!data.sections?.length) {
      root.innerHTML = '<p class="library-empty">No library entries yet.</p>';
      return;
    }

    root.innerHTML = renderSections(data.sections);
    root.setAttribute("aria-busy", "false");
  } catch (error) {
    console.error("Failed to load library", error);
    root.innerHTML =
      '<p class="library-empty">Library could not be loaded. Try again later.</p>';
    root.setAttribute("aria-busy", "false");
  }
}

if (document.getElementById("library-root")) {
  initLibrary();
}