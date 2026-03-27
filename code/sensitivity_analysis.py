"""
Sensitivity Analysis for Singularity Evidence Package
======================================================
Tests robustness of curve fitting and model selection under perturbation:

1. Leave-one-out curve fitting: drop each point, re-run model selection
2. Alternative initialization: perturb starting parameters for nonlinear fits
3. Cross-validation: hold out each point, measure prediction error
4. Summary: stability scores per domain

Usage:
  pip install -r requirements.txt
  python code/sensitivity_analysis.py

Output:
  - Console report of all sensitivity checks
  - data/sensitivity_results.json

James Waddell | Cognitive Corp | March 2026
"""

import json
import os
import sys
import numpy as np
from scipy.optimize import curve_fit
import warnings
warnings.filterwarnings('ignore')

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(SCRIPT_DIR, "..", "data", "singularity.json")
OUT_PATH = os.path.join(SCRIPT_DIR, "..", "data", "sensitivity_results.json")

with open(DATA_PATH) as f:
    raw = json.load(f)

# ---------------------------------------------------------------------------
# Models (same as singularity_proof.py)
# ---------------------------------------------------------------------------
def linear(t, a, b):
    return a * t + b

def logarithmic(t, a, b):
    return a * np.log(t - t.min() + 1) + b

def exponential(t, a, b, c):
    return a * np.exp(b * (t - t.min())) + c

def logistic(t, L, k, t0, b):
    return L / (1 + np.exp(-k * (t - t0))) + b

MODELS = {
    "Linear": (linear, 2),
    "Logarithmic": (logarithmic, 2),
    "Exponential": (exponential, 3),
    "Logistic": (logistic, 4),
}

def compute_aic(n, k, rss):
    if rss <= 0 or n <= k + 1:
        return np.inf
    return n * np.log(rss / n) + 2 * k

def fit_all_models(t, y):
    """Fit all models, return dict of {model_name: (aic, rss, popt)}"""
    results = {}
    n = len(t)
    for mname, (func, nparams) in MODELS.items():
        try:
            if mname == "Exponential":
                popt, _ = curve_fit(func, t, y, p0=[1, 0.5, y.min()], maxfev=10000)
            elif mname == "Logistic":
                popt, _ = curve_fit(func, t, y, p0=[y.max()*1.1, 2, t.mean(), y.min()], maxfev=10000)
            else:
                popt, _ = curve_fit(func, t, y, maxfev=10000)
            yhat = func(t, *popt)
            rss = np.sum((y - yhat) ** 2)
            aic = compute_aic(n, nparams, rss)
            results[mname] = (aic, rss, popt)
        except Exception:
            results[mname] = (np.inf, np.inf, None)
    return results

def best_model(t, y):
    """Return name of best model by AIC."""
    results = fit_all_models(t, y)
    return min(results, key=lambda m: results[m][0])

# ---------------------------------------------------------------------------
# Extract domain data from singularity.json
# ---------------------------------------------------------------------------
DOMAIN_MAP = {}
for domain_key, domain_data in raw["domains"].items():
    points = domain_data.get("dataPoints", [])
    if len(points) < 5:
        continue
    times = np.array([p["time"] for p in points])
    scores = np.array([p["score"] for p in points])
    label = domain_data.get("name", domain_key)
    DOMAIN_MAP[domain_key] = {"label": label, "times": times, "scores": scores}

# ---------------------------------------------------------------------------
# Test 1: Leave-One-Out Model Selection Stability
# ---------------------------------------------------------------------------
def loo_model_selection(times, scores):
    """Drop each point, re-run model selection. Return stability metrics."""
    n = len(times)
    full_best = best_model(times, scores)
    agreements = 0
    loo_models = []

    for i in range(n):
        t_loo = np.delete(times, i)
        y_loo = np.delete(scores, i)
        if len(t_loo) < 4:  # need at least 4 for logistic
            loo_models.append(full_best)
            agreements += 1
            continue
        try:
            loo_best = best_model(t_loo, y_loo)
        except Exception:
            loo_best = "FAILED"
        loo_models.append(loo_best)
        if loo_best == full_best:
            agreements += 1

    return {
        "full_sample_best": full_best,
        "stability": agreements / n,
        "loo_models": loo_models,
        "n": n
    }

# ---------------------------------------------------------------------------
# Test 2: Alternative Initialization (nonlinear models only)
# ---------------------------------------------------------------------------
def alt_init_stability(times, scores, n_trials=10):
    """Perturb initial params for exponential and logistic, check convergence."""
    rng = np.random.default_rng(42)
    results = {}

    for mname in ["Exponential", "Logistic"]:
        func, nparams = MODELS[mname]
        if mname == "Exponential":
            base_p0 = np.array([1.0, 0.5, scores.min()])
        else:
            base_p0 = np.array([scores.max() * 1.1, 2.0, times.mean(), scores.min()])

        converged_aics = []
        for trial in range(n_trials):
            perturbed = base_p0 * (1 + rng.normal(0, 0.3, size=len(base_p0)))
            try:
                popt, _ = curve_fit(func, times, scores, p0=perturbed, maxfev=10000)
                yhat = func(times, *popt)
                rss = np.sum((scores - yhat) ** 2)
                aic = compute_aic(len(times), nparams, rss)
                converged_aics.append(aic)
            except Exception:
                converged_aics.append(np.inf)

        finite_aics = [a for a in converged_aics if np.isfinite(a)]
        if len(finite_aics) > 1:
            aic_std = float(np.std(finite_aics))
            convergence_rate = len(finite_aics) / n_trials
        else:
            aic_std = float('inf')
            convergence_rate = len(finite_aics) / n_trials

        results[mname] = {
            "convergence_rate": convergence_rate,
            "aic_std": round(aic_std, 4),
            "n_trials": n_trials,
        }

    return results

# ---------------------------------------------------------------------------
# Test 3: Leave-One-Out Prediction Error
# ---------------------------------------------------------------------------
def loo_prediction_error(times, scores):
    """For each held-out point, fit best model on remaining, predict held-out."""
    n = len(times)
    errors = []
    full_best_name = best_model(times, scores)

    for i in range(n):
        t_train = np.delete(times, i)
        y_train = np.delete(scores, i)
        t_test = times[i:i+1]
        y_test = scores[i]

        if len(t_train) < 4:
            continue

        try:
            bm = best_model(t_train, y_train)
            func, nparams = MODELS[bm]
            if bm == "Exponential":
                popt, _ = curve_fit(func, t_train, y_train, p0=[1, 0.5, y_train.min()], maxfev=10000)
            elif bm == "Logistic":
                popt, _ = curve_fit(func, t_train, y_train, p0=[y_train.max()*1.1, 2, t_train.mean(), y_train.min()], maxfev=10000)
            else:
                popt, _ = curve_fit(func, t_train, y_train, maxfev=10000)
            y_pred = func(t_test, *popt)[0]
            errors.append(float(abs(y_pred - y_test)))
        except Exception:
            errors.append(float('nan'))

    finite_errors = [e for e in errors if np.isfinite(e)]
    return {
        "mean_absolute_error": round(float(np.mean(finite_errors)), 3) if finite_errors else None,
        "max_absolute_error": round(float(np.max(finite_errors)), 3) if finite_errors else None,
        "median_absolute_error": round(float(np.median(finite_errors)), 3) if finite_errors else None,
        "n_valid": len(finite_errors),
    }

# ---------------------------------------------------------------------------
# Run all tests
# ---------------------------------------------------------------------------
def main():
    all_results = {}

    print("=" * 70)
    print("SENSITIVITY ANALYSIS — SINGULARITY EVIDENCE PACKAGE")
    print("=" * 70)

    for dkey, ddata in DOMAIN_MAP.items():
        label = ddata["label"]
        times = ddata["times"]
        scores = ddata["scores"]

        print(f"\n{'─' * 60}")
        print(f"  {label} (n={len(times)})")
        print(f"{'─' * 60}")

        # Test 1: LOO model selection
        loo = loo_model_selection(times, scores)
        print(f"  Full-sample best model: {loo['full_sample_best']}")
        print(f"  LOO stability: {loo['stability']:.0%} ({int(loo['stability']*loo['n'])}/{loo['n']} agree)")
        if loo['stability'] < 1.0:
            alt_models = [m for m in loo['loo_models'] if m != loo['full_sample_best']]
            from collections import Counter
            alt_counts = Counter(alt_models)
            print(f"  Alternative models selected: {dict(alt_counts)}")

        # Test 2: Alt initialization
        alt = alt_init_stability(times, scores)
        for mname, mresult in alt.items():
            print(f"  {mname} init stability: {mresult['convergence_rate']:.0%} converge, AIC σ={mresult['aic_std']}")

        # Test 3: LOO prediction error
        pred = loo_prediction_error(times, scores)
        if pred["mean_absolute_error"] is not None:
            print(f"  LOO prediction error: mean={pred['mean_absolute_error']}, median={pred['median_absolute_error']}, max={pred['max_absolute_error']}")

        all_results[dkey] = {
            "label": label,
            "n": len(times),
            "loo_model_selection": {
                "full_sample_best": loo["full_sample_best"],
                "stability": loo["stability"],
                "loo_models": loo["loo_models"],
            },
            "alt_initialization": alt,
            "loo_prediction_error": pred,
        }

    # Summary
    print(f"\n{'=' * 70}")
    print("SUMMARY")
    print(f"{'=' * 70}")

    stable_count = 0
    total_count = 0
    for dkey, res in all_results.items():
        total_count += 1
        stab = res["loo_model_selection"]["stability"]
        bm = res["loo_model_selection"]["full_sample_best"]
        mae = res["loo_prediction_error"]["mean_absolute_error"]
        status = "STABLE" if stab >= 0.8 else "UNSTABLE"
        if stab >= 0.8:
            stable_count += 1
        print(f"  {res['label']:40s} {bm:12s} LOO={stab:.0%} {status:8s} MAE={mae}")

    print(f"\n  Model selection stable (≥80% LOO agreement): {stable_count}/{total_count} domains")
    print(f"\n  Interpretation:")
    if stable_count == total_count:
        print("  All domains show robust model selection under leave-one-out perturbation.")
    elif stable_count >= total_count - 1:
        print("  Model selection is robust for most domains. One domain shows sensitivity")
        print("  to individual data points — conclusions for that domain should be held loosely.")
    else:
        print("  Multiple domains show instability in model selection. Curve-fitting conclusions")
        print("  should be interpreted with caution.")

    print(f"\n{'=' * 70}")
    print("ANALYSIS COMPLETE")
    print(f"{'=' * 70}")

    # Save
    with open(OUT_PATH, "w") as f:
        json.dump(all_results, f, indent=2, default=str)
    print(f"\n  Results saved to: {OUT_PATH}")


if __name__ == "__main__":
    main()
