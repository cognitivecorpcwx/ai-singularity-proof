import fs from "fs";
import path from "path";

const DATA_PATH = path.join(process.cwd(), "data", "singularity.json");

export interface DataPoint {
  time: number;
  score: number;
  model: string;
  source: string;
}

export interface DomainData {
  name: string;
  shortName: string;
  unit: string;
  direction: "higher_is_better" | "lower_is_better";
  humanBaseline: number | null;
  humanBaselineLabel: string | null;
  dataPoints: DataPoint[];
}

export interface ModelFitResult {
  r2: number;
  aic: number;
  bic: number;
}

export interface AccelerationTest {
  n: number;
  meanAcceleration: number;
  tStatistic: number;
  pValue: number;
  significant: boolean;
  fractionAccelerating: number;
}

export interface SingularityData {
  domains: Record<string, DomainData>;
  analysisResults: {
    modelFits: Record<string, {
      models: Record<string, ModelFitResult>;
      bestModel: string;
    }>;
    accelerationTests: Record<string, AccelerationTest>;
    fisherCombined: {
      chi2: number;
      pValue: number;
      significant: boolean;
    };
  };
}

export function loadData(): SingularityData {
  const raw = fs.readFileSync(DATA_PATH, "utf-8");
  return JSON.parse(raw);
}

export function saveData(data: SingularityData): void {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), "utf-8");
}

export function addDataPoint(domainId: string, point: DataPoint): SingularityData {
  const data = loadData();
  if (!data.domains[domainId]) {
    throw new Error(`Unknown domain: ${domainId}`);
  }
  data.domains[domainId].dataPoints.push(point);
  data.domains[domainId].dataPoints.sort((a, b) => a.time - b.time);
  saveData(data);
  return data;
}
