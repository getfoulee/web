// Copies the app's documents that the site shows into src/content/, from a
// checkout of getfoulee/foulee (`../foulee` by default, or the path given as
// the first argument). Links between the app's documents become the site's
// addresses. Also writes the app's GitHub releases to
// src/content/releases.json, for the « Nouveautés » page (GH_TOKEN, when set,
// lifts the API's rate limit). Prints each file that changed; the sync
// workflow turns a change into a pull request.
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const app = process.argv[2] ?? "../foulee";

/** File in the app → copy in the site, with the links to rewrite. */
const copies = [
  { from: "docs/privacy.md", to: "src/content/privacy.md" },
  { from: "docs/faq-garmin.md", to: "src/content/faq-garmin.md", links: { "privacy.md": "/confidentialite" } },
];

/** Writes the file when its content changed, and says so. */
function update(to, text, from) {
  // Compare without line endings: a Windows checkout turns LF into CRLF.
  if (readFileSync(to, "utf8").replaceAll("\r\n", "\n") === text) return;
  writeFileSync(to, text);
  console.log(`${to} ← ${from}`);
}

for (const { from, to, links = {} } of copies) {
  let text = readFileSync(join(app, from), "utf8");
  for (const [link, address] of Object.entries(links)) {
    text = text.replaceAll(`](${link})`, `](${address})`);
  }
  const unmapped = text.match(/\]\((?!https?:|\/|#)[^)]*\.md\)/);
  if (unmapped) throw new Error(`${from} links to another document with no address on the site: ${unmapped[0]}`);
  update(to, text, from);
}

/**
 * A release's notes as highlights: each line is `- **Title.** Text`, the
 * format the app's release workflow writes. Anything else stops the sync
 * rather than show half a note.
 */
function highlights(tag, body) {
  return body
    .split(/\r?\n/)
    .filter((line) => line.trim() !== "")
    .map((line) => {
      const match = line.match(/^- \*\*(.+?)\*\* (.+)$/);
      if (!match || /[*_`[\]<>]/.test(match[1] + match[2])) throw new Error(`${tag}: a note line the site cannot show: ${line}`);
      return { title: match[1], text: match[2] };
    });
}

const response = await fetch("https://api.github.com/repos/getfoulee/foulee/releases?per_page=100", {
  headers: { Accept: "application/vnd.github+json", ...(process.env.GH_TOKEN && { Authorization: `Bearer ${process.env.GH_TOKEN}` }) },
});
if (!response.ok) throw new Error(`GitHub releases: ${response.status} ${response.statusText}`);

// The app's versions only (`v1.55.0`): the Garmin packages have their own
// `garmin-v…` releases, with notes for the store, not for people.
const releases = (await response.json())
  .filter((release) => /^v\d+\.\d+\.\d+$/.test(release.tag_name) && !release.draft && !release.prerelease)
  .map((release) => ({
    version: release.tag_name.slice(1),
    date: release.published_at.slice(0, 10),
    highlights: highlights(release.tag_name, release.body ?? ""),
  }))
  .filter((release) => release.highlights.length > 0)
  .sort((a, b) => b.date.localeCompare(a.date));

update("src/content/releases.json", `${JSON.stringify(releases, null, 2)}\n`, "getfoulee/foulee releases");
