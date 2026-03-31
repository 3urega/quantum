"use client";

import type {
  ParameterSchemaEntry,
  ResultDTO,
  TemplateDTO,
} from "@quantum-ops/shared-types";
import { useMemo, useState } from "react";
import Link from "next/link";
import { createRun, executeRun, fetchResult, getApiBase } from "@/lib/api";

type Props = {
  template: TemplateDTO;
};

function numFromSchema(entry: ParameterSchemaEntry | undefined, fallback: number): number {
  const d = entry?.default;
  return typeof d === "number" ? d : fallback;
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

  async function onRun() {
    setBusy(true);
    setError(null);
    setResult(null);
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
    } catch (e) {
      setError(e instanceof Error ? e.message : "Run failed");
    } finally {
      setBusy(false);
    }
  }

  const maxCount = result?.artifacts.measurement_distribution
    ? Math.max(...result.artifacts.measurement_distribution.counts, 1)
    : 1;

  const dist = result?.artifacts.measurement_distribution;

  return (
    <div className="space-y-8">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        El estado GHZ extiende el entrelazamiento a{" "}
        <span className="font-mono">n</span> qubits y el histograma puede crecer hasta{" "}
        <span className="font-mono">2ⁿ</span> etiquetas posibles. Léelo con detalle en el{" "}
        <Link href="/learn/ghz" className="font-medium text-violet-700 underline underline-offset-2 dark:text-violet-400">
          tutorial en español
        </Link>
        .
      </p>
      <section className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-4">
        <h2 className="text-sm font-medium uppercase tracking-wide text-zinc-500">
          Control surface
        </h2>
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
            className="rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white px-5 py-2 text-sm font-medium"
          >
            {busy ? "Running…" : "Execute on simulator"}
          </button>
        </div>
        <p className="text-xs text-zinc-500 font-mono">API: {getApiBase()}</p>
      </section>

      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400 rounded-lg border border-red-500/30 px-4 py-3">
          {error}
        </p>
      ) : null}

      {result ? (
        <div className="grid gap-8 lg:grid-cols-2">
          <section className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-4 lg:col-span-2">
            <h2 className="text-sm font-medium uppercase tracking-wide text-zinc-500">
              Measurement distribution
            </h2>
            <p className="text-sm">{result.summary.headline}</p>
            {dist ? (
              <div className="overflow-x-auto pt-4 pb-2">
                <div
                  className="flex items-end gap-2 h-48 min-w-min px-1"
                  style={{ minWidth: `${Math.max(dist.labels.length * 3, 24)}rem` }}
                >
                  {dist.labels.map((label, i) => {
                    const c = dist.counts[i] ?? 0;
                    const h = `${Math.round((c / maxCount) * 100)}%`;
                    return (
                      <div
                        key={label}
                        className="flex flex-col items-center gap-2 w-10 shrink-0"
                      >
                        <div
                          className="w-full rounded-t bg-violet-500/80 dark:bg-violet-400/80 min-h-[4px] transition-all"
                          style={{ height: h }}
                          title={`${label}: ${c}`}
                        />
                        <span className="font-mono text-[10px] text-zinc-500 text-center break-all max-w-[3.5rem] leading-tight">
                          {label}
                        </span>
                        <span className="font-mono text-xs">{c}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </section>

          <section className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-3">
            <h2 className="text-sm font-medium uppercase tracking-wide text-zinc-500">
              Circuit metrics
            </h2>
            <dl className="grid grid-cols-2 gap-2 text-sm">
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
              <div className="mt-4">
                <p className="text-xs uppercase text-zinc-500 mb-2">Gate counts</p>
                <ul className="font-mono text-xs space-y-1 max-h-40 overflow-y-auto">
                  {Object.entries(result.metrics.gate_counts).map(([g, n]) => (
                    <li
                      key={g}
                      className="flex justify-between gap-4 border-b border-zinc-800/50 pb-1"
                    >
                      <span>{g}</span>
                      <span>{n}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </section>

          {result.artifacts.circuit_qasm ? (
            <section className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 lg:col-span-2">
              <h2 className="text-sm font-medium uppercase tracking-wide text-zinc-500 mb-3">
                OpenQASM (transpiled)
              </h2>
              <pre className="text-xs font-mono overflow-x-auto p-4 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap max-h-64 overflow-y-auto">
                {result.artifacts.circuit_qasm}
              </pre>
            </section>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
