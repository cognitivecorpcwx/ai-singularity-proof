"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";

interface Technology {
  id: string;
  name: string;
  startYear: number;
  endYear: number;
  durationYears: number;
  metric: string;
  milestones: { year: number; pct: number; label: string }[];
  speedRelativeToAI: string;
  note: string;
}

interface HistoricalData {
  technologies: Technology[];
  caveat: string;
}

const TECH_COLORS: Record<string, string> = {
  electrification: "#868e96",
  internet: "#4c6ef5",
  smartphones: "#20c997",
  ai_capability: "#f03e3e",
  ai_enterprise: "#fab005",
};

export default function HistoryPage() {
  const [data, setData] = useState<HistoricalData | null>(null);

  useEffect(() => {
    fetch("/api/history")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {});
  }, []);

  // Normalize all technologies to years-from-start for comparison
  const normalizedData: { yearOffset: number; [key: string]: number | undefined }[] = [];
  if (data) {
    for (let offset = 0; offset <= 60; offset++) {
      const point: any = { yearOffset: offset };
      for (const tech of data.technologies) {
        const milestone = tech.milestones.find((m) => m.year - tech.startYear <= offset);
        const nextMilestone = tech.milestones.find((m) => m.year - tech.startYear > offset);
        // Interpolate
        if (milestone) {
          const startOffset = milestone.year - tech.startYear;
          if (nextMilestone) {
            const endOffset = nextMilestone.year - tech.startYear;
            const frac = (offset - startOffset) / (endOffset - startOffset);
            point[tech.id] = milestone.pct + frac * (nextMilestone.pct - milestone.pct);
          } else {
            point[tech.id] = milestone.pct;
          }
        }
      }
      normalizedData.push(point);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/" className="text-[#8888a0] hover:text-white transition-colors">&larr; Back</Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Historical Comparison</h1>
          <p className="text-sm text-[#8888a0] mt-1">
            Technology adoption speeds compared: how fast did each reach 10% to 90% of its range?
          </p>
        </div>
      </div>

      {/* Caveat banner */}
      {data && (
        <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/5 p-4">
          <div className="flex items-start gap-3">
            <span className="text-yellow-400 text-lg">{"\u26A0"}</span>
            <div>
              <div className="text-xs font-semibold text-yellow-400 mb-1">METHODOLOGICAL CAVEAT (Adversarial Review #2)</div>
              <p className="text-xs text-[#8888a0]">{data.caveat}</p>
            </div>
          </div>
        </div>
      )}

      {/* Normalized comparison chart */}
      <div className="card">
        <h2 className="text-sm font-semibold text-white mb-4">Normalized Adoption Speed (Years from Start)</h2>
        {data && (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={normalizedData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
              <XAxis
                dataKey="yearOffset"
                stroke="#8888a0"
                tick={{ fontSize: 11 }}
                label={{ value: "Years from Start", position: "bottom", fill: "#8888a0", fontSize: 11 }}
              />
              <YAxis
                domain={[0, 100]}
                stroke="#8888a0"
                tick={{ fontSize: 11 }}
                label={{ value: "% of Range", angle: -90, position: "insideLeft", fill: "#8888a0", fontSize: 11 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1a1a2e",
                  border: "1px solid #2a2a3e",
                  borderRadius: "8px",
                  fontSize: "11px",
                }}
                labelFormatter={(v) => `Year ${v}`}
                formatter={(value: any, name: any) => {
                  const tech = data.technologies.find((t) => t.id === String(name));
                  return [`${Number(value).toFixed(1)}%`, tech?.name || String(name)];
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: "11px" }}
                formatter={(value) => {
                  const tech = data.technologies.find((t) => t.id === value);
                  return tech?.name || value;
                }}
              />
              {data.technologies.map((tech) => (
                <Line
                  key={tech.id}
                  type="monotone"
                  dataKey={tech.id}
                  stroke={TECH_COLORS[tech.id] || "#8888a0"}
                  strokeWidth={tech.id.startsWith("ai") ? 3 : 2}
                  strokeDasharray={tech.id === "ai_enterprise" ? "6 3" : undefined}
                  dot={false}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Technology cards */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.technologies.map((tech) => (
            <div key={tech.id} className="card">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: TECH_COLORS[tech.id] }} />
                <h3 className="text-sm font-semibold text-white">{tech.name}</h3>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
                <div>
                  <span className="text-[#8888a0]">Duration</span>
                  <div className="text-white font-bold">{tech.durationYears} years</div>
                </div>
                <div>
                  <span className="text-[#8888a0]">Speed vs AI</span>
                  <div className="text-white font-bold">{tech.speedRelativeToAI}</div>
                </div>
              </div>
              <div className="text-[10px] text-[#8888a0] mb-2">{tech.metric}</div>
              <p className="text-[10px] text-[#8888a0] italic border-t border-[#2a2a3e] pt-2 mt-2">
                {tech.note}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Defensible claim */}
      <div className="card">
        <h2 className="text-sm font-semibold text-white mb-3">Defensible Formulation</h2>
        <div className="p-3 rounded-lg bg-[#12121a]">
          <p className="text-xs text-[#8888a0] italic">
            &ldquo;AI benchmark capability matured from 10% to 90% of its range in approximately 3 years — faster than
            any prior technology&apos;s capability curve, though this comparison measures software test performance, not
            physical infrastructure deployment.&rdquo;
          </p>
          <p className="text-[10px] text-[#8888a0] mt-2">
            — Revised claim after Adversarial Review #2 acceptance
          </p>
        </div>
      </div>
    </div>
  );
}
