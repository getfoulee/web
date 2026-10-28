/** The press kit in each language: what /presse and /en/press show and what their archives hold. */
import { site } from "./site";
import type { Locale } from "./i18n";

/** The icons, the same in both kits. Files in public/presse/, made by `npm run assets`. */
const icons = {
  fr: [
    { file: "foulee-icone.png", title: "Icône", detail: "PNG, 1024 × 1024, carrée", preview: "/apercus/icone.webp", wide: false },
    { file: "foulee-icone-arrondie.png", title: "Icône arrondie", detail: "PNG, 1024 × 1024, fond transparent", preview: "/apercus/icone.webp", wide: false },
  ],
  en: [
    { file: "foulee-icone.png", title: "Icon", detail: "PNG, 1024 × 1024, square", preview: "/apercus/icone.webp", wide: false },
    { file: "foulee-icone-arrondie.png", title: "Rounded icon", detail: "PNG, 1024 × 1024, transparent background", preview: "/apercus/icone.webp", wide: false },
  ],
};

export const press = {
  fr: {
    facts: [
      { term: "Prix", detail: "Gratuite, sur l'App Store comme sur Connect IQ." },
      {
        term: "Appareils",
        detail: `iPhone (iOS ${site.minimumOS} ou plus récent), Apple Watch (watchOS ${site.minimumOS} ou plus récent) et montres Garmin, avec l'app Connect IQ.`,
      },
      { term: "Compte", detail: "Aucun. Pas de serveur non plus : les données restent sur l'iPhone, la montre et dans l'app Santé." },
      { term: "Code", detail: "Ouvert, sous licence MIT, sur GitHub." },
      { term: "Langues", detail: "Français et anglais." },
      { term: "Origine", detail: "Conçue et développée en France." },
    ],
    texts: [
      {
        title: "En une phrase",
        paragraphs: [
          "Foulée est une app gratuite pour iPhone, Apple Watch et Garmin qui transforme la marche ou la course du jour en une série qu'on n'a plus envie de casser.",
        ],
      },
      {
        title: "En un paragraphe",
        paragraphs: [
          "Foulée est une app gratuite pour iPhone, Apple Watch et Garmin qui aide à bouger un peu chaque jour. On fixe un objectif de pas et de minutes d'activité, Foulée prévient juste avant le créneau choisi, et chaque journée réussie fait grandir la série. Elle suit la sortie jusqu'au poignet, reconnaît la marche et la course et les enregistre chacune dans Santé. Sans compte ni serveur : les données restent sur les appareils, et le code est ouvert.",
        ],
      },
      {
        title: "En détail",
        paragraphs: [
          "Foulée est une app gratuite pour iPhone et Apple Watch, avec une app Connect IQ pour les montres Garmin. Son idée tient en une phrase : bouger un peu, chaque jour. On fixe un objectif de pas et de minutes d'activité ; chaque jour où il est atteint allonge la série, et le record attend au tournant. Un rappel arrive juste avant le créneau choisi, puis l'app laisse tranquille.",
          "Pendant une sortie, Foulée reconnaît quand on passe de la marche à la course, et l'inverse : Santé reçoit une marche et une course, chacune sous le bon sport. Une sortie lancée sur l'Apple Watch s'affiche sur l'iPhone avec son parcours, et l'inverse aussi ; une Live Activity garde l'essentiel sur l'écran verrouillé. Sur une Garmin, l'app Connect IQ affiche la série, la met sur le cadran, lance les sorties et les envoie à l'iPhone.",
          "Le Bilan fait le point sur la semaine ou le mois : minutes, pas, distance, jours réussis et écart avec la période d'avant, sur douze mois. Il se partage en image, au format carré ou story, sans rien qui dise où ni quand on sort. Foulée suit aussi l'hydratation, un verre par tape.",
          "Foulée n'a ni compte ni serveur : elle lit et écrit dans l'app Santé d'Apple, et rien ne quitte les appareils pour un serveur de Foulée. Son code est ouvert, sous licence MIT. L'app parle français et anglais ; elle est conçue et développée en France.",
        ],
      },
    ],
    visuals: [
      ...icons.fr,
      { file: "foulee-visuel-sombre.png", title: "Visuel, thème sombre", detail: "PNG, 2400 × 1260", preview: "/apercus/visuel-dark.webp", wide: true },
      { file: "foulee-visuel-clair.png", title: "Visuel, thème clair", detail: "PNG, 2400 × 1260", preview: "/apercus/visuel-light.webp", wide: true },
    ],
    /** The archive of the whole kit, written into presse/ at build time. */
    archive: { name: "foulee-kit-presse", textFile: "foulee-textes.md" },
    heading: "kit presse",
    contact: "Contact presse",
    factsTitle: "Faits clés",
  },
  en: {
    facts: [
      { term: "Price", detail: "Free, on the App Store and on Connect IQ." },
      {
        term: "Devices",
        detail: `iPhone (iOS ${site.minimumOS} or later), Apple Watch (watchOS ${site.minimumOS} or later) and Garmin watches, with the Connect IQ app.`,
      },
      { term: "Account", detail: "None. No server either: the data stays on the iPhone, the watch and in Apple Health." },
      { term: "Code", detail: "Open source, under the MIT license, on GitHub." },
      { term: "Languages", detail: "English and French." },
      { term: "Origin", detail: "Designed and built in France." },
    ],
    texts: [
      {
        title: "In one sentence",
        paragraphs: [
          "Foulée is a free app for iPhone, Apple Watch and Garmin that turns today's walk or run into a streak you won't want to break.",
        ],
      },
      {
        title: "In one paragraph",
        paragraphs: [
          "Foulée is a free app for iPhone, Apple Watch and Garmin that helps you move a little every day. You set a goal for steps and active minutes, Foulée nudges you just before the time slot you picked, and every day you complete makes the streak grow. It tracks the workout right to your wrist, recognizes walking and running and saves each one in Apple Health. No account and no server: the data stays on the devices, and the code is open source.",
        ],
      },
      {
        title: "In detail",
        paragraphs: [
          "Foulée is a free app for iPhone and Apple Watch, with a Connect IQ app for Garmin watches. Its idea fits in one sentence: move a little, every day. You set a goal for steps and active minutes; every day you reach it makes the streak longer, and the record is waiting. A reminder arrives just before the time slot you picked, then the app leaves you alone.",
          "During a workout, Foulée notices when you switch from walking to running, and back: Apple Health gets a walk and a run, each under the right sport. A workout started on the Apple Watch shows up on the iPhone with its route, and the other way round too; a Live Activity keeps the essentials on the Lock Screen. On a Garmin, the Connect IQ app shows the streak, puts it on the watch face, starts workouts and sends them to the iPhone.",
          "The Recap sums up the week or the month: minutes, steps, distance, days completed and how they compare with the period before, over twelve months. It can be shared as an image, square or story, with nothing that says where or when you go out. Foulée also tracks hydration, one glass per tap.",
          "Foulée has no account and no server: it reads and writes in Apple's Health app, and nothing leaves the devices for a Foulée server. Its code is open source, under the MIT license. The app speaks English and French; it is designed and built in France.",
        ],
      },
    ],
    visuals: [
      ...icons.en,
      { file: "foulee-visual-dark.png", title: "Visual, dark theme", detail: "PNG, 2400 × 1260", preview: "/apercus/visual-dark.webp", wide: true },
      { file: "foulee-visual-light.png", title: "Visual, light theme", detail: "PNG, 2400 × 1260", preview: "/apercus/visual-light.webp", wide: true },
    ],
    archive: { name: "foulee-press-kit", textFile: "foulee-texts.md" },
    heading: "press kit",
    contact: "Press contact",
    factsTitle: "Key facts",
  },
} satisfies Record<Locale, unknown>;

/** The texts and facts of the kit in `locale` as one Markdown file, for its archive. */
export function textsMarkdown(locale: Locale): string {
  const { facts, texts, heading, contact, factsTitle } = press[locale];
  const separator = locale === "fr" ? " :" : ":";
  const lines = [`# ${site.name}${separator} ${heading}`, "", site.url, "", `## ${factsTitle}`, ""];
  for (const fact of facts) lines.push(`- **${fact.term}**${separator} ${fact.detail}`);
  for (const text of texts) lines.push("", `## ${text.title}`, "", text.paragraphs.join("\n\n"));
  lines.push("", `## ${contact}`, "", site.email, "");
  return lines.join("\n");
}
