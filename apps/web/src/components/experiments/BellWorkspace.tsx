"use client";

import type { ResultDTO, TemplateDTO } from "@quantum-ops/shared-types";
import { useMemo, useState } from "react";
import { LearnCallout } from "@/components/LearnCallout";
import { createRun, executeRun, fetchResult, getApiBase } from "@/lib/api";
import { BellCircuitDiagram } from "./BellCircuitDiagram";
import { BlochPreview2D } from "./BlochPreview2D";
import { ExperimentLabHeader } from "./ExperimentLabHeader";
import { ExperimentRunHistorySection } from "./ExperimentRunHistorySection";
import { useLabCompareState } from "./useLabCompareState";

type Props = {
  template: TemplateDTO;
};

type GateAnim = "none" | "H" | "CNOT" | "done";

export function BellWorkspace({ template }: Props) {
  const defaultShots = useMemo(() => {
    const s = template.parameter_schema.shots?.default;
    return typeof s === "number" ? s : 1024;
  }, [template.parameter_schema]);
  const [shots, setShots] = useState(defaultShots);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ResultDTO | null>(null);
  const [gateAnim, setGateAnim] = useState<GateAnim>("none");

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

  const onRun = async () => {
    setError(null);
    setResult(null);
    clearCompare();
    setGateAnim("H");
    await new Promise((r) => setTimeout(r, 420));
    setGateAnim("CNOT");
    await new Promise((r) => setTimeout(r, 420));
    setBusy(true);
    try {
      const run = await createRun({
        template_id: template.id,
        backend: "local_simulator",
        shots,
        parameters: {},
      });
      await executeRun(run.id);
      const res = await fetchResult(run.id);
      setResult(res);
      setGateAnim("done");
      await new Promise((r) => setTimeout(r, 650));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Run failed");
      setGateAnim("none");
    } finally {
      setBusy(false);
      setGateAnim("none");
    }
    await loadHistory();
  };

  const blochStep: 0 | 1 | 2 = useMemo(() => {
    if (result) return 2;
    if (gateAnim === "H" || gateAnim === "CNOT" || gateAnim === "done") return 1;
    return 0;
  }, [result, gateAnim]);

  const maxCount = result?.artifacts.measurement_distribution
    ? Math.max(...result.artifacts.measurement_distribution.counts, 1)
    : 1;

  return (
    <div className="space-y-10 w-full max-w-7xl mx-auto">
      <ExperimentLabHeader
        templateName={template.name}
        badge="Bell"
        learnHref="/learn/bell"
        learnLabel="Tutorial (ES)"
      />

      <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
        <div className="space-y-6 min-w-0">
          <section className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 md:p-5 space-y-4 bg-zinc-50/40 dark:bg-zinc-950/20">
            <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-500">
              Experimento
            </h3>
            <BellCircuitDiagram activeGate={gateAnim} />
            <div>
              <p className="text-xs text-zinc-500 mb-1">Estado (ideal)</p>
              <p className="font-mono text-sm text-foreground/95">
                |Φ⁺⟩ = (|00⟩ + |11⟩) / √2
              </p>
              <p className="text-xs text-zinc-500 mt-1">
                Mediciones: correlacionadas; casi solo etiquetas 00 y 11.
              </p>
            </div>
            <BlochPreview2D step={blochStep} />
            <details className="group rounded-lg border border-zinc-200/80 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/30 open:ring-1 open:ring-cyan-500/20">
              <summary className="cursor-pointer list-none flex items-center justify-between gap-2 px-3 py-2 text-sm font-medium text-cyan-800 dark:text-cyan-200">
                <span>Explicación (desplegar)</span>
                <span className="text-zinc-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <ul className="px-3 pb-3 text-sm text-zinc-600 dark:text-zinc-300 space-y-2 list-disc pl-5">
                <li>
                  <span className="font-mono" title="Rotación π alrededor del eje Y (ver tutorial)">
                    H
                  </span>{" "}
                  pone el qubit 0 en superposición (p. ej. |+⟩).
                </li>
                <li>
                  <span className="font-mono" title="CNOT: entrelazamiento con control en q0">
                    CNOT
                  </span>{" "}
                  fija el estado de Bell: máxima correlación entre mediciones 00 y 11.
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
              Más <span className="font-mono">shots</span> = histograma más cercano a las
              probabilidades teóricas. El <strong>estado</strong> no cambia al subir shots; solo la
              precisión <strong>estadística</strong> del muestreo.
            </LearnCallout>
            {error ? (
              <p className="text-sm text-red-600 dark:text-red-400 rounded border border-red-500/30 px-3 py-2">
                {error}
              </p>
            ) : null}
            {result ? (
              <div className="space-y-3">
                <p className="text-xs text-zinc-500">
                  Run{" "}
                  <span className="font-mono text-cyan-600 dark:text-cyan-400">
                    {result.run_id}
                  </span>
                </p>
                <h4 className="text-xs font-mono uppercase tracking-widest text-zinc-500">
                  Resultado
                </h4>
                {result.artifacts.measurement_distribution ? (
                  <div className="flex items-end gap-3 h-40 pt-2 transition-opacity duration-500">
                    {result.artifacts.measurement_distribution.labels.map((label, i) => {
                      const c = result.artifacts.measurement_distribution!.counts[i] ?? 0;
                      const p = result.artifacts.measurement_distribution!.shots
                        ? c / result.artifacts.measurement_distribution!.shots
                        : 0;
                      const h = `${Math.round((c / maxCount) * 100)}%`;
                      return (
                        <div
                          key={label}
                          className="flex-1 flex flex-col items-center gap-1 min-w-0"
                        >
                          <div
                            className="w-full rounded-t bg-cyan-500/80 dark:bg-cyan-400/80 min-h-[4px] transition-all duration-500"
                            style={{ height: h }}
                            title={`P≈${(p * 100).toFixed(1)}%`}
                          />
                          <span className="font-mono text-xs text-zinc-500">{label}</span>
                          <span className="font-mono text-[11px]">
                            {c} ({(p * 100).toFixed(1)}%)
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : null}
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{result.summary.headline}</p>
              </div>
            ) : null}
            <p className="text-[10px] text-zinc-500 font-mono">API: {getApiBase()}</p>
          </section>
        </div>
      </div>

      <ExperimentRunHistorySection
        historyTitle="Bell"
        labRows={labRows}
        historyError={historyError}
        selected={selected}
        onToggle={toggleSelect}
        onCompare={onCompare}
        compareBusy={compareBusy}
        compareError={compareError}
        compare={compare}
      />
    </div>
  );
}
