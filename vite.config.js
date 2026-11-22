import { resolve } from "path";
import { defineConfig } from "vite";
import { notionLiveApiPlugin } from "./vite-notion-live.mjs";

export default defineConfig({
  plugins: [notionLiveApiPlugin()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        research: resolve(__dirname, "research.html"),
        support: resolve(__dirname, "support.html"),
        proposals: resolve(__dirname, "proposals.html"),
        about: resolve(__dirname, "about.html"),
      },
    },
  },
});