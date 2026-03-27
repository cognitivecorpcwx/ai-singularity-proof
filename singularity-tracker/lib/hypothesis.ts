/**
 * Hypothesis testing for acceleration detection.
 * Implements one-sided t-tests and Fisher's combined probability test.
 */

// Approximate t-distribution CDF using normal approximation for larger df
// For small df, uses a polynomial approximation
function tCDF(t: number, df: number): number {
  // Use the regularized incomplete beta function approach
  const x = df / (df + t * t);
  const a = df / 2;
  const b = 0.5;

  // Regularized incomplete beta function (approximation)
  let ibeta = incompleteBeta(x, a, b);

  if (t >= 0) {
    return 1 - 0.5 * ibeta;
  } else {
    return 0.5 * ibeta;
  }
}

// Incomplete beta function using continued fraction expansion
function incompleteBeta(x: number, a: number, b: number): number {
  if (x === 0 || x === 1) return x === 0 ? 0 : 1;

  const lnBeta = lgamma(a) + lgamma(b) - lgamma(a + b);
  const prefix = Math.exp(a * Math.log(x) + b * Math.log(1 - x) - lnBeta) / a;

  // Use continued fraction
  let sum = 1;
  let term = 1;
  for (let n = 1; n <= 200; n++) {
    const an = n * (b - n) * x / ((a + 2 * n - 1) * (a + 2 * n));
    term *= an;
    sum += term;
    if (Math.abs(term) < 1e-10) break;

    const bn = -(a + n) * (a + b + n) * x / ((a + 2 * n) * (a + 2 * n + 1));
    term *= bn;
    sum += term;
    if (Math.abs(term) < 1e-10) break;
  }

  return prefix * sum;
}

// Log gamma function (Stirling approximation)
function lgamma(x: number): number {
  if (x <= 0) return 0;
  // Lanczos approximation
  const g = 7;
  const c = [
    0.99999999999980993, 676.5203681218851, -1259.1392167224028,
    771.32342877765313, -176.61502916214059, 12.507343278686905,
    -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
  ];
  let sum = c[0];
  for (let i = 1; i < g + 2; i++) {
    sum += c[i] / (x + i - 1);
  }
  const t = x + g - 0.5;
  return 0.5 * Math.log(2 * Math.PI) + (x - 0.5) * Math.log(t) - t + Math.log(sum);
}

// Chi-squared CDF (for Fisher's combined test)
function chiSquaredCDF(x: number, k: number): number {
  // Using regularized incomplete gamma function
  return regularizedGamma(k / 2, x / 2);
}

function regularizedGamma(a: number, x: number): number {
  if (x === 0) return 0;
  if (x < a + 1) {
    // Series expansion
    let sum = 1 / a;
    let term = 1 / a;
    for (let n = 1; n <= 200; n++) {
      term *= x / (a + n);
      sum += term;
      if (Math.abs(term) < 1e-10) break;
    }
    return sum * Math.exp(-x + a * Math.log(x) - lgamma(a));
  } else {
    // Continued fraction
    let f = 1;
    let c = 1;
    let d = 1 / (x + 1 - a);
    f = d;
    for (let n = 1; n <= 200; n++) {
      const an = n * (a - n);
      const bn = x + 2 * n + 1 - a;
      d = 1 / (bn + an * d);
      c = bn + an / c;
      const delta = c * d;
      f *= delta;
      if (Math.abs(delta - 1) < 1e-10) break;
    }
    return 1 - f * Math.exp(-x + a * Math.log(x) - lgamma(a));
  }
}

export interface AccelerationResult {
  n: number;
  meanAcceleration: number;
  tStatistic: number;
  pValue: number;
  significant005: boolean;
  significant010: boolean;
  fractionAccelerating: number;
  accelerations: number[];
}

/**
 * Compute second differences (acceleration) from time-series data.
 * Tests H1: acceleration > 0 (one-sided t-test).
 */
export function testAcceleration(
  times: number[],
  scores: number[]
): AccelerationResult {
  if (times.length < 3) {
    return {
      n: 0,
      meanAcceleration: 0,
      tStatistic: 0,
      pValue: 1,
      significant005: false,
      significant010: false,
      fractionAccelerating: 0,
      accelerations: [],
    };
  }

  // Compute velocities (first differences)
  const velocities: number[] = [];
  for (let i = 1; i < times.length; i++) {
    const dt = times[i] - times[i - 1];
    if (dt > 0) {
      velocities.push((scores[i] - scores[i - 1]) / dt);
    }
  }

  // Compute accelerations (second differences)
  const accelerations: number[] = [];
  for (let i = 1; i < velocities.length; i++) {
    accelerations.push(velocities[i] - velocities[i - 1]);
  }

  const n = accelerations.length;
  if (n < 2) {
    return {
      n,
      meanAcceleration: n > 0 ? accelerations[0] : 0,
      tStatistic: 0,
      pValue: 1,
      significant005: false,
      significant010: false,
      fractionAccelerating: accelerations.filter((a) => a > 0).length / Math.max(n, 1),
      accelerations,
    };
  }

  const mean = accelerations.reduce((s, a) => s + a, 0) / n;
  const variance = accelerations.reduce((s, a) => s + (a - mean) ** 2, 0) / (n - 1);
  const se = Math.sqrt(variance / n);

  const tStat = se > 0 ? mean / se : 0;
  const df = n - 1;

  // One-sided p-value: P(T > t) for testing H1: mean > 0
  const pValue = 1 - tCDF(tStat, df);

  return {
    n,
    meanAcceleration: mean,
    tStatistic: tStat,
    pValue,
    significant005: pValue < 0.05,
    significant010: pValue < 0.10,
    fractionAccelerating: accelerations.filter((a) => a > 0).length / n,
    accelerations,
  };
}

export interface FisherResult {
  chi2: number;
  pValue: number;
  significant: boolean;
  df: number;
}

/**
 * Fisher's combined probability test.
 * Combines p-values from independent tests into one overall test.
 */
export function fisherCombinedTest(pValues: number[]): FisherResult {
  const k = pValues.length;
  // Clamp p-values to avoid log(0)
  const clamped = pValues.map((p) => Math.max(p, 1e-10));
  const chi2 = -2 * clamped.reduce((s, p) => s + Math.log(p), 0);
  const df = 2 * k;
  const pValue = 1 - chiSquaredCDF(chi2, df);

  return {
    chi2,
    pValue,
    significant: pValue < 0.05,
    df,
  };
}
