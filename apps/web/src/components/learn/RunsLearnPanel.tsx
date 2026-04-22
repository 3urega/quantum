"use client";

import { useLearnMode } from "@/contexts/LearnModeContext";

export function RunsLearnPanel() {
  const { learnMode } = useLearnMode();
  if (!learnMode) return null;

  return (
    <div
      className="mb-8 rounded-xl border-l-4 border-violet-500 bg-violet-50/80 px-4 py-3 text-sm text-zinc-800 dark:border-violet-400 dark:bg-violet-950/40 dark:text-zinc-200"
      role="note"
    >
      <p className="font-medium text-violet-900 dark:text-violet-200">Paso · Historial</p>
      <p className="mt-1 text-zinc-700 dark:text-zinc-300">
        Cada fila es un <strong>run</strong> guardado: mismo template y parámetros pueden
        repetirse para comparar fluctuaciones estadísticas o cambios de shots. Abre un run para ver
        detalle si la vista lo permite.
      </p>
    </div>
  );
}
