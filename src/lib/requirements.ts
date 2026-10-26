import { site } from "./site";

/** Used when the App Store can't be reached at build time. */
const fallbackMajor = 26;

/**
 * The oldest iOS the published app runs on, read from the App Store when the
 * site is built, so the site follows the app when its minimum moves. watchOS
 * shares iOS's version number since 26.
 */
async function minimumMajor(): Promise<number> {
  try {
    const response = await fetch(`https://itunes.apple.com/lookup?id=${site.appStoreId}&country=fr`);
    const { results } = (await response.json()) as { results: { minimumOsVersion?: string }[] };
    const major = Number.parseInt(results[0]?.minimumOsVersion ?? "", 10);
    return Number.isFinite(major) ? major : fallbackMajor;
  } catch {
    return fallbackMajor;
  }
}

const major = await minimumMajor();

export const requirements = {
  ios: `iOS ${major}`,
  watchOS: `watchOS ${major}`,
};
