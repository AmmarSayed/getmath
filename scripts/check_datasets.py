"""Reproduce every row of section 2 of docs/table-of-contents.md from the pinned data.

Decisions made before any result was seen. They are never changed to match the table:

- Packages: scikit-learn 1.9.1, SciPy 1.18.1 and NumPy, pinned in pyproject.toml and uv.lock.
  The CSV files are read with the standard library.
- Data: data/penguins.csv and data/real-estate-valuation.csv, whose SHA-256 is checked before use.
- One seed, SEED, for shuffling, cross-validation (5 folds, stratified, shuffled) and the network.
- Mixture: GaussianMixture(3, covariance_type="full", init_params="random_from_data", n_init=1,
  random_state=SEED + i for i in 0..19, tol=1e-10, max_iter=10000) on standardised measurements.
  "Log-likelihood" is the total. The groups are the final log-likelihoods, rounded to one decimal.
  The adjusted Rand index (ARI) compares the groups with species.
- Standardise with the population standard deviation (StandardScaler).
- PCA and the mixture use the 342 rows with all four measurements. So does the softmax fit,
  with LogisticRegression defaults except a large max_iter.
- Separability, with linear programs from SciPy. Complete: some w, b has margin >= 1 for every point.
  Quasi-complete: a nonzero direction (w, b) separates weakly, and some point lies on the plane;
  the linear program minimises the sum of slacks. Tests on tiny hand-made cases show both are right.
- Outlier limit: on 414 rows, compare the slope of price on distance with and without the single
  highest price. "Barely moves" holds if the change is under 5% of the slope.
- Kernels and a small network: penguins, four measurements, three species, the same folds, logistic
  regression against SVC (rbf defaults) and MLPClassifier(hidden_layer_sizes=(8,), max_iter=5000),
  scaled inside each fold. "Do not beat" holds if neither mean accuracy is higher.
- Every other row is as the table states it, at the precision it shows.
"""

SEED = 20261124
FOLDS = 5
STARTS = 20
MIXTURE = dict(n_components=3, covariance_type="full", init_params="random_from_data", n_init=1, tol=1e-10, max_iter=10000)
MAX_ITER = 100000  # LogisticRegression, large enough to converge
OUTLIER_LIMIT = 0.05
NETWORK = dict(hidden_layer_sizes=(8,), max_iter=5000)
DATA = {
    "penguins.csv": "f204db2c753b0937caac3cb35258562c14f073e4bbc76be24b4c51ce22767a93",
    "real-estate-valuation.csv": "0730a5687ec285a3c2f9921a808855bd1bde21fc53e6377561cbdce2dda9cbb1",
}
DOMINANT_LOADING = 0.99  # "almost entirely body mass": its share of the first direction, in absolute value
SEPARATION_TOLERANCE = 1e-6  # the sum of slacks above which a direction separates
