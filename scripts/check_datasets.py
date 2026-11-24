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
import csv
import hashlib
import io
import re
import sys
import warnings
from decimal import ROUND_HALF_UP, Decimal
from functools import cache
from pathlib import Path

import numpy as np
from scipy import stats
from scipy.optimize import linprog
from sklearn.decomposition import PCA
from sklearn.metrics import adjusted_rand_score
from sklearn.mixture import GaussianMixture
from sklearn.model_selection import StratifiedKFold, cross_val_score
from sklearn.neural_network import MLPClassifier
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC
from sklearn.linear_model import LogisticRegression

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

ROOT = Path(__file__).resolve().parent.parent
errors = []
notes = []
values = []  # every reproduced value, unrounded, for --values

# Differences from the table that are known and reported to Ammar. Each is (row, label) ->
# (table value, reproduced value, reason). The script fails if a reproduced value changes,
# or if an entry is no longer needed. The table is corrected in a separate pull request.
LOWER = "The 20 starts fixed in advance give different local optima than the run behind the table, whose seeds are not recorded."
KNOWN = {
    ("Mixture of three Gaussians, standardised, full covariances", label): (table, got, LOWER)
    for label, table, got in [
        ("starts at the best", "17", "14"),
        ("stopped lower", "3", "6"),
        ("lower 1", "-1159.6", "-1188.5"),
        ("lower 2", "-1188.5", "-1191.6"),
        ("lower 3", "-1195.6", "-1191.8"),
        ("ARI lower 1", "0.91", "0.52"),
        ("ARI lower 2", "0.52", "0.53"),
        ("ARI lower 3", "0.60", "0.58"),
    ]
}


def check(ok, message):
    if not ok:
        errors.append(message)


# Data

@cache
def table():
    """The rows of section 2 of the table of contents, and its "Limits found" bullet."""
    text = (ROOT / "docs" / "table-of-contents.md").read_text(encoding="utf-8")
    section = re.search(r"(?ms)^## 2\. Data\n(.*?)^## 3\. ", text)[1]
    rows = []
    for line in section.splitlines():
        if line.startswith("| "):
            cells = [cell.strip() for cell in line.strip("|").split("|")]
            if cells[0] not in ("Check", "---"):
                rows.append(cells)
    return rows, re.search(r"(?m)^- \*\*Limits found.*$", section)[0]


def read_csv(name):
    raw = (ROOT / "data" / name).read_bytes()
    check(hashlib.sha256(raw).hexdigest() == DATA[name], f"data/{name}: the SHA-256 differs from the pinned one")
    return list(csv.DictReader(io.StringIO(raw.decode("utf-8"), newline="")))


MEASURES = ["bill_length_mm", "bill_depth_mm", "flipper_length_mm", "body_mass_g"]


@cache
def penguins():
    return read_csv("penguins.csv")


@cache
def complete():
    """The rows with all four measurements: species, and the measurements."""
    rows = [row for row in penguins() if all(row[name] != "NA" for name in MEASURES)]
    return np.array([row["species"] for row in rows]), np.array([[float(row[name]) for name in MEASURES] for row in rows])


@cache
def estate():
    rows = read_csv("real-estate-valuation.csv")
    price = np.array([float(row["Y house price of unit area"]) for row in rows])
    distance = np.array([float(row["X3 distance to the nearest MRT station"]) for row in rows])
    return rows, distance, price


def folds():
    return StratifiedKFold(FOLDS, shuffle=True, random_state=SEED)


def accuracy(model, X, y):
    """The mean accuracy over the folds, with scaling inside each fold."""
    return cross_val_score(make_pipeline(StandardScaler(), model), X, y, cv=folds()).mean()


# Separability

def separation(x, y):
    """"complete", "quasi-complete" or "none" for points x (rows) with labels y (0 or 1), by linear programs."""
    x = np.asarray(x, dtype=float)
    spread = x.std(axis=0)
    x = (x - x.mean(axis=0)) / np.where(spread > 0, spread, 1)  # separation does not depend on the scale
    signed = np.where(np.asarray(y) == 1, 1.0, -1.0)[:, None] * np.hstack([x, np.ones((len(x), 1))])
    free = [(None, None)] * signed.shape[1]
    if linprog(np.zeros(signed.shape[1]), A_ub=-signed, b_ub=-np.ones(len(x)), bounds=free, method="highs").status == 0:
        return "complete"
    # Margins between 0 and 1 for every point; a direction that separates weakly leaves some margin above 0.
    weak = linprog(-signed.sum(axis=0), A_ub=np.vstack([-signed, signed]), b_ub=np.r_[np.zeros(len(x)), np.ones(len(x))], bounds=free, method="highs")
    return "quasi-complete" if -weak.fun > SEPARATION_TOLERANCE else "none"


def pair_separation(first, second):
    species, measures = complete()
    keep = np.isin(species, [first, second])
    return separation(measures[keep][:, :2], species[keep] == second)


# One function for each row. Each returns the values of the row, in the order of the groups of
# its pattern, which is matched against the row's check and result text.

def counts():
    rows = penguins()
    return [len(rows), len(complete()[0]), sum(all(value != "NA" for value in row.values()) for row in rows)]


def line():
    r = stats.linregress(complete()[1][:, 2], complete()[1][:, 3])
    return [r.slope, r.rvalue**2]


def association():
    species, measures = complete()
    return [np.corrcoef(measures[mask][:, 0], measures[mask][:, 1])[0, 1] for mask in (species != "", *(species == s for s in ("Adelie", "Chinstrap", "Gentoo")))]


def components():
    measures = complete()[1]
    unscaled = PCA().fit(measures)
    loading = np.abs(unscaled.components_[0])
    dominant = MEASURES[loading.argmax()].replace("_mm", "").replace("_g", "").replace("_", " ")
    values.append(("first direction, body mass loading", float(loading[3])))
    return [dominant if loading.max() >= DOMINANT_LOADING else "none", unscaled.explained_variance_ratio_[0] * 100, PCA().fit(StandardScaler().fit_transform(measures)).explained_variance_ratio_[0] * 100]


def softmax():
    species, measures = complete()
    return [accuracy(LogisticRegression(max_iter=MAX_ITER), measures, species) * 100]


@cache
def runs():
    species, measures = complete()
    X = StandardScaler().fit_transform(measures)
    result = []
    for i in range(STARTS):
        model = GaussianMixture(**MIXTURE, random_state=SEED + i).fit(X)
        check(model.converged_, f"mixture: start {i} did not converge")
        result.append((model.score(X) * len(X), adjusted_rand_score(species, model.predict(X))))
    return result


def mixture():
    groups = {}
    for total, ari in runs():
        groups.setdefault(round(total, 1), []).append((total, ari))
    best, *lower = sorted(groups, reverse=True)
    values.extend((f"mixture: groups of log-likelihoods, {key}", [(round(t, 4), round(a, 4)) for t, a in groups[key]]) for key in sorted(groups, reverse=True))
    lower = (lower + [None] * 3)[:3]
    return [
        groups[best][0][1], STARTS, len(groups[best]), best, sum(len(groups[key]) for key in groups if key != best),
        *(key if key is not None else "none" for key in lower),
        *(groups[key][0][1] if key is not None else "none" for key in lower),
    ]


def welch():
    species, measures = complete()
    adelie, chinstrap = (measures[species == s][:, 3] for s in ("Adelie", "Chinstrap"))
    test = stats.ttest_ind(adelie, chinstrap, equal_var=False)
    interval = test.confidence_interval(0.95)
    return [len(adelie), len(chinstrap), adelie.mean() - chinstrap.mean(), interval.low, interval.high, test.pvalue]


def price_curves():
    _, distance, price = estate()
    return [len(price), stats.linregress(distance, price).rvalue ** 2, stats.linregress(np.log(distance), price).rvalue ** 2]


def coordinates():
    rows, *_ = estate()
    return [len(rows) - len({(row["X5 latitude"], row["X6 longitude"]) for row in rows})]


def outlier():
    _, distance, price = estate()
    keep = np.arange(len(price)) != price.argmax()
    with_, without = stats.linregress(distance, price).slope, stats.linregress(distance[keep], price[keep]).slope
    values.append(("outlier: slope with all 414 rows, without the highest price, change", (float(with_), float(without), float((without - with_) / with_))))
    return ["barely moves" if abs(without - with_) < OUTLIER_LIMIT * abs(with_) else "moves the slope", len(price)]


def kernels():
    species, measures = complete()
    scores = {
        "logistic regression": accuracy(LogisticRegression(max_iter=MAX_ITER), measures, species),
        "SVC": accuracy(SVC(), measures, species),
        "MLP": accuracy(MLPClassifier(**NETWORK, random_state=SEED), measures, species),
    }
    values.append(("kernels: mean accuracy", {name: float(score) for name, score in scores.items()}))
    return ["do not beat" if max(scores["SVC"], scores["MLP"]) <= scores["logistic regression"] else "beat"]


NUMBER = r"(−?\d+(?:\.\d+)?)"
# (start of the check cell, pattern on "check || result", labels, function)
ROWS = [
    ("Penguins, ", rf"Penguins, {NUMBER} rows \|\| {NUMBER} have all four measurements; {NUMBER} have every column", ["rows", "all four measurements", "every column"], counts),
    ("Body mass on flipper length", rf"slope {NUMBER} g per mm, in-sample R² {NUMBER}", ["slope", "R²"], line),
    ("Bill depth against bill length", rf"correlation {NUMBER} overall; {NUMBER} \(Adelie\), {NUMBER} \(Chinstrap\) and {NUMBER} \(Gentoo\)", ["overall", "Adelie", "Chinstrap", "Gentoo"], association),
    ("PCA of the four measurements", rf"unscaled: first direction almost entirely (body mass), {NUMBER}% of variance; standardised: {NUMBER}%", ["first direction", "unscaled variance %", "standardised variance %"], components),
    ("Adelie and Gentoo", r"(completely) separable", ["separation"], lambda: [{"complete": "completely"}.get(pair_separation("Adelie", "Gentoo"), "not completely")]),
    ("Adelie and Chinstrap", r"(neither) completely nor quasi-completely separable", ["separation"], lambda: [{"none": "neither"}.get(pair_separation("Adelie", "Chinstrap"), "separable")]),
    ("Three-class softmax", rf"{NUMBER}% accuracy, 5-fold cross-validation", ["accuracy %"], softmax),
    ("Mixture of three Gaussians", rf"\(ARI\) {NUMBER} with species\. Of {NUMBER} random starts run to convergence, {NUMBER} reach log-likelihood {NUMBER} and (three) stop lower: {NUMBER}, {NUMBER} and {NUMBER} \(ARI {NUMBER}, {NUMBER} and {NUMBER}\)", ["ARI", "starts", "starts at the best", "best log-likelihood", "stopped lower", "lower 1", "lower 2", "lower 3", "ARI lower 1", "ARI lower 2", "ARI lower 3"], mixture),
    ("Adelie (151) and Chinstrap (68)", rf"Adelie \({NUMBER}\) and Chinstrap \({NUMBER}\) body mass.*\|\| difference {NUMBER} g, 95% interval {NUMBER} to {NUMBER} g, p = {NUMBER}", ["Adelie rows", "Chinstrap rows", "difference", "interval low", "interval high", "p"], welch),
    ("Price per unit area", rf"{NUMBER} rows \|\| in-sample R² {NUMBER}; {NUMBER} on log distance", ["rows", "R²", "R² on log distance"], price_curves),
    ("Coordinates", rf"{NUMBER} rows repeat an earlier row's exact coordinates", ["repeated rows"], coordinates),
]
LIMITS = [
    ("outlier", rf"(barely moves) the slope of {NUMBER} rows", ["verdict", "rows"], outlier),
    ("kernels", r"(do not beat) a straight boundary on penguins", ["verdict"], kernels),
]


# Tests of the separability programs on tiny cases, as hand-made.
SEPARATION_CASES = [
    ("complete", [[0], [1], [2], [3]], [0, 0, 1, 1]),
    ("complete", [[0, 5], [0, 1], [1, 3], [1, 0]], [0, 0, 1, 1]),
    ("quasi-complete", [[0], [1], [1], [2]], [0, 0, 1, 1]),
    ("quasi-complete", [[0, 3], [1, 0], [1, 0], [2, 5]], [0, 0, 1, 1]),  # one point in both classes
    ("none", [[0], [1], [2]], [1, 0, 1]),
    ("none", [[0, 0], [1, 1], [0, 1], [1, 0]], [0, 0, 1, 1]),
]


def test_separation():
    for expected, x, y in SEPARATION_CASES:
        check(separation(x, y) == expected, f"separation: {x} with {y} is {expected}, but the program says {separation(x, y)}")


# Comparing with the table

def shown(value, token):
    """The value at the precision of the table's token, as the token is written."""
    if not re.fullmatch(r"-?\d+(\.\d+)?", token):
        return str(value)
    places = len(token.partition(".")[2])
    text = str(Decimal(repr(float(value))).quantize(Decimal(1).scaleb(-places), ROUND_HALF_UP))
    return text.removeprefix("-") if float(text) == 0 else text


def edge(value, token):
    """How far the value is from a rounding edge, in units of the last place shown."""
    places = len(token.partition(".")[2])
    return abs((abs(float(value)) * 10**places) % 1 - 0.5)


def compare(row, labels, tokens, results):
    for label, token, value in zip(labels, tokens, results, strict=True):
        token = {"three": "3"}.get(token.replace("−", "-"), token.replace("−", "-"))
        got = shown(value, token)
        values.append((f"{row}: {label}", value if isinstance(value, str) else float(value)))
        if re.fullmatch(r"-?\d+(\.\d+)?", token) and edge(value, token) < 0.05:
            values.append((f"{row}: {label}: close to a rounding edge, by this many units of the last place", edge(value, token)))
        if got == token:
            continue
        known = KNOWN.get((row, label))
        if known and known[:2] == (token, got):
            notes.append(f"known difference: {row}: {label}: table {token}, reproduced {got}. {known[2]}")
            used.add((row, label))
        elif known:
            errors.append(f"{row}: {label}: known difference changed: table {token}, now reproduced {got}, was {known[1]}")
            used.add((row, label))
        else:
            errors.append(f"{row}: {label}: table {token}, reproduced {got}")


used = set()


def run():
    test_separation()
    rows, limits = table()
    keys = set()
    for cells in rows:
        match = [entry for entry in ROWS if cells[0].startswith(entry[0])]
        if not match:
            errors.append(f"table row not checked: {cells[0]}")
            continue
        key, pattern, labels, function = match[0]
        keys.add(key)
        found = re.search(pattern, " || ".join(cells[:2]))
        if not found:
            errors.append(f"{cells[0]}: the table's wording no longer matches the check")
            continue
        compare(cells[0], labels, found.groups(), function())
    for key, *_ in ROWS:
        check(key in keys, f"check without a table row: {key}")
    for name, pattern, labels, function in LIMITS:
        found = re.search(pattern, limits)
        if not found:
            errors.append(f"limit {name}: the table's wording no longer matches the check")
            continue
        compare(f"limit: {name}", labels, found.groups(), function())
    for row, label in KNOWN.keys() - used:
        errors.append(f"{row}: {label}: listed as a known difference, but the table now agrees")
    return len(rows), len(LIMITS)


sys.stdout.reconfigure(encoding="utf-8")
with warnings.catch_warnings(record=True) as caught:
    warnings.simplefilter("always")
    done = run()
errors.extend(f"warning: {w.category.__name__}: {w.message}" for w in caught)
if "--values" in sys.argv:
    for name, value in values:
        print(f"{name}: {value!r}")
print("\n".join(notes))
print("\n".join(errors) or f"OK: {done[0]} rows and {done[1]} limits reproduced, {len(KNOWN)} known differences")
sys.exit(bool(errors))
