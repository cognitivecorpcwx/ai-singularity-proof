# Changelog

All notable changes to this evidence package are documented here.

## [2.1] — 2026-03-27

### Added
- **Statistical Methods and Assumptions** (`docs/Statistical_Methods_and_Assumptions.md`) — Complete methodology reference for peer reviewers: data collection criteria, inclusion/exclusion rules, curve fitting assumptions, hypothesis testing approaches, phase transition interpretation, pre-registration limitations, researcher degrees of freedom
- **Sensitivity Analysis** (`docs/Sensitivity_Analysis.md`, `code/sensitivity_analysis.py`) — Leave-one-out model selection stability, alternative initialization testing, and prediction error analysis. Finding: 5/7 domains stable, HumanEval and ARC-AGI-2 unstable. Revised confidence levels per domain.
- Sensitivity analysis added to GitHub Actions CI pipeline

### Changed
- README updated with methodology/sensitivity section, revised statistics table
- "5/7 logistic" claim contextualized with stability findings

## [2.0] — 2026-03-27

### Changed
- **Domain 6 downgraded** from "MET" to "MIXED" after Adversarial Review #1 demonstrated statistically significant benchmark deceleration (Kendall's tau combined p = 0.0057)
- **Thesis reframed** from "7/7 proven" to "6/7 met, 1 mixed; AI has entered a rapid phase transition"
- **Convergent conclusion rewritten** to explicitly weight transition speed over acceleration
- **Counterargument #2** updated to concede the deceleration finding
- **Historical comparison caveats expanded** with critical apples-to-oranges acknowledgment (benchmark scores vs. physical infrastructure deployment)
- **Closing section rewritten** to acknowledge what the evidence does and does not support

### Added
- Adversarial Review #1: Independent statistical reanalysis using Kendall's tau (`docs/Independent_Adversarial_Review.md`)
- Adversarial Review #2: S-curve fallacy and historical comparison critique (`docs/Adversarial_Review_2_S_Curve_Fallacy.md`)
- Built Environment Lifecycle Impact Analysis: 14 stakeholders × 7 lifecycle phases (`docs/Built_Environment_Impact_Analysis.md`)
- Singularity Tracker: Next.js live falsification dashboard (root-level `app/`, `lib/`, `components/`)
- Expanded tracker with history, impact, and adversarial panel pages (root-level app)
- Kendall's tau reproduction code (`code/kendall_tau_reanalysis.py`)
- Data provenance log (`data/DATA_PROVENANCE.md`)
- LICENSE (CC BY 4.0 for content, MIT for code)
- CITATION.cff for academic citation
- CONTRIBUTING.md with peer review ground rules
- requirements.txt for Python dependencies
- This CHANGELOG

### Removed
- "7/7" scorecard column (replaced with per-domain status indicators)
- Unbounded acceleration claims from Domain 6 verdict

## [1.0] — 2026-03-26

### Added
- Initial release: narrative paper, quantitative proof, evidence package
- 5 figures: benchmark trajectories, acceleration analysis, normalized convergence, statistical summary, historical comparison
- Python analysis code: curve fitting, hypothesis testing, chart generation
- Evidence and Benchmarks CSV (Table 1)
- GTPR peer review findings
- PDF export of narrative paper
