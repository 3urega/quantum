"use client";

import Link from "next/link";
import { useLearnMode } from "@/contexts/LearnModeContext";

export function ExperimentsLearnPanel() {
  const { learnMode } = useLearnMode();
  if (!learnMode) return null;

  return (
    <div
      className="mb-8 rounded-xl border-l-4 border-violet-500 bg-violet-50/80 px-4 py-3 text-sm text-zinc-800 dark:border-violet-400 dark:bg-violet-950/40 dark:text-zinc-200"
      role="note"
    >
      <p className="font-medium text-violet-900 dark:text-violet-200">Paso actual · Catálogo</p>
      <p className="mt-1 text-zinc-700 dark:text-zinc-300">
        Cada tarjeta es un <strong>template</strong> expuesto por la API. Elige uno cuya ejecución
        esté conectada en la UI (Bell, GHZ). Enlaces &quot;Teoría&quot; llevan a tutoriales en
        español. Al abrir un experimento, el modo aprendizaje añade textos bajo cada sección.
      </p>
      <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
        ¿Necesitas notación?{" "}
        <Link href="/learn/fundamentos" className="font-medium text-violet-800 underline dark:text-violet-300">
          Fundamentos
        </Link>
      </p>
    </div>
  );
}
