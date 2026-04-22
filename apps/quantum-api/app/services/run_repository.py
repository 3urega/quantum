from __future__ import annotations

import uuid
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import cast

from fastapi import Depends
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.infrastructure.persistence.database import get_db
from app.infrastructure.persistence.models import Run, RunResult
from app.schemas.common import ResultResponse, RunResponse, RunStatus


def _now_utc() -> datetime:
    return datetime.now(timezone.utc)


def _dt_to_iso(dt: datetime) -> str:
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.isoformat()


def _parse_run_id(run_id: str) -> uuid.UUID | None:
    try:
        return uuid.UUID(run_id)
    except ValueError:
        return None


def _row_to_run_response(row: Run) -> RunResponse:
    return RunResponse(
        id=str(row.id),
        template_id=row.template_id,
        backend=row.backend,
        shots=row.shots,
        parameters=dict(row.parameters) if row.parameters else {},
        status=cast(RunStatus, row.status),
        created_at=_dt_to_iso(row.created_at),
        updated_at=_dt_to_iso(row.updated_at),
        error_message=row.error_message,
    )


@dataclass
class RunRecord:
    run: RunResponse
    result: ResultResponse | None = None


class RunRepository:
    def __init__(self, db: Session):
        self._db = db

    def create(
        self,
        *,
        template_id: str,
        backend: str,
        shots: int,
        parameters: dict,
        status: RunStatus = "draft",
    ) -> RunResponse:
        now = _now_utc()
        row = Run(
            template_id=template_id,
            backend=backend,
            shots=shots,
            parameters=parameters or {},
            status=status,
            error_message=None,
            created_at=now,
            updated_at=now,
        )
        self._db.add(row)
        self._db.commit()
        self._db.refresh(row)
        return _row_to_run_response(row)

    def get(self, run_id: str) -> RunRecord | None:
        uid = _parse_run_id(run_id)
        if uid is None:
            return None
        row = self._db.get(Run, uid)
        if row is None:
            return None
        result: ResultResponse | None = None
        if row.result_row is not None:
            result = ResultResponse.model_validate(row.result_row.payload)
        return RunRecord(run=_row_to_run_response(row), result=result)

    def list_recent(
        self,
        *,
        limit: int = 50,
        offset: int = 0,
        template_id: str | None = None,
    ) -> list[RunResponse]:
        stmt = select(Run).order_by(Run.created_at.desc())
        if template_id is not None:
            stmt = stmt.where(Run.template_id == template_id)
        stmt = stmt.limit(limit).offset(offset)
        rows = self._db.scalars(stmt).all()
        return [_row_to_run_response(r) for r in rows]

    def list_completed_with_results(
        self, *, template_id: str, limit: int = 30
    ) -> list[RunRecord]:
        stmt = (
            select(Run)
            .options(joinedload(Run.result_row))
            .where(Run.template_id == template_id)
            .where(Run.status == "completed")
            .order_by(Run.created_at.desc())
            .limit(limit)
        )
        rows = self._db.scalars(stmt).unique().all()
        out: list[RunRecord] = []
        for row in rows:
            run = _row_to_run_response(row)
            if row.result_row is None:
                continue
            result = ResultResponse.model_validate(row.result_row.payload)
            out.append(RunRecord(run=run, result=result))
        return out

    def update_run(self, run_id: str, **kwargs) -> RunRecord | None:
        uid = _parse_run_id(run_id)
        if uid is None:
            return None
        row = self._db.get(Run, uid)
        if row is None:
            return None
        for key, value in kwargs.items():
            if hasattr(row, key):
                setattr(row, key, value)
        row.updated_at = _now_utc()
        self._db.commit()
        self._db.refresh(row)
        return self.get(run_id)

    def set_result(self, run_id: str, result: ResultResponse) -> None:
        uid = _parse_run_id(run_id)
        if uid is None:
            raise KeyError(run_id)
        row = self._db.get(Run, uid)
        if row is None:
            raise KeyError(run_id)
        payload = result.model_dump(mode="json")
        if row.result_row is None:
            row.result_row = RunResult(run_id=row.id, payload=payload)
            self._db.add(row.result_row)
        else:
            row.result_row.payload = payload
        self._db.commit()


def get_run_repository(db: Session = Depends(get_db)) -> RunRepository:
    return RunRepository(db)
