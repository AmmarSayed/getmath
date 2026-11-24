# GetMath — Project Charter v1.1: An Open, Interactive Book on the Mathematics Behind Machine Learning

24 November 2026 · Project owner: Ammar

## Status

Version 1.1, owner-directed revision of the 23 November 2026 consensus draft. It incorporates Ammar's decisions on browser interactions, Python examples, Google Colab, assessments, accessibility, and repository contribution records. The overall charter remains subject to project-owner approval. Changes must be documented in `DECISIONS.md`.

**Name: resolved.** On 23 November 2026 Ammar selected **GetMath** as the project name (section 10, D1).

## 1. What We Are Making

We will create an original, free, openly licensed, interactive textbook teaching the mathematical foundations of machine learning through problem-driven explanations, visual discovery, rigorous derivations, browser-based mathematical interactions, transparent Python demonstrations, and independent practice.

The textbook *Mathematics for Machine Learning* by Deisenroth, Faisal, and Ong (MML) is a primary coverage benchmark, not our writing template or required chapter structure.

We will independently evaluate its coverage against reputable university curricula, other textbooks, open educational resources, documented learner difficulties, and the mathematical demands of machine-learning algorithms.

All explanations, visualisations, exercises, examples, datasets, and instructional sequences will be independently designed or incorporated under verified compatible licences.

We may explain the same established mathematical concepts and derive the same standard mathematical results, but will not reproduce protected expression without appropriate permission.

Our objective is not simply to cover MML's topics. It is to identify what mathematical understanding a beginner needs for machine learning, determine where existing educational resources leave gaps, and build a more effective, self-contained learning experience.

Curriculum coverage and permission to reuse third-party material are separate considerations.

## 2. Who It Is For

### Entry requirements

- Secondary-school algebra; no Python experience is required for the core mathematics pathway.
- No prior calculus, linear algebra, or probability knowledge.
- No requirement for specialised mathematical software.
- Missing foundational skills will be taught within the course.

The primary audience is independent learners. The textbook must also be usable by teachers and instructors.

### Exit outcomes

A successful learner will be able to explain, mathematically derive at the declared level of scope, calculate and analyse small examples, interpret verified computational demonstrations, identify assumptions, and diagnose common numerical or modelling problems involving:

- Linear regression, including geometric, optimisation, probabilistic, and introductory Bayesian interpretations.
- Logistic regression.
- Principal Component Analysis (PCA).
- Gaussian Mixture Models and Expectation-Maximisation (EM).
- Support Vector Machines (SVMs), including margins, dual formulations, and kernels at the appropriate mathematical depth.
- Small feed-forward neural networks, including hand-derived backpropagation.

The course will prepare learners to study advanced machine-learning texts and university materials independently. It does not promise mastery of every mathematical technique in those resources. Optional Google Colab notebooks support learners who wish to execute or modify Python code; independent Python programming proficiency is not a prerequisite or a required core exit outcome.

### Three levels of mathematical competence

| Level | Evidence |
| --- | --- |
| 1 · Intuition | Explain what a mathematical object or operation means, why it matters, and what problem it solves. |
| 2 · Working understanding | Solve problems, interpret visualisations, perform calculations, and explain verified computational examples. Optional Colab work supports hands-on implementation. |
| 3 · Derivation and transfer | Justify mathematical results, identify assumptions, connect representations, and apply concepts to unfamiliar problems. |

Every major learning outcome will identify its expected competency level. The complete course must provide a pathway through all three levels.

## 3. Teaching and Learning Approach

### 3.1 Problem-first learning

Every major concept begins with a meaningful problem that demonstrates why the mathematics is needed. The mathematics is introduced as a tool for reasoning about or solving that problem, not as an isolated collection of formulas.

### 3.2 The learning sequence

Each substantive learning unit follows an adaptable sequence:

**Need → Intuition → Visualisation → Prediction → Experiment → Explanation → Derivation → Worked Example → Practice with Fading Help → Transfer → Retrieval**

This is a learning-design framework, not a rigid page template. Simple supporting concepts may use a shorter pathway. Difficult concepts may require several representations, experiments, worked examples, or explanations.

### 3.3 Meaningful interaction

Interactive elements must support a defined learning objective. Where applicable, a learner should:

1. Predict what will happen.
2. Manipulate a mathematical quantity or model.
3. Observe the result.
4. Explain the observed behaviour.
5. Connect the observation to the underlying mathematics.

Decorative sliders, animations, and interactions without educational value will not be included.

### 3.4 Connected representations

The course must explicitly connect intuitive and verbal explanations; geometric and graphical representations; mathematical symbols and equations; numerical calculations; read-only Python examples with verified expected results; optional runnable Google Colab notebooks; and practical machine-learning applications. Showing different representations side by side is insufficient. Learners must understand how they correspond.

### 3.5 Worked examples and faded practice

Each substantial concept will provide worked examples appropriate to its complexity. Practice will progressively reduce instructional assistance, moving from guided completion toward independent problem solving. Full solutions must be available on demand but should not be revealed before a meaningful attempt wherever practical. Short quizzes may be used when they genuinely assess a learning objective, but lesson-end quizzes are not mandatory; the assessment form depends on the topic.

### 3.6 Independent transfer

Learners must encounter problems that differ meaningfully from the examples used during instruction. Changing only the numerical values of an exercise does not necessarily demonstrate transfer.

### 3.7 Retrieval and retention

Important concepts will reappear through later practice, mixed exercises, and spaced retrieval. The course will distinguish immediate task performance from retained understanding.

### 3.8 Prerequisites and misconceptions

No symbol, operation, theorem, or prerequisite will be assumed silently. Every required prerequisite must have been introduced previously or be explained at the point of need. Each major concept must identify predictable misconceptions and incorporate activities or assessments that reveal the most consequential misunderstandings.

### 3.9 Mathematical and modelling honesty

The course must explicitly distinguish exact results from numerical approximations; formal definitions from explanatory analogies; mathematical facts from modelling assumptions; educational simulations from real model behaviour; and valid results from results that depend on restrictive assumptions.

Feature selection, units, scaling, modelling choices, and numerical methods must be presented as decisions with consequences rather than unquestionable procedures.

## 4. Shape of the Book

The following structure establishes the initial curriculum architecture. The final table of contents will be determined through the curriculum audit and prerequisite analysis.

| Part | Coverage |
| --- | --- |
| 0 · Mathematical Foundations | Algebra, functions, logarithms, exponentials, notation, summations, inequalities, graphs, numerical reasoning, angles where required, and reading simple Python demonstrations (optional Colab practice) |
| I · Data as Geometry | Vectors, coordinate systems, norms, angles, distances, matrices, linear transformations, systems of equations, rank, bases, orthogonality, projections, eigenvalues, eigenvectors, and Singular Value Decomposition |
| II · Change and Optimisation | Limits as needed, derivatives, partial derivatives, the chain rule, Jacobians, Hessians, integrals, gradient-based methods, loss functions, constrained optimisation, and numerical behaviour |
| III · Uncertainty and Statistics | Probability rules, conditional probability, Bayes' theorem, random variables, distributions, expectation, covariance, multivariate Gaussian distributions, likelihood, estimation, introductory statistical inference, entropy, and information theory |
| IV · From Mathematics to Machine Learning | Data and modelling assumptions, regression, classification, regularisation, model evaluation, PCA, Gaussian mixtures and EM, SVMs, introductory Bayesian regression, logistic regression, and neural networks |

### Curriculum classification

Every topic will be classified as one of:

- **Required Foundation:** mathematics necessary to understand subsequent concepts.
- **Required Application:** mathematical methods and machine-learning applications that form part of the exit promise.
- **Optional Enrichment:** additional depth that improves understanding but is not necessary for the required learning outcomes.

### Curriculum audit decisions

The curriculum audit will determine the appropriate treatment of constrained optimisation and SVM duality; integration and statistical inference; Bayesian reasoning and conjugate updating; Taylor approximations and local linearisation; numerical stability and conditioning; bias–variance trade-offs; and mathematical proof and rigour for beginner learners.

### Initial scope exclusions

The initial release will not attempt comprehensive coverage of measure theory; functional analysis; advanced MCMC or variational inference; normalising flows; full general convex duality theory; reinforcement learning; or transformer mathematics beyond an optional brief preview. Limited supporting theory may nevertheless be included when necessary to explain an in-scope algorithm accurately.

## 5. Licensing and Intellectual Property

### Original project material

| Material | Licence |
| --- | --- |
| Original educational text, figures, diagrams, and exercises | CC BY 4.0 |
| Original software source code | MIT |
| Eligible original datasets | CC0 1.0 |

### Third-party material

Third-party content may be incorporated only when its specific licence or permission authorises the intended use and distribution. Incorporated material retains its applicable licence. The project must document: source and provenance; original creator or rights holder, where applicable; licence and applicable conditions; required attribution; any modifications made; and compatibility with the intended distribution.

- Public-domain and CC0 materials may be used subject to provenance verification.
- Material requiring incompatible distribution terms will not be incorporated into the main content.
- No third-party material is automatically relicensed merely because it appears in the repository.
- AI-assisted content is subject to the same originality, mathematical accuracy, attribution, and provenance checks as other contributions.
- A project-wide source register and `THIRD_PARTY_NOTICES.md` file will be maintained.
- Software dependencies, fonts, illustrations, datasets, and other bundled assets must also undergo licence review.

## 6. Platform and Technical Architecture

### 6.1 Delivery

The textbook will be delivered as a static, computer-first, progressively enhanced web application (see D4 in section 10), initially on GitHub Pages. Core learning requires no user account, local Python installation, server-side execution, or project-controlled behavioural tracking. Optional Google Colab execution is external to GetMath and requires internet access and applicable Google access arrangements.

### 6.2 Content architecture

Educational content will be maintained in portable, version-controlled source files, using Markdown, mathematical notation, and reusable interactive components. The component model will support JavaScript mathematical labs, prediction activities, topic-appropriate assessments, faded practice exercises, read-only Python code blocks with Run and Reset controls for expected-output demonstrations, worked solutions, and retrieval activities. The provisionally selected interface stack must be validated through a technical proof of concept.

### 6.3 Python demonstration and optional Colab execution

GetMath will **not execute Python in the learner's browser**. Python examples are visible, read-only, and non-editable on the site. When applicable, the learner may press **Run** to reveal a preverified expected output or the result of an equivalent JavaScript mathematical calculation. **Reset** restores the example to its initial display or input state. The interface must visibly state that the output is **expected/simulated** and that Python has not executed on the page; it must not use wording that implies real Python execution.

Fixed examples may show precomputed results. Interactive examples must calculate results from their actual inputs in JavaScript and keep graphical, symbolic, and numerical outputs consistent. Each Python snippet and claimed output will be verified against actual Python using development or CI scripts before publication.

Where useful, a version-controlled **Open in Google Colab** link will lead to a matching notebook where learners may run, edit, and experiment with the actual Python. Colab use is optional, online, and external to the offline GetMath experience. The mathematical lesson, explanation, and core assessment must remain self-contained without Colab.

### 6.4 Offline operation

The platform will provide an explicitly tested offline learning experience. The supported offline package must contain required educational content, mathematical assets, JavaScript mathematical interactions, and expected-output demonstrations. Google Colab notebooks and Python execution are excluded from offline acceptance. Offline functionality must be verified rather than assumed from browser caching.

### 6.5 Accessibility

The platform will target WCAG 2.2 AA. Accessibility validation will include automated checks and manual keyboard and assistive-technology testing. Computer-first design does not exempt text and mathematics from small-screen readability and applicable reflow/zoom requirements; genuinely two-dimensional interactive content may use accessible alternatives. Every graphical interaction must offer an accessible alternative capable of achieving the same learning objective. Colour must not be the sole means of communicating information.

### 6.6 Learner progress

Learner progress will be stored locally by default and must support export, import, and reset. Four learning states will be available: Encountered, Practised, Provisional mastery, and Retained mastery. Progress states must be based on evidence: opening a page is not proof of understanding. Retained mastery requires successful later retrieval rather than a single correct response.

### 6.7 Mathematical transparency

The application must clearly distinguish educational simulation, verified expected output, actual JavaScript calculation, exact mathematical result, and numerical approximation. The Run button attached to a Python example is a display/simulation control, not a Python execution control.

## 7. Collaboration and Governance

### 7.1 Roles

| Role | Responsibilities |
| --- | --- |
| **Ammar · Project Owner** | Establishes the project's direction, approves major decisions, resolves disagreements, and determines final acceptance. |
| **ChatGPT · Curriculum and Independent Review Lead** | Curriculum research; coverage and gap analysis; prerequisite analysis; mathematical pedagogy; chapter specifications and storyboards; independent mathematical and educational review. |
| **Claude · Implementation and Engineering Lead** | Implementing approved chapter specifications; developing the web application and interactive components; maintaining source code; writing numerical and software verification scripts; running build, accessibility, and regression checks; producing implementation and test evidence. |

Both assistants must critically assess mathematical and pedagogical assumptions. Neither assistant's agreement alone establishes correctness.

### 7.2 Authoritative repository

One GitHub repository will be the authoritative project record. It will contain at minimum: `CHARTER.md`, `TOC.md`, `DECISIONS.md`, curriculum audit deliverables, chapter specifications, source and licence records, test and validation records, and a `handoffs/` directory. The exact repository organisation may evolve through documented decisions.

### 7.3 Version history and contributions

Use ordinary Git version history and authorised contributor identities for accountability. No mandatory `Author: ChatGPT`, `Author: Claude`, or other assistant-specific credit labels are required in files or commit messages. Contributions must be reviewable and substantial revisions identifiable in separate changes. Third-party copyright, licence, and source attribution requirements remain mandatory. Repository write access is governed by the project owner and the actual permissions of the authenticated account or integration; it is not a condition of approving the charter.

### 7.4 Decision management

Significant curriculum, scope, technical, or licensing decisions must be recorded in `DECISIONS.md`. Each entry will include the date, decision, rationale, decision authority, and consequences or affected deliverables where relevant. Substantial changes require Ammar's approval.

### 7.5 Disagreements

Unresolved disagreements will document both positions, supporting reasoning or evidence, expected consequences, and a recommended resolution. Disagreements will not be silently merged. Ammar makes the final decision.

### 7.6 Chapter development workflow

1. Prepare a chapter specification with objectives, prerequisites, misconceptions, examples, exercises, and acceptance criteria.
2. Obtain the required approval.
3. Implement the chapter and supporting automated tests.
4. Perform independent mathematical, pedagogical, and technical review.
5. Resolve findings and run regression tests.
6. Obtain Ammar's acceptance for the completed chapter or batch.

The pilot will receive explicit approval at major stages. Later production may use batch approvals to reduce unnecessary interruptions while preserving final owner authority. An implementer must not silently treat their own work as independently reviewed.

## 8. Quality Gates

A chapter is complete only when its applicable mathematical, pedagogical, interaction, engineering, and publication requirements pass.

| Gate | Evidence |
| --- | --- |
| 1 · Mathematical correctness | Verified numerical examples; independently reviewed derivations; explicit assumptions and domain restrictions; verified reference outputs and exercise answers; correct distinction between exact and approximate results. Computed examples verified through automated scripts wherever practicable; symbolic derivations and explanatory claims additionally require independent review. |
| 2 · Learning effectiveness | Learning objectives mapped to topic-appropriate assessments; verified prerequisite coverage; tasks targeting expected misconceptions; progressive practice with fading assistance; meaningful independent transfer exercises; appropriate opportunities for later retrieval. Quizzes are optional, not mandatory at lesson end. Completing a guided calculation alone does not establish understanding. |
| 3 · Interaction quality | Clearly defined instructional purposes; meaningful prediction and feedback; correct JavaScript mathematical behaviour; accurate and labelled Python expected-output demonstrations; accessible alternatives; consistency between visual, numerical, and symbolic representations. |
| 4 · Engineering quality | Passing automated tests; reproducible builds; tested GitHub Pages deployment and offline behaviour; responsive layouts; supported browser compatibility; accessible interactions; functional Run/Reset controls; regression checks for shared components. Measurable performance and compatibility thresholds are established and documented during the technical proof of concept. |
| 5 · Publication readiness | Verified rights and attribution; source records; editorial review; learner-testing evidence at applicable milestones; resolved release-blocking defects; documented known limitations. |

**Learner testing.** The gold-standard pilot must be tested with at least one representative beginner before it is approved as the baseline for public instructional content. Subsequent chapters will undergo periodic learner validation, particularly when introducing new interaction patterns or instructional approaches. Testing every individual section with a new beginner is not mandatory. Known defects must be documented, prioritised by severity, and addressed according to the release criteria.

## 9. Development Sequence

1. **Charter approval.** The two assistants agree on the charter. Ammar reviews and approves the project direction, scope, responsibilities, and working principles.
2. **Comprehensive curriculum audit.** One bounded audit, produced before approval of the final table of contents, with six required deliverables: a comprehensive topic inventory; a coverage comparison against MML and independently selected academic or educational benchmarks; a gap assessment, including mathematical and instructional gaps; a prerequisite dependency graph; a redundancy and overlap analysis; and recommended additions, each classified as required foundation, required application, or optional enrichment. Workflow: ChatGPT drafts the audit; Claude independently evaluates its findings, returning AGREE or CHANGE with reasons for each substantive finding; one review-and-response round is conducted; remaining disagreements are submitted to Ammar; Ammar decides and approves the audit. The audit must be sufficiently complete to support curriculum decisions but must not expand into an indefinite research exercise.
3. **Parallel technical proof of concept.** Claude develops a small proof of concept in parallel with the audit, demonstrating a deployable GitHub Pages build; one accessible, genuinely interactive JavaScript mathematical component; a read-only Python example with transparent Run/Reset expected-output behaviour; an optional matching Colab notebook; an offline learning bundle; and browser, keyboard, assistive-technology, performance, and output-verification tests. It does not depend on the curriculum structure; its purpose is to validate critical architectural assumptions before committing to a final implementation framework.
4. **Curriculum engineering.** Using the approved audit: learning outcomes, topic dependencies, core and extension classifications, mathematical depth, required applications, assessment coverage, and repetition and retrieval strategy.
5. **Final table of contents.** Derived from the approved curriculum: chapters, concept sequences, prerequisite relationships, mathematical applications, and assessment expectations.
6. **Technical and pedagogical design specification.** Reusable instructional components, storyboard conventions, mathematical notation standards, verification procedures, and accessibility requirements, incorporating the proof-of-concept findings.
7. **Gold-standard pilot.** One complete, representative chapter demonstrating the intended mathematical rigour, explanation quality, JavaScript visual interactions, read-only Python demonstrations with verified expected outputs, optional Colab implementation, worked examples, faded practice, transfer, retrieval, and verification.
8. **Learner validation and revision.** Learner testing and independent review; issues documented and corrected; Ammar approves the revised pilot as the instructional and implementation standard.
9. **Incremental production.** Remaining chapters developed and validated against the approved curriculum, specifications, and quality gates. Chapter order may be adjusted only through documented dependency-based decisions.

## 10. Decisions (provisional)

The following provisional decisions reflect the original 23 November 2026 baseline and owner-directed updates on 24 November 2026. They stand until changed through a dated entry in `DECISIONS.md` (section 7.4). Decisions that require technical validation are explicitly marked as such; they are not open-ended invitations to expand project scope.

| # | Decision | Provisional position |
| --- | --- | --- |
| D1 | Working name | **GetMath**, selected by Ammar. Subtitle: *An Open, Interactive Book on the Mathematics Behind Machine Learning*. Any future name change requires an entry in `DECISIONS.md`. |
| D2 | Repository | Slug `getmath`, public from creation. The README separates "project in progress" from "chapter approved for instruction" and updates as chapters pass their gates. |
| D3 | Technology stack | Astro static site with MDX content and TypeScript, with Zod-validated content schemas. Svelte islands for JavaScript mathematical interactions; SVG and D3 for graphics; Three.js only where real 3D contributes educational value. KaTeX for mathematical rendering; add MathJax only if assistive-technology testing demonstrates a need. Read-only Python code blocks with Run/Reset controls reveal **labelled expected/simulated outputs**; no Pyodide, CodeMirror editor, or in-browser Python execution. Optional matching Google Colab notebooks enable actual Python execution. Workbox service worker for offline learning; IndexedDB for locally stored progress with JSON export/import. Python/NumPy/SymPy scripts may verify outputs during development or CI but do not run for learners. Vitest, Playwright and axe-core in GitHub Actions; pnpm on supported Node LTS. Verify performance, accessibility, GitHub Pages deployment, and offline operation in the proof of concept. |
| D4 | Supported browsers | **Computer-first** (Ammar, 23 Nov 2026). The book is designed for study on a laptop or desktop with keyboard and mouse or trackpad: the primary layout targets screens 1280 px wide and up, with 1024 px as the minimum fully supported width. Tablets in landscape are supported. On phones, text and maths stay readable and meet applicable reflow and zoom requirements; complex two-dimensional components may use accessible static or alternative interactions that achieve the learning objective. Browsers: latest two versions of Chrome, Edge, Firefox and Safari on Windows and macOS. Safari on iPad is tested on a real device. Python is never executed on the site. |
| D5 | Examples and datasets | Seeded synthetic data first, with the generating script committed. Real datasets only under CC0 or CC BY, with provenance and attribution recorded (candidate: Palmer Penguins, CC0). |
| D6 | Pilot chapter | Vectors and vector operations are the provisional pilot choice, to be confirmed after the curriculum audit and final table of contents. |
| D7 | Versioning | Semantic versions: 0.x for incomplete releases, each labelled with its validation status; 1.0 when the full core curriculum passes every quality gate. Charter versions are tracked separately from book releases. |
| D8 | Language, depth, licences | English first, with an architecture ready for Arabic (RTL). Three competency levels. CC BY 4.0 for content, MIT for code, CC0 for data. Progress stored locally. Incremental, versioned releases. |
| D9 | Hosting and domain | GitHub Pages at its default address; a custom domain later if wanted. Repository subpaths and offline asset paths are tested. No change of host is anticipated for the JavaScript-only learning runtime; consider alternatives only if the proof of concept reveals a concrete unmet requirement. |
| D10 | Security model | No learner-supplied code executes on GetMath. JavaScript interactive components accept constrained inputs and must be tested for safe rendering, validation, resource handling, and dependency risks. Optional Python execution takes place separately in Google Colab, subject to its access and privacy arrangements. |
| D11 | Offline acceptance | Two supported modes, each tested separately: (a) the website working offline after an explicit, successful download or install; (b) a downloadable package run through a documented local-serving method. Tests cover content and asset completeness, storage limits, JavaScript interactions, and Python example expected-output displays. Colab and actual Python execution are not part of offline acceptance. |

Repository migration remains a separate operational task: establish `getmath` as the authoritative repository, preserve the approved materials and decision records, and retire only the explicitly designated old repositories after verifying backups. No special collaborator access or assistant-specific commit labels are required by this charter.

## 11. Curriculum Evidence and Traceability

Every chapter and concept must be traceable to a documented learning need, a prerequisite dependency, a mathematical or machine-learning application, a measurable learning outcome, and an assessment capable of testing that outcome.

The curriculum audit will evaluate coverage, gaps, and redundancy against MML and independent benchmarks. It will distinguish omissions in topic coverage from shortcomings in explanation, visualisation, practice, rigour, or accessibility.

The final structure must be justified by learning dependencies rather than by the ordering of any reference text. A topic is not included solely because a benchmark contains it, nor excluded solely because a benchmark omits it.

## 12. Editorial and Mathematical Standards

- Notation is consistent; the role and dimensions of every variable are explained; assumptions are stated; exact and approximate results are distinguished.
- Derivations are complete at their declared depth: no unexplained algebraic jumps, hidden theorems, or techniques that have not been introduced.
- The text distinguishes intuition, analogy, formal definition, derivation or proof, numerical experiment, and modelling assumption.
- Major units identify common misconceptions and demonstrate transfer beyond the worked examples.
- Unnecessary repetition is avoided through prerequisite links, concise recall sections, and spaced retrieval.
- Editorial consistency must not eliminate legitimate alternative explanations.
- Mathematical correctness takes precedence over visual simplicity or narrative convenience.

## 13. Maintainability and Reproducibility

The repository will contain machine-readable curriculum metadata, versioned dependency specifications, reproducible numerical test fixtures, documented content schemas, verification scripts, source and attribution records, and documented build and maintenance procedures.

Components should be reusable without sacrificing readability or mathematical flexibility. Generated assets must have traceable sources or reproducible generation procedures. Changes to shared components require regression testing.

The project must be maintainable independently of either assistant's conversation history. The repository, not any conversation, is the authoritative record.

## 14. Boundaries, Privacy and Release Policy

**14.1 Educational value.** Clarity takes priority over feature count. New components and topics must demonstrate instructional value relative to their cost. Complexity is not added merely to appear sophisticated.

**14.2 Privacy.** Learner progress is stored locally by default. No personal data is required to use the core book. Optional external Colab links may require a Google account, internet connectivity, and acceptance of Google's own terms and privacy arrangements; GetMath must make the boundary clear. Hosting arrangements and any third-party data handling are documented.

**14.3 Publication maturity.** Each release states its version, completion status, validation status, supported environments, known limitations, and relevant unresolved issues. Public source code does not imply that unfinished content is approved for instruction.

**14.4 Scope control.** New requirements are evaluated against the charter, curriculum dependencies, learner needs, and maintenance burden. Optional features must not delay essential coverage without an approved reason.

**14.5 Long-term independence.** The book must remain freely accessible, reproducible, and maintainable without reliance on a particular AI assistant, proprietary workflow, or individual contributor.

## Charter Approval

This charter establishes the project's mission, principles, boundaries, technical direction, responsibilities, quality standards, and development sequence. Version 1.1 incorporates the project owner's changes to the original collaborative draft.

|  | Status |
| --- | --- |
| Prior collaborative draft | Reviewed by ChatGPT and Claude on 23 November 2026 |
| Owner-directed revisions | Incorporated on 24 November 2026 |
| Full charter baseline approval | Pending explicit project-owner sign-off |

Upon Ammar's full approval, this charter becomes the governing baseline for the project; subsequent changes follow the decision process in section 7. The first substantive deliverables will be the comprehensive curriculum audit and parallel technical proof of concept.
