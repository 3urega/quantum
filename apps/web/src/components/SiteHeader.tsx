"use client";

import Link from "next/link";
import { useLearnMode } from "@/contexts/LearnModeContext";

export function SiteHeader() {
  const { learnMode, toggleLearnMode } = useLearnMode();

  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-8 min-w-0">
        <Link href="/" className="font-semibold tracking-tight text-lg shrink-0">
          Quantum Ops Lab
        </Link>
        <nav className="flex flex-wrap gap-4 text-sm text-zinc-600 dark:text-zinc-400">
          <Link className="hover:text-foreground transition-colors" href="/experiments">
            Experiments
          </Link>
          <Link className="hover:text-foreground transition-colors" href="/learn">
            Aprende
          </Link>
          <Link className="hover:text-foreground transition-colors" href="/runs">
            Historial
          </Link>
        </nav>
      </div>
      <div className="flex items-center gap-2">
        <span
          id="learn-mode-label"
          className="text-xs text-zinc-500 dark:text-zinc-400 max-sm:hidden"
        >
          Modo aprendizaje
        </span>
        <button
          type="button"
          onClick={toggleLearnMode}
          className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border transition-colors ${
            learnMode
              ? "border-violet-500/60 bg-violet-200/90 dark:border-violet-500/50 dark:bg-violet-900/50"
              : "border-zinc-300 bg-zinc-200 dark:border-zinc-600 dark:bg-zinc-800"
          }`}
          role="switch"
          aria-checked={learnMode}
          aria-labelledby="learn-mode-label"
        >
          <span
            className={`pointer-events-none inline-block h-6 w-6 translate-y-0.5 rounded-full shadow transition-transform ${
              learnMode
                ? "translate-x-5 bg-violet-600 dark:bg-violet-400"
                : "translate-x-0.5 bg-white dark:bg-zinc-200"
            }`}
          />
        </button>
        {learnMode ? (
          <span className="text-xs font-medium text-violet-700 dark:text-violet-300">Activado</span>
        ) : null}
      </div>
    </header>
  );
}
