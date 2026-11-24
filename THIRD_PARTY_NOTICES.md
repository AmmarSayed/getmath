# Third-party notices

Material from others that GetMath uses (`CHARTER.md` section 7). Nothing here has been changed. Exact versions are in `package.json`, `pnpm-lock.yaml` and `.github/workflows/`.

## Distributed with the site

None. The built pages hold only GetMath's own HTML, styles and images.

## Used to build the site

| Item | Creator | Licence | Source |
| --- | --- | --- | --- |
| astro, @astrojs/mdx | The Astro authors | MIT | <https://github.com/withastro/astro> |
| zod, through `astro/zod` | Colin McDonnell | MIT | <https://github.com/colinhacks/zod> |

## Used only in development and testing

| Item | Creator | Licence | Source |
| --- | --- | --- | --- |
| @astrojs/check | The Astro authors | MIT | <https://github.com/withastro/astro> |
| typescript | Microsoft | Apache-2.0 | <https://github.com/microsoft/TypeScript> |
| @playwright/test | Microsoft | Apache-2.0 | <https://github.com/microsoft/playwright> |
| @axe-core/playwright, which includes axe-core | Deque Systems | MPL-2.0 | <https://github.com/dequelabs/axe-core-npm> |
| Chromium, Firefox and WebKit builds that Playwright downloads | The Chromium, Mozilla and WebKit projects | BSD-3-Clause, MPL-2.0, and LGPL-2.1 with BSD-2-Clause, with the notices in each download | <https://playwright.dev/docs/browsers> |
| @types/node | DefinitelyTyped contributors | MIT | <https://github.com/DefinitelyTyped/DefinitelyTyped> |
| pnpm | pnpm contributors | MIT | <https://github.com/pnpm/pnpm> |
| actions/checkout, actions/setup-node, actions/upload-artifact | GitHub | MIT | <https://github.com/actions> |
| pnpm/action-setup | pnpm contributors | MIT | <https://github.com/pnpm/action-setup> |

These packages bring further packages with them, listed in `pnpm-lock.yaml`. `pnpm licenses list` prints the licence of each one. Most are MIT, ISC, BSD or Apache-2.0; the copyleft ones are axe-core and lightningcss (MPL-2.0) and sharp's copy of libvips (LGPL-3.0-or-later). None of them is copied into this repository or distributed with the site, so each carries its own notices when it is installed.

## Licence texts

`LICENSE-TEXT` and `LICENSE-DATA` are the legal texts of CC BY 4.0 and CC0 1.0, copied from <https://creativecommons.org>. Creative Commons dedicates its licence texts to the public domain under CC0.
