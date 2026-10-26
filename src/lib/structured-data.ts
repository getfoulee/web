import { site } from "./site";

/** Who publishes the site, on every page; the app points back to it. */
export const organization = {
  "@type": "Organization",
  "@id": `${site.url}/#organization`,
  name: site.name,
  url: site.url,
  logo: `${site.url}/app-icon-512.png`,
  email: site.email,
};

/** The app as the App Store lists it: free, on iPhone and Apple Watch. No rating until the store shows one. */
export const mobileApplication = {
  "@type": "MobileApplication",
  name: site.name,
  description: site.description,
  url: site.url,
  installUrl: site.appStore,
  image: `${site.url}/app-icon-512.png`,
  operatingSystem: `iOS ${site.minimumOS}, watchOS ${site.minimumOS}`,
  applicationCategory: "HealthApplication",
  inLanguage: "fr",
  offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
  publisher: { "@id": organization["@id"] },
};

/** A FAQ page from its questions and plain-text answers. */
export function faqPage(items: readonly { question: string; answer: string }[]) {
  return {
    "@type": "FAQPage",
    mainEntity: items.map(({ question, answer }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer },
    })),
  };
}
