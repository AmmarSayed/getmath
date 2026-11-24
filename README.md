# GetMath

An open, interactive book on the mathematics behind machine learning. `CHARTER.md` says what it is for and how it is made.

**Status: unfinished.** There are no lessons yet. The repository holds the plan and a technical proof of concept. Its sample page is labelled "technical test, not a lesson" and is not approved instruction.

## Working on it

You need Git, [uv](https://docs.astral.sh/uv/) and [Node.js](https://nodejs.org) at the version in `.nvmrc`. Then run `npm install --global pnpm`; pnpm itself switches to the version recorded in `package.json`. uv installs the Python that `.python-version` names, so Python itself is not needed.

| Command | What it does |
| --- | --- |
| `pnpm install --frozen-lockfile` | Installs the exact dependencies in `pnpm-lock.yaml` |
| `pnpm exec playwright install --with-deps` | Installs the test browsers. On Linux this asks for administrator rights |
| `pnpm dev` | Serves the site while you edit, at <http://127.0.0.1:4321/getmath/> |
| `pnpm check` | Checks types, page metadata and components |
| `pnpm build` | Builds the site into `dist/` |
| `pnpm preview` | Serves that build under the real base path |
| `pnpm test` | Tests the state of interactions, builds the site, then tests that build in Chromium, Firefox and WebKit, then times it alone (loading, layout shift, weight and arrow response) against the ceilings in `tests/speed/thresholds.json`. Stop `pnpm dev` and `pnpm preview` first |
| `pnpm measure [runs]` | Builds the site and times it in a throttled Chromium, 20 runs by default, and prints the minimum, median and maximum of each measure beside its ceiling. The ceilings are provisional until Ammar accepts them |
| `pnpm verify` | Builds the site, then checks the table of contents against the gap assessment, runs every Python program in `src/snippets/` with the locked Python and compares its output, and checks that the code blocks and outputs in the built pages come from those files |

The same checks run on every pull request and every push to `main`, in `.github/workflows/checks.yml`.

## Pages

A page is an MDX file in `src/content/pages/`. It starts with a title, a description and a validation status:

```yaml
---
title: Sample page
description: A technical test of the website that will hold the GetMath book.
status: technical-test
---
```

The status sets the label that readers see. The allowed statuses are in `src/statuses.ts`, and a page without one of them fails the build.

A formula is LaTeX between dollar signs: `$3 + 4 = 7$` inside a sentence, or between `$$` lines on its own line. KaTeX draws it during the build, and a formula that it cannot draw, or that has a link, an image or HTML, fails the build. A dollar sign that is not a formula is written `\$`.

An interaction is a Svelte component, such as `src/arrows/AddArrows.svelte`. One plain module holds the mathematical state and its arithmetic, and the drawing, numbers, words and formula are calculated from that. In the component, the element with the class `interaction` is replaced, without JavaScript, by the still figure with the class `still`.

A Python example is two files in `src/snippets/`, `name.py` with the program and `name.txt` with exactly what it prints, and `<Example name="name" />` in the page, after `import Example from "../../snippets/Example.astro";`. The page shows both files as they are, and `pnpm verify` runs the program and fails if its output differs from the `.txt`. To change an example, change the files and run `pnpm verify`. Nothing runs on the site: Run only reveals the expected output. A code block (`<pre>`) or output (`<samp>`) written by hand in a page has no source, so `pnpm verify` fails on it. It cannot recognise an output that is written in a sentence or drawn in another way, so outputs are shown only with `<Example>`.

## Publishing

The site is meant for <https://ammarsayed.github.io/getmath/>. While GitHub Pages is on, each push to `main` that passes every check publishes the build that was checked. While it is off, nothing is published. Ammar is asked before the first deployment (`CHARTER.md` section 8).

- **Turn it on:** `gh api -X POST repos/AmmarSayed/getmath/pages -f build_type=workflow`. Check that `gh api repos/AmmarSayed/getmath/environments/github-pages/deployment-branch-policies --jq '.branch_policies[].name'` prints only `main`, so that no other branch can publish. Then run `gh workflow run checks.yml --ref main`.
- **Publish again:** use that last command, not "Re-run all jobs", which would publish the older commit or fail.
- **Check the published site:** build the same commit with `pnpm build`, set the environment variable `SITE_URL` to `https://ammarsayed.github.io/getmath/`, and run `pnpm exec playwright test --project=chromium --project=firefox --project=webkit`. Copies can be up to ten minutes old just after publishing.
- **Take it down:** `gh api -X DELETE repos/AmmarSayed/getmath/pages`. Later pushes are checked but not published. Without `gh`, open Settings → Pages on GitHub, set the source to "Deploy from a branch", choose the branch "None" and save. Do not use "Unpublish site" for this, because the next push to `main` would publish again. Then open the address to see that it is gone; copies can last ten minutes.

## Licences

| Material | Licence |
| --- | --- |
| Original text, figures and exercises | [CC BY 4.0](LICENSE-TEXT) |
| Original code | [MIT](LICENSE-CODE) |
| Original datasets | [CC0 1.0](LICENSE-DATA) |

Third-party material keeps its own licence. See [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md).
