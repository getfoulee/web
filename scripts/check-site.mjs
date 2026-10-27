// Checks the built site in dist/: every page we publish is there, every
// internal link and asset it points to exists, and each page carries the
// metadata a share or a search needs. Run after `npm run build`.
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { address, htmlFiles } from "./pages.mjs";
import { inlineScriptHashes, policyLine } from "../src/lib/csp.mjs";

const dist = "dist";
const pages = [
  "index.html",
  "assistance.html",
  "assistance/garmin.html",
  "confidentialite.html",
  "mentions-legales.html",
  "presse.html",
  "apple-watch.html",
  "garmin.html",
  "nouveautes.html",
  "404.html",
  "en.html",
  "en/support.html",
  "en/support/garmin.html",
  "en/privacy.html",
  "en/legal-notice.html",
  "en/404.html",
];
const failures = [];
const analytics = process.env.ANALYTICS === "true";
const headers = readFileSync(join(dist, "_headers"), "utf8");
const policy = policyLine(headers);
const scriptSources = policy?.match(/script-src ([^;]*)/)?.[1].split(/\s+/) ?? [];
if (!policy) failures.push("_headers: no Content-Security-Policy");
for (const directive of ["default-src 'self'", "object-src 'none'", "base-uri 'none'", "frame-ancestors 'none'"]) {
  if (policy && !policy.includes(directive)) failures.push(`_headers: Content-Security-Policy without ${directive}`);
}
if (scriptSources.some((source) => source.includes("unsafe"))) failures.push("_headers: script-src allows unsafe scripts");

/** `/assistance` is served from assistance.html, `/` from index.html. */
function resolves(target) {
  const path = decodeURIComponent(target.split(/[?#]/)[0]);
  if (path === "/") return existsSync(join(dist, "index.html"));
  const file = join(dist, path);
  return existsSync(file) || existsSync(`${file}.html`) || existsSync(join(file, "index.html"));
}

const jsonLd = new Map();
/** Share image → the pages that point to it: one image per page. */
const shareImages = new Map();
/** Page address → its hreflang links, language → address. */
const hreflang = new Map();

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

for (const page of htmlFiles) {
  const html = readFileSync(join(dist, page), "utf8");

  for (const [, target] of html.matchAll(/(?:href|src)="(\/[^"]*)"/g)) {
    if (!resolves(target)) failures.push(`${page}: broken link ${target}`);
  }

  for (const [, set] of html.matchAll(/srcset="([^"]*)"/g)) {
    for (const target of set.split(",").map((candidate) => candidate.trim().split(/\s+/)[0])) {
      if (target.startsWith("/") && !resolves(target)) failures.push(`${page}: broken image ${target}`);
    }
  }

  for (const tag of ["<title>", 'name="description"', 'rel="canonical"', 'property="og:image"', 'data-scheme="light"', 'data-scheme="dark"']) {
    if (!html.includes(tag)) failures.push(`${page}: missing ${tag}`);
  }

  // French at the root, English under /en, each with its own language tags.
  const locale = /^en[/.]/.test(page) ? "en" : "fr";
  if (!html.includes(`<html lang="${locale}"`)) failures.push(`${page}: missing <html lang="${locale}"`);
  if (!html.includes(`<meta property="og:locale" content="${locale === "en" ? "en_US" : "fr_FR"}">`)) failures.push(`${page}: og:locale is not ${locale}`);
  const languages = new Map([...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="https:\/\/getfoulee\.app(\/[^"]*)">/g)].map(([, lang, path]) => [lang, path]));
  if (languages.size > 0) hreflang.set(address(page).replace(/(.)\/$/, "$1"), languages);
  else if (locale === "en" && !page.endsWith("404.html")) failures.push(`${page}: English page without hreflang links to its French page`);

  // The language switch, in the header and the footer, keeps the page: its translation, or the other language's home.
  const other = locale === "en" ? "fr" : "en";
  const target = languages.get(other) ?? (other === "en" ? "/en" : "/");
  const switches = [...html.matchAll(/<a [^>]*href="([^"]*)" hreflang="([^"]+)"[^>]*data-language-switch/g)];
  if (switches.length !== 2) failures.push(`${page}: ${switches.length} language switches instead of 2`);
  for (const [, href, lang] of switches) {
    if (href !== target || lang !== other) failures.push(`${page}: language switch leads to ${href} (${lang}) instead of ${target} (${other})`);
  }

  // The canonical address is the one Cloudflare serves, without .html.
  const canonical = `https://getfoulee.app${address(page)}`;
  if (!html.includes(`<link rel="canonical" href="${canonical}">`)) failures.push(`${page}: canonical is not ${canonical}`);

  // Its own share card, a 1200 × 630 PNG (width and height from the IHDR chunk).
  const image = html.match(/<meta property="og:image" content="https:\/\/getfoulee\.app(\/[^"]+\.png)"/)?.[1];
  if (!image || !existsSync(join(dist, image))) {
    failures.push(`${page}: share image ${image ?? "missing"} not built`);
  } else {
    const png = readFileSync(join(dist, image));
    if (png.readUInt32BE(16) !== 1200 || png.readUInt32BE(20) !== 630) failures.push(`${page}: share image ${image} is not 1200 × 630`);
  }
  shareImages.set(image, [...(shareImages.get(image) ?? []), page]);

  for (const [, json] of html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)) {
    try {
      structuredData(page).push(JSON.parse(json));
    } catch {
      failures.push(`${page}: invalid JSON-LD`);
    }
  }
  requireData(page, "Organization", ["name", "url", "logo"]);

  // Every script the page runs inline is allowed by its hash, and only those.
  for (const hash of inlineScriptHashes(html)) {
    if (!scriptSources.includes(hash)) failures.push(`${page}: inline script ${hash} not in the Content-Security-Policy`);
  }

  // The audience beacon ships with the production build only.
  if (html.includes("cloudflareinsights.com") !== analytics) failures.push(`${page}: analytics beacon ${analytics ? "missing" : "outside production"}`);
}

// Each translation points back: the French and English pages list the same pair.
for (const [path, languages] of hreflang) {
  if (!["fr", "en", "x-default"].every((lang) => languages.has(lang))) failures.push(`${path}: hreflang without fr, en and x-default`);
  if (languages.get("x-default") !== languages.get("fr")) failures.push(`${path}: x-default is not the French page`);
  if (![...languages.values()].includes(path)) failures.push(`${path}: hreflang links leave out the page itself`);
  for (const [lang, target] of languages) {
    const back = hreflang.get(target);
    if (!back) failures.push(`${path}: hreflang ${lang} points to ${target}, which does not link back`);
    else if ([...languages].some(([key, value]) => back.get(key) !== value)) failures.push(`${path} and ${target}: hreflang links differ`);
  }
}

for (const [image, sharing] of shareImages) {
  if (image && sharing.length > 1) failures.push(`${sharing.join(", ")}: same share image ${image}`);
}

// The home page in each language, with Apple's badge in that language.
for (const [page, appStoreBadge] of [
  ["index.html", "/badges/app-store.svg"],
  ["en.html", "/badges/app-store-en.svg"],
]) {
  const home = readFileSync(join(dist, page), "utf8");
  for (const store of ["apps.apple.com", "apps.garmin.com"]) {
    if (!home.includes(store)) failures.push(`${page}: no link to ${store}`);
  }
  const app = requireData(page, "MobileApplication", ["name", "operatingSystem", "applicationCategory", "offers"]);
  if (app && app.offers.price !== "0") failures.push(`${page}: MobileApplication is not free`);

  // The watch pages are reached from the home page, not only from the footer.
  for (const watch of ["/apple-watch", "/garmin"]) {
    if (!home.includes(`class="read-more" href="${watch}"`)) failures.push(`${page}: no link to ${watch} in the watches section`);
  }

  // The official store badges, App Store first as Apple asks.
  const badges = [appStoreBadge, "/badges/connect-iq.svg"].map((badge) => home.indexOf(`src="${badge}"`));
  if (badges.includes(-1) || badges[0] > badges[1]) failures.push(`${page}: official store badges missing or out of order`);
}

// One structured question per question shown, each with its answer, in each language.
for (const page of ["assistance.html", "en/support.html"]) {
  const faq = requireData(page, "FAQPage", ["mainEntity"]);
  const shown = readFileSync(join(dist, page), "utf8").match(/<details/g)?.length ?? 0;
  if (faq && (faq.mainEntity.length !== shown || faq.mainEntity.some((item) => !item.name || !item.acceptedAnswer?.text))) {
    failures.push(`${page}: FAQPage does not match the questions on the page`);
  }
}

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

// Search engines index getfoulee.app only: the pages.dev hosts say noindex.
const rules = new Map(
  headers
    .split(/\n\s*\n/)
    .map((block) => block.split("\n").filter((line) => line.trim() && !line.startsWith("#")))
    .filter((lines) => lines.length > 0)
    .map(([pattern, ...headers]) => [pattern.trim(), headers.map((header) => header.trim())]),
);
for (const host of ["https://:project.pages.dev/*", "https://:version.:project.pages.dev/*"]) {
  if (!rules.get(host)?.includes("X-Robots-Tag: noindex")) failures.push(`_headers: ${host} is not noindex`);
}
for (const [pattern, headers] of rules) {
  if (!pattern.includes("pages.dev") && headers.some((header) => header.startsWith("X-Robots-Tag"))) failures.push(`_headers: ${pattern} hides getfoulee.app from search engines`);
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(`Site OK: ${htmlFiles.length} pages, every internal link resolves.`);
