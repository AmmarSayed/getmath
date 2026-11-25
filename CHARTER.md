# GetMath Charter

**An Open, Interactive Book on the Mathematics Behind Machine Learning**

**Status:** approved by Ammar on 2026-11-24, including the changes of the same day to sections 3, 6, 8 (with the proof register), 9 and 10. Ammar left one further change, completing the square in Part I instead of Part II, to Claude's judgement.

This is the project's only governing document. A change to it needs Ammar's approval and is made here; Git history records what changed and why.

## 1. Purpose

GetMath is a free, open, interactive book that takes a beginner from school algebra to being ready to study machine learning (ML) without being held back by the mathematics.

- **Self-contained.** The book fully teaches every topic it needs. Other sources are credited when used, but are never required.
- **Intuition and rigour.** Each idea starts with a problem and intuition, and is then derived in full.
- **Enjoyable.** Interest comes from puzzles, surprising predictions and visible progress.
- **Self-paced.** There are no deadlines for learners or for the project.

*Mathematics for Machine Learning* (MML) by Deisenroth, Faisal and Ong is the coverage baseline, not a template. GetMath aims to teach MML's topics, plus the gaps found in section 5, in a way a beginner can learn from.

## 2. Learners and outcomes

**Who it is for:** independent learners with secondary-school algebra, and teachers. No calculus, linear algebra, probability, programming or specialised software is assumed.

**After the full book**, a learner can explain, derive, calculate small examples of, interpret verified demonstrations of, and identify the assumptions and common failures of:

- linear regression (geometric, optimisation, probabilistic and introductory Bayesian views) and logistic regression
- principal component analysis (PCA)
- Gaussian mixture models and expectation-maximisation (EM)
- support vector machines (SVMs), including margins, duality and kernels
- small feed-forward neural networks: one hidden layer with stated input and output sizes and biases, sigmoid first; squared loss for regression, cross-entropy for binary and multiclass (softmax) classification; backpropagation by hand, with one full forward, backward and update pass

The book prepares learners for advanced ML texts. It does not promise mastery of everything in them, and Python proficiency is not an outcome.

**Competence levels.** Each major outcome states its level, and the book offers a path through all three:

1. **Intuition:** explain what something means and why it matters.
2. **Working understanding:** solve problems, calculate and interpret.
3. **Derivation and transfer:** justify results and apply them to unfamiliar problems.

Models in Ready to Start ML (section 3) reach all three levels there. The Bayesian view of regression and deeper statistical inference come in the Full Book.

## 3. Scope

The book has six parts:

| Part | Subject |
| --- | --- |
| 0 | Opening: algebra, basic functions and graphs, notation, reading simple Python |
| I | Data as geometry: vectors, matrices, projections, eigenvalues, singular value decomposition (SVD) |
| II | Change and optimisation: calculus, gradients, optimisation, numerical behaviour |
| III | Uncertainty and statistics: probability, distributions, likelihood, estimation, inference, information theory |
| IV | Machine learning: modelling, evaluation, regularisation and the Ready to Start ML models |
| V | Full Book: the mathematics and models of the second milestone, in dependency order |

**Foundations.** Part 0 is one short opening chapter. The other foundations are taught in full just before they are first needed: sums, sets, proof reading, trigonometry, inequalities, completing the square and induction in Part I; functions in depth, exponentials and logarithms in Part II; numerical reasoning where it arises. Readiness checks let learners skip practice they do not need.

**Capstones.** Parts I, II and III each end by fitting a line: by projection, by gradient descent and by likelihood. Part IV unites the three views.

It is delivered in two milestones:

| Milestone | Contents |
| --- | --- |
| **Ready to Start ML** | Parts 0 to IV: the opening and the foundations; vectors to SVD; derivatives, gradients, the chain rule and gradient descent; second derivatives and convexity; integrals as needed; core probability, the Gaussian (one variable, and two as a picture), maximum likelihood, entropy and cross-entropy; basic statistics; evaluation, overfitting and regularisation; linear and logistic regression, PCA and small neural networks |
| **Full Book** | Part V: constrained optimisation and SVMs; the multivariate Gaussian, its conditionals and conjugacy; Gaussian mixtures and EM; Bayesian regression; deeper statistical inference |

**Statistics.** Basic statistics means the mean, variance with its N − 1 correction, covariance, correlation, the standard error, Chebyshev's inequality, the weak law of large numbers, and an approximate interval for a test error. Deeper statistical inference means the sampling distribution of regression coefficients (derived with known variance), large-sample intervals, the bootstrap, Bayesian credible intervals, hypothesis tests and p-values (large-sample, permutation and Student's t), power and A/B tests. Student's t is stated and simulated, and labelled "not proved here". Approximations are stated.

**Scope rule.** A new topic enters only if an existing topic or a section 2 model needs it, or standard preparation for ML and data science commonly teaches it (`references/curricula-comparison.md`), and Ammar approves it. Everything else is listed as "not in 1.0". The gap assessment may move topics between milestones with Ammar's approval.

**Excluded:** measure theory, functional analysis, advanced Markov chain Monte Carlo or variational inference, normalising flows, general convex duality, reinforcement learning, and transformer mathematics beyond a brief optional preview. Supporting theory is allowed where an in-scope algorithm needs it. For SVMs this covers weak duality and KKT sufficiency, proved, and Slater's theorem, stated with its conditions and labelled "not proved here".

## 4. Teaching

**Sequence**, adapted to each topic: need → intuition → visualisation → prediction → experiment → explanation → derivation → worked example → practice with fading help → transfer → retrieval.

- **Interactions** serve a learning objective: predict, change something, observe, explain, connect to the mathematics. Decorative sliders and animations are left out.
- **Representations** (words, pictures, symbols, numbers, code) are explicitly connected, not just placed side by side.
- **Prerequisites.** Every symbol, operation and result is introduced before use or explained at the point of need.
- **Misconceptions.** Each major concept names its predictable misconceptions and includes activities that reveal them.
- **Derivations** are required reading, with expandable hints and steps. Every result used is derived in full, except the few whose proofs need out-of-scope mathematics; those are labelled "not proved here" and tested numerically.
- **Practice** uses small skills, immediate feedback, stepwise hints, mixed review and later retrieval. The site checks only answers it can mark reliably: choices, numbers, vectors and matrices, dragging, and ordering the steps of a derivation. Longer derivations are written on paper, compared with a full solution and a checklist, and shown as self-marked. Full solutions are available after a meaningful attempt. Quizzes are used where useful, not at the end of every lesson.
- **Transfer** problems differ meaningfully from the examples; changing the numbers is not enough.
- **Progress** has four evidence-based states: Encountered, Practised, Provisional mastery, Retained mastery. Mastery can drop, retained mastery needs successful later retrieval, and opening a page proves nothing. There are no points, badges or streaks. Khan Academy inspires this learning loop; its content is not used.
- **Voice.** A friendly tutor: "you" for the learner, "we" when working together, short sentences and light humour, but no jokes inside derivations.
- **Honesty.** The text distinguishes exact results from approximations, definitions from analogies, facts from modelling assumptions, and simulations from real behaviour. Correctness comes before simplicity. Notation is consistent, and the role and dimensions of every variable are explained.

## 5. Gap assessment

One bounded document comes before the table of contents. It contains a table of MML's topics, the prerequisites they assume, the gaps, and an include or exclude recommendation for each, plus a dependency map. It gets at least one independent review, and Ammar's decision.

University courses, Open Source Society University (OSSU) and other preparation curricula help to find gaps; a topic enters only through the scope rule in section 3. Each included topic is classed as required foundation, required application or optional enrichment, and is traced to a need, a prerequisite, an outcome and an assessment.

Chapter order follows dependencies, not any reference text.

## 6. Platform

| Area | Decision |
| --- | --- |
| Site | Static, computer-first site on GitHub Pages at its default address. No account, server or behavioural tracking. The host changes only if the proof of concept shows a concrete unmet need. |
| Stack | Astro, MDX, TypeScript, Zod, Svelte islands, SVG and D3, with Three.js only where 3D helps learning. KaTeX. IndexedDB. Vitest, Playwright and axe-core in GitHub Actions. pnpm on a supported Node LTS. The proof of concept validates the stack. |
| Python | Read-only; never executed on the site. **Run** reveals a verified output or a JavaScript-computed equivalent, visibly labelled **expected/simulated**. **Reset** restores the start. Every snippet and output is verified against real Python in development or CI. |
| Colab | Optional matching notebooks for running real Python. Lessons and assessments never depend on them. The site explains that Colab is external, online and may need a Google account. |
| Offline | Not supported. The book is a website only. |
| Accessibility | Built to WCAG 2.2 AA, checked automatically and by hand with the keyboard, zoom and high contrast. The site states that it is not tested with a screen reader. Every graphical interaction has an accessible alternative meeting the same objective. Colour is never the only cue. |
| Screens | Computer first: designed for 1280 px and wider, and fully supported from 1024 px. On phones, text and mathematics stay readable and reflow, but interactions are not promised to work well. |
| Browsers | Latest two versions of Chrome, Edge, Firefox and Safari on computers. Automated tests run on the Chromium, Firefox and WebKit engines. Hand checks are on Windows; the site states that Safari is not tested by hand. |
| Progress data | Stored locally, with export, import and reset. No personal data is needed. |
| Security | No learner-supplied code runs. Inputs are constrained, and rendering, validation, resource use and dependencies are tested. |
| Language | English first, in British spelling. Arabic may come later and is not prepared for or tested now. |
| Data | Seeded synthetic data with its generating script. Real datasets only under CC0 or CC BY, with provenance recorded. |

Content is kept in portable, version-controlled source with machine-readable curriculum metadata, documented schemas and reproducible builds. Shared components have regression tests.

## 7. Sources and licences

| Material | Licence |
| --- | --- |
| Original text, figures and exercises | CC BY 4.0 |
| Original code | MIT |
| Original datasets | CC0 1.0 |

- Explanations, examples and exercises are original. AI-assisted content gets the same originality and accuracy checks.
- Third-party material, including dependencies, fonts and datasets, is used only under a compatible licence. Its source, creator, licence, required attribution and any changes are recorded in the same change, in `THIRD_PARTY_NOTICES.md`. It keeps its own licence.
- Material under non-commercial or other incompatible licences, including Khan Academy and MIT OpenCourseWare content, is never copied into the book.
- `references/` holds our own short notes on up to about 15 sources: a link, what the source teaches well, and what learners say about it.
- `references/local/` holds legally obtained copies, is ignored by Git and is never published.

## 8. People and process

| Role | Who | Work |
| --- | --- | --- |
| Owner and test learner | Ammar | Sets direction, approves, tests chapters, settles disagreements |
| Author and engineer | Claude | Drafts the gap assessment and specifications; builds chapters, site and tests; checks the hidden problems' solutions. May delegate code to other models, but reviews it and stays responsible; lesson text, mathematics and proofs are not delegated |
| Independent reviewer | An assistant from a different AI vendor, currently Codex; ChatGPT run by Ammar, or OpenCode with a non-Anthropic model, are the other accepted routes | Reviews mathematics and teaching; writes the hidden test problems from approved goals |

- No one's own checks count as independent review, and a model never reviews work it helped to make. Agreement between assistants does not prove correctness.
- Disagreements go to Ammar with both positions and a recommendation.
- Ordinary Git authorship is enough; no assistant credit labels are required.
- Reviews are recorded on the chapter's GitHub issue or pull request. The project record is the repository and its issues, not conversations.
- The book must not depend on any one assistant, proprietary workflow or contributor.
- Work is managed with the Matt Pocock skills (specification, tickets, then one ticket per session), inside the steps below. They do not replace Ammar's approvals or independent review.
- Each ticket has a branch and a pull request. Claude merges code once the automated tests and independent review pass. Ammar merges changes to the charter, gap assessment, table of contents, design specification and chapters, and is asked before the first public deployment.
- A new document is added only when an existing one cannot hold the content.

**Each chapter:**

1. Claude drafts the specification: goals, outline, prerequisites, misconceptions, acceptance criteria, and a proof register: each result, its assumptions, the earlier results it needs and where they were taught.
2. Ammar approves it.
3. The reviewer writes the hidden test problems in a separate file that Ammar does not open before the test. Claude checks their solutions only after the chapter is built.
4. Claude writes the chapter in Markdown, describing each interaction in place.
5. The reviewer checks its mathematics and teaching, and Claude fixes the findings.
6. Claude adds the interactions and automated tests. The Markdown file becomes the MDX source; there is never a second copy.
7. The reviewer checks the finished page, and Claude fixes the findings.
8. Ammar takes the chapter and its test on the finished page, then accepts it or returns it.

The pilot is approved at each major stage. Later chapters may be approved in batches.

## 9. Quality gates

| Gate | A chapter passes when |
| --- | --- |
| Mathematics | Numerical examples and answers are verified by script where practicable; derivations and claims are independently reviewed; assumptions and approximations are explicit |
| Learning | Ammar finishes it using only the book, solves the unseen transfer problems, passes a later retrieval check, and wants to continue; points of boredom or difficulty are recorded and addressed |
| Interaction | Every interaction has a purpose, useful feedback, correct mathematics and an accessible alternative; pictures, numbers and symbols agree; Python outputs are accurate and labelled |
| Engineering | Tests, build, deployment, accessibility and browser checks pass against thresholds set in the proof of concept |
| Publication | Rights, attribution and editorial review are complete; release-blocking defects are fixed; known limitations are stated |

The retrieval check comes at least two weeks after the test, at Ammar's own pace. It does not delay acceptance or later chapters, but a failed check reopens the chapter, and 1.0 needs every check passed.

Each published chapter says **"AI-reviewed, not expert-reviewed; tested by the owner"** until that changes. The project does not claim the book works for beginners in general. Unfinished content is labelled with its validation status.

Releases use semantic versions and state their completion status, supported environments, known limitations and open issues: 0.x while incomplete, and 1.0 when the full book passes every gate.

## 10. Order of work

1. Ammar approves this charter.
2. Gap assessment, and in parallel a technical proof of concept: a GitHub Pages build, one accessible interaction (adding two draggable arrows), one Run/Reset Python example, one Colab notebook, the script that reproduces the dataset checks, and performance, accessibility and output-verification tests. Its page is public, labelled "technical test, not a lesson", and asks search engines not to list it. It is finished when every check passes or Ammar accepts the limitation, its results set the section 9 thresholds, and Ammar has used the page. Its machinery is kept; only its sample page is deleted.
3. Ammar approves the gap assessment, then the table of contents. After the proof of concept, Ammar chooses the look from three prototypes and approves a short design specification covering components, notation, verification and accessibility.
4. Pilot chapter: vectors, unless the dependency map shows a better choice.
5. Ammar tests the pilot. Its method, meaning layout, tools and process, is revised and approved as the standard for later chapters. The pilot itself is then deleted.
6. All chapters, written in reading order from Part 0, including vectors again: Ready to Start ML, then Full Book.
