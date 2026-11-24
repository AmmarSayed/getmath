import { globSync } from "node:fs";
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

/** Turns files such as `a/index.html` and `a.mdx` into page paths such as `a/`. */
function pagePaths(files: string[]) {
  return files
    .map((file) => file.replaceAll("\\", "/").replace(/(\/?index)?\.(html|mdx)$/, "/").replace(/^\//, ""))
    .sort();
}

const pages = pagePaths(globSync("**/*.html", { cwd: "dist" }));

test("every built page comes from an MDX page with checked metadata", () => {
  expect(pages).toEqual(pagePaths(globSync("**/*.mdx", { cwd: "src/content/pages" })));
  expect(pages).toContain("");
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

    test("has no axe-core violations", async ({ page }) => {
      await page.goto(address);
      const { violations } = await new AxeBuilder({ page }).analyze();
      expect(violations).toEqual([]);
    });
  });
}
