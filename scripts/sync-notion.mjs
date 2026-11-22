import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  fetchAboutData,
  fetchLibraryData,
  fetchSiteTextData,
} from "./notion-fetch.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const LIBRARY_OUTPUT = join(ROOT, "public/library.json");
const ABOUT_OUTPUT = join(ROOT, "public/about.json");
const SITE_TEXT_OUTPUT = join(ROOT, "public/site-text.json");

function loadDotEnv() {
  const envPath = join(ROOT, ".env");
  if (!existsSync(envPath)) return;

  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separator = trimmed.indexOf("=");
    if (separator === -1) continue;
    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

loadDotEnv();

async function syncLibrary() {
  if (!process.env.NOTION_TOKEN) {
    if (existsSync(LIBRARY_OUTPUT)) {
      console.warn("NOTION_TOKEN not set — keeping existing public/library.json");
      return;
    }
    throw new Error(
      "NOTION_TOKEN is required to generate library.json (or commit public/library.json)"
    );
  }

  const library = await fetchLibraryData();
  writeFileSync(LIBRARY_OUTPUT, `${JSON.stringify(library, null, 2)}\n`, "utf8");
  console.log(
    `Wrote ${library.sections.length} library sections (${library.source.articleCount} articles)`
  );
}

async function syncSiteText() {
  if (!process.env.NOTION_TOKEN) {
    if (existsSync(SITE_TEXT_OUTPUT)) {
      console.warn("NOTION_TOKEN not set — keeping existing public/site-text.json");
      return;
    }
    throw new Error(
      "NOTION_TOKEN is required to generate site-text.json (or commit public/site-text.json)"
    );
  }

  const siteText = await fetchSiteTextData();
  writeFileSync(SITE_TEXT_OUTPUT, `${JSON.stringify(siteText, null, 2)}\n`, "utf8");
  console.log(`Wrote site copy (${siteText.source.pageCount} rows)`);
}

async function syncAbout() {
  if (!process.env.NOTION_TOKEN) {
    if (existsSync(ABOUT_OUTPUT)) {
      console.warn("NOTION_TOKEN not set — keeping existing public/about.json");
      return;
    }
    throw new Error(
      "NOTION_TOKEN is required to generate about.json (or commit public/about.json)"
    );
  }

  const about = await fetchAboutData();
  writeFileSync(ABOUT_OUTPUT, `${JSON.stringify(about, null, 2)}\n`, "utf8");
  console.log(`Wrote ${about.people.length} bios (${about.source.pageCount} rows)`);
}

async function main() {
  let libraryError;
  let aboutError;
  let siteTextError;

  try {
    await syncLibrary();
  } catch (error) {
    libraryError = error;
    if (existsSync(LIBRARY_OUTPUT)) {
      console.error(error);
      console.warn("Library sync failed — keeping existing public/library.json");
    }
  }

  try {
    await syncAbout();
  } catch (error) {
    aboutError = error;
    if (existsSync(ABOUT_OUTPUT)) {
      console.error(error);
      console.warn("About sync failed — keeping existing public/about.json");
    }
  }

  try {
    await syncSiteText();
  } catch (error) {
    siteTextError = error;
    if (existsSync(SITE_TEXT_OUTPUT)) {
      console.error(error);
      console.warn("Site text sync failed — keeping existing public/site-text.json");
    }
  }

  if (libraryError && !existsSync(LIBRARY_OUTPUT)) throw libraryError;
  if (aboutError && !existsSync(ABOUT_OUTPUT)) throw aboutError;
  if (siteTextError && !existsSync(SITE_TEXT_OUTPUT)) throw siteTextError;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});