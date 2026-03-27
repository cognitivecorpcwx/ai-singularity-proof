"use client";

import { getOverallVerdict, type VerdictStatus } from "@/lib/domains";

interface OverallVerdictProps {
  fisherChi2: number;
  fisherPValue: number;
  fisherSignificant: boolean;
  kendallChi2?: number;
  kendallPValue?: number;
  kendallSignificant?: boolean;
  significantDomains: number;
  totalDomains: number;
  sloganR2Domains: number;
  supportedDomains: number;
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
  kendallChi2,
  kendallPValue,
  kendallSignificant,
  significantDomains,
  totalDomains,
  sloganR2Domains,
  supportedDomains,
}: OverallVerdictProps) {
  const verdict = getOverallVerdict(significantDomains, totalDomains, fisherPValue, kendallPValue);
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
            <span className="badge badge-blue">
              {supportedDomains}/7 Domains
            </span>
          </div>
          <p className="text-sm text-[#8888a0] mb-4">{verdict.description}</p>

          {/* Dual-test comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Supporting test */}
            <div className="rounded-lg bg-black/20 p-3">
              <div className="text-[10px] text-emerald-400 font-medium uppercase tracking-wider mb-2">
                Supporting: t-test + Fisher
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-[10px] text-[#8888a0]">Fisher Combined p</div>
                  <div className={`text-lg font-bold ${fisherSignificant ? "text-emerald-400" : "text-yellow-400"}`}>
                    {fisherPValue.toFixed(3)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-[#8888a0]">Accelerating</div>
                  <div className="text-lg font-bold text-white">
                    {significantDomains}/{totalDomains}
                  </div>
                </div>
              </div>
            </div>

            {/* Adversarial test */}
            <div className="rounded-lg bg-black/20 p-3">
              <div className="text-[10px] text-red-400 font-medium uppercase tracking-wider mb-2">
                Adversarial: Kendall&apos;s Tau
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-[10px] text-[#8888a0]">Deceleration p</div>
                  <div className={`text-lg font-bold ${kendallSignificant ? "text-red-400" : "text-yellow-400"}`}>
                    {kendallPValue != null ? kendallPValue.toFixed(4) : "—"}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-[#8888a0]">S-curve R&sup2;&gt;0.99</div>
                  <div className="text-lg font-bold text-white">
                    {sloganR2Domains}/{totalDomains}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-white/10">
        <p className="text-xs text-[#8888a0]">
          <span className="font-medium text-white">Dual-Test Interpretation:</span>{" "}
          The original analysis (t-test + Fisher, p={fisherPValue.toFixed(3)}) finds {significantDomains}/7 domains
          with significant acceleration. The independent adversarial reanalysis (Kendall&apos;s tau) finds evidence of
          {kendallSignificant ? (
            <span className="text-red-400 font-medium"> deceleration (p={kendallPValue?.toFixed(4)})</span>
          ) : (
            <span className="text-yellow-400"> inconclusive deceleration trends</span>
          )} across benchmarks. Strong S-curve fits ({sloganR2Domains}/7) confirm phase-transition dynamics,
          but whether this represents acceleration or maturation toward ceilings remains contested.
          {supportedDomains < totalDomains && (
            <span> Domain scoring revised to {supportedDomains}/7 after adversarial review.</span>
          )}
        </p>
      </div>
    </div>
  );
}
