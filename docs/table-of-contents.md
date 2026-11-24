# Table of contents

**Status:** approved by Ammar on 2026-11-24. ChatGPT, run by Ammar, reviewed the first and second drafts ("approve with listed fixes") and checked the third ("not closed", with a short list) and the changes in the fourth ("closed"). Its findings are applied here or answered in section 9. Required by `CHARTER.md` section 10.

Parts 0 to IV (chapters 1 to 46, 229 lessons) are Ready to Start ML. Part V (chapters 47 to 59) completes the Full Book. Terms are defined in `GLOSSARY.md`.

## 1. How to read this

- **ID** is permanent once this is approved. Numbers are for display and may change.
- **Needs** lists direct prerequisites in mathematics and assessment, and their own prerequisites are needed too. Reading order may add others for teaching reasons.
- **Level** is the competence level (`CHARTER.md` section 2) that the chapter's main result reaches. Routine skills stop at level 2. Stated results need levels 1 and 2. Specifications give the level of each outcome.
- **Must include** lists content that the specification may not drop.
- **Stated** results are labelled "not proved here". Numerical tests illustrate them and never replace a proof.
- **Lessons** are listed for Parts 0 to IV. Part V is listed by chapter. Its lessons and their order are reviewed and approved before it is written, and may split chapters.
- Every lesson opens with short retrieval of what it uses, and every chapter ends with mixed practice. Optional lessons pass the same gates except learning.
- `docs/gap-assessment.md` records which chapter covers each topic. `scripts/check_toc.py` checks both files.

**Changes.** Ammar approves adding, removing, merging, splitting or reordering chapters, moving a topic between milestones, lowering a level, and promoting or demoting an optional lesson. Splitting or reordering lessons inside a chapter is settled in its specification, which Ammar also approves.

## 2. Data

- **Returning dataset:** Palmer Penguins (CC0). **Second dataset**, in Part IV: UCI Real Estate Valuation (CC BY 4.0), prices per unit area in New Taipei City. Neither is in the repository yet; `THIRD_PARTY_NOTICES.md` is written in the same change that adds one.
- Claude ran these checks on 2026-11-24 with scikit-learn 1.9.1 and SciPy 1.18.1. They are provisional until the proof of concept adds a script that reproduces them from pinned data.

| Check | Result | Use |
| --- | --- | --- |
| Penguins, 344 rows | 342 have all four measurements; 333 have every column | Missing data |
| Body mass on flipper length, 342 rows | slope 49.7 g per mm, in-sample R² 0.76 | Line fitting |
| Bill depth against bill length | correlation −0.24 overall; 0.39 (Adelie), 0.65 (Chinstrap) and 0.64 (Gentoo) within species | Association can reverse |
| PCA of the four measurements | unscaled: first direction almost entirely body mass, 99.99% of variance; standardised: 69% | Scaling |
| Adelie and Gentoo, bill length and depth | completely separable (linear program) | No finite unpenalised logistic fit |
| Adelie and Chinstrap, bill length and depth | neither completely nor quasi-completely separable (linear program) | Logistic fit, soft margin |
| Three-class softmax, standardised, scikit-learn's default penalty | 99% accuracy, 5-fold cross-validation, scaled inside each fold | Softmax |
| Mixture of three Gaussians, standardised, full covariances | adjusted Rand index (ARI) 0.96 with species. Of 20 random starts run to convergence, 17 reach log-likelihood −1148.4 and three stop lower: −1159.6, −1188.5 and −1195.6 (ARI 0.91, 0.52 and 0.60) | EM and sensitivity to initialisation |
| Adelie (151) and Chinstrap (68) body mass, Welch's t-test | difference −32 g, 95% interval −150 to 86 g, p = 0.59 | Weak evidence is not "no difference" |
| Price per unit area on distance to metro, 414 rows | in-sample R² 0.45; 0.54 on log distance | Curves |
| Coordinates | 155 rows repeat an earlier row's exact coordinates | Possible leakage: random and grouped splits compared |

- **Limits found, for these features and settings only:** one price outlier barely moves the slope of 414 rows, so the outlier lesson uses few points. Kernels and a small network do not beat a straight boundary on penguins. Those lessons, A/B tests and bias–variance use seeded synthetic data.

## 3. Part 0: Opening

### 1. Algebra, graphs, notation and Python

*What can a formula tell you about a penguin?*

- **ID:** `opening`
- **Outcome:** Rearrange a formula, read a graph and a table of data, and predict what a short Python program prints.
- **Needs:** secondary-school algebra
- **Level:** 2
- **Must include:** readiness check on fractions, negative numbers, powers and roots; notation introduced from lesson 1; the different meanings of = in an equation, a definition and Python; Python values, arithmetic, assignment, lists, indexing, loops, function calls and printed output
- **Lessons:**
  1. Formulas and equations: rearranging and solving
  2. Functions as rules, and their graphs
  3. Straight lines, slope and intercept
  4. Subscripts, indexed observations and tables of data
  5. Reading simple Python

## 4. Part I: Data as geometry

### 2. Vectors

*How can a list of measurements be an arrow?*

- **ID:** `vectors`
- **Outcome:** Treat data points as vectors, and add, scale and combine them.
- **Needs:** `opening`
- **Level:** 3
- **Must include:** no lengths yet; vectors are columns by default and observations are rows of a table
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
- **Must include:** rectangular systems; echelon form; proof that each row operation keeps the solution set; a system with more unknowns than equations, all equal to zero, has a nonzero solution
- **Lessons:**
  1. Systems as intersections and as combinations
  2. Elimination step by step
  3. Row exchanges, pivots and free variables
  4. No solution, one or infinitely many
  5. Sets, and describing a whole solution set

### 4. Matrices

*How do you process every row of data at once?*

- **ID:** `matrices`
- **Outcome:** Calculate with matrices, check every shape, and find an inverse by elimination.
- **Needs:** `systems`
- **Level:** 3
- **Must include:** proofs of associativity, distributivity and (AB)ᵀ = BᵀAᵀ; uniqueness of an inverse, and when it exists; row operations as elementary matrices; converting between data orientations
- **Lessons:**
  1. Matrices and tables: rows as examples, columns as features
  2. Matrix times vector
  3. Matrix times matrix, and double sums
  4. Transpose, identity and special matrices
  5. Inverses by elimination

### 5. Subspaces and dimension

*How many directions does data really have?*

- **ID:** `subspaces`
- **Outcome:** Find a basis, and prove that every basis has the same size.
- **Needs:** `matrices`
- **Level:** 3
- **Must include:** dimension is defined only after the proof; the proof uses elimination, not rank; extending independent vectors to a basis
- **Lessons:**
  1. Statements, quantifiers and how to read a proof
  2. Span and subspaces
  3. Linear independence
  4. Bases
  5. All bases have the same size, and dimension

### 6. Matrices as maps

*What does a matrix keep, and what does it lose?*

- **ID:** `linear-maps`
- **Outcome:** Describe a matrix by its column space and null space, and prove the rank theorems.
- **Needs:** `subspaces`
- **Level:** 3
- **Must include:** row and column rank defined separately; one null-space basis vector per free variable; changing coordinates told apart from moving a vector
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
- **Must include:** the area facts used; degrees, radians, orientation and signs; the law of cosines for obtuse angles too
- **Lessons:**
  1. Pythagoras, proved
  2. Sine and cosine in right triangles
  3. The unit circle: any angle
  4. The law of cosines

### 8. Length, dot product and angle

*How alike are two data points?*

- **ID:** `dot-product`
- **Outcome:** Measure length, distance and similarity, and prove that the cosine similarity of nonzero vectors lies between −1 and 1.
- **Needs:** `vectors`, `angles`
- **Level:** 3
- **Must include:** Cauchy–Schwarz proved before angles in many dimensions; what a norm is, with the Euclidean, Manhattan and maximum norms; the zero vector
- **Lessons:**
  1. Inequalities and absolute value
  2. Length and distance
  3. The dot product, and the angle formula in the plane
  4. Cauchy–Schwarz and the triangle inequality
  5. Angles in any number of dimensions

### 9. Projections

*What is the closest point you can reach?*

- **ID:** `projection`
- **Outcome:** Find the closest point in a subspace, and prove that it is the closest.
- **Needs:** `linear-maps`, `dot-product`
- **Level:** 3
- **Must include:** normal equations Aᵀ(Ax − b) = 0 derived; dependent inputs to Gram–Schmidt; extending an orthonormal set to a basis; the orthogonal complement; affine sets as shifted subspaces; point-to-hyperplane distance; a first taste of line fitting with three points
- **Lessons:**
  1. Projection onto a line
  2. The closest point, proved with Pythagoras
  3. Orthonormal bases and Gram–Schmidt
  4. Projection onto a subspace, and the left null space
  5. Lines, planes and hyperplanes

### 10. Determinants in two and three dimensions

*How much does a matrix stretch area?*

- **ID:** `determinants`
- **Outcome:** Derive the 2×2 and 3×3 determinants, and prove when a small matrix is invertible.
- **Needs:** `linear-maps`, `dot-product`
- **Level:** 3
- **Must include:** orientation and swapping; the 3×3 formula derived; a zero determinant is equivalent to a nonzero null vector, for 2×2 and 3×3
- **Lessons:**
  1. Signed area and the 2×2 determinant
  2. Signed volume and the 3×3 determinant
  3. Row operations and determinants
  4. Zero determinant, dependence and inverses

### 11. Eigenvectors

*Which directions does a matrix only stretch or flip?*

- **ID:** `eigenvectors`
- **Outcome:** Find the eigenvalues and eigenvectors of small matrices, and prove when a matrix can be diagonalised.
- **Needs:** `determinants`
- **Level:** 3
- **Must include:** two, one or no real roots; diagonalisable exactly when there is a basis of eigenvectors; tr(AB) = tr(BA); the characteristic polynomial only for 2×2 and 3×3
- **Lessons:**
  1. Completing the square and the quadratic formula
  2. Directions that do not turn
  3. The characteristic polynomial of small matrices, and the trace
  4. Diagonalising a matrix
  5. A rotation with no real eigenvectors

### 12. The spectral theorem

*Why do symmetric matrices have perpendicular axes?*

- **ID:** `spectral-theorem`
- **Outcome:** Prove that every real symmetric matrix has an orthonormal basis of eigenvectors.
- **Needs:** `eigenvectors`, `projection`
- **Level:** 3
- **Must include:** local definitions of continuous, closed and bounded; xᵀAx is continuous and the unit sphere is closed and bounded; the complement of u is mapped to itself, and the restricted matrix is symmetric; the greatest and least value both used later; semidefinite defined by quadratic forms, then related to eigenvalues
- **Stated:** a continuous function on a nonempty, closed, bounded set reaches its maximum and minimum
- **Lessons:**
  1. Proof by induction
  2. Quadratic forms
  3. Continuous functions, closed and bounded sets, and the stated fact
  4. One eigenvector, proved
  5. All the eigenvectors, by induction
  6. Positive semidefinite matrices

### 13. Singular value decomposition

*How can any table be split into simple layers?*

- **ID:** `svd`
- **Outcome:** Build the SVD of any matrix, and prove that the pseudoinverse gives the smallest least-squares solution.
- **Needs:** `spectral-theorem`
- **Level:** 3
- **Must include:** zero singular values, rectangular matrices and the zero matrix; existence and uniqueness of the smallest solution
- **Lessons:**
  1. From AᵀA to singular values
  2. Building the SVD of any matrix
  3. Change coordinates, scale, change again
  4. The pseudoinverse
  5. The least-squares solution of smallest norm

### 14. The best low-rank approximation

*How much of a table can you throw away?*

- **ID:** `low-rank`
- **Outcome:** Prove which low-rank matrix is closest, and calculate the error.
- **Needs:** `svd`
- **Level:** 3
- **Must include:** rank at most k, including k above the rank; ties and zero singular values; proved here without PCA, which reuses it
- **Lessons:**
  1. The Frobenius norm
  2. The weights argument
  3. The best approximation, proved
  4. Compressing a real table

### 15. Capstone: fitting a line by projection

*Which line misses the penguins’ weights by least?*

- **ID:** `line-by-projection`
- **Outcome:** Fit a line to data by projection, and say what the fit does not tell you.
- **Needs:** `svd`
- **Level:** 3
- **Must include:** the matrix form built from single equations; only geometric limits: extrapolation, large residuals, pattern is not cause
- **Lessons:**
  1. Data as a design matrix with an intercept column
  2. Predicting body mass from flipper length
  3. Dependent features, and coefficients of smallest norm
  4. What the line does not tell you
  5. Part I mixed review

## 5. Part II: Change and optimisation

### 16. Functions, exponentials and logarithms

*How do you turn multiplying into adding?*

- **ID:** `functions`
- **Outcome:** Compose and invert functions, and rewrite products with logarithms.
- **Needs:** `opening`, `dot-product`
- **Level:** 3
- **Must include:** restricting a domain, as for x²; log rules derived from the exponent rules
- **Stated:** powers with real exponents exist, obey the usual rules and change continuously; the intermediate value theorem, in pictures
- **Lessons:**
  1. Domain, range and composition
  2. One-to-one functions and inverses
  3. Exponential growth
  4. Logarithms and their rules
  5. Products, Π notation and sums of logarithms

### 17. Limits and continuity

*What happens when you get as close as you like?*

- **ID:** `limits`
- **Outcome:** Use the precise definition of a limit, prove the limit laws, and recognise continuity.
- **Needs:** `functions`, `spectral-theorem`
- **Level:** 3
- **Must include:** two complete ε–δ proofs, one linear and one not; sum and product laws; a nonzero denominator in the quotient law; sums, products and compositions of continuous functions
- **Stated:** a continuous function on a nonempty, closed, bounded set reaches its maximum and minimum; the intermediate value theorem
- **Lessons:**
  1. Getting close: the precise definition
  2. The limit laws
  3. Sequences and geometric decay
  4. Continuous and broken functions
  5. Closed and bounded sets, and the stated facts again

### 18. Derivatives

*How steep is a curve at one point?*

- **ID:** `derivatives`
- **Outcome:** Derive the derivative rules, and differentiate the functions machine learning uses.
- **Needs:** `limits`
- **Level:** 3
- **Must include:** the chain rule proved with an error term, so that a zero inner change causes no gap; continuity of the inverse; σ′ = σ(1 − σ) and saturation; (1 + u/n)ⁿ approaches eᵘ
- **Stated:** a base e whose exponential has slope 1 at 0 exists
- **Lessons:**
  1. From average to instantaneous slope
  2. Sums, products and quotients
  3. The chain rule
  4. Inverse functions
  5. Exponentials and logarithms
  6. The sigmoid

### 19. What the slope tells you

*How can slopes prove a function is always above a line?*

- **ID:** `mean-value`
- **Outcome:** Use first and second derivatives to find minima, and prove log x ≤ x − 1.
- **Needs:** `derivatives`
- **Level:** 3
- **Must include:** interior extrema; local and global; limits of the tests; equality only at x = 1
- **Stated:** a continuous function on a nonempty, closed, bounded set reaches its maximum and minimum
- **Lessons:**
  1. Maxima, minima and zero slope
  2. Rolle’s theorem and the mean value theorem
  3. Rising, falling and constant functions, and log x ≤ x − 1
  4. Second derivatives and curvature
  5. Quadratic approximation and its error

### 20. Integrals

*How do you add up infinitely many thin slices?*

- **ID:** `integrals`
- **Outcome:** Calculate integrals by hand, including over infinite ranges.
- **Needs:** `mean-value`
- **Level:** 3
- **Must include:** both parts of the fundamental theorem: the first from continuity, the second from the mean value theorem; convergent and divergent integrals, each tail separately; general substitution is not covered
- **Stated:** a continuous function on a closed interval has an integral
- **Lessons:**
  1. Area as accumulation
  2. The slope of an accumulation
  3. Evaluating with antiderivatives
  4. Linear substitution
  5. Integration by parts
  6. Integrals over infinite ranges

### 21. Gradients and the chain rule

*Which way is uphill when there are many directions?*

- **ID:** `gradients`
- **Outcome:** Find gradients and Jacobians, and prove that the gradient is the steepest direction.
- **Needs:** `mean-value`, `projection`
- **Level:** 3
- **Must include:** differentiable means well approximated by a linear map; continuous partial derivatives are enough, proved with the mean value theorem; unit directions and a zero gradient; every matrix derivative the book uses, from components
- **Lessons:**
  1. Functions of several variables and partial derivatives
  2. The gradient and linear approximation
  3. The steepest direction, proved
  4. Jacobians and their shapes
  5. The chain rule, derived
  6. Gradients of linear and quadratic forms

### 22. Curvature in many directions

*Bowl, hill or saddle?*

- **ID:** `curvature`
- **Outcome:** Classify stationary points with the Hessian.
- **Needs:** `gradients`, `spectral-theorem`
- **Level:** 3
- **Must include:** continuous second derivatives assumed; at a stationary point, positive definite is enough for a strict local minimum, and semidefinite alone decides nothing; an undecided minimum, maximum and saddle
- **Lessons:**
  1. The Hessian
  2. When mixed derivatives agree, proved
  3. Quadratic approximation in several variables
  4. Minima, maxima and saddles
  5. When the test decides nothing
- **Optional:** Newton’s method

### 23. Convexity

*When is the bottom you found the only bottom?*

- **ID:** `convexity`
- **Outcome:** Prove that a loss is convex, and say what convexity does and does not promise.
- **Needs:** `curvature`
- **Level:** 3
- **Must include:** convex does not mean one minimum; convex domains and smoothness; the test in many variables by restricting to lines; finite Jensen by induction, with zero weights
- **Lessons:**
  1. Convex sets and functions
  2. Tangents lie below
  3. Second-derivative tests
  4. Existence, global minima and uniqueness
  5. Jensen’s inequality

### 24. Gradient descent

*How big a step is safe?*

- **ID:** `gradient-descent`
- **Outcome:** Run gradient descent by hand, and prove when it converges on a quadratic.
- **Needs:** `convexity`, `svd`
- **Level:** 3
- **Must include:** positive definite quadratics with a fixed step; the semidefinite case separately; the condition number of least squares; rounding, cancellation, overflow and underflow; counterexamples instead of a general theorem
- **Lessons:**
  1. Stepping downhill
  2. Convergence and divergence on a quadratic, proved
  3. Conditioning: long narrow valleys
  4. Computer arithmetic
  5. What can go wrong on other losses
- **Optional:** Momentum

### 25. Capstone: fitting a line by gradient descent

*Can you find the same line by walking downhill?*

- **ID:** `line-by-descent`
- **Outcome:** Fit a line by gradient descent, and explain when it agrees with projection.
- **Needs:** `line-by-projection`, `gradient-descent`
- **Level:** 3
- **Must include:** each point of the surface is a line; with dependent features, equal predictions can come from different coefficients, and starting at zero with a safe step finds the smallest
- **Lessons:**
  1. The loss surface of a line
  2. Steps by hand
  3. Feature scale and slow valleys
  4. Part II mixed review

## 6. Part III: Uncertainty and statistics

### 26. Probability and Bayes

*How should evidence change your mind?*

- **ID:** `probability`
- **Outcome:** Calculate probabilities from the axioms, and derive and use Bayes’ theorem.
- **Needs:** `subspaces`
- **Level:** 3
- **Must include:** unions, intersections and complements; frequency is an estimate, not a definition; nonzero conditioning events; independent is not mutually exclusive
- **Lessons:**
  1. Outcomes and events
  2. The axioms, and what follows from them
  3. Conditional probability
  4. Independence and conditional independence
  5. Bayes’ theorem

### 27. Random variables and expectation

*What do you expect on average?*

- **ID:** `random-variables`
- **Outcome:** Calculate with discrete distributions, and prove that expectation is linear.
- **Needs:** `probability`, `vectors`
- **Level:** 3
- **Must include:** a random variable as a function of outcomes; no binomial formula in required lessons
- **Lessons:**
  1. Random variables and their distributions
  2. Bernoulli, categorical and indicator variables
  3. Joint, marginal and conditional distributions
  4. Expectation, and the expectation of g(X)
  5. Linearity of expectation, proved
- **Optional:** Counting and the binomial distribution; Geometric and Poisson distributions

### 28. Variance and covariance

*How far do things spread, and do they spread together?*

- **ID:** `variance`
- **Outcome:** Measure spread and association, and prove the bounds on correlation.
- **Needs:** `random-variables`, `spectral-theorem`
- **Level:** 3
- **Must include:** nonzero variances in the bound; covariance matrices are symmetric and positive semidefinite, proved; association that reverses within species
- **Lessons:**
  1. Mean, median, histograms and outliers
  2. Variance
  3. Covariance and the variance of a sum
  4. Correlation, with bounds proved
  5. Covariance matrices

### 29. Samples and the law of large numbers

*Why do averages settle down?*

- **ID:** `law-of-large-numbers`
- **Outcome:** Derive the N − 1 correction and the standard error, and prove the weak law.
- **Needs:** `variance`, `limits`
- **Level:** 3
- **Must include:** assumptions stated each time; dividing by N to describe, by N − 1 to estimate; failing assumptions need not mean a failing law
- **Lessons:**
  1. Population, sample and independent observations
  2. The variance of an average, and standard error
  3. The N − 1 correction
  4. Markov’s and Chebyshev’s inequalities
  5. The weak law, proved
  6. When the assumptions fail

### 30. Continuous distributions

*How can every exact value have probability zero?*

- **ID:** `densities`
- **Outcome:** Find probabilities, means and variances from a density, and change variables linearly.
- **Needs:** `integrals`, `variance`
- **Level:** 3
- **Must include:** a density can exceed 1; negative factors, and why zero is excluded; the discrete results, linearity included, for one continuous variable
- **Lessons:**
  1. From histograms to densities
  2. Cumulative distribution
  3. Mean, variance and expectations from a density
  4. The uniform distribution
  5. Linear change of variable
- **Optional:** Exponential distribution

### 31. Two continuous variables

*What does one measurement say about another?*

- **ID:** `joint-densities`
- **Outcome:** Calculate joint, marginal and conditional densities, and prove that expectation stays linear.
- **Needs:** `densities`, `gradients`, `law-of-large-numbers`
- **Level:** 3
- **Must include:** one variable held fixed; conditions for changing the order; a positive marginal density where one conditions; independence; expectation, variance of independent sums and the law of large numbers extended to any number of continuous variables
- **Stated:** exchange of order of integration
- **Lessons:**
  1. Integrals in two variables
  2. Changing the order of integration
  3. Joint, marginal and conditional densities
  4. Expectation and covariance

### 32. The Gaussian in one variable

*Why does one curve appear so often?*

- **ID:** `gaussian`
- **Outcome:** Derive the Gaussian’s mean and variance, and use it for approximate intervals.
- **Needs:** `joint-densities`, `law-of-large-numbers`, `functions`
- **Level:** 3
- **Must include:** tail limits before integration by parts; independent observations with finite variance; an interval for an average is not one for a single observation; known and estimated spread; no general density in two dimensions
- **Stated:** the Gaussian integral; the central limit theorem, for independent identically distributed observations with finite positive variance, also with a consistent estimate of the standard deviation
- **Lessons:**
  1. The Gaussian curve
  2. Its mean and variance, derived
  3. Shifting and scaling
  4. When standardised averages look Gaussian, by simulation
  5. Approximate intervals
  6. Two dimensions as a picture

### 33. Maximum likelihood

*Which setting makes the data least surprising?*

- **ID:** `likelihood`
- **Outcome:** Fit a distribution by maximum likelihood, and calculate it without underflow.
- **Needs:** `gaussian`, `mean-value`
- **Level:** 3
- **Must include:** the likelihood of an exact continuous value is not its probability; all successes and all failures; the categorical case from log x ≤ x − 1, with zero counts and no Lagrange multipliers; identical observations, where no Gaussian fit exists
- **Lessons:**
  1. Likelihood, and densities as likelihoods
  2. Bernoulli data
  3. Categorical data from counts
  4. Gaussian mean and variance
  5. Logs instead of tiny products
  6. Log-sum-exp

### 34. Entropy and cross-entropy

*How do you measure surprise?*

- **ID:** `cross-entropy`
- **Outcome:** Derive cross-entropy from a likelihood, and prove when it is smallest.
- **Needs:** `likelihood`
- **Level:** 3
- **Must include:** bits and nats; zero probabilities and infinite loss; average loss on data as an estimate of an expectation
- **Lessons:**
  1. Surprise and entropy
  2. Cross-entropy, and why the true distribution minimises it
  3. Cross-entropy as a classification loss
- **Optional:** KL divergence

### 35. Capstone: fitting a line by likelihood

*Why square the errors?*

- **ID:** `line-by-likelihood`
- **Outcome:** Derive least squares from Gaussian noise, and state what that assumes.
- **Needs:** `likelihood`, `line-by-descent`
- **Level:** 3
- **Must include:** conditioning on the features, which need not be Gaussian; independent errors with mean zero and one variance; the degrees-of-freedom correction waits for Part V
- **Lessons:**
  1. A line plus noise
  2. Least squares from likelihood
  3. Estimating the noise
  4. Part III mixed review

## 7. Part IV: Machine learning

### 36. Linear regression

*What is a model, and when should you distrust it?*

- **ID:** `linear-regression`
- **Outcome:** Fit and interpret linear regression in three ways, and identify its failures.
- **Needs:** `line-by-likelihood`, `line-by-projection`
- **Level:** 3
- **Must include:** no learned preprocessing yet; which failure harms prediction, interpretation or inference; linear in the coefficients
- **Lessons:**
  1. Features, targets, units and missing data
  2. Three views of one fit
  3. Many features, rank and coefficients of smallest norm
  4. Outliers and broken assumptions
  5. Curves from linear models

### 37. Evaluation and overfitting

*Will it work on data it has never seen?*

- **ID:** `evaluation`
- **Outcome:** Estimate error on new data honestly, with its uncertainty.
- **Needs:** `linear-regression`
- **Level:** 3
- **Must include:** preprocessing fitted on training data only; choosing a model is not measuring it; the interval is for one fitted model and independent, representative test data; random and grouped splits compared
- **Stated:** the central limit theorem
- **Lessons:**
  1. Risk, and why training error misleads
  2. Training, validation and test
  3. Leakage and grouped data
  4. Cross-validation
  5. A test error with an approximate interval

### 38. Bias and variance

*Why can a better fit predict worse?*

- **ID:** `bias-variance`
- **Outcome:** Derive the bias–variance decomposition, and use it to explain over- and underfitting.
- **Needs:** `evaluation`
- **Level:** 3
- **Must include:** what is random: the training set and the new outcome; a fixed input; repeated refitting
- **Lessons:**
  1. Estimators, bias and mean squared error
  2. The decomposition, derived
  3. Seeing both by simulation

### 39. Regularisation, scaling and encoding

*How do you stop a model trying too hard?*

- **ID:** `regularisation`
- **Outcome:** Derive ridge regression, and choose its strength, scales and encodings soundly.
- **Needs:** `bias-variance`, `convexity`
- **Level:** 3
- **Must include:** the fully penalised case marked as a simplification; the shifted-target example; centring, standardising and changing units; features that never vary; all categories plus an intercept are dependent
- **Lessons:**
  1. Ridge regression, derived
  2. The intercept is special
  3. Scaling features
  4. Encoding categories
  5. Choosing the strength by validation
  6. The lasso, in pictures

### 40. Principal component analysis

*What is the best shadow of the data?*

- **ID:** `pca`
- **Outcome:** Derive PCA for any number of directions, and say when it misleads.
- **Needs:** `low-rank`, `variance`, `regularisation`
- **Level:** 3
- **Must include:** total and mean error, and dividing by N or N − 1; signs and ties; curved data, outliers, useful directions of low variance, and leakage
- **Lessons:**
  1. Centring, and the variance of a projection
  2. The first direction, proved
  3. Several directions, proved
  4. Reconstruction error and the SVD
  5. Scale and other failures

### 41. Logistic regression

*How do you predict yes or no?*

- **ID:** `logistic-regression`
- **Outcome:** Derive, fit and interpret logistic regression, and prove when a finite fit exists.
- **Needs:** `regularisation`, `cross-entropy`, `gradient-descent`
- **Level:** 3
- **Must include:** complete and quasi-complete separation; existence proved on the row space of the features: without separation, the stated fact on its unit sphere gives one bound that makes the loss grow in every direction; dependent features treated apart; separation concerns the unpenalised fit; loss reported at every step
- **Lessons:**
  1. From odds to a probability
  2. The loss and its gradient, computed stably
  3. Convexity, rank and uniqueness
  4. Separation: when no finite fit exists
  5. When a fit exists, proved
  6. Fitting by hand

### 42. Judging classifiers

*When is 99% accuracy useless?*

- **ID:** `classification-metrics`
- **Outcome:** Choose and defend a metric and a threshold, using ROC and precision–recall curves.
- **Needs:** `logistic-regression`, `evaluation`
- **Level:** 3
- **Must include:** specificity, balanced accuracy and F1; area under the ROC curve; undefined ratios; thresholds chosen on validation data; when accuracy is the right metric
- **Lessons:**
  1. The confusion matrix
  2. Precision, recall and their relatives
  3. Thresholds and their trade-offs
  4. ROC and precision–recall curves
  5. Unbalanced data

### 43. More than two classes

*How do you choose among three species?*

- **ID:** `softmax`
- **Outcome:** Derive softmax classification and its gradient, and calculate it stably.
- **Needs:** `logistic-regression`, `likelihood`, `classification-metrics`
- **Level:** 3
- **Must include:** a shared shift of scores changes nothing; confusion matrices and averages for several classes
- **Lessons:**
  1. One-hot targets and scores
  2. Softmax, and its redundancy
  3. From softmax to the loss: the Jacobian and p − y
  4. The gradient of the weights
  5. Stable calculation

### 44. Small neural networks

*What can a hidden layer do that a line cannot?*

- **ID:** `neural-networks`
- **Outcome:** Build a one-hidden-layer network with stated input, hidden and output sizes and biases, for regression, binary and multiclass classification, and run it by hand.
- **Needs:** `softmax`, `linear-regression`
- **Level:** 3
- **Must include:** a proof that no line separates the example; every shape checked
- **Lessons:**
  1. Where straight boundaries fail
  2. A hidden layer: sizes, weights, biases and sigmoids
  3. Three outputs and three losses
  4. A forward pass for regression and yes–no
  5. A forward pass for several classes

### 45. Backpropagation

*Which weight is to blame?*

- **ID:** `backpropagation`
- **Outcome:** Derive backpropagation for the three kinds of output, and carry out full updates by hand.
- **Needs:** `neural-networks`, `gradients`
- **Level:** 3
- **Must include:** formulas by components first; all gradients use the old weights
- **Lessons:**
  1. One weight, one path: the chain rule on a graph
  2. Many paths add up
  3. Backpropagation in matrix form
  4. A full update for regression
  5. Full updates for classification

### 46. Training a network

*Why do some networks refuse to learn?*

- **ID:** `training-networks`
- **Outcome:** Derive unbiased stochastic gradients, and explain and demonstrate training failures.
- **Needs:** `backpropagation`, `random-variables`, `classification-metrics`, `pca`
- **Level:** 3
- **Must include:** sampling rules for unbiasedness; unbiased does not mean convergent; hidden units with the same activation stay equal when incoming weights, biases and outgoing weights all start equal and every update treats them alike, not merely when incoming weights are equal
- **Lessons:**
  1. Stochastic gradient descent
  2. Starting weights and symmetry
  3. Saddles and saturation
  4. Judging a trained network
  5. Looking back: the same data, five models

## 8. Part V: Full Book

### 47. Determinants in any dimension

*How does volume scale in many dimensions?*

- **ID:** `determinants-n`
- **Outcome:** Define the determinant, prove that it does not depend on the elimination path, and prove the properties later chapters use.
- **Needs:** `determinants`, `spectral-theorem`
- **Level:** 3
- **Must include:** row operations, products, transposes and triangular matrices; product of eigenvalues for symmetric matrices; no permutations without teaching them

### 48. The multivariate Gaussian

*What shape is a cloud of data?*

- **ID:** `multivariate-gaussian`
- **Outcome:** Derive the density, its linear maps and its marginals, including sums of independent Gaussians.
- **Needs:** `determinants-n`, `joint-densities`, `gaussian`
- **Level:** 3
- **Must include:** joint densities, independence, marginals and repeated integrals extended to n variables first; linear change of variables derived from elementary matrices; square roots of semidefinite matrices; Gaussians with no density
- **Stated:** the Gaussian integral; exchange of order of integration

### 49. Conditionals and conjugacy

*How does one measurement sharpen another?*

- **ID:** `gaussian-conditionals`
- **Outcome:** Derive Gaussian conditionals, and the posterior for a Gaussian mean with known noise.
- **Needs:** `multivariate-gaussian`
- **Level:** 3
- **Must include:** block matrices and elimination; completing the square with vectors; invertibility conditions

### 50. Intervals and the bootstrap

*How sure are you of a slope?*

- **ID:** `intervals`
- **Outcome:** Derive the sampling distribution of regression coefficients with known variance, and build exact, large-sample and bootstrap intervals.
- **Needs:** `multivariate-gaussian`, `linear-regression`, `evaluation`
- **Level:** 3
- **Must include:** fixed full-rank design and Gaussian errors; residual degrees of freedom derived; when the bootstrap fails
- **Stated:** (1) the central limit theorem. (2) Take a fixed number of coefficients, a sequence of full-column-rank designs with an intercept, independent identically distributed errors with mean zero and finite positive variance, and largest leverage tending to zero. Then a coefficient or fixed nonzero linear combination of coefficients, minus its true value and divided by its standard error, converges in distribution to the standard Gaussian, also when the standard error uses a consistent estimate of the variance, as the residual variance is. (3) The same for an average, and for the difference of averages of two independent samples, each of independent identically distributed observations with finite positive variance, as every sample grows. (4) Percentile bootstrap intervals have coverage tending to the nominal level: for (3), resampling within each sample; for (2), refitting after resampling centred residuals, with the design fixed. (5) With a fixed full-column-rank design of p coefficients including the intercept, N > p, and independent Gaussian errors with mean zero and one positive variance, (estimate − true value) / (estimated standard error) has exactly Student’s t distribution with N − p degrees of freedom

### 51. Tests, p-values and A/B tests

*How surprising is this if nothing is going on?*

- **ID:** `tests`
- **Outcome:** Run and interpret permutation, large-sample and t-tests, explain both kinds of error and power, and plan an A/B test’s size.
- **Needs:** `intervals`
- **Level:** 3
- **Must include:** exchangeability under the null hypothesis, which equal means alone do not give; the Welch–Satterthwaite degrees of freedom calculated; experiments and observations; one-sample before two-sample; finite-permutation correction
- **Stated:** the results of `intervals`, with their conditions; for two independent samples, each of at least two independent Gaussian observations with one mean and one positive variance per sample, which may differ between samples, Welch’s standardised difference of averages is approximately Student’s t with the Welch–Satterthwaite degrees of freedom when the population means are equal

### 52. Bayesian linear regression

*How should beliefs about a line change with data?*

- **ID:** `bayesian-regression`
- **Outcome:** Derive MAP, the posterior and its credible intervals, and predictions with their uncertainty.
- **Needs:** `gaussian-conditionals`, `regularisation`, `intervals`
- **Level:** 3
- **Must include:** Gaussian prior and known noise; when MAP is ridge; uncertainty of the line and of a new observation; credible and confidence intervals compared

### 53. Equality constraints

*What is the best point on a path?*

- **ID:** `lagrange`
- **Outcome:** Derive the Lagrange condition in two variables, and use it in several.
- **Needs:** `curvature`
- **Level:** 3
- **Must include:** continuously differentiable functions and a nonzero constraint gradient; the local curve proved in two variables; candidates are not always optima
- **Stated:** the intermediate value theorem; existence of multipliers in general

### 54. Gaussian mixtures and EM

*Can structure like the species appear without labels?*

- **ID:** `mixtures`
- **Outcome:** Derive the EM updates, and run a step by hand.
- **Needs:** `lagrange`, `multivariate-gaussian`, `likelihood`
- **Level:** 3
- **Must include:** latent variables, responsibilities and the objective each step improves; one dimension first; covariance update from log x ≤ x − 1; singular scatter and empty components; components are not proof of real groups

### 55. What EM guarantees, and how it fails

*Does each step really help?*

- **ID:** `em-guarantees`
- **Outcome:** Prove that EM never lowers the likelihood under stated conditions, and demonstrate EM’s failures.
- **Needs:** `mixtures`, `convexity`
- **Level:** 3
- **Must include:** the conditions: a finite starting log-likelihood, exact responsibilities, and an M-step that does not lower its objective; for Gaussian mixtures, positive total responsibilities and nonsingular scatter; zero weights and where densities are zero; rising likelihood, converging parameters and local maxima told apart; label switching, local optima, collapse and empty components

### 56. Inequality constraints and duality

*What if the best point is out of bounds?*

- **ID:** `kkt`
- **Outcome:** Prove weak duality and KKT sufficiency, and check Slater’s conditions.
- **Needs:** `lagrange`, `convexity`
- **Level:** 3
- **Must include:** one sign convention; quadratic programs defined; conditions of Slater’s theorem
- **Stated:** Slater’s theorem; existence of multipliers

### 57. Support vector machines

*Which boundary leaves the most room?*

- **ID:** `svm-primal`
- **Outcome:** Derive the hard- and soft-margin problems, and check Slater’s condition.
- **Needs:** `kkt`, `projection`, `regularisation`
- **Level:** 3
- **Must include:** separability; slack and hinge loss; the role of C; scaling
- **Optional:** Subgradients

### 58. The dual and support vectors

*Which points hold up the boundary?*

- **ID:** `svm-dual`
- **Outcome:** Derive the dual, and find support vectors and the intercept by hand.
- **Needs:** `svm-primal`
- **Level:** 3
- **Must include:** minimising over every primal variable; the interval of valid intercepts; margin points and support vectors told apart

### 59. Kernels

*How can a straight boundary bend?*

- **ID:** `kernels`
- **Outcome:** Derive kernel SVMs, and test a Gram matrix while knowing that one sample cannot prove a kernel valid.
- **Needs:** `svm-dual`, `spectral-theorem`
- **Level:** 3
- **Must include:** explicit feature maps before kernels; linear and polynomial kernels proved valid; the Gaussian (RBF) kernel proved valid as a limit of positively rescaled polynomial kernels, since limits keep quadratic forms nonnegative; parameters, overfitting and cost

## 9. Reviews

**Decided by Ammar on 2026-11-24.** Claude recommended all four, and Ammar approved them. They are applied to `docs/gap-assessment.md` and `CHARTER.md`. ChatGPT agreed with 2, 3 and 4, and asked for changes to 1; these are addressed, and the corrections from its closure check are addressed below.

1. **Stated results** (`docs/gap-assessment.md` section 5). Add the intermediate value theorem, the integral of a continuous function, powers with real exponents, and a base e with slope 1 at 0; these rest on the completeness of the real numbers, which the book assumes. Add the specific large-sample results listed in `gaussian`, `intervals` and `tests`, and extend exchange of integration order beyond two variables. Drop convergence of stochastic and non-convex gradient descent, which the book no longer claims.
2. **The uniform distribution** becomes required. It was optional (G45), but it is the simplest density.
3. **ROC and precision–recall curves** join `classification-metrics` (G14). ChatGPT checked that Google's Machine Learning Crash Course teaches ROC, with precision–recall curves as optional material.
4. **A proof register** joins each chapter specification (`CHARTER.md` section 8): each result, its assumptions, the earlier results it needs, and where they were taught.

**Second review.** The mandatory fixes have been addressed, with the decisions above. Its proof that the RBF kernel is valid replaces a stated result: Claude had wrongly recorded the first review as asking for that statement. It was right that a spread of adjusted Rand indices does not show local optima: of nine low runs, six had only stopped too early. Section 2 now gives converged runs with their log-likelihoods. ChatGPT recommended a closure check of these fixes, not a third full review.

**Closure check of the third draft.** Not closed: precise statistical statements in `intervals`, `tests` and `gaussian`; a prerequisite of `joint-densities`; biases in `training-networks`; and wording in `kernels` and in sections 2 and 9. All are addressed in this draft, and ChatGPT confirmed from the changes that they are closed. The structure was not questioned.

**First review: not accepted, or accepted in part.** ChatGPT accepted these answers; on optional lessons, wording and Lagrange multipliers it asked for the conditions shown.

| Finding | Answer |
| --- | --- |
| Completing the square blocks approval | Ammar had left it to Claude after the review file was made; the charter records this |
| Formal rewording of the questions for `systems`, `convexity`, `densities` and `likelihood` | Kept; `convexity` and `likelihood` must correct the loose reading |
| Separate metadata for recommended order and retrieval | **Needs** holds mathematics and assessment only; the rest belongs in specifications |
| State the local curve for Lagrange multipliers, or prove a restricted case | To be proved in two variables, with continuously differentiable functions and a nonzero constraint gradient |
| Optional lessons conflict with the glossary | No mastery or retrieval is required, but they get the same teaching review |
| Opening is too long to be short | Kept: one chapter, and readiness checks skip known parts |
| Split `kkt`, `tests`, `intervals`, `mixtures` and `multivariate-gaussian` now | Decided when Part V's lessons are planned |
| Dataset scripts before approval | In the proof of concept, before any lesson uses the results |
| Checking that required lessons use no optional topic | A criterion of each specification's review; the script cannot see content |

The other findings are applied above, or are wording and detail left to chapter specifications. After the first review, three chapters were added to separate overloaded lessons: `low-rank`, `joint-densities` and `training-networks`.
