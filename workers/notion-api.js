/**
 * Deploy with Wrangler for live Notion on production (token stays server-side).
 * Set VITE_NOTION_API_URL to this worker's URL at build time.
 */
import {
  fetchAboutData,
  fetchLibraryData,
  fetchSiteTextData,
} from "../scripts/notion-fetch.mjs";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Cache-Control": "no-store",
};

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: CORS });
    }

    const url = new URL(request.url);
    const path = url.pathname.replace(/\/$/, "");

    try {
      let body;
      if (path.endsWith("/library")) {
        body = await fetchLibraryData(env);
      } else if (path.endsWith("/about")) {
        body = await fetchAboutData(env);
      } else if (path.endsWith("/site-text")) {
        body = await fetchSiteTextData(env);
      } else {
        return new Response("Not found", { status: 404, headers: CORS });
      }

      return new Response(JSON.stringify(body), {
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }
  },
};