export type EvidenceStrength = "Strong" | "Moderate" | "Mixed";
export type AdversarialVerdict = "Passing" | "Insufficient" | "Failing";

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
  evidenceStrength: EvidenceStrength;
  adversarialVerdict: AdversarialVerdict;
  adversarialNote: string;
  supportingEvidence: string[];
  opposingEvidence: string[];
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
    evidenceStrength: "Strong",
    adversarialVerdict: "Insufficient",
    adversarialNote: "Frontier models show gaps on harder evaluations (GPT-5: 25.3% on Humanity's Last Exam). MMLU/MMLU-Pro conflation undermines trend claims.",
    supportingEvidence: [
      "91.4% exceeds human expert baseline of 89.8%",
      "Logarithmic fit (R²=0.942) shows sustained improvement",
      "Multiple independent models converge on similar scores",
    ],
    opposingEvidence: [
      "MMLU vs MMLU-Pro conflation across different benchmark difficulties",
      "Harder evaluations (Humanity's Last Exam) show 25.3% — far below parity",
      "Benchmark saturation may reflect test-set memorization, not capability",
    ],
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
    evidenceStrength: "Strong",
    adversarialVerdict: "Insufficient",
    adversarialNote: "Score misattribution corrected (Gemini 3 Pro, not GPT-5.1). Kendall's tau shows decelerating improvement (p=0.015).",
    supportingEvidence: [
      "94.1% far exceeds PhD panel baseline of 69.7%",
      "Logistic S-curve fit R²=0.9957 — strongest model fit",
      "Multiple models from different labs surpass human baseline",
    ],
    opposingEvidence: [
      "Kendall's tau shows decelerating improvement rate (p=0.015)",
      "S-curve approaching ceiling — saturation, not acceleration",
      "Original score misattributed to non-existent model (corrected)",
    ],
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
    evidenceStrength: "Strong",
    adversarialVerdict: "Passing",
    adversarialNote: "Strongest autonomous agency evidence. Verified vs unverified SWE-bench versions need distinction.",
    supportingEvidence: [
      "80.9% resolution rate on real GitHub issues",
      "Logistic S-curve fit R²=0.9977",
      "Rapid improvement: 2% to 81% in ~2 years",
    ],
    opposingEvidence: [
      "Kendall's tau shows decelerating improvement (p=0.035)",
      "Verified vs unverified benchmark versions inconsistently compared",
      "S-curve fit suggests approaching ceiling around 85-90%",
    ],
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
    evidenceStrength: "Strong",
    adversarialVerdict: "Passing",
    adversarialNote: "Near saturation at 96.3%. Kendall's tau shows deceleration (p=0.035) but this is expected near ceiling.",
    supportingEvidence: [
      "96.3% pass rate — approaching benchmark ceiling",
      "Logarithmic fit R²=0.987 shows consistent progress",
      "Multiple models from different labs achieve >90%",
    ],
    opposingEvidence: [
      "Kendall's tau shows decelerating improvement (p=0.035)",
      "Near-ceiling performance means diminishing returns inevitable",
      "HumanEval is relatively simple vs real-world coding tasks",
    ],
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
    evidenceStrength: "Moderate",
    adversarialVerdict: "Passing",
    adversarialNote: "Fastest improvement rate (55.4 pp/year). Human baseline is 100% by design — original parity claim was incorrect (corrected).",
    supportingEvidence: [
      "0% to 68.8% in ~14 months — fastest of any benchmark",
      "Logistic S-curve fit R²=0.9952",
      "Designed to resist memorization — genuine reasoning progress",
    ],
    opposingEvidence: [
      "Human baseline is 100% (by design), not 43% as originally claimed",
      "Only 6 data points — smallest dataset, weakest statistical power",
      "Short time span makes trend extrapolation unreliable",
    ],
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
    evidenceStrength: "Strong",
    adversarialVerdict: "Passing",
    adversarialNote: "Only domain with statistically significant acceleration. Cost efficiency improved but this measures economic competition, not intelligence.",
    supportingEvidence: [
      "1000x cost reduction: $20 to $0.02/M tokens in 3 years",
      "Logistic S-curve fit R²=0.9998 — best fit of any domain",
      "Only domain with significant acceleration (p=0.008)",
      "100% of intervals show accelerating cost decline",
    ],
    opposingEvidence: [
      "Cost reduction reflects market competition, not cognitive breakthrough",
      "Approaching floor — further 1000x reduction physically implausible",
      "API pricing is a business decision, not a pure capability metric",
    ],
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
    evidenceStrength: "Mixed",
    adversarialVerdict: "Failing",
    adversarialNote: "Benchmark improvement rates decelerated. S-curve fits suggest approaching ceilings, not unbounded growth. Domain downgraded from 7/7 to 6/7.",
    supportingEvidence: [
      "Logistic S-curve fit R²=0.9917",
      "142x parameter reduction for equivalent MMLU performance",
      "Capability density doubling every 3.5 months (Xiao et al.)",
    ],
    opposingEvidence: [
      "Acceleration test non-significant (p=0.314)",
      "S-curve approaching ceiling — consistent with maturation",
      "Paper overstates 'intelligence' when source measures parameter efficiency",
      "Domain downgraded to Mixed evidence in revised 6/7 scoring",
    ],
  },
};

export const DOMAIN_IDS = Object.keys(DOMAINS);

export type VerdictStatus = "SUPPORTED" | "MIXED" | "REFUTED";

export function getOverallVerdict(
  significantCount: number,
  totalDomains: number,
  fisherPValue: number,
  kendallDecelPValue?: number,
): {
  status: VerdictStatus;
  label: string;
  description: string;
} {
  // Factor in Kendall's tau deceleration evidence
  const hasDecelerationEvidence = kendallDecelPValue != null && kendallDecelPValue < 0.05;

  if (fisherPValue < 0.05 && significantCount >= Math.ceil(totalDomains / 2) && !hasDecelerationEvidence) {
    return {
      status: "SUPPORTED",
      label: "Thesis Supported",
      description: "Combined statistical evidence supports acceleration across domains",
    };
  }
  if (significantCount === 0 && fisherPValue > 0.5 && hasDecelerationEvidence) {
    return {
      status: "REFUTED",
      label: "Thesis Refuted",
      description: "No domain shows significant acceleration; Kendall's tau confirms deceleration",
    };
  }
  const parts = [
    `6/7 domains show supporting qualitative evidence.`,
    `${significantCount}/${totalDomains} show significant acceleration (Fisher p=${fisherPValue.toFixed(3)}).`,
  ];
  if (hasDecelerationEvidence) {
    parts.push(`Adversarial reanalysis finds deceleration (Kendall combined p=${kendallDecelPValue.toFixed(4)}).`);
  }
  parts.push("S-curve fits are strong but acceleration is contested.");
  return {
    status: "MIXED",
    label: "Evidence Contested",
    description: parts.join(" "),
  };
}
