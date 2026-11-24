import { expect, type Locator } from "@playwright/test";

/** WebKit on a Mac, as in Safari, gives a button no focus when it is clicked. */
export const onMacWebkit = (browserName: string) => browserName === "webkit" && process.platform === "darwin";

export async function expectFocusAfterClick(button: Locator, browserName: string) {
  if (!onMacWebkit(browserName)) await expect(button).toBeFocused();
}

/** The block has the focus, and an arrow key scrolls it. */
export async function expectArrowKeyScrolls(block: Locator, browserName: string) {
  await expect(block).toBeFocused();
  // Playwright's WebKit on a Mac does not scroll it. Whether Safari does is not tested.
  if (onMacWebkit(browserName)) return;
  await block.press("ArrowRight");
  await expect.poll(() => block.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);
}
