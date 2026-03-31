import Link from "next/link";
import { fetchHealth } from "@/lib/api";

export default async function Home() {
  let healthLabel = "unavailable";
  let healthOk = false;
  try {
    const h = await fetchHealth();
    healthOk = h.status === "ok";
    healthLabel = `${h.service}: ${h.status}`;
  } catch {
    healthLabel = "could not reach API (is `npm run dev:api` running?)";
  }

  return (
    <main className="flex flex-1 flex-col px-6 py-16 max-w-4xl mx-auto w-full gap-10">
      <div className="space-y-4">
        <p className="text-sm font-medium uppercase tracking-widest text-cyan-700 dark:text-cyan-400">
          Workstation
        </p>
        <h1 className="text-4xl font-semibold tracking-tight">
          Design, run, and read real quantum experiments.
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl">
          Template-driven Bell, GHZ, QAOA, and VQE flows with a split Next.js + FastAPI +
          Qiskit stack — reproducible runs and comparisons as the product grows.
        </p>
      </div>

      <div
        className={`rounded-xl border px-4 py-3 text-sm font-mono ${
          healthOk
            ? "border-emerald-500/40 bg-emerald-500/5 text-emerald-800 dark:text-emerald-200"
            : "border-amber-500/40 bg-amber-500/5 text-amber-900 dark:text-amber-100"
        }`}
      >
        <span className="opacity-70">API </span>
        {healthLabel}
      </div>

      <div className="flex flex-wrap gap-4">
        <Link
          href="/experiments"
          className="inline-flex items-center justify-center rounded-lg bg-foreground px-5 py-2.5 text-sm font-medium text-background hover:opacity-90 transition-opacity"
        >
          Open experiment catalog
        </Link>
        <Link
          href="/experiments/bell-state"
          className="inline-flex items-center justify-center rounded-lg border border-zinc-300 dark:border-zinc-600 px-5 py-2.5 text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
        >
          Jump to Bell state
        </Link>
        <Link
          href="/learn/fundamentos"
          className="inline-flex items-center justify-center rounded-lg border border-violet-300 dark:border-violet-700 px-5 py-2.5 text-sm font-medium text-violet-900 dark:text-violet-200 hover:bg-violet-50 dark:hover:bg-violet-950/40 transition-colors"
        >
          Tutoriales y fundamentos (ES)
        </Link>
      </div>
    </main>
  );
}
