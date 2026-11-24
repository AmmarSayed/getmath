import { globSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { expectArrowKeyScrolls } from "./mac";
import { openPage } from "./open-page";

/** Turns files such as `a/index.html` and `a.mdx` into page paths such as `a/`. */
function pagePaths(files: string[]) {
  return files
    .map((file) => file.replaceAll("\\", "/").replace(/\.(html|mdx)$/, "/").replace(/(^|\/)index\/$/, "$1"))
    .sort();
}

const pages = pagePaths(globSync("**/*.html", { cwd: "dist" }));

test("every built page comes from an MDX page with checked metadata", () => {
  expect(pages).toEqual(pagePaths(globSync("**/*.mdx", { cwd: "src/content/pages" })));
  expect(pages).toContain("");
});

test("every built file is served unchanged", async ({ request }) => {
  const files = globSync("**/*", { cwd: "dist", withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => relative("dist", join(entry.parentPath, entry.name)).replaceAll("\\", "/"));
  expect(files).toContain("index.html");
  for (const file of files) {
    const response = await request.get(`./${file}`);
    expect(response.status(), file).toBe(200);
    expect((await response.body()).equals(readFileSync(join("dist", file))), file).toBe(true);
  }
});

for (const path of pages) {
  test.describe(`page /${path}`, () => {
    const address = `./${path}`;

    test("is labelled as a technical test", async ({ page }) => {
      await page.goto(address);
      const label = page.getByText("Technical test, not a lesson", { exact: true });
      await expect(label).toBeVisible();
    });

    test("asks search engines not to index it", async ({ page }) => {
      await page.goto(address);
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex");
    });

    test("has working internal links and assets, under the base path", async ({ page, request, baseURL }) => {
      await page.goto(address);
      const links = await page.locator("[href], [src]").evaluateAll((elements) =>
        elements.map((element) => ({
          isLink: element.tagName.toLowerCase() === "a",
          url: new URL(element.getAttribute("href") ?? element.getAttribute("src")!, document.baseURI).href,
        })),
      );
      expect(links.length).toBeGreaterThan(0);
      for (const { isLink, url } of links) {
        const { origin, hash } = new URL(url);
        // A link may leave the site, but everything the page loads must not.
        if (isLink && origin !== new URL(baseURL!).origin) continue;
        expect(url, "stays under the base path").toContain(baseURL!);
        const response = await request.get(url);
        expect(response.status(), url).toBe(200);
        if (hash) {
          const found = await page.evaluate(
            ([html, id]) => new DOMParser().parseFromString(html, "text/html").getElementById(id) !== null,
            [await response.text(), decodeURIComponent(hash.slice(1))] as const,
          );
          expect(found, `${url} leads to a place on the page`).toBe(true);
        }
      }
    });

    test("loads only its own files, and all of them", async ({ page, context, baseURL }) => {
      const requests: string[] = [];
      const failures: string[] = [];
      context.on("request", (sent) => requests.push(sent.url()));
      context.on("requestfailed", (sent) => failures.push(sent.url()));
      context.on("response", (received) => {
        if (!received.ok()) failures.push(`${received.status()} ${received.url()}`);
      });
      await page.goto(address, { waitUntil: "networkidle" });
      expect(requests).toContain(baseURL + path);
      expect(requests.filter((url) => !url.startsWith(baseURL!))).toEqual([]);
      expect(failures).toEqual([]);
    });

    for (const colorScheme of ["light", "dark"] as const) {
      test(`has no axe-core violations in the ${colorScheme} theme`, async ({ page }) => {
        await page.emulateMedia({ colorScheme });
        await page.goto(address);
        const { violations } = await new AxeBuilder({ page }).analyze();
        expect(violations).toEqual([]);
      });
    }
  });
}

test.describe("formulas without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  // The formulas written in the page, without those of its interactions.
  const written = "main > :is(p, .formula)";

  test("are reachable as mathematics, and drawn once", async ({ page }) => {
    await page.goto("./");
    // The accessible form is MathML. The drawn form is hidden from assistive technology.
    const formulas = page.locator(written).getByRole("math");
    const count = await page.locator(written).locator(".katex").count();
    expect(count).toBeGreaterThanOrEqual(4);
    await expect(formulas).toHaveCount(count);
    await expect(formulas.nth(0).locator("mn")).toHaveText(["3", "4", "7"]);
    await expect(formulas.nth(1).locator("msqrt mfrac mn")).toHaveText(["9", "16"]);
    await expect(formulas.nth(2).locator("mtable")).toHaveCount(4);
    // The three on their own line are built as such.
    await expect(page.locator('main > .formula math[display="block"]')).toHaveCount(3);
    await expect(page.locator(written).locator(".katex-html")).toHaveCount(count);
    await expect(page.locator(".katex-html:not([aria-hidden=true])")).toHaveCount(0);
  });

  test("are drawn with styles and fonts that the site serves", async ({ page, baseURL }) => {
    const fonts: string[] = [];
    page.on("request", (sent) => {
      if (sent.resourceType() === "font") fonts.push(sent.url());
    });
    await page.goto("./");
    await expect(page.locator(".katex").first()).toHaveCSS("font-family", /KaTeX_Main/);
    await expect.poll(() => fonts.join()).toContain(`${baseURL}_astro/KaTeX_Main-Regular`);
  });
});

/**
 * Relative luminance, from 0 to 1, of the darkest and the lightest pixel shown
 * in part of the page.
 */
async function luminances(page: Page, clip: { x: number; y: number; width: number; height: number }) {
  const picture = (await page.screenshot({ clip, fullPage: true })).toString("base64");
  return page.evaluate(async (data) => {
    const image = new Image();
    image.src = `data:image/png;base64,${data}`;
    await image.decode();
    const canvas = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;
    const context = canvas.getContext("2d")!;
    context.drawImage(image, 0, 0);
    const { data: bytes } = context.getImageData(0, 0, image.width, image.height);
    let darkest = 1;
    let lightest = 0;
    for (let i = 0; i < bytes.length; i += 4) {
      const [red, green, blue] = [bytes[i], bytes[i + 1], bytes[i + 2]].map((byte) =>
        byte / 255 <= 0.04045 ? byte / 255 / 12.92 : ((byte / 255 + 0.055) / 1.055) ** 2.4,
      );
      const luminance = 0.2126 * red + 0.7152 * green + 0.0722 * blue;
      darkest = Math.min(darkest, luminance);
      lightest = Math.max(lightest, luminance);
    }
    return { darkest, lightest };
  }, picture);
}

// Parts of the sample page that browsers draw in different ways, such as letters,
// mathematics fonts, borders and SVG shapes.
const drawnParts = {
  text: "main > p",
  "formula digits": "main .katex-html .mord",
  "fraction bar": "main .frac-line",
  "matrix bracket": "main .delimcenter",
  "validation label": ".status",
  link: "header a",
  "root sign": "main .sqrt .hide-tail",
};

for (const forcedColors of ["none", "active"] as const) {
  for (const colorScheme of ["light", "dark"] as const) {
    const look = forcedColors === "active" ? `forced ${colorScheme} colours` : `the ${colorScheme} theme`;

    test(`text and formulas are visible in ${look}`, async ({ page, browserName }) => {
      test.skip(forcedColors === "active" && browserName === "webkit", "Playwright's WebKit has no forced colours");
      await page.emulateMedia({ colorScheme, forcedColors });
      await openPage(page);
      const emulated = await page.evaluate(
        (queries) => queries.map((query) => matchMedia(query).matches),
        [`(forced-colors: ${forcedColors})`, `(prefers-color-scheme: ${colorScheme})`],
      );
      expect(emulated).toEqual([true, true]);
      const { darkest, lightest } = await luminances(page, { x: 0, y: 0, width: 4, height: 4 });
      expect(lightest, "the background is plain").toBe(darkest);
      const background = darkest;
      // Forced colours come from the system, and Firefox's are light in both schemes.
      if (forcedColors === "none" && colorScheme === "light") expect(background).toBeGreaterThan(0.8);
      if (forcedColors === "none" && colorScheme === "dark") expect(background).toBeLessThan(0.05);
      for (const [name, selector] of Object.entries(drawnParts)) {
        const box = (await page.locator(selector).first().boundingBox())!;
        // Only the left of the root sign, which is its drawn shape and not the number under it.
        // Elsewhere a pixel more above and below, because a line one pixel high may be drawn beside its box.
        const clip = name === "root sign" ? { ...box, width: 12 } : { ...box, y: box.y - 1, height: box.height + 2 };
        const part = await luminances(page, clip);
        // Each part is compared with the background that it is drawn on.
        const contrast = (part.lightest + 0.05) / (part.darkest + 0.05);
        expect(contrast, name).toBeGreaterThan(4.5);
      }
    });
  }
}

// 1280 px at 400% zoom leaves 320 px, which is also the width of a small phone.
for (const width of [320, 390, 1280]) {
  for (const path of pages) {
    test(`page /${path} loses nothing and scrolls only wide formulas and code at ${width} px`, async ({ page }) => {
      await openPage(page, path);
      const content = () => page.evaluate(() => document.body.innerText.replace(/\s+/g, ""));
      const wideContent = await content();
      await page.setViewportSize({ width, height: 800 });
      expect(await content()).toBe(wideContent);

      // A phone keeps this width and size of text, instead of shrinking a wide page.
      await expect(page.locator('meta[name="viewport"]')).toHaveAttribute("content", /\bwidth=device-width\b/);
      for (const text of await page.locator("main :is(p, li, .katex, .code):visible").all()) {
        expect(await text.evaluate((element) => parseFloat(getComputedStyle(element).fontSize))).toBeGreaterThanOrEqual(16);
      }

      // The page itself does not scroll sideways, and nothing is cut off.
      const pageWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(pageWidth).toBeLessThanOrEqual(width);
      const outside = await page.locator("body *:visible").evaluateAll((elements) =>
        elements
          .filter((element) => !element.closest(".formula > *, .code > *") && !element.closest(".katex-mathml"))
          .filter((element) => {
            const { left, right } = element.getBoundingClientRect();
            return left < 0 || right > document.documentElement.clientWidth;
          })
          .map((element) => element.outerHTML.slice(0, 100)),
      );
      expect(outside).toEqual([]);

      // A formula on its own line scrolls only if its drawing is too wide, and then from its very start to its very end.
      for (const formula of await page.locator(".formula").all()) {
        const scrolled = await formula.evaluate((element) => {
          // Not a range over the drawing, because a root sign is a very long shape that is cut to size.
          const pieces = [...element.querySelectorAll(".katex-base")];
          const end = () => pieces.at(-1)!.getBoundingClientRect().right;
          const box = element.getBoundingClientRect();
          const drawing = element.querySelector(".katex-html")!.getBoundingClientRect();
          const drawnWidth = end() - pieces[0].getBoundingClientRect().left;
          element.scrollLeft = 0;
          const hiddenAtStart = box.left - pieces[0].getBoundingClientRect().left;
          element.scrollLeft = 1e6;
          return {
            drawnWidth,
            hiddenAtStart,
            hiddenAbove: box.top - drawing.top,
            hiddenBelow: drawing.bottom - box.bottom,
            tooWide: drawnWidth > element.clientWidth + 1,
            scrolls: element.scrollLeft > 0,
            hiddenAtEnd: end() - box.right,
            scrollsDown: element.scrollHeight > element.clientHeight,
          };
        });
        expect(scrolled.drawnWidth).toBeGreaterThan(0);
        expect(scrolled.scrolls).toBe(scrolled.tooWide);
        expect(scrolled.hiddenAtStart).toBeLessThanOrEqual(1);
        expect(scrolled.hiddenAbove).toBeLessThanOrEqual(0);
        expect(scrolled.hiddenBelow).toBeLessThanOrEqual(0);
        expect(scrolled.hiddenAtEnd).toBeLessThanOrEqual(1);
        expect(scrolled.scrollsDown).toBe(false);
      }
    });
  }
}

test("a wide formula can be scrolled with the keyboard", async ({ page, browserName }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("./");
  const formula = page.locator("main > .formula").last();
  for (let i = 0; i < 10 && !(await formula.evaluate((element) => element === document.activeElement)); i++) {
    await page.keyboard.press("Tab");
  }
  await expectArrowKeyScrolls(formula, browserName);
});
