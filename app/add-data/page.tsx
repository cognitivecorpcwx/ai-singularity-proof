"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { DOMAINS, DOMAIN_IDS } from "@/lib/domains";

export default function AddDataPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-[#8888a0]">Loading...</div>}>
      <AddDataForm />
    </Suspense>
  );
}

function AddDataForm() {
  const searchParams = useSearchParams();
  const defaultDomain = searchParams.get("domain") || "";

  const [domainId, setDomainId] = useState(defaultDomain);
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [month, setMonth] = useState((new Date().getMonth() + 1).toString());
  const [score, setScore] = useState("");
  const [model, setModel] = useState("");
  const [source, setSource] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setResult(null);

    const time = parseInt(year) + (parseInt(month) - 1) / 12;

    try {
      const res = await fetch("/api/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domainId,
          time: Math.round(time * 100) / 100,
          score: parseFloat(score),
          model: model || "Unknown",
          source: source || "Manual Entry",
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setResult({ success: true, message: "Data point added successfully! Re-analyze to see updated fits." });
        setScore("");
        setModel("");
        setSource("");
      } else {
        setResult({ success: false, message: data.error || "Failed to add data point" });
      }
    } catch (err) {
      setResult({ success: false, message: "Network error" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/" className="text-[#8888a0] hover:text-white transition-colors">&larr; Back</Link>
        <h1 className="text-2xl font-bold text-white">Add Data Point</h1>
      </div>

      <div className="card">
        <p className="text-sm text-[#8888a0] mb-6">
          Add a new benchmark result to test the singularity thesis. Each new data point
          recalibrates the curve fits and acceleration tests.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Domain */}
          <div>
            <label className="block text-xs text-[#8888a0] mb-1">Domain</label>
            <select
              value={domainId}
              onChange={(e) => setDomainId(e.target.value)}
              required
              className="w-full rounded-lg border border-[#2a2a3e] bg-[#12121a] px-3 py-2 text-sm text-white focus:border-[#4c6ef5] focus:outline-none"
            >
              <option value="">Select domain...</option>
              {DOMAIN_IDS.map((id) => (
                <option key={id} value={id}>
                  {DOMAINS[id].shortName}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[#8888a0] mb-1">Year</label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                min="2020"
                max="2030"
                required
                className="w-full rounded-lg border border-[#2a2a3e] bg-[#12121a] px-3 py-2 text-sm text-white focus:border-[#4c6ef5] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-[#8888a0] mb-1">Month</label>
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full rounded-lg border border-[#2a2a3e] bg-[#12121a] px-3 py-2 text-sm text-white focus:border-[#4c6ef5] focus:outline-none"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][i]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Score */}
          <div>
            <label className="block text-xs text-[#8888a0] mb-1">
              Score {domainId && DOMAINS[domainId] ? `(${DOMAINS[domainId].unit})` : ""}
            </label>
            <input
              type="number"
              step="any"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              required
              placeholder={domainId === "cost" ? "e.g., 0.02" : "e.g., 95.5"}
              className="w-full rounded-lg border border-[#2a2a3e] bg-[#12121a] px-3 py-2 text-sm text-white focus:border-[#4c6ef5] focus:outline-none"
            />
          </div>

          {/* Model */}
          <div>
            <label className="block text-xs text-[#8888a0] mb-1">Model Name</label>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="e.g., GPT-5, Claude 4, Gemini 4"
              className="w-full rounded-lg border border-[#2a2a3e] bg-[#12121a] px-3 py-2 text-sm text-white focus:border-[#4c6ef5] focus:outline-none"
            />
          </div>

          {/* Source */}
          <div>
            <label className="block text-xs text-[#8888a0] mb-1">Source</label>
            <input
              type="text"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="e.g., Papers with Code, Official API"
              className="w-full rounded-lg border border-[#2a2a3e] bg-[#12121a] px-3 py-2 text-sm text-white focus:border-[#4c6ef5] focus:outline-none"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-[#4c6ef5] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#4263eb] transition-colors disabled:opacity-50"
          >
            {submitting ? "Adding..." : "Add Data Point"}
          </button>
        </form>

        {result && (
          <div className={`mt-4 p-3 rounded-lg text-sm ${
            result.success ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
            "bg-red-500/10 text-red-400 border border-red-500/20"
          }`}>
            {result.message}
          </div>
        )}
      </div>

      {/* Quick Reference */}
      <div className="card">
        <h2 className="text-sm font-semibold text-white mb-3">Data Sources Reference</h2>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between text-[#8888a0]">
            <span>MMLU / HumanEval</span>
            <span className="text-white">paperswithcode.com</span>
          </div>
          <div className="flex justify-between text-[#8888a0]">
            <span>GPQA Diamond</span>
            <span className="text-white">Artificial Analysis / model cards</span>
          </div>
          <div className="flex justify-between text-[#8888a0]">
            <span>SWE-bench</span>
            <span className="text-white">swebench.com</span>
          </div>
          <div className="flex justify-between text-[#8888a0]">
            <span>ARC-AGI-2</span>
            <span className="text-white">arcprize.org</span>
          </div>
          <div className="flex justify-between text-[#8888a0]">
            <span>Cost / Token</span>
            <span className="text-white">API pricing pages</span>
          </div>
          <div className="flex justify-between text-[#8888a0]">
            <span>Training Compute</span>
            <span className="text-white">epochai.org</span>
          </div>
        </div>
      </div>
    </div>
  );
}
