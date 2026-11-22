import {
  findProperty,
  plainFromTitle,
  richTextToParagraphs,
} from "./notion-client.mjs";

export const DEFAULT_SITE_TEXT_DATA_SOURCE_ID =
  "420ae2a3-d440-8000-ae00-000b6bd471a7";

function plainFromRichText(prop) {
  if (!prop || prop.type !== "rich_text") return "";
  return prop.rich_text.map((part) => part.plain_text).join("").trim();
}

export function parseSiteTextPage(page) {
  const props = page.properties ?? {};
  const locationProp = findProperty(
    props,
    ["location", "Location"],
    "title",
    "rich_text"
  );
  const textProp = findProperty(props, ["text", "Text"], "rich_text");

  let location = plainFromTitle(locationProp);
  if (!location && locationProp?.type === "rich_text") {
    location = plainFromRichText(locationProp);
  }

  const paragraphs = richTextToParagraphs(textProp);
  const text =
    paragraphs.join("\n\n") || plainFromRichText(textProp);

  return { location, text };
}

function fieldKeyForLocation(location) {
  const value = location.toLowerCase();
  if (value.includes("homepage") && value.includes("hero")) return "homeIntro";
  if (value.includes("about") && value.includes("charter")) return "aboutCharter";
  return null;
}

export function buildSiteTextFromPages(pages) {
  const fields = {
    homeIntro: "",
    aboutCharter: "",
  };

  for (const page of pages) {
    const { location, text } = parseSiteTextPage(page);
    if (!location || !text) continue;
    const key = fieldKeyForLocation(location);
    if (key) fields[key] = text;
  }

  return {
    updatedAt: new Date().toISOString(),
    fields,
  };
}