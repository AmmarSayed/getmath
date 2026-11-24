# GetMath

An open, interactive book on the mathematics behind machine learning. `CHARTER.md` says what it is for and how it is made.

**Status: unfinished.** There are no lessons yet. The repository holds the plan and a technical proof of concept. Its sample page is labelled "technical test, not a lesson" and is not approved instruction.

## Working on it

You need Git, Python 3 and [Node.js](https://nodejs.org) at the version in `.nvmrc`. Then run `npm install --global pnpm`; pnpm itself switches to the version recorded in `package.json`.

| Command | What it does |
| --- | --- |
| `pnpm install --frozen-lockfile` | Installs the exact dependencies in `pnpm-lock.yaml` |
| `pnpm exec playwright install --with-deps` | Installs the test browsers. On Linux this asks for administrator rights |
| `pnpm dev` | Serves the site while you edit, at <http://127.0.0.1:4321/getmath/> |
| `pnpm check` | Checks types, page metadata and components |
| `pnpm build` | Builds the site into `dist/` |
| `pnpm preview` | Serves that build under the real base path |
| `pnpm test` | Tests the state of interactions, builds the site, then tests that build in Chromium, Firefox and WebKit. Stop `pnpm dev` and `pnpm preview` first |
| `python3 scripts/check_toc.py` | Checks the table of contents against the gap assessment. On Windows the command may be `python` or `py` |

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

An interaction is a Svelte component, such as `src/arrows/AddArrows.svelte`. One plain module holds its state and arithmetic, and everything shown is calculated from that. It is marked `interaction`, and beside it the element marked `still` holds the still figure that replaces it without JavaScript.

## Publishing

The site is meant for <https://ammarsayed.github.io/getmath/>. While GitHub Pages is on, each push to `main` that passes every check publishes the build that was checked. While it is off, nothing is published. Ammar is asked before the first deployment (`CHARTER.md` section 8).

- **Turn it on:** `gh api -X POST repos/AmmarSayed/getmath/pages -f build_type=workflow`. Check that `gh api repos/AmmarSayed/getmath/environments/github-pages/deployment-branch-policies --jq '.branch_policies[].name'` prints only `main`, so that no other branch can publish. Then run `gh workflow run checks.yml --ref main`.
- **Publish again:** use that last command, not "Re-run all jobs", which would publish the older commit or fail.
- **Check the published site:** build the same commit with `pnpm build`, set the environment variable `SITE_URL` to `https://ammarsayed.github.io/getmath/`, and run `pnpm exec playwright test site.spec.ts arrows.spec.ts`. Copies can be up to ten minutes old just after publishing.
- **Take it down:** `gh api -X DELETE repos/AmmarSayed/getmath/pages`. Later pushes are checked but not published. Without `gh`, open Settings → Pages on GitHub, set the source to "Deploy from a branch", choose the branch "None" and save. Do not use "Unpublish site" for this, because the next push to `main` would publish again. Then open the address to see that it is gone; copies can last ten minutes.

## Licences

| Material | Licence |
| --- | --- |
| Original text, figures and exercises | [CC BY 4.0](LICENSE-TEXT) |
| Original code | [MIT](LICENSE-CODE) |
| Original datasets | [CC0 1.0](LICENSE-DATA) |

Third-party material keeps its own licence. See [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md).
