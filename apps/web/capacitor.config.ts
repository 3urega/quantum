import type { CapacitorConfig } from "@capacitor/cli";
import * as fs from "fs";
import * as path from "path";

// `npx cap sync` transpila este archivo a CommonJS; usar `__dirname`, no `import.meta`.
const configDir = __dirname;

/**
 * Leer `.env` / `.env.local` (local pisa `.env`; no se sobrescribe el shell)
 * para que `npx cap sync` vea `CAPACITOR_SERVER_URL` sin export manual.
 */
function parseEnvFile(relative: string): Record<string, string> {
  const p = path.join(configDir, relative);
  if (!fs.existsSync(p)) return {};
  const out: Record<string, string> = {};
  for (const line of fs.readFileSync(p, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq <= 0) continue;
    const key = t.slice(0, eq).trim();
    let val = t.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

function applyEnvFiles() {
  const merged = { ...parseEnvFile(".env"), ...parseEnvFile(".env.local") };
  for (const [key, val] of Object.entries(merged)) {
    if (!(key in process.env)) process.env[key] = val;
  }
}

applyEnvFiles();

/**
 * Camino B (MVP móvil): WebView carga el front desplegado vía `server.url`.
 * Define `CAPACITOR_SERVER_URL` (HTTPS) en `apps/web/.env` o `.env.local`.
 */
const serverUrl = process.env.CAPACITOR_SERVER_URL?.replace(/\/$/, "");

function navigationAllowlist(): string[] {
  const origins = new Set<string>();
  if (serverUrl) {
    try {
      origins.add(new URL(serverUrl).origin);
    } catch {
      /* ignore */
    }
  }
  const api = process.env.NEXT_PUBLIC_QUANTUM_API_URL;
  if (api) {
    try {
      origins.add(new URL(api).origin);
    } catch {
      /* ignore */
    }
  }
  return [...origins];
}

const navAllow = serverUrl ? navigationAllowlist() : [];

const config: CapacitorConfig = {
  appId: "com.eurega.quantumops",
  appName: "Quantum Ops",
  webDir: "www",
  ...(serverUrl
    ? {
        server: {
          url: serverUrl,
          cleartext: false,
          androidScheme: "https",
          ...(navAllow.length > 0 ? { allowNavigation: navAllow } : {}),
        },
      }
    : {}),
};

export default config;
