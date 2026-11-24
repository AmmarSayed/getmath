# GetMath

An open, interactive book on the mathematics behind machine learning.

## Authority

`CHARTER.md` is the only governing document, and Git history is the decision record. The project record is this repository and its issues, not any conversation.

- Check the approval status at the top of `CHARTER.md` before starting a stage (section 10). Only Ammar approves the charter, gap assessment, table of contents, and chapters.
- A significant curriculum, scope, technical, or licensing decision is a change to `CHARTER.md`, with the reason in the commit message. Changes to direction wait for Ammar's approval.
- Add a document only when an existing one cannot hold the content.
- When you disagree with a decision or another contributor, write up both positions and a recommendation for Ammar (section 8).

## Roles

Ammar is the owner and test learner, Claude is the author and engineer, and an assistant from a different AI vendor (currently Codex) is the independent reviewer (section 8). An implementer's own checks are evidence; independent review comes from someone else. Never show Ammar a chapter's hidden test problems before the test.

## Before you work on

- **Curriculum, chapters, or exercises**: read sections 2 to 5. A chapter starts from an approved specification (section 8).
- **Site code or components**: read section 6.
- **Anything from a third party** (text, figure, dataset, font, dependency): read section 7 and record its source and licence in the same change.
- **Declaring work complete or releasing**: read section 9.

## Rules that are easy to break

- Python on the site is display only. **Run** reveals verified expected output or a JavaScript-computed equivalent, labelled **expected/simulated**. Real execution happens in optional Colab notebooks.
- Verify every Python snippet and its displayed output against actual Python in development or CI.
- Write original explanations, examples, and exercises. *Mathematics for Machine Learning* is a coverage benchmark, not a template.
- Introduce every symbol and prerequisite before using it, or explain it at the point of need.
- Give every graphical interaction an accessible alternative that meets the same learning objective (WCAG 2.2 AA).
- Public source is not approved instruction: label unfinished content with its validation status.

## Agent skills

### Issue tracker

Tickets are GitHub issues on `AmmarSayed/getmath`; approved chapter specifications are committed to the repo. See `docs/agents/issue-tracker.md`.

### Triage labels

The five default roles, each label named after its role. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: root `GLOSSARY.md`, with decisions in `CHARTER.md`. See `docs/agents/domain.md`.
