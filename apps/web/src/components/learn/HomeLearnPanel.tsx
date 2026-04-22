"use client";

import Link from "next/link";
import { useLearnMode } from "@/contexts/LearnModeContext";

/**
 * Se muestra bajo el hero de la home solo con modo aprendizaje activo.
 */
export function HomeLearnPanel() {
  const { learnMode } = useLearnMode();
  if (!learnMode) return null;

  return (
    <section
      className="rounded-xl border-l-4 border-violet-500 bg-violet-50/80 px-5 py-4 text-sm text-zinc-800 dark:border-violet-400 dark:bg-violet-950/40 dark:text-zinc-200"
      aria-label="Guía de pasos (modo aprendizaje)"
    >
      <p className="font-medium text-violet-900 dark:text-violet-200 mb-2">Recorrido sugerido</p>
      <ol className="list-decimal list-inside space-y-2 text-zinc-700 dark:text-zinc-300">
        <li>
          Comprueba el estado de la API (bloque de salud arriba); debe estar <strong>ok</strong>{" "}
          para ejecutar experimentos reales.
        </li>
        <li>
          Abre el{" "}
          <Link href="/experiments" className="font-medium text-cyan-700 underline dark:text-cyan-400">
            catálogo de experimentos
          </Link>{" "}
          o entra directamente en un template (p. ej. Bell).
        </li>
        <li>
          En el experimento, ajusta parámetros, ejecuta y lee el histograma y las métricas. Las
          cajas violetas bajo el interruptor explican cada bloque mientras tengas este modo
          encendido.
        </li>
        <li>
          Para el fondo teórico con fórmulas, usa{" "}
          <Link href="/learn" className="font-medium text-violet-800 underline dark:text-violet-300">
            Aprende
          </Link>{" "}
          o los enlaces por experimento.
        </li>
      </ol>
    </section>
  );
}
