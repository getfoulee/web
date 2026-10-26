// Checks the built site in dist/: every page we publish is there, every
// internal link and asset it points to exists, and each page carries the
// metadata a share or a search needs. Run after `npm run build`.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const dist = "dist";
const pages = ["index.html", "assistance.html", "assistance/garmin.html", "confidentialite.html", "mentions-legales.html", "presse.html", "404.html"];
const failures = [];
const analytics = process.env.ANALYTICS === "true";

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

const jsonLd = new Map();

/** The JSON-LD objects found on a page so far. */
function structuredData(page) {
  if (!jsonLd.has(page)) jsonLd.set(page, []);
  return jsonLd.get(page);
}

/** A schema.org object of this type on the page, with every field filled; null when it fails. */
function requireData(page, type, fields) {
  const data = structuredData(page).find((item) => item["@type"] === type);
  const missing = data ? fields.filter((field) => [undefined, null, ""].includes(data[field])) : [];
  if (!data) failures.push(`${page}: no ${type} structured data`);
  else if (missing.length > 0) failures.push(`${page}: ${type} without ${missing.join(", ")}`);
  return data && missing.length === 0 ? data : null;
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

  for (const [, set] of html.matchAll(/srcset="([^"]*)"/g)) {
    for (const target of set.split(",").map((candidate) => candidate.trim().split(/\s+/)[0])) {
      if (target.startsWith("/") && !resolves(target)) failures.push(`${page}: broken image ${target}`);
    }
  }

  for (const tag of ["<title>", 'name="description"', 'rel="canonical"', 'property="og:image"', '<html lang="fr"']) {
    if (!html.includes(tag)) failures.push(`${page}: missing ${tag}`);
  }

  for (const [, json] of html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)) {
    try {
      structuredData(page).push(JSON.parse(json));
    } catch {
      failures.push(`${page}: invalid JSON-LD`);
    }
  }
  requireData(page, "Organization", ["name", "url", "logo"]);

  // The audience beacon ships with the production build only.
  if (html.includes("cloudflareinsights.com") !== analytics) failures.push(`${page}: analytics beacon ${analytics ? "missing" : "outside production"}`);
}

const home = readFileSync(join(dist, "index.html"), "utf8");
for (const store of ["apps.apple.com", "apps.garmin.com"]) {
  if (!home.includes(store)) failures.push(`index.html: no link to ${store}`);
}
const app = requireData("index.html", "MobileApplication", ["name", "operatingSystem", "applicationCategory", "offers"]);
if (app && app.offers.price !== "0") failures.push("index.html: MobileApplication is not free");

// One structured question per question shown, each with its answer.
const faq = requireData("assistance.html", "FAQPage", ["mainEntity"]);
const shown = readFileSync(join(dist, "assistance.html"), "utf8").match(/<details/g)?.length ?? 0;
if (faq && (faq.mainEntity.length !== shown || faq.mainEntity.some((item) => !item.name || !item.acceptedAnswer?.text))) {
  failures.push("assistance.html: FAQPage does not match the questions on the page");
}

// The official store badges, App Store first as Apple asks.
const badges = ["/badges/app-store.svg", "/badges/connect-iq.svg"].map((badge) => home.indexOf(`src="${badge}"`));
if (badges.includes(-1) || badges[0] > badges[1]) failures.push("index.html: official store badges missing or out of order");

/** The entry names of a zip, read from its central directory. */
function zipEntries(file) {
  const zip = readFileSync(file);
  const end = zip.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]));
  if (end < 0) return [];
  const names = [];
  let at = zip.readUInt32LE(end + 16);
  for (let i = 0; i < zip.readUInt16LE(end + 10); i++) {
    const length = zip.readUInt16LE(at + 28);
    names.push(zip.toString("utf8", at + 46, at + 46 + length));
    at += 46 + length + zip.readUInt16LE(at + 30) + zip.readUInt16LE(at + 32);
  }
  return names;
}

// The press kit archive holds every visual /presse offers, and the texts.
const press = readFileSync(join(dist, "presse.html"), "utf8");
const kit = press.match(/href="\/presse\/([^"]+)\.zip"/)?.[1];
if (!kit) {
  failures.push("presse.html: no link to the press kit archive");
} else if (existsSync(join(dist, "presse", `${kit}.zip`))) {
  const entries = zipEntries(join(dist, "presse", `${kit}.zip`));
  const expected = [...new Set([...press.matchAll(/href="\/presse\/([^"/]+\.png)"/g)].map(([, file]) => file)), "foulee-textes.md"];
  for (const file of expected) {
    if (!entries.includes(`${kit}/${file}`)) failures.push(`${kit}.zip: missing ${file}`);
  }
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(`Site OK: ${htmlFiles(dist).length} pages, every internal link resolves.`);
