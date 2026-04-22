import Link from "next/link";
import { notFound } from "next/navigation";
import { BellWorkspace } from "@/components/experiments/BellWorkspace";
import { GhzWorkspace } from "@/components/experiments/GhzWorkspace";
import { PlaceholderExperimentLearnNote } from "@/components/learn/PlaceholderExperimentLearnNote";
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
    <main
      className={
        template.id === "bell-state" || template.id === "ghz-state"
          ? "flex-1 px-4 py-8 sm:px-6 max-w-7xl mx-auto w-full"
          : "flex-1 px-6 py-10 max-w-5xl mx-auto w-full"
      }
    >
      <Link
        href="/experiments"
        className="text-sm text-zinc-500 hover:text-foreground transition-colors"
      >
        ← Catalog
      </Link>
      {template.id === "bell-state" || template.id === "ghz-state" ? null : (
        <header className="mt-6 mb-10">
          <p className="text-xs font-mono uppercase tracking-widest text-cyan-700 dark:text-cyan-400">
            {template.category}
          </p>
          <h1 className="text-3xl font-semibold tracking-tight mt-2">{template.name}</h1>
          <p className="mt-3 text-zinc-600 dark:text-zinc-400 max-w-3xl">{template.description}</p>
        </header>
      )}

      {template.id === "bell-state" ? (
        <div className="mt-6">
          <BellWorkspace template={template} />
        </div>
      ) : template.id === "ghz-state" ? (
        <div className="mt-6">
          <GhzWorkspace template={template} />
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 p-8 text-center text-zinc-600 dark:text-zinc-400 space-y-4">
          <PlaceholderExperimentLearnNote />
          <p className="font-medium text-foreground">Execution not wired in the UI yet</p>
          <p className="mt-2 text-sm">
            This template is listed in the catalog, but the MVP in{" "}
            <code className="text-xs font-mono">roadmap_mvp.md</code> focuses on closing Bell
            (hero), comparison between runs, and strong lab visuals. GHZ already runs end-to-end; QAOA
            and VQE are tracked for after that milestone.
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
