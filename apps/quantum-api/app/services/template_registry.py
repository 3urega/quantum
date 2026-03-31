from app.schemas.common import ParameterSchemaEntry, TemplateResponse

_TEMPLATES: list[TemplateResponse] = [
    TemplateResponse(
        id="bell-state",
        slug="bell-state",
        name="Bell State",
        description="Maximally entangled two-qubit Bell state |Φ⁺⟩ with measurement statistics.",
        category="entanglement",
        supported_backends=["local_simulator"],
        parameter_schema={
            "shots": ParameterSchemaEntry(
                type="number",
                required=True,
                default=1024,
                min=1,
                max=100_000,
                description="Number of circuit shots",
            ),
        },
        visualization_type="distribution",
        complexity_level="intro",
    ),
    TemplateResponse(
        id="ghz-state",
        slug="ghz-state",
        name="GHZ State",
        description="Greenberger–Horne–Zeilinger state on n qubits (execution follows Bell in roadmap).",
        category="entanglement",
        supported_backends=["local_simulator"],
        parameter_schema={
            "num_qubits": ParameterSchemaEntry(
                type="number",
                required=False,
                default=3,
                min=3,
                max=10,
                description="Qubit count for GHZ",
            ),
            "shots": ParameterSchemaEntry(
                type="number",
                required=True,
                default=1024,
                min=1,
                max=100_000,
                description="Number of circuit shots",
            ),
        },
        visualization_type="distribution",
        complexity_level="intermediate",
    ),
    TemplateResponse(
        id="qaoa-routing",
        slug="qaoa-routing",
        name="QAOA vs classical solver",
        description="Quantum approximate optimization compared to a classical baseline (Phase 7).",
        category="optimization",
        supported_backends=["local_simulator"],
        parameter_schema={
            "shots": ParameterSchemaEntry(
                type="number",
                required=True,
                default=1024,
                min=1,
                max=50_000,
                description="Shots per QAOA energy estimate",
            ),
        },
        visualization_type="comparison",
        complexity_level="intermediate",
    ),
    TemplateResponse(
        id="vqe-toy",
        slug="vqe-toy",
        name="VQE toy problem",
        description="Small variational eigensolver demonstration (Phase 8).",
        category="variational",
        supported_backends=["local_simulator"],
        parameter_schema={
            "shots": ParameterSchemaEntry(
                type="number",
                required=True,
                default=512,
                min=1,
                max=20_000,
                description="Shots per energy evaluation",
            ),
        },
        visualization_type="energy_curve",
        complexity_level="advanced",
    ),
]

_BY_ID = {t.id: t for t in _TEMPLATES}
_BY_SLUG = {t.slug: t for t in _TEMPLATES}


def list_templates() -> list[TemplateResponse]:
    return list(_TEMPLATES)


def get_template(template_id: str) -> TemplateResponse | None:
    return _BY_ID.get(template_id) or _BY_SLUG.get(template_id)
