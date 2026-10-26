// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import pressKit from "./src/integrations/press-kit";

export default defineConfig({
  site: "https://getfoulee.app",
  trailingSlash: "never",
  build: {
    format: "file",
  },
  integrations: [sitemap(), pressKit()],
  devToolbar: {
    enabled: false,
  },
});
