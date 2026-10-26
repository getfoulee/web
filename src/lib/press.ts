/** The press kit: what /presse shows and what its archive holds. */
import { site } from "./site";

export const facts = [
  { term: "Prix", detail: "Gratuite, sur l'App Store comme sur Connect IQ." },
  {
    term: "Appareils",
    detail: `iPhone (iOS ${site.minimumOS} ou plus récent), Apple Watch (watchOS ${site.minimumOS} ou plus récent) et montres Garmin, avec l'app Connect IQ.`,
  },
  { term: "Compte", detail: "Aucun. Pas de serveur non plus : les données restent sur l'iPhone, la montre et dans l'app Santé." },
  { term: "Code", detail: "Ouvert, sous licence MIT, sur GitHub." },
  { term: "Langue", detail: "Français." },
  { term: "Origine", detail: "Conçue et développée en France." },
];

export const texts = [
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
      "Foulée n'a ni compte ni serveur : elle lit et écrit dans l'app Santé d'Apple, et rien ne quitte les appareils pour un serveur de Foulée. Son code est ouvert, sous licence MIT. L'app est en français, conçue et développée en France.",
    ],
  },
];

/** Files in public/presse/, made by `npm run assets`. */
export const visuals = [
  { file: "foulee-icone.png", title: "Icône", detail: "PNG, 1024 × 1024, carrée", preview: "/apercus/icone.webp", wide: false },
  { file: "foulee-icone-arrondie.png", title: "Icône arrondie", detail: "PNG, 1024 × 1024, fond transparent", preview: "/apercus/icone.webp", wide: false },
  { file: "foulee-visuel-sombre.png", title: "Visuel, thème sombre", detail: "PNG, 2400 × 1260", preview: "/apercus/visuel-dark.webp", wide: true },
  { file: "foulee-visuel-clair.png", title: "Visuel, thème clair", detail: "PNG, 2400 × 1260", preview: "/apercus/visuel-light.webp", wide: true },
] as const;

/** The archive of the whole kit, written into presse/ at build time. */
export const archive = { name: "foulee-kit-presse", textFile: "foulee-textes.md" };

/** The texts and facts as one Markdown file, for the archive. */
export function textsMarkdown(): string {
  const lines = [`# ${site.name} : kit presse`, "", site.url, "", "## Faits clés", ""];
  for (const fact of facts) lines.push(`- **${fact.term}** : ${fact.detail}`);
  for (const text of texts) lines.push("", `## ${text.title}`, "", text.paragraphs.join("\n\n"));
  lines.push("", "## Contact presse", "", site.email, "");
  return lines.join("\n");
}
