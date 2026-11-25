import { expect, type Locator } from "@playwright/test";

/** WebKit on Windows and on a Mac, as in Safari, gives a button no focus when it is clicked. */
export async function expectFocusAfterClick(button: Locator, browserName: string) {
  if (browserName === "webkit" && process.platform !== "linux") return;
  await expect(button).toBeFocused();
}

/** The block has the focus, and an arrow key scrolls it. */
export async function expectArrowKeyScrolls(block: Locator, browserName: string) {
  await expect(block).toBeFocused();
  // Playwright's WebKit on a Mac does not scroll it. Whether Safari does is not tested.
  if (browserName === "webkit" && process.platform === "darwin") return;
  await block.press("ArrowRight");
  await expect.poll(() => block.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);
}
