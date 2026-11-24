# Table of contents

**Status:** draft of 2026-11-24. Not yet independently reviewed or approved. Required by `CHARTER.md` section 10.

Parts 0 to IV (chapters 1 to 43) are Ready to Start ML. Part V (chapters 44 to 56) completes the Full Book. Terms are defined in `GLOSSARY.md`.

## 1. How to read this

- **ID** is permanent. Numbers are for display and may change.
- **Needs** lists direct prerequisites; their own prerequisites are needed too. The reading order always satisfies them.
- **Level** is the competence level (`CHARTER.md` section 2) that the chapter's main result reaches. Routine skills stop at level 2. Stated results need levels 1 and 2.
- **Stated** results are labelled "not proved here" and tested numerically.
- **Lessons** are listed for Parts 0 to IV. Part V is listed by chapter, and its lessons are approved before Part V is written.
- Every lesson opens with short retrieval of what it uses, and every chapter ends with mixed practice. Every optional lesson passes the same gates except learning.
- `docs/gap-assessment.md` records which chapter covers each topic. `scripts/check_toc.py` checks both files.

**Changes.** Ammar approves adding, removing, merging, splitting or reordering chapters, moving a topic between milestones, lowering a level, and promoting or demoting an optional lesson. Splitting or reordering lessons inside a chapter is settled in its specification, which Ammar also approves.

## 2. Data

- **Returning dataset:** Palmer Penguins (CC0). **Second dataset**, in Part IV: house prices in New Taipei City (UCI Real Estate Valuation, CC BY 4.0). Neither is in the repository yet; `THIRD_PARTY_NOTICES.md` is written in the same change that adds one.
- Claude ran the models on both on 2026-11-24:

| Check | Result | Use |
| --- | --- | --- |
| Penguins, complete rows | 342 of 344 have all four measurements; 333 also have sex | Missing data |
| Body mass on flipper length | slope 49.7 g per mm, R² 0.76 | Line fitting |
| Bill depth against bill length | correlation −0.24 overall; 0.39, 0.65 and 0.64 within species | Association can reverse |
| PCA without scaling | first direction is body mass alone (99.99% of variance); with scaling, 69% | Scaling |
| Adelie and Gentoo, bill length and depth | separable | No finite logistic fit |
| Adelie and Chinstrap, bill length and depth | not separable | Logistic fit, soft margin |
| Three-class softmax | 99% cross-validated accuracy | Softmax |
| Mixture of three Gaussians | agrees with species (adjusted Rand index 0.96); single random starts range from 0.52 to 0.96 | EM and its local optima |
| Adelie and Chinstrap body mass | p = 0.59 | A test that finds nothing |
| House price on distance to metro | R² 0.45; 0.54 on log distance | Curves |
| House rows sharing coordinates | 155 repeat an earlier row's coordinates | Leakage between splits |

- **Limits found:** one house outlier barely moves the slope of 414 rows, so the outlier lesson uses few points. Kernels and a small network do not beat a straight boundary on penguins. Those lessons, A/B tests and bias–variance use seeded synthetic data.

## 3. Part 0: Opening

### 1. Algebra, graphs, notation and Python

*What can a formula tell you about a penguin?*

- **ID:** `opening`
- **Outcome:** Rearrange a formula, read a graph and a table of data, and predict what a short Python program prints.
- **Needs:** secondary-school algebra
- **Level:** 2
- **Lessons:**
  1. Formulas and equations: rearranging and solving
  2. Functions as rules, and their graphs
  3. Straight lines, slope and intercept
  4. Notation: variables, subscripts and tables of data
  5. Reading simple Python: values, lists and loops

## 4. Part I: Data as geometry

### 2. Vectors

*How can a list of measurements be an arrow?*

- **ID:** `vectors`
- **Outcome:** Treat data points as vectors, and add, scale and combine them.
- **Needs:** `opening`
- **Level:** 3
- **Lessons:**
  1. Points and displacements
  2. Adding and scaling arrows
  3. Lists of measurements as vectors, and their shapes
  4. Sums and Σ notation
  5. Linear combinations

### 3. Linear systems and elimination

*When do several equations have exactly one answer?*

- **ID:** `systems`
- **Outcome:** Solve any linear system by elimination, and describe all its solutions.
- **Needs:** `vectors`
- **Level:** 3
- **Lessons:**
  1. Systems as intersections and as combinations
  2. Elimination step by step
  3. No solution, one or infinitely many
  4. Describing a whole solution set

### 4. Matrices

*How do you process every row of data at once?*

- **ID:** `matrices`
- **Outcome:** Calculate with matrices, check every shape, and find an inverse by elimination.
- **Needs:** `systems`
- **Level:** 3
- **Lessons:**
  1. Matrices and tables: rows as examples, columns as features
  2. Matrix times vector
  3. Matrix times matrix, and double sums
  4. Transpose, identity and special matrices
  5. Inverses by elimination

### 5. Subspaces and dimension

*How many directions does data really have?*

- **ID:** `subspaces`
- **Outcome:** Find a basis and a dimension, and prove that every basis has the same size.
- **Needs:** `matrices`
- **Level:** 3
- **Lessons:**
  1. Sets, quantifiers and how to read a proof
  2. Span and subspaces
  3. Linear independence
  4. Basis and dimension
  5. Proof: all bases have the same size

### 6. Matrices as maps

*What does a matrix keep, and what does it lose?*

- **ID:** `linear-maps`
- **Outcome:** Describe a matrix by its column space and null space, and prove the rank theorems.
- **Needs:** `subspaces`
- **Level:** 3
- **Lessons:**
  1. Matrices as functions, and composition
  2. Column space and null space
  3. Rank, and why row rank equals column rank
  4. Rank and nullity
  5. Changing basis

### 7. Trigonometry for angles

*How does a triangle measure direction?*

- **ID:** `angles`
- **Outcome:** Use sine and cosine for any angle, and derive the law of cosines.
- **Needs:** `opening`
- **Level:** 3
- **Lessons:**
  1. Pythagoras, proved
  2. Sine and cosine in right triangles
  3. The unit circle: any angle
  4. The law of cosines

### 8. Length, dot product and angle

*How alike are two data points?*

- **ID:** `dot-product`
- **Outcome:** Measure length, distance and similarity, and prove that similarity lies between −1 and 1.
- **Needs:** `vectors`, `angles`
- **Level:** 3
- **Lessons:**
  1. Inequalities and absolute value
  2. Length and distance
  3. The dot product and the angle formula
  4. Cauchy–Schwarz and the triangle inequality

### 9. Projections

*What is the closest point you can reach?*

- **ID:** `projection`
- **Outcome:** Find the closest point in a subspace, and prove that it is the closest.
- **Needs:** `linear-maps`, `dot-product`
- **Level:** 3
- **Lessons:**
  1. Projection onto a line
  2. The closest point, proved with Pythagoras
  3. Projection onto a subspace, and the left null space
  4. Orthonormal bases and Gram–Schmidt
  5. Lines, planes and hyperplanes

### 10. Determinants in two and three dimensions

*How much does a matrix stretch area?*

- **ID:** `determinants`
- **Outcome:** Derive the 2×2 determinant from area, and use determinants to detect lost dimensions.
- **Needs:** `linear-maps`, `dot-product`
- **Level:** 3
- **Lessons:**
  1. Signed area and the 2×2 determinant
  2. Volume and the 3×3 determinant
  3. Zero determinant, dependence and inverses

### 11. Eigenvectors

*Which directions does a matrix leave alone?*

- **ID:** `eigenvectors`
- **Outcome:** Find the eigenvalues and eigenvectors of small matrices, and diagonalise them when possible.
- **Needs:** `determinants`
- **Level:** 3
- **Lessons:**
  1. Completing the square and the quadratic formula
  2. Directions that do not turn
  3. The characteristic polynomial and the trace
  4. Diagonalising a matrix
  5. Rotations, which turn every direction

### 12. The spectral theorem

*Why do symmetric matrices have perpendicular axes?*

- **ID:** `spectral-theorem`
- **Outcome:** Prove that every real symmetric matrix has an orthonormal basis of eigenvectors.
- **Needs:** `eigenvectors`, `projection`
- **Level:** 3
- **Stated:** a continuous function on a nonempty, closed, bounded set reaches its maximum
- **Lessons:**
  1. Proof by induction
  2. Quadratic forms and positive semidefinite matrices
  3. Reaching a greatest value, in pictures
  4. The proof: one eigenvector, then all of them
  5. Using the spectral theorem

### 13. Singular value decomposition

*How can any table be split into simple layers?*

- **ID:** `svd`
- **Outcome:** Build the SVD of any matrix, and use it for approximation and for the pseudoinverse.
- **Needs:** `spectral-theorem`
- **Level:** 3
- **Lessons:**
  1. From AᵀA to singular values
  2. Building the SVD
  3. Rotate, stretch, rotate
  4. Frobenius norm and the best low-rank approximation
  5. The pseudoinverse and the smallest-norm solution

### 14. Capstone: fitting a line by projection

*Which line comes closest to the penguins?*

- **ID:** `line-by-projection`
- **Outcome:** Fit a line to data by projection, and say what the fit does not tell you.
- **Needs:** `svd`
- **Level:** 3
- **Lessons:**
  1. Data as a design matrix with an intercept column
  2. Fitting flipper length to body mass
  3. Dependent features and the smallest fit
  4. What the line does not tell you
  5. Part I mixed review

## 5. Part II: Change and optimisation

### 15. Functions, exponentials and logarithms

*How do you turn multiplying into adding?*

- **ID:** `functions`
- **Outcome:** Compose and invert functions, and rewrite products with logarithms.
- **Needs:** `opening`, `dot-product`
- **Level:** 3
- **Stated:** powers with irrational exponents exist and obey the usual rules
- **Lessons:**
  1. Domain, composition and inverses
  2. Exponential growth
  3. Logarithms and their rules
  4. Turning long products into sums

### 16. Limits and continuity

*What happens when you get as close as you like?*

- **ID:** `limits`
- **Outcome:** Find limits, use the limit laws, and recognise continuity and closed, bounded sets.
- **Needs:** `functions`, `subspaces`
- **Level:** 3
- **Stated:** the maximum fact; the intermediate value theorem
- **Lessons:**
  1. Getting close: limits
  2. The limit laws
  3. Continuous and broken functions
  4. Closed and bounded sets, and the maximum fact again

### 17. Derivatives

*How steep is a curve at one point?*

- **ID:** `derivatives`
- **Outcome:** Derive the derivative rules, and differentiate the functions machine learning uses.
- **Needs:** `limits`
- **Level:** 3
- **Stated:** a base e with slope 1 at 0 exists
- **Lessons:**
  1. Slope at a point
  2. Sums, products and quotients
  3. The chain rule
  4. Inverse functions, exponentials and logarithms
  5. The sigmoid

### 18. What the slope tells you

*How can slopes prove a function is always above a line?*

- **ID:** `mean-value`
- **Outcome:** Use first and second derivatives to find minima, and prove log x ≤ x − 1.
- **Needs:** `derivatives`
- **Level:** 3
- **Stated:** the maximum fact
- **Lessons:**
  1. Maxima, minima and zero slope
  2. The mean value theorem
  3. Rising, falling and constant functions
  4. Second derivatives and curvature
  5. Quadratic approximation, and log x ≤ x − 1

### 19. Integrals

*How do you add up infinitely many thin slices?*

- **ID:** `integrals`
- **Outcome:** Calculate integrals by hand, including over infinite ranges and two variables.
- **Needs:** `mean-value`
- **Level:** 3
- **Stated:** a continuous function on a closed interval has an integral; exchange of order
- **Lessons:**
  1. Area as accumulation
  2. The fundamental theorem
  3. Substitution with a linear change
  4. Integration by parts
  5. Integrals over infinite ranges
  6. Integrals in two variables

### 20. Gradients and the chain rule

*Which way is uphill when there are many directions?*

- **ID:** `gradients`
- **Outcome:** Find gradients and Jacobians, and prove that the gradient is the steepest direction.
- **Needs:** `derivatives`, `dot-product`, `matrices`
- **Level:** 3
- **Lessons:**
  1. Functions of several variables and partial derivatives
  2. The gradient and linear approximation
  3. The steepest direction, proved
  4. Jacobians and the chain rule
  5. Gradients of linear and quadratic forms

### 21. Curvature in many directions

*Bowl, hill or saddle?*

- **ID:** `curvature`
- **Outcome:** Classify stationary points with the Hessian.
- **Needs:** `gradients`, `mean-value`, `spectral-theorem`
- **Level:** 3
- **Lessons:**
  1. The Hessian, and why mixed derivatives agree
  2. Quadratic approximation in several variables
  3. Minima, maxima and saddles
  4. When the test decides nothing
- **Optional:** Newton's method

### 22. Convexity

*When is the bottom you found the only bottom?*

- **ID:** `convexity`
- **Outcome:** Prove that a loss is convex, and say what convexity does and does not promise.
- **Needs:** `curvature`
- **Level:** 3
- **Lessons:**
  1. Convex sets and functions
  2. Tests with second derivatives
  3. Local minima are global, and when they are unique
  4. Jensen’s inequality

### 23. Gradient descent

*How big a step is safe?*

- **ID:** `gradient-descent`
- **Outcome:** Run gradient descent by hand, and prove when it converges on a quadratic.
- **Needs:** `convexity`
- **Level:** 3
- **Stated:** convergence on non-convex losses
- **Lessons:**
  1. Stepping downhill
  2. Convergence and divergence on a quadratic, proved
  3. Conditioning: long narrow valleys
  4. Computer arithmetic: rounding and cancellation
  5. What can go wrong on other losses
- **Optional:** Momentum

### 24. Capstone: fitting a line by gradient descent

*Can you find the same line by walking downhill?*

- **ID:** `line-by-descent`
- **Outcome:** Fit a line by gradient descent, and explain why it agrees with projection.
- **Needs:** `line-by-projection`, `gradient-descent`
- **Level:** 3
- **Lessons:**
  1. The loss surface of a line
  2. Steps by hand
  3. Feature scale and slow valleys
  4. Part II mixed review

## 6. Part III: Uncertainty and statistics

### 25. Probability and Bayes

*How should evidence change your mind?*

- **ID:** `probability`
- **Outcome:** Calculate probabilities from the axioms, and derive and use Bayes’ theorem.
- **Needs:** `subspaces`
- **Level:** 3
- **Lessons:**
  1. Outcomes and events
  2. The axioms, and what follows from them
  3. Conditional probability
  4. Independence and conditional independence
  5. Bayes’ theorem

### 26. Random variables and expectation

*What do you expect on average?*

- **ID:** `random-variables`
- **Outcome:** Calculate with discrete distributions, and prove that expectation is linear.
- **Needs:** `probability`, `vectors`
- **Level:** 3
- **Lessons:**
  1. Random variables and their distributions
  2. Bernoulli and categorical variables
  3. Joint, marginal and conditional distributions
  4. Expectation, and the expectation of g(X)
  5. Linearity of expectation, proved
- **Optional:** Counting and the binomial distribution

### 27. Variance, covariance and samples

*How far do things spread, and do they spread together?*

- **ID:** `variance`
- **Outcome:** Measure spread and association, and derive the N − 1 correction.
- **Needs:** `random-variables`, `spectral-theorem`
- **Level:** 3
- **Lessons:**
  1. Mean, median, histograms and outliers
  2. Variance
  3. Covariance and correlation, with bounds proved
  4. Covariance matrices
  5. Population, sample and the N − 1 correction

### 28. The law of large numbers

*Why do averages settle down?*

- **ID:** `law-of-large-numbers`
- **Outcome:** Prove the weak law, and give the standard error of an average.
- **Needs:** `variance`
- **Level:** 3
- **Lessons:**
  1. The variance of an average
  2. Markov’s and Chebyshev’s inequalities
  3. The weak law, proved
  4. Seeing it fail: dependence and wild data

### 29. Continuous distributions

*How can every exact value have probability zero?*

- **ID:** `densities`
- **Outcome:** Find probabilities, means and variances from a density, and change variables linearly.
- **Needs:** `integrals`, `variance`
- **Level:** 3
- **Stated:** exchange of order
- **Lessons:**
  1. From histograms to densities
  2. Cumulative distribution
  3. Mean and variance from a density
  4. The uniform distribution
  5. Linear change of variable
  6. Two variables at once
- **Optional:** Geometric, Poisson and exponential distributions

### 30. The Gaussian in one variable

*Why does one curve appear so often?*

- **ID:** `gaussian`
- **Outcome:** Derive the Gaussian’s mean and variance, and use it for approximate intervals.
- **Needs:** `densities`, `law-of-large-numbers`, `functions`
- **Level:** 3
- **Stated:** the Gaussian integral; the central limit theorem
- **Lessons:**
  1. The Gaussian curve
  2. Its mean and variance, derived
  3. Shifting and scaling
  4. Averages become Gaussian, by simulation
  5. Approximate intervals
  6. Two dimensions as a picture

### 31. Maximum likelihood

*Which setting makes the data least surprising?*

- **ID:** `likelihood`
- **Outcome:** Fit a distribution by maximum likelihood, and calculate it without underflow.
- **Needs:** `gaussian`, `mean-value`
- **Level:** 3
- **Lessons:**
  1. Likelihood is not probability
  2. Bernoulli, and logs
  3. Categorical data from counts
  4. Gaussian mean and variance
  5. Underflow and log-sum-exp

### 32. Entropy and cross-entropy

*How do you measure surprise?*

- **ID:** `cross-entropy`
- **Outcome:** Derive cross-entropy from a likelihood, and prove when it is smallest.
- **Needs:** `likelihood`
- **Level:** 3
- **Lessons:**
  1. Surprise and entropy
  2. Cross-entropy and why the truth is cheapest
  3. Cross-entropy as a classification loss
- **Optional:** KL divergence

### 33. Capstone: fitting a line by likelihood

*Why square the errors?*

- **ID:** `line-by-likelihood`
- **Outcome:** Derive least squares from Gaussian noise, and state what that assumes.
- **Needs:** `line-by-descent`, `cross-entropy`
- **Level:** 3
- **Lessons:**
  1. A line plus noise
  2. Least squares from likelihood
  3. Estimating the noise
  4. Part III mixed review

## 7. Part IV: Machine learning

### 34. Linear regression

*What is a model, and when should you distrust it?*

- **ID:** `linear-regression`
- **Outcome:** Fit and interpret linear regression in three ways, and identify its failures.
- **Needs:** `line-by-likelihood`
- **Level:** 3
- **Lessons:**
  1. What a model is, and preparing real data
  2. Three views of one fit
  3. Many features, rank and the smallest fit
  4. Outliers and broken assumptions
  5. Curves from linear models

### 35. Evaluation and overfitting

*Will it work on data it has never seen?*

- **ID:** `evaluation`
- **Outcome:** Estimate error on new data honestly, with its uncertainty.
- **Needs:** `linear-regression`
- **Level:** 3
- **Stated:** the central limit theorem
- **Lessons:**
  1. Training error misleads
  2. Splits and leakage
  3. Cross-validation
  4. A test error with an approximate interval

### 36. Bias and variance

*Why can a better fit predict worse?*

- **ID:** `bias-variance`
- **Outcome:** Derive the bias–variance decomposition, and use it to explain over- and underfitting.
- **Needs:** `evaluation`
- **Level:** 3
- **Lessons:**
  1. Estimators, bias and mean squared error
  2. The decomposition, derived
  3. Seeing both by simulation

### 37. Regularisation, scaling and encoding

*How do you stop a model trying too hard?*

- **ID:** `regularisation`
- **Outcome:** Derive ridge regression, and choose its strength, scales and encodings soundly.
- **Needs:** `bias-variance`
- **Level:** 3
- **Lessons:**
  1. Ridge regression, derived
  2. The intercept is special
  3. Scaling features
  4. Encoding categories
  5. Choosing the strength, and the lasso by name

### 38. Principal component analysis

*What is the best shadow of the data?*

- **ID:** `pca`
- **Outcome:** Derive PCA for any number of directions, and say when it misleads.
- **Needs:** `regularisation`
- **Level:** 3
- **Lessons:**
  1. Centring, and directions of greatest variance
  2. The first direction, proved
  3. Several directions, ties and signs
  4. Reconstruction error and the SVD
  5. Scale and other failures

### 39. Logistic regression

*How do you predict yes or no?*

- **ID:** `logistic-regression`
- **Outcome:** Derive, fit and interpret logistic regression, and say when no finite fit exists.
- **Needs:** `regularisation`, `cross-entropy`
- **Level:** 3
- **Lessons:**
  1. From a line to a probability
  2. The loss and its gradient
  3. Convexity, proved
  4. Rank, separation and whether a fit exists
  5. Fitting by hand

### 40. Judging classifiers

*When is 99% accuracy useless?*

- **ID:** `classification-metrics`
- **Outcome:** Choose and defend a metric and a threshold.
- **Needs:** `logistic-regression`
- **Level:** 3
- **Lessons:**
  1. The confusion matrix
  2. Precision and recall
  3. Thresholds and their trade-offs
  4. Unbalanced data and leakage

### 41. More than two classes

*How do you choose among three species?*

- **ID:** `softmax`
- **Outcome:** Derive softmax classification and its gradient, and calculate it stably.
- **Needs:** `classification-metrics`
- **Level:** 3
- **Lessons:**
  1. One-hot targets and scores
  2. Softmax, and its redundancy
  3. The loss and its gradient
  4. Stable calculation

### 42. Small neural networks

*What can a hidden layer do that a line cannot?*

- **ID:** `neural-networks`
- **Outcome:** Build a one-hidden-layer network for regression and classification, and run it by hand.
- **Needs:** `softmax`
- **Level:** 3
- **Stated:** universal approximation, if mentioned
- **Lessons:**
  1. Where straight boundaries fail
  2. A hidden layer of sigmoids
  3. The forward pass by hand
  4. Outputs and losses

### 43. Training a network

*Which weight is to blame?*

- **ID:** `backpropagation`
- **Outcome:** Derive backpropagation, and carry out one full update by hand.
- **Needs:** `neural-networks`
- **Level:** 3
- **Stated:** convergence of stochastic gradient descent
- **Lessons:**
  1. The chain rule through a network
  2. Backpropagation in matrix form
  3. One full update by hand
  4. Stochastic gradient descent
  5. Equal weights, saddles and saturation
  6. Parts I to IV mixed review

## 8. Part V: Full Book

### 44. Determinants in any dimension

*How does volume scale in many dimensions?*

- **ID:** `determinants-n`
- **Outcome:** Define the determinant by elimination, and prove the properties later chapters use.
- **Needs:** `backpropagation`
- **Level:** 3

### 45. The multivariate Gaussian

*What shape is a cloud of data?*

- **ID:** `multivariate-gaussian`
- **Outcome:** Derive the density, its linear maps and its marginals, including sums of Gaussians.
- **Needs:** `determinants-n`, `gaussian`
- **Level:** 3
- **Stated:** the Gaussian integral; exchange of order

### 46. Conditionals and conjugacy

*What does one measurement say about another?*

- **ID:** `gaussian-conditionals`
- **Outcome:** Derive Gaussian conditionals, and the posterior for a Gaussian mean.
- **Needs:** `multivariate-gaussian`
- **Level:** 3

### 47. Intervals and the bootstrap

*How sure are you of a slope?*

- **ID:** `intervals`
- **Outcome:** Derive the sampling distribution of regression coefficients with known variance, and build intervals.
- **Needs:** `gaussian-conditionals`, `evaluation`
- **Level:** 3
- **Stated:** the central limit theorem; the distribution of Student’s t

### 48. Tests, p-values and A/B tests

*Is the difference real?*

- **ID:** `tests`
- **Outcome:** Run and interpret permutation, large-sample and t-tests, and plan an A/B test.
- **Needs:** `intervals`
- **Level:** 3
- **Stated:** the distribution of Student’s t

### 49. Bayesian linear regression

*How should beliefs about a line change with data?*

- **ID:** `bayesian-regression`
- **Outcome:** Derive MAP, the posterior and its credible intervals, and predictions.
- **Needs:** `intervals`, `regularisation`
- **Level:** 3

### 50. Equality constraints

*What is the best point on a path?*

- **ID:** `lagrange`
- **Outcome:** Derive the Lagrange condition in two variables, and use it.
- **Needs:** `curvature`
- **Level:** 3
- **Stated:** existence of multipliers in general

### 51. Gaussian mixtures and EM

*Can you find the species without labels?*

- **ID:** `mixtures`
- **Outcome:** Derive the EM updates, and run a step by hand.
- **Needs:** `lagrange`, `multivariate-gaussian`, `softmax`
- **Level:** 3

### 52. What EM guarantees, and how it fails

*Does each step really help?*

- **ID:** `em-guarantees`
- **Outcome:** Prove that EM never lowers the likelihood, and demonstrate its failures.
- **Needs:** `mixtures`, `convexity`
- **Level:** 3

### 53. Inequality constraints and duality

*What if the best point is out of bounds?*

- **ID:** `kkt`
- **Outcome:** Prove weak duality and KKT sufficiency, and check Slater’s conditions.
- **Needs:** `lagrange`, `convexity`
- **Level:** 3
- **Stated:** Slater’s theorem; existence of multipliers

### 54. Support vector machines

*Which boundary leaves the most room?*

- **ID:** `svm-primal`
- **Outcome:** Derive the hard- and soft-margin problems.
- **Needs:** `kkt`, `classification-metrics`
- **Level:** 3
- **Optional:** Subgradients

### 55. The dual and support vectors

*Which points hold up the boundary?*

- **ID:** `svm-dual`
- **Outcome:** Derive the dual, and find support vectors and the intercept by hand.
- **Needs:** `svm-primal`
- **Level:** 3

### 56. Kernels

*How can a straight boundary bend?*

- **ID:** `kernels`
- **Outcome:** Derive kernel SVMs, and test whether a Gram matrix is valid.
- **Needs:** `svm-dual`
- **Level:** 3
- **Stated:** Mercer’s theorem, if mentioned

## 9. Open points for review

Found while drafting. Adding to the results not proved needs Ammar's approval.

1. `docs/gap-assessment.md` section 5 does not list four facts this order relies on: the intermediate value theorem (inverse functions), the integral of a continuous function, powers with irrational exponents, and the existence of a base e with slope 1 at 0. They are marked **Stated** above. Defining log x as an integral would prove the last two, but only after integrals.
2. The limit laws need a precise definition of a limit. How much ε–δ is right for this learner is open.
3. The mean value theorem comes before integrals, because the fundamental theorem needs it.
4. Completing the square comes in `eigenvectors`, because the quadratic formula needs it there.
5. `intervals` comes after the multivariate Gaussian, because exact normality of a coefficient needs sums of Gaussians.
6. The central limit theorem is simulated in `gaussian`, not in `law-of-large-numbers`, because it needs the Gaussian curve.
7. Stochastic gradient descent comes in `backpropagation`, because its unbiasedness needs expectation.
