/** The site's languages, also their hreflang: French at the root, English under /en. */
export const locales = {
  fr: { og: "fr_FR" },
  en: { og: "en_US" },
} as const;

export type Locale = keyof typeof locales;

export const defaultLocale: Locale = "fr";

/**
 * The pages published in both languages, French address → English address.
 * Add a pair when the English page ships: the hreflang links, og:locale and
 * the sitemap follow, and `npm test` checks both pages exist.
 */
export const translations: Record<string, string> = {};

/** The page in each language it is published in, its own included; empty when it has no translation. */
export function alternates(path: string): { locale: Locale; path: string }[] {
  const french = Object.entries(translations).find(([fr, en]) => path === fr || path === en);
  return french ? [{ locale: "fr", path: french[0] }, { locale: "en", path: french[1] }] : [];
}
