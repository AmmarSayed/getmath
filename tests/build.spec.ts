import { expect, test } from "@playwright/test";
import { buildWithPage } from "./build-with-page";

const withoutStatus = "title: Extra\ndescription: An extra page.";

test("a page with a valid status builds", async ({}, testInfo) => {
  const result = await buildWithPage(testInfo.outputPath("site"), `${withoutStatus}\nstatus: technical-test`);
  expect(result.output).toContain("/extra/index.html");
  expect(result.built).toBe(true);
});

test("a page without a status fails the build", async ({}, testInfo) => {
  const result = await buildWithPage(testInfo.outputPath("site"), withoutStatus);
  expect(result.output).toContain("status: Invalid input");
  expect(result.built).toBe(false);
});

test("a page with an unknown status fails the build", async ({}, testInfo) => {
  const result = await buildWithPage(testInfo.outputPath("site"), `${withoutStatus}\nstatus: approved`);
  expect(result.output).toContain("status: Invalid input");
  expect(result.built).toBe(false);
});

for (const [formula, message] of [
  ["\\frac{1}", "KaTeX parse error"],
  ["\\href{https://example.com}{x}", "\\href is not allowed in a formula"],
]) {
  test(`the formula ${formula} fails the build`, async ({}, testInfo) => {
    const metadata = `${withoutStatus}\nstatus: technical-test`;
    const result = await buildWithPage(testInfo.outputPath("site"), metadata, `$${formula}$`);
    expect(result.output).toContain(message);
    expect(result.built).toBe(false);
  });
}

const withStatus = `${withoutStatus}\nstatus: technical-test`;
const importExample = 'import Example from "../../snippets/Example.astro";';

test("an example whose program or output file is missing fails the build", async ({}, testInfo) => {
  const text = `${importExample}\n\n<Example name="no-such-example" />`;
  const result = await buildWithPage(testInfo.outputPath("site"), withStatus, text);
  expect(result.output).toContain('The example "no-such-example" needs src/snippets/no-such-example.py and no-such-example.txt');
  expect(result.built).toBe(false);
});

test("an example with both files builds", async ({}, testInfo) => {
  const text = `${importExample}\n\n<Example name="add-vectors" />`;
  const result = await buildWithPage(testInfo.outputPath("site"), withStatus, text);
  expect(result.built).toBe(true);
});
