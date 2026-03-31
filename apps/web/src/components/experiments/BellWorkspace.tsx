"use client";

import type { ResultDTO, TemplateDTO } from "@quantum-ops/shared-types";
import { useMemo, useState } from "react";
import { createRun, executeRun, fetchResult, getApiBase } from "@/lib/api";
import Link from "next/link";

type Props = {
  template: TemplateDTO;
};

export function BellWorkspace({ template }: Props) {
  const defaultShots = useMemo(() => {
    const s = template.parameter_schema.shots?.default;
    return typeof s === "number" ? s : 1024;
  }, [template.parameter_schema]);
  const [shots, setShots] = useState(defaultShots);
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
        parameters: {},
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

  return (
    <div className="space-y-8">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        ¿Primera vez con Bell? Repasa la base computacional, Hadamard, CNOT y el estado
        Bell |Φ⁺⟩ en el{" "}
        <Link href="/learn/bell" className="font-medium text-violet-700 underline underline-offset-2 dark:text-violet-400">
          tutorial en español
        </Link>{" "}
        (fórmulas con LaTeX).
      </p>
      <section className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-4">
        <h2 className="text-sm font-medium uppercase tracking-wide text-zinc-500">
          Control surface
        </h2>
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
          <section className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-4">
            <h2 className="text-sm font-medium uppercase tracking-wide text-zinc-500">
              Measurement distribution
            </h2>
            <p className="text-sm">{result.summary.headline}</p>
            {result.artifacts.measurement_distribution ? (
              <div className="flex items-end gap-3 h-44 pt-4">
                {result.artifacts.measurement_distribution.labels.map((label, i) => {
                  const c = result.artifacts.measurement_distribution!.counts[i] ?? 0;
                  const h = `${Math.round((c / maxCount) * 100)}%`;
                  return (
                    <div key={label} className="flex-1 flex flex-col items-center gap-2">
                      <div
                        className="w-full rounded-t bg-cyan-500/80 dark:bg-cyan-400/80 min-h-[4px] transition-all"
                        style={{ height: h }}
                        title={`${label}: ${c}`}
                      />
                      <span className="font-mono text-xs text-zinc-500">{label}</span>
                      <span className="font-mono text-xs">{c}</span>
                    </div>
                  );
                })}
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
                <ul className="font-mono text-xs space-y-1">
                  {Object.entries(result.metrics.gate_counts).map(([g, n]) => (
                    <li key={g} className="flex justify-between gap-4 border-b border-zinc-800/50 pb-1">
                      <span>{g}</span>
                      <span>{n}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </section>

          {result.artifacts.circuit_qasm ? (
            <section className="lg:col-span-2 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
              <h2 className="text-sm font-medium uppercase tracking-wide text-zinc-500 mb-3">
                OpenQASM (transpiled)
              </h2>
              <pre className="text-xs font-mono overflow-x-auto p-4 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap">
                {result.artifacts.circuit_qasm}
              </pre>
            </section>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
