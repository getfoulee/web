import data from "../content/releases.json";
import type { Locale } from "./i18n";

/** The app's versions with notes in `locale`, newest first, with their date written out: « 27 octobre 2026 », « October 27, 2026 ». */
export function releases(locale: Locale) {
  const date = new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
  return data
    .filter((release) => release.highlights[locale].length > 0)
    .map((release) => ({ ...release, highlights: release.highlights[locale], day: date.format(new Date(release.date)) }));
}

/** The newest version with notes in `locale`, which the home page points to. */
export const latest = (locale: Locale) => releases(locale).at(0);
