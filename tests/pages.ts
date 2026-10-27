import { address, htmlFiles } from "../scripts/pages.mjs";

/** Every page in dist/, as the address it is served at: `/`, `/assistance/garmin`. */
export const pages = htmlFiles.map(address).sort();
