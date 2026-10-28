// Builds the icons and the press kit in public/ from the app icon in assets/.
// Run with `npm run assets` after the icon changes; the outputs are committed
// so a build never needs this. The build draws each page's share card itself.
import { mkdir, writeFile } from "node:fs/promises";
import sharp from "sharp";
import { rounded, shareCard } from "../src/lib/share-card.mjs";

const icon = "assets/app-icon.png";
const out = (name) => `public/${name}`;

await sharp(await rounded(128)).toFile(out("app-icon-128.png"));
await sharp(await rounded(512)).toFile(out("app-icon-512.png"));
await sharp(await rounded(64)).toFile(out("favicon.png"));
await sharp(icon).resize(180, 180).png().toFile(out("apple-touch-icon.png"));

/** The home page's card in each language, with its tagline, and the names of its files. */
const cards = [
  { locale: "fr", title: "Bouge un peu, chaque jour.", address: "getfoulee.app", kit: { dark: "visuel-sombre", light: "visuel-clair" }, preview: "visuel" },
  { locale: "en", title: "Move a little, every day.", address: "getfoulee.app/en", kit: { dark: "visual-dark", light: "visual-light" }, preview: "visual" },
];

// The press kits on /presse and /en/press: the icon as Apple ships it (square,
// the store rounds it) and rounded, and the card at twice the size in both themes.
await mkdir(out("presse"), { recursive: true });
await sharp(icon).resize(1024, 1024).png().toFile(out("presse/foulee-icone.png"));
await sharp(await rounded(1024)).toFile(out("presse/foulee-icone-arrondie.png"));
// Light previews for the pages, kept out of presse/ so the kit stays the kit.
await mkdir(out("apercus"), { recursive: true });
for (const { kit, preview, ...card } of cards) {
  for (const theme of ["dark", "light"]) {
    await writeFile(out(`presse/foulee-${kit[theme]}.png`), await shareCard({ ...card, theme, scale: 2 }));
    await sharp(await shareCard({ ...card, theme })).resize(800).webp().toFile(out(`apercus/${preview}-${theme}.webp`));
  }
}
await sharp(await rounded(320)).webp().toFile(out("apercus/icone.webp"));

console.log("Assets written to public/");
