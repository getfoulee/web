import { readdirSync } from "node:fs";

/** Every page in dist/, as the address it is served at: `/`, `/assistance/garmin`. */
export const pages = readdirSync("dist", { recursive: true, encoding: "utf8" })
  .filter((file) => file.endsWith(".html"))
  .map((file) => `/${file.replaceAll("\\", "/").replace(/(index)?\.html$/, "")}`)
  .sort();
