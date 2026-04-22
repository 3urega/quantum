/**
 * Currículo “modo aprendizaje” (alineado a /tutorial.md en el repo).
 * Usado para navegación Anterior / Siguiente e índice en /learn.
 */
export type Chapter = {
  order: number;
  slug: string;
  title: string;
  shortTitle: string;
};

export const CURRICULUM: readonly Chapter[] = [
  { order: 0, slug: "prerrequisitos", title: "Prerrequisitos matemáticos", shortTitle: "Prerrequisitos" },
  { order: 1, slug: "postulados", title: "Postulados (versión operativa)", shortTitle: "Postulados" },
  { order: 2, slug: "qubits", title: "Qubits", shortTitle: "Qubits" },
  { order: 3, slug: "puertas", title: "Puertas cuánticas", shortTitle: "Puertas" },
  { order: 4, slug: "circuitos", title: "Circuitos cuánticos", shortTitle: "Circuitos" },
  { order: 5, slug: "entrelazamiento", title: "Entrelazamiento", shortTitle: "Entrelazamiento" },
  { order: 6, slug: "medicion", title: "Medición y probabilidad", shortTitle: "Medición" },
  { order: 7, slug: "geometria-cuantica", title: "Geometría cuántica (Bloch)", shortTitle: "Geometría" },
  { order: 8, slug: "qc-practica", title: "Computación cuántica práctica", shortTitle: "QC práctica" },
  { order: 9, slug: "simulacion", title: "Simulación y backends", shortTitle: "Simulación" },
  { order: 10, slug: "interpretacion", title: "Interpretación mínima", shortTitle: "Interpretación" },
  { order: 11, slug: "puente-producto", title: "Puente al producto", shortTitle: "Puente al lab" },
] as const;

export function getChapterBySlug(slug: string): Chapter | undefined {
  return CURRICULUM.find((c) => c.slug === slug);
}

export function getPrevNext(slug: string): { prev: Chapter | null; next: Chapter | null } {
  const i = CURRICULUM.findIndex((c) => c.slug === slug);
  if (i < 0) return { prev: null, next: null };
  return {
    prev: i > 0 ? CURRICULUM[i - 1]! : null,
    next: i < CURRICULUM.length - 1 ? CURRICULUM[i + 1]! : null,
  };
}
