import type {
  HealthResponse,
  ResultDTO,
  RunCompareResponseDTO,
  RunDTO,
  RunWithResultDTO,
  TemplateDTO,
} from "@quantum-ops/shared-types";

import { getApiBase } from "./api-base";

export { getApiBase } from "./api-base";

async function parseJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status}: ${text || res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export async function fetchHealth(): Promise<HealthResponse> {
  const res = await fetch(`${getApiBase()}/health`, { cache: "no-store" });
  return parseJson<HealthResponse>(res);
}

export async function fetchTemplates(): Promise<TemplateDTO[]> {
  const res = await fetch(`${getApiBase()}/templates`, { cache: "no-store" });
  return parseJson<TemplateDTO[]>(res);
}

export async function fetchTemplate(id: string): Promise<TemplateDTO> {
  const res = await fetch(`${getApiBase()}/templates/${encodeURIComponent(id)}`, {
    cache: "no-store",
  });
  return parseJson<TemplateDTO>(res);
}

export async function fetchRuns(
  limit = 50,
  offset = 0,
  templateId?: string,
): Promise<RunDTO[]> {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });
  if (templateId) {
    params.set("template_id", templateId);
  }
  const res = await fetch(`${getApiBase()}/runs?${params}`, {
    cache: "no-store",
  });
  return parseJson<RunDTO[]>(res);
}

/** Completed runs for one template, each with full result (for lab history + compare). */
export async function fetchRunsForLab(
  templateId: string,
  limit = 20,
): Promise<RunWithResultDTO[]> {
  const params = new URLSearchParams({
    template_id: templateId,
    limit: String(limit),
  });
  const res = await fetch(`${getApiBase()}/runs/lab?${params}`, {
    cache: "no-store",
  });
  return parseJson<RunWithResultDTO[]>(res);
}

export async function fetchRun(runId: string): Promise<RunDTO> {
  const res = await fetch(
    `${getApiBase()}/runs/${encodeURIComponent(runId)}`,
    { cache: "no-store" },
  );
  return parseJson<RunDTO>(res);
}

export async function createRun(body: {
  template_id: string;
  backend: string;
  shots: number;
  parameters: Record<string, unknown>;
}): Promise<RunDTO> {
  const res = await fetch(`${getApiBase()}/runs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return parseJson<RunDTO>(res);
}

export async function executeRun(runId: string): Promise<RunDTO> {
  const res = await fetch(`${getApiBase()}/runs/${encodeURIComponent(runId)}/execute`, {
    method: "POST",
  });
  return parseJson<RunDTO>(res);
}

export async function fetchResult(runId: string): Promise<ResultDTO> {
  const res = await fetch(`${getApiBase()}/runs/${encodeURIComponent(runId)}/results`, {
    cache: "no-store",
  });
  return parseJson<ResultDTO>(res);
}

export async function compareRuns(
  runIdA: string,
  runIdB: string,
): Promise<RunCompareResponseDTO> {
  const res = await fetch(`${getApiBase()}/runs/compare`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ run_id_a: runIdA, run_id_b: runIdB }),
  });
  return parseJson<RunCompareResponseDTO>(res);
}
