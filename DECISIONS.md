# GetMath — Decision Register

The project charter is the primary baseline. This register records substantive owner-directed amendments; technical specifications and implementation choices must remain consistent with these decisions. All dates use the project owner's local date.

## 2026-11-24 — Charter v1.1 owner-directed amendments

| ID | Decision | Rationale and consequences | Authority |
| --- | --- | --- | --- |
| D3-A | Use Astro/TypeScript and JavaScript-based interactive mathematical components. Do not run Python on the GetMath website. Remove Pyodide, CodeMirror, and browser Python Workers from the required stack. | Simplifies GitHub Pages deployment, offline operation, security, and maintenance. The proof of concept will validate JavaScript interaction, accessibility, and performance. | Ammar |
| D3-B | Show read-only Python snippets with **Run** and **Reset** controls. Run displays a verified expected/simulated output or a JavaScript-computed equivalent; Reset restores the starting state. The interface clearly states that Python is not executed. | Preserves code-to-mathematics connections without misleading learners. Use Python development/CI verification against displayed outputs. | Ammar |
| D3-C | Provide optional, corresponding Google Colab notebooks for actual Python execution and learner modification. | Enables hands-on implementation without bundling a Python runtime. Core mathematical content remains self-contained and accessible without Colab; Colab requires online access and possibly a Google account. | Ammar |
| D4-A | Retain a computer-first experience; preserve readable text/mathematics and assistive-technology alternatives on smaller screens. | Complex mathematical interactions receive usable alternatives; accessibility testing remains a requirement. | Ammar |
| D3-D | Use KaTeX as the initial mathematical renderer; introduce MathJax only if accessibility testing demonstrates a specific need. | Avoids redundant dependencies while retaining mathematical accessibility as an acceptance requirement. | Ammar, provisionally subject to technical validation |
| D6-A | Keep vectors as the *provisional* pilot, pending confirmation through the curriculum audit. | Prevents prejudging the final prerequisite analysis. | Ammar |
| D8-A | Use topic-appropriate formative assessment, worked practice, transfer tasks, and retrieval. No compulsory quiz at the end of every lesson. | Assessment should serve objectives rather than satisfy an arbitrary page template. | Ammar |
| D10-A | No learner-supplied code executes within GetMath. Test JavaScript input validation, accessible results, dependency and content security, and privacy. | Replaces the obsolete Python-in-worker trust model. | Ammar |
| D11-A | Offline acceptance covers mathematical content, required assets, JavaScript interactions, and expected-output displays; it excludes actual Python and Colab. | Keeps the offline requirement compatible with the simplified architecture. | Ammar |
| D7-A | Use ordinary authorised Git authorship and version history; do not require special ChatGPT/Claude author labels or contributor permissions as a charter condition. | Keeps governance and review evidence without unnecessary AI attribution conventions. Third-party licensing attribution remains mandatory. | Ammar |
| D9-A | Keep GitHub Pages as the initial host, changing hosting only if a concrete requirement fails in the proof of concept. | Avoids infrastructure complexity before evidence shows a need. | Ammar |

## Relationship to prior decisions

The original charter decisions D1–D11 remain in effect except where modified by this 24 November 2026 register. Future changes must record the date, authority, rationale, and affected deliverables.

## Publication status

The v1.1 charter contains the owner's requested amendments. Formal approval of the complete charter baseline remains pending until explicitly given by the project owner.
