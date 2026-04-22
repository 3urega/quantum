from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query

from app.infrastructure.qiskit.executors.bell import execute_bell
from app.infrastructure.qiskit.executors.ghz import execute_ghz, resolve_num_qubits
from app.schemas.common import (
    AlignedDistributionsCompare,
    MeasurementDistribution,
    ResultResponse,
    RunCompareRequest,
    RunCompareResponse,
    RunCreateRequest,
    RunResponse,
    RunWithResultItem,
)
from app.services.run_repository import RunRepository, get_run_repository
from app.services.template_registry import get_template

router = APIRouter(prefix="/runs", tags=["runs"])


def _align_two_distributions(
    a: MeasurementDistribution,
    b: MeasurementDistribution,
) -> AlignedDistributionsCompare:
    labels = sorted(set(a.labels) | set(b.labels))
    map_a = dict(zip(a.labels, a.counts))
    map_b = dict(zip(b.labels, b.counts))
    counts_a = [map_a.get(lab, 0) for lab in labels]
    counts_b = [map_b.get(lab, 0) for lab in labels]
    sa = max(a.shots, 1)
    sb = max(b.shots, 1)
    prob_a = [c / sa for c in counts_a]
    prob_b = [c / sb for c in counts_b]
    return AlignedDistributionsCompare(
        labels=labels,
        counts_a=counts_a,
        counts_b=counts_b,
        shots_a=a.shots,
        shots_b=b.shots,
        prob_a=prob_a,
        prob_b=prob_b,
    )


@router.get(
    "/lab",
    response_model=list[RunWithResultItem],
    summary="Recent completed runs for a template, with stored results (histograms).",
)
def list_runs_for_lab(
    template_id: str = Query(..., min_length=1),
    limit: int = Query(20, ge=1, le=100),
    repo: RunRepository = Depends(get_run_repository),
) -> list[RunWithResultItem]:
    rows = repo.list_completed_with_results(template_id=template_id, limit=limit)
    return [RunWithResultItem(run=rec.run, result=rec.result) for rec in rows]


@router.get("", response_model=list[RunResponse])
def list_runs(
    repo: RunRepository = Depends(get_run_repository),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    template_id: str | None = Query(
        default=None, description="When set, only runs for this template_id."
    ),
) -> list[RunResponse]:
    return repo.list_recent(
        limit=limit, offset=offset, template_id=template_id
    )


@router.post("", response_model=RunResponse)
def create_run(
    body: RunCreateRequest,
    repo: RunRepository = Depends(get_run_repository),
) -> RunResponse:
    template = get_template(body.template_id)
    if not template:
        raise HTTPException(status_code=404, detail="template_not_found")
    if body.backend not in template.supported_backends:
        raise HTTPException(status_code=400, detail="backend_not_supported")
    return repo.create(
        template_id=template.id,
        backend=body.backend,
        shots=body.shots,
        parameters=body.parameters,
        status="draft",
    )


@router.post("/{run_id}/execute", response_model=RunResponse)
def execute_run(
    run_id: str,
    repo: RunRepository = Depends(get_run_repository),
) -> RunResponse:
    rec = repo.get(run_id)
    if not rec:
        raise HTTPException(status_code=404, detail="run_not_found")
    if rec.run.status == "completed":
        return rec.run
    if rec.run.status == "running":
        raise HTTPException(status_code=409, detail="run_in_progress")

    template = get_template(rec.run.template_id)
    if not template:
        raise HTTPException(status_code=400, detail="template_missing")

    repo.update_run(run_id, status="running")
    try:
        if rec.run.backend != "local_simulator":
            raise HTTPException(status_code=400, detail="backend_not_supported")

        if template.id == "bell-state":
            result = execute_bell(
                run_id=run_id,
                template_id=template.id,
                shots=rec.run.shots,
                backend_name=rec.run.backend,
            )
        elif template.id == "ghz-state":
            try:
                n = resolve_num_qubits(rec.run.parameters)
            except ValueError as exc:
                raise HTTPException(status_code=400, detail=str(exc)) from exc
            result = execute_ghz(
                run_id=run_id,
                template_id=template.id,
                shots=rec.run.shots,
                backend_name=rec.run.backend,
                num_qubits=n,
            )
        else:
            raise HTTPException(
                status_code=501,
                detail=f"execution_not_implemented_for_template:{template.id}",
            )
        repo.set_result(run_id, result)
        repo.update_run(run_id, status="completed")
    except HTTPException as exc:
        repo.update_run(run_id, status="failed", error_message=str(exc.detail))
        raise
    except Exception as e:  # noqa: BLE001
        repo.update_run(run_id, status="failed", error_message=str(e)[:2000])
        raise HTTPException(status_code=500, detail="execution_failed") from e

    updated = repo.get(run_id)
    assert updated is not None
    return updated.run


@router.get("/{run_id}", response_model=RunResponse)
def get_run(
    run_id: str,
    repo: RunRepository = Depends(get_run_repository),
) -> RunResponse:
    rec = repo.get(run_id)
    if not rec:
        raise HTTPException(status_code=404, detail="run_not_found")
    return rec.run


@router.get("/{run_id}/results", response_model=ResultResponse)
def get_results(
    run_id: str,
    repo: RunRepository = Depends(get_run_repository),
) -> ResultResponse:
    rec = repo.get(run_id)
    if not rec:
        raise HTTPException(status_code=404, detail="run_not_found")
    if not rec.result:
        raise HTTPException(status_code=404, detail="results_not_ready")
    return rec.result


@router.post("/compare", response_model=RunCompareResponse)
def compare_runs(
    body: RunCompareRequest,
    repo: RunRepository = Depends(get_run_repository),
) -> RunCompareResponse:
    if body.run_id_a == body.run_id_b:
        raise HTTPException(status_code=400, detail="compare_requires_two_distinct_runs")
    rec_a = repo.get(body.run_id_a)
    rec_b = repo.get(body.run_id_b)
    if not rec_a or not rec_b:
        raise HTTPException(status_code=404, detail="run_not_found")
    if not rec_a.result or not rec_b.result:
        raise HTTPException(status_code=400, detail="results_not_ready")
    if rec_a.run.status != "completed" or rec_b.run.status != "completed":
        raise HTTPException(status_code=400, detail="runs_must_be_completed")
    if rec_a.run.template_id != rec_b.run.template_id:
        raise HTTPException(status_code=400, detail="compare_requires_same_template_id")
    dist_a = rec_a.result.artifacts.measurement_distribution
    dist_b = rec_b.result.artifacts.measurement_distribution
    if not dist_a or not dist_b:
        raise HTTPException(status_code=400, detail="measurement_distribution_missing")
    aligned = _align_two_distributions(dist_a, dist_b)
    created_delta_ms: float | None = None
    try:
        da = datetime.fromisoformat(rec_a.run.created_at.replace("Z", "+00:00"))
        db = datetime.fromisoformat(rec_b.run.created_at.replace("Z", "+00:00"))
        created_delta_ms = (db - da).total_seconds() * 1000.0
    except (ValueError, TypeError, OSError):
        created_delta_ms = None
    return RunCompareResponse(
        run_a=rec_a.run,
        run_b=rec_b.run,
        result_a=rec_a.result,
        result_b=rec_b.result,
        aligned=aligned,
        shots_delta=rec_b.run.shots - rec_a.run.shots,
        created_delta_ms=created_delta_ms,
    )
