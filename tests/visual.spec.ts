// Reference screenshots of every page, at 375 px and 1440 px, once per theme
// (the projects in playwright.config.ts). A pixel that moves fails the run; the
// references are updated on purpose with `--update-snapshots` (see the README).
import { expect, test } from "@playwright/test";
import { pages } from "./pages";

const widths = [375, 1440];

for (const path of pages) {
  for (const width of widths) {
    test(`capture: ${path} at ${width} px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(path);
      // Lazy images below the fold would still be blank in a full-page capture.
      await page.$$eval("img", (images) => Promise.all(images.map((image) => ((image.loading = "eager"), image.decode().catch(() => {})))));
      await page.evaluate(() => document.fonts.ready);
      // A full-page capture resizes the window, which moves the page height by a
      // pixel or two between attempts: grow the window to the page until it holds.
      for (let height = 0, previous = -1; height !== previous; ) {
        previous = height;
        height = await page.evaluate(() => document.documentElement.scrollHeight);
        await page.setViewportSize({ width, height });
      }
      await expect(page).toHaveScreenshot(`${path === "/" ? "index" : path.slice(1).replaceAll("/", "-")}-${width}.png`, {
        // The year changes every January, not the design.
        mask: [page.locator("footer .fineprint")],
      });
    });
  }
}
