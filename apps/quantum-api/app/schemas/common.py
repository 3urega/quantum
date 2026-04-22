"""Pydantic models aligned with DTOs in `packages/shared-types` and `docs/domain/experiment-lifecycle.md`."""

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


class RunWithResultItem(BaseModel):
    """One completed run and its stored result (lab / history with histogram)."""

    run: RunResponse
    result: ResultResponse


class RunCompareRequest(BaseModel):
    run_id_a: str = Field(..., description="First completed run (UUID).")
    run_id_b: str = Field(..., description="Second completed run (UUID).")


class AlignedDistributionsCompare(BaseModel):
    labels: list[str]
    counts_a: list[int]
    counts_b: list[int]
    shots_a: int
    shots_b: int
    """Probabilities p(label) = count/shots for quick UI."""

    prob_a: list[float]
    prob_b: list[float]


class RunCompareResponse(BaseModel):
    run_a: RunResponse
    run_b: RunResponse
    result_a: ResultResponse
    result_b: ResultResponse
    aligned: AlignedDistributionsCompare
    shots_delta: int
    created_delta_ms: float | None = Field(
        default=None, description="run_b.created_at - run_a.created_at in ms (chronological order)"
    )
