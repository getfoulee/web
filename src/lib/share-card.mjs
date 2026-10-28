// The share card: the brand visual with a title, the platforms and the page's
// address, as a 1200 × 630 PNG. The build draws one per page (see
// src/integrations/share-images.ts); `npm run assets` draws the press kit's.
import sharp from "sharp";

const icon = "assets/app-icon.png";

/** The icon with iOS-like rounded corners, for places that don't round it.
 *  @param {number} size */
export async function rounded(size) {
  const radius = Math.round(size * 0.225);
  const mask = Buffer.from(`<svg width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${radius}" ry="${radius}"/></svg>`);
  return sharp(icon)
    .resize(size, size)
    .composite([{ input: mask, blend: "dest-in" }])
    .png()
    .toBuffer();
}

/** The two themes of the card. Copies of global.css tokens (--bg, --text,
 *  --blob-2, --accent-text, the accent gradient; light --blob-1), except the
 *  dark blob1, kept as the card has always drawn it. */
const themes = {
  dark: { bg: "#07040e", blob1: "#4a1380", blob2: "#5a1450", text: "#f7f3ff", sub: "#ebe4ff", link: "#d97aff", gradient: ["#d97aff", "#bf5af2", "#7c3aed"] },
  light: { bg: "#fbf7ff", blob1: "#f7d6ff", blob2: "#ffe6f3", text: "#1d1233", sub: "#1d1233", link: "#7c3aed", gradient: ["#bf5af2", "#7c3aed", "#5e5ce6"] },
};

/** The line under the title, in the page's language. */
const platforms = {
  fr: "Foulée · iPhone, Apple Watch et Garmin",
  en: "Foulée · iPhone, Apple Watch and Garmin",
};

/** Title sizes from largest down, with the characters a line holds left of the icon. */
const sizes = [
  { size: 92, chars: 14 },
  { size: 76, chars: 17 },
  { size: 64, chars: 20 },
];

/** `text` cut into lines of at most `chars` characters, between words.
 *  @param {string} text @param {number} chars */
function wrap(text, chars) {
  const lines = [];
  for (const word of text.split(/\s+/)) {
    const last = lines.at(-1);
    if (last !== undefined && `${last} ${word}`.length <= chars) lines[lines.length - 1] = `${last} ${word}`;
    else lines.push(word);
  }
  return lines;
}

/** @param {string} text */
const escape = (text) => text.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);

/** The card for `title` and the page at `address` (getfoulee.app/…), drawn at
 *  `scale`, as PNG, in `locale`. The last line of the title takes the accent gradient.
 *  @param {{ title: string, address: string, theme?: "dark" | "light", scale?: number, locale?: "fr" | "en" }} card */
export async function shareCard({ title, address, theme = "dark", scale = 1, locale = "fr" }) {
  const c = themes[theme];
  const fit = sizes.find(({ chars }) => wrap(title, chars).length <= 2) ?? sizes.at(-1);
  const lines = wrap(title, fit.chars);
  const leading = Math.round(fit.size * 1.09);
  const font = `font-family="Segoe UI, Helvetica, Arial, sans-serif"`;
  const titleLines = lines
    .map((line, index) => {
      const y = 400 - (lines.length - 1 - index) * leading;
      const fill = index === lines.length - 1 ? "url(#t)" : c.text;
      return `<text x="80" y="${y}" ${font} font-size="${fit.size}" font-weight="800" fill="${fill}" letter-spacing="-3">${escape(line)}</text>`;
    })
    .join("\n  ");

  const background = Buffer.from(`
<svg width="${1200 * scale}" height="${630 * scale}" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="a" cx="15%" cy="10%" r="70%"><stop offset="0" stop-color="${c.blob1}"/><stop offset="1" stop-color="${c.bg}" stop-opacity="0"/></radialGradient>
    <radialGradient id="b" cx="95%" cy="90%" r="60%"><stop offset="0" stop-color="${c.blob2}"/><stop offset="1" stop-color="${c.bg}" stop-opacity="0"/></radialGradient>
    <linearGradient id="t" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c.gradient[0]}"/><stop offset="0.5" stop-color="${c.gradient[1]}"/><stop offset="1" stop-color="${c.gradient[2]}"/></linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="${c.bg}"/>
  <rect width="100%" height="100%" fill="url(#a)"/>
  <rect width="100%" height="100%" fill="url(#b)"/>
  ${titleLines}
  <text x="80" y="480" ${font} font-size="32" fill="${c.sub}" fill-opacity="0.7">${platforms[locale]}</text>
  <text x="80" y="560" ${font} font-size="26" font-weight="600" fill="${c.link}">${escape(address)}</text>
</svg>`);

  return sharp(background)
    .composite([{ input: await rounded(300 * scale), left: 830 * scale, top: 165 * scale }])
    .png()
    .toBuffer();
}
