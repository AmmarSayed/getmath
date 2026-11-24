import { execFile } from "node:child_process";
import { cp, mkdir, readdir, symlink, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { promisify } from "node:util";
import { expect, test } from "@playwright/test";

const run = promisify(execFile);

/** Builds a copy of the site in `folder`, with one extra page made of `metadata`. */
async function buildWithPage(folder: string, metadata: string) {
  await mkdir(join(folder, "node_modules"), { recursive: true });
  for (const item of ["src", "public", "astro.config.mjs", "package.json", "tsconfig.json"]) {
    await cp(item, join(folder, item), { recursive: true });
  }
  // Link each package, not the folder, so that Astro's cache is not shared.
  for (const name of await readdir("node_modules")) {
    if (!name.startsWith(".")) {
      await symlink(join(process.cwd(), "node_modules", name), join(folder, "node_modules", name));
    }
  }
  await writeFile(join(folder, "src/content/pages/extra.mdx"), `---\n${metadata}\n---\n\nText.\n`);
  const astro = join(process.cwd(), "node_modules/astro/bin/astro.mjs");
  try {
    const { stdout, stderr } = await run(process.execPath, [astro, "build"], { cwd: folder });
    return { built: true, output: stdout + stderr };
  } catch (error) {
    const { stdout, stderr } = error as { stdout: string; stderr: string };
    return { built: false, output: stdout + stderr };
  }
}

const metadata = "title: Extra\ndescription: An extra page.";

test("a page with a valid status builds", async ({}, testInfo) => {
  const result = await buildWithPage(testInfo.outputPath("site"), `${metadata}\nstatus: technical-test`);
  expect(result.output).toContain("/extra/index.html");
  expect(result.built).toBe(true);
});

test("a page without a status fails the build", async ({}, testInfo) => {
  const result = await buildWithPage(testInfo.outputPath("site"), metadata);
  expect(result.output).toContain("status: Invalid input");
  expect(result.built).toBe(false);
});

test("a page with an unknown status fails the build", async ({}, testInfo) => {
  const result = await buildWithPage(testInfo.outputPath("site"), `${metadata}\nstatus: approved`);
  expect(result.output).toContain("status: Invalid input");
  expect(result.built).toBe(false);
});
