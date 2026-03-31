from fastapi import APIRouter, HTTPException

from app.infrastructure.qiskit.executors.bell import execute_bell
from app.infrastructure.qiskit.executors.ghz import execute_ghz, resolve_num_qubits
from app.schemas.common import ResultResponse, RunCreateRequest, RunResponse
from app.services.run_store import run_store
from app.services.template_registry import get_template

router = APIRouter(prefix="/runs", tags=["runs"])


@router.post("", response_model=RunResponse)
def create_run(body: RunCreateRequest) -> RunResponse:
    template = get_template(body.template_id)
    if not template:
        raise HTTPException(status_code=404, detail="template_not_found")
    if body.backend not in template.supported_backends:
        raise HTTPException(status_code=400, detail="backend_not_supported")
    return run_store.create(
        template_id=template.id,
        backend=body.backend,
        shots=body.shots,
        parameters=body.parameters,
        status="draft",
    )


@router.post("/{run_id}/execute", response_model=RunResponse)
def execute_run(run_id: str) -> RunResponse:
    rec = run_store.get(run_id)
    if not rec:
        raise HTTPException(status_code=404, detail="run_not_found")
    if rec.run.status == "completed":
        return rec.run
    if rec.run.status == "running":
        raise HTTPException(status_code=409, detail="run_in_progress")

    template = get_template(rec.run.template_id)
    if not template:
        raise HTTPException(status_code=400, detail="template_missing")

    run_store.update_run(run_id, status="running")
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
        run_store.set_result(run_id, result)
        run_store.update_run(run_id, status="completed")
    except HTTPException as exc:
        run_store.update_run(
            run_id, status="failed", error_message=str(exc.detail)
        )
        raise
    except Exception as e:  # noqa: BLE001
        run_store.update_run(
            run_id, status="failed", error_message=str(e)[:2000]
        )
        raise HTTPException(status_code=500, detail="execution_failed") from e

    updated = run_store.get(run_id)
    assert updated is not None
    return updated.run


@router.get("/{run_id}", response_model=RunResponse)
def get_run(run_id: str) -> RunResponse:
    rec = run_store.get(run_id)
    if not rec:
        raise HTTPException(status_code=404, detail="run_not_found")
    return rec.run


@router.get("/{run_id}/results", response_model=ResultResponse)
def get_results(run_id: str) -> ResultResponse:
    rec = run_store.get(run_id)
    if not rec:
        raise HTTPException(status_code=404, detail="run_not_found")
    if not rec.result:
        raise HTTPException(status_code=404, detail="results_not_ready")
    return rec.result
