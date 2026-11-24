import { readdirSync, readFileSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import type { AstroIntegration } from "astro";

const licencesFile = "third-party-licences.txt";

// Terms that a package does not include as a file, kept in `src/licences/`.
const furtherTerms: Record<string, string> = { katex: "katex-fonts.txt" };

/** The folder of the installed package that a module belongs to, if any. */
function packageFolder(id: string) {
  return /^.*\/node_modules\/(?:@[^/]+\/)?[^/]+(?=\/)/.exec(id.split("?")[0].replaceAll("\\", "/"))?.[0];
}

function readTerms(folder: string) {
  const { name, version, license } = JSON.parse(readFileSync(`${folder}/package.json`, "utf8"));
  const file = readdirSync(folder).find((item) => /^licen[cs]e/i.test(item));
  if (!file) throw new Error(`${name} is distributed with the site, but has no licence file`);
  return { title: `# ${name} ${version} (${license})`, name, text: readFileSync(`${folder}/${file}`, "utf8").trim() };
}

/**
 * Notes which packages the built site distributes, and publishes their terms
 * next to the pages. Counted are the styles of every page, with their fonts,
 * and the scripts that reach the browser.
 */
export function thirdParty(): AstroIntegration {
  const folders = new Set<string>();
  const note = (id: string) => {
    const folder = packageFolder(id);
    if (folder) folders.add(folder);
  };
  let source: URL;

  return {
    name: "third-party",
    hooks: {
      "astro:config:setup": ({ updateConfig }) => {
        updateConfig({
          vite: {
            plugins: [
              {
                name: "third-party",
                apply: "build",
                transform(_code, id) {
                  if (/\.css$/.test(id.split("?")[0])) note(id);
                },
                generateBundle(_options, bundle) {
                  if (this.environment.name !== "client") return;
                  for (const chunk of Object.values(bundle)) {
                    if (chunk.type === "chunk") chunk.moduleIds.forEach(note);
                  }
                },
              },
            ],
          },
        });
      },
      "astro:config:done": ({ config }) => {
        source = config.srcDir;
      },
      "astro:build:done": async ({ dir }) => {
        const terms = [...folders].map(readTerms).sort((a, b) => a.title.localeCompare(b.title));
        const sections = terms.flatMap(({ title, name, text }) => {
          const further = furtherTerms[name];
          return [title, text, ...(further ? [readFileSync(new URL(`licences/${further}`, source), "utf8").trim()] : [])];
        });
        await writeFile(new URL(licencesFile, dir), `${sections.join("\n\n")}\n`);
      },
    },
  };
}
