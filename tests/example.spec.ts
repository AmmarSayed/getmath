import { existsSync, readFileSync } from "node:fs";
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { listen } from "./listen";
import { expectArrowKeyScrolls, expectFocusAfterClick } from "./webkit";
import { openPage } from "./open-page";

// The only source of the program and of its output.
const program = readFileSync("src/snippets/add-vectors.py", "utf8");
const expected = readFileSync("src/snippets/add-vectors.txt", "utf8");

const interaction = (page: Page) => page.locator('.interaction[data-example="add-vectors"]');
const run = (page: Page) => interaction(page).getByRole("button", { name: "Run" });
const reset = (page: Page) => interaction(page).getByRole("button", { name: "Reset" });
const shownProgram = (page: Page) => page.locator('pre[data-program="add-vectors"]');
const shownOutput = (page: Page) => page.locator('pre[data-output="add-vectors"]');
const status = (page: Page) => interaction(page).getByRole("status");
const sentence = "It was checked with real Python before this page was published. No code runs here.";

const ran = "The expected output is shown below. No code was run.";
const cleared = "The expected output is hidden.";

test.beforeEach(({ page, javaScriptEnabled }) => openPage(page, "", javaScriptEnabled));

test("the program on the page is the program in its file, and cannot be edited", async ({ page }) => {
  await expect(shownProgram(page)).toHaveText(program, { useInnerText: false });
  expect(await shownProgram(page).evaluate((element) => element.textContent)).toBe(program);
  const group = page.getByRole("group", { name: "Python program" });
  await expect(group).toBeVisible();
  await expect(group).toHaveAttribute("tabindex", "0");
  await expect(shownProgram(page).locator("input, textarea, select, [contenteditable]")).toHaveCount(0);
  expect(await shownProgram(page).evaluate((element) => (element as HTMLElement).isContentEditable)).toBe(false);
});

test("the output is nowhere before Run", async ({ page }) => {
  await expect(shownOutput(page)).toHaveCount(0);
  await expect(page.getByText("Expected output", { exact: true })).toHaveCount(0);
  await expect(page.locator("body")).not.toContainText("[4, 3]");
  expect(await interaction(page).evaluate((element) => element.outerHTML)).not.toContain("[4, 3]");
  await expect(page.locator(".still:has([data-output])")).toHaveCount(0);
  await expect(run(page)).toBeEnabled();
  await expect(reset(page)).toBeEnabled();
});

async function expectRevealed(page: Page) {
  const output = shownOutput(page);
  await expect(output).toBeVisible();
  // Compared with the file, and with the number written out in this test.
  expect(await output.evaluate((element) => element.textContent)).toBe(expected);
  expect(await output.evaluate((element) => element.textContent)).toBe("[4, 3]\n");
  await expect(page.getByRole("group", { name: "Expected output" })).toHaveText("[4, 3]");
  await expect(output).toHaveAttribute("tabindex", "0");
  await expect(page.getByText("Expected output", { exact: true })).toBeVisible();
  await expect(page.getByText(sentence)).toBeVisible();
  // Right after the buttons.
  const buttons = (await run(page).boundingBox())!;
  expect((await output.boundingBox())!.y).toBeGreaterThanOrEqual(buttons.y + buttons.height);
}

test("Run by mouse shows the expected output, and keeps the focus", async ({ page, browserName }) => {
  await run(page).click();
  await expectRevealed(page);
  await expectFocusAfterClick(run(page), browserName);
  await expect(status(page)).toHaveText(ran);
  await reset(page).click();
  await expect(shownOutput(page)).toHaveCount(0);
  await expectFocusAfterClick(reset(page), browserName);
  await expect(status(page)).toHaveText(cleared);
  await expect(page.getByText("Expected output", { exact: true })).toHaveCount(0);
});

for (const key of ["Enter", "Space"]) {
  test(`Run and Reset work from the keyboard with ${key}`, async ({ page }) => {
    await run(page).focus();
    await page.keyboard.press(key);
    await expectRevealed(page);
    await expect(run(page)).toBeFocused();
    await expect(status(page)).toHaveText(ran);
    // The next button is Reset.
    await reset(page).focus();
    await page.keyboard.press(key);
    await expect(shownOutput(page)).toHaveCount(0);
    await expect(reset(page)).toBeFocused();
    await expect(status(page)).toHaveText(cleared);
  });
}

test("the order of the keyboard is Run, Reset, then the output", async ({ page, browserName }) => {
  // Safari's own setting decides whether Tab reaches buttons; the Option key always does.
  const tab = browserName === "webkit" ? "Alt+Tab" : "Tab";
  await run(page).focus();
  await page.keyboard.press("Enter");
  await page.keyboard.press(tab);
  await expect(reset(page)).toBeFocused();
  await page.keyboard.press(tab);
  await expect(shownOutput(page)).toBeFocused();
  expect(await shownOutput(page).evaluate((element) => getComputedStyle(element).outlineStyle)).not.toBe("none");
});

test("each press is announced, the same words again, and nothing else changes", async ({ page }) => {
  const spoken = await listen(page);
  await run(page).click();
  await run(page).click();
  await reset(page).click();
  await reset(page).click();
  await expect.poll(spoken).toEqual([ran, ran, cleared, cleared]);
  await expect(shownOutput(page)).toHaveCount(0);
  await run(page).click();
  await run(page).click();
  await expect(shownOutput(page)).toHaveCount(1);
  await expectRevealed(page);
});

test("running needs no request and loads no Python", async ({ page }) => {
  const requests: string[] = [];
  page.on("request", (sent) => requests.push(sent.url()));
  const resources = () => page.evaluate(() => performance.getEntriesByType("resource").length);
  const before = await resources();
  await run(page).click();
  await expectRevealed(page);
  await reset(page).click();
  await run(page).click();
  await page.evaluate(() => new Promise((done) => setTimeout(done, 300)));
  expect(requests).toEqual([]);
  expect(await resources()).toBe(before);
  expect(await page.evaluate(() => "loadPyodide" in window || "pyodide" in window)).toBe(false);
});

const colab = "https://colab.research.google.com/github/AmmarSayed/getmath/blob/main/notebooks/add-vectors.ipynb";
const notebookLink = (page: Page) => page.getByRole("link", { name: "open the same program in a Colab notebook" });

test("the notebook link is derived from the example, and says what Colab is", async ({ page }) => {
  await expect(notebookLink(page)).toBeVisible();
  await expect(notebookLink(page)).toHaveAttribute("href", colab);
  const paragraph = page.locator("p.notebook");
  await expect(paragraph).toContainText("outside service");
  await expect(paragraph).toContainText("only online");
  await expect(paragraph).toContainText("Google account");
  await expect(paragraph).toContainText("works fully without it");
  expect(existsSync("notebooks/add-vectors.ipynb")).toBe(true);
  // No badge image.
  await expect(paragraph.locator("img")).toHaveCount(0);
});

test("nothing is requested from Colab, or prepared for it, until the link is followed", async ({ page, context }) => {
  const requests: string[] = [];
  context.on("request", (sent) => requests.push(sent.url()));
  await page.reload();
  await openPage(page, "", true);
  await run(page).click();
  await reset(page).click();
  await notebookLink(page).focus();
  await notebookLink(page).hover();
  await page.evaluate(() => new Promise((done) => setTimeout(done, 300)));
  expect(requests.filter((url) => /google|colab/.test(new URL(url).hostname))).toEqual([]);
  expect(await page.locator('link[rel~="preconnect"], link[rel~="prefetch"], link[rel~="dns-prefetch"], link[rel~="prerender"]').count()).toBe(0);
  await expect(notebookLink(page)).not.toHaveAttribute("rel", /prefetch|preconnect/);
});

test.describe("the notebook link without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("is shown, and leads to the same notebook", async ({ page }) => {
    await page.goto("./");
    await expect(notebookLink(page)).toBeVisible();
    await expect(notebookLink(page)).toHaveAttribute("href", colab);
  });
});

for (const colorScheme of ["light", "dark"] as const) {
  test(`has no axe-core violations with the output shown, in the ${colorScheme} theme`, async ({ page }) => {
    await page.emulateMedia({ colorScheme });
    await run(page).click();
    await expectRevealed(page);
    const { violations } = await new AxeBuilder({ page }).analyze();
    expect(violations).toEqual([]);
  });
}

test("buttons are large enough targets", async ({ page }) => {
  await run(page).click();
  for (const button of [run(page), reset(page)]) {
    const { width, height } = (await button.boundingBox())!;
    expect(Math.min(width, height)).toBeGreaterThanOrEqual(44);
  }
});

for (const colorScheme of ["light", "dark"] as const) {
  test(`the program and the output can be seen in forced ${colorScheme} colours`, async ({ page, browserName }) => {
    test.skip(browserName === "webkit", "Playwright's WebKit has no forced colours");
    await page.emulateMedia({ colorScheme, forcedColors: "active" });
    await run(page).click();
    for (const block of [shownProgram(page), shownOutput(page)]) {
      const look = await block.evaluate((element) => {
        const { color, borderTopStyle, borderTopWidth } = getComputedStyle(element);
        return { color, border: borderTopStyle !== "none" && parseFloat(borderTopWidth) >= 1 };
      });
      const paper = await page.evaluate(() => getComputedStyle(document.documentElement).backgroundColor);
      expect(look.color).not.toBe(paper);
      expect(look.border).toBe(true);
    }
  });
}

for (const width of [320, 1280]) {
  test(`nothing is cut off and the page does not scroll sideways at ${width} px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await run(page).click();
    await expectRevealed(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    for (const block of [shownProgram(page), shownOutput(page)]) {
      const { x, width: wide } = (await block.boundingBox())!;
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x + wide).toBeLessThanOrEqual(width);
      expect(await block.evaluate((element) => parseFloat(getComputedStyle(element).fontSize))).toBeGreaterThanOrEqual(16);
    }
  });
}

test("a long line scrolls inside the block, which the keyboard can reach", async ({ page, browserName }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await run(page).click();
  await shownOutput(page).evaluate((element) => {
    element.querySelector("samp")!.textContent = "[" + "1234567890, ".repeat(20) + "0]";
  });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
  expect(await shownOutput(page).evaluate((element) => element.scrollWidth > element.clientWidth)).toBe(true);
  await shownOutput(page).focus();
  await expectArrowKeyScrolls(shownOutput(page), browserName);
});

test("if the scripts fail to load, the buttons are off and a link leads to the output", async ({ page }) => {
  await page.route("**/*.js", (route) => route.abort());
  await page.goto("./");
  await expect(page.getByText("The buttons are not working.")).toBeHidden();
  await expect(shownOutput(page)).toBeHidden();
  await expect(run(page)).toBeDisabled();
  await expect(reset(page)).toBeDisabled();
  await page.getByRole("link", { name: "See the expected output" }).click({ timeout: 10_000 });
  await expectRevealed(page);
});

test("an output that the link shows stays when the scripts start late", async ({ page }) => {
  let release = () => {};
  const released = new Promise<void>((resolve) => (release = resolve));
  await page.route("**/*.js", async (route) => {
    await released;
    await route.continue();
  });
  await page.goto("./", { waitUntil: "commit" });
  await page.getByRole("link", { name: "See the expected output" }).click({ timeout: 10_000 });
  await expectRevealed(page);
  release();
  await expect(run(page)).toBeEnabled();
  await expectRevealed(page);
  await reset(page).click();
  await expect(shownOutput(page)).toHaveCount(0);
});

for (const width of [320, 1280]) {
  test(`nothing is cut off with wider text spacing at ${width} px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    // The spacing that WCAG 1.4.12 names.
    const spacing = "line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important;";
    await page.addStyleTag({ content: `.code, .code *, .interaction * { ${spacing} } .interaction p { margin-bottom: 2em !important; }` });
    await run(page).click();
    await expectRevealed(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    const cutOff = await interaction(page).locator(":is(p:not(.announcement), button)").evaluateAll((elements) =>
      elements
        .filter((element) => element.scrollWidth > element.clientWidth + 1 || element.scrollHeight > element.clientHeight + 1)
        .map((element) => element.outerHTML),
    );
    expect(cutOff).toEqual([]);
    for (const button of [run(page), reset(page)]) {
      const { width: wide, height } = (await button.boundingBox())!;
      expect(Math.min(wide, height)).toBeGreaterThanOrEqual(44);
    }
    // A line that is too long now scrolls, up and down nothing does.
    for (const block of [shownProgram(page), shownOutput(page)]) {
      const look = await block.evaluate((element) => ({
        overflow: getComputedStyle(element).overflowX,
        down: element.scrollHeight - element.clientHeight,
      }));
      expect(look.overflow).toBe("auto");
      expect(look.down).toBeLessThanOrEqual(1);
    }
  });
}

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("the labelled output is shown, and the buttons are not", async ({ page }) => {
    await expect(shownProgram(page)).toBeVisible();
    await expect(shownOutput(page)).toBeVisible();
    expect(await shownOutput(page).evaluate((element) => element.textContent)).toBe(expected);
    await expect(page.getByRole("group", { name: "Expected output" })).toBeVisible();
    await expect(page.getByText(sentence)).toBeVisible();
    await expect(run(page)).toBeHidden();
    await expect(reset(page)).toBeHidden();
  });
});
