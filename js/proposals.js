import { loadNotionData } from "./notion-data.js";

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function renderProposal(proposal) {
  const paragraphs = proposal.paragraphs?.length
    ? proposal.paragraphs
        .map((text) => `<p>${escapeHtml(text)}</p>`)
        .join("")
    : "";

  const author = proposal.author ? escapeHtml(proposal.author) : "";
  const timeline = proposal.timeline ? escapeHtml(proposal.timeline) : "";

  return `<article class="proposal-card">
            <div class="proposal-card__frame">
              <h2 class="proposal-card__title">${escapeHtml(proposal.title)}</h2>
              <div class="proposal-card__body">${paragraphs}</div>
              <footer class="proposal-card__meta">
                <span class="proposal-card__author">${author}</span>
                <span class="proposal-card__timeline">${timeline}</span>
              </footer>
            </div>
          </article>`;
}

async function initProposals() {
  const root = document.getElementById("proposals-root");
  if (!root) return;

  try {
    const data = await loadNotionData("proposals", "/proposals.json");
    if (!data.proposals?.length) {
      root.innerHTML = '<p class="library-empty">No proposals yet.</p>';
      return;
    }

    root.innerHTML = data.proposals.map(renderProposal).join("\n");
    root.setAttribute("aria-busy", "false");
  } catch (error) {
    console.error("Failed to load proposals", error);
    root.innerHTML =
      '<p class="library-empty">Proposals could not be loaded. Try again later.</p>';
    root.setAttribute("aria-busy", "false");
  }
}

if (document.getElementById("proposals-root")) {
  initProposals();
}