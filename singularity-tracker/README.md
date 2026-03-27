# Singularity Tracker — Live Falsification Engine

A real-time dashboard that continuously tests whether the AI singularity thesis holds against incoming benchmark data. Built as the interactive companion to [The Singularity Is Here](../docs/The_Singularity_Is_Here.docx) evidence package.

Rather than asking "is the singularity coming?", this tool asks the harder question: **"what data would prove us wrong?"** Each of the 7 tracked domains has an explicit falsification condition. Add new data, and the statistical models refit automatically.

---

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

For production:

```bash
npm run build
npm start
```

---

## Architecture

```
singularity-tracker/
├── app/                        # Next.js App Router pages
│   ├── layout.tsx              # Root layout with navigation bar
│   ├── page.tsx                # Main dashboard (server component)
│   ├── globals.css             # Design tokens and Tailwind utilities
│   ├── add-data/
│   │   └── page.tsx            # Data entry form (client component)
│   ├── domain/
│   │   └── [id]/
│   │       └── page.tsx        # Per-domain deep-dive (client component)
│   └── api/
│       ├── data/
│       │   └── route.ts        # GET all data / POST new data point
│       └── analyze/
│           └── route.ts        # GET re-runs all statistical analysis
│
├── components/                 # React UI components
│   ├── AccelerationGauge.tsx   # Visual gauge for acceleration p-value
│   ├── DataTable.tsx           # Sortable raw data table with deltas
│   ├── DomainCard.tsx          # Summary card per domain (grid tile)
│   ├── FalsificationPanel.tsx  # Pass/warn/fail status per domain
│   ├── OverallVerdict.tsx      # Combined verdict banner with Fisher stats
│   └── TrajectoryChart.tsx     # Recharts line chart with fitted curve overlay
│
├── lib/                        # Core logic
│   ├── data.ts                 # JSON file I/O, data types, add/load/save
│   ├── domains.ts              # Domain definitions, verdict logic
│   ├── hypothesis.ts           # t-tests, Fisher's combined test, t-CDF
│   └── statistics.ts           # Curve fitting engine (4 models, AIC/BIC)
│
├── data/
│   └── singularity.json        # All benchmark data (the source of truth)
│
├── package.json
├── tsconfig.json
├── tailwind.config.ts          # Custom "singularity" color palette
├── postcss.config.js
└── next.config.js
```

---

## Pages and Routes

### Dashboard (`/`)

Server-rendered overview of all 7 domains. Shows the overall verdict banner (Supported / Mixed / Refuted), a grid of domain summary cards, the falsification panel, and key statistical findings. The verdict is computed from Fisher's combined probability test across all domain-level acceleration p-values.

### Domain Detail (`/domain/[id]`)

Client-rendered deep-dive into a single domain. Fetches data from both API routes and displays the thesis claim with its falsification condition, a trajectory chart with the best-fit model overlaid, a model comparison panel (Linear, Logarithmic, Exponential, Logistic) ranked by AIC, an acceleration gauge showing the one-sided t-test result, and the full raw data table with point-to-point deltas.

### Add Data (`/add-data`)

Form for entering new benchmark results. Accepts domain, year/month, score, model name, and source URL. On submit, POSTs to `/api/data`, which appends the point to `singularity.json` and keeps the time series sorted. Supports pre-selecting a domain via query parameter (`/add-data?domain=mmlu`).

---

## API Routes

### `GET /api/data`

Returns the full `singularity.json` contents: all 7 domains with their data points and the pre-computed analysis results from the Python pipeline.

### `POST /api/data`

Adds a new data point to a domain.

**Request body:**
```json
{
  "domainId": "gpqa",
  "time": 2026.25,
  "score": 95.2,
  "model": "Claude 4 Opus",
  "source": "Anthropic"
}
```

`time` is a decimal year (e.g., 2026.25 = April 2026). The point is inserted in sorted order.

### `GET /api/analyze`

Re-runs the full statistical analysis on current data. For each domain with 3+ data points, this fits all 4 regression models (Linear, Logarithmic, Exponential, Logistic), selects the best fit by AIC, generates a 50-point fitted curve, and runs the acceleration t-test. Returns per-domain results plus the Fisher combined test across all domains.

**Response shape:**
```json
{
  "domains": {
    "mmlu": {
      "fits": [{ "name": "Linear", "r2": 0.98, "aic": 42.1, "bic": 43.5 }, ...],
      "bestModel": "Logistic",
      "bestR2": 0.9987,
      "fittedCurve": [{ "time": 2020.0, "score": 42.5 }, ...],
      "acceleration": {
        "pValue": 0.312,
        "tStatistic": 0.52,
        "significant": false,
        "fractionAccelerating": 0.44,
        "meanAcceleration": 1.23
      }
    }
  },
  "fisherCombined": {
    "chi2": 16.84,
    "pValue": 0.252,
    "significant": false,
    "df": 14
  },
  "timestamp": "2026-03-27T12:00:00.000Z"
}
```

---

## Statistical Engine

The analysis pipeline runs entirely in TypeScript (no Python dependency at runtime). It mirrors the methodology from the [Quantitative Proof](../docs/The_Singularity_Is_Here_Quantitative_Proof.docx) document.

### Curve Fitting (`lib/statistics.ts`)

Four regression models are fitted to each domain's time series:

| Model | Equation | Parameters | Fitting Method |
|-------|----------|------------|----------------|
| Linear | y = ax + b | 2 | Ordinary least squares |
| Logarithmic | y = a·ln(x − x₀) + b | 2 (+1 offset) | OLS on log-transformed x |
| Exponential | y = a·e^(bx) | 2 | OLS on log-transformed y |
| Logistic | y = L / (1 + e^(−k(x − x₀))) | 3 | Levenberg-Marquardt (via `ml-levenberg-marquardt`) |

Model selection uses AIC (Akaike Information Criterion). R² and BIC are also computed for display. For "lower is better" domains (Cost Efficiency), scores are transformed to −ln(score) before fitting, then inverted for display.

### Hypothesis Testing (`lib/hypothesis.ts`)

**Per-domain acceleration test:**
1. Compute first differences (velocities): Δscore / Δtime
2. Compute second differences (accelerations): Δvelocity
3. One-sided t-test: H₀: mean acceleration ≤ 0 vs H₁: mean acceleration > 0
4. Report p-value, t-statistic, and fraction of intervals showing positive acceleration

**Cross-domain combined test:**
Fisher's combined probability method: χ² = −2 Σ ln(pᵢ), tested against χ² distribution with 2k degrees of freedom.

The t-distribution CDF is computed from scratch using the regularized incomplete beta function with Lanczos approximation for the log-gamma function. The chi-squared CDF uses the regularized incomplete gamma function with series/continued-fraction expansion. No external stats library is required.

### Falsification Logic (`app/page.tsx`)

Each domain has a domain-specific falsification rule evaluated against the two most recent data points. Rules include score thresholds (MMLU < 85%), time-based stalls (GPQA below 95% for > 6 months), directional reversals (SWE-bench declining), and cost increases (Cost Efficiency rising). The status is one of `passing`, `warning`, or `failing`.

### Overall Verdict (`lib/domains.ts`)

The combined verdict is determined by two criteria: the number of domains showing significant acceleration (p < 0.05) and the Fisher combined p-value. If both are strong, the verdict is SUPPORTED. If neither, REFUTED. Otherwise, MIXED. Current data produces a MIXED verdict.

---

## Components

### `OverallVerdict`
Hero banner at the top of the dashboard. Displays the verdict status (SUPPORTED / MIXED / REFUTED) with color-coded styling, Fisher combined statistics (χ², p-value), count of accelerating domains, and count of high-R² S-curve fits. Includes an interpretation paragraph.

### `DomainCard`
Compact summary card for the dashboard grid. Shows the domain's latest score and model, best-fit model name and R², acceleration p-value with significance marker, a trend arrow (↑ ↗ → ↘) based on fraction of accelerating intervals, and the falsification condition. Links to the domain detail page.

### `TrajectoryChart`
Recharts `ComposedChart` showing observed data points as connected dots and the fitted model as a dashed line. Supports an optional human baseline reference line (shown in red). Handles both "higher is better" and "lower is better" domains (the y-axis reverses for cost). Custom tooltip shows date, score, and model name.

### `AccelerationGauge`
Horizontal progress bar mapping the acceleration p-value to a visual position. The bar fills from left (decelerating) to right (accelerating), with color thresholds at p = 0.30 (orange), 0.10 (yellow), and 0.05 (green). White marker lines indicate the 0.10 and 0.05 significance thresholds. Below the bar: p-value, t-statistic, and percentage of intervals accelerating.

### `FalsificationPanel`
Stacked list of all 7 domains with their current falsification status. Each row shows the domain name, the falsification condition, the current evaluation detail, and a color-coded status icon (✓ green, ⚠ yellow, ✗ red).

### `DataTable`
Tabular view of all data points for a domain. Columns: Date, Model, Score, Change (delta from previous point, green if improving, red if declining), and Source. Dates are formatted as "Mon YYYY" from the decimal-year representation.

---

## Tracked Domains

| ID | Name | Unit | Direction | Human Baseline | Falsification Trigger |
|----|------|------|-----------|----------------|----------------------|
| `mmlu` | MMLU | % Accuracy | Higher is better | 89.8% (Expert) | Score drops below 85% |
| `gpqa` | GPQA Diamond | % Accuracy | Higher is better | 69.7% (PhD Panel) | Plateau below 95% for > 6 months |
| `swebench` | SWE-bench | % Resolved | Higher is better | — | Resolution rate declines |
| `humaneval` | HumanEval | % pass@1 | Higher is better | — | Scores decline from ~96% |
| `arcagi2` | ARC-AGI-2 | % Score | Higher is better | 100% (Human) | Stalls below 80% for > 6 months |
| `cost` | Cost Efficiency | $/M tokens | Lower is better | — | Cost stops declining or reverses |
| `compute` | Training Compute | log₁₀ FLOP | Higher is better | — | Efficiency plateau |

---

## Data Format

All data lives in `data/singularity.json`. The file contains two top-level keys:

**`domains`** — keyed by domain ID, each containing `name`, `shortName`, `unit`, `direction`, `humanBaseline`, `humanBaselineLabel`, and a `dataPoints` array where each point has `time` (decimal year), `score`, `model`, and `source`.

**`analysisResults`** — pre-computed results from the Python analysis pipeline (`code/singularity_proof.py`), containing `modelFits` (per-domain model comparison), `accelerationTests` (per-domain t-test results), and `fisherCombined` (cross-domain combined test). These are used by the dashboard's server component for initial render. The `/api/analyze` route recomputes these live from the TypeScript engine.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS 3.4 with custom color palette |
| Charts | Recharts 3.8 |
| Curve Fitting | ml-levenberg-marquardt 5.0 |
| Statistics | Custom implementation (t-CDF, χ² CDF, Fisher's test) |
| Data Storage | JSON file (filesystem-based, no database) |

---

## Adding New Benchmark Data

There are two ways to add data:

1. **Through the UI** — Navigate to `/add-data`, select a domain, enter the benchmark result, and submit. The JSON file is updated immediately.

2. **Direct JSON edit** — Open `data/singularity.json` and add an entry to the appropriate domain's `dataPoints` array. Keep the array sorted by `time`. Then restart the dev server or hit `GET /api/analyze` to see updated fits.

After adding data, the `/api/analyze` endpoint refits all models and recomputes all hypothesis tests. The dashboard reflects new results on the next page load.

---

## Relationship to the Research Papers

This tracker is Layer 6 of the evidence package — the living, falsifiable version of the static analysis in the DOCX papers. The Python scripts in `code/` produced the original figures and `analysis_results.json`. The TypeScript engine in `lib/` reimplements the same methodology for live, browser-based re-analysis. As new AI benchmarks are published, adding them here either strengthens or weakens the thesis in real time.

| Paper | What it contains | What the tracker adds |
|-------|-----------------|----------------------|
| [Narrative Argument](../docs/The_Singularity_Is_Here.docx) | Qualitative case across 7 domains | Live falsification checks |
| [Quantitative Proof](../docs/The_Singularity_Is_Here_Quantitative_Proof.docx) | Static curve fits, hypothesis tests | Dynamic re-fitting as data arrives |
| [Evidence Package](../docs/The_Singularity_Evidence_Package.docx) | Adversarial analysis, predictions, historical comparison | Real-time scoring of the 20 predictions |

---

## License

This project is part of Cognitive Corp's open research initiative. All benchmark data is sourced from publicly available leaderboards, model cards, and published papers. See individual data point `source` fields for attribution.

---

**Contact:** James Waddell | President & CRO | Cognitive Corp | bob@cognitivewx.info
