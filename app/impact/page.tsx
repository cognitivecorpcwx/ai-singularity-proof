import Link from "next/link";
import { STAKEHOLDERS, LIFECYCLE_PHASES, PENETRATION_COLORS, GOVERNANCE_FRAMEWORKS } from "@/lib/impact";
import { DOMAINS } from "@/lib/domains";

export default function ImpactPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/" className="text-[#8888a0] hover:text-white transition-colors">&larr; Back</Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Built Environment Impact Map</h1>
          <p className="text-sm text-[#8888a0] mt-1">
            14 stakeholder categories mapped across 7 building lifecycle phases.
            If AI has entered a phase transition, every building is already an AI-mediated environment.
          </p>
        </div>
      </div>

      {/* Stakeholder × Lifecycle Matrix */}
      <div className="card overflow-x-auto">
        <h2 className="text-sm font-semibold text-white mb-4">Stakeholder Lifecycle Exposure</h2>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-[#2a2a3e]">
              <th className="text-left py-2 pr-3 text-[#8888a0] font-medium min-w-[180px]">Stakeholder</th>
              <th className="text-center py-2 px-1 text-[#8888a0] font-medium min-w-[70px]">Penetration</th>
              {LIFECYCLE_PHASES.map((phase) => (
                <th key={phase.id} className="text-center py-2 px-1 text-[#8888a0] font-medium min-w-[70px]">
                  {phase.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {STAKEHOLDERS.map((stakeholder) => (
              <tr key={stakeholder.id} className="border-b border-[#2a2a3e]/50 hover:bg-[#2a2a3e]/20">
                <td className="py-2 pr-3">
                  <div className="text-white font-medium">{stakeholder.name}</div>
                </td>
                <td className="py-2 px-1 text-center">
                  <span
                    className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium"
                    style={{
                      backgroundColor: PENETRATION_COLORS[stakeholder.aiPenetration] + "40",
                      color: stakeholder.aiPenetration === "High" ? "#be4bdb" :
                             stakeholder.aiPenetration === "Moderate-High" ? "#7950f2" :
                             stakeholder.aiPenetration === "Moderate" ? "#5c6ef5" : "#8888a0",
                    }}
                  >
                    {stakeholder.aiPenetration}
                  </span>
                </td>
                {LIFECYCLE_PHASES.map((phase) => {
                  const exposed = stakeholder.lifecycleExposure.includes(phase.id);
                  return (
                    <td key={phase.id} className="py-2 px-1 text-center">
                      {exposed ? (
                        <div
                          className="w-6 h-6 mx-auto rounded"
                          style={{ backgroundColor: PENETRATION_COLORS[stakeholder.aiPenetration] + "60" }}
                          title={`${stakeholder.name} active in ${phase.name}`}
                        />
                      ) : (
                        <div className="w-6 h-6 mx-auto rounded bg-[#1a1a2e]" />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Stakeholder Detail Cards */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Stakeholder Analysis</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {STAKEHOLDERS.map((stakeholder) => (
            <div key={stakeholder.id} className="card">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-sm font-semibold text-white">{stakeholder.name}</h3>
                <span
                  className="badge text-[10px]"
                  style={{
                    backgroundColor: PENETRATION_COLORS[stakeholder.aiPenetration] + "30",
                    color: stakeholder.aiPenetration === "High" ? "#be4bdb" : "#8888a0",
                  }}
                >
                  {stakeholder.aiPenetration} AI Penetration
                </span>
              </div>

              <p className="text-xs text-[#8888a0] mb-3">{stakeholder.keyImpact}</p>

              <div className="mb-3">
                <div className="text-[10px] text-red-400 font-medium mb-1">GOVERNANCE GAP</div>
                <p className="text-[11px] text-[#8888a0]">{stakeholder.governanceGap}</p>
              </div>

              <div className="flex flex-wrap gap-1 mb-2">
                <span className="text-[10px] text-[#8888a0] mr-1">Domains:</span>
                {stakeholder.primaryDomains.map((d) => (
                  <Link key={d} href={`/domain/${d}`}>
                    <span
                      className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium hover:opacity-80"
                      style={{ backgroundColor: DOMAINS[d]?.color + "30", color: DOMAINS[d]?.color }}
                    >
                      {DOMAINS[d]?.shortName}
                    </span>
                  </Link>
                ))}
              </div>

              <div className="flex flex-wrap gap-1">
                <span className="text-[10px] text-[#8888a0] mr-1">Frameworks:</span>
                {stakeholder.governanceFrameworks.map((f) => (
                  <span key={f} className="badge text-[10px] bg-[#2a2a3e] text-[#8888a0]">{f}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Governance Frameworks */}
      <div className="card">
        <h2 className="text-sm font-semibold text-white mb-4">Governance Frameworks</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {GOVERNANCE_FRAMEWORKS.map((fw) => (
            <div key={fw.id} className="p-3 rounded-lg bg-[#12121a]">
              <div className="text-xs font-bold text-[#4c6ef5] mb-1">{fw.name}</div>
              <p className="text-[11px] text-[#8888a0]">{fw.focus}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-3 border-t border-[#2a2a3e]">
          <p className="text-[10px] text-[#8888a0]">
            <span className="text-red-400 font-medium">CENTRAL FINDING:</span> The built environment has no standardized
            AI governance framework, unlike healthcare (FDA), financial services (SEC), and autonomous vehicles (NHTSA).
            These frameworks address that structural gap.
          </p>
        </div>
      </div>
    </div>
  );
}
