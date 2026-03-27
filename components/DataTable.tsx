"use client";

interface DataPoint {
  time: number;
  score: number;
  model: string;
  source: string;
}

interface DataTableProps {
  dataPoints: DataPoint[];
  unit: string;
  direction: "higher_is_better" | "lower_is_better";
}

export default function DataTable({ dataPoints, unit, direction }: DataTableProps) {
  const formatTime = (t: number) => {
    const year = Math.floor(t);
    const month = Math.round((t - year) * 12);
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${monthNames[month] || "Jan"} ${year}`;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-[#2a2a3e] text-[#8888a0]">
            <th className="text-left py-2 pr-4">Date</th>
            <th className="text-left py-2 pr-4">Model</th>
            <th className="text-right py-2 pr-4">Score</th>
            <th className="text-right py-2 pr-4">Change</th>
            <th className="text-left py-2">Source</th>
          </tr>
        </thead>
        <tbody>
          {dataPoints.map((point, i) => {
            const prev = i > 0 ? dataPoints[i - 1].score : null;
            const change = prev != null ? point.score - prev : null;
            const isPositive = direction === "lower_is_better"
              ? change != null && change < 0
              : change != null && change > 0;

            return (
              <tr key={i} className="border-b border-[#2a2a3e]/50 hover:bg-[#2a2a3e]/30">
                <td className="py-2 pr-4 text-[#8888a0]">{formatTime(point.time)}</td>
                <td className="py-2 pr-4 text-white">{point.model}</td>
                <td className="py-2 pr-4 text-right font-mono text-white">
                  {direction === "lower_is_better" ? "$" : ""}
                  {point.score.toFixed(direction === "lower_is_better" ? 2 : 1)}
                  {direction !== "lower_is_better" ? "%" : ""}
                </td>
                <td className={`py-2 pr-4 text-right font-mono ${
                  change == null ? "text-[#8888a0]" : isPositive ? "text-emerald-400" : "text-red-400"
                }`}>
                  {change == null ? "--" : `${change > 0 ? "+" : ""}${change.toFixed(1)}`}
                </td>
                <td className="py-2 text-[#8888a0]">{point.source}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
