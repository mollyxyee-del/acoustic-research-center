import { queryDataSource } from "./notion-client.mjs";
import {
  DEFAULT_DATA_SOURCE_ID,
  buildLibraryFromPages,
} from "./notion-library.mjs";
import {
  DEFAULT_ABOUT_DATA_SOURCE_ID,
  buildAboutFromPages,
} from "./notion-about.mjs";
import {
  DEFAULT_RESEARCH_TYPES_DATA_SOURCE_ID,
  buildResearchTypesCatalog,
  resolveCanonicalType,
} from "./notion-research-types.mjs";
import {
  DEFAULT_SITE_TEXT_DATA_SOURCE_ID,
  buildSiteTextFromPages,
} from "./notion-site-text.mjs";
import {
  DEFAULT_PROPOSALS_DATA_SOURCE_ID,
  buildProposalsFromPages,
} from "./notion-proposals.mjs";

export function notionEnv(env = process.env) {
  return {
    token: env.NOTION_TOKEN,
    libraryDataSourceId: env.NOTION_DATA_SOURCE_ID || DEFAULT_DATA_SOURCE_ID,
    aboutDataSourceId:
      env.NOTION_ABOUT_DATA_SOURCE_ID || DEFAULT_ABOUT_DATA_SOURCE_ID,
    typesDataSourceId:
      env.NOTION_RESEARCH_TYPES_DATA_SOURCE_ID ||
      DEFAULT_RESEARCH_TYPES_DATA_SOURCE_ID,
    siteTextDataSourceId:
      env.NOTION_SITE_TEXT_DATA_SOURCE_ID || DEFAULT_SITE_TEXT_DATA_SOURCE_ID,
    proposalsDataSourceId:
      env.NOTION_PROPOSALS_DATA_SOURCE_ID || DEFAULT_PROPOSALS_DATA_SOURCE_ID,
  };
}

export async function fetchLibraryData(env = process.env) {
  const { token, libraryDataSourceId, typesDataSourceId } = notionEnv(env);
  if (!token) throw new Error("NOTION_TOKEN is not set");

  const [articlePages, typePages] = await Promise.all([
    queryDataSource(libraryDataSourceId, token),
    queryDataSource(typesDataSourceId, token).catch(() => []),
  ]);

  const typeCatalog = buildResearchTypesCatalog([...typePages].reverse());
  const resolveType = (name) => resolveCanonicalType(name, typeCatalog);
  const library = buildLibraryFromPages(articlePages, { typeCatalog, resolveType });
  library.source = {
    articlesDataSourceId: libraryDataSourceId,
    typesDataSourceId,
    articleCount: articlePages.length,
    typeCount: typePages.length,
    live: true,
  };
  return library;
}

export async function fetchAboutData(env = process.env) {
  const { token, aboutDataSourceId } = notionEnv(env);
  if (!token) throw new Error("NOTION_TOKEN is not set");

  const pages = await queryDataSource(aboutDataSourceId, token);
  const about = buildAboutFromPages([...pages].reverse());
  about.source = { dataSourceId: aboutDataSourceId, pageCount: pages.length, live: true };
  return about;
}

export async function fetchSiteTextData(env = process.env) {
  const { token, siteTextDataSourceId } = notionEnv(env);
  if (!token) throw new Error("NOTION_TOKEN is not set");

  const pages = await queryDataSource(siteTextDataSourceId, token);
  const siteText = buildSiteTextFromPages(pages);
  siteText.source = {
    dataSourceId: siteTextDataSourceId,
    pageCount: pages.length,
    live: true,
  };
  return siteText;
}

export async function fetchProposalsData(env = process.env) {
  const { token, proposalsDataSourceId } = notionEnv(env);
  if (!token) throw new Error("NOTION_TOKEN is not set");

  const pages = await queryDataSource(proposalsDataSourceId, token);
  const proposals = buildProposalsFromPages(pages);
  proposals.source = {
    dataSourceId: proposalsDataSourceId,
    pageCount: pages.length,
    live: true,
  };
  return proposals;
}