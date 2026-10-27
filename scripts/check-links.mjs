// Checks every outside address the built site in dist/ links to: the App
// Store, Connect IQ, GitHub, Apple and the rest. Prints one Markdown line per
// broken link, with the pages that carry it, and fails when there is one.
// Run after `npm run build`; the weekly links workflow turns a failure into an issue.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { address, htmlFiles } from "./pages.mjs";

const dist = "dist";
const own = "https://getfoulee.app";
const attempts = 3;

/** Outside address → the pages that link to it. */
const links = new Map();
for (const file of htmlFiles) {
  const page = address(file);
  for (const [, url] of readFileSync(join(dist, file), "utf8").matchAll(/(?:href|src)="(https?:\/\/[^"]+)"/g)) {
    if (url.startsWith(own)) continue;
    if (!links.has(url)) links.set(url, new Set());
    links.get(url).add(page);
  }
}

/** The address that tells whether a link works: Connect IQ answers 200 for any app id, its API does not. */
function probe(url) {
  const app = url.match(/^https:\/\/apps\.garmin\.com\/apps\/([0-9a-f-]+)$/)?.[1];
  return app ? `https://apps.garmin.com/api/appsLibraryExternalServices/api/asw/apps/${app}` : url;
}

/** null when the link works, else why it does not. Retries a network error or a 5xx. */
async function check(url) {
  let problem;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const response = await fetch(probe(url), {
        headers: { "user-agent": "Mozilla/5.0 (compatible; getfoulee.app link check)" },
        signal: AbortSignal.timeout(20_000),
      });
      if (response.ok) return null;
      problem = `HTTP ${response.status}`;
      if (response.status < 500 && response.status !== 429) return problem;
    } catch (error) {
      problem = error.cause?.code ?? error.message;
    }
    await new Promise((resolve) => setTimeout(resolve, attempt * 5_000));
  }
  return problem;
}

const results = await Promise.all([...links.keys()].map(async (url) => [url, await check(url)]));
const broken = results.filter(([, problem]) => problem);

for (const [url, problem] of broken) {
  console.log(`- ${url} (${problem}), sur ${[...links.get(url)].sort().join(", ")}`);
}
if (broken.length > 0) process.exit(1);
console.error(`${links.size} outside links checked, all reachable.`);
