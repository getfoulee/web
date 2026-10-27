// Accessibility checks of the built site (tests/), in light and in dark. The
// pages are served from dist/ by `astro preview`: run `npm run build` first.
import { defineConfig, devices } from "@playwright/test";

const port = 4322;
const baseURL = `http://localhost:${port}`;

export default defineConfig({
  testDir: "tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
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
    command: `npm run preview -- --port ${port}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
  },
});
