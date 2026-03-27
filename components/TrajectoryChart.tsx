"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ComposedChart,
} from "recharts";

interface DataPoint {
  time: number;
  score: number;
  model?: string;
}

interface TrajectoryChartProps {
  dataPoints: DataPoint[];
  fittedCurve: DataPoint[];
  color: string;
  unit: string;
  humanBaseline?: number | null;
  humanBaselineLabel?: string | null;
  direction?: "higher_is_better" | "lower_is_better";
  height?: number;
}

export default function TrajectoryChart({
  dataPoints,
  fittedCurve,
  color,
  unit,
  humanBaseline,
  humanBaselineLabel,
  direction = "higher_is_better",
  height = 300,
}: TrajectoryChartProps) {
  const allScores = [...dataPoints.map((d) => d.score), ...fittedCurve.map((d) => d.score)];
  if (humanBaseline) allScores.push(humanBaseline);

  const yMin = Math.min(...allScores) * 0.9;
  const yMax = Math.max(...allScores) * 1.1;

  const formatTime = (t: number) => {
    const year = Math.floor(t);
    const month = Math.round((t - year) * 12);
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${monthNames[month] || "Jan"} ${year}`;
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const data = payload[0].payload;
    return (
      <div className="rounded-lg border border-[#2a2a3e] bg-[#1a1a2e] px-3 py-2 shadow-xl">
        <p className="text-xs text-[#8888a0]">{formatTime(data.time)}</p>
        <p className="text-sm font-bold text-white">
          {direction === "lower_is_better" ? "$" : ""}
          {data.score?.toFixed(2)}
          {direction !== "lower_is_better" ? ` ${unit}` : ` ${unit}`}
        </p>
        {data.model && <p className="text-xs text-[#8888a0]">{data.model}</p>}
      </div>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
        <XAxis
          dataKey="time"
          type="number"
          domain={["dataMin - 0.5", "dataMax + 0.5"]}
          tickFormatter={(t) => Math.floor(t).toString()}
          stroke="#8888a0"
          tick={{ fontSize: 11 }}
        />
        <YAxis
          domain={direction === "lower_is_better" ? [yMin, yMax] : [yMin, yMax]}
          tickFormatter={(v) => v.toFixed(direction === "lower_is_better" ? 2 : 0)}
          stroke="#8888a0"
          tick={{ fontSize: 11 }}
          reversed={direction === "lower_is_better"}
        />
        <Tooltip content={<CustomTooltip />} />

        {humanBaseline != null && (
          <ReferenceLine
            y={humanBaseline}
            stroke="#f03e3e"
            strokeDasharray="5 5"
            label={{
              value: humanBaselineLabel || `Human: ${humanBaseline}`,
              position: "right",
              fill: "#f03e3e",
              fontSize: 10,
            }}
          />
        )}

        {/* Fitted curve */}
        <Line
          data={fittedCurve}
          type="monotone"
          dataKey="score"
          stroke={color}
          strokeWidth={2}
          strokeOpacity={0.4}
          dot={false}
          strokeDasharray="6 3"
          name="Fitted Model"
        />

        {/* Actual data points */}
        <Line
          data={dataPoints}
          type="monotone"
          dataKey="score"
          stroke={color}
          strokeWidth={2}
          dot={{ r: 4, fill: color, stroke: "#1a1a2e", strokeWidth: 2 }}
          activeDot={{ r: 6, fill: color }}
          name="Observed"
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
