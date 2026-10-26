# getfoulee.app

The marketing site of [Foulée](https://github.com/getfoulee/foulee), the iPhone, Apple Watch and Garmin app that keeps a daily walking and running streak going.

Static [Astro](https://astro.build) site, French only like the app, hosted on Cloudflare.

## Run locally

Node 22.12 or later.

```sh
npm install
npm run dev       # http://localhost:4321
npm run build     # static site in dist/
npm run preview   # serve dist/
```

## Layout

```
src/
├── pages/            # One file per page: /, /assistance, /assistance/garmin, /confidentialite, /mentions-legales, 404
├── components/       # The phone and watch mockups, store buttons, icons, header, footer
├── layouts/          # Base (head, meta, scroll reveal) and Prose (long-form pages)
├── content/          # Copies of the app's privacy policy and Garmin FAQ
├── lib/site.ts       # Every outside link: App Store, Connect IQ, GitHub, contact
└── styles/global.css # The app's palette and type, as CSS tokens
public/               # Icons, social card, _headers, robots.txt
assets/app-icon.png   # Source of the generated icons
```

The visuals are the app's own screens redrawn in HTML and CSS, with the colors of its design system (`Foulee/DesignSystem` in the app repo): the accent gradient, the dark wallpaper, the glass cards, the rings.

## Content kept in sync with the app

The app repository is the source of truth:

- `src/content/privacy.md` is `docs/privacy.md`;
- `src/content/faq-garmin.md` is `docs/faq-garmin.md`, with its link to the policy pointing at `/confidentialite`.

Copy them again when they change in the app.

## Icons and social card

`npm run assets` regenerates the favicons, the touch icon and `public/og.png` (1200 × 630) from `assets/app-icon.png`. The outputs are committed.

## Deploy

Cloudflare Workers & Pages builds every push to `main`: build command `npm run build`, output directory `dist`. `public/_headers` sets the security headers and the long cache on `/_astro/*`.
