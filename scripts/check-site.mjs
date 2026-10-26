// Checks the built site in dist/: every page we publish is there, every
// internal link and asset it points to exists, and each page carries the
// metadata a share or a search needs. Run after `npm run build`.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const dist = "dist";
const pages = ["index.html", "assistance.html", "assistance/garmin.html", "confidentialite.html", "mentions-legales.html", "presse.html", "404.html"];
const failures = [];

function htmlFiles(directory) {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    if (statSync(path).isDirectory()) return htmlFiles(path);
    return name.endsWith(".html") ? [path] : [];
  });
}

/** `/assistance` is served from assistance.html, `/` from index.html. */
function resolves(target) {
  const path = decodeURIComponent(target.split(/[?#]/)[0]);
  if (path === "/") return existsSync(join(dist, "index.html"));
  const file = join(dist, path);
  return existsSync(file) || existsSync(`${file}.html`) || existsSync(join(file, "index.html"));
}

for (const page of pages) {
  if (!existsSync(join(dist, page))) failures.push(`missing page: ${page}`);
}

for (const file of htmlFiles(dist)) {
  const html = readFileSync(file, "utf8");
  const page = relative(dist, file);

  for (const [, target] of html.matchAll(/(?:href|src)="(\/[^"]*)"/g)) {
    if (!resolves(target)) failures.push(`${page}: broken link ${target}`);
  }

  for (const tag of ["<title>", 'name="description"', 'rel="canonical"', 'property="og:image"', '<html lang="fr"']) {
    if (!html.includes(tag)) failures.push(`${page}: missing ${tag}`);
  }
}

const home = readFileSync(join(dist, "index.html"), "utf8");
for (const store of ["apps.apple.com", "apps.garmin.com"]) {
  if (!home.includes(store)) failures.push(`index.html: no link to ${store}`);
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(`Site OK: ${htmlFiles(dist).length} pages, every internal link resolves.`);
