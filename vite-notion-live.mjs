import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  fetchAboutData,
  fetchLibraryData,
  fetchSiteTextData,
} from "./scripts/notion-fetch.mjs";

const ROOT = dirname(fileURLToPath(import.meta.url));

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

export function notionLiveApiPlugin() {
  let libraryBusy = null;
  let aboutBusy = null;
  let siteTextBusy = null;

  return {
    name: "notion-live-api",
    configureServer(server) {
      loadDotEnv();

      server.middlewares.use(async (req, res, next) => {
        const path = req.url?.split("?")[0];
        if (
          path !== "/api/notion/library" &&
          path !== "/api/notion/about" &&
          path !== "/api/notion/site-text"
        ) {
          next();
          return;
        }

        if (!process.env.NOTION_TOKEN) {
          res.statusCode = 503;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: "NOTION_TOKEN not configured" }));
          return;
        }

        try {
          const body =
            path === "/api/notion/library"
              ? await (libraryBusy ||= fetchLibraryData().finally(() => {
                  libraryBusy = null;
                }))
              : path === "/api/notion/about"
                ? await (aboutBusy ||= fetchAboutData().finally(() => {
                    aboutBusy = null;
                  }))
                : await (siteTextBusy ||= fetchSiteTextData().finally(() => {
                    siteTextBusy = null;
                  }));

          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.setHeader("Cache-Control", "no-store");
          res.end(JSON.stringify(body));
        } catch (error) {
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: error.message }));
        }
      });
    },
  };
}