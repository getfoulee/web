import data from "../content/releases.json";

const date = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

/** The app's versions, newest first, with their date written out: « 27 octobre 2026 ». */
export const releases = data.map((release) => ({ ...release, day: date.format(new Date(release.date)) }));

/** The newest version, which the home page points to. */
export const latest = releases[0];
