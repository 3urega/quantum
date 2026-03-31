import type {
  HealthResponse,
  ResultDTO,
  RunDTO,
  TemplateDTO,
} from "@quantum-ops/shared-types";

export function getApiBase(): string {
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
