import type { TemplateDTO } from "@quantum-ops/shared-types";
import Link from "next/link";
import { ExperimentsLearnPanel } from "@/components/learn/ExperimentsLearnPanel";
import { fetchTemplates } from "@/lib/api";
import {
  getTemplateExecutionStatus,
  getTemplateMvpRole,
  sortTemplatesByMvpOrder,
} from "@/lib/experiment-availability";
import { tutorialByTemplateId } from "@/lib/learn";

export default async function ExperimentsPage() {
  let templates: TemplateDTO[] = [];
  let error: string | null = null;
  try {
    templates = await fetchTemplates();
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load templates";
  }

  return (
    <main className="flex-1 px-6 py-12 max-w-5xl mx-auto w-full">
      <div className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight">Experiment catalog</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Each template is defined and served by the quantum API.{" "}
          <strong className="text-foreground/90">Bell</strong> is the current MVP focus; open a
          card to configure and run where execution is available.
        </p>
      </div>

      <ExperimentsLearnPanel />

      {error ? (
        <p className="rounded-lg border border-amber-500/40 bg-amber-500/5 px-4 py-3 text-sm text-amber-900 dark:text-amber-100">
          {error}
        </p>
      ) : null}

      <ul className="grid gap-6 sm:grid-cols-2">
        {sortTemplatesByMvpOrder(templates).map((t) => {
          const tut = tutorialByTemplateId[t.id];
          const execution = getTemplateExecutionStatus(t.id);
          const mvpRole = getTemplateMvpRole(t.id);
          return (
            <li key={t.id} className="h-full">
              <div className="flex h-full flex-col rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/30 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/5 transition-all">
                <Link href={`/experiments/${t.slug}`} className="block flex-1 p-6">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <h2 className="text-lg font-medium">{t.name}</h2>
                    <div className="flex items-center gap-2 shrink-0">
                      {mvpRole === "hero" ? (
                        <span
                          className="text-[10px] font-medium rounded-full border border-cyan-500/60 bg-cyan-500/15 px-2 py-0.5 text-cyan-900 dark:text-cyan-200"
                          title="Experimento de referencia del MVP (roadmap_mvp.md)"
                        >
                          Foco MVP
                        </span>
                      ) : mvpRole === "secondary" ? (
                        <span
                          className="text-[10px] rounded-full border border-zinc-400/50 bg-zinc-500/10 px-2 py-0.5 text-zinc-700 dark:text-zinc-300"
                          title="Ruta E2E compatible; el pulido de producto se centra en Bell"
                        >
                          Secundario
                        </span>
                      ) : null}
                      {execution === "available" ? (
                        <span className="text-[10px] uppercase tracking-wide rounded-full border border-emerald-500/50 bg-emerald-500/10 px-2 py-0.5 text-emerald-800 dark:text-emerald-200">
                          Listo
                        </span>
                      ) : (
                        <span className="text-[10px] uppercase tracking-wide rounded-full border border-amber-500/50 bg-amber-500/10 px-2 py-0.5 text-amber-900 dark:text-amber-100">
                          Próximamente
                        </span>
                      )}
                      <span className="text-xs uppercase tracking-wide text-zinc-500">
                        {t.complexity_level}
                      </span>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400 line-clamp-3">
                    {t.description}
                  </p>
                  <p className="mt-4 text-xs font-mono text-cyan-700 dark:text-cyan-400">
                    {t.category} · {t.visualization_type}
                  </p>
                </Link>
                {tut ? (
                  <div className="border-t border-zinc-200 px-6 py-3 dark:border-zinc-800">
                    <Link
                      href={tut.href}
                      className="text-sm font-medium text-violet-700 underline-offset-2 hover:underline dark:text-violet-400"
                    >
                      {tut.label}
                    </Link>
                  </div>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
