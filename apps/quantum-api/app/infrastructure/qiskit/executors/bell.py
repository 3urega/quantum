"""Bell |Φ⁺⟩ state preparation, simulation, and product-shaped results."""

from __future__ import annotations

import time

from qiskit import QuantumCircuit, transpile
from qiskit.qasm2 import dumps as qasm2_dumps

try:
    from qiskit_aer import AerSimulator
except ImportError:  # pragma: no cover
    AerSimulator = None  # type: ignore[misc, assignment]


from app.schemas.common import (
    MeasurementDistribution,
    ResultArtifacts,
    ResultMetrics,
    ResultResponse,
    ResultSummary,
)


def build_bell_circuit() -> QuantumCircuit:
    qc = QuantumCircuit(2, 2)
    qc.h(0)
    qc.cx(0, 1)
    qc.measure([0, 1], [0, 1])
    return qc


def execute_bell(
    *,
    run_id: str,
    template_id: str,
    shots: int,
    backend_name: str,
) -> ResultResponse:
    if AerSimulator is None:
        raise RuntimeError("qiskit_aer is required for local_simulator")

    qc = build_bell_circuit()
    sim = AerSimulator()
    t0 = time.perf_counter()
    compiled = transpile(qc, sim)
    job = sim.run(compiled, shots=shots)
    result = job.result()
    elapsed_ms = (time.perf_counter() - t0) * 1000.0

    counts_raw: dict[str, int] = result.get_counts()
    # Normalize bitstring order for UI (consistent MSB convention)
    labels_sorted = sorted(counts_raw.keys())
    counts = [counts_raw[k] for k in labels_sorted]

    depth = int(compiled.depth())
    ops = compiled.count_ops()

    summary = ResultSummary(
        headline="Bell state measurement histogram",
        details="Expect roughly 50/50 on |00⟩ and |11⟩ for a noiseless Bell pair.",
    )
    metrics = ResultMetrics(
        qubit_count=qc.num_qubits,
        circuit_depth=depth,
        gate_counts={str(k): int(v) for k, v in ops.items()},
        execution_time_ms=round(elapsed_ms, 3),
    )
    artifacts = ResultArtifacts(
        measurement_distribution=MeasurementDistribution(
            labels=labels_sorted,
            counts=counts,
            shots=shots,
        ),
        circuit_qasm=qasm2_dumps(compiled),
    )
    return ResultResponse(
        run_id=run_id,
        template_id=template_id,
        summary=summary,
        metrics=metrics,
        artifacts=artifacts,
    )
