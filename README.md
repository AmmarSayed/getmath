# GetMath

An open, interactive book on the mathematics behind machine learning. `CHARTER.md` says what it is for and how it is made.

**Status: unfinished.** There are no lessons yet. The repository holds the plan and a technical proof of concept. Its sample page is labelled "technical test, not a lesson" and is not approved instruction.

## Working on it

You need Git, Python 3 and [Node.js](https://nodejs.org) at the version in `.nvmrc`. Then install the pnpm version recorded in `package.json`, for example with `npm install --global pnpm@12.23.0`.

| Command | What it does |
| --- | --- |
| `pnpm install --frozen-lockfile` | Installs the exact dependencies in `pnpm-lock.yaml` |
| `pnpm exec playwright install --with-deps` | Installs the test browsers. On Linux this asks for administrator rights |
| `pnpm dev` | Serves the site while you edit, at <http://127.0.0.1:4321/getmath/> |
| `pnpm check` | Checks types and page metadata |
| `pnpm build` | Builds the site into `dist/` |
| `pnpm preview` | Serves that build under the real base path |
| `pnpm test` | Tests that build in Chromium, Firefox and WebKit. Run `pnpm build` first |
| `python3 scripts/check_toc.py` | Checks the table of contents against the gap assessment |

The same checks run on every pull request, in `.github/workflows/checks.yml`.

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

## Licences

| Material | Licence |
| --- | --- |
| Original text, figures and exercises | [CC BY 4.0](LICENSE-TEXT) |
| Original code | [MIT](LICENSE-CODE) |
| Original datasets | [CC0 1.0](LICENSE-DATA) |

Third-party material keeps its own licence. See [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md).
