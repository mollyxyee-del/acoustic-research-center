import {
  findProperty,
  plainFromTitle,
  richTextToParagraphs,
} from "./notion-client.mjs";

export const DEFAULT_RESEARCH_TYPES_DATA_SOURCE_ID =
  "420ae2a3-d440-8052-b43a-000b533c5819";

function plainFromRichText(prop) {
  if (!prop || prop.type !== "rich_text") return "";
  return prop.rich_text.map((part) => part.plain_text).join("").trim();
}

function orderFromProperty(prop) {
  if (!prop || prop.type !== "number") return null;
  const value = prop.number;
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function parseResearchTypePage(page) {
  const props = page.properties ?? {};
  const typeProp =
    findProperty(props, ["type", "Type"], "title", "rich_text") ??
    Object.values(props).find((p) => p.type === "title");

  let typeName = plainFromTitle(typeProp);
  if (!typeName && typeProp?.type === "rich_text") {
    typeName = plainFromRichText(typeProp);
  }

  const descriptionProp = findProperty(
    props,
    ["description", "Description"],
    "rich_text"
  );
  const blurb = richTextToParagraphs(descriptionProp).join("\n\n");

  const orderProp = findProperty(
    props,
    ["order", "Order", "#", "rank", "Rank", "position", "Position"],
    "number"
  );
  const order = orderFromProperty(orderProp);

  return { typeName, blurb, order };
}

export function buildResearchTypesCatalog(pages) {
  const catalog = [];

  for (let index = 0; index < pages.length; index += 1) {
    const page = pages[index];
    const { typeName, blurb, order } = parseResearchTypePage(page);
    if (!typeName) continue;
    catalog.push({ type: typeName, blurb, order, queryIndex: index });
  }

  const hasExplicitOrder = catalog.some((entry) => entry.order != null);
  if (hasExplicitOrder) {
    catalog.sort((a, b) => {
      const aOrder = a.order ?? Number.POSITIVE_INFINITY;
      const bOrder = b.order ?? Number.POSITIVE_INFINITY;
      if (aOrder !== bOrder) return aOrder - bOrder;
      return a.queryIndex - b.queryIndex;
    });
  }

  return catalog.map(({ type, blurb }) => ({ type, blurb }));
}

export function resolveCanonicalType(typeName, catalog) {
  if (!catalog?.length) return typeName;

  const exact = catalog.find((entry) => entry.type === typeName);
  if (exact) return exact.type;

  const lower = typeName.toLowerCase();
  const fuzzy = catalog.find((entry) => {
    const entryLower = entry.type.toLowerCase();
    return entryLower.includes(lower) || lower.includes(entryLower);
  });

  return fuzzy?.type ?? typeName;
}