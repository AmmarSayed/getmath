import { globSync, readdirSync, readFileSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { AstroIntegration } from "astro";

const licencesFile = "third-party-licences.txt";

// Terms that a package does not include as a file, kept in `src/licences/`.
const furtherTerms: Record<string, string> = { katex: "katex-fonts.txt" };

const isStyle = (id: string) => /\.[a-z]*css(\?|$)/.test(id);

/** Styles and components reach the pages, even when the browser gets no script. */
const reachesPages = (id: string) => isStyle(id) || /\.(astro|svelte)(\?|$)/.test(id);

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
 * next to the pages. Counted are styles, with the fonts and images that they
 * use, components, and the scripts that reach the browser. Astro's own script
 * is written into each page that has an interaction, where no module shows it.
 */
export function thirdParty(): AstroIntegration {
  const folders = new Set<string>();
  const note = (id: string) => {
    const folder = packageFolder(id);
    if (folder) folders.add(folder);
  };
  let srcDir: URL;

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
                // Before Vite joins styles that import each other.
                enforce: "pre",
                transform(code, id) {
                  if (!reachesPages(id)) return;
                  note(id);
                  if (isStyle(id) && code.includes("@import")) {
                    throw new Error(`${id} uses @import, which hides where a style comes from. Import it in a component.`);
                  }
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
        srcDir = config.srcDir;
      },
      "astro:build:done": async ({ dir }) => {
        const pages = globSync("**/*.html", { cwd: dir }).map((page) => readFileSync(new URL(page, dir), "utf8"));
        if (pages.some((page) => page.includes("<astro-island"))) {
          folders.add(dirname(fileURLToPath(import.meta.resolve("astro/package.json"))));
        }
        const terms = [...folders].map(readTerms).sort((a, b) => a.title.localeCompare(b.title));
        const sections = terms.flatMap(({ title, name, text }) => {
          const further = furtherTerms[name];
          return [title, text, ...(further ? [readFileSync(new URL(`licences/${further}`, srcDir), "utf8").trim()] : [])];
        });
        await writeFile(new URL(licencesFile, dir), `${sections.join("\n\n")}\n`);
      },
    },
  };
}
