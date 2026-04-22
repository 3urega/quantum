/**
 * Carga claves sencillas desde .env / .env.local (apps/web) y ejecuta
 * `npx cap sync android` para el Camino B (server.url). Sin dependencia extra;
 * asegúrate de definir CAPACITOR_SERVER_URL antes del sync para producción.
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const webRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

function loadEnvFile(relative) {
  const p = join(webRoot, relative);
  if (!existsSync(p)) return;
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
    if (!(key in process.env)) process.env[key] = val;
  }
}

loadEnvFile(".env");
loadEnvFile(".env.local");

const r = spawnSync("npx", ["cap", "sync", "android"], {
  stdio: "inherit",
  shell: true,
  cwd: webRoot,
  env: process.env,
});
process.exit(r.status ?? 1);
