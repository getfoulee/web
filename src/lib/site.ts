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
  /** The same listing without a country: Apple opens the visitor's own store. */
  appStoreAnyCountry: "https://apps.apple.com/app/id6774594192",
  /** App Store Connect's provider token, the same in every campaign link. */
  appStoreProvider: "119685869",
  connectIQ: "https://apps.garmin.com/apps/8c11aa2c-7fc7-4e3d-8441-b2771626cbc7",
  repository: "https://github.com/getfoulee/foulee",
  issues: "https://github.com/getfoulee/foulee/issues/new",
  releases: "https://github.com/getfoulee/foulee/releases",
  garminFAQ: "https://github.com/getfoulee/foulee/blob/main/docs/faq-garmin.md",
  email: "contact@getfoulee.app",
  /** The site's host, named in the legal notice. */
  host: "https://www.cloudflare.com",
  /** Cloudflare Web Analytics: cookieless, loaded on production builds only. */
  analytics: {
    beacon: "https://static.cloudflareinsights.com/beacon.min.js",
    token: "b9063e7d935c463aa4888d37c83e4686",
  },
} as const;

/** The App Store buttons, each its own campaign in App Store Connect › Analytics › Sources. */
export type Campaign = "hero" | "cta" | "header" | "footer" | "press" | "watch" | "garmin" | "link";

/** A store link that tells App Store Connect which button brought the visitor. */
export function campaignLink(store: string, campaign: Campaign): string {
  return `${store}?pt=${site.appStoreProvider}&ct=site-${campaign}&mt=8`;
}
