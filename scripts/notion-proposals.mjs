import {
  findProperty,
  plainFromTitle,
  richTextToParagraphs,
} from "./notion-client.mjs";

export const DEFAULT_PROPOSALS_DATA_SOURCE_ID =
  "420ae2a3-d440-80d0-9d75-000be574daaa";

function peopleFromProperty(prop) {
  if (!prop || prop.type !== "people") return "";
  return prop.people
    .map((person) => (person.name || "").trim())
    .filter(Boolean)
    .join(", ");
}

function plainFromRichText(prop) {
  if (!prop || prop.type !== "rich_text") return "";
  return prop.rich_text.map((part) => part.plain_text).join("").trim();
}

export function parseProposalPage(page) {
  const props = page.properties ?? {};
  const titleProp =
    findProperty(
      props,
      ["project name", "Project name", "title", "Name"],
      "title"
    ) ?? Object.values(props).find((p) => p.type === "title");

  const descriptionProp = findProperty(
    props,
    ["description", "Description"],
    "rich_text"
  );
  const dateProp = findProperty(props, ["date", "Date", "timeline", "Timeline"], "rich_text");
  const personProp = findProperty(props, ["person", "Person", "author", "Author"], "people");

  const title = plainFromTitle(titleProp);
  let paragraphs = richTextToParagraphs(descriptionProp);
  if (!paragraphs.length) {
    const fallback = plainFromRichText(descriptionProp);
    if (fallback) paragraphs = [fallback];
  }
  paragraphs = paragraphs.flatMap((paragraph) =>
    paragraph.includes("\n")
      ? paragraph
          .split(/\n+/)
          .map((line) => line.trim())
          .filter(Boolean)
      : [paragraph]
  );

  return {
    title,
    paragraphs,
    author: peopleFromProperty(personProp),
    timeline: plainFromRichText(dateProp),
  };
}

export function buildProposalsFromPages(pages) {
  const proposals = [];

  for (const page of pages) {
    const { title, paragraphs, author, timeline } = parseProposalPage(page);
    if (!title) continue;
    proposals.push({
      title,
      paragraphs,
      author: author || "",
      timeline: timeline || "",
    });
  }

  return {
    updatedAt: new Date().toISOString(),
    proposals,
  };
}