"use client";

import { LearnCallout } from "@/components/LearnCallout";

/**
 * Solo en plantillas registradas en la API pero aún sin workspace en la UI.
 */
export function PlaceholderExperimentLearnNote() {
  return (
    <LearnCallout title="Paso · Template en preparación">
      Este experimento figura en el catálogo y la documentación, pero todavía no hay
      flujo de ejecución conectado en la interfaz. Mientras tanto, usa el enlace a la teoría
      para el marco matemático; la implementación seguirá el mismo patrón que Bell o GHZ.
    </LearnCallout>
  );
}
