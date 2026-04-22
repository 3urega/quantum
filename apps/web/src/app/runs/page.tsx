import type { RunDTO } from "@quantum-ops/shared-types";
import Link from "next/link";
import { RunsLearnPanel } from "@/components/learn/RunsLearnPanel";
import { fetchRuns } from "@/lib/api";

function statusStyle(status: RunDTO["status"]): string {
  switch (status) {
    case "completed":
      return "text-emerald-700 dark:text-emerald-400";
    case "failed":
      return "text-red-700 dark:text-red-400";
    case "running":
    case "queued":
      return "text-amber-700 dark:text-amber-400";
    default:
      return "text-zinc-600 dark:text-zinc-400";
  }
}

export default async function RunsPage() {
  let runs: RunDTO[] = [];
  let error: string | null = null;
  try {
    runs = await fetchRuns(100, 0);
  } catch (e) {
    error = e instanceof Error ? e.message : "No se pudo cargar el historial";
  }

  return (
    <main className="flex-1 px-6 py-12 max-w-5xl mx-auto w-full">
      <div className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight">
          Historial de ejecuciones
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Las ejecuciones se guardan en el servidor; tras reiniciar la API siguen
          disponibles si la base de datos está activa.
        </p>
      </div>

      <RunsLearnPanel />

      {error ? (
        <p className="rounded-lg border border-amber-500/40 bg-amber-500/5 px-4 py-3 text-sm text-amber-900 dark:text-amber-100">
          {error}
        </p>
      ) : null}

      {!error && runs.length === 0 ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Aún no hay runs. Ejecuta un experimento desde{" "}
          <Link href="/experiments" className="text-cyan-600 underline-offset-2 hover:underline dark:text-cyan-400">
            Experimentos
          </Link>
          .
        </p>
      ) : null}

      <ul className="mt-6 space-y-3">
        {runs.map((r) => (
          <li key={r.id}>
            <Link
              href={`/runs/${encodeURIComponent(r.id)}`}
              className="flex flex-wrap items-baseline justify-between gap-2 rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-3 transition-colors hover:border-cyan-500/40 dark:border-zinc-800 dark:bg-zinc-950/30 dark:hover:border-cyan-500/30"
            >
              <span className="font-mono text-sm text-zinc-800 dark:text-zinc-200">
                {r.id.slice(0, 8)}…
              </span>
              <span className="text-sm text-zinc-700 dark:text-zinc-300">
                {r.template_id}
              </span>
              <span
                className={`text-xs font-medium uppercase tracking-wide ${statusStyle(r.status)}`}
              >
                {r.status}
              </span>
              <span className="text-xs text-zinc-500">{r.created_at}</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
