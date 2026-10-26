// Downloads the iPhone screenshots of the App Store listing into public/captures/
// as WebP, at the two widths the home page serves. Run with `npm run screenshots`
// after a new set ships on the store; the outputs are committed so a build never
// needs the network. Each file is named after the store's own file name without
// its number (01-bouge.png → bouge-300.webp), the names src/lib/screenshots.ts uses.
import { mkdir, rm } from "node:fs/promises";
import sharp from "sharp";

const appStoreId = "6774594192"; // site.appStoreId in src/lib/site.ts
const widths = [300, 600];
const folder = "public/captures";

const lookup = await fetch(`https://itunes.apple.com/lookup?id=${appStoreId}&country=fr`);
if (!lookup.ok) throw new Error(`App Store lookup failed: ${lookup.status}`);
const urls = (await lookup.json()).results?.[0]?.screenshotUrls;
if (!urls?.length) throw new Error("The App Store listing has no iPhone screenshots");

await rm(folder, { recursive: true, force: true });
await mkdir(folder, { recursive: true });

const names = [];
for (const url of urls) {
  // The listing gives a thumbnail; the same path with a larger size serves the original.
  const name = url.split("/").at(-2).replace(/^\d+-/, "").replace(/\.png$/, "");
  const image = await fetch(url.replace(/\/[^/]+$/, "/9999x9999bb.png"));
  if (!image.ok) throw new Error(`Download failed for ${name}: ${image.status}`);
  const original = Buffer.from(await image.arrayBuffer());
  for (const width of widths) {
    await sharp(original).resize(width).webp({ quality: 82 }).toFile(`${folder}/${name}-${width}.webp`);
  }
  names.push(name);
}

console.log(`Screenshots written to ${folder}/, in store order: ${names.join(", ")}`);
