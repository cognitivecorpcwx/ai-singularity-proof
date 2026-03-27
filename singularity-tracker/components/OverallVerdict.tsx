"use client";

import { getOverallVerdict, DOMAIN_IDS, type VerdictStatus } from "@/lib/domains";

interface OverallVerdictProps {
  fisherChi2: number;
  fisherPValue: number;
  fisherSignificant: boolean;
  significantDomains: number;
  totalDomains: number;
  sloganR2Domains: number;
}

const verdictStyles: Record<VerdictStatus, { bg: string; border: string; icon: string; glow: string }> = {
  SUPPORTED: {
    bg: "from-emerald-500/10 to-emerald-500/5",
    border: "border-emerald-500/30",
    icon: "\u2713",
    glow: "shadow-emerald-500/20",
  },
  MIXED: {
    bg: "from-yellow-500/10 to-yellow-500/5",
    border: "border-yellow-500/30",
    icon: "\u26A0",
    glow: "shadow-yellow-500/20",
  },
  REFUTED: {
    bg: "from-red-500/10 to-red-500/5",
    border: "border-red-500/30",
    icon: "\u2717",
    glow: "shadow-red-500/20",
  },
};

export default function OverallVerdict({
  fisherChi2,
  fisherPValue,
  fisherSignificant,
  significantDomains,
  totalDomains,
  sloganR2Domains,
}: OverallVerdictProps) {
  const verdict = getOverallVerdict(significantDomains, totalDomains, fisherPValue);
  const style = verdictStyles[verdict.status];

  return (
    <div className={`rounded-xl border ${style.border} bg-gradient-to-r ${style.bg} p-6 shadow-lg ${style.glow}`}>
      <div className="flex items-start gap-4">
        <div className="text-3xl">{style.icon}</div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-xl font-bold text-white">{verdict.label}</h2>
            <span className={`badge ${
              verdict.status === "SUPPORTED" ? "badge-green" :
              verdict.status === "REFUTED" ? "badge-red" : "badge-yellow"
            }`}>
              {verdict.status}
            </span>
          </div>
          <p className="text-sm text-[#8888a0] mb-4">{verdict.description}</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-xs text-[#8888a0] mb-1">Fisher Combined p</div>
              <div className={`text-lg font-bold ${fisherSignificant ? "text-emerald-400" : "text-yellow-400"}`}>
                {fisherPValue.toFixed(3)}
              </div>
            </div>
            <div>
              <div className="text-xs text-[#8888a0] mb-1">Fisher &chi;&sup2;</div>
              <div className="text-lg font-bold text-white">{fisherChi2.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-xs text-[#8888a0] mb-1">Accelerating Domains</div>
              <div className="text-lg font-bold text-white">
                {significantDomains}/{totalDomains}
              </div>
            </div>
            <div>
              <div className="text-xs text-[#8888a0] mb-1">S-curve Fit (R&sup2;&gt;0.99)</div>
              <div className="text-lg font-bold text-white">
                {sloganR2Domains}/{totalDomains}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-white/10">
        <p className="text-xs text-[#8888a0]">
          <span className="font-medium text-white">Interpretation:</span> Strong S-curve fits ({sloganR2Domains}/7 domains with R&sup2;&gt;0.99) confirm
          phase-transition-like dynamics. However, only {significantDomains}/7 domain(s) show statistically significant
          acceleration (p&lt;0.05). The combined Fisher test (p={fisherPValue.toFixed(3)}) {fisherSignificant ? "supports" : "does not support"} uniform
          acceleration across all domains. The thesis rests more on convergence patterns than on acceleration.
        </p>
      </div>
    </div>
  );
}
