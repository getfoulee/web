// Draws each page's share card after every build, from the page's own
// metadata: og:image is where the card goes, og:image:alt its title, og:url
// the address it shows. A new page gets its card without a list to keep.
import type { AstroIntegration } from "astro";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { site } from "../lib/site";
import { shareCard } from "../lib/share-card.mjs";

const entities: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'" };

/** The content of the `<meta property>` tag, unescaped; undefined when absent. */
function meta(html: string, property: string): string | undefined {
  const content = html.match(new RegExp(`<meta property="${property}" content="([^"]*)"`))?.[1];
  return content?.replace(/&(amp|lt|gt|quot|#39);/g, (_, name: string) => entities[name]);
}

export default function shareImages(): AstroIntegration {
  return {
    name: "share-images",
    hooks: {
      "astro:build:done": async ({ dir, pages, logger }) => {
        let count = 0;
        for (const { pathname } of pages) {
          const html = await readFile(new URL(`${pathname.replace(/\/$/, "") || "index"}.html`, dir), "utf8");
          const image = meta(html, "og:image");
          const title = meta(html, "og:image:alt");
          const url = meta(html, "og:url");
          if (!image?.startsWith(`${site.url}/`) || !title || !url) continue;

          const file = fileURLToPath(new URL(image.slice(site.url.length + 1), dir));
          await mkdir(dirname(file), { recursive: true });
          await writeFile(file, await shareCard({ title, address: url.replace(/^https:\/\//, "").replace(/\/$/, "") }));
          count++;
        }
        logger.info(`${count} share cards`);
      },
    },
  };
}
