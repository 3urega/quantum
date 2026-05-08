"use client";

import type { ReactNode } from "react";
import { useLearnMode } from "@/contexts/LearnModeContext";

type Props = {
  /** Encabezado corto encima del bloque (solo visible con modo activo). */
  title?: string;
  children: ReactNode;
};

/**
 * Contenido didáctico extra visible únicamente cuando el usuario tiene activo el modo aprendizaje global (cabecera).
 */
export function LearnModeExtra({
  title = "Profundización (modo aprendizaje)",
  children,
}: Props) {
  const { learnMode } = useLearnMode();

  if (!learnMode) {
    return (
      <aside
        className="my-6 rounded-lg border border-dashed border-zinc-300 bg-zinc-50/70 px-4 py-3 text-sm text-zinc-600 dark:border-zinc-600 dark:bg-zinc-900/40 dark:text-zinc-400"
        aria-label="Contenido extra disponible con modo aprendizaje"
      >
        <p className="m-0 leading-relaxed">
          Hay <strong>demostraciones y desarrollos adicionales</strong> aquí. Activa{" "}
          <strong>Modo aprendizaje</strong> en la cabecera para mostrarlos.
        </p>
      </aside>
    );
  }

  return (
    <aside
      className="my-8 rounded-xl border-l-4 border-violet-500 bg-violet-50/80 px-5 py-4 dark:border-violet-400 dark:bg-violet-950/35 [&_h3]:mb-2 [&_h3]:mt-5 [&_h3]:text-lg [&_h3]:font-medium [&_h3]:first:mt-0 [&_p]:my-2 [&_p]:leading-relaxed [&_p]:text-zinc-800 dark:[&_p]:text-zinc-200 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:text-zinc-800 dark:[&_ul]:text-zinc-200 [&_li]:my-1 [&_.katex-display]:my-4 [&_.katex-display]:overflow-x-auto"
      aria-label={title}
    >
      <p className="mb-3 mt-0 text-xs font-semibold uppercase tracking-wide text-violet-900 dark:text-violet-200">
        {title}
      </p>
      <div>{children}</div>
    </aside>
  );
}
