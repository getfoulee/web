// Adds the hash of every inline script the build wrote to the script-src of
// the Content-Security-Policy in dist/_headers, so the theme script and the
// small scripts Astro inlines run, and nothing injected does.
import type { AstroIntegration } from "astro";
import { readFile, writeFile } from "node:fs/promises";
import { inlineScriptHashes, policyLine } from "../lib/csp.mjs";

export default function csp(): AstroIntegration {
  return {
    name: "csp",
    hooks: {
      "astro:build:done": async ({ dir, pages }) => {
        const hashes = new Set<string>();
        for (const { pathname } of pages) {
          const html = await readFile(new URL(`${pathname.replace(/\/$/, "") || "index"}.html`, dir), "utf8");
          for (const hash of inlineScriptHashes(html)) hashes.add(hash);
        }

        const file = new URL("_headers", dir);
        const headers = await readFile(file, "utf8");
        const line = policyLine(headers);
        if (!line?.includes("script-src ")) throw new Error("_headers: no Content-Security-Policy with a script-src");
        const sources = [...hashes].sort().join(" ");
        await writeFile(file, headers.replace(line, line.replace(/script-src [^;]*/, (directive) => `${directive} ${sources}`)));
      },
    },
  };
}
