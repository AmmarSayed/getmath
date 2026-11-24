# ML-preparation curricula compared with the gap assessment

Compares the first draft of `docs/gap-assessment.md` with official curricula. Accessed 2026-11-24. Labels follow that document (M1, M2, G-numbers, Q-numbers). "0 hits" means a text search of the extracted file found nothing; extraction can miss text.

## 1. Answer

1. Most of the gap assessment holds. Softmax in M1 (Q3), bias–variance, LLN/CLT, cross-entropy and the Cholesky exclusion are all supported.
2. Missing foundations, all needed only because our charter derives results in full: Markov and Chebyshev inequalities, the mean value theorem, induction, the derivative of an inverse function, integration by parts, improper and iterated integrals, the categorical distribution, estimator bias, and the rank-deficient pseudoinverse.
3. Wrong milestone: one-variable linear change of variables (M1, not M2), and the confidence interval for a held-out error (M1, not M2).
4. Q2 stands, but exact coefficient intervals need Student's t, which we do not teach; use known-variance or large-sample intervals and the bootstrap.
5. Included but not required by any source read: general inner products, affine spaces beyond hyperplanes, 2D rotations.

## 2. Topics

"Status" is the status in the gap assessment. Source links are in section 4.

| Topic | Sources requiring it | Status | Section 2 model that needs it | Recommendation |
| --- | --- | --- | --- | --- |
| Softmax | [CS229 notes][notes] 2.3, [D2L][d2l] 4.1, [Deep Learning ch. 4][dl4] and [6.2.2.3][dl6], [Google multi-class][mlccmc], [Advanced Learning Algorithms][ala] (listed by [OSSU][ossuds]) | G11, M1 pending Q3 | Neural networks (multi-class output) | **M1.** CS229 and D2L teach it before neural networks |
| Categorical distribution | [Deep Learning 3.9.2][dl3], [CS109][cs109] lecture 13, [CS229 notes][notes] 2.3 | Not named | Softmax; mixtures (component labels) | Add, M1 |
| Other distributions: Poisson, exponential, geometric, Beta, Gamma | [Stat 110][s110], [CS229 probability][prob] 2.6, [18.05][s1805], [D2L][d2lm] 22.8 (Poisson) | Not named | None. Binomial (G3) and uniform (simplest density, G5) are useful | Name uniform and binomial. **Changed:** geometric, Poisson and exponential also in M1, optional; Beta and Gamma not in 1.0 |
| Markov, Chebyshev inequalities | [6.042 ch. 19][c19] (listed by [OSSU CS][ossucs]), [D2L 2.6][d2lp] and [22.6][d2lrv] | Missing; also 0 hits in MML | Held-out error, through G16's proof of the weak law | Add to G16, M1 |
| Hoeffding, union bound, sample complexity | [CS229 notes][notes] 8.3, [D2L 4.6][d2lg] | Not named | None | Not in 1.0 |
| LLN, CLT | [Stat 110][s110], [18.05][s1805cal] class 6b; CLT: [CS109][cs109] 15, [Deep Learning ch. 5][dl5]; both named in [D2L 2.6][d2lp] | G16, M1 | Held-out error; maximum likelihood | Keep |
| Bias–variance | [CS229 notes][notes] 8.1, [2018 syllabus][syl] lecture 8, [Deep Learning 5.4.4][dl5], [D2L 22.10][d2ls] | G15, M1 | Regression and its regularisation | Keep |
| Estimator bias and mean squared error | [Deep Learning 5.4][dl5], [D2L 22.10][d2ls] | Not named | Regression; Gaussian MLE variance | Add to G15; G15 cannot be derived without it |
| Confidence intervals | [Deep Learning 5.4.3][dl5] (test error), [18.05][s1805cal] classes 22–23, [D2L 22.10][d2ls] | G17, M2, "nothing in section 2 directly" | Judging a held-out error; linear-regression coefficients | Split: test error M1, coefficients M2 |
| Bootstrap | [18.05][s1805cal] class 24, [CS109][cs109] 16, [ISLP][islp] (resampling chapter) | Q2, M2 | Linear regression when assumptions fail | Keep, M2 |
| Hypothesis tests, p-values | [18.05][s1805cal] classes 17–19, [CS109][cs109] 16, [D2L 22.10][d2ls], [Udacity][ud] (listed by [OSSU][ossuds]), [ISLP][islp] (multiple testing) | G17: optional; Q2: not in 1.0 | None. 0 hits for "hypothesis test" and "p-value" in the [CS229 notes][notes] | Not in 1.0 at first. **Changed on 2026-11-24 by Ammar's rule:** M2. [DeepLearning.AI][dlai], *Mathematics for ML and Data Science*, week 4, teaches p-values, test power, t-tests and A/B tests |
| t, chi-square, ANOVA | [18.05][s1805cal] classes 18–19; t: [Stat 110][s110], [Udacity][ud], [DeepLearning.AI][dlai] | Not named | Exact coefficient intervals; comparing models | **Changed:** Student's t in M2. Chi-square and ANOVA not in 1.0 |
| Newton's method | [18.01][s1801], [CS229 notes][notes] 2.4, [Deep Learning 4.3.1][dl4], [D2L 12.3][d2lgd] | Not named | None: logistic regression is fitted by gradient descent | **Changed:** optional, M1 (G46) |
| General change of variables | [18.02][s1802], [Deep Learning 3.12][dl3], [D2L 22.5][d2li], [CS229 notes][notes] 13.2 (ICA only) | Linear only, M2 | One variable: Gaussian in linear regression. Many: mixtures, Bayesian regression | Linear only, but one variable **M1**; many M2 |
| Multiple integrals | [18.02][s1802], [D2L 22.5][d2li] | Missing; G5 names integrals only | Sums of continuous variables; Gaussian marginals in Bayesian regression and mixtures | Add iterated two-variable integrals: light M1, used M2. Line, surface and vector-calculus theorems not in 1.0 |
| Integration by parts, improper integrals | [18.01][s1801], [OSSU Calculus 1C][c1c] (improper), [1B][c1b] (by parts) | By parts mentioned only as absent from MML; improper not named | Gaussian variance in linear regression | Add both to G5 |
| Mean value theorem | [18.01][s1801] | Missing; also 0 hits in MML | Logistic regression convexity, the fundamental theorem | Add to G6, M1 |
| Derivative of an inverse function | [18.01][s1801] | G4 names product and chain rules only | Logs: every likelihood | Add to G4 |
| L'Hôpital, related rates, volumes, series, differential equations | [18.01][s1801] | Not named | None | Not in 1.0 |
| Induction, proof patterns | [6.042][mcs] chs. 2–3 (listed by [OSSU CS][ossucs]) | G1 says "how to read a proof" | PCA, through the spectral theorem | Name induction in G1 |
| Pseudoinverse | [18.06SC][s1806sc], [Deep Learning 2.9][dl2] | Not named. MML defines it only as (AᵀA)⁻¹Aᵀ (pp. 35, 86) | Linear regression with dependent features | Add to the SVD row, M1 |
| Lagrangian, KKT, conditions for strong duality | [CS229 notes][notes] 6.5, [Deep Learning 4.4][dl4], [18.02][s1802] (equality only) | M2 | SVMs | Keep |
| LU | [18.06][s1806] | Not named | None: elimination is enough | Not in 1.0; list it |
| QR | [18.06][s1806] | Not named; Gram–Schmidt included | None beyond Gram–Schmidt | Not in 1.0; list it |
| Cholesky | None: absent from the 18.06 calendar, CS229 reviews and notes (0 hits), Deep Learning chs. 2–5 (0 hits), D2L mathematics pages (0 hits) | Excluded | None | Keep excluded |
| Fourier, Jordan form, Markov matrices, linear programming | [18.06][s1806], [18.06SC][s1806sc] (Jordan form) | Linear programming excluded; rest not named | None | Not in 1.0 |
| Entropy, KL, cross-entropy | [Deep Learning 3.13][dl3], [D2L 22.11][d2lm], [CS109][cs109] 18 (information theory) | G9, M1 | Logistic regression, neural networks, EM | Keep |
| Numerical behaviour | [Deep Learning 4.1–4.2][dl4], [D2L 5.4][d2l] | G18, M1 | Logistic, mixtures, neural networks | Keep |
| Classification metrics | [Google MLCC][mlcc], [CS229 2018][syl], [Advanced Learning Algorithms][ala] | G14, M1 | Logistic regression | Keep |
| Mean, median, outliers, histograms | [Google prerequisites][pre], [18.05][s1805] (histograms) | Only "summary statistics" | Linear regression (outliers); mixtures (several peaks) | Name them, M1 |
| k-means | [CS229 notes][notes] 10, [Deep Learning 5.8.2][dl5] | Not named | None; motivates EM | Not in 1.0, or one remark in mixtures |
| Naive Bayes, Gaussian discriminant analysis, GLMs, perceptron | [CS229 notes][notes] 2–4 | Exponential family excluded; rest not named | None | Not in 1.0; list them |
| Tensors | [Google prerequisites][pre], [Deep Learning 2.1][dl2], [D2L 2.3][d2l] | Excluded | None | Keep excluded; define the word once |

**Included, but not required by the sources read.** Keep unless stated: the charter's rule is need, not consensus.

- General inner products: MML only. Cut to enrichment; kernels need the dot product of feature maps.
- Affine spaces: only hyperplanes appear ([D2L 22.1][d2lm]). The existing "adapt" decision is right.
- 2D rotations: a picture for SVD only. Keep it small.
- Gram–Schmidt and change of basis: only [18.06][s1806]. Keep; our spectral proof and PCA route use them.
- SVD: [18.06][s1806] and [Deep Learning 2.8][dl2] require it; the [CS229 linear algebra review][lin] and [notes][notes] have 0 hits. Charter scope, so keep.
- EM failures and gradient-descent convergence proofs go beyond the syllabuses read. Section 2 and section 4 of the charter require them.

## 3. Findings that contradict the gap assessment (as first drafted; since merged into it)

1. **G17 against G16.** G17 says intervals serve "nothing in section 2 directly" and sits in M2. G16 (M1) asks the learner to "give a test error with its uncertainty". [Deep Learning ch. 5][dl5] builds exactly that: a 95% interval for test error from the CLT and standard error. It belongs in M1.
2. **Q2 has a hidden dependency.** With the noise variance estimated, exact intervals for regression coefficients use Student's t, a distribution we do not teach ([18.05][s1805cal] gives t and related distributions two classes). Recommended definition of "deeper statistical inference": sampling distribution of coefficients with known variance; large-sample normal intervals; bootstrap; credible intervals from Bayesian regression. State the approximation. Tests, p-values and t not in 1.0. *Counter-evidence:* [18.05][s1805cal] and [D2L 22.10][d2ls] teach intervals together with tests, so this is a scope decision, not a consensus.
3. **Hypothesis tests have two statuses.** Section 4 calls them optional enrichment; Q2 recommends "not in 1.0". Choose one.
4. **6.7 is in the wrong milestone in part.** M1 teaches the Gaussian density, and x = μ + σz is a linear change of variables. Move the one-variable case to M1.
5. **G16 cannot be done as listed.** "Prove the weak law" needs Chebyshev, and so Markov, or an equivalent. Neither is named.
6. **G6 and G7 have unnamed prerequisites.** Proving that a non-negative second derivative gives convexity normally uses the mean value theorem, which follows from section 5's fact 1. G7's spectral proof inducts on dimension. (These are our mathematical judgements; the sources only show where the topics are taught.)
7. **Section 5 is incomplete.** Iterated integrals use exchange of order (Fubini). Add it as "not proved here".
8. **The pseudoinverse gap was missed.** MML's formula needs full column rank; it fails in exactly the collinear case that section 2's "common failures" covers. [Deep Learning ch. 5][dl5] uses the pseudoinverse for an underdetermined fit.

Supported on inspection: G24. The [CS229 notes][notes] (section 6.5) state strong duality only with convexity and a strictly feasible point, unlike MML p. 236.

## 4. Sources

| Source and what was read | Licence stated |
| --- | --- |
| OSSU [Data Science][ossuds], [Computer Science][ossucs] readmes: mathematics and ML sections. In CS, linear algebra and probability are electives ("Advanced math") | [CC BY-SA 4.0][ossulic]; [MIT][ossucslic] |
| MIT [18.06][s1806] calendar and [syllabus][s1806syl]; [18.06SC][s1806sc] contents; [18.01][s1801] and [18.02][s1802] calendars; [18.05][s1805] syllabus and [calendar][s1805cal]; [6.042][mcs] chapter list and [ch. 19][c19] headings | [CC BY-NC-SA 4.0][ocw] |
| OSSU-linked calculus [1B][c1b], [1C][c1c]: overview pages | Not checked |
| Harvard [Stat 110][s110]: official catalogue description, Fall 2026 | None seen |
| Stanford [CS229][cs229] prerequisites; [linear algebra][lin] and [probability][prob] reviews and [Spring 2026 notes][notes]: contents, text search, selected sections; [2018 syllabus][syl] | None found |
| Stanford [CS109][cs109] schedule, Autumn 2026 (named in CS229's prerequisites) | None found |
| *Deep Learning* [contents][dlb]; section headings of [ch. 2][dl2], [3][dl3], [4][dl4], [5][dl5], [6][dl6]; selected passages | None; site says the publisher's contract limits copying |
| *Dive into Deep Learning* [contents][d2l]; headings of preliminaries [2.3, 2.4, 2.6][d2lp] and the [mathematics appendix][d2lm]; parts of 4.6, 12.2, 12.3 | [CC BY-SA 4.0][d2llic] |
| Google MLCC [prerequisites][pre], [module list][mlcc], [multi-class page][mlccmc] | CC BY 4.0 (text), Apache 2.0 (code) |
| [ISLP][islp] chapter list; [Udacity][ud] lesson list; [Advanced Learning Algorithms][ala] syllabus | None checked |

Nothing was copied. CC BY-NC-SA and CC BY-SA text must not enter our CC BY 4.0 text.

## 5. Not verified

- Harvard's own Stat 110 site and syllabus refused access (403); only the catalogue entry was read. Whether it covers inequalities is unverified.
- ISLP's detailed contents: the PDF link leads to an external file that was not read.
- CS229's current schedule and problem set 0 need a Stanford login; the schedule text in the page source is commented out and was not used.
- CS109 beyond lecture titles, the MATH51/MATH151/CS205L prerequisites, and Coursera beyond titles were not read.
- Most claims rest on contents, headings and text searches, not on reading every section.

## 6. GitHub repositories

Explored on 2026-11-24 through the GitHub API: descriptions, licences, file lists and issue titles. Nothing was copied. "None" means that GitHub detected no licence, so treat the content as not reusable.

| Repository | What it is | Licence | Use to GetMath |
| --- | --- | --- | --- |
| [mml-book/mml-book.github.io][ghmml] | MML's site, tutorials and errata issues | None | Issues point to errors and difficult passages |
| [ilmoi/MML-Book][ghil] | MML exercise solutions | None | Not a reference: its own issues report wrong answers (#25, #33) |
| [anp-exe/mml-exercises][ghanp] | MML exercise solutions | MIT | None: our exercises are original |
| [vbartle/MML-Companion][ghvb] | Python notebooks for MML chapters 2–7 | None | Idea only |
| [QBobWatson/ila][ghila] | Interactive Linear Algebra, with demos | None (issue #36 asks for one) | Reader feedback; demo ideas |
| [seeingtheory/Seeing-Theory][ghst] | Interactive probability | Apache-2.0 | Demo ideas |
| [idyll-lang/idyll][ghid] | Interactive-essay tool | MIT | Compare when choosing site tools |
| [3b1b/videos][gh3b] | Animation source | Custom | Idea only |
| [d2l-ai/d2l-en][ghd2l] | *Dive into Deep Learning* source | CC BY-SA 4.0 text | Coverage comparison only |

What the issues suggest, as weak evidence because most issues are typo reports:

- MML's issues by chapter: 6 (113), 2 (109), 4 (104), 5 (57), 3 (38), 7 (34), 10 (34), 9 (32), 8 (31), 11 (15), 12 (12). Early chapters also have more readers.
- The earlier Interactive Linear Algebra repository has 416 issues. The sections named most in feedback titles are solution sets (24), subspaces (22), linear independence (21), stochastic matrices (21) and projections (19).
- Repeated themes there: points against vectors, what "dimension" means for a matrix, crowded 3D pictures, and interactives placed between related figures.

[ghmml]: https://github.com/mml-book/mml-book.github.io
[ghil]: https://github.com/ilmoi/MML-Book
[ghanp]: https://github.com/anp-exe/mml-exercises
[ghvb]: https://github.com/vbartle/MML-Companion
[ghila]: https://github.com/QBobWatson/ila
[ghst]: https://github.com/seeingtheory/Seeing-Theory
[ghid]: https://github.com/idyll-lang/idyll
[gh3b]: https://github.com/3b1b/videos
[ghd2l]: https://github.com/d2l-ai/d2l-en
[ossuds]: https://github.com/ossu/data-science
[ossucs]: https://github.com/ossu/computer-science
[ossulic]: https://github.com/ossu/data-science/blob/master/LICENSE.md
[ossucslic]: https://github.com/ossu/computer-science/blob/master/LICENSE
[s1806]: https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/pages/calendar/
[s1806syl]: https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/pages/syllabus/
[s1806sc]: https://ocw.mit.edu/courses/18-06sc-linear-algebra-fall-2011/pages/syllabus/
[s1801]: https://ocw.mit.edu/courses/18-01-single-variable-calculus-fall-2006/pages/calendar/
[s1802]: https://ocw.mit.edu/courses/18-02-multivariable-calculus-fall-2007/pages/calendar/
[s1805]: https://ocw.mit.edu/courses/18-05-introduction-to-probability-and-statistics-spring-2022/pages/syllabus/
[s1805cal]: https://ocw.mit.edu/courses/18-05-introduction-to-probability-and-statistics-spring-2022/pages/calendar/
[mcs]: https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-fall-2010/pages/readings/
[c19]: https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-fall-2010/resources/mit6_042jf10_chap19/
[ocw]: https://ocw.mit.edu/pages/privacy-and-terms-of-use/
[c1b]: https://learn.mit.edu/courses/course-v1:MITxT+18.01.2x
[c1c]: https://learn.mit.edu/courses/course-v1:MITxT+18.01.3x
[s110]: https://locator.tlt.harvard.edu/course/colgsas-110766/
[cs229]: https://cs229.stanford.edu/
[lin]: https://cs229.stanford.edu/section/cs229-linalg.pdf
[prob]: https://cs229.stanford.edu/section/cs229-prob.pdf
[notes]: https://cs229.stanford.edu/main_notes.pdf
[syl]: https://cs229.stanford.edu/syllabus-autumn2018.html
[cs109]: https://web.stanford.edu/class/cs109/schedule.html
[dlb]: https://www.deeplearningbook.org/
[dl2]: https://www.deeplearningbook.org/contents/linear_algebra.html
[dl3]: https://www.deeplearningbook.org/contents/prob.html
[dl4]: https://www.deeplearningbook.org/contents/numerical.html
[dl5]: https://www.deeplearningbook.org/contents/ml.html
[dl6]: https://www.deeplearningbook.org/contents/mlp.html
[d2l]: https://d2l.ai/
[d2lp]: https://d2l.ai/chapter_preliminaries/probability.html
[d2lm]: https://d2l.ai/chapter_appendix-mathematics-for-deep-learning/index.html
[d2lrv]: https://d2l.ai/chapter_appendix-mathematics-for-deep-learning/random-variables.html
[d2li]: https://d2l.ai/chapter_appendix-mathematics-for-deep-learning/integral-calculus.html
[d2ls]: https://d2l.ai/chapter_appendix-mathematics-for-deep-learning/statistics.html
[d2lg]: https://d2l.ai/chapter_linear-classification/generalization-classification.html
[d2lgd]: https://d2l.ai/chapter_optimization/gd.html
[d2llic]: https://github.com/d2l-ai/d2l-en/blob/master/LICENSE
[pre]: https://developers.google.com/machine-learning/crash-course/prereqs-and-prework
[mlcc]: https://developers.google.com/machine-learning/crash-course
[mlccmc]: https://developers.google.com/machine-learning/crash-course/neural-networks/multi-class
[islp]: https://www.statlearning.com/
[ud]: https://www.udacity.com/course/intro-to-inferential-statistics--ud201
[dlai]: https://www.coursera.org/learn/machine-learning-probability-and-statistics
[ala]: https://www.coursera.org/learn/advanced-learning-algorithms
