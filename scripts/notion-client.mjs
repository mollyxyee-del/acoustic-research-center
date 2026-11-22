export const NOTION_API_VERSION = "2025-09-03";

export async function queryDataSource(dataSourceId, token, { sorts } = {}) {
  const pages = [];
  let cursor;

  do {
    const body = {
      page_size: 100,
      start_cursor: cursor,
    };
    if (sorts?.length) body.sorts = sorts;

    const response = await fetch(
      `https://api.notion.com/v1/data_sources/${dataSourceId}/query`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Notion-Version": NOTION_API_VERSION,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Notion query failed (${response.status}): ${body}`);
    }

    const payload = await response.json();
    pages.push(...(payload.results ?? []));
    cursor = payload.has_more ? payload.next_cursor : undefined;
  } while (cursor);

  return pages;
}

export function findProperty(properties, names, ...types) {
  const lowered = names.map((n) => n.toLowerCase());
  const key = Object.keys(properties).find((propName) => {
    if (!lowered.includes(propName.toLowerCase())) return false;
    const prop = properties[propName];
    return types.length === 0 || types.includes(prop.type);
  });
  return key ? properties[key] : null;
}

export function plainFromTitle(prop) {
  if (!prop || prop.type !== "title") return "";
  return prop.title.map((part) => part.plain_text).join("").trim();
}

export function richTextToParagraphs(prop) {
  if (!prop) return [];
  let text = "";
  if (prop.type === "rich_text") {
    text = prop.rich_text.map((part) => part.plain_text).join("");
  }
  if (!text.trim()) return [];
  return text
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}