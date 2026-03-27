/**
 * Statistics engine for curve fitting and model comparison.
 * Implements 4 regression models: linear, logarithmic, exponential, logistic (S-curve).
 * Uses Levenberg-Marquardt for nonlinear fits.
 */

import { levenbergMarquardt } from "ml-levenberg-marquardt";

export interface FitResult {
  name: string;
  r2: number;
  aic: number;
  bic: number;
  params: number[];
  predict: (x: number) => number;
}

// Sum of squared residuals
function ssr(actual: number[], predicted: number[]): number {
  return actual.reduce((sum, y, i) => sum + (y - predicted[i]) ** 2, 0);
}

// Total sum of squares
function sst(actual: number[]): number {
  const mean = actual.reduce((s, v) => s + v, 0) / actual.length;
  return actual.reduce((sum, y) => sum + (y - mean) ** 2, 0);
}

function rSquared(actual: number[], predicted: number[]): number {
  // Guard against NaN/Infinity in predictions
  if (predicted.some((p) => !isFinite(p))) return 0;
  const ss_res = ssr(actual, predicted);
  const ss_tot = sst(actual);
  return ss_tot === 0 ? 0 : Math.max(0, 1 - ss_res / ss_tot);
}

function calcAIC(n: number, k: number, residualSS: number): number {
  if (n === 0 || residualSS <= 0) return Infinity;
  return n * Math.log(residualSS / n) + 2 * k;
}

function calcBIC(n: number, k: number, residualSS: number): number {
  if (n === 0 || residualSS <= 0) return Infinity;
  return n * Math.log(residualSS / n) + k * Math.log(n);
}

// Linear: y = a*x + b
function fitLinear(xs: number[], ys: number[]): FitResult {
  const n = xs.length;
  const sumX = xs.reduce((s, x) => s + x, 0);
  const sumY = ys.reduce((s, y) => s + y, 0);
  const sumXY = xs.reduce((s, x, i) => s + x * ys[i], 0);
  const sumX2 = xs.reduce((s, x) => s + x * x, 0);

  const a = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const b = (sumY - a * sumX) / n;

  const predicted = xs.map((x) => a * x + b);
  const ss_res = ssr(ys, predicted);

  return {
    name: "Linear",
    r2: rSquared(ys, predicted),
    aic: calcAIC(n, 2, ss_res),
    bic: calcBIC(n, 2, ss_res),
    params: [a, b],
    predict: (x: number) => a * x + b,
  };
}

// Logarithmic: y = a * ln(x - x0) + b (x0 adjusted so all values positive)
function fitLogarithmic(xs: number[], ys: number[]): FitResult {
  const x0 = Math.min(...xs) - 1;
  const logXs = xs.map((x) => Math.log(x - x0));

  const n = logXs.length;
  const sumLX = logXs.reduce((s, lx) => s + lx, 0);
  const sumY = ys.reduce((s, y) => s + y, 0);
  const sumLXY = logXs.reduce((s, lx, i) => s + lx * ys[i], 0);
  const sumLX2 = logXs.reduce((s, lx) => s + lx * lx, 0);

  const a = (n * sumLXY - sumLX * sumY) / (n * sumLX2 - sumLX * sumLX);
  const b = (sumY - a * sumLX) / n;

  const predicted = xs.map((x) => a * Math.log(x - x0) + b);
  const ss_res = ssr(ys, predicted);

  return {
    name: "Logarithmic",
    r2: rSquared(ys, predicted),
    aic: calcAIC(n, 2, ss_res),
    bic: calcBIC(n, 2, ss_res),
    params: [a, b, x0],
    predict: (x: number) => a * Math.log(x - x0) + b,
  };
}

// Exponential: y = a * e^(b*x)
function fitExponential(xs: number[], ys: number[]): FitResult {
  const n = xs.length;
  // Filter out non-positive y values for log transform
  const validIndices = ys.map((y, i) => (y > 0 ? i : -1)).filter((i) => i >= 0);
  const vx = validIndices.map((i) => xs[i]);
  const vy = validIndices.map((i) => ys[i]);
  const logY = vy.map((y) => Math.log(y));

  const sumX = vx.reduce((s, x) => s + x, 0);
  const sumLogY = logY.reduce((s, ly) => s + ly, 0);
  const sumXLogY = vx.reduce((s, x, i) => s + x * logY[i], 0);
  const sumX2 = vx.reduce((s, x) => s + x * x, 0);
  const vn = vx.length;

  const bParam = (vn * sumXLogY - sumX * sumLogY) / (vn * sumX2 - sumX * sumX);
  const aParam = Math.exp((sumLogY - bParam * sumX) / vn);

  const predicted = xs.map((x) => aParam * Math.exp(bParam * x));
  const ss_res = ssr(ys, predicted);

  return {
    name: "Exponential",
    r2: rSquared(ys, predicted),
    aic: calcAIC(n, 2, ss_res),
    bic: calcBIC(n, 2, ss_res),
    params: [aParam, bParam],
    predict: (x: number) => aParam * Math.exp(bParam * x),
  };
}

// Logistic (S-curve): y = L / (1 + e^(-k*(x - x0)))
function fitLogistic(xs: number[], ys: number[]): FitResult {
  const n = xs.length;
  const yMin = Math.min(...ys);
  const yMax = Math.max(...ys);
  const xMid = (Math.min(...xs) + Math.max(...xs)) / 2;

  const data = { x: xs, y: ys };

  const paramFunction = ([L, k, x0]: number[]) => (x: number) =>
    L / (1 + Math.exp(-k * (x - x0)));

  try {
    const result = levenbergMarquardt(data, paramFunction, {
      damping: 1.5,
      initialValues: [yMax * 1.1, 2.0, xMid],
      maxIterations: 200,
      errorTolerance: 1e-8,
    });

    const [L, k, x0] = result.parameterValues;
    const predicted = xs.map((x) => L / (1 + Math.exp(-k * (x - x0))));
    const ss_res = ssr(ys, predicted);

    return {
      name: "Logistic",
      r2: rSquared(ys, predicted),
      aic: calcAIC(n, 3, ss_res),
      bic: calcBIC(n, 3, ss_res),
      params: [L, k, x0],
      predict: (x: number) => L / (1 + Math.exp(-k * (x - x0))),
    };
  } catch {
    // Fallback if LM fails
    return {
      name: "Logistic",
      r2: 0,
      aic: Infinity,
      bic: Infinity,
      params: [yMax, 1.0, xMid],
      predict: (x: number) => yMax / (1 + Math.exp(-(x - xMid))),
    };
  }
}

export function fitAllModels(xs: number[], ys: number[]): {
  fits: FitResult[];
  best: FitResult;
} {
  const fits = [
    fitLinear(xs, ys),
    fitLogarithmic(xs, ys),
    fitExponential(xs, ys),
    fitLogistic(xs, ys),
  ];

  // Best by AIC (lowest)
  const best = fits.reduce((a, b) => (a.aic < b.aic ? a : b));
  return { fits, best };
}

export function generateFittedCurve(
  predict: (x: number) => number,
  xMin: number,
  xMax: number,
  steps: number = 50
): { time: number; score: number }[] {
  const range = xMax - xMin;
  const padding = range * 0.1;
  const start = xMin - padding;
  const end = xMax + padding;
  const step = (end - start) / steps;

  const points: { time: number; score: number }[] = [];
  for (let x = start; x <= end; x += step) {
    const y = predict(x);
    if (isFinite(y) && !isNaN(y)) {
      points.push({ time: Math.round(x * 100) / 100, score: Math.round(y * 100) / 100 });
    }
  }
  return points;
}
