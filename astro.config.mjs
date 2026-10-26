// @ts-check
import { defineConfig, envField } from "astro/config";
import sitemap from "@astrojs/sitemap";
import pressKit from "./src/integrations/press-kit";
import shareImages from "./src/integrations/share-images";

export default defineConfig({
  site: "https://getfoulee.app",
  trailingSlash: "never",
  build: {
    format: "file",
  },
  integrations: [sitemap(), pressKit(), shareImages()],
  env: {
    schema: {
      // Set by CI on main only, so previews and local builds are never counted.
      ANALYTICS: envField.boolean({ context: "server", access: "public", default: false }),
    },
  },
  devToolbar: {
    enabled: false,
  },
});
