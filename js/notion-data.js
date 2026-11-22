const API_BASE = (import.meta.env.VITE_NOTION_API_URL ?? "").replace(/\/$/, "");

function liveEndpoint(name) {
  if (API_BASE) return `${API_BASE}/${name}`;
  return `/api/notion/${name}`;
}

export async function loadNotionData(name, fallbackPath) {
  const liveUrl = liveEndpoint(name);

  try {
    const liveResponse = await fetch(liveUrl, { cache: "no-store" });
    if (liveResponse.ok) return liveResponse.json();
  } catch (error) {
    console.warn(`Live Notion fetch failed (${name}):`, error);
  }

  const staticResponse = await fetch(`${fallbackPath}?t=${Date.now()}`, {
    cache: "no-store",
  });
  if (!staticResponse.ok) {
    throw new Error(`${fallbackPath} (${staticResponse.status})`);
  }
  return staticResponse.json();
}