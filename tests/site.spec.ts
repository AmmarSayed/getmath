import { globSync } from "node:fs";
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const origin = "http://127.0.0.1:4321";
const base = "/getmath/";

// Every page in the build is tested, so one that skips the metadata schema
// cannot be published without its label.
const pages = globSync("**/*.html", { cwd: "dist" }).map((file) =>
  file.replaceAll("\\", "/").replace(/(^|\/)index\.html$/, "$1"),
);

test("the build has pages", () => {
  expect(pages).toContain("");
});

for (const path of pages) {
  test.describe(`${base}${path}`, () => {
    test("is labelled as a technical test", async ({ page }) => {
      await page.goto(path || "./");
      const label = page.getByText("Technical test, not a lesson", { exact: true });
      await expect(label).toBeVisible();
    });

    test("asks search engines not to index it", async ({ page }) => {
      await page.goto(path || "./");
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex");
    });

    test("has working internal links and assets, under the base path", async ({ page, request }) => {
      await page.goto(path || "./");
      const links = await page
        .locator("[href], [src]")
        .evaluateAll((elements) =>
          elements.map((element) => {
            const attribute = element.getAttribute("href") ?? element.getAttribute("src") ?? "";
            return { tag: element.tagName, url: new URL(attribute, document.baseURI).href };
          }),
        );
      expect(links.length).toBeGreaterThan(0);
      for (const { tag, url } of links) {
        const { origin: linkOrigin, pathname, hash } = new URL(url);
        if (tag === "A" && linkOrigin !== origin) continue;
        expect(url, `${tag} stays on the site`).toContain(origin + base);
        const response = await request.get(url);
        expect(response.status(), url).toBe(200);
        if (hash) {
          expect(await response.text(), `${pathname} has ${hash}`).toContain(`id="${hash.slice(1)}"`);
        }
      }
    });

    test("loads only its own files, and all of them", async ({ page }) => {
      const requests: string[] = [];
      const failures: string[] = [];
      page.on("request", (sent) => requests.push(sent.url()));
      page.on("requestfailed", (sent) => failures.push(sent.url()));
      page.on("response", (received) => {
        if (!received.ok()) failures.push(`${received.status()} ${received.url()}`);
      });
      await page.goto(path || "./", { waitUntil: "networkidle" });
      expect(requests).toContain(origin + base + path);
      expect(requests.filter((url) => !url.startsWith(origin + base))).toEqual([]);
      expect(failures).toEqual([]);
    });

    test("has no axe-core violations", async ({ page }) => {
      await page.goto(path || "./");
      const { violations } = await new AxeBuilder({ page }).analyze();
      expect(violations).toEqual([]);
    });
  });
}
