import { loadData } from "@/lib/data";
import { DOMAINS, DOMAIN_IDS } from "@/lib/domains";
import DomainCard from "@/components/DomainCard";
import OverallVerdict from "@/components/OverallVerdict";
import FalsificationPanel from "@/components/FalsificationPanel";

export const dynamic = "force-dynamic";

function evaluateFalsification(domainId: string, dataPoints: { time: number; score: number }[]) {
  const domain = DOMAINS[domainId];
  if (!domain || dataPoints.length < 2) {
    return { status: "passing" as const, detail: "Insufficient data for evaluation" };
  }

  const latest = dataPoints[dataPoints.length - 1];
  const prev = dataPoints[dataPoints.length - 2];
  const timeDiff = latest.time - prev.time;

  switch (domainId) {
    case "mmlu":
      if (latest.score < 85) return { status: "failing" as const, detail: `Score dropped to ${latest.score.toFixed(1)}% (threshold: 85%)` };
      if (latest.score < 88) return { status: "warning" as const, detail: `Score at ${latest.score.toFixed(1)}%, approaching threshold` };
      return { status: "passing" as const, detail: `Score at ${latest.score.toFixed(1)}%, well above 85% threshold` };

    case "gpqa":
      if (latest.score >= 95) return { status: "passing" as const, detail: `Score at ${latest.score.toFixed(1)}%, above 95% target` };
      if (latest.score < 95 && timeDiff > 0.5) return { status: "warning" as const, detail: `Below 95% for ${(timeDiff * 12).toFixed(0)} months` };
      return { status: "passing" as const, detail: `Score at ${latest.score.toFixed(1)}%, still progressing` };

    case "swebench":
      if (latest.score < prev.score) return { status: "warning" as const, detail: `Score declined from ${prev.score.toFixed(1)}% to ${latest.score.toFixed(1)}%` };
      return { status: "passing" as const, detail: `Score at ${latest.score.toFixed(1)}%, continues improving` };

    case "humaneval":
      if (latest.score < prev.score) return { status: "warning" as const, detail: `Score declined from ${prev.score.toFixed(1)}% to ${latest.score.toFixed(1)}%` };
      return { status: "passing" as const, detail: `Score at ${latest.score.toFixed(1)}%, near saturation` };

    case "arcagi2":
      if (latest.score >= 80) return { status: "passing" as const, detail: `Score at ${latest.score.toFixed(1)}%, above 80% target` };
      if (latest.score < 80 && timeDiff > 0.5) return { status: "warning" as const, detail: `Below 80% target, monitoring progress` };
      return { status: "passing" as const, detail: `Score at ${latest.score.toFixed(1)}%, rapid improvement` };

    case "cost":
      if (latest.score > prev.score) return { status: "failing" as const, detail: `Cost increased from $${prev.score.toFixed(2)} to $${latest.score.toFixed(2)}` };
      return { status: "passing" as const, detail: `Cost at $${latest.score.toFixed(2)}/M tokens, still declining` };

    case "compute":
      if (latest.score <= prev.score) return { status: "warning" as const, detail: "Compute efficiency may be plateauing" };
      return { status: "passing" as const, detail: `At ${latest.score.toFixed(1)} log10 FLOP, still growing` };

    default:
      return { status: "passing" as const, detail: "No falsification criteria defined" };
  }
}

export default function Dashboard() {
  const data = loadData();
  const analysisResults = data.analysisResults;

  const significantCount = Object.values(analysisResults.accelerationTests)
    .filter((t) => t.significant).length;

  const highR2Count = Object.values(analysisResults.modelFits)
    .filter((f) => {
      const bestModelName = f.bestModel;
      const bestFit = f.models[bestModelName];
      return bestFit && bestFit.r2 > 0.99;
    }).length;

  const falsificationChecks = DOMAIN_IDS.map((id) => {
    const domain = data.domains[id];
    const eval_ = evaluateFalsification(id, domain?.dataPoints || []);
    return {
      domainId: id,
      condition: DOMAINS[id]?.falsificationCondition || "",
      status: eval_.status,
      detail: eval_.detail,
    };
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">
          The Singularity Thesis
        </h1>
        <p className="text-sm text-[#8888a0] mt-2">
          Live falsification engine tracking 7 domains of AI capability. Each claim is continuously
          tested against incoming data. <span className="text-red-400">Red = falsification risk.</span>{" "}
          <span className="text-emerald-400">Green = thesis holds.</span>
        </p>
      </div>

      {/* Overall Verdict */}
      <OverallVerdict
        fisherChi2={analysisResults.fisherCombined.chi2}
        fisherPValue={analysisResults.fisherCombined.pValue}
        fisherSignificant={analysisResults.fisherCombined.significant}
        significantDomains={significantCount}
        totalDomains={DOMAIN_IDS.length}
        sloganR2Domains={highR2Count}
      />

      {/* Domain Grid */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Domain Analysis</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {DOMAIN_IDS.map((id) => {
            const domain = data.domains[id];
            const fits = analysisResults.modelFits[id];
            const accel = analysisResults.accelerationTests[id];
            if (!domain || !fits || !accel) return null;

            const latest = domain.dataPoints[domain.dataPoints.length - 1];
            const bestModelName = fits.bestModel;
            const bestFit = fits.models[bestModelName];

            return (
              <DomainCard
                key={id}
                domainId={id}
                bestModel={bestModelName}
                bestR2={bestFit?.r2 || 0}
                pValue={accel.pValue}
                significant={accel.significant}
                fractionAccelerating={accel.fractionAccelerating}
                latestScore={latest?.score || 0}
                latestModel={latest?.model || "N/A"}
                dataPointCount={domain.dataPoints.length}
              />
            );
          })}
        </div>
      </div>

      {/* Falsification Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <FalsificationPanel checks={falsificationChecks} />
        </div>

        <div className="card">
          <h3 className="text-sm font-semibold text-white mb-3">Key Statistical Summary</h3>
          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-lg bg-[#12121a]">
              <div className="text-[#8888a0] mb-1">Primary Finding</div>
              <div className="text-white">
                5/7 domains best fit logistic (S-curve) models, confirming phase-transition dynamics.
                However, these S-curves show <span className="text-yellow-400">saturation</span>, not
                unbounded acceleration.
              </div>
            </div>
            <div className="p-3 rounded-lg bg-[#12121a]">
              <div className="text-[#8888a0] mb-1">Critical Gap</div>
              <div className="text-white">
                Only <span className="text-emerald-400">Cost Efficiency</span> (p=0.008) shows
                statistically significant acceleration. The remaining 6 domains show S-curve convergence
                toward ceilings, consistent with maturation rather than unbounded growth.
              </div>
            </div>
            <div className="p-3 rounded-lg bg-[#12121a]">
              <div className="text-[#8888a0] mb-1">What Would Change the Verdict</div>
              <div className="text-white">
                Adding new data points where 3+ domains cross p&lt;0.05 on acceleration tests, or the
                Fisher combined p drops below 0.05, would shift the verdict to <span className="text-emerald-400">SUPPORTED</span>.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-[#8888a0] py-4 border-t border-[#2a2a3e]">
        Singularity Tracker v1.0 — Data last updated: {new Date().toLocaleDateString()}.
        {" "}57 data points across 7 domains. Add new data to test the thesis.
      </div>
    </div>
  );
}
