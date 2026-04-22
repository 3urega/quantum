"use client";

import type { ReactNode } from "react";
import { useLearnMode } from "@/contexts/LearnModeContext";

type Props = {
  /** Título breve del paso (p. ej. "Paso 2 · Parámetros"). */
  title?: string;
  children: ReactNode;
  className?: string;
};

/**
 * Caja de ayuda visible solo con **Modo aprendizaje** activo en el header.
 */
export function LearnCallout({ title, children, className = "" }: Props) {
  const { learnMode } = useLearnMode();
  if (!learnMode) return null;

  return (
    <div
      className={`rounded-lg border-l-4 border-violet-500 bg-violet-50/80 px-4 py-3 text-sm text-zinc-800 dark:border-violet-400 dark:bg-violet-950/40 dark:text-zinc-200 ${className}`}
      role="note"
    >
      {title ? (
        <p className="font-medium text-violet-900 dark:text-violet-200 mb-1.5">{title}</p>
      ) : null}
      <div className="text-zinc-700 dark:text-zinc-300 leading-relaxed">{children}</div>
    </div>
  );
}
