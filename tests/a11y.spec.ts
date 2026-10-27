// axe on every page of the build, and the keyboard paths a visitor relies on:
// the skip link, the theme switch and the FAQ. Each test runs once per theme
// (the projects in playwright.config.ts).
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Locator, type Page } from "@playwright/test";
import { pages } from "./pages";


for (const path of pages) {
  test(`axe: ${path}`, async ({ page }) => {
    await page.goto(path);
    // With reduced motion every reveal is shown at once; axe skips what is hidden.
    const hidden = await page.$$eval("[data-reveal]", (elements) => elements.filter((element) => getComputedStyle(element).opacity !== "1").length);
    expect(hidden, "elements still hidden by a reveal").toBe(0);
    const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"]).analyze();
    const report = violations.map((violation) => `${violation.id}: ${violation.help}\n${violation.nodes.map((node) => `  ${node.target.join(" ")}`).join("\n")}`);
    expect(report, report.join("\n")).toEqual([]);
  });
}

/** Presses Tab until `target` has the focus, as a keyboard visitor would. */
async function tabTo(page: Page, target: Locator) {
  for (let presses = 0; presses < 40; presses++) {
    await page.keyboard.press("Tab");
    if (await target.evaluate((element) => element === document.activeElement)) return;
  }
  throw new Error("not reachable with Tab");
}

test("the skip link is the first stop and jumps past the header", async ({ page }) => {
  await page.goto("/");
  const skip = page.locator(".skip");
  await page.keyboard.press("Tab");
  await expect(skip).toBeFocused();
  await expect(skip).toBeInViewport();

  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#contenu$/);
  await page.keyboard.press("Tab");
  await expect(page.locator("main :focus")).toHaveCount(1);
});

test("the theme switch works from the keyboard", async ({ page }) => {
  await page.goto("/");
  const toggle = page.locator(".theme-toggle");
  await tabTo(page, toggle);
  await expect(toggle).not.toHaveCSS("outline-style", "none");

  // Chromium can report the old body background just after the switch, while
  // the tokens on <html> already changed: poll it.
  const background = () => page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  const before = await background();
  await page.keyboard.press("Enter");
  await expect.poll(background).not.toBe(before);
  await page.keyboard.press("Space");
  await expect.poll(background).toBe(before);
});

test("the FAQ opens and closes from the keyboard", async ({ page }) => {
  await page.goto("/assistance");
  const question = page.locator(".faq summary").first();
  const answer = page.locator(".faq details").first();
  await tabTo(page, question);
  await expect(question).not.toHaveCSS("outline-style", "none");

  await page.keyboard.press("Enter");
  await expect(answer).toHaveAttribute("open");
  await page.keyboard.press("Space");
  await expect(answer).not.toHaveAttribute("open");
});
