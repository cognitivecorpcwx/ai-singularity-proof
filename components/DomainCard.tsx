"use client";

import Link from "next/link";
import { DOMAINS } from "@/lib/domains";

interface DomainCardProps {
  domainId: string;
  bestModel: string;
  bestR2: number;
  pValue: number;
  significant: boolean;
  fractionAccelerating: number;
  latestScore: number;
  latestModel: string;
  dataPointCount: number;
}

export default function DomainCard({
  domainId,
  bestModel,
  bestR2,
  pValue,
  significant,
  fractionAccelerating,
  latestScore,
  latestModel,
  dataPointCount,
}: DomainCardProps) {
  const domain = DOMAINS[domainId];
  if (!domain) return null;

  const trendIcon = significant
    ? "\u2191"  // up arrow
    : fractionAccelerating > 0.5
    ? "\u2197"  // diagonal up
    : fractionAccelerating > 0.3
    ? "\u2192"  // right arrow
    : "\u2198"; // diagonal down

  const trendColor = significant
    ? "text-emerald-400"
    : fractionAccelerating > 0.5
    ? "text-yellow-400"
    : "text-red-400";

  return (
    <Link href={`/domain/${domainId}`}>
      <div className="card-hover group">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-sm font-medium text-white group-hover:text-[#4c6ef5] transition-colors">
              {domain.shortName}
            </h3>
            <p className="text-xs text-[#8888a0] mt-0.5">{dataPointCount} data points</p>
          </div>
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: domain.color }}
          />
        </div>

        <div className="flex gap-1.5 mb-3">
          <span className={`badge ${
            domain.evidenceStrength === "Strong" ? "badge-green" :
            domain.evidenceStrength === "Moderate" ? "badge-yellow" : "badge-red"
          }`}>
            {domain.evidenceStrength}
          </span>
          <span className={`badge ${
            domain.adversarialVerdict === "Passing" ? "badge-green" :
            domain.adversarialVerdict === "Insufficient" ? "badge-yellow" : "badge-red"
          }`}>
            {domain.adversarialVerdict}
          </span>
        </div>

        <div className="mb-4">
          <div className="text-2xl font-bold text-white">
            {domain.direction === "lower_is_better" ? "$" : ""}
            {latestScore.toFixed(domain.direction === "lower_is_better" ? 2 : 1)}
            {domain.direction !== "lower_is_better" ? "%" : ""}
          </div>
          <div className="text-xs text-[#8888a0] mt-1">{latestModel}</div>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-[#8888a0]">Best Fit</span>
            <span className="text-white">{bestModel}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#8888a0]">R&sup2;</span>
            <span className="text-white">{bestR2.toFixed(4)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#8888a0]">Acceleration p</span>
            <span className={significant ? "text-emerald-400 font-medium" : "text-[#8888a0]"}>
              {pValue.toFixed(3)}
              {significant && " *"}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#8888a0]">Trend</span>
            <span className={`text-lg ${trendColor}`}>{trendIcon}</span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-[#2a2a3e]">
          <p className="text-[10px] text-[#8888a0] leading-relaxed">
            <span className="text-red-400 font-medium">FALSIFIES IF:</span>{" "}
            {domain.falsificationCondition}
          </p>
        </div>
      </div>
    </Link>
  );
}
