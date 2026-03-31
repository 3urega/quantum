from typing import Any, Literal

from pydantic import BaseModel, Field

ComplexityLevel = Literal["intro", "intermediate", "advanced"]
ExperimentCategory = Literal["entanglement", "optimization", "variational"]
RunStatus = Literal["draft", "queued", "running", "completed", "failed"]
ParameterType = Literal["number", "string", "boolean"]


class ParameterSchemaEntry(BaseModel):
    type: ParameterType
    required: bool
    default: float | str | bool | None = None
    min: float | None = None
    max: float | None = None
    description: str | None = None


class TemplateResponse(BaseModel):
    id: str
    slug: str
    name: str
    description: str
    category: ExperimentCategory
    supported_backends: list[str]
    parameter_schema: dict[str, ParameterSchemaEntry]
    visualization_type: str
    complexity_level: ComplexityLevel


class RunCreateRequest(BaseModel):
    template_id: str = Field(..., description="Template id (same as slug in MVP)")
    backend: str = "local_simulator"
    shots: int = Field(1024, ge=1, le=100_000)
    parameters: dict[str, Any] = Field(default_factory=dict)


class RunResponse(BaseModel):
    id: str
    template_id: str
    backend: str
    shots: int
    parameters: dict[str, Any]
    status: RunStatus
    created_at: str
    updated_at: str
    error_message: str | None = None


class ResultSummary(BaseModel):
    headline: str
    details: str | None = None


class MeasurementDistribution(BaseModel):
    labels: list[str]
    counts: list[int]
    shots: int


class ResultMetrics(BaseModel):
    qubit_count: int | None = None
    circuit_depth: int | None = None
    gate_counts: dict[str, int] | None = None
    execution_time_ms: float | None = None


class ResultArtifacts(BaseModel):
    measurement_distribution: MeasurementDistribution | None = None
    circuit_qasm: str | None = None


class ResultResponse(BaseModel):
    run_id: str
    template_id: str
    summary: ResultSummary
    metrics: ResultMetrics
    artifacts: ResultArtifacts


class HealthResponse(BaseModel):
    status: str
    service: str
