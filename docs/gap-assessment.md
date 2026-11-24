# Gap assessment: *Mathematics for Machine Learning*

**Status:** approved by Ammar on 2026-11-24. Q1 to Q3 (section 8) are applied to `CHARTER.md`. Required by `CHARTER.md` section 5. Independent reviews: Gemini 4 Argon through OpenCode, the backup route because Codex is out of quota until 20 December 2026 (draft up to G36); GPT 6.2 high in the ChatGPT app, run by Ammar, as Ammar reports (up to G42); Gemini 4 Argon again (focused on G43 to G47 and the changed rows and charter). GPT-6 Luna, a small model, did an earlier light check. The fixes from Gemini's second review were checked only by Claude.

**Source:** Deisenroth, Faisal and Ong, *Mathematics for Machine Learning* (MML), PDF dated 2024-01-15, <https://mml-book.github.io>. MML's terms are personal use only, with no redistribution or derivative works, so GetMath uses it only to check coverage. Page numbers are the printed ones.

**Method:** Claude and DeepSeek (`deepseek-v4-pro`, through OpenCode) each assessed the same text against the charter. Claude wrote down its findings before reading DeepSeek's. Claude then checked DeepSeek's main claims against the text and merged the two. A research agent of Claude's then compared the result with university and OSSU curricula (`references/curricula-comparison.md`); its findings are merged and marked R. DeepSeek's share is a second assessment, not the formal review. "0 hits" means a whole-text search found nothing; extraction garbles some formulas. Claude then read the text of pages 9 to 392, checked eight pages as images, and explored GitHub repositories and their issues (`references/curricula-comparison.md` section 6); findings from that pass are marked P.

**Labels:** M1 = Ready to Start ML, M2 = Full Book. Found by: C = Claude, D = DeepSeek, B = both, R = curricula research, P = full read-through, G = Luna's check, N = Gemini's review, H = ChatGPT's review.

## 1. Verdict

MML is a good topic baseline but not a beginner's book, and it does not cover all of the charter's models.

- It expects readers to have seen derivatives, integrals and geometric vectors (p. 3). GetMath's learner has only school algebra.
- It never develops two promised models: logistic regression and trained neural networks.
- It states several results that the charter requires us to derive.
- The charter's milestone lists leave out topics that their own models need (section 6).

## 2. Coverage of MML

"Adapt" means teach the part named and drop the rest.

| MML | Topic | Prerequisites MML assumes | Decision | Milestone |
| --- | --- | --- | --- | --- |
| 2.1–2.3 | Linear systems, matrices, elimination | Algebra, index and sum notation | Include | M1 |
| 2.4 | Vector spaces and groups | Sets, quantifiers, proof | Adapt: ℝⁿ and subspaces; groups out | M1 |
| 2.5–2.6 | Independence, basis, rank | Sets, systems | Include | M1 |
| 2.7 | Linear mappings | Functions | Adapt: matrices as maps, column and null space, rank–nullity, change of basis | M1 |
| 2.8 | Affine spaces | Subspaces | Adapt: lines, planes, hyperplanes | M1 |
| 3.1–3.6 | Norms, inner products, angles, orthogonality | Cosine, geometry | Include the dot product; general inner products out | M1 |
| 3.7 | Inner products of functions | Integrals | Exclude | – |
| 3.8 | Projections, Gram–Schmidt | Inverse, orthogonality | Include | M1 |
| 3.9 | Rotations | Trigonometry | Adapt: 2D only, as a picture for SVD | M1 |
| 4.1–4.2 | Determinant, trace, eigenvectors | Polynomials, (briefly) complex numbers | Include; trace and determinant as needed | M1 |
| 4.3 | Cholesky | Positive definiteness | Exclude | – |
| 4.4–4.6 | Eigendecomposition, SVD, low rank | Spectral theorem | Include; add the proofs, Frobenius norm and general pseudoinverse | M1 |
| 4.7 | Matrix phylogeny | – | Exclude | – |
| 5.1 | Univariate differentiation | Limits, earlier calculus | Include from zero | M1 |
| 5.2–5.3 | Gradients, Jacobians, chain rule | 5.1, matrices | Include | M1 |
| 5.4–5.5 | Matrix gradients | 5.3, tensors | Adapt: the few identities used, derived; no tensors | M1/M2 |
| 5.6 | Backpropagation | Chain rule | Include as neural-network training | M1 |
| 5.7–5.8 | Hessian, Taylor | Derivatives | Adapt: first and second order only | M1 |
| 6.1–6.4 | Probability, Bayes, summary statistics | Sets, counting, integrals | Include; probability space simplified | M1 |
| 6.5 | Gaussian | Matrices, integrals | M1: one variable, and 2D as a picture. M2: several variables, marginals and conditionals | M1/M2 |
| 6.6 | Conjugacy, exponential family | Bayes | Conjugacy for the Gaussian; exponential family out | M2 |
| 6.7 | Change of variables | Substitution, Jacobian | Adapt: linear only. One variable M1; several M2 | M1/M2 |
| 7.1 | Gradient descent, SGD, momentum | Gradients | Include; momentum optional | M1 |
| 7.2 | Lagrange multipliers, duality | Gradients, inequalities | Include, plus KKT conditions | M2 |
| 7.3 | Convexity, LP/QP, Legendre–Fenchel | Hessian | Convex functions M1; quadratic programs M2; Legendre–Fenchel and LP out | M1/M2 |
| 8.1–8.2 | Data, risk, overfitting, cross-validation | Expectation | Include | M1 |
| 8.3 | MLE, MAP | Likelihood, logs | MLE M1; MAP with Bayesian regression | M1/M2 |
| 8.4 | Probabilistic modelling | Bayes | Adapt: latent variables and posteriors | M2 |
| 8.5 | Directed graphical models | Independence | Optional enrichment | – |
| 8.6 | Model selection | Risk, Bayes | Cross-validation M1; Bayes factors out | M1 |
| 9.1–9.2, 9.4 | Linear regression | Gradients, Gaussian, projection | Include | M1 |
| 9.3 | Bayesian regression | Completing the square | Include, introductory | M2 |
| 10.1–10.4, 10.6 | PCA | Eigenvectors, Lagrange multipliers | Include, by the route in section 6 | M1 |
| 10.5, 10.7 | High-dimensional and probabilistic PCA | PCA, Gaussians | Optional enrichment | – |
| 11.1–11.4 | Gaussian mixtures, EM | Gaussian, matrix gradients, Lagrange multipliers | Include | M2 |
| 12.1–12.2 | Primal SVM | Projections, convexity | Include | M2 |
| 12.3 | Dual SVM | Duality | Include; convex-hull view optional | M2 |
| 12.4 | Kernels | Hilbert spaces (mentioned) | Adapt: finite feature maps and Gram matrices | M2 |
| 12.5 | Numerical solvers | Quadratic programs | Optional enrichment | – |

## 3. Gaps

Every gap below is a **required foundation (F)**, **required application (A)** or **optional enrichment (O)**. "Evidence of learning" is the assessment that would show the outcome.

| ID | Gap and evidence in MML | Needed for | Class | Milestone | Evidence of learning | Found by |
| --- | --- | --- | --- | --- | --- | --- |
| G1 | Exponentials, logarithms, sums, products, double sums, sets, quantifiers and proof reading: in the symbol table (pp. 6–7) or used, not taught. Mappings are developed (pp. 48–60), but general function skills (graphs, composition, inverses) get a formal definition only (p. 139). Our proofs also need induction, a word MML does not use in that sense. Inequalities and absolute values are assumed | Everything | F | M1 | Read and rewrite a likelihood in logs; solve and graph an inequality | B, G, H |
| G2 | Right-triangle trigonometry and cosine: assumed (p. 84) | Angles, projections | F | M1 | Derive the dot-product angle formula | C |
| G3 | Counting and binomial coefficients: used in the proof on p. 142, not taught. The product rule and induction give the same result. Listing equally likely outcomes is needed and sits in G33 | Binomial distribution, if used | O | – | Count outcomes | C, H |
| G4 | Limits and single-variable calculus: "briefly revisit" (p. 141); rules listed (p. 145) | Every optimisation | F | M1 | Derive the product, chain and inverse-function rules | B, R |
| G5 | Integrals: first used in an exercise (p. 67) and on p. 80; in sections we keep, from p. 181. Fundamental theorem only named (pp. 217–218); antiderivative, integration by parts 0 hits. Also needed: improper integrals, and iterated two-variable integrals (light in M1) | Densities, expectations | F | M1 | Compute a probability, mean and variance from a density | B, R |
| G6 | Second-order reasoning: a one-variable check (p. 226); convexity tests cited, not proved (p. 237). Mean value theorem 0 hits | Logistic regression, linear regression | F | M1 | Prove a loss convex | B |
| G7 | Spectral theorem stated without proof (p. 111). The SVD starts by assuming it exists (p. 123); pp. 124–126 then build the factors, resting on the spectral theorem | PCA, SVD | F | M1 | Maximise xᵀAx on the unit sphere at u; for v ⊥ u, use (u + tv)ᵀA(u + tv) ≤ (1 + t²)uᵀAu for small t (the 1 + t² is ‖u + tv‖² for unit v) to force vᵀAu = 0 (algebra only: no derivatives, no Lagrange multipliers); use induction; build the SVD | C, H |
| G8 | Frobenius norm: 0 hits. Eckart–Young is given for the spectral norm only (p. 131), but PCA's squared error is Frobenius | PCA as low-rank approximation | F | M1 | Show squared reconstruction error is the sum of dropped eigenvalues | C |
| G9 | Information theory is not taught: cross-entropy 0 hits; entropy only as a convexity example (pp. 237–238) and an exercise (p. 248); KL divergence deferred (p. 197) | Logistic and neural-network losses | F | M1 | Derive cross-entropy from a Bernoulli likelihood | B, H |
| G10 | Logistic regression: outlined with the sigmoid and Bernoulli likelihood (pp. 213, 315), never fitted | Section 2 outcome | A | M1 | Derive its gradient, run steps by hand; show no finite minimum for separable and quasi-separable data | B, H |
| G11 | Softmax and multi-class outputs: softmax 0 hits | Classification with neural networks | A | M1 | Derive the softmax gradient | C |
| G12 | Neural networks: layers, squared loss and gradient structure (pp. 159–161), but no worked numerical pass, initialisation or classification loss; saturation and vanishing gradients 0 hits; breaking symmetry at initialisation not mentioned | Section 2 outcome | A | M1 | One full forward, backward and update pass by hand; show equal starting weights staying equal | B, H |
| G13 | Gradient descent: convergence claimed "for suitable step-size" (p. 228); a quadratic is iterated (pp. 228–229), but no model is fitted by hand | Logistic regression, neural networks | A | M1 | Prove convergence on a quadratic; show divergence | B, H |
| G14 | Classification evaluation: confusion matrix 0 hits. Leakage gets a margin note on test-set use (p. 262), with no worked example | Assumptions and failures | A | M1 | Choose a metric for unbalanced data and defend it | B |
| G15 | Bias–variance decomposition (p. 193) and trade-off (p. 265): named only. The bias of the 1/N variance is stated (p. 192), not derived | Regularisation, failures of regression | A | M1 | Derive the decomposition for squared error; derive the N − 1 correction | B, R |
| G16 | Law of large numbers 0 hits; central limit theorem a margin note (p. 197); sampling distribution 0 hits; standard error a margin note (p. 284), and the variance of a mean never derived; Markov's and Chebyshev's inequalities 0 hits. Population, sample and empirical distribution are not separated (pp. 178, 192) | MLE, held-out error | F | M1 | Derive V[X̄] = σ²/N; prove Chebyshev and the weak law for independent observations with finite variance; give a test error with an approximate interval (central limit theorem simulated, "not proved here") | C, R, N, H |
| G17 | Intervals for regression coefficients, the bootstrap, and tests: confidence interval 0 hits, bootstrap only a pointer (p. 265), p-value 0 hits, hypothesis testing mentioned in passing (three times) | Linear regression; comparing models | A | M2 | Build and interpret an interval; run a permutation test and a t-test, and say what their p-values mean; plan an A/B test's size | B, R |
| G18 | Numerical behaviour: underflow (p. 293), condition number (p. 230); log-sum-exp 0 hits; cancellation only a margin note (p. 193) | Logistic, mixtures, gradient descent | F | M1 | Explain and repair an underflow; compute a stable log-sum-exp by hand | C, H |
| G19 | Multivariate Gaussian: normalisation not derived (p. 198); conditionals cited to Bishop (p. 199); block elimination assumed (p. 199); degenerate covariances not treated | Bayesian regression, mixtures | F | M2 | Derive a 2D conditional | B, H |
| G20 | Matrix-gradient identities listed unproved (p. 158), then used for the covariance update (Chapter 11) | EM | F | M2 | With S the weighted scatter, apply log x ≤ x − 1 to the eigenvalues of Σ^(−1/2) S Σ^(−1/2); needs positive total responsibility, positive definite S, the spectral square root, det(AB) = det A det B and tr(AB) = tr(BA) | C, H |
| G21 | EM's increase in likelihood cited, not proved (p. 361); the inequality behind Jensen's is the definition of convexity (p. 236) and is named in a remark (p. 239) | EM derivation | F | M2 | Prove each EM step cannot lower the likelihood | B, H |
| G22 | EM failures: local optima noted (p. 367); unbounded likelihood only under Further Reading (p. 368); empty components and singular scatter not treated; identifiability 0 hits | Mixture failures | A | M2 | Show a component collapsing on a point | C, H |
| G23 | KKT conditions only in a margin note (p. 385) | SVM support vectors | F | M2 | Find support vectors and b by hand; when no multiplier is strictly between 0 and C, find the interval of valid b from the KKT inequalities | C, H |
| G24 | Strong duality asserted for convex problems with no qualification, and equality constraints described as "convex sets" rather than affine functions (pp. 236, 239); Slater 0 hits | SVM dual | F | M2 | Prove weak duality and KKT sufficiency; state Slater's theorem with its conditions, and check that the soft margin meets them | B, H |
| G25 | Kernels: feature maps, Gram matrices and positive semidefiniteness in three pages (pp. 388–390), with little derived | SVM kernels | A | M2 | Expand a polynomial kernel; test a Gram matrix, knowing that one sample can refute a kernel but not prove it | B, H |
| G26 | Reading Python: none | Charter Part 0 | F | M1 | Predict the output of a short loop | D |
| G27 | Categorical distribution: the idea appears (pp. 180, 364, as "multinoulli") and mixture weights are fitted from expected counts (pp. 359–360), but its likelihood and fit to observed labels do not | Softmax, mixture labels | F | M1 | Write its likelihood from counts; use indicator variables and probabilities that sum to 1 | R, H |
| G28 | Pseudoinverse formula only for full column rank (pp. 35, 86); general existence appears only in a diagram (p. 134). Existence and uniqueness are not separated | Linear regression with dependent features | F | M1 | Find the smallest-norm fit for collinear data | R, H |
| G29 | Outliers: the median's robustness gets one sentence (p. 188); their effect on a fit is not developed. Histograms only under Further Reading (p. 369) | Failures of regression | A | M1 | Show one outlier moving a fitted line | R |
| G30 | Determinant: 2×2 and 3×3 formulas, signed volume and the Laplace expansion (pp. 100–102), but no general definition, and the properties are listed without proof | Eigenvalues, Gaussian density | F | M1: 2×2 and 3×3, and the eigenvalue route to SVD and PCA does not need more. M2: n×n properties | M1: derive the 2×2 case from area. M2: define it by elimination; prove det(AB) = det A det B; show that for a symmetric matrix it is the product of eigenvalues | P, N, H |
| G31 | In Chapter 3, "closest point" and "orthogonal error" are linked by geometric argument only (pp. 83, 86); calculus links them later (pp. 313–314, 327–328). The left null space is not named | Least squares | F | M1 | Prove the closest point with Pythagoras; get the normal equations from it | P, N, H |
| G32 | Cauchy–Schwarz stated (p. 75); directional derivative and steepest ascent never derived (pp. 141, 228) | Gradient descent, correlation bounds | F | M1 | Prove that the gradient is the steepest direction | P |
| G33 | Additivity of probability and the conditional probability of general events are not set out (pp. 175–178); conditional probability is given by counts (pp. 179–180) | Bayes' theorem | F | M1 | List outcomes; work a two-event Bayes problem from the axioms | P, H |
| G34 | PCA's best subspace is found one direction at a time (pp. 321–324), and the joint case is referred back to that (p. 332) | PCA | F | M1 | Extend the directions to a full orthonormal basis, so each weight wᵢ is at most 1 and they sum to M; show that moving weight to larger eigenvalues cannot lower the total; explain ties and sign choices | P, N, H |
| G35 | The equality-constraint condition is motivated by a penalty and by differentiating the Lagrangian (pp. 233–236), never derived | Mixture weights, SVM | F | M2 | Derive it along a curve in two variables | P |
| G36 | Completing the square: used for the Gaussian posterior (pp. 306–308), assumed in one variable | Bayesian regression | F | M1 (one variable), M2 (vectors) | Complete a square; find a posterior mean by hand | G |
| G37 | Unproved: all bases have the same size (pp. 43, 45), row rank equals column rank (p. 47), rank–nullity (p. 60) | Dimension, rank, SVD, PCA | F | M1 | Prove each from elimination | N |
| G38 | Continuity, limit laws, and closed and bounded sets: used, not defined | Derivatives, section 5 item 1 | F | M1 | Apply limit laws; recognise a discontinuity; show the unit circle is closed and bounded | N, H |
| G39 | Multivariable stationary points: saddle points appear only in an exercise (p. 247), undefined | Neural-network and mixture failures | A | M1 | Classify a stationary point from a 2×2 Hessian, including a zero eigenvalue, where the test decides nothing | N, H |
| G40 | Scaling and encoding: standardisation (pp. 253, 336) and one-hot vectors (p. 364) appear, but not why scale changes PCA, regularised regression or SVMs, nor zero-variance features; coding degrees as 1, 2, 3 (pp. 252–253) also fixes the spacing | Section 2 failures | A | M1 | Rescale one feature and show the first principal direction change | N, H |
| G41 | Linearity of expectation is used on p. 190 and stated for two variables on p. 193, not proved; the expectation of g(X) is defined without justification (p. 187) | Variance of sums, bias–variance, EM | F | M1 | Prove both for discrete variables without assuming independence, before covariance; say what carries over to densities | N, H |
| G42 | Subgradients: the hinge loss's is given (p. 391); the general definition and why it works are not | SVM loss view only; the KKT route does not need them | O | – | Sketch the subgradients of max(0, 1 − t) | N, H |
| G43 | Data orientation changes: rows are examples on p. 253, columns on p. 335; no habit of checking shapes | All matrix models | F | M1 | Check shapes through a whole derivation; convert between conventions | H |
| G44 | Intercepts: MML shows a prior pulling the intercept towards zero (p. 268), but does not say that the intercept is usually left unpenalised, or why | Regression, regularisation | A | M1 | Show a penalised intercept changing when y is shifted | H |
| G45 | Common distributions beyond Bernoulli, binomial and Gaussian: uniform, geometric, Poisson, exponential | Standard preparation: Stat 110, CS229 review, 18.05 and D2L (Poisson) | O | M1 | Match a situation to a distribution and find its mean | R |
| G46 | Newton's method: 18.01, CS229, *Deep Learning* and D2L teach it | Second-order view of optimisation | O | M1 | Take one Newton step on a one-variable loss | R |
| G47 | KL divergence: *Deep Learning*, D2L and CS109 teach it | Links cross-entropy and EM | O | M1 | Compute it for two coins | R |

## 4. Not in 1.0

Groups; inner products of functions and of random variables (3.7, 6.4.6); general inner products; three-dimensional and Givens rotations; Cholesky; matrix phylogeny; tensor gradients; full exponential family and Fisher–Neyman; general change of variables and inverse-transform sampling; Legendre–Fenchel duality; linear programming; Bayes factors; Mercer's theorem and Hilbert-space kernels; Gaussian processes; chi-square and ANOVA; LU, QR, Jordan form and Fourier; Beta and Gamma distributions; Hoeffding bounds; vector-calculus theorems, series and differential equations; naive Bayes, discriminant analysis, generalised linear models and the perceptron. Optional enrichment: directed graphical models, high-dimensional and probabilistic PCA, the convex-hull SVM view, solvers, momentum, subgradients, counting.

MML statements not to copy (✓ = wording checked on the page image):

| Page | Statement | Correct version |
| --- | --- | --- |
| 79 | Eliminating on [B̃B̃ᵀ \| B̃] gives an orthonormal basis | Row operations do not orthonormalise the columns; use Gram–Schmidt |
| 127 | For symmetric matrices the eigendecomposition and SVD are the same | Only for positive semidefinite ones, with eigenvalues in descending order; diag(2, −1) has singular values 2 and 1 |
| 141 ✓ | Derivative defined for h > 0; it "points in the direction of steepest ascent" | The limit is two-sided; the derivative of a one-variable function is a number |
| 178 | Probability defined by counts nᵢⱼ/N | That holds for N equally likely outcomes; for N observations the fraction only estimates the probability |
| 183 | Interval probability "not applicable" to discrete variables | Discrete variables have interval probabilities and a cumulative distribution |
| 193 ✓ | The sum of N² pairwise squared differences is the empirical variance | The average in (6.45) is twice the variance |
| 204 ✓ | y = Ax ⇔ x = (AᵀA)⁻¹Aᵀy, then read as a density of x | The reverse fails unless y is in the column space; as an estimator its mean is the true x, and a density of x given y needs a prior |
| 204 ✓ | Covariance matrices are positive definite | Positive semidefinite (as p. 190 says) |
| 214 ✓ | Beta prior base measure μ/(1 − μ) | 1/(μ(1 − μ)) |
| 218 | An invertible function on an interval is strictly increasing or decreasing | True if it is also continuous |
| 228 | With suitable steps, gradient descent converges to a local minimum | Not guaranteed: it can stop at a saddle point or have no minimum to reach |
| 230 ✓ | The condition number of A is the curvature ratio of ‖Ax − b‖² | That ratio is its square |
| 232 | Gradient descent needs only an unbiased gradient estimate to converge | It also needs the conditions in the remark that follows, and more; a subset sum must be rescaled to be unbiased |
| 236 | Strong duality for every convex problem | Needs a constraint qualification such as Slater's, a finite optimum, and affine equality constraints |
| 294 | Without duplicate points, N ≥ D gives rank D | Features can still be dependent |
| 298 | Choose the polynomial degree with the smallest RMSE | The text points to model selection but does not say which data: use validation data, since training error never rises with degree (p. 300) |
| 314 | Orthonormal feature functions give orthonormal feature columns | Not in general: it depends on the sample points |
| 331 ✓ | PCA is equivalent to the best rank-M approximation of the identity | Every rank-M orthogonal projection ties at that; PCA's error is weighted by the data |
| 335 ✓ | Power iteration converges if the start is outside the null space | The start needs a component along the leading eigenvector, and the largest eigenvalue must be strictly largest |
| 335, 336 ✓ | Without duplicates, rank is N, with D − N + 1 zero eigenvalues, and XᵀX/N is invertible | Distinct points can be dependent; centred data have rank at most N − 1; rank N would leave D − N zero eigenvalues |
| 336 ✓ | Mean subtraction is not strictly necessary for PCA | With S = XXᵀ/N and projection through the origin, as MML uses, skipping it lets the first direction follow the mean. An uncentred SVD is valid, but solves a different problem |
| 353 | EM "will eventually converge to a local optimum" | Not guaranteed in general; p. 367 is more careful |
| 367 | EM's expectation written as an integral over z | A sum: z is discrete in a mixture |
| 368 | K-means is a mixture with covariances set to I | That still gives soft assignments; use equal weights and covariances εI with ε → 0 |
| 377 ✓ | Examples must be at least 1 away from the hyperplane | At least 1/‖w‖ away |
| 384 ✓ | Find "the maximum of the Lagrangian" over w, b, ξ | It is minimised over these; the dual is then maximised |
| 384 ✓ | SVM weights are an affine combination of examples | The coefficients sum to zero, not one |
| 385 ✓ | Take the median of absolute values to find b | Wrong, and so is a signed median. Use any b in the interval the KKT inequalities allow. Example: x = −1 (+), 3 (−), 4 (−), C = 0.05 gives w = −0.2 and b from −0.4 to −0.2, with multipliers 0.05, 0.05 and 0. So the support vectors are −1 and 3, and their signed median is 0.2 |
| 385 ✓ | Points on the margin have 0 < α < C | The converse holds: 0 < α < C puts a point on the margin, but a margin point can have α = 0 or C |

## 5. Results not proved in scope

Label these "not proved here" and test them numerically, as the charter requires:

1. A continuous function on a nonempty, closed, bounded set in ℝⁿ reaches its maximum. With this, the spectral theorem can be proved in full.
2. The one-dimensional Gaussian integral (needs two-variable substitution), unless an optional appendix proves it.
3. The central limit theorem, beyond simulation, and the distribution of Student's t.
4. Existence of multipliers at a constrained optimum, and so general strong duality. Weak duality and KKT sufficiency are proved; Slater's theorem is stated with its conditions (convex functions, affine equalities, a strictly feasible point). Slater's condition is sufficient, not necessary. The soft-margin SVM meets it with large enough slacks.
5. Convergence of stochastic gradient descent and of gradient descent on non-convex losses.
6. Exchanging the order of integration in two-variable integrals, which needs a non-negative or absolutely integrable integrand.
7. Mercer's theorem and neural-network universal approximation, if mentioned at all.

## 6. Dependencies and charter problems

Main dependencies, where `A ← B` means A needs B:

- vectors ← algebra, trigonometry; matrices ← vectors; projection ← dot product; rank ← elimination
- weak law ← Chebyshev, Markov, variance of a mean; spectral theorem ← eigenvectors, the stated maximum fact (continuity, closed and bounded sets), inequalities, Gram–Schmidt, induction; SVD ← spectral theorem; PCA ← spectral theorem, Gram–Schmidt, mean, covariance (SVD is a second route)
- derivative ← limits, exponentials, logarithms; one-variable chain rule ← derivative; gradient ← derivative, vectors; multivariable chain rule ← one-variable chain rule, gradient, matrices
- convexity ← mean value theorem, second derivative, positive semidefinite matrices; gradient descent ← gradient, eigenvalues (for rates)
- density ← integral; Gaussian (one variable) ← integral, integration by parts, linear change of variable, the stated Gaussian integral; covariance ← linearity of expectation, matrices; multivariate Gaussian ← determinant properties; maximum likelihood ← logs and the chosen distribution
- linear regression ← projection and rank (geometric view), gradient (optimisation view), maximum likelihood with the one-variable Gaussian (probabilistic view)
- logistic regression ← Bernoulli likelihood, cross-entropy, gradient descent, convexity; rank (for uniqueness) and non-separable data (for existence)
- neural networks ← chain rule, gradient descent, sigmoid, cross-entropy (logistic regression first is a teaching choice)
- Bayesian regression ← multivariate Gaussian, its conditionals, completing the square, conjugacy, positive definite matrices
- EM ← multivariate Gaussian, categorical distribution, Lagrange multipliers (mixture weights), responsibilities, trace facts, the inequality log x ≤ x − 1, determinant properties, positive weights
- SVM ← hyperplanes, convexity, Lagrangian, weak duality, KKT, the stated Slater theorem; kernels ← dual SVM, positive semidefinite matrices

The spectral theorem no longer needs derivatives (G7), so Part I can come before Part II. The maximum fact is explained where it is used.

Pilot: the map supports the charter's choice of vectors. They need only algebra and a little trigonometry, and much of M1 depends on them.

These fixes are now in the charter.

| # | Problem in the charter | Fix |
| --- | --- | --- |
| 1 | M1 omits evaluation, overfitting and regularisation, although Part IV lists them and M1's models need them | Add to M1 |
| 2 | M1 omits convexity and second derivatives, needed for logistic regression | Add one- and many-variable convexity to M1 |
| 3 | PCA is in M1, but MML derives it with Lagrange multipliers (p. 322), which are in M2 | Derive it from the eigenbasis: unit-length weights give xᵀSx = Σλᵢcᵢ² ≤ λ₁. For M directions, extend them to a full orthonormal basis: the weights lie between 0 and 1 and sum to M, so the M largest eigenvalues win (G34) |
| 4 | Entropy and KL divergence are in no milestone | Entropy and cross-entropy in M1; KL as a short optional topic (G47) |
| 5 | Part 0 does not name exponentials, logarithms, trigonometry, sums, sets, functions and graphs, inequalities, completing the square or proof reading | Name them |
| 6 | Neural networks: size, activation, output and loss unspecified | One hidden layer with stated input and output sizes and biases; sigmoid first; squared loss for regression, cross-entropy for classification; one full update by hand |
| 7 | Conjugacy and Gaussian conditioning are unnamed | Add to M2 |
| 8 | "Deeper statistical inference" is undefined and nothing in section 2 needs tests | Defined by Q2 |
| 9 | The SVM dual needs strong duality, but general convex duality is excluded | Name the limited exception: section 5 item 4 for SVMs |
| 10 | "The Gaussian" is in M1, but a several-variable density needs n×n determinants, which are in M2 (G30) | M1: one variable, and 2D as a picture. Several variables in M2. M1's regression needs only one variable |

## 7. Where the assessors disagree

"–" means no position given. Luna's column is the light check; Gemini's and ChatGPT's are independent reviews.

| Topic | DeepSeek | Claude | Luna | Gemini | ChatGPT | Recommendation |
| --- | --- | --- | --- | --- | --- | --- |
| PCA and milestones | No conflict | MML's route uses Lagrange multipliers (p. 322) | Eigenbasis, but add a step for several components | Same; extend to a full basis | M1; complete the joint proof | Eigenbasis route with G34; no topic moves |
| EM monotonicity | Label "not proved here" | Provable from log x ≤ x − 1 | Provable | Provable | Provable; needs care with zero probabilities | Prove it; it does not show a local optimum is reached |
| KL divergence | Optional | Required for that proof | Not required | Optional | Optional | Optional. Claude was wrong |
| SVM weights | Not provable in scope | SVM case from a zero gradient (p. 384) | Same as Claude | Same as Claude | Derive it, given multipliers exist | Derive the SVM case, given section 5 item 4 |
| Logistic regression | Unique global minimum; proof may wait for M2 | Short convexity proof; no finite minimum for separable data | Same as Claude | Same, and uniqueness needs full column rank | Same, and existence is a separate condition | Prove in M1; teach rank (uniqueness) and separation (existence) separately |
| Taylor and second order | Optional | Needed | Second order only | Second order only | Second order, with approximation conditions | Second order only |
| Gradient-descent convergence | Not proved | Provable for quadratics | Valid but optional | Prove it | Prove it | Prove the positive-definite quadratic case, fixed step between 0 and 2/λmax of the Hessian |
| Bias–variance | Optional | M1 | Optional | Short M1 derivation | M1, stating assumptions and noise | Short M1 application |
| Counting | – | Required | Optional | Optional | Combinatorics optional; listing outcomes required | Combinatorics optional; listing outcomes in G33 |
| Weak law and intervals | – | M1 | Not M1 | M2; M1 gets the standard error | M1: weak law and approximate test-error intervals. M2: coefficient intervals | ChatGPT's split, chosen in Q2. M1 says that held-out averages settle down, so the charter requires the proof, and it is short |
| Bootstrap | – | M2 | Optional | M2 | Optional, unless approved | M2, chosen in Q2 |
| Softmax | – | M1 | Only for multiclass outputs | M1, if Ammar chooses multiclass | M1, with a charter change | M1, chosen in Q3 |
| Covariance update (G20) | – | Derive by matrix gradients | – | Cannot be derived in full without n×n determinant theory | Eigenvalue argument, with conditions | Use the eigenvalue argument in G20, with its conditions and the determinant and trace facts it lists; no determinant derivative is needed |
| Subgradients | – | Optional | – | Required for the hinge-loss view | Optional | Optional: slack variables and KKT give the same SVM |

Luna claimed 12 errors; 11 were accepted in whole or part. The twelfth, on G5, was wrong in saying p. 81, but Gemini showed that an exercise on p. 67 comes earlier still. Gemini claimed 16 errors and 12 missed gaps. All errors were accepted in whole or part; some were only wording. Eleven missed gaps became new rows or changes. The twelfth, things MML uses before introducing, is evidence for our own chapter order. ChatGPT counts those as gaps too; where MML never teaches the item, a row above now covers it. Gemini called MML's encoding of degrees as numbers a major error; that is too strong, because MML justifies the order by domain knowledge (p. 252), though not the spacing.

ChatGPT corrected 13 gap rows and Claude's SVM intercept row, and added seven MML errors, 18 gaps and new dependency conditions. Nearly all were accepted, most by tightening existing rows; G43 and G44 are new. Not accepted: the p. 180 sigma-algebra wording, because measure theory is out of scope; conditional independence as a gap in MML, which defines it (p. 195). Corrections to G13, G22 and G39 partly misread rows that were already limited to models, unbounded likelihood and several variables, so only the wording changed. It cites p. 294 for projection, which is on pp. 313–314. Its example page for Bernoulli variance (p. 213) covers the exponential family; the skill itself is in G27.

DeepSeek added three points Claude had missed: conjugacy is unnamed, the neural-network outcome is under-specified, and MML has no Python. Claude added G2, G3 (now optional), G7, G8, G11, G16, G18, G20, G22 and G23. DeepSeek's report has two smaller errors: the entropy example is on p. 237, not p. 239, and the lasso is named on p. 303 rather than derived.

Gemini's second review raised nine blocking points. Accepted: G7's missing normalisation, G20's unlisted facts, G30's milestone labels, the Gaussian integral as a dependency, intervals with known or estimated variance, competence levels, and the charter's review wording. Rejected: its p. 204 point, because MML writes p(y) = N(y | Ax, Σ), so y is noisy and the row's correction stands (checked on the page image); and the hidden-test workflow, which `CHARTER.md` section 8 already covers with a separate unopened file. Its path comment came from the flat review folder.

## 8. Ammar's decisions

- **Q1. Accept the charter fixes 1 to 7, 9 and 10?** Yes.
- **Q2. What does "deeper statistical inference" mean?** Ammar's rule: include what global standards teach as preparation for data science and ML. So M1 gains Chebyshev's inequality, the weak law and an approximate test-error interval. M2 has the sampling distribution of regression coefficients, large-sample intervals, the bootstrap, Bayesian credible intervals, hypothesis tests and p-values, Student's t, power and A/B tests. Coefficient distributions are derived with known variance; with an estimated variance, use large-sample normal intervals, or Student's t stated and simulated. The evidence for the last group is 18.05, CS109, D2L, Udacity and DeepLearning.AI's *Mathematics for Machine Learning and Data Science* (`references/curricula-comparison.md`). The same rule adds G45 to G47. Chi-square and ANOVA stay out: the statistics courses read teach them, but the ML-preparation sources do not. Earlier, Gemini and Luna kept the weak law and test-error intervals out of M1, and Luna and ChatGPT would have made the bootstrap optional.
- **Q3. Include softmax?** Yes, in M1. The charter now lists multiclass classification.

## 9. Limits

- The curricula comparison rests mostly on contents pages, headings and text searches. Some pages could not be read; `references/curricula-comparison.md` lists them.
- The read-through used extracted text. Most figures, matrices and numerical examples were not checked.
- All five assessors are AI models, and their agreement does not prove correctness. Luna and Gemini read only the extracted text. ChatGPT inspected six pages as images and did not check every citation. None checked the external curricula.
- Codex, the reviewer the charter names, has not reviewed this.
