export type PenetrationLevel = "Very Low" | "Low" | "Low-Moderate" | "Moderate" | "Moderate-High" | "High";

export interface LifecyclePhase {
  id: string;
  name: string;
  description: string;
}

export const LIFECYCLE_PHASES: LifecyclePhase[] = [
  { id: "conceive", name: "Conceive", description: "Programming, feasibility, site selection" },
  { id: "design", name: "Design", description: "Architecture, engineering, specification" },
  { id: "construct", name: "Construct", description: "Procurement, building, commissioning" },
  { id: "operate", name: "Operate", description: "Facility management, energy, occupant services" },
  { id: "maintain", name: "Maintain", description: "Preventive/reactive maintenance, capital planning" },
  { id: "renovate", name: "Renovate", description: "Adaptive reuse, retrofit, repositioning" },
  { id: "demolish", name: "Demolish", description: "Deconstruction, material recovery, remediation" },
];

export interface Stakeholder {
  id: string;
  name: string;
  lifecycleExposure: string[];
  aiPenetration: PenetrationLevel;
  primaryDomains: string[];  // domain IDs from DOMAINS
  governanceGap: string;
  keyImpact: string;
  governanceFrameworks: string[];
}

export const STAKEHOLDERS: Stakeholder[] = [
  {
    id: "owners",
    name: "Building Owners & Investors",
    lifecycleExposure: ["conceive", "design", "construct", "operate", "maintain", "renovate", "demolish"],
    aiPenetration: "Moderate",
    primaryDomains: ["mmlu", "cost", "compute"],
    governanceGap: "No structured way to evaluate AI systems making consequential building decisions without audit trails",
    keyImpact: "AI financial modeling, lease analysis, portfolio risk assessment at/beyond human expert capability",
    governanceFrameworks: ["BAGI", "AGRF"],
  },
  {
    id: "architects",
    name: "Architects & Design Firms",
    lifecycleExposure: ["conceive", "design", "renovate"],
    aiPenetration: "High",
    primaryDomains: ["mmlu", "arcagi2", "swebench"],
    governanceGap: "Need XAI on every design decision affecting life safety, accessibility, or structural integrity",
    keyImpact: "Generative design tools produce viable massing faster than humans; AI code-compliance checking approaches plan reviewer accuracy",
    governanceFrameworks: ["Building Constitution", "GATE"],
  },
  {
    id: "engineers",
    name: "Engineering Firms (MEP, Structural, Civil)",
    lifecycleExposure: ["design", "construct", "renovate"],
    aiPenetration: "Moderate-High",
    primaryDomains: ["mmlu", "humaneval", "compute"],
    governanceGap: "Professional liability requires human-in-the-loop verification for AI-assisted calculations",
    keyImpact: "AI matches junior engineer performance on structural analysis, HVAC load calculations, electrical distribution",
    governanceFrameworks: ["Building Constitution", "HMM"],
  },
  {
    id: "contractors",
    name: "General Contractors & CMs",
    lifecycleExposure: ["construct"],
    aiPenetration: "Low-Moderate",
    primaryDomains: ["cost", "arcagi2"],
    governanceGap: "Safety-affecting AI requires strongest governance; bias critical for facial recognition and productivity monitoring",
    keyImpact: "Construction robotics emerging (Spot, Canvas, Dusty Robotics); AI scheduling and logistics optimization",
    governanceFrameworks: ["AIRS", "HMM"],
  },
  {
    id: "facility_managers",
    name: "Facility Managers",
    lifecycleExposure: ["operate", "maintain"],
    aiPenetration: "High",
    primaryDomains: ["mmlu", "swebench", "cost"],
    governanceGap: "Most exposed stakeholder — AI making thousands of autonomous decisions daily with no explainability framework",
    keyImpact: "BMS optimization, predictive maintenance, energy management at/beyond human expert capability",
    governanceFrameworks: ["Building Constitution", "BAGI", "HMM", "AIRS"],
  },
  {
    id: "property_managers",
    name: "Property & Asset Managers",
    lifecycleExposure: ["operate", "renovate", "demolish"],
    aiPenetration: "Moderate",
    primaryDomains: ["cost", "mmlu"],
    governanceGap: "Tenant data privacy critical — need data governance frameworks for collection, retention, consent",
    keyImpact: "AI reshaping tenant expectations, lease structures, operating expenses; smart building amenities becoming baseline",
    governanceFrameworks: ["BAGI", "AGRF"],
  },
  {
    id: "bas_vendors",
    name: "Building Automation Vendors",
    lifecycleExposure: ["design", "construct", "operate"],
    aiPenetration: "High",
    primaryDomains: ["swebench", "compute", "cost"],
    governanceGap: "No major BAS vendor has governance framework equivalent to Building Constitution — structural market gap",
    keyImpact: "Platforms learning from deployed data improving autonomously; governance maturity as market tiebreaker",
    governanceFrameworks: ["Building Constitution", "GATE", "BAGI"],
  },
  {
    id: "energy_managers",
    name: "Energy & Sustainability Officers",
    lifecycleExposure: ["design", "operate", "renovate"],
    aiPenetration: "Moderate-High",
    primaryDomains: ["cost", "mmlu", "gpqa"],
    governanceGap: "Autonomous load shedding and pre-cooling need transparent logic and human override",
    keyImpact: "DeepMind-style 30% energy reduction; 10-25% HVAC optimization at building scale documented",
    governanceFrameworks: ["Building Constitution", "HMM"],
  },
  {
    id: "tenants",
    name: "Tenants & Occupants",
    lifecycleExposure: ["operate"],
    aiPenetration: "Moderate",
    primaryDomains: ["mmlu", "arcagi2"],
    governanceGap: "Least visibility, most exposure — cannot opt out of HVAC algorithms; movements tracked without awareness",
    keyImpact: "Smart elevators, circadian lighting, adaptive HVAC, automated concierge — largely invisible AI",
    governanceFrameworks: ["Building Constitution", "AIRS"],
  },
  {
    id: "regulators",
    name: "Regulators & Code Officials",
    lifecycleExposure: ["design", "construct", "operate"],
    aiPenetration: "Low",
    primaryDomains: ["mmlu", "cost"],
    governanceGap: "Building codes need AI chapter; gap between AI capabilities and regulatory frameworks widening",
    keyImpact: "AI-assisted plan review piloted; technology matches junior reviewer accuracy on routine checks",
    governanceFrameworks: ["Building Constitution", "BAGI", "GATE"],
  },
  {
    id: "insurance",
    name: "Insurance Underwriters",
    lifecycleExposure: ["conceive", "design", "construct", "operate", "maintain", "renovate", "demolish"],
    aiPenetration: "Low-Moderate",
    primaryDomains: ["cost", "compute"],
    governanceGap: "AI simultaneously reducing insurable risk and creating new liability categories (algorithmic, cybersecurity)",
    keyImpact: "BAGI scoring provides quantifiable input to risk models; governed buildings should command lower premiums",
    governanceFrameworks: ["BAGI", "AIRS"],
  },
  {
    id: "lenders",
    name: "Lenders & Capital Markets",
    lifecycleExposure: ["conceive", "operate", "demolish"],
    aiPenetration: "Low-Moderate",
    primaryDomains: ["cost", "mmlu"],
    governanceGap: "Need standardized AI governance metrics (BAGI) for loan underwriting and ESG-linked financing",
    keyImpact: "AI-driven operating efficiency affecting refinancing spreads; governance maturity as next pricing variable",
    governanceFrameworks: ["BAGI", "AGRF"],
  },
  {
    id: "digital_twin",
    name: "Digital Twin Providers",
    lifecycleExposure: ["design", "construct", "operate"],
    aiPenetration: "High",
    primaryDomains: ["swebench", "compute", "gpqa"],
    governanceGap: "Twins autonomously adjusting operations need most rigorous governance — every decision logged and reversible",
    keyImpact: "Primary vehicle for AI self-improvement; twins ingesting real-time data, comparing predicted vs actual, adjusting autonomously",
    governanceFrameworks: ["Building Constitution", "GATE", "HMM", "AIRS"],
  },
  {
    id: "workforce",
    name: "Workforce Development & HR",
    lifecycleExposure: ["conceive", "design", "construct", "operate", "maintain", "renovate", "demolish"],
    aiPenetration: "Moderate",
    primaryDomains: ["mmlu", "cost", "humaneval"],
    governanceGap: "AI affecting hiring, scheduling, performance eval must be governed for bias; CWO framework needed",
    keyImpact: "IMF 60% job exposure maps to specific roles: BMS operators, energy auditors, plan reviewers, maintenance schedulers",
    governanceFrameworks: ["AGRF", "Building Constitution"],
  },
];

export const PENETRATION_COLORS: Record<PenetrationLevel, string> = {
  "Very Low": "#2a2a3e",
  "Low": "#3b3b5c",
  "Low-Moderate": "#4c4c7a",
  "Moderate": "#5c6ef5",
  "Moderate-High": "#7950f2",
  "High": "#be4bdb",
};

export const GOVERNANCE_FRAMEWORKS = [
  { id: "bc", name: "Building Constitution", focus: "Ethical AI principles (XAI, HITL, Bias Mitigation)" },
  { id: "bagi", name: "BAGI", focus: "Quantified governance maturity scoring" },
  { id: "hmm", name: "HMM", focus: "Human oversight levels for AI decisions" },
  { id: "agrf", name: "AGRF", focus: "Organizational readiness assessment" },
  { id: "gate", name: "GATE", focus: "Technology selection governance" },
  { id: "airs", name: "AIRS", focus: "Incident response when AI systems fail" },
];
