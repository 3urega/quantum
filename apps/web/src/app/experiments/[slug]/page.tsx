import Link from "next/link";
import { notFound } from "next/navigation";
import { BellWorkspace } from "@/components/experiments/BellWorkspace";
import { GhzWorkspace } from "@/components/experiments/GhzWorkspace";
import { fetchTemplate } from "@/lib/api";
import { tutorialByTemplateId } from "@/lib/learn";

type Props = { params: Promise<{ slug: string }> };

export default async function ExperimentDetailPage({ params }: Props) {
  const { slug } = await params;
  let template;
  try {
    template = await fetchTemplate(slug);
  } catch {
    notFound();
  }

  return (
    <main className="flex-1 px-6 py-10 max-w-5xl mx-auto w-full">
      <Link
        href="/experiments"
        className="text-sm text-zinc-500 hover:text-foreground transition-colors"
      >
        ← Catalog
      </Link>
      <header className="mt-6 mb-10">
        <p className="text-xs font-mono uppercase tracking-widest text-cyan-700 dark:text-cyan-400">
          {template.category}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight mt-2">{template.name}</h1>
        <p className="mt-3 text-zinc-600 dark:text-zinc-400 max-w-3xl">{template.description}</p>
      </header>

      {template.id === "bell-state" ? (
        <BellWorkspace template={template} />
      ) : template.id === "ghz-state" ? (
        <GhzWorkspace template={template} />
      ) : (
        <div className="rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 p-8 text-center text-zinc-600 dark:text-zinc-400 space-y-4">
          <p className="font-medium text-foreground">Execution not wired in the UI yet</p>
          <p className="mt-2 text-sm">
            This template is registered on the API. Bell state is the first end-to-end path;
            GHZ, QAOA, and VQE follow the architecture roadmap.
          </p>
          {tutorialByTemplateId[template.id] ? (
            <p className="text-sm">
              <Link
                href={tutorialByTemplateId[template.id].href}
                className="font-medium text-violet-700 underline underline-offset-2 dark:text-violet-400"
              >
                {tutorialByTemplateId[template.id].label}
              </Link>{" "}
              (español, con contexto matemático).
            </p>
          ) : null}
        </div>
      )}
    </main>
  );
}
