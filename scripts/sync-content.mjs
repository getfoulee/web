// Copies the app's documents that the site shows into src/content/, from a
// checkout of getfoulee/foulee (`../foulee` by default, or the path given as
// the first argument). Links between the app's documents become the site's
// addresses. Prints each file that changed; the sync workflow turns a change
// into a pull request.
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const app = process.argv[2] ?? "../foulee";

/** File in the app → copy in the site, with the links to rewrite. */
const copies = [
  { from: "docs/privacy.md", to: "src/content/privacy.md" },
  { from: "docs/faq-garmin.md", to: "src/content/faq-garmin.md", links: { "privacy.md": "/confidentialite" } },
];

for (const { from, to, links = {} } of copies) {
  let text = readFileSync(join(app, from), "utf8");
  for (const [link, address] of Object.entries(links)) {
    text = text.replaceAll(`](${link})`, `](${address})`);
  }
  const unmapped = text.match(/\]\((?!https?:|\/|#)[^)]*\.md\)/);
  if (unmapped) throw new Error(`${from} links to another document with no address on the site: ${unmapped[0]}`);
  // Compare without line endings: a Windows checkout turns LF into CRLF.
  if (readFileSync(to, "utf8").replaceAll("\r\n", "\n") === text) continue;
  writeFileSync(to, text);
  console.log(`${to} ← ${from}`);
}
