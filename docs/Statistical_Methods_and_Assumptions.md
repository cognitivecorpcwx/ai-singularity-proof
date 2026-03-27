# Statistical Methods and Assumptions

**Version:** 1.0
**Date:** March 27, 2026
**Authors:** James Waddell, Cognitive Corp
**Purpose:** Provide a single reference for the statistical methodology, design choices, assumptions, and known limitations underlying the singularity evidence package. Written for peer reviewers.

---

## 1. Data Collection

### 1.1 Benchmark Selection Criteria

Seven benchmark domains were selected to cover distinct facets of AI capability and economics:

| Domain | Benchmark | Why Selected | Sample Size |
|--------|-----------|-------------|-------------|
| Language understanding | MMLU / MMLU Pro | Broadest multi-task academic benchmark; longest time series | 10 |
| Graduate-level reasoning | GPQA Diamond | PhD-level science questions; strong ceiling effect test | 8 |
| Software engineering | SWE-bench | Real-world code task resolution; measures agentic capability | 8 |
| Code generation | HumanEval | Canonical programming benchmark; near saturation | 8 |
| Abstract reasoning | ARC-AGI-2 | Explicitly designed to resist memorization; active benchmark | 6 |
| Cost efficiency | $/M tokens (GPT-3.5 equivalent) | Economic accessibility; inverted for analysis | 8 |
| Training compute | log₁₀ FLOP | Infrastructure scaling trajectory | 9 |

Total: 65 data points across 7 domains.

### 1.2 Inclusion Rules

Each data point represents the highest published score for any model on the given benchmark at that point in time, sourced from the primary disclosure (model card, leaderboard, or peer-reviewed paper) where available. Dates are encoded as decimal years (e.g., 2024.25 = April 2024).

Selection criteria for benchmarks:
- Must have at least 6 data points spanning at least 18 months
- Must be publicly reported with traceable primary sources
- Must measure a distinct capability dimension (no overlapping benchmarks for the same task)
- Must be widely used in the AI research community (not custom or one-off evaluations)

### 1.3 Exclusion Rules

The following were deliberately excluded:
- **Proprietary benchmarks** (internal company evals not publicly verifiable)
- **Benchmarks with fewer than 6 data points** (insufficient for curve fitting)
- **Redundant benchmarks** (e.g., MMLU and HellaSwag measure overlapping capabilities; MMLU was retained as more widely cited)
- **Composite indices** (e.g., Stanford HAI's overall "AI Progress" score) — we analyze primitives, not aggregates

### 1.4 Known Data Quality Issues

These are documented in full in `data/DATA_PROVENANCE.md`:

- **MMLU / MMLU Pro mixing:** The MMLU series transitions from original MMLU to MMLU Pro around 2025. These are different benchmarks with different difficulty levels. This weakens trend claims for this domain.
- **SWE-bench / SWE-bench Verified mixing:** Early entries use original SWE-bench; later entries use SWE-bench Verified (a curated subset). The transition inflates apparent improvement.
- **Cost efficiency proxy:** "GPT-3.5 equivalent $/M tokens" is a constructed metric tracking the cheapest API offering at roughly GPT-3.5-level quality. The quality threshold is subjective.
- **Training compute estimates:** Exact FLOP counts for recent frontier models are proprietary. Values from Epoch AI are estimates.
- **Secondary sources:** Three claims in the narrative papers still rely on secondary reportage (see `data/DATA_PROVENANCE.md`, "Sources Not Yet Upgraded to Primary").

---

## 2. Curve Fitting

### 2.1 Models Evaluated

Four growth models are fitted to each benchmark time series using nonlinear least squares (`scipy.optimize.curve_fit`, Levenberg-Marquardt algorithm):

| Model | Functional Form | Parameters | Interpretation |
|-------|----------------|------------|----------------|
| Linear | y = at + b | 2 | Constant rate of improvement |
| Logarithmic | y = a·ln(t − t_min + 1) + b | 2 | Diminishing returns |
| Exponential | y = a·e^(b(t − t_min)) + c | 3 | Accelerating growth |
| Logistic (S-curve) | y = L / (1 + e^(−k(t − t₀))) + b | 4 | Rapid transition approaching a ceiling |

### 2.2 Model Selection

Best-fit model is selected by minimizing the Akaike Information Criterion (AIC):

AIC = n·ln(RSS/n) + 2k

where n = number of data points, k = number of parameters, and RSS = residual sum of squares. The Bayesian Information Criterion (BIC) is also computed for comparison:

BIC = n·ln(RSS/n) + k·ln(n)

AIC was chosen as the primary criterion because it penalizes complexity less aggressively than BIC, which is appropriate for small samples where overfitting risk is lower than underfitting risk. However, BIC results are reported alongside AIC for transparency.

### 2.3 Assumptions and Limitations

**Small sample sizes.** With 6-10 points per domain, information criteria are operating at their reliability limits. AIC can exhibit instability when n/k < 10 (some domains approach n/k ≈ 2 for the logistic model). This is mitigated by the sensitivity analysis (see Section 5), which tests whether model selection changes under perturbation.

**Non-independent observations.** Data points within a domain are not independent — later models build on earlier architectures, training data, and techniques. Standard curve fitting assumes independent errors. This violation is not correctable with n < 10 but is acknowledged as a systematic limitation.

**Irregular spacing.** Observations are not evenly spaced in time. Models that struggle more on one-off benchmark releases are more heavily penalized for those irregularities, but the Levenberg-Marquardt optimizer handles this naturally.

**Bounded outcomes.** Benchmarks scored as percentages are bounded at 0% and 100%. Logistic models respect this ceiling; linear and exponential models do not. For domains approaching saturation (HumanEval at 96.3%), linear/exponential fits produce implausible extrapolations, which is correctly captured by AIC favoring the logistic.

**Initial parameter sensitivity.** Nonlinear fitting depends on initial parameter guesses. For exponential fits, p0 = [1, 0.5, y_min]. For logistic fits, p0 = [1.1·y_max, 2, t_mean, y_min]. Alternative initializations were not systematically explored; this is tested in the sensitivity analysis.

---

## 3. Hypothesis Testing

### 3.1 Acceleration Test (Original Analysis)

The original analysis (`code/singularity_proof.py`) tests for acceleration by computing second derivatives of the best-fit curves:

1. Compute first derivative (velocity) of the fitted model at each observation time
2. Compute second derivative (acceleration) at each observation time
3. Test H₀: mean second derivative ≤ 0 (no acceleration) vs. H₁: mean second derivative > 0 (acceleration)
4. One-sided t-test on the second derivatives

**Known weakness:** Second-derivative t-tests assume the derivatives are approximately i.i.d. Gaussian, which they are not for fitted curves on tiny samples. This motivated the independent reanalysis.

### 3.2 Kendall's Tau Reanalysis (Independent)

The adversarial review and its reproduction (`code/kendall_tau_reanalysis.py`) use a rank-based alternative:

1. Compute local improvement rates: rate_i = (score_{i+1} − score_i) / (time_{i+1} − time_i)
2. Compute midpoint times for each rate interval
3. Test for monotonic trend in rates using Kendall's rank correlation (tau)
4. One-sided test: p_decel = p_two_sided / 2 if tau < 0 (deceleration), else 1 − p_two_sided / 2

This approach is better suited to small, irregularly spaced series because:
- No distributional assumptions (rank-based)
- Handles ties gracefully
- Does not require curve fitting

### 3.3 Fisher's Combined Probability Test

Per-domain p-values are combined across capability benchmarks using Fisher's method:

χ² = −2 Σ ln(p_i)

Under H₀, this follows a χ² distribution with 2k degrees of freedom (k = number of domains combined). Applied separately to capability domains (MMLU, GPQA, SWE-bench, HumanEval, ARC-AGI-2) and to all domains.

**Assumption:** Independence of p-values across domains. This is approximately satisfied because the benchmarks measure different capabilities, but partial dependence exists (models that improve on one benchmark often improve on others due to shared architecture innovations). This means the combined p-value may overstate significance.

### 3.4 P-Value Discrepancy

The adversarial reviewer's Kendall's tau analysis and our scipy-based reproduction produce different per-domain p-values from the same data:

| Domain | Reviewer's p | Reproduction p |
|--------|-------------|---------------|
| GPQA | 0.015 | 0.191 |
| SWE-bench | 0.035 | 0.281 |
| Combined | 0.006 | 0.001 |

The discrepancy likely arises from differences in rate computation (pairwise vs. sliding window) or tied-rank handling. Both analyses reach the same qualitative conclusion: statistically significant deceleration within capability benchmarks. The dual values are reported in the README and the reproduction note in `docs/Independent_Adversarial_Review.md`.

---

## 4. Phase Transition Analysis

### 4.1 Logistic S-Curve Interpretation

The core intellectual claim is that logistic (S-curve) best fits are themselves evidence of a phase transition. The argument:

1. A logistic curve's inflection point marks maximum rate of change
2. If most domains have passed their inflection points, the transition is more than half complete
3. The steepness parameter (k) relative to the time span gives the transition speed
4. Comparing this speed to historical technology transitions (electrification, internet, smartphones) contextualizes the claim

**This is an interpretive framework, not a statistical test.** The logistic fits are statistical; the claim that "logistic = phase transition" is a theoretical argument. It is falsifiable: if future data points consistently undershoot the logistic projection, the S-curve was a poor model and the phase transition interpretation fails.

### 4.2 Historical Comparison Methodology

The historical comparison normalizes different technology transitions to a common scale:

- X-axis: years from first observation
- Y-axis: percentage of capability range (0% = starting level, 100% = ceiling)

For AI, the "capability range" is the 0-100% benchmark score range. For historical technologies, it is the deployment metric (% of households electrified, % internet penetration, % smartphone adoption).

**Critical limitation (accepted from Adversarial Review #2):** This is an apples-to-oranges comparison. AI benchmarks measure software performance on standardized tests; historical metrics measure physical infrastructure deployment to billions of people. The visual compression of AI's curve partly reflects the bounded-score artifact (benchmark scores are capped at 100%), not necessarily faster underlying progress. These caveats are documented in the evidence package and expanded in `docs/Adversarial_Review_2_S_Curve_Fallacy.md`.

---

## 5. Sensitivity Analysis

A full sensitivity analysis is provided in `code/sensitivity_analysis.py` and documented in `docs/Sensitivity_Analysis.md`. Summary:

### 5.1 Leave-One-Out Curve Fitting

For each domain, every data point is systematically dropped and the full model selection re-run. The test asks: does the best-fit model change? Does the AIC ranking change? Results are reported as the fraction of leave-one-out trials that agree with the full-sample model selection.

### 5.2 Leave-One-Out Kendall's Tau

Already implemented in `code/kendall_tau_reanalysis.py`. For each domain, each data point is dropped and the Kendall's tau test re-run. The stability range of tau and p-values is reported.

### 5.3 Gaussian Jitter Simulation

Already implemented in `code/kendall_tau_reanalysis.py`. Gaussian noise (σ = 1 percentage point) is added to all scores, and the full Kendall's tau analysis is re-run 1,000 times. The fraction of simulations that maintain p < 0.05 is reported.

### 5.4 Alternative Initialization

For nonlinear fits (exponential and logistic), 10 random perturbations of the initial parameter vector are tested. The fraction of initializations that converge to the same best-fit model is reported.

---

## 6. Pre-Registration and Post-Hoc Limitations

### 6.1 Prediction Registry

The evidence package includes 20 timestamped, falsifiable predictions frozen as of March 26, 2026. These predictions were written **after** analyzing the existing data. This is acknowledged as a limitation: the predictions are post-hoc, not pre-registered.

In a pre-registered study, predictions would be filed before data collection. Here, the predictions serve a different function — they define the conditions under which the thesis would be **falsified** going forward. If fewer than 10 of 20 predictions are confirmed by their target dates, the thesis is scored as falsified by its own criteria.

### 6.2 Researcher Degrees of Freedom

The following choices were made by the authors and could affect conclusions:
- Benchmark selection (why these 7 and not others)
- Date encoding (decimal years vs. quarters vs. months)
- Score type (best model vs. median model vs. frontier-only)
- Model zoo (why these 4 growth models and not Gompertz, Richards, etc.)
- AIC vs. BIC as primary criterion
- Fisher's method vs. Stouffer's method for combining p-values

Each of these is a degree of freedom. The sensitivity analysis (Section 5) tests some but not all of these. Reviewers are encouraged to test alternatives using the provided code and data.

---

## 7. Software and Reproducibility

| Component | Version | Purpose |
|-----------|---------|---------|
| Python | 3.11 | Analysis scripts |
| NumPy | ≥ 1.24.0 | Numerical computation |
| SciPy | ≥ 1.11.0 | Curve fitting, Kendall's tau, Fisher's test |
| Matplotlib | ≥ 3.7.0 | Figure generation |
| Node.js | 20 | Singularity tracker dashboard |
| TypeScript | 5.x | Dashboard type safety |
| Next.js | 14 | Dashboard framework |

All analysis code is in the `code/` directory. All data is in the `data/` directory. The `data/singularity.json` file is the single source of truth for benchmark data used by both the Python analysis and the TypeScript dashboard.

```bash
# Reproduce all statistical analyses
pip install -r requirements.txt
python code/singularity_proof.py          # Curve fitting + hypothesis tests
python code/kendall_tau_reanalysis.py     # Kendall's tau reanalysis
python code/historical_comparison.py      # Historical comparison chart
python code/sensitivity_analysis.py       # Sensitivity analysis (new)
```

---

## 8. Contact and Contribution

Reviewers who identify methodological issues are encouraged to submit them as issues or pull requests per `CONTRIBUTING.md`. Reviews that demonstrate genuine weaknesses will be incorporated, as Adversarial Reviews #1 and #2 were.

James Waddell | Cognitive Corp | bob@cognitivewx.info
