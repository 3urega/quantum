/**
 * Carga .env + .env.local (`.env.local` pisa claves de `.env`; el shell no se toca)
 * y ejecuta `npx cap sync android`. `capacitor.config.ts` también lee esos archivos.
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const webRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

function parseEnvFile(relative) {
  const p = join(webRoot, relative);
  if (!existsSync(p)) return {};
  const out = {};
  for (const line of readFileSync(p, "utf8").split("\n")) {
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

const merged = { ...parseEnvFile(".env"), ...parseEnvFile(".env.local") };
for (const [key, val] of Object.entries(merged)) {
  if (!(key in process.env)) process.env[key] = val;
}

const r = spawnSync("npx", ["cap", "sync", "android"], {
  stdio: "inherit",
  shell: true,
  cwd: webRoot,
  env: process.env,
});
process.exit(r.status ?? 1);
