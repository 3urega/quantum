/** Rutas de tutoriales en español por id de plantilla (API). */
export const tutorialByTemplateId: Record<
  string,
  { href: string; label: string }
> = {
  "bell-state": { href: "/learn/bell", label: "Teoría: estado de Bell" },
  "ghz-state": { href: "/learn/ghz", label: "Teoría: estado GHZ" },
  "qaoa-routing": { href: "/learn/qaoa", label: "Vista previa: QAOA" },
  "vqe-toy": { href: "/learn/vqe", label: "Vista previa: VQE" },
};
