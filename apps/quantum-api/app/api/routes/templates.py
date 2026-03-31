from fastapi import APIRouter, HTTPException

from app.schemas.common import TemplateResponse
from app.services.template_registry import get_template, list_templates

router = APIRouter(prefix="/templates", tags=["templates"])


@router.get("", response_model=list[TemplateResponse])
def list_all() -> list[TemplateResponse]:
    return list_templates()


@router.get("/{template_id}", response_model=TemplateResponse)
def get_one(template_id: str) -> TemplateResponse:
    t = get_template(template_id)
    if not t:
        raise HTTPException(status_code=404, detail="template_not_found")
    return t
