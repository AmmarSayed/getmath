import { execFile } from "node:child_process";
import { cp, mkdir, readdir, symlink, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { promisify } from "node:util";
import { expect, test } from "@playwright/test";

const execute = promisify(execFile);

/** Builds a copy of the site in `folder`, with one extra page made of `metadata`. */
async function buildWithPage(folder: string, metadata: string) {
  await mkdir(join(folder, "node_modules"), { recursive: true });
  for (const item of ["src", "public", "astro.config.mjs", "package.json", "tsconfig.json"]) {
    await cp(item, join(folder, item), { recursive: true });
  }
  // Link each package, not the folder, so that Astro's cache is not shared.
  // Windows allows a junction without administrator rights.
  for (const name of await readdir("node_modules")) {
    if (!name.startsWith(".")) {
      await symlink(join(process.cwd(), "node_modules", name), join(folder, "node_modules", name), "junction");
    }
  }
  await writeFile(join(folder, "src/content/pages/extra.mdx"), `---\n${metadata}\n---\n\nText.\n`);
  const astro = join(process.cwd(), "node_modules/astro/bin/astro.mjs");
  try {
    // Colour codes, which Astro adds in CI, would split the messages checked below.
    const env = { ...process.env, NO_COLOR: "1", FORCE_COLOR: "0" };
    const { stdout, stderr } = await execute(process.execPath, [astro, "build"], { cwd: folder, env });
    return { built: true, output: stdout + stderr };
  } catch (error) {
    const { stdout, stderr } = error as { stdout: string; stderr: string };
    return { built: false, output: stdout + stderr };
  }
}

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
