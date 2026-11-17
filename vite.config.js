import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        research: resolve(__dirname, "research.html"),
        support: resolve(__dirname, "support.html"),
        about: resolve(__dirname, "about.html"),
      },
    },
  },
});