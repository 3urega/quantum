/** Product-grade API contracts (manual DTOs; Option A in architecture blueprint). */

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
