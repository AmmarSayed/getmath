# Third-party notices

Material from others that GetMath uses (`CHARTER.md` section 7). Nothing here has been changed, except as stated. Exact versions are in `package.json`, `pnpm-lock.yaml`, `.python-version`, `pyproject.toml` and `.github/workflows/`.

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
| nbformat | Jupyter Development Team | BSD-3-Clause | <https://github.com/jupyter/nbformat> |
| nbclient | Jupyter Development Team | BSD-3-Clause | <https://github.com/jupyter/nbclient> |
| jupyter-client | Jupyter Development Team | BSD-3-Clause | <https://github.com/jupyter/jupyter_client> |
| ipykernel | IPython Development Team | BSD-3-Clause | <https://github.com/ipython/ipykernel> |
| uv | Astral | MIT or Apache-2.0 | <https://github.com/astral-sh/uv> |
| CPython builds that uv downloads (python-build-standalone) | The Python Software Foundation and Astral | PSF-2.0, with the notices in each download; the scripts that make the builds are under MPL-2.0 | <https://github.com/astral-sh/python-build-standalone> |
| actions/checkout, actions/setup-node, actions/upload-artifact, actions/upload-pages-artifact, actions/deploy-pages | GitHub | MIT | <https://github.com/actions> |
| pnpm/action-setup | pnpm contributors | MIT | <https://github.com/pnpm/action-setup> |
| astral-sh/setup-uv | Astral | MIT | <https://github.com/astral-sh/setup-uv> |
| numpy | NumPy Developers (Travis E. Oliphant and others) | BSD-3-Clause, with notices for parts under 0BSD, MIT, Zlib and CC0-1.0 | <https://github.com/numpy/numpy> |
| scipy | SciPy Developers, and Enthought, Inc. (2001-2002) | BSD-3-Clause | <https://github.com/scipy/scipy> |
| scikit-learn | scikit-learn developers | BSD-3-Clause | <https://github.com/scikit-learn/scikit-learn> |

scikit-learn also brings joblib (BSD-3-Clause, Gael Varoquaux and others), cloudpickle (BSD-3-Clause, the cloudpickle developer team), narwhals (MIT, Marco Gorelli) and threadpoolctl (BSD-3-Clause, Thomas Moreau and others), all pinned in `uv.lock`. Python 3.14.8, scikit-learn 1.9.1, SciPy 1.18.1 and NumPy 2.5.5 run `scripts/check_datasets.py`, which reproduces the table of data in `docs/table-of-contents.md`; none of them is distributed with the site. Their Python wheels bundle runtime libraries (OpenBLAS, LAPACK, libgfortran and libquadmath) with their own notices and licences, which each wheel carries when it is installed.

These packages bring further packages with them, listed in `pnpm-lock.yaml` and `uv.lock`. `pnpm licenses list` prints the licence of each one. Most are MIT, ISC, BSD or Apache-2.0; the copyleft ones are axe-core and lightningcss (MPL-2.0) and sharp's copy of libvips (LGPL-3.0-or-later). None of the packages used only to build, develop or test the site is copied into this repository or distributed with the site, so each carries its own notices when it is installed.

## Data

Copies are in `data/`. `scripts/check_datasets.py` checks their SHA-256 before it reads them.

| Item | Creator | Licence | Source | Attribution | Changes |
| --- | --- | --- | --- | --- | --- |
| `data/penguins.csv`: Palmer Penguins, 344 rows | Kristen B. Gorman, Palmer Station Antarctica LTER (data); Allison M. Horst and Alison Presmanes Hill (the palmerpenguins package) | CC0 1.0, stated in the package's README ("Data are available by CC-0 license in accordance with the Palmer Station LTER Data Policy") and in its `LICENSE.md` | `inst/extdata/penguins.csv` at release v0.1.0 (commit e5bfd5f2c7da95b0823e9501b9013eb2ef124fa7) of <https://github.com/allisonhorst/palmerpenguins>; SHA-256 `f204db2c753b0937caac3cb35258562c14f073e4bbc76be24b4c51ce22767a93` | None required. Credit: Horst AM, Hill AP, Gorman KB (2020), palmerpenguins: Palmer Archipelago (Antarctica) penguin data, R package version 0.1.0, <https://allisonhorst.github.io/palmerpenguins/>; data from Gorman KB, Williams TD, Fraser WR (2014), PLoS ONE 9(3):e90081, <https://doi.org/10.1371/journal.pone.0090081> | None |
| `data/real-estate-valuation.csv`: Real Estate Valuation, 414 rows | I-Cheng Yeh | CC BY 4.0, stated on the dataset's page | UCI Machine Learning Repository, dataset 477, <https://archive.ics.uci.edu/dataset/477/real+estate+valuation+data+set>, file <https://archive.ics.uci.edu/static/public/477/data.csv>; DOI <https://doi.org/10.24432/C5J30W>; SHA-256 `0730a5687ec285a3c2f9921a808855bd1bde21fc53e6377561cbdce2dda9cbb1` | Yeh, I-Cheng (2018). Real Estate Valuation [Dataset]. UCI Machine Learning Repository. <https://doi.org/10.24432/C5J30W>. Licensed under CC BY 4.0, <https://creativecommons.org/licenses/by/4.0/>. Paper: Yeh I-C, Hsu T-K (2018), Building real estate valuation models with comparative approach through case-based reasoning, Applied Soft Computing | None. The file is UCI's own CSV, as downloaded on 2026-11-24, not a conversion of the xlsx |

Where a dataset's file is used in a lesson, its credit and licence are shown with it.

## Licence texts

`LICENSE-TEXT` and `LICENSE-DATA` are the legal texts of CC BY 4.0 and CC0 1.0, copied from <https://creativecommons.org>. Creative Commons dedicates its licence texts to the public domain under CC0.

`src/licences/katex-fonts.txt` holds the notice in the KaTeX fonts' own data, with the fonts' names joined into one list, and the text of the SIL Open Font License 1.1 by SIL International, copied unchanged from <https://github.com/spdx/license-list-data>. The text states no licence of its own; the licence requires that it accompany the fonts.
