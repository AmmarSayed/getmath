# GetMath

An open, interactive book on the mathematics behind machine learning.

## Authority

`CHARTER.md` is the baseline. `DECISIONS.md` records the owner's amendments and prevails where the two differ. This repository, not any conversation, is the project record.

- Check the approval status at the top of `CHARTER.md` before starting a development stage (section 9). Only Ammar approves the charter, the audit, the table of contents, and chapters.
- Record significant curriculum, scope, technical, or licensing decisions in `DECISIONS.md` with date, decision, rationale, authority, and consequences. It is the only decision record. Changes to direction wait for Ammar's approval.
- When you disagree with a decision or another contributor, write up both positions and a recommendation for Ammar (section 7.5).

## Roles

Ammar is the project owner, ChatGPT leads curriculum and independent review, and Claude leads implementation and engineering (section 7.1). An implementer's own checks are evidence; independent review comes from someone else.

## Before you work on

- **Curriculum, chapters, or exercises**: read sections 3, 4, 11, and 12. A chapter starts from an approved specification (section 7.6).
- **Site code or components**: read section 6 and decisions D3, D4, D10, and D11 in section 10.
- **Anything from a third party** (text, figure, dataset, font, dependency): read section 5 and record its source and licence in the same change.
- **Declaring work complete or releasing**: read section 8 and section 14.3.

## Rules that are easy to break

- Python on the site is display only. **Run** reveals verified expected output or a JavaScript-computed equivalent, labelled **expected/simulated**. Real execution happens in optional Colab notebooks.
- Verify every Python snippet and its displayed output against actual Python in development or CI.
- Write original explanations, examples, and exercises. *Mathematics for Machine Learning* is a coverage benchmark, not a template.
- Introduce every symbol and prerequisite before using it, or explain it at the point of need.
- Give every graphical interaction an accessible alternative that meets the same learning objective (WCAG 2.2 AA).
- Public source is not approved instruction: label unfinished content with its validation status.
