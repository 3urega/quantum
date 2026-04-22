"use client";

import type {
  ParameterSchemaEntry,
  ResultDTO,
  RunWithResultDTO,
  TemplateDTO,
} from "@quantum-ops/shared-types";
import { useCallback, useMemo, useState } from "react";
import { LearnCallout } from "@/components/LearnCallout";
import { createRun, executeRun, fetchResult, getApiBase } from "@/lib/api";
import { ExperimentLabHeader } from "./ExperimentLabHeader";
import { ExperimentRunHistorySection } from "./ExperimentRunHistorySection";
import { GhzCircuitDiagram } from "./GhzCircuitDiagram";
import { useLabCompareState } from "./useLabCompareState";

type Props = {
  template: TemplateDTO;
};

type GhzAnim = "none" | "H" | "CNOT" | "done";

function numFromSchema(entry: ParameterSchemaEntry | undefined, fallback: number): number {
  const d = entry?.default;
  return typeof d === "number" ? d : fallback;
}

function ghzParamSummary(row: RunWithResultDTO): string | null {
  const raw = row.run.parameters?.num_qubits;
  if (typeof raw === "number" && Number.isFinite(raw)) {
    return `n=${Math.floor(raw)}`;
  }
  return null;
}

export function GhzWorkspace({ template }: Props) {
  const schema = template.parameter_schema;
  const numQubitSchema = schema["num_qubits"];
  const shotsSchema = schema["shots"];
  const defaultShots = useMemo(() => numFromSchema(shotsSchema, 1024), [shotsSchema]);
  const defaultQubits = useMemo(
    () => numFromSchema(numQubitSchema, 3),
    [numQubitSchema],
  );
  const qMin = typeof numQubitSchema?.min === "number" ? numQubitSchema.min : 3;
  const qMax = typeof numQubitSchema?.max === "number" ? numQubitSchema.max : 10;

  const [shots, setShots] = useState(defaultShots);
  const [numQubits, setNumQubits] = useState(defaultQubits);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ResultDTO | null>(null);
  const [activePhase, setActivePhase] = useState<GhzAnim>("none");

  const {
    labRows,
    historyError,
    loadHistory,
    selected,
    toggleSelect,
    compare,
    compareBusy,
    compareError,
    onCompare,
    clearCompare,
  } = useLabCompareState(template.id);

  const onRun = useCallback(async () => {
    setError(null);
    setResult(null);
    clearCompare();
    setActivePhase("H");
    await new Promise((r) => setTimeout(r, 400));
    setActivePhase("CNOT");
    await new Promise((r) => setTimeout(r, 400));
    setBusy(true);
    setActivePhase("none");
    try {
      const run = await createRun({
        template_id: template.id,
        backend: "local_simulator",
        shots,
        parameters: { num_qubits: numQubits },
      });
      await executeRun(run.id);
      const res = await fetchResult(run.id);
      setResult(res);
      setActivePhase("done");
      await new Promise((r) => setTimeout(r, 500));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Run failed");
      setActivePhase("none");
    } finally {
      setBusy(false);
      setActivePhase("none");
    }
    await loadHistory();
  }, [clearCompare, loadHistory, numQubits, shots, template.id]);

  const maxCount = result?.artifacts.measurement_distribution
    ? Math.max(...result.artifacts.measurement_distribution.counts, 1)
    : 1;
  const dist = result?.artifacts.measurement_distribution;

  return (
    <div className="space-y-10 w-full max-w-7xl mx-auto">
      <ExperimentLabHeader
        templateName={template.name}
        badge="GHZ"
        learnHref="/learn/ghz"
        learnLabel="Tutorial (ES)"
      />

      <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
        <div className="space-y-6 min-w-0">
          <section className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 md:p-5 space-y-4 bg-zinc-50/40 dark:bg-zinc-950/20">
            <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-500">
              Experimento
            </h3>
            <GhzCircuitDiagram numQubits={numQubits} activePhase={activePhase} />
            <div>
              <p className="text-xs text-zinc-500 mb-1">Estado (ideal)</p>
              <p className="font-mono text-sm text-foreground/95 break-words">
                |GHZ_n⟩ = (|0⟩<sup>⊗n</sup> + |1⟩<sup>⊗n</sup>) / √2
              </p>
              <p className="text-xs text-zinc-500 mt-1">
                La app construye <span className="font-mono">H</span> en <span className="font-mono">q0</span> y
                CNOTs en cadena. Esfera de Bloch no aplica 1:1 a estados de varios cubits: aquí el foco es el
                histograma y la comparación entre runs.
              </p>
            </div>
            <details className="group rounded-lg border border-zinc-200/80 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/30 open:ring-1 open:ring-cyan-500/20">
              <summary className="cursor-pointer list-none flex items-center justify-between gap-2 px-3 py-2 text-sm font-medium text-cyan-800 dark:text-cyan-200">
                <span>Explicación (desplegar)</span>
                <span className="text-zinc-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <ul className="px-3 pb-3 text-sm text-zinc-600 dark:text-zinc-300 space-y-2 list-disc pl-5">
                <li>
                  Con <span className="font-mono">n</span> fijo, deberías ver casi solo cadenas de 0s o de 1s
                  (muestreo estadístico); el resto de etiquetas tiende a cero con circuito ideal y suficientes shots.
                </li>
                <li>
                  Subir <span className="font-mono">n</span> acerca el ancho de etiquetas a <span className="font-mono">2ⁿ</span> en
                  el eje: útil bajar a <span className="font-mono">n=3</span>–4 para leer, y ampliar <span className="font-mono">shots</span> para
                  afinar frecuencias.
                </li>
              </ul>
            </details>
          </section>
        </div>

        <div className="space-y-6 min-w-0">
          <section className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 md:p-5 space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-500">Run</h3>
            <div className="flex flex-wrap items-end gap-4">
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-zinc-500">Qubits</span>
                <input
                  type="number"
                  min={qMin}
                  max={qMax}
                  className="rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 w-28 font-mono"
                  value={numQubits}
                  onChange={(e) => setNumQubits(Number(e.target.value) || qMin)}
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-zinc-500">Shots</span>
                <input
                  type="number"
                  min={1}
                  max={100_000}
                  className="rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 w-32 font-mono"
                  value={shots}
                  onChange={(e) => setShots(Number(e.target.value) || 0)}
                />
              </label>
              <button
                type="button"
                onClick={() => void onRun()}
                disabled={busy}
                className="rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white px-6 py-2.5 text-sm font-semibold shadow-sm transition-colors"
              >
                {busy ? "Running…" : "Run experiment"}
              </button>
            </div>
            <LearnCallout title="Lectura rápida">
              Mismos criterios que en Bell: más <span className="font-mono">shots</span> afinan el histograma; el
              <strong>estado</strong> ideal no &quot;mejora&quot; con shots — solo el ruido estadístico baja. Cambiar{" "}
              <span className="font-mono">n</span> cambia el circuito y el espacio de mediciones.
            </LearnCallout>
            {error ? (
              <p className="text-sm text-red-600 dark:text-red-400 rounded border border-red-500/30 px-3 py-2">
                {error}
              </p>
            ) : null}
            {result ? (
              <div className="space-y-3">
                <p className="text-xs text-zinc-500">
                  Run <span className="font-mono text-cyan-600 dark:text-cyan-400">{result.run_id}</span>
                </p>
                <h4 className="text-xs font-mono uppercase tracking-widest text-zinc-500">Resultado</h4>
                {dist ? (
                  <div className="overflow-x-auto pt-2 -mx-1 px-1">
                    <div
                      className="flex items-end gap-2 h-40 min-w-min"
                      style={{ minWidth: `${Math.max(dist.labels.length * 2, 8)}rem` }}
                    >
                      {dist.labels.map((label, i) => {
                        const c = dist.counts[i] ?? 0;
                        const p = dist.shots ? c / dist.shots : 0;
                        const h = `${Math.round((c / maxCount) * 100)}%`;
                        return (
                          <div
                            key={label}
                            className="flex flex-col items-center gap-1 w-9 shrink-0"
                          >
                            <div
                              className="w-full rounded-t bg-cyan-500/80 dark:bg-cyan-400/80 min-h-[4px] transition-all duration-500"
                              style={{ height: h }}
                              title={`P≈${(p * 100).toFixed(1)}% · ${c}`}
                            />
                            <span className="font-mono text-[10px] text-zinc-500 text-center break-all max-w-[3.5rem] leading-tight">
                              {label}
                            </span>
                            <span className="font-mono text-[11px]">
                              {c} ({(p * 100).toFixed(1)}%)
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{result.summary.headline}</p>

                <details className="rounded-lg border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/20">
                  <summary className="cursor-pointer list-none px-3 py-2 text-xs font-mono text-zinc-500">
                    Métricas y OpenQASM (desplegar)
                  </summary>
                  <div className="px-3 pb-3 space-y-3 text-sm">
                    <dl className="grid grid-cols-2 gap-2">
                      <dt className="text-zinc-500">Qubits</dt>
                      <dd className="font-mono">{result.metrics.qubit_count ?? "—"}</dd>
                      <dt className="text-zinc-500">Depth</dt>
                      <dd className="font-mono">{result.metrics.circuit_depth ?? "—"}</dd>
                      <dt className="text-zinc-500">Exec time</dt>
                      <dd className="font-mono">
                        {result.metrics.execution_time_ms != null
                          ? `${result.metrics.execution_time_ms} ms`
                          : "—"}
                      </dd>
                    </dl>
                    {result.metrics.gate_counts ? (
                      <div>
                        <p className="text-xs uppercase text-zinc-500 mb-1">Gate counts</p>
                        <ul className="font-mono text-xs space-y-1 max-h-32 overflow-y-auto">
                          {Object.entries(result.metrics.gate_counts).map(([g, n]) => (
                            <li key={g} className="flex justify-between gap-4">
                              <span>{g}</span>
                              <span>{n}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                    {result.artifacts.circuit_qasm ? (
                      <pre className="text-xs font-mono overflow-x-auto p-3 rounded-lg bg-zinc-100 dark:bg-zinc-900 whitespace-pre-wrap max-h-48 overflow-y-auto">
                        {result.artifacts.circuit_qasm}
                      </pre>
                    ) : null}
                  </div>
                </details>
              </div>
            ) : null}
            <p className="text-[10px] text-zinc-500 font-mono">API: {getApiBase()}</p>
          </section>
        </div>
      </div>

      <ExperimentRunHistorySection
        historyTitle="GHZ"
        labRows={labRows}
        historyError={historyError}
        selected={selected}
        onToggle={toggleSelect}
        onCompare={onCompare}
        compareBusy={compareBusy}
        compareError={compareError}
        compare={compare}
        runParamSummary={ghzParamSummary}
      />
    </div>
  );
}
