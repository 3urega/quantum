# Desplegar `quantum-api` en Railway (monorepo)

Antes de enchufar variables o redeploy, revisa [railway-preflight.md](railway-preflight.md) (orden, Docker local, riesgos típicos).

## Mismo repositorio, servicio `web` (Next)

El [`railway.json`](../railway.json) fija *builder* Docker y *healthcheck*; **no** fija `dockerfilePath` (cada servicio o la raíz de build eligen el fichero, ver más abajo). **No** aplica al front: en el servicio **web** configura en el **dashboard** su build, por ejemplo:

- **Builder:** Docker  
- **Ruta al Dockerfile:** `infrastructure/docker/Dockerfile.web`  
- **Contexto / root del repo:** raíz del monorepo (sin fijar solo `apps/web`, porque el `COPY` del Dockerfile parte de la raíz).

Así se evita que un servicio herede el Dockerfile del API o que Railpack mezcle Node y Python de forma imprevista.

## Qué pasa: Railpack elige npm

En la **raíz** del repo hay un `package.json` (workspaces de npm). **Railpack** (builder por defecto) infiere **Node/npm** aunque pongas *Root directory* en `apps/quantum-api`, y falla o ignora el stack Python. Si aun así usas **Railpack** para el API, añadimos un arranque explícito en [`apps/quantum-api/nixpacks.toml`](../apps/quantum-api/nixpacks.toml) para escuchar en `0.0.0.0` y en `$PORT`.

El API es **Python + FastAPI**; el “simulador” (Qiskit Aer) vive en este mismo servicio, no en el front.

## Error típico: `failed to calculate checksum: "/apps/quantum-api/app": not found`

Eso pasa si en el servicio **quantum** configuraste **Root directory = `apps/quantum-api`** pero dejaste el Dockerfile de **infra** ([`infrastructure/docker/Dockerfile.quantum-api`](../infrastructure/docker/Dockerfile.quantum-api)). Ese Dockerfile hace `COPY apps/quantum-api/app` y solo es válido cuando el **contexto** es la **raíz del repo**; con contexto = subcarpeta, esa ruta no existe en el empaquetado.

**Tienes dos formas de arreglarlo (elige una):**

| Enfoque | Root directory (Railway) | Ruta al Dockerfile |
|--------|-------------------------|--------------------|
| **A (recomendada)** | **Vacío** (raíz del monorepo) | `infrastructure/docker/Dockerfile.quantum-api` (ruta explícita en el **panel** de Railway) |
| **B** | `apps/quantum-api` | [`apps/quantum-api/Dockerfile`](../apps/quantum-api/Dockerfile) (build solo sobre esa carpeta) |

## Solución recomendada: build con Dockerfile (contexto = raíz)

El Dockerfile de infra: [`infrastructure/docker/Dockerfile.quantum-api`](../infrastructure/docker/Dockerfile.quantum-api) (hace `COPY apps/quantum-api/...` desde la **raíz** del repositorio).

1. **Root directory (en Railway):** **vacío** = raíz del monorepo (no fijar `apps/quantum-api` salvo que uses el Dockerfile B de la tabla de arriba).
2. **Builder:** **Dockerfile** (no Railpack) para imágenes reproducibles.
3. **Ruta del Dockerfile:**
   - **Root = vacío:** en el servicio `quantum`, fija a mano **Docker file path** = `infrastructure/docker/Dockerfile.quantum-api` (el [`railway.json`](../railway.json) **no** incluye `dockerfilePath` para no forzar el Dockerfile de *infra* cuando el servicio usa **Root = `apps/quantum-api`**; si lo forzáramos, el build volvería a buscar `COPY apps/quantum-api/...` con un contexto erróneo).
   - **Root = `apps/quantum-api`:** usa el [`Dockerfile`](../apps/quantum-api/Dockerfile) de esa misma carpeta (paths `COPY` relativos a ella, sin `dockerfilePath` en el panel salvo el por defecto `Dockerfile`).

El [`railway.json`](../railway.json) de la raíz solo fija *builder* y *healthcheck*; el servicio **web** debe declarar en el panel su **propio** Dockerfile (ver inicio de este doc).

## Variables de entorno (mínimo)

| Variable | Descripción |
|----------|-------------|
| `QUANTUM_API_DATABASE_URL` | `postgresql+psycopg://...` (Postgres de Railway u otro) |
| `QUANTUM_API_CORS_ORIGINS` | Orígenes permitidos, separados por comas: URL de tu web (p. ej. Vercel) y, si aplica, `capacitor://` |
| `PORT` | Lo fija Railway automáticamente; el contenedor lo respeta (ver Dockerfile) |

Copia o adapta [`.env.example`](../.env.example).

## Comprobaciones

- Tras el deploy, abre `https://<tu-servicio>.up.railway.app/health` (o el dominio asignado). Debería devolver JSON `ok`.
- Si el healthcheck falla, revisa que la ruta sea exactamente `/health` (ya configurada en `railway.json`).

## Mismo repo, servicio “web” (opcional)

Si despliegas **Next** en otro servicio del mismo repositorio, no reutilices el `railway.json` del API: define en el **dashboard** de ese servicio su propio build (Nixpacks/Railpack para Node o Docker para `apps/web`).
