import type { ResultDTO, RunDTO } from "@quantum-ops/shared-types";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchResult, fetchRun } from "@/lib/api";

type Props = { params: Promise<{ id: string }> };

export default async function RunDetailPage({ params }: Props) {
  const { id } = await params;
  let run: RunDTO;
  try {
    run = await fetchRun(id);
  } catch {
    notFound();
  }

  let result: ResultDTO | null = null;
  try {
    result = await fetchResult(run.id);
  } catch {
    result = null;
  }

  const experimentHref = `/experiments/${encodeURIComponent(run.template_id)}`;

  return (
    <main className="flex-1 px-6 py-12 max-w-3xl mx-auto w-full">
      <p className="mb-6 text-sm">
        <Link
          href="/runs"
          className="text-violet-700 underline-offset-2 hover:underline dark:text-violet-400"
        >
          ← Historial
        </Link>
      </p>

      <h1 className="text-2xl font-semibold tracking-tight">Detalle del run</h1>
      <p className="mt-1 font-mono text-sm text-zinc-600 dark:text-zinc-400 break-all">
        {run.id}
      </p>

      <dl className="mt-8 space-y-3 text-sm">
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          <dt className="w-32 shrink-0 text-zinc-500">Plantilla</dt>
          <dd>
            <Link
              href={experimentHref}
              className="text-cyan-700 underline-offset-2 hover:underline dark:text-cyan-400"
            >
              {run.template_id}
            </Link>
          </dd>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          <dt className="w-32 shrink-0 text-zinc-500">Estado</dt>
          <dd className="font-medium">{run.status}</dd>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          <dt className="w-32 shrink-0 text-zinc-500">Backend</dt>
          <dd>{run.backend}</dd>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          <dt className="w-32 shrink-0 text-zinc-500">Shots</dt>
          <dd>{run.shots}</dd>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          <dt className="w-32 shrink-0 text-zinc-500">Creado</dt>
          <dd className="text-zinc-700 dark:text-zinc-300">{run.created_at}</dd>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          <dt className="w-32 shrink-0 text-zinc-500">Actualizado</dt>
          <dd className="text-zinc-700 dark:text-zinc-300">{run.updated_at}</dd>
        </div>
        {run.error_message ? (
          <div className="rounded-lg border border-red-500/30 bg-red-500/5 px-3 py-2">
            <dt className="text-zinc-500">Error</dt>
            <dd className="mt-1 text-red-800 dark:text-red-200">{run.error_message}</dd>
          </div>
        ) : null}
      </dl>

      <section className="mt-10">
        <h2 className="text-lg font-medium">Parámetros</h2>
        <pre className="mt-3 overflow-x-auto rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-xs dark:border-zinc-800 dark:bg-zinc-950">
          {JSON.stringify(run.parameters, null, 2)}
        </pre>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-medium">Resultado</h2>
        {result ? (
          <div className="mt-3 space-y-4 text-sm">
            <p className="font-medium text-zinc-800 dark:text-zinc-200">
              {result.summary.headline}
            </p>
            {result.summary.details ? (
              <p className="text-zinc-600 dark:text-zinc-400">{result.summary.details}</p>
            ) : null}
            <pre className="overflow-x-auto rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-xs dark:border-zinc-800 dark:bg-zinc-950">
              {JSON.stringify(
                {
                  metrics: result.metrics,
                  artifacts: {
                    ...result.artifacts,
                    circuit_qasm: result.artifacts.circuit_qasm
                      ? "[…]"
                      : undefined,
                  },
                },
                null,
                2,
              )}
            </pre>
          </div>
        ) : (
          <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
            Sin resultados todavía (borrador, en curso o fallido). Vuelve al{" "}
            <Link href={experimentHref} className="underline-offset-2 hover:underline">
              experimento
            </Link>{" "}
            para ejecutar.
          </p>
        )}
      </section>
    </main>
  );
}
