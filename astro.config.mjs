import { satteri } from "@astrojs/markdown-satteri";
import mdx from "@astrojs/mdx";
import svelte from "@astrojs/svelte";
import { defineConfig } from "astro/config";
import { formulas } from "./src/formulas.ts";
import { looksRoute } from "./src/prototype/looks-route.ts";
import { thirdParty } from "./src/third-party.ts";

// GitHub Pages serves the project below the domain root, so every internal
// link and asset must start with this base path.
export default defineConfig({
  site: "https://ammarsayed.github.io",
  base: "/getmath/",
  trailingSlash: "always",
  // Separate style files are cached between pages, and tested under the base path.
  build: { inlineStylesheets: "never" },
  markdown: { processor: satteri({ features: { math: true }, mdastPlugins: formulas }) },
  integrations: [mdx(), svelte(), thirdParty(), looksRoute()],
  // Small fonts stay files of their own, so that what the site distributes can be checked.
  vite: { build: { assetsInlineLimit: 0 } },
  server: { host: "127.0.0.1", port: 4321 },
});
