# Contributing to the Singularity Evidence Package

This project is designed to be challenged, not just read. Contributions that strengthen or weaken the thesis are equally welcome.

## Ways to Contribute

### Submit New Benchmark Data

The most valuable contribution is fresh data. If a new benchmark result has been published:

1. Open an issue with the domain (MMLU, GPQA, SWE-bench, HumanEval, ARC-AGI-2, Cost Efficiency, Training Compute), the score, the model name, the date, and a link to the primary source.
2. Or submit a PR editing `data/singularity.json` directly. Add the data point to the correct domain's `dataPoints` array, sorted by `time` (decimal year). Include the `source` field with a URL to the primary disclosure (model card, leaderboard, or paper), not secondary reportage.

### Challenge the Statistical Analysis

The adversarial reviews demonstrate the standard. If you can show that a specific claim is unsupported by the data:

1. Fork the repo and run the analysis code (`code/singularity_proof.py`, `code/kendall_tau_reanalysis.py`).
2. Document your methodology, results, and robustness checks.
3. Submit a PR adding your review to `docs/` with a descriptive filename.

Reviews that identify genuine weaknesses will be incorporated into the thesis, as Reviews #1 and #2 were.

### Improve Data Provenance

Every data point in `singularity.json` should trace to a primary source. If you find a data point sourced from secondary reportage where a primary source exists, submit a PR updating the `source` field.

### Report Errors

If a specific claim, number, or citation is wrong, open an issue. Include the specific text, the correct information, and the primary source.

## What We Won't Merge

We will not merge PRs that remove adversarial reviews, weaken caveats or limitations, add data without primary source attribution, or modify the prediction registry (frozen as of March 26, 2026).

## Code Contributions

For the singularity-tracker (Next.js dashboard), standard practices apply. Run `npm install` and `npm run dev` to test locally. TypeScript strict mode is enforced.

For the Python analysis code, include `requirements.txt`-compatible dependencies only (numpy, scipy, matplotlib). All statistical claims must be reproducible from the committed data.

## Citation

If you use this research in your own work, please cite using the CITATION.cff file or:

> Waddell, J. (2026). "The Singularity Is Here: An Evidence-Based Argument." Cognitive Corp. https://github.com/cognitivecorpcwx/ai-singularity-proof
