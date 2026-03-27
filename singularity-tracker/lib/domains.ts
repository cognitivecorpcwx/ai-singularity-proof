export interface DomainConfig {
  id: string;
  name: string;
  shortName: string;
  unit: string;
  direction: "higher_is_better" | "lower_is_better";
  thesisClaim: string;
  falsificationCondition: string;
  color: string;
  icon: string;
}

export const DOMAINS: Record<string, DomainConfig> = {
  mmlu: {
    id: "mmlu",
    name: "MMLU (Best Model Score)",
    shortName: "MMLU",
    unit: "% Accuracy",
    direction: "higher_is_better",
    thesisClaim: "AI exceeds human expert performance (89.8%) on massive multitask language understanding",
    falsificationCondition: "Best score drops below 85% without benchmark redesign",
    color: "#4c6ef5",
    icon: "brain",
  },
  gpqa: {
    id: "gpqa",
    name: "GPQA Diamond (Best Model)",
    shortName: "GPQA Diamond",
    unit: "% Accuracy",
    direction: "higher_is_better",
    thesisClaim: "AI surpasses PhD-level experts (69.7%) on graduate-level science questions",
    falsificationCondition: "Scores plateau below 95% for >6 months",
    color: "#7950f2",
    icon: "flask",
  },
  swebench: {
    id: "swebench",
    name: "SWE-bench (Best Agent)",
    shortName: "SWE-bench",
    unit: "% Resolved",
    direction: "higher_is_better",
    thesisClaim: "AI agents autonomously resolve real-world software engineering tasks at scale",
    falsificationCondition: "Resolution rate declines or stalls below 85%",
    color: "#f03e3e",
    icon: "code",
  },
  humaneval: {
    id: "humaneval",
    name: "HumanEval (Best Model)",
    shortName: "HumanEval",
    unit: "% pass@1",
    direction: "higher_is_better",
    thesisClaim: "AI code generation approaching near-perfect accuracy on programming tasks",
    falsificationCondition: "Scores decline from current ~96%",
    color: "#e8590c",
    icon: "terminal",
  },
  arcagi2: {
    id: "arcagi2",
    name: "ARC-AGI-2 (Best System)",
    shortName: "ARC-AGI-2",
    unit: "% Score",
    direction: "higher_is_better",
    thesisClaim: "AI demonstrates rapid progress on novel reasoning tasks designed to resist memorization",
    falsificationCondition: "Progress stalls below 80% for >6 months",
    color: "#20c997",
    icon: "puzzle",
  },
  cost: {
    id: "cost",
    name: "Cost: GPT-3.5 Equivalent ($/M tokens)",
    shortName: "Cost Efficiency",
    unit: "$/M tokens",
    direction: "lower_is_better",
    thesisClaim: "1000x cost reduction in 3 years demonstrates exponential efficiency gains — the ONLY domain with statistically significant acceleration (p=0.008)",
    falsificationCondition: "$/M tokens stops declining or reverses",
    color: "#fab005",
    icon: "dollar",
  },
  compute: {
    id: "compute",
    name: "Training Compute (log10 FLOP)",
    shortName: "Training Compute",
    unit: "log10 FLOP",
    direction: "higher_is_better",
    thesisClaim: "Training compute continues exponential growth, enabling increasingly capable models",
    falsificationCondition: "Efficiency gains plateau (same FLOP for same quality)",
    color: "#868e96",
    icon: "cpu",
  },
};

export const DOMAIN_IDS = Object.keys(DOMAINS);

export type VerdictStatus = "SUPPORTED" | "MIXED" | "REFUTED";

export function getOverallVerdict(significantCount: number, totalDomains: number, fisherPValue: number): {
  status: VerdictStatus;
  label: string;
  description: string;
} {
  if (fisherPValue < 0.05 && significantCount >= Math.ceil(totalDomains / 2)) {
    return {
      status: "SUPPORTED",
      label: "Thesis Supported",
      description: "Combined statistical evidence supports acceleration across domains",
    };
  }
  if (significantCount === 0 && fisherPValue > 0.5) {
    return {
      status: "REFUTED",
      label: "Thesis Refuted",
      description: "No domain shows significant acceleration; combined test strongly fails",
    };
  }
  return {
    status: "MIXED",
    label: "Evidence Mixed",
    description: `${significantCount}/${totalDomains} domains show significant acceleration. Combined Fisher p=${fisherPValue.toFixed(3)}. S-curve fits are strong but acceleration is not uniform.`,
  };
}
