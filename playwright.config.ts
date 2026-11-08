// Accessibility checks and reference screenshots of the built site (tests/), in
// light and in dark. The pages are served from dist/ by `astro preview`: run
// `npm run build` first.
import { defineConfig, devices } from "@playwright/test";

const port = 4322;
const baseURL = `http://localhost:${port}`;

export default defineConfig({
  testDir: "tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
  // One reference per theme, with no platform suffix: the references are the
  // Linux rendering of CI, which fonts and anti-aliasing make differ elsewhere.
  snapshotPathTemplate: "{testDir}/__screenshots__/{projectName}/{arg}{ext}",
  use: {
    ...devices["Desktop Chrome"],
    baseURL,
    // Scroll reveals show their final state at once, so every element is checked.
    reducedMotion: "reduce",
  },
  projects: [
    { name: "clair", use: { colorScheme: "light" } },
    { name: "sombre", use: { colorScheme: "dark" } },
  ],
  webServer: {
    // --ignore-lock: a one-off server Playwright owns, in the foreground even when
    // Astro detects an agent, which would otherwise start it in the background.
    command: `npm run preview -- --port ${port} --ignore-lock`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
  },
});
