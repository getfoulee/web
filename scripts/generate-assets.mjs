// Builds the icons and the social card in public/ from the app icon in
// assets/. Run with `npm run assets` after the icon changes; the outputs are
// committed so a build never needs this.
import sharp from "sharp";

const icon = "assets/app-icon.png";
const out = (name) => `public/${name}`;

/** The icon with iOS-like rounded corners, for places that don't round it. */
async function rounded(size) {
  const radius = Math.round(size * 0.225);
  const mask = Buffer.from(`<svg width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${radius}" ry="${radius}"/></svg>`);
  return sharp(icon)
    .resize(size, size)
    .composite([{ input: mask, blend: "dest-in" }])
    .png()
    .toBuffer();
}

await sharp(await rounded(128)).toFile(out("app-icon-128.png"));
await sharp(await rounded(512)).toFile(out("app-icon-512.png"));
await sharp(await rounded(64)).toFile(out("favicon.png"));
await sharp(icon).resize(180, 180).png().toFile(out("apple-touch-icon.png"));

const width = 1200;
const height = 630;
const background = Buffer.from(`
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="a" cx="15%" cy="10%" r="70%"><stop offset="0" stop-color="#4a1380"/><stop offset="1" stop-color="#07040e" stop-opacity="0"/></radialGradient>
    <radialGradient id="b" cx="95%" cy="90%" r="60%"><stop offset="0" stop-color="#5a1450"/><stop offset="1" stop-color="#07040e" stop-opacity="0"/></radialGradient>
    <linearGradient id="t" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#d97aff"/><stop offset="0.5" stop-color="#bf5af2"/><stop offset="1" stop-color="#7c3aed"/></linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="#07040e"/>
  <rect width="100%" height="100%" fill="url(#a)"/>
  <rect width="100%" height="100%" fill="url(#b)"/>
  <text x="80" y="300" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="92" font-weight="800" fill="#f7f3ff" letter-spacing="-3">Bouge un peu,</text>
  <text x="80" y="400" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="92" font-weight="800" fill="url(#t)" letter-spacing="-3">chaque jour.</text>
  <text x="80" y="480" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="32" fill="#ebe4ff" fill-opacity="0.7">Foulée · iPhone, Apple Watch et Garmin</text>
  <text x="80" y="560" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="26" font-weight="600" fill="#d97aff">getfoulee.app</text>
</svg>`);

await sharp(background)
  .composite([{ input: await rounded(300), left: 830, top: 165 }])
  .png()
  .toFile(out("og.png"));

console.log("Assets written to public/");
