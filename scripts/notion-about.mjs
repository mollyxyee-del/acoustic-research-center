import {
  findProperty,
  plainFromTitle,
  richTextToParagraphs,
} from "./notion-client.mjs";

export const DEFAULT_ABOUT_DATA_SOURCE_ID = "41bae2a3-d440-80da-94da-000bf34672a7";

export function parseAboutPage(page) {
  const props = page.properties ?? {};
  const nameProp =
    findProperty(props, ["name", "Name", "title"], "title") ??
    Object.values(props).find((p) => p.type === "title");
  const bioProp = findProperty(props, ["bio", "Bio"], "rich_text");

  return {
    name: plainFromTitle(nameProp),
    paragraphs: richTextToParagraphs(bioProp),
  };
}

export function buildAboutFromPages(pages) {
  const people = [];

  for (const page of pages) {
    const { name, paragraphs } = parseAboutPage(page);
    if (!name) continue;
    people.push({ name, paragraphs });
  }

  return {
    updatedAt: new Date().toISOString(),
    people,
  };
}