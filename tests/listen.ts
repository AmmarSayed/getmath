import type { Page } from "@playwright/test";

/** Notes what a screen reader speaks from now on: texts in live regions, and new values of the control with the focus. */
export async function listen(page: Page) {
  await page.evaluate(() => {
    const spoken: string[] = [];
    Object.assign(window, { spoken });
    for (const region of document.querySelectorAll("[role=status], [role=alert], [role=log], output, [aria-live]")) {
      new MutationObserver(() => {
        if (region.textContent) spoken.push(region.textContent);
      }).observe(region, { childList: true, subtree: true, characterData: true });
    }
    for (const slider of document.querySelectorAll("[role=slider]")) {
      new MutationObserver(() => {
        if (slider === document.activeElement) spoken.push(slider.ariaValueText!);
      }).observe(slider, { attributeFilter: ["aria-valuetext", "aria-valuenow"] });
    }
  });
  return () => page.evaluate(() => (window as unknown as { spoken: string[] }).spoken);
}
