import { site } from "./site";

/** The site's languages, also their hreflang: French at the root, English under /en.
 *  The tagline and description are a page's defaults in that language; the
 *  anchors are the home page's sections the header links to; the App Store
 *  link opens the French store, or the visitor's own one in English. */
export const locales = {
  fr: {
    og: "fr_FR",
    home: "/",
    anchors: { features: "fonctionnalites", watches: "montres" },
    appStore: site.appStore,
    tagline: site.tagline,
    description: site.description,
  },
  en: {
    og: "en_US",
    home: "/en",
    anchors: { features: "features", watches: "watches" },
    appStore: site.appStoreAnyCountry,
    tagline: "Move a little, every day.",
    description: "Foulée is the iPhone, Apple Watch and Garmin app that turns today's walk or run into a streak you won't want to break.",
  },
} as const;

export type Locale = keyof typeof locales;

export const defaultLocale: Locale = "fr";

/** The language of the page being built, from `Astro.currentLocale`. */
export function pageLocale(current: string | undefined): Locale {
  return current && current in locales ? (current as Locale) : defaultLocale;
}

/**
 * The pages published in both languages, French address → English address.
 * Add a pair when the English page ships: the hreflang links, og:locale and
 * the sitemap follow, and `npm test` checks both pages exist.
 */
export const translations: Record<string, string> = {
  "/": "/en",
  "/assistance": "/en/support",
  "/assistance/garmin": "/en/support/garmin",
  "/confidentialite": "/en/privacy",
  "/mentions-legales": "/en/legal-notice",
};

/** A French page's address in `locale`: its translation, or the French page itself while it has none. */
export function localePath(path: string, locale: Locale): string {
  return locale === "en" ? (translations[path] ?? path) : path;
}

/** The page in each language it is published in, its own included; empty when it has no translation. */
export function alternates(path: string): { locale: Locale; path: string }[] {
  const french = Object.entries(translations).find(([fr, en]) => path === fr || path === en);
  return french ? [{ locale: "fr", path: french[0] }, { locale: "en", path: french[1] }] : [];
}
