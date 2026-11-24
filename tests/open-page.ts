import { expect, type Page } from "@playwright/test";

/** Opens a page and waits for its fonts and its interactions. */
export async function openPage(page: Page, path = "", hasScript = true) {
  await page.goto(`./${path}`);
  if (!hasScript) return;
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
  await expect(page.locator("astro-island[ssr]")).toHaveCount(0);
}
