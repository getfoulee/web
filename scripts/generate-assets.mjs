// Builds the icons, the social card and the press kit in public/ from the app icon in
// assets/. Run with `npm run assets` after the icon changes; the outputs are
// committed so a build never needs this.
import { mkdir, writeFile } from "node:fs/promises";
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

/** The two themes of the share card. Copies of global.css tokens (--bg,
 *  --text, --blob-2, --accent-text, the accent gradient; light --blob-1),
 *  except the dark blob1, kept as og.png has always drawn it. */
const themes = {
  dark: { bg: "#07040e", blob1: "#4a1380", blob2: "#5a1450", text: "#f7f3ff", sub: "#ebe4ff", link: "#d97aff", gradient: ["#d97aff", "#bf5af2", "#7c3aed"] },
  light: { bg: "#fbf7ff", blob1: "#f7d6ff", blob2: "#ffe6f3", text: "#1d1233", sub: "#1d1233", link: "#7c3aed", gradient: ["#bf5af2", "#7c3aed", "#5e5ce6"] },
};

/** The 1200 × 630 card with the tagline and the icon, drawn at `scale`, as PNG. */
async function shareCard(theme, scale = 1) {
  const c = themes[theme];
  const width = 1200 * scale;
  const height = 630 * scale;
  const background = Buffer.from(`
<svg width="${width}" height="${height}" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="a" cx="15%" cy="10%" r="70%"><stop offset="0" stop-color="${c.blob1}"/><stop offset="1" stop-color="${c.bg}" stop-opacity="0"/></radialGradient>
    <radialGradient id="b" cx="95%" cy="90%" r="60%"><stop offset="0" stop-color="${c.blob2}"/><stop offset="1" stop-color="${c.bg}" stop-opacity="0"/></radialGradient>
    <linearGradient id="t" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c.gradient[0]}"/><stop offset="0.5" stop-color="${c.gradient[1]}"/><stop offset="1" stop-color="${c.gradient[2]}"/></linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="${c.bg}"/>
  <rect width="100%" height="100%" fill="url(#a)"/>
  <rect width="100%" height="100%" fill="url(#b)"/>
  <text x="80" y="300" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="92" font-weight="800" fill="${c.text}" letter-spacing="-3">Bouge un peu,</text>
  <text x="80" y="400" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="92" font-weight="800" fill="url(#t)" letter-spacing="-3">chaque jour.</text>
  <text x="80" y="480" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="32" fill="${c.sub}" fill-opacity="0.7">Foulée · iPhone, Apple Watch et Garmin</text>
  <text x="80" y="560" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="26" font-weight="600" fill="${c.link}">getfoulee.app</text>
</svg>`);

  return sharp(background)
    .composite([{ input: await rounded(300 * scale), left: 830 * scale, top: 165 * scale }])
    .png()
    .toBuffer();
}

const cards = { dark: await shareCard("dark"), light: await shareCard("light") };
await writeFile(out("og.png"), cards.dark);

// The press kit on /presse: the icon as Apple ships it (square, the store
// rounds it) and rounded, and the card at twice the size in both themes.
await mkdir(out("presse"), { recursive: true });
await sharp(icon).resize(1024, 1024).png().toFile(out("presse/foulee-icone.png"));
await sharp(await rounded(1024)).toFile(out("presse/foulee-icone-arrondie.png"));
await writeFile(out("presse/foulee-visuel-sombre.png"), await shareCard("dark", 2));
await writeFile(out("presse/foulee-visuel-clair.png"), await shareCard("light", 2));

// Light previews for the page, kept out of presse/ so the kit stays the kit.
await mkdir(out("apercus"), { recursive: true });
for (const [theme, card] of Object.entries(cards)) {
  await sharp(card).resize(800).webp().toFile(out(`apercus/visuel-${theme}.webp`));
}
await sharp(await rounded(320)).webp().toFile(out("apercus/icone.webp"));

console.log("Assets written to public/");
