/**
 * Templates registered in the API do not all have a Qiskit executor + UI workspace yet.
 * Source of truth for executors: apps/quantum-api/app/api/routes/runs.py
 * MVP product focus: roadmap_mvp.md Fase C (Bell = hero, GHZ = secondary).
 */

import type { TemplateDTO } from "@quantum-ops/shared-types";

export type TemplateExecutionStatus = "available" | "upcoming";

/** Bell is the single "hero" path for the current MVP; GHZ is fully supported but secondary. */
export type TemplateMvpRole = "hero" | "secondary" | "other";

const UPCOMING_TEMPLATE_IDS = new Set<string>(["qaoa-routing", "vqe-toy"]);

const HERO_TEMPLATE_ID = "bell-state";
const SECONDARY_TEMPLATE_ID = "ghz-state";

export function getTemplateExecutionStatus(templateId: string): TemplateExecutionStatus {
  if (UPCOMING_TEMPLATE_IDS.has(templateId)) return "upcoming";
  return "available";
}

export function getTemplateMvpRole(templateId: string): TemplateMvpRole {
  if (templateId === HERO_TEMPLATE_ID) return "hero";
  if (templateId === SECONDARY_TEMPLATE_ID) return "secondary";
  return "other";
}

function mvpOrder(role: TemplateMvpRole): number {
  if (role === "hero") return 0;
  if (role === "secondary") return 1;
  return 2;
}

/** Bell first, then secondary (GHZ), then the rest (e.g. upcoming templates). D.0 catalog ordering. */
export function sortTemplatesByMvpOrder(templates: TemplateDTO[]): TemplateDTO[] {
  return [...templates].sort((a, b) => {
    const d =
      mvpOrder(getTemplateMvpRole(a.id)) - mvpOrder(getTemplateMvpRole(b.id));
    if (d !== 0) return d;
    return a.name.localeCompare(b.name);
  });
}
