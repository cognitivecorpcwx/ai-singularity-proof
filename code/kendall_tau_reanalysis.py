"""
Independent Reanalysis: Kendall's Tau Acceleration Test
========================================================
Reproduces the methodology from Adversarial Review #1.
Note: Our scipy-based reproduction yields different per-domain p-values than
the reviewer's original analysis (likely due to differences in rate computation
or tied-rank handling), but the combined conclusion is the same: statistically
significant deceleration within capability benchmarks.

Instead of second-derivative t-tests (which assume i.i.d. Gaussian residuals),
this script computes local improvement rates between adjacent observations and
tests whether those rates trend upward or downward using Kendall's rank
correlation. This is better suited to tiny, irregularly spaced series.

Robustness checks:
  - Leave-one-point-out: re-run with each data point dropped
  - Gaussian jitter: add ±1 percentage-point noise, 1000 simulations
  - Fisher's combined test across domains

Usage:
  pip install -r requirements.txt
  python code/kendall_tau_reanalysis.py

Output:
  - Per-domain Kendall's tau, p-values, and direction
  - Combined Fisher's test for deceleration
  - Leave-one-point-out stability range
  - Jitter simulation: fraction of runs with p < 0.05
  - Saves results to data/kendall_tau_results.json
"""

import json
import os
import numpy as np
from scipy.stats import kendalltau
from scipy.stats import chi2 as chi2_dist

# ---------------------------------------------------------------------------
# Load data
# ---------------------------------------------------------------------------
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(SCRIPT_DIR, "..", "data", "singularity.json")
OUT_PATH = os.path.join(SCRIPT_DIR, "..", "data", "kendall_tau_results.json")

with open(DATA_PATH) as f:
    raw = json.load(f)

# Capability domains only (exclude cost and compute which have different dynamics)
CAPABILITY_DOMAINS = ["mmlu", "gpqa", "swebench", "humaneval", "arcagi2"]
ALL_DOMAINS = CAPABILITY_DOMAINS + ["cost", "compute"]


def local_improvement_rates(times, scores):
    """Compute improvement rate between each pair of adjacent observations."""
    rates = []
    for i in range(1, len(times)):
        dt = times[i] - times[i - 1]
        if dt > 0:
            rates.append((scores[i] - scores[i - 1]) / dt)
    return rates


def kendall_acceleration_test(times, scores):
    """
    Test whether local improvement rates trend upward (acceleration)
    or downward (deceleration) over time using Kendall's tau.

    Returns one-sided p-value for deceleration (H1: rates decreasing).
    """
    rates = local_improvement_rates(times, scores)
    if len(rates) < 3:
        return {"tau": 0, "p_two_sided": 1.0, "p_decel": 1.0, "n_rates": len(rates)}

    # Time midpoints for each rate interval
    midpoints = [(times[i] + times[i + 1]) / 2 for i in range(len(rates))]

    tau, p_two = kendalltau(midpoints, rates)

    # One-sided p-value for deceleration (negative trend)
    if tau < 0:
        p_decel = p_two / 2  # Trend is negative → deceleration signal
    else:
        p_decel = 1 - p_two / 2  # Trend is positive → no deceleration

    return {
        "tau": float(tau),
        "p_two_sided": float(p_two),
        "p_decel": float(p_decel),
        "n_rates": len(rates),
        "direction": "decelerating" if tau < 0 else "accelerating",
    }


def fisher_combined(p_values):
    """Fisher's method: combine independent p-values."""
    p_clamped = [max(p, 1e-10) for p in p_values]
    chi2_stat = -2 * sum(np.log(p) for p in p_clamped)
    df = 2 * len(p_values)
    p_combined = 1 - chi2_dist.cdf(chi2_stat, df)
    return {
        "chi2": float(chi2_stat),
        "df": df,
        "p_value": float(p_combined),
        "significant_005": bool(p_combined < 0.05),
    }


def leave_one_out(domain_data, domain_ids):
    """Leave-one-point-out robustness check on combined Fisher p-value."""
    p_range = []

    for target_id in domain_ids:
        domain = domain_data[target_id]
        times = [d["time"] for d in domain["dataPoints"]]
        scores = [d["score"] for d in domain["dataPoints"]]

        for drop_idx in range(len(times)):
            # Drop one point from target domain
            t_drop = times[:drop_idx] + times[drop_idx + 1 :]
            s_drop = scores[:drop_idx] + scores[drop_idx + 1 :]

            if len(t_drop) < 3:
                continue

            # Recompute this domain's p-value
            result = kendall_acceleration_test(t_drop, s_drop)

            # Collect all domain p-values with the modified one
            all_p = []
            for did in domain_ids:
                if did == target_id:
                    all_p.append(result["p_decel"])
                else:
                    d = domain_data[did]
                    t = [dp["time"] for dp in d["dataPoints"]]
                    s = [dp["score"] for dp in d["dataPoints"]]
                    r = kendall_acceleration_test(t, s)
                    all_p.append(r["p_decel"])

            combined = fisher_combined(all_p)
            p_range.append(combined["p_value"])

    return {"min_p": float(min(p_range)), "max_p": float(max(p_range)), "n_tests": len(p_range)}


def jitter_simulation(domain_data, domain_ids, n_sims=1000, jitter_sd=1.0, seed=42):
    """Add Gaussian noise to scores and check stability of combined result."""
    rng = np.random.RandomState(seed)
    sig_count = 0

    for _ in range(n_sims):
        all_p = []
        for did in domain_ids:
            d = domain_data[did]
            times = [dp["time"] for dp in d["dataPoints"]]
            scores = [dp["score"] + rng.normal(0, jitter_sd) for dp in d["dataPoints"]]
            result = kendall_acceleration_test(times, scores)
            all_p.append(result["p_decel"])
        combined = fisher_combined(all_p)
        if combined["p_value"] < 0.05:
            sig_count += 1

    return {
        "n_simulations": n_sims,
        "jitter_sd": jitter_sd,
        "fraction_significant": sig_count / n_sims,
    }


# ---------------------------------------------------------------------------
# Run analysis
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    domains = raw["domains"]
    results = {"per_domain": {}, "combined": {}, "robustness": {}}

    print("=" * 70)
    print("KENDALL'S TAU REANALYSIS — ACCELERATION/DECELERATION TEST")
    print("=" * 70)
    print()

    # Per-domain tests
    for did in ALL_DOMAINS:
        d = domains[did]
        times = [dp["time"] for dp in d["dataPoints"]]
        scores = [dp["score"] for dp in d["dataPoints"]]

        # For cost domain, invert (lower is better → higher rate = improvement)
        if d.get("direction") == "lower_is_better":
            scores = [-s for s in scores]

        result = kendall_acceleration_test(times, scores)
        results["per_domain"][did] = result

        sig = "***" if result["p_decel"] < 0.01 else "**" if result["p_decel"] < 0.05 else "*" if result["p_decel"] < 0.10 else ""
        print(f"  {d['shortName']:25s}  tau={result['tau']:+.3f}  p(decel)={result['p_decel']:.4f}  {result['direction']:15s}  {sig}")

    print()

    # Combined test — capability domains only
    cap_p = [results["per_domain"][d]["p_decel"] for d in CAPABILITY_DOMAINS]
    combined_cap = fisher_combined(cap_p)
    results["combined"]["capability_domains"] = combined_cap
    print(f"  Fisher combined (capability only):  chi2={combined_cap['chi2']:.2f}  df={combined_cap['df']}  p={combined_cap['p_value']:.4f}  {'SIGNIFICANT' if combined_cap['significant_005'] else 'not significant'}")

    # Combined test — all domains
    all_p = [results["per_domain"][d]["p_decel"] for d in ALL_DOMAINS]
    combined_all = fisher_combined(all_p)
    results["combined"]["all_domains"] = combined_all
    print(f"  Fisher combined (all domains):      chi2={combined_all['chi2']:.2f}  df={combined_all['df']}  p={combined_all['p_value']:.4f}  {'SIGNIFICANT' if combined_all['significant_005'] else 'not significant'}")

    print()

    # Leave-one-out
    print("  Running leave-one-point-out robustness check...")
    loo = leave_one_out(domains, CAPABILITY_DOMAINS)
    results["robustness"]["leave_one_out"] = loo
    print(f"  Combined p-value range: [{loo['min_p']:.4f}, {loo['max_p']:.4f}] across {loo['n_tests']} tests")

    # Jitter simulation
    print("  Running jitter simulation (1000 iterations, ±1pp noise)...")
    jitter = jitter_simulation(domains, CAPABILITY_DOMAINS)
    results["robustness"]["jitter"] = jitter
    print(f"  Fraction significant at p<0.05: {jitter['fraction_significant']:.1%}")

    print()
    print("=" * 70)
    print("CONCLUSION")
    print("=" * 70)
    if combined_cap["significant_005"]:
        print("  Combined evidence FAVORS DECELERATION within capability benchmarks.")
        print("  This is consistent with S-curve saturation, not acceleration.")
    else:
        print("  Combined evidence does NOT reach significance for deceleration.")
    print()

    # Save
    with open(OUT_PATH, "w") as f:
        json.dump(results, f, indent=2)
    print(f"  Results saved to: {OUT_PATH}")
