/** Every address the site links to, in one place. */
export const site = {
  name: "Foulée",
  url: "https://getfoulee.app",
  tagline: "Bouge un peu, chaque jour.",
  description:
    "Foulée est l'app iPhone, Apple Watch et Garmin qui transforme ta marche ou ta course du jour en une série que tu n'as plus envie de casser.",
  appStoreId: "6774594192",
  /** The oldest iOS and watchOS the app runs on: they share a number since 26. */
  minimumOS: 26,
  appStore: "https://apps.apple.com/fr/app/foul%C3%A9e-marche-s%C3%A9rie/id6774594192",
  connectIQ: "https://apps.garmin.com/apps/8c11aa2c-7fc7-4e3d-8441-b2771626cbc7",
  repository: "https://github.com/getfoulee/foulee",
  issues: "https://github.com/getfoulee/foulee/issues/new",
  garminFAQ: "https://github.com/getfoulee/foulee/blob/main/docs/faq-garmin.md",
  email: "contact@getfoulee.app",
} as const;
