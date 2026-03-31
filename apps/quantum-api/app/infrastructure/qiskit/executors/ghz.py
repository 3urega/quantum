"""GHZ state on n qubits: H on first, chain of CX, measurement — product-shaped results."""

from __future__ import annotations

import time
from typing import Any

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

GHZ_NUM_QUBITS_MIN = 3
GHZ_NUM_QUBITS_MAX = 10


def resolve_num_qubits(parameters: dict[str, Any]) -> int:
    raw = parameters.get("num_qubits", GHZ_NUM_QUBITS_MIN)
    if raw is None:
        n = GHZ_NUM_QUBITS_MIN
    else:
        try:
            n = int(float(raw))
        except (TypeError, ValueError) as e:
            raise ValueError("num_qubits must be a number") from e
    if n < GHZ_NUM_QUBITS_MIN or n > GHZ_NUM_QUBITS_MAX:
        raise ValueError(
            f"num_qubits must be between {GHZ_NUM_QUBITS_MIN} and {GHZ_NUM_QUBITS_MAX}"
        )
    return n


def build_ghz_circuit(num_qubits: int) -> QuantumCircuit:
    qc = QuantumCircuit(num_qubits, num_qubits)
    qc.h(0)
    for i in range(num_qubits - 1):
        qc.cx(i, i + 1)
    qc.measure(range(num_qubits), range(num_qubits))
    return qc


def execute_ghz(
    *,
    run_id: str,
    template_id: str,
    shots: int,
    backend_name: str,
    num_qubits: int,
) -> ResultResponse:
    if AerSimulator is None:
        raise RuntimeError("qiskit_aer is required for local_simulator")

    qc = build_ghz_circuit(num_qubits)
    sim = AerSimulator()
    t0 = time.perf_counter()
    compiled = transpile(qc, sim)
    job = sim.run(compiled, shots=shots)
    result = job.result()
    elapsed_ms = (time.perf_counter() - t0) * 1000.0

    counts_raw: dict[str, int] = result.get_counts()
    labels_sorted = sorted(counts_raw.keys())
    counts = [counts_raw[k] for k in labels_sorted]

    depth = int(compiled.depth())
    ops = compiled.count_ops()

    summary = ResultSummary(
        headline=f"GHZ ({num_qubits} qubits) measurement histogram",
        details=(
            "For a noiseless GHZ, outcomes concentrate on |0…0⟩ and |1…1⟩ "
            f"({2**num_qubits} basis labels possible)."
        ),
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
