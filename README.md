# getfoulee.app

The marketing site of [Foulée](https://github.com/getfoulee/foulee), the iPhone, Apple Watch and Garmin app that keeps a daily walking and running streak going.

Static [Astro](https://astro.build) site, French only like the app, hosted on Cloudflare. Light and dark themes, like the app: it follows the device, and the switch in the header overrides it (remembered in localStorage until it lands back on the device's theme).

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

## Icons and share cards

`npm run assets` regenerates the favicons, the touch icon and the press kit visuals from `assets/app-icon.png`. The outputs are committed.

Every build draws each page's share card (1200 × 630) in `dist/partage/`, from the page's title and address (`src/integrations/share-images.ts`). A new page gets its card with nothing to add.

## Checks

```sh
npm run check     # astro check: types and templates
npm run build
npm test          # the built site: every page present, every internal link resolves, metadata on each page
```

## Deploy

GitHub Actions (`.github/workflows/ci.yml`) runs the checks above on every push and pull request, then deploys `dist/` to the Cloudflare Pages project `getfoulee` with Wrangler:

- a push to `main` goes to production, getfoulee.app;
- a pull request gets a preview URL, shown in the run summary and on the `preview` environment.

The workflow needs two repository secrets: `CLOUDFLARE_API_TOKEN` (a token with the **Account › Cloudflare Pages › Edit** permission) and `CLOUDFLARE_ACCOUNT_ID`. The first run creates the Pages project; the custom domain `getfoulee.app` is attached once, by hand, in the project's **Custom domains** tab.

`public/_headers` sets the security headers and the long cache on `/_astro/*`.
