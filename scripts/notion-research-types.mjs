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

  return { typeName, blurb };
}

export function buildResearchTypesCatalog(pages) {
  const catalog = [];

  for (const page of pages) {
    const { typeName, blurb } = parseResearchTypePage(page);
    if (!typeName) continue;
    catalog.push({ type: typeName, blurb });
  }

  return catalog;
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