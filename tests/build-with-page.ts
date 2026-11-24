import { execFile } from "node:child_process";
import { cp, mkdir, readdir, symlink, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { promisify } from "node:util";

const execute = promisify(execFile);

/** Builds a copy of the site in `folder`, with one extra page made of `metadata` and `text`, and the notebooks unless `notebooks` is false. */
export async function buildWithPage(folder: string, metadata: string, text = "Text.", notebooks = true) {
  await mkdir(join(folder, "node_modules"), { recursive: true });
  for (const item of ["src", "public", "astro.config.mjs", "package.json", "tsconfig.json"]) {
    await cp(item, join(folder, item), { recursive: true });
  }
  if (notebooks) await cp("notebooks", join(folder, "notebooks"), { recursive: true });
  // Link each package, not the folder, so that Astro's cache is not shared.
  // Windows allows a junction without administrator rights.
  for (const name of await readdir("node_modules")) {
    if (!name.startsWith(".")) {
      await symlink(join(process.cwd(), "node_modules", name), join(folder, "node_modules", name), "junction");
    }
  }
  await writeFile(join(folder, "src/content/pages/extra.mdx"), `---\n${metadata}\n---\n\n${text}\n`);
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
