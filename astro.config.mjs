import mdx from "@astrojs/mdx";
import { defineConfig } from "astro/config";

// GitHub Pages serves the project below the domain root, so every internal
// link and asset must start with this base path.
export default defineConfig({
  site: "https://ammarsayed.github.io",
  base: "/getmath/",
  trailingSlash: "always",
  // Separate style files are cached between pages, and tested under the base path.
  build: { inlineStylesheets: "never" },
  integrations: [mdx()],
  server: { host: "127.0.0.1", port: 4321 },
});
