"use client";

import { DOMAINS } from "@/lib/domains";

interface AdversarialPanelProps {
  domainId: string;
  kendallTau?: { tau: number; pValue: number; significant: boolean; direction: string };
}

export default function AdversarialPanel({ domainId, kendallTau }: AdversarialPanelProps) {
  const domain = DOMAINS[domainId];
  if (!domain) return null;

  return (
    <div className="space-y-4">
      {/* Verdict badges */}
      <div className="flex items-center gap-3">
        <span className={`badge ${
          domain.evidenceStrength === "Strong" ? "badge-green" :
          domain.evidenceStrength === "Moderate" ? "badge-yellow" : "badge-red"
        }`}>
          Evidence: {domain.evidenceStrength}
        </span>
        <span className={`badge ${
          domain.adversarialVerdict === "Passing" ? "badge-green" :
          domain.adversarialVerdict === "Insufficient" ? "badge-yellow" : "badge-red"
        }`}>
          Adversarial: {domain.adversarialVerdict}
        </span>
      </div>

      {/* Adversarial note */}
      <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/20">
        <div className="text-[10px] text-red-400 font-medium uppercase tracking-wider mb-1">
          Independent Review Finding
        </div>
        <p className="text-xs text-[#8888a0]">{domain.adversarialNote}</p>
      </div>

      {/* Kendall's tau result */}
      {kendallTau && (
        <div className="p-3 rounded-lg bg-[#12121a]">
          <div className="text-[10px] text-[#8888a0] font-medium uppercase tracking-wider mb-2">
            Kendall&apos;s Tau Rank Correlation
          </div>
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div>
              <span className="text-[#8888a0]">&tau;</span>
              <div className={`font-mono font-bold ${
                kendallTau.tau < -0.1 ? "text-red-400" : kendallTau.tau > 0.1 ? "text-emerald-400" : "text-white"
              }`}>
                {kendallTau.tau.toFixed(3)}
              </div>
            </div>
            <div>
              <span className="text-[#8888a0]">Decel p</span>
              <div className={`font-mono font-bold ${kendallTau.significant ? "text-red-400" : "text-white"}`}>
                {kendallTau.pValue.toFixed(4)}
              </div>
            </div>
            <div>
              <span className="text-[#8888a0]">Direction</span>
              <div className={`font-bold ${
                kendallTau.direction === "decelerating" ? "text-red-400" :
                kendallTau.direction === "accelerating" ? "text-emerald-400" : "text-white"
              }`}>
                {kendallTau.direction === "decelerating" ? "\u2198 Decelerating" :
                 kendallTau.direction === "accelerating" ? "\u2197 Accelerating" : "-- Flat"}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Side-by-side evidence */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
          <div className="text-[10px] text-emerald-400 font-medium uppercase tracking-wider mb-2">
            Supporting Evidence
          </div>
          <ul className="space-y-1.5">
            {domain.supportingEvidence.map((item, i) => (
              <li key={i} className="text-[11px] text-[#8888a0] flex gap-1.5">
                <span className="text-emerald-400 shrink-0">+</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/20">
          <div className="text-[10px] text-red-400 font-medium uppercase tracking-wider mb-2">
            Opposing Evidence
          </div>
          <ul className="space-y-1.5">
            {domain.opposingEvidence.map((item, i) => (
              <li key={i} className="text-[11px] text-[#8888a0] flex gap-1.5">
                <span className="text-red-400 shrink-0">-</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
