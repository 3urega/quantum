from __future__ import annotations

import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone

from app.schemas.common import ResultResponse, RunResponse, RunStatus


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


@dataclass
class RunRecord:
    run: RunResponse
    result: ResultResponse | None = None


@dataclass
class RunStore:
    _runs: dict[str, RunRecord] = field(default_factory=dict)

    def create(
        self,
        *,
        template_id: str,
        backend: str,
        shots: int,
        parameters: dict,
        status: RunStatus = "draft",
    ) -> RunResponse:
        run_id = str(uuid.uuid4())
        ts = _now_iso()
        run = RunResponse(
            id=run_id,
            template_id=template_id,
            backend=backend,
            shots=shots,
            parameters=parameters,
            status=status,
            created_at=ts,
            updated_at=ts,
            error_message=None,
        )
        self._runs[run_id] = RunRecord(run=run)
        return run

    def get(self, run_id: str) -> RunRecord | None:
        return self._runs.get(run_id)

    def update_run(self, run_id: str, **kwargs) -> RunRecord | None:
        rec = self._runs.get(run_id)
        if not rec:
            return None
        data = rec.run.model_dump()
        data.update(kwargs)
        data["updated_at"] = _now_iso()
        rec.run = RunResponse.model_validate(data)
        return rec

    def set_result(self, run_id: str, result: ResultResponse) -> None:
        rec = self._runs.get(run_id)
        if rec is None:
            raise KeyError(run_id)
        rec.result = result


run_store = RunStore()
