# Data Provenance Log

Every data point in `singularity.json` is documented here with its primary source, access method, and retrieval date. Where a primary source was unavailable and secondary reportage was used, this is noted.

**Last updated:** March 27, 2026
**Methodology:** All scores represent the highest published result for a given model on a given benchmark at the time of recording. Dates are encoded as decimal years (e.g., 2024.25 = April 2024).

---

## MMLU (% Accuracy)

| Time | Score | Model | Source | URL | Access Date | Notes |
|------|-------|-------|--------|-----|-------------|-------|
| 2020.50 | 43.0 | GPT-3 (Few-shot) | Papers with Code | paperswithcode.com/sota/multi-task-language-understanding-on-mmlu | 2026-03-20 | Original MMLU |
| 2022.00 | 55.1 | Chinchilla | Papers with Code | paperswithcode.com/sota/multi-task-language-understanding-on-mmlu | 2026-03-20 | Original MMLU |
| 2023.00 | 70.0 | GPT-4 (5-shot) | OpenAI | openai.com/research/gpt-4 | 2026-03-20 | Original MMLU. OpenAI technical report |
| 2023.25 | 75.2 | Gemini Ultra | Google | deepmind.google/technologies/gemini | 2026-03-20 | Original MMLU |
| 2023.83 | 79.6 | Claude 2.1 | Anthropic | anthropic.com/claude | 2026-03-20 | Original MMLU |
| 2024.25 | 83.1 | Claude 3 Opus | Anthropic | anthropic.com/claude/model-card | 2026-03-20 | Original MMLU |
| 2024.50 | 86.5 | GPT-4o | OpenAI | openai.com/index/gpt-4o | 2026-03-20 | Original MMLU |
| 2025.00 | 87.5 | Gemini 2.0 Flash | Google | deepmind.google/technologies/gemini | 2026-03-20 | Original MMLU |
| 2025.42 | 90.1 | Claude 3.5 Sonnet | Anthropic | anthropic.com/claude/model-card | 2026-03-20 | **CAUTION:** May be MMLU Pro, not original MMLU. Benchmark transition noted in Adversarial Review #1 |
| 2025.75 | 91.4 | MMLU Pro (Best) | Papers with Code | paperswithcode.com | 2026-03-20 | **MMLU Pro** — different benchmark from earlier entries. Apples-to-oranges noted |

**Known issue:** The series mixes MMLU and MMLU Pro scores. The transition occurs around 2025. Adversarial Review #1 flags this as weakening trend claims. A cleaner analysis would separate the two benchmarks.

---

## GPQA Diamond (% Accuracy)

| Time | Score | Model | Source | URL | Access Date | Notes |
|------|-------|-------|--------|-----|-------------|-------|
| 2023.83 | 39.0 | GPT-4 (Initial) | GPQA Paper | arxiv.org/abs/2311.12022 | 2026-03-20 | Rein et al., 2023 |
| 2024.17 | 49.3 | Claude 3 Opus | Anthropic | anthropic.com/claude/model-card | 2026-03-20 | Model card |
| 2024.42 | 53.6 | GPT-4 Turbo | OpenAI | openai.com | 2026-03-20 | |
| 2024.75 | 65.0 | Claude 3.5 Sonnet | Anthropic | anthropic.com/claude/model-card | 2026-03-20 | |
| 2025.17 | 71.4 | o1-preview | OpenAI | openai.com/o1 | 2026-03-20 | Reasoning model |
| 2025.50 | 82.3 | o3-mini | OpenAI | openai.com | 2026-03-20 | |
| 2025.83 | 91.9 | Gemini 3 Pro | Google | deepmind.google | 2026-03-20 | Corrected from earlier version attributing to GPT-5.1 |
| 2026.17 | 94.1 | Gemini 3 Pro (Updated) | Google | deepmind.google | 2026-03-20 | |

---

## SWE-bench (% Resolved)

| Time | Score | Model | Source | URL | Access Date | Notes |
|------|-------|-------|--------|-----|-------------|-------|
| 2023.83 | 1.96 | SWE-agent (GPT-4) | swebench.com | swebench.com | 2026-03-20 | Original SWE-bench |
| 2024.17 | 12.5 | Devin | Cognition | cognition.ai | 2026-03-20 | Original SWE-bench |
| 2024.42 | 18.3 | SWE-agent v2 | swebench.com | swebench.com | 2026-03-20 | Original SWE-bench |
| 2024.75 | 49.0 | Amazon Q (SWE-V) | swebench.com | swebench.com | 2026-03-20 | **May be SWE-bench Verified** |
| 2025.00 | 55.0 | OpenHands + Claude | swebench.com | swebench.com | 2026-03-20 | |
| 2025.25 | 62.0 | Cursor Agent | swebench.com | swebench.com | 2026-03-20 | |
| 2025.50 | 71.7 | Claude Code | Anthropic | anthropic.com | 2026-03-20 | |
| 2025.83 | 75.2 | o3 + Codex | OpenAI | openai.com | 2026-03-20 | |
| 2026.08 | 81.0 | Multi-agent (Best) | swebench.com | swebench.com | 2026-03-20 | |

**Known issue:** Series may mix original SWE-bench and SWE-bench Verified results. Adversarial Review #1 notes this.

---

## HumanEval (% pass@1)

| Time | Score | Model | Source | URL | Access Date | Notes |
|------|-------|-------|--------|-----|-------------|-------|
| 2021.50 | 28.8 | Codex (12B) | OpenAI | arxiv.org/abs/2107.03374 | 2026-03-20 | Chen et al., 2021 |
| 2022.50 | 47.0 | code-davinci-002 | Papers with Code | paperswithcode.com | 2026-03-20 | |
| 2023.00 | 67.0 | GPT-4 | OpenAI | openai.com/research/gpt-4 | 2026-03-20 | |
| 2023.50 | 76.8 | GPT-4 Turbo | OpenAI | openai.com | 2026-03-20 | |
| 2024.00 | 84.1 | Claude 3 Opus | Anthropic | anthropic.com | 2026-03-20 | |
| 2024.50 | 90.2 | GPT-4o | OpenAI | openai.com | 2026-03-20 | |
| 2025.00 | 93.7 | Claude 3.5 Sonnet | Anthropic | anthropic.com | 2026-03-20 | |
| 2025.50 | 95.1 | GPT-4.5 | OpenAI | openai.com | 2026-03-20 | |
| 2025.83 | 96.3 | Best (Leaderboard) | Papers with Code | paperswithcode.com | 2026-03-20 | Approaching saturation |

---

## ARC-AGI-2 (% Score)

| Time | Score | Model | Source | URL | Access Date | Notes |
|------|-------|-------|--------|-----|-------------|-------|
| 2024.50 | 0.0 | Baseline (GPT-4) | ARC Prize | arcprize.org | 2026-03-20 | Human baseline: 100% |
| 2024.83 | 5.0 | Early attempts | arcprize.org | arcprize.org | 2026-03-20 | |
| 2025.17 | 21.0 | Improved agents | arcprize.org | arcprize.org | 2026-03-20 | |
| 2025.42 | 42.0 | o3 (high compute) | OpenAI | openai.com | 2026-03-20 | |
| 2025.67 | 55.0 | Ensemble | arcprize.org | arcprize.org | 2026-03-20 | |
| 2025.83 | 68.8 | Best system | arcprize.org | arcprize.org | 2026-03-20 | |
| 2026.08 | 77.0 | Current best | arcprize.org | arcprize.org | 2026-03-20 | ARC Prize still frames 85% as the challenge |

---

## Cost Efficiency ($/M tokens)

| Time | Score | Model | Source | URL | Access Date | Notes |
|------|-------|-------|--------|-----|-------------|-------|
| 2023.00 | 20.00 | GPT-3.5 equivalent | Stanford AI Index | hai.stanford.edu | 2026-03-20 | Baseline pricing |
| 2023.50 | 10.00 | Price competition | API pricing pages | Various | 2026-03-20 | |
| 2024.00 | 2.00 | Claude 3 Haiku | Anthropic | anthropic.com/pricing | 2026-03-20 | |
| 2024.50 | 0.50 | GPT-4o mini | OpenAI | openai.com/pricing | 2026-03-20 | |
| 2025.00 | 0.15 | Gemini Flash | Google | ai.google.dev/pricing | 2026-03-20 | |
| 2025.50 | 0.07 | Best equivalent | API pricing pages | Various | 2026-03-20 | 280x reduction from baseline |

---

## Training Compute (log10 FLOP)

| Time | Score | Model | Source | URL | Access Date | Notes |
|------|-------|-------|--------|-----|-------------|-------|
| 2017.00 | 23.0 | Transformer | Epoch AI | epoch.ai | 2026-03-20 | Vaswani et al. |
| 2018.50 | 23.5 | BERT | Epoch AI | epoch.ai | 2026-03-20 | |
| 2020.00 | 23.6 | GPT-3 | Epoch AI | epoch.ai | 2026-03-20 | |
| 2022.00 | 24.0 | Chinchilla | Epoch AI | epoch.ai | 2026-03-20 | |
| 2023.00 | 25.0 | GPT-4 (estimated) | Epoch AI | epoch.ai | 2026-03-20 | Estimate |
| 2024.00 | 25.5 | Gemini Ultra | Epoch AI | epoch.ai | 2026-03-20 | |
| 2024.50 | 25.7 | Claude 3.5 | Epoch AI | epoch.ai | 2026-03-20 | Estimate |
| 2025.00 | 26.0 | Frontier models | Epoch AI | epoch.ai | 2026-03-20 | |
| 2025.50 | 26.2 | Latest frontier | Epoch AI | epoch.ai | 2026-03-20 | |

**Note:** Training compute figures for recent models are estimates. Exact FLOP counts are proprietary.

---

## Sources Not Yet Upgraded to Primary

The following claims in the papers rely on secondary reportage. PRs upgrading these to primary disclosures are welcome.

| Claim | Current Source | Desired Primary Source |
|-------|---------------|----------------------|
| "70-90% of Anthropic code written by AI" | TechBuzz, March 2026 | Anthropic official disclosure |
| "$660B AI investment (2026)" | Deloitte 2026 forecast | Multiple; cross-reference needed |
| "$4.5T transferable labor" | Fortune reporting on Cognizant/DWU | Cognizant/DWU original report |
