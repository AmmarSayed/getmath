# Third-party notices

Material from others that GetMath uses (`CHARTER.md` section 7). Nothing here has been changed, except as stated. Exact versions are in `package.json`, `pnpm-lock.yaml` and `.github/workflows/`.

## Distributed with the site

| Item | Package | Creator | Licence | Source |
| --- | --- | --- | --- | --- |
| @astrojs/svelte | @astrojs/svelte | The Astro authors | MIT | <https://github.com/withastro/astro> |
| @astrojs/svelte-renderer | @astrojs/svelte-renderer | The Astro authors | MIT | <https://github.com/withastro/astro> |
| astro | astro | The Astro authors | MIT | <https://github.com/withastro/astro> |
| katex | katex | Khan Academy and other contributors | MIT | <https://github.com/KaTeX/KaTeX> |
| KaTeX fonts | katex | Design Science, Inc. (MathJax) and Khan Academy | OFL-1.1 | <https://github.com/KaTeX/katex-fonts> |
| svelte | svelte | Svelte contributors | MIT | <https://github.com/sveltejs/svelte> |

The site serves KaTeX's styles and fonts, formulas that KaTeX has drawn, and the scripts that interactions need: KaTeX, Svelte, and the parts of Astro that start them. The build joins the scripts with GetMath's own and compresses them. It joins the styles with GetMath's own, compresses them, points them at this site's addresses and adds a code to each font's file name; the fonts themselves are unchanged. Some of KaTeX's drawings, such as root signs, are adapted from its fonts. The fonts' repository is under MIT, but the fonts themselves state OFL-1.1, so the terms of both are kept. Each build publishes the full terms as `third-party-licences.txt`, linked from every page. The tests compare this table with what the build distributes, and look for the fonts' licence in each font's own data.

## Used to build the site

| Item | Creator | Licence | Source |
| --- | --- | --- | --- |
| astro, @astrojs/mdx, @astrojs/markdown-satteri, @astrojs/svelte | The Astro authors | MIT | <https://github.com/withastro/astro> |
| svelte | Svelte contributors | MIT | <https://github.com/sveltejs/svelte> |
| zod, through `astro/zod` | Colin McDonnell | MIT | <https://github.com/colinhacks/zod> |

## Used only in development and testing

| Item | Creator | Licence | Source |
| --- | --- | --- | --- |
| @astrojs/check | The Astro authors | MIT | <https://github.com/withastro/astro> |
| svelte-check | The Svelte Community | MIT | <https://github.com/sveltejs/language-tools> |
| typescript | Microsoft | Apache-2.0 | <https://github.com/microsoft/TypeScript> |
| vitest | Anthony Fu and Vitest contributors | MIT | <https://github.com/vitest-dev/vitest> |
| @playwright/test | Microsoft | Apache-2.0 | <https://github.com/microsoft/playwright> |
| @axe-core/playwright, which includes axe-core | Deque Systems | MPL-2.0 | <https://github.com/dequelabs/axe-core-npm> |
| Chromium, Firefox and WebKit builds that Playwright downloads | The Chromium, Mozilla and WebKit projects | BSD-3-Clause, MPL-2.0, and LGPL-2.1 with BSD-2-Clause, with the notices in each download | <https://playwright.dev/docs/browsers> |
| @types/node | DefinitelyTyped contributors | MIT | <https://github.com/DefinitelyTyped/DefinitelyTyped> |
| pnpm | pnpm contributors | MIT | <https://github.com/pnpm/pnpm> |
| actions/checkout, actions/setup-node, actions/upload-artifact, actions/upload-pages-artifact, actions/deploy-pages | GitHub | MIT | <https://github.com/actions> |
| pnpm/action-setup | pnpm contributors | MIT | <https://github.com/pnpm/action-setup> |

These packages bring further packages with them, listed in `pnpm-lock.yaml`. `pnpm licenses list` prints the licence of each one. Most are MIT, ISC, BSD or Apache-2.0; the copyleft ones are axe-core and lightningcss (MPL-2.0) and sharp's copy of libvips (LGPL-3.0-or-later). None of the packages used only to build, develop or test the site is copied into this repository or distributed with the site, so each carries its own notices when it is installed.

## Licence texts

`LICENSE-TEXT` and `LICENSE-DATA` are the legal texts of CC BY 4.0 and CC0 1.0, copied from <https://creativecommons.org>. Creative Commons dedicates its licence texts to the public domain under CC0.

`src/licences/katex-fonts.txt` holds the notice in the KaTeX fonts' own data, with the fonts' names joined into one list, and the text of the SIL Open Font License 1.1 by SIL International, copied unchanged from <https://github.com/spdx/license-list-data>. The text states no licence of its own; the licence requires that it accompany the fonts.
