import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import {
  findProperty,
  plainFromTitle,
  NOTION_API_VERSION,
} from "./notion-client.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const COPY_PATH = join(ROOT, "data/library-section-copy.json");

export { NOTION_API_VERSION };
export const DEFAULT_DATA_SOURCE_ID = "41bae2a3-d440-8088-8aa4-000b7bd3f460";

export function loadSectionCopy() {
  return JSON.parse(readFileSync(COPY_PATH, "utf8"));
}

export function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function urlFromProperty(prop) {
  if (!prop) return "";
  if (prop.type === "url") return prop.url?.trim() ?? "";
  if (prop.type === "rich_text") {
    return prop.rich_text.map((part) => part.plain_text).join("").trim();
  }
  return "";
}

export function typesFromProperty(prop) {
  if (!prop) return [];
  if (prop.type === "select" && prop.select?.name) return [prop.select.name];
  if (prop.type === "multi_select" && prop.multi_select?.length) {
    return prop.multi_select.map((option) => option.name);
  }
  return [];
}

export function parseNotionPage(page) {
  const props = page.properties ?? {};
  const titleProp =
    findProperty(props, ["title", "name", "Name"], "title") ??
    Object.values(props).find((p) => p.type === "title");
  const typeProp = findProperty(
    props,
    ["type", "Type", "category", "Category"],
    "select",
    "multi_select"
  );
  const linkProp = findProperty(props, ["link", "Link", "url", "URL"], "url", "rich_text");

  const title = plainFromTitle(titleProp);
  const href = urlFromProperty(linkProp);
  const types = typesFromProperty(typeProp);

  return { title, href, types };
}

export function sectionBlurb(typeName, copyByType) {
  if (copyByType[typeName]) return copyByType[typeName];

  const target = typeName.toLowerCase();
  const match = Object.entries(copyByType).find(([key]) => {
    const keyLower = key.toLowerCase();
    return keyLower.includes(target) || target.includes(keyLower);
  });
  return match?.[1] ?? "";
}

function blurbForType(typeName, typeCatalog, copyByType) {
  if (typeCatalog?.length) {
    const entry = typeCatalog.find((row) => row.type === typeName);
    if (entry) return entry.blurb;
  }
  return sectionBlurb(typeName, copyByType);
}

export function buildLibraryFromPages(
  pages,
  { typeCatalog = null, copyByType = loadSectionCopy(), resolveType } = {}
) {
  const sectionMap = new Map();
  const fallbackOrder = [];

  for (const page of pages) {
    const { title, href, types } = parseNotionPage(page);
    if (!title) continue;

    const sectionTypes = types.length ? types : ["Uncategorized"];

    for (const rawType of sectionTypes) {
      const typeName = resolveType ? resolveType(rawType) : rawType;
      if (!sectionMap.has(typeName)) {
        sectionMap.set(typeName, []);
        fallbackOrder.push(typeName);
      }
      sectionMap.get(typeName).push({
        title,
        href: href || "#",
      });
    }
  }

  let sectionOrder;
  if (typeCatalog?.length) {
    sectionOrder = typeCatalog.map((entry) => entry.type);
    for (const typeName of fallbackOrder) {
      if (!sectionOrder.includes(typeName)) sectionOrder.push(typeName);
    }
  } else {
    sectionOrder = fallbackOrder;
  }

  const sections = sectionOrder.map((typeName) => {
    const items = sectionMap.get(typeName) ?? [];
    items.sort((a, b) =>
      a.title.localeCompare(b.title, undefined, { sensitivity: "base" })
    );
    const blurb = blurbForType(typeName, typeCatalog, copyByType);
    return {
      id: slugify(typeName),
      type: typeName,
      blurb,
      items,
    };
  });

  return {
    updatedAt: new Date().toISOString(),
    sections,
  };
}