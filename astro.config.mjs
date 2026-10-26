// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://getfoulee.app",
  trailingSlash: "never",
  build: {
    format: "file",
  },
  integrations: [sitemap()],
  devToolbar: {
    enabled: false,
  },
});
