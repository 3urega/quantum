"use client";

import type { RunCompareResponseDTO, RunWithResultDTO } from "@quantum-ops/shared-types";
import Link from "next/link";
import { CompareAlignedBarRow } from "./CompareAlignedBarRow";
import { formatTime, shortId } from "./experimentLabUtils";

type Props = {
  historyTitle: string;
  labRows: RunWithResultDTO[];
  historyError: string | null;
  selected: string[];
  onToggle: (id: string) => void;
  onCompare: () => void;
  compareBusy: boolean;
  compareError: string | null;
  compare: RunCompareResponseDTO | null;
  /** Extra line after shots, e.g. n=3 for GHZ. */
  runParamSummary?: (row: RunWithResultDTO) => string | null;
};

export function ExperimentRunHistorySection({
  historyTitle,
  labRows,
  historyError,
  selected,
  onToggle,
  onCompare,
  compareBusy,
  compareError,
  compare,
  runParamSummary,
}: Props) {
  return (
    <section className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 md:p-5 space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-500">
          Historial ({historyTitle})
        </h3>
        <Link
          href="/runs"
          className="text-sm font-medium text-cyan-700 underline dark:text-cyan-400"
        >
          Ver todo el historial
        </Link>
      </div>
      {historyError ? (
        <p className="text-sm text-amber-800 dark:text-amber-200">{historyError}</p>
      ) : null}
      {labRows.length === 0 && !historyError ? (
        <p className="text-sm text-zinc-500">Aún no hay runs completados con resultado.</p>
      ) : (
        <ul className="space-y-2">
          {labRows.map((row) => {
            const dist = row.result.artifacts.measurement_distribution;
            const parts =
              dist?.labels.map((lab, i) => `${lab}:${dist.counts[i] ?? 0}`).join("  ") ?? "—";
            const checked = selected.includes(row.run.id);
            const paramTag = runParamSummary?.(row) ?? null;
            return (
              <li
                key={row.run.id}
                className="flex flex-wrap items-center gap-3 text-sm border border-zinc-200/60 dark:border-zinc-800 rounded-lg px-3 py-2"
              >
                <input
                  type="checkbox"
                  className="rounded border-zinc-400"
                  checked={checked}
                  onChange={() => onToggle(row.run.id)}
                  aria-label={`Select run ${row.run.id}`}
                />
                <span className="font-mono text-cyan-700 dark:text-cyan-300 text-xs">
                  {shortId(row.run.id)}
                </span>
                {paramTag ? <span className="text-zinc-500 font-mono text-xs">{paramTag}</span> : null}
                <span className="text-zinc-500">shots: {row.run.shots}</span>
                <span className="font-mono text-xs text-zinc-600 dark:text-zinc-400 break-all min-w-0">
                  {parts}
                </span>
                <span className="text-zinc-400 text-xs ml-auto">{formatTime(row.run.created_at)}</span>
              </li>
            );
          })}
        </ul>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={selected.length !== 2 || compareBusy}
          onClick={() => void onCompare()}
          className="rounded-lg border border-cyan-600/50 bg-cyan-500/10 text-cyan-800 dark:text-cyan-200 px-4 py-2 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {compareBusy ? "Comparando…" : "Compare selected"}
        </button>
        {selected.length > 0 ? (
          <span className="text-xs text-zinc-500">{selected.length}/2 runs seleccionados</span>
        ) : null}
      </div>
      {compareError ? (
        <p className="text-sm text-red-600 dark:text-red-300">{compareError}</p>
      ) : null}
      {compare ? (
        <div className="mt-4 rounded-lg border border-cyan-500/30 bg-cyan-500/5 p-4 space-y-4">
          <h4 className="text-sm font-medium text-foreground/90">Comparación</h4>
          <div className="grid gap-2 text-xs sm:grid-cols-2 sm:gap-6">
            <dl className="space-y-1 text-zinc-600 dark:text-zinc-400">
              <div className="flex justify-between gap-2">
                <dt>Δ shots (B − A)</dt>
                <dd className="font-mono">{compare.shots_delta}</dd>
              </div>
              {compare.created_delta_ms != null ? (
                <div className="flex justify-between gap-2">
                  <dt>Δ tiempo (B − A)</dt>
                  <dd className="font-mono">{Math.round(compare.created_delta_ms)} ms</dd>
                </div>
              ) : null}
              <div className="flex justify-between gap-2">
                <dt>Run A</dt>
                <dd className="font-mono text-[10px] break-all">{compare.run_a.id}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt>Run B</dt>
                <dd className="font-mono text-[10px] break-all">{compare.run_b.id}</dd>
              </div>
            </dl>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <CompareAlignedBarRow
              title="Run A (histograma)"
              labels={compare.aligned.labels}
              counts={compare.aligned.counts_a}
              shots={compare.aligned.shots_a}
              color="bg-cyan-500/70 dark:bg-cyan-400/60"
            />
            <CompareAlignedBarRow
              title="Run B (histograma)"
              labels={compare.aligned.labels}
              counts={compare.aligned.counts_b}
              shots={compare.aligned.shots_b}
              color="bg-violet-500/60 dark:bg-violet-400/50"
            />
          </div>
        </div>
      ) : null}
    </section>
  );
}
