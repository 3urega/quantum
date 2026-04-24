/**
 * Public API base used by the browser. `NEXT_PUBLIC_*` is normally inlined at `next build`;
 * in Docker/Railway the build can miss it, so the root layout also injects `window.__QUANTUM_API_BASE__`
 * at request time (see `QuantumApiBaseScript`).
 */
export function ensureApiBaseUrl(raw: string): string {
  const s = raw.trim();
  if (!s) {
    return "http://127.0.0.1:8000";
  }
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//u.test(s)) {
    return s.replace(/\/+$/, "");
  }
  if (s.startsWith("127.0.0.1") || s.startsWith("localhost")) {
    return `http://${s}`.replace(/\/+$/, "");
  }
  if (s.includes(":") && !s.includes(".")) {
    return `http://${s}`.replace(/\/+$/, "");
  }
  if (s.includes(".internal") || s.includes("cluster.local")) {
    return `http://${s}`.replace(/\/+$/, "");
  }
  return `https://${s}`.replace(/\/+$/, "");
}

/**
 * Resolves the FastAPI base URL for the current runtime (RSC, Route Handlers, or browser).
 */
export function getApiBase(): string {
  if (typeof window !== "undefined" && window.__QUANTUM_API_BASE__) {
    return ensureApiBaseUrl(window.__QUANTUM_API_BASE__);
  }
  if (typeof window === "undefined") {
    return ensureApiBaseUrl(
      process.env.QUANTUM_API_SERVER_URL
        || process.env.NEXT_PUBLIC_QUANTUM_API_URL
        || "http://127.0.0.1:8000",
    );
  }
  return ensureApiBaseUrl(
    process.env.NEXT_PUBLIC_QUANTUM_API_URL ?? "http://127.0.0.1:8000",
  );
}
