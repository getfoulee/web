// @ts-check
import { defineConfig, envField } from "astro/config";
import sitemap from "@astrojs/sitemap";
import pressKit from "./src/integrations/press-kit";
import shareImages from "./src/integrations/share-images";
import csp from "./src/integrations/csp";
import { alternates, defaultLocale, locales } from "./src/lib/i18n";

export default defineConfig({
  site: "https://getfoulee.app",
  trailingSlash: "never",
  build: {
    format: "file",
  },
  i18n: {
    locales: Object.keys(locales),
    defaultLocale,
    routing: { prefixDefaultLocale: false },
  },
  integrations: [
    sitemap({
      // A page published in both languages lists both, as its hreflang links do.
      serialize(item) {
        const links = alternates(new URL(item.url).pathname).map(({ locale, path }) => ({
          lang: locale,
          url: new URL(path, item.url).href,
        }));
        return links.length > 0 ? { ...item, links } : item;
      },
    }),
    pressKit(),
    shareImages(),
    csp(),
  ],
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
