import { execFile } from "node:child_process";
import { cp, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { promisify } from "node:util";
import { expect, test } from "@playwright/test";
import { buildWithPage } from "./build-with-page";

const execute = promisify(execFile);

test.setTimeout(180_000);

/** Copies what the verify command reads into `folder`, takes the built pages from `dist`, and runs it there. */
async function setUp(folder: string, dist = "dist") {
  for (const item of ["scripts", "docs", "pyproject.toml", "uv.lock", ".python-version"]) {
    await cp(item, join(folder, item), { recursive: true });
  }
  await cp("src/snippets", join(folder, "src/snippets"), { recursive: true, filter: (path) => !path.endsWith(".astro") });
  if (dist !== join(folder, "dist")) await cp(dist, join(folder, "dist"), { recursive: true });
  return {
    path: (file: string) => join(folder, file),
    change: async (file: string, edit: (text: string) => string) => {
      const path = join(folder, file);
      const before = await readFile(path, "utf8");
      const after = edit(before);
      expect(after, `${file} is changed`).not.toBe(before);
      await writeFile(path, after);
    },
    verify: async (...options: string[]) => {
      try {
        const { stdout, stderr } = await execute("uv", ["run", "--quiet", "--locked", "scripts/verify.py", ...options], { cwd: folder });
        return { passed: true, output: stdout + stderr };
      } catch (error) {
        const { stdout, stderr } = error as { stdout: string; stderr: string };
        return { passed: false, output: stdout + stderr };
      }
    },
  };
}

test("the site as built passes", async ({}, testInfo) => {
  const result = await (await setUp(testInfo.outputPath("copy"))).verify("--no-build");
  expect(result.output).toMatch(/^OK: /m);
  expect(result.passed).toBe(true);
});

test("an output file that differs from what Python prints fails, and both are shown", async ({}, testInfo) => {
  const copy = await setUp(testInfo.outputPath("copy"));
  await writeFile(copy.path("src/snippets/add-vectors.txt"), "[4, 4]\n");
  // The page shows the same wrong output, so that only Python can tell.
  await copy.change("dist/index.html", (text) =>
    text.replace("<samp>[4, 3]", "<samp>[4, 4]").replace("[0,&quot;[4, 3]", "[0,&quot;[4, 4]"),
  );
  const result = await copy.verify("--no-build");
  expect(result.output.trim().split(/\r?\n/)).toEqual([
    "add-vectors: the output differs from add-vectors.txt",
    String.raw`  expected: '[4, 4]\n'`,
    String.raw`  actual:   '[4, 3]\n'`,
  ]);
  expect(result.passed).toBe(false);
});

test("every problem is listed in one run", async ({}, testInfo) => {
  const copy = await setUp(testInfo.outputPath("copy"));
  await writeFile(copy.path("src/snippets/add-vectors.txt"), "[4, 4]\n");
  await writeFile(copy.path("src/snippets/orphan.txt"), "text\n");
  await copy.change("docs/table-of-contents.md", (text) => text.replace("- **Needs:**", "- **Neds:**"));
  await copy.change("dist/index.html", (text) => text.replace("</main>", "<pre>stray text</pre></main>"));
  const result = await copy.verify("--no-build");
  expect(result.output).toContain("[4, 4]");
  expect(result.output).toContain("orphan");
  expect(result.output).toContain("missing field");
  expect(result.output).toContain("stray text");
  expect(result.passed).toBe(false);
});

test("a displayed output that differs from its file fails", async ({}, testInfo) => {
  const copy = await setUp(testInfo.outputPath("copy"));
  await copy.change("dist/index.html", (text) => text.replace("<samp>[4, 3]", "<samp>[4, 5]"));
  const result = await copy.verify("--no-build");
  expect(result.output).toContain("index.html");
  expect(result.output).toContain("[4, 5]");
  expect(result.passed).toBe(false);
});

for (const [where, edit] of [
  ["a program", (text: string) => text.replace("</code></pre>", "</code><samp></samp></pre>")],
  ["an output", (text: string) => text.replace("</samp></pre>", "</samp><pre></pre>stray text</pre>")],
] as const) {
  test(`an output inside ${where} fails`, async ({}, testInfo) => {
    const copy = await setUp(testInfo.outputPath("copy"));
    await copy.change("dist/index.html", edit);
    const result = await copy.verify("--no-build");
    expect(result.output).toContain("no source");
    expect(result.passed).toBe(false);
  });
}

test("a displayed program that differs from its file fails", async ({}, testInfo) => {
  const copy = await setUp(testInfo.outputPath("copy"));
  await copy.change("dist/index.html", (text) => text.replace("u = [3, 1]\nv", "u = [3, 9]\nv"));
  const result = await copy.verify("--no-build");
  expect(result.output).toContain("u = [3, 9]");
  expect(result.passed).toBe(false);
});

test("an output in the data of the island that differs from its file fails", async ({}, testInfo) => {
  const copy = await setUp(testInfo.outputPath("copy"));
  await copy.change("dist/index.html", (text) => text.replace("&quot;output&quot;:[0,&quot;[4, 3]", "&quot;output&quot;:[0,&quot;[9, 9]"));
  const result = await copy.verify("--no-build");
  expect(result.output).toContain("[9, 9]");
  expect(result.passed).toBe(false);
});

test("a program that crashes fails", async ({}, testInfo) => {
  const copy = await setUp(testInfo.outputPath("copy"));
  await writeFile(copy.path("src/snippets/crash.py"), "print(1 / 0)\n");
  await writeFile(copy.path("src/snippets/crash.txt"), "");
  const result = await copy.verify("--no-build");
  expect(result.output).toContain("crash");
  expect(result.output).toContain("ZeroDivisionError");
  expect(result.passed).toBe(false);
});

test("a program that writes to stderr fails even if its output is right", async ({}, testInfo) => {
  const copy = await setUp(testInfo.outputPath("copy"));
  await writeFile(copy.path("src/snippets/noisy.py"), 'import sys\nprint("hi")\nprint("oops", file=sys.stderr)\n');
  await writeFile(copy.path("src/snippets/noisy.txt"), "hi\n");
  const result = await copy.verify("--no-build");
  expect(result.output).toContain("noisy");
  expect(result.output).toContain("oops");
  expect(result.passed).toBe(false);
});

test("a program without a file for its output, or the other way round, fails", async ({}, testInfo) => {
  const copy = await setUp(testInfo.outputPath("copy"));
  await writeFile(copy.path("src/snippets/alone.py"), "print(1)\n");
  await writeFile(copy.path("src/snippets/lonely.txt"), "1\n");
  const result = await copy.verify("--no-build");
  expect(result.output).toContain("alone");
  expect(result.output).toContain("lonely");
  expect(result.passed).toBe(false);
});

test("a site without pages fails", async ({}, testInfo) => {
  const copy = await setUp(testInfo.outputPath("copy"));
  await rm(copy.path("dist/index.html"));
  const result = await copy.verify("--no-build");
  expect(result.output).toContain("no pages");
  expect(result.passed).toBe(false);
});

test("a code block written by hand in a page fails", async ({}, testInfo) => {
  const site = testInfo.outputPath("site");
  const metadata = "title: Extra\ndescription: An extra page.\nstatus: technical-test";
  const built = await buildWithPage(site, metadata, "```python\nprint(1 + 2)\n```");
  expect(built.built).toBe(true);
  const result = await (await setUp(site, join(site, "dist"))).verify("--no-build");
  expect(result.output).toContain("extra");
  expect(result.output).toContain("no source");
  expect(result.output).toContain("print(1 + 2)");
  expect(result.passed).toBe(false);
});

test("a page that does not build fails, and the other problems are still listed", async ({}, testInfo) => {
  const site = testInfo.outputPath("site");
  const metadata = "title: Extra\ndescription: An extra page.\nstatus: technical-test";
  const text = 'import Example from "../../snippets/Example.astro";\n\n<Example name="missing" />';
  await buildWithPage(site, metadata, text);
  const copy = await setUp(site);
  await writeFile(copy.path("src/snippets/lonely.txt"), "1\n");
  const result = await copy.verify();
  expect(result.output).toContain("the site does not build");
  expect(result.output).toContain("missing.py");
  expect(result.output).toContain("lonely");
  expect(result.passed).toBe(false);
});

test("a check of the table of contents that stops without a word fails", async ({}, testInfo) => {
  const copy = await setUp(testInfo.outputPath("copy"));
  await writeFile(copy.path("scripts/check_toc.py"), "import os\nos._exit(1)\n");
  const result = await copy.verify("--no-build");
  expect(result.output).toContain("check_toc.py printed nothing, with exit code 1");
  expect(result.passed).toBe(false);
});

test("a file that is not UTF-8 is listed with the other problems", async ({}, testInfo) => {
  const copy = await setUp(testInfo.outputPath("copy"));
  await writeFile(copy.path("src/snippets/add-vectors.txt"), "\ufeff[4, 3]\n", "utf16le");
  await writeFile(copy.path("src/snippets/lonely.txt"), "1\n");
  const result = await copy.verify("--no-build");
  expect(result.output).toContain("src/snippets/add-vectors.txt: not UTF-8");
  expect(result.output).toContain("lonely");
  expect(result.passed).toBe(false);
});

test("a program cannot wait for what is typed", async ({}, testInfo) => {
  const copy = await setUp(testInfo.outputPath("copy"));
  await writeFile(copy.path("src/snippets/asks.py"), "print(input())\n");
  await writeFile(copy.path("src/snippets/asks.txt"), "hi\n");
  const result = await copy.verify("--no-build");
  expect(result.output).toContain("EOFError");
  expect(result.passed).toBe(false);
});

test("a lock file that does not match the project fails", async ({}, testInfo) => {
  const copy = await setUp(testInfo.outputPath("copy"));
  await copy.change("pyproject.toml", (text) => text.replace('version = "0"', 'version = "1"'));
  const result = await copy.verify("--no-build");
  expect(result.output).toMatch(/lock/i);
  expect(result.passed).toBe(false);
});
