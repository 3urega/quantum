# WebView + Railway + monorepo: lecciones para no repetir

Guía de referencia a partir de lo ocurrido al desplegar **Next (web)**, **FastAPI (API)** y **Capacitor (Android WebView)** en Railway, con un monorepo `npm` workspaces. Sirve para futuros proyectos con el mismo patrón.

---

## 1. Dos URLs, dos roles: no mezclar

| URL típica | Qué servicio es | Uso |
|------------|------------------|-----|
| `https://…up.railway.app` (API) | FastAPI: `/health` devuelve `service: "quantum-api"`, JSON `detail` en 404 | `NEXT_PUBLIC_*` del **build** del front, **no** `CAPACITOR_SERVER_URL` |
| `https://…up.railway.app` (web) | Next: responde **HTML** en `/` | `CAPACITOR_SERVER_URL` y CORS: origen de la app |

Si abres en el navegador la URL del **API** esperando el front, o configuras el WebView con la URL del API, verás 404, JSON, o un sitio “que no es la web”.

**Regla:** anota explícitamente en el tablero (Notion, etc.) *Web pública* y *API pública* con nombres distintos (p. ej. `web-production-…` vs `quantum-production-…`).

---

## 2. Monorepo en Railway: contexto y workspaces

- **Ruta `apps/web` sola** como *root directory* sin copiar el repo entero: `npm install` no resuelve paquetes workspace (`@quantum-ops/shared-types`, etc.) → **404 de registry / build roto**.

**Desde el inicio:**

- Construir la imagen con **contexto = raíz del monorepo** (Dockerfile que hace `COPY` de toda la raíz y `npm ci` en la raíz), **o** equivalente Nixpacks/Railpack con raíz en el monorepo.
- Un `railway.json` en la **raíz** que apunte al **Dockerfile del API** hará que un servicio *web* que no sobreescriba el builder use **el Dockerfile de Python** por error. Cada servicio en el dashboard debe tener:
  - **Builder** y **ruta al Dockerfile** correctos, **o**
  - Nixpacks con configuración alineada al stack del servicio.
- Revisar que no haya un único `railway.json` imponiendo `healthcheckPath` a **todos** los servicios (ver §4).
- Cuidado con **Railpack** detectando `package.json` en la raíz y eligiendo **Node** para un servicio que debería ser **Python** (o al revés): fijar **Dockerfile** en el servicio afectado.

---

## 3. Variables: build vs runtime (web)

- **`NEXT_PUBLIC_QUANTUM_API_URL`**: se **incrusta** en el bundle en el **`next build`**. Debe apuntar a la **URL pública HTTPS del API** en producción. Si el build de Railway no recibe esta variable, el cliente puede quedar llamando a `http://127.0.0.1:8000` → en el móvil es el “localhost del teléfono” (fallo total).

- **`QUANTUM_API_SERVER_URL`**: solo Node (SSR); URL **alcanzable desde el contenedor** del `web` (a veces red privada, p. ej. host interno de Railway hacia el servicio del API). Si no aplica, el servidor puede usar el mismo `NEXT_PUBLIC_…` si el API es accesible por esa URL pública.

**Al crear el servicio `web`:** en la fase de **Build** (ARG / variables de entorno de build) definir `NEXT_PUBLIC_QUANTUM_API_URL`, no confiar solo en variables solo “de runtime” si la plataforma no la inyecta en el `npm run build`.

---

## 4. Healthchecks: API ≠ Next

- El **API** FastAPI suele exponer `GET /health` → adecuado para el servicio *quantum-api*.
- Un **Next** por defecto **no** tiene el mismo contrato. Si en Railway el servicio *web* usa el mismo `healthcheckPath: /health` que el API, el probe recibe **404** y el despliegue nunca pasa a “healthy” → **502** / *Application failed to respond* aunque el contenedor levante.

**Opciones (elige una por servicio `web` en el panel o en un `railway.json` **solo** del web):**

1. Añadir en el front una ruta explícita, p. ej. `GET /health` con JSON `{ "status": "ok", "service": "web" }` (coherente con probes y con el patrón del API), o  
2. Poner el healthcheck en **`/`** (más carga) si no quieres ruta extra.

**No** reutilices ciegamente un único `railway.json` de raíz con `/health` pensado en el API para el servicio web sin que el Next tenga esa ruta o sin cambiar el path en el servicio *web*.

---

## 5. `output: "standalone"` y comando de arranque

- Con **`output: "standalone"`**, `next start` **no** es el modo soportado: Next pide **`node …/server.js`** del trazado standalone. Con **npm workspaces** (este repo), el fichero queda en  
  `apps/web/.next/standalone/apps/web/server.js` (relativo a la raíz del monorepo). Ver [`infrastructure/docker/Dockerfile.web`](infrastructure/docker/Dockerfile.web) y el script `start` de [`apps/web/package.json`](apps/web/package.json).
- El `server.js` lee `PORT` y hace `chdir` al directorio adecuado; no hace falta `next start` en producción.

---

## 6. `PORT` y el proxy de Railway

Railway inyecta **`PORT`** (p. ej. 8080). El proxy y el **healthcheck interno** hablan con **ese** puerto. Si en el `CMD` del Dockerfile forzáis `PORT=3000 npm start` o anuláis la variable, el proceso escucha en **3000** pero el edge en **el que Railway asignó** → *service unavailable* en el healthcheck sin que el código “falle”.

**Desde el inicio:**

- **Web (Next):** `ENV PORT=3000` como **default** local; **no** prefijar `PORT=3000` en el `CMD` si el PaaS ya define `PORT`. `CMD ["npm", "start", "-w", "@quantum-ops/web"]` hereda el entorno del contenedor.
- **API (uvicorn):** en contenedor hay que escuchar en **`0.0.0.0`**, no en el `127.0.0.1` por defecto de uvicorn (el edge no puede conectar). Usar **`--port $PORT`** (o `${PORT:-8000}`). Con **Railpack** sin Dockerfile, añadimos [`apps/quantum-api/nixpacks.toml`](apps/quantum-api/nixpacks.toml) y/o **Procfile**; lo más fiable en monorepo es el [Dockerfile del API](infrastructure/docker/Dockerfile.quantum-api) con contexto en la raíz (ver [docs/railway-quantum-api.md](docs/railway-quantum-api.md) y el [`railway.json`](railway.json) del API).

Comprueba en los **logs** del deploy: “Local: …” y el puerto deben coincidir con la variable `PORT` que ve el contenedor.

---

## 7. CORS (API) cuando ya hay URL del web

El navegador y el WebView (modo *servidor* remoto) envían `Origin: https://tu-dominio-del-web...`. En el **API** debe existir `QUANTUM_API_CORS_ORIGINS` (o el nombre que use tu settings) con **ese origen** exacto (esquema + host, puerto si aplica). Sin eso, el front “carga” pero los `fetch` al API fallan con error de CORS en consola.

Incluir también orígenes de **Capacitor** si pruebas empaquetado (`https://localhost`, `capacitor://localhost`, etc., según versión) si el stack lo requiere.

---

## 8. Android / Capacitor (WebView “remoto”)

- **`CAPACITOR_SERVER_URL`**: define **qué sitio carga** el WebView; debe ser la **URL HTTPS del servicio `web`**, no la del API.
- Debe estar presente al ejecutar `npx cap sync` (o vuestro `build:capacitor`) **antes** de compilar el APK. Si no, se empaqueta el fallback local (`www/`) o una config sin `server.url` coherente.
- **El `web` debe responder 200** en esa URL. Si el despliegue del front falla o da 502, el WebView mostrará *Application failed to respond*; no es un “bug de Capacitor” sino de **disponibilidad/URL** del host.

**Build nativo (Gradle):** definir `ANDROID_HOME` o `local.properties` con `sdk.dir=…` hacia el Android SDK; sin eso, `bundleRelease` / Android Studio fallan *antes* de probar en dispositivo.

---

## 9. Comprobación rápida antes de “culpar al móvil”

1. `curl -sI https://(URL-del-web)/` → **200** y `content-type: text/html*`.
2. `curl -sI https://(URL-del-api)/health` → **200** y JSON con estado del API.
3. Misma comprobación en el navegador: la app debe funcionar; si no, el WebView tampoco arreglará.
4. En el front, inspeccionar o el texto de depuración de API: la base debe ser la URL pública del API, no `127.0.0.1` en producción.

---

## 10. Checklist inicial (próximos proyectos)

- [ ] Monorepo: un Dockerfile (o build) del **web** con contexto de **raíz** y resolución de **workspaces**.
- [ ] Servicios Railway separados: **web** y **api** con builders y *healthchecks* acordes (path distinto; ruta `/health` en Next o `/` en web con documentación clara).
- [ ] `NEXT_PUBLIC_…` fijada en el **build** del web con la URL pública del API.
- [ ] CORS en el API con el **origen** del `web` de producción (y pruebas locales si hace falta).
- [ ] `PORT` / `HOSTNAME` alineados con el PaaS y comprobación en logs.
- [ ] Capacitor: `CAPACITOR_SERVER_URL` = URL del **web**; `sync` antes del APK; SDK Android instalado.
- [ ] Tres URLs en la documentación interna: **web pública**, **API pública**, **(opcional) API interna** para SSR.

---

## Archivos de referencia en este repo

- Front Docker: [infrastructure/docker/Dockerfile.web](infrastructure/docker/Dockerfile.web)
- API Docker / health API: [infrastructure/docker/Dockerfile.quantum-api](infrastructure/docker/Dockerfile.quantum-api), [apps/quantum-api/Procfile](apps/quantum-api/Procfile) (si el servicio API usa Railpack con *root* `apps/quantum-api`), [railway.json](railway.json)
- CORS: [apps/quantum-api/app/core/config.py](apps/quantum-api/app/core/config.py)
- Base URL de fetch: [apps/web/src/lib/api.ts](apps/web/src/lib/api.ts)
- Health del **web** (probe Railway): [apps/web/src/app/health/route.ts](apps/web/src/app/health/route.ts)
- Capacitor: [apps/web/capacitor.config.ts](apps/web/capacitor.config.ts)
- Plantilla de entornos: [.env.example](.env.example)
- `android/local.properties` y SDK: [apps/web/android/local.properties.example](apps/web/android/local.properties.example)

---

## Changelog mental

- **WebView y “Application failed to respond”:** suele ser el **host del front** caído (502), healthcheck fallido, o **URL errónea** (API en lugar de web).
- **Build ok pero réplicas nunca healthy:** healthcheck a un path que **no** existe en ese servicio (`/health` en Next sin ruta) o `PORT` incorrecto.
- **@oddisey / histórico:** mezclar *Railpack vs Dockerfile*, *root* del repo, *comando `next start` vs `node` en standalone*, *CMD exec vs shell* y *puerto* son fuentes reales de incidentes; conviene fijar una **matriz** por servicio (imagen, build, `CMD`, health, variables) y no copiar un único `railway.json` entre servicios con distintos runtimes.
