import type {
  HealthResponse,
  ResultDTO,
  RunCompareResponseDTO,
  RunDTO,
  RunWithResultDTO,
  TemplateDTO,
} from "@quantum-ops/shared-types";

/**
 * Base URL of the FastAPI service.
 * - In the **browser**: `NEXT_PUBLIC_QUANTUM_API_URL` (host loopback, e.g. 127.0.0.1:8000).
 * - In **Node** (RSC, Route Handlers): optional `QUANTUM_API_SERVER_URL` so Docker SSR can
 *   call the API by compose service name (`http://quantum-api:8000`); 127.0.0.1 would point at
 *   the web container itself, causing `fetch failed`.
 */
export function getApiBase(): string {
  if (typeof window === "undefined" && process.env.QUANTUM_API_SERVER_URL) {
    return process.env.QUANTUM_API_SERVER_URL;
  }
  return process.env.NEXT_PUBLIC_QUANTUM_API_URL ?? "http://127.0.0.1:8000";
}

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
