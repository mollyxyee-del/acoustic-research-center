const API_BASE = (import.meta.env.VITE_NOTION_API_URL ?? "").replace(/\/$/, "");

function liveEndpoint(name) {
  if (API_BASE) return `${API_BASE}/${name}`;
  return `/api/notion/${name}`;
}

export async function loadNotionData(name, fallbackPath) {
  const liveUrl = liveEndpoint(name);

  try {
    const liveResponse = await fetch(liveUrl, { cache: "no-store" });
    const contentType = liveResponse.headers.get("content-type") ?? "";
    if (
      liveResponse.ok &&
      (contentType.includes("application/json") || contentType.includes("+json"))
    ) {
      try {
        const data = await liveResponse.json();
        return data;
      } catch (parseError) {
        console.warn(`Live Notion response was not JSON (${name}):`, parseError);
      }
    }
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