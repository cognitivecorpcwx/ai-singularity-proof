"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import TrajectoryChart from "@/components/TrajectoryChart";
import AccelerationGauge from "@/components/AccelerationGauge";
import DataTable from "@/components/DataTable";
import { DOMAINS } from "@/lib/domains";

interface DomainPageData {
  domain: {
    name: string;
    shortName: string;
    unit: string;
    direction: "higher_is_better" | "lower_is_better";
    humanBaseline: number | null;
    humanBaselineLabel: string | null;
    dataPoints: { time: number; score: number; model: string; source: string }[];
  };
  analysis: {
    fits: { name: string; r2: number; aic: number; bic: number }[];
    bestModel: string;
    bestR2: number;
    fittedCurve: { time: number; score: number }[];
    acceleration: {
      pValue: number;
      tStatistic: number;
      significant: boolean;
      fractionAccelerating: number;
      meanAcceleration: number;
    };
  } | null;
}

export default function DomainPage() {
  const params = useParams();
  const domainId = params.id as string;
  const domainConfig = DOMAINS[domainId];

  const [data, setData] = useState<DomainPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [dataRes, analysisRes] = await Promise.all([
          fetch("/api/data"),
          fetch("/api/analyze"),
        ]);

        const allData = await dataRes.json();
        const analysis = await analysisRes.json();

        setData({
          domain: allData.domains[domainId],
          analysis: analysis.domains?.[domainId] || null,
        });
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [domainId]);

  if (!domainConfig) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl text-white mb-4">Domain Not Found</h1>
        <Link href="/" className="text-[#4c6ef5] hover:underline">Back to Dashboard</Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="text-[#8888a0]">Loading analysis...</div>
      </div>
    );
  }

  if (error || !data?.domain) {
    return (
      <div className="text-center py-20">
        <div className="text-red-400">{error || "No data available"}</div>
        <Link href="/" className="text-[#4c6ef5] hover:underline mt-4 inline-block">Back to Dashboard</Link>
      </div>
    );
  }

  const { domain, analysis } = data;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/" className="text-[#8888a0] hover:text-white transition-colors">&larr; Back</Link>
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: domainConfig.color }} />
          <h1 className="text-2xl font-bold text-white">{domainConfig.shortName}</h1>
        </div>
      </div>

      {/* Thesis Claim */}
      <div className="card">
        <div className="text-xs text-[#8888a0] mb-1">THESIS CLAIM</div>
        <p className="text-sm text-white">{domainConfig.thesisClaim}</p>
        <div className="mt-3 pt-3 border-t border-[#2a2a3e]">
          <div className="text-xs text-red-400 font-medium">FALSIFIES IF:</div>
          <p className="text-xs text-[#8888a0] mt-1">{domainConfig.falsificationCondition}</p>
        </div>
      </div>

      {/* Chart */}
      {analysis && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white">Trajectory + Fitted Model</h2>
            <div className="flex items-center gap-4 text-xs text-[#8888a0]">
              <span className="flex items-center gap-1">
                <span className="inline-block w-3 h-0.5 rounded" style={{ backgroundColor: domainConfig.color }} />
                Observed
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block w-3 h-0.5 rounded border-dashed border-t-2" style={{ borderColor: domainConfig.color }} />
                {analysis.bestModel} Fit (R&sup2;={analysis.bestR2.toFixed(4)})
              </span>
            </div>
          </div>
          <TrajectoryChart
            dataPoints={domain.dataPoints}
            fittedCurve={analysis.fittedCurve}
            color={domainConfig.color}
            unit={domain.unit}
            humanBaseline={domain.humanBaseline}
            humanBaselineLabel={domain.humanBaselineLabel}
            direction={domain.direction}
            height={400}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Model Comparison */}
        {analysis && (
          <div className="card">
            <h2 className="text-sm font-semibold text-white mb-4">Model Comparison</h2>
            <div className="space-y-2">
              {analysis.fits.map((fit) => (
                <div
                  key={fit.name}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    fit.name === analysis.bestModel ? "bg-[#4c6ef5]/10 border border-[#4c6ef5]/30" : "bg-[#12121a]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {fit.name === analysis.bestModel && (
                      <span className="text-[#4c6ef5] text-xs">BEST</span>
                    )}
                    <span className="text-xs text-white">{fit.name}</span>
                  </div>
                  <div className="flex gap-4 text-xs">
                    <div>
                      <span className="text-[#8888a0]">R&sup2; </span>
                      <span className="font-mono text-white">{(fit.r2 ?? 0).toFixed(4)}</span>
                    </div>
                    <div>
                      <span className="text-[#8888a0]">AIC </span>
                      <span className="font-mono text-white">{(fit.aic ?? 0).toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Acceleration Test */}
        {analysis && (
          <div className="card">
            <h2 className="text-sm font-semibold text-white mb-4">Acceleration Test</h2>
            <p className="text-xs text-[#8888a0] mb-4">
              H&#8320;: No acceleration (deceleration). H&#8321;: Positive acceleration.
              One-sided t-test on second differences.
            </p>
            <AccelerationGauge
              pValue={analysis.acceleration.pValue}
              tStatistic={analysis.acceleration.tStatistic}
              fractionAccelerating={analysis.acceleration.fractionAccelerating}
              significant={analysis.acceleration.significant}
            />
          </div>
        )}
      </div>

      {/* Data Table */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-white">Raw Data Points</h2>
          <Link
            href={`/add-data?domain=${domainId}`}
            className="text-xs text-[#4c6ef5] hover:underline"
          >
            + Add Data Point
          </Link>
        </div>
        <DataTable
          dataPoints={domain.dataPoints}
          unit={domain.unit}
          direction={domain.direction}
        />
      </div>
    </div>
  );
}
