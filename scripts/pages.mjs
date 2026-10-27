import { readdirSync } from "node:fs";

/** Every page in dist/, as a path inside it: `index.html`, `assistance/garmin.html`. */
export const htmlFiles = readdirSync("dist", { recursive: true, encoding: "utf8" })
  .filter((file) => file.endsWith(".html"))
  .sort();

/** The address a page is served at: `/`, `/assistance/garmin`. */
export function address(file) {
  return `/${file.replaceAll("\\", "/").replace(/(index)?\.html$/, "")}`;
}
