/**
 * Product-grade API contracts (manual DTOs; Option A in architecture blueprint).
 * Domain lifecycle, run states, and metrics/artifacts for comparison: `docs/domain/experiment-lifecycle.md` (repo root).
 */

export type ComplexityLevel = "intro" | "intermediate" | "advanced";

export type ExperimentCategory =
  | "entanglement"
  | "optimization"
  | "variational";

export type ParameterSchemaEntry = {
  type: "number" | "string" | "boolean";
  required: boolean;
  default?: number | string | boolean;
  min?: number;
  max?: number;
  description?: string;
};

export type TemplateDTO = {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: ExperimentCategory;
  supported_backends: string[];
  parameter_schema: Record<string, ParameterSchemaEntry>;
  visualization_type: string;
  complexity_level: ComplexityLevel;
};

export type RunStatus =
  | "draft"
  | "queued"
  | "running"
  | "completed"
  | "failed";

export type RunDTO = {
  id: string;
  template_id: string;
  backend: string;
  shots: number;
  parameters: Record<string, unknown>;
  status: RunStatus;
  created_at: string;
  updated_at: string;
  error_message?: string | null;
};

export type MeasurementDistribution = {
  labels: string[];
  counts: number[];
  shots: number;
};

export type ResultSummary = {
  headline: string;
  details?: string;
};

export type ResultMetrics = {
  qubit_count?: number;
  circuit_depth?: number;
  gate_counts?: Record<string, number>;
  execution_time_ms?: number;
};

export type ResultDTO = {
  run_id: string;
  template_id: string;
  summary: ResultSummary;
  metrics: ResultMetrics;
  artifacts: {
    measurement_distribution?: MeasurementDistribution;
    circuit_qasm?: string;
  };
};

export type HealthResponse = {
  status: string;
  service: string;
};

/** `GET /runs/lab?template_id=` — completed runs with histograms. */
export type RunWithResultDTO = {
  run: RunDTO;
  result: ResultDTO;
};

export type AlignedDistributionsCompareDTO = {
  labels: string[];
  counts_a: number[];
  counts_b: number[];
  shots_a: number;
  shots_b: number;
  prob_a: number[];
  prob_b: number[];
};

export type RunCompareResponseDTO = {
  run_a: RunDTO;
  run_b: RunDTO;
  result_a: ResultDTO;
  result_b: ResultDTO;
  aligned: AlignedDistributionsCompareDTO;
  shots_delta: number;
  created_delta_ms: number | null;
};
