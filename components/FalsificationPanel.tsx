"use client";

import { DOMAINS } from "@/lib/domains";

interface FalsificationCheck {
  domainId: string;
  condition: string;
  status: "passing" | "warning" | "failing";
  detail: string;
}

interface FalsificationPanelProps {
  checks: FalsificationCheck[];
}

export default function FalsificationPanel({ checks }: FalsificationPanelProps) {
  const statusIcons = {
    passing: "\u2713",
    warning: "\u26A0",
    failing: "\u2717",
  };

  const statusColors = {
    passing: "text-emerald-400",
    warning: "text-yellow-400",
    failing: "text-red-400",
  };

  const statusBg = {
    passing: "bg-emerald-500/10 border-emerald-500/20",
    warning: "bg-yellow-500/10 border-yellow-500/20",
    failing: "bg-red-500/10 border-red-500/20",
  };

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-white mb-3">Falsification Checks</h3>
      {checks.map((check) => (
        <div
          key={check.domainId}
          className={`rounded-lg border p-3 ${statusBg[check.status]}`}
        >
          <div className="flex items-start gap-2">
            <span className={`text-sm ${statusColors[check.status]}`}>
              {statusIcons[check.status]}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-white">
                  {DOMAINS[check.domainId]?.shortName}
                </span>
                <span className={`text-[10px] ${statusColors[check.status]}`}>
                  {check.status.toUpperCase()}
                </span>
              </div>
              <p className="text-[10px] text-[#8888a0] mt-0.5">{check.condition}</p>
              <p className="text-[10px] text-[#8888a0] mt-0.5 italic">{check.detail}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
