import { NextResponse } from "next/server";
import { loadData } from "@/lib/data";
import { fitAllModels, generateFittedCurve } from "@/lib/statistics";
import { testAcceleration, kendallTauTest, fisherCombinedTest } from "@/lib/hypothesis";
import { DOMAIN_IDS } from "@/lib/domains";

export async function GET() {
  try {
    const data = loadData();
    const results: Record<string, {
      fits: { name: string; r2: number; aic: number; bic: number }[];
      bestModel: string;
      bestR2: number;
      fittedCurve: { time: number; score: number }[];
      acceleration: {
        pValue: number;
        tStatistic: number;
        significant: boolean;
        fractionAccelerating: number;
        meanAcceleration: number;
      };
      kendallTau: {
        tau: number;
        pValue: number;
        significant: boolean;
        direction: string;
      };
    }> = {};

    const accelPValues: number[] = [];
    const kendallDecelPValues: number[] = [];

    for (const domainId of DOMAIN_IDS) {
      const domain = data.domains[domainId];
      if (!domain || domain.dataPoints.length < 3) continue;

      const times = domain.dataPoints.map((d) => d.time);
      const scores = domain.dataPoints.map((d) => d.score);

      // For cost (lower is better), invert for fitting purposes
      const fitScores = domain.direction === "lower_is_better"
        ? scores.map((s) => -Math.log(Math.max(s, 0.001)))
        : scores;

      const { fits, best } = fitAllModels(times, fitScores);

      // Generate fitted curve in original scale
      const xMin = Math.min(...times);
      const xMax = Math.max(...times);
      let fittedCurve: { time: number; score: number }[];

      if (domain.direction === "lower_is_better") {
        fittedCurve = generateFittedCurve(
          (x) => Math.exp(-best.predict(x)),
          xMin, xMax, 50
        );
      } else {
        fittedCurve = generateFittedCurve(best.predict, xMin, xMax, 50);
      }

      const accel = testAcceleration(times, scores);
      accelPValues.push(accel.pValue);

      // Kendall's tau — adversarial reanalysis method
      const kendall = kendallTauTest(times, scores);
      kendallDecelPValues.push(kendall.pValue);

      results[domainId] = {
        fits: fits.map((f) => ({ name: f.name, r2: f.r2, aic: f.aic, bic: f.bic })),
        bestModel: best.name,
        bestR2: best.r2,
        fittedCurve,
        acceleration: {
          pValue: accel.pValue,
          tStatistic: accel.tStatistic,
          significant: accel.significant005,
          fractionAccelerating: accel.fractionAccelerating,
          meanAcceleration: accel.meanAcceleration,
        },
        kendallTau: {
          tau: kendall.tau,
          pValue: kendall.pValue,
          significant: kendall.significant,
          direction: kendall.direction,
        },
      };
    }

    const fisher = fisherCombinedTest(accelPValues);

    // Kendall combined deceleration test (Fisher's method on deceleration p-values)
    const kendallCombined = fisherCombinedTest(kendallDecelPValues);

    return NextResponse.json({
      domains: results,
      fisherCombined: {
        chi2: fisher.chi2,
        pValue: fisher.pValue,
        significant: fisher.significant,
        df: fisher.df,
      },
      kendallCombined: {
        chi2: kendallCombined.chi2,
        pValue: kendallCombined.pValue,
        significant: kendallCombined.significant,
        df: kendallCombined.df,
        interpretation: kendallCombined.significant
          ? "Adversarial reanalysis confirms deceleration across domains"
          : "Adversarial deceleration test inconclusive",
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Analysis failed" },
      { status: 500 }
    );
  }
}
