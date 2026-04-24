import { headers } from "next/headers";
import { ensureApiBaseUrl } from "@/lib/api-base";

/**
 * Fuerza evaluación en el request (no caché estática) para inyectar la base del API
 * aunque `NEXT_PUBLIC_*` faltase en el `next build` de Docker; el servidor lee el env del contenedor.
 */
export const dynamic = "force-dynamic";

export async function QuantumApiBaseScript() {
  await headers();
  const fromEnv =
    process.env.NEXT_PUBLIC_QUANTUM_API_URL?.trim() ||
    process.env.QUANTUM_API_PUBLIC_BASE?.trim() ||
    "";
  if (!fromEnv) {
    return null;
  }
  const json = JSON.stringify(ensureApiBaseUrl(fromEnv));
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `window.__QUANTUM_API_BASE__=${json};`,
      }}
    />
  );
}
