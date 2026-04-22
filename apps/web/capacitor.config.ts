import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Camino B (MVP móvil): el WebView carga el front desplegado vía `server.url`.
 * Establece `CAPACITOR_SERVER_URL` (HTTPS) antes de `npx cap sync` / abrir Android.
 * Ver `.env.example` en la raíz del monorepo.
 */
const serverUrl = process.env.CAPACITOR_SERVER_URL?.replace(/\/$/, "");

const config: CapacitorConfig = {
  appId: "com.eurega.quantumops",
  appName: "Quantum Ops",
  webDir: "www",
  ...(serverUrl
    ? {
        server: {
          url: serverUrl,
          cleartext: false,
        },
      }
    : {}),
};

export default config;
