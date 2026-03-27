"use client";

interface AccelerationGaugeProps {
  pValue: number;
  tStatistic: number;
  fractionAccelerating: number;
  significant: boolean;
}

export default function AccelerationGauge({
  pValue,
  tStatistic,
  fractionAccelerating,
  significant,
}: AccelerationGaugeProps) {
  // Map p-value to position on gauge (0 = strong acceleration, 1 = deceleration)
  const position = Math.min(pValue, 1);
  const percentage = (1 - position) * 100;

  const getColor = () => {
    if (pValue < 0.05) return "#20c997";
    if (pValue < 0.10) return "#fab005";
    if (pValue < 0.30) return "#e8590c";
    return "#f03e3e";
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between text-xs text-[#8888a0]">
        <span>Decelerating</span>
        <span>Accelerating</span>
      </div>

      {/* Gauge bar */}
      <div className="relative h-3 rounded-full bg-[#2a2a3e] overflow-hidden">
        <div
          className="absolute left-0 top-0 h-full rounded-full transition-all duration-500"
          style={{
            width: `${percentage}%`,
            backgroundColor: getColor(),
          }}
        />
        {/* Significance threshold markers */}
        <div
          className="absolute top-0 h-full w-px bg-white/30"
          style={{ left: "90%" }}
          title="p = 0.10"
        />
        <div
          className="absolute top-0 h-full w-px bg-white/50"
          style={{ left: "95%" }}
          title="p = 0.05"
        />
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs">
        <div>
          <span className="text-[#8888a0]">p-value</span>
          <div className={`font-mono font-bold ${significant ? "text-emerald-400" : "text-white"}`}>
            {pValue.toFixed(4)}
          </div>
        </div>
        <div>
          <span className="text-[#8888a0]">t-statistic</span>
          <div className="font-mono font-bold text-white">{tStatistic.toFixed(3)}</div>
        </div>
        <div>
          <span className="text-[#8888a0]">Accelerating</span>
          <div className="font-mono font-bold text-white">{(fractionAccelerating * 100).toFixed(0)}%</div>
        </div>
      </div>

      {significant && (
        <div className="badge-green text-xs">
          Statistically Significant (p &lt; 0.05)
        </div>
      )}
    </div>
  );
}
