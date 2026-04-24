# Desplegar `quantum-api` en Railway (monorepo)

## Mismo repositorio, servicio `web` (Next)

El [`railway.json`](../railway.json) de la raíz fija el **build del API** (Dockerfile del Python). **No** aplica al front: en el servicio **web** del mismo proyecto, en el **dashboard** de Railway configura su **build** por separado, por ejemplo:

- **Builder:** Docker  
- **Ruta al Dockerfile:** `infrastructure/docker/Dockerfile.web`  
- **Contexto / root del repo:** raíz del monorepo (sin fijar solo `apps/web`, porque el `COPY` del Dockerfile parte de la raíz).

Así se evita que un servicio herede el Dockerfile del API o que Railpack mezcle Node y Python de forma imprevista.

## Qué pasa: Railpack elige npm

En la **raíz** del repo hay un `package.json` (workspaces de npm). **Railpack** (builder por defecto) infiere **Node/npm** aunque pongas *Root directory* en `apps/quantum-api`, y falla o ignora el stack Python. Si aun así usas **Railpack** para el API, añadimos un arranque explícito en [`apps/quantum-api/nixpacks.toml`](../apps/quantum-api/nixpacks.toml) para escuchar en `0.0.0.0` y en `$PORT`.

El API es **Python + FastAPI**; el “simulador” (Qiskit Aer) vive en este mismo servicio, no en el front.

## Solución recomendada: build con Dockerfile (contexto = raíz)

Ya existe un Dockerfile pensado para monorepo: [`infrastructure/docker/Dockerfile.quantum-api`](../infrastructure/docker/Dockerfile.quantum-api) (hace `COPY apps/quantum-api/...` desde la **raíz** del repositorio).

1. **Root directory (en Railway):** déjalo **vacío** o la raíz del monorepo — **no** uses solo `apps/quantum-api` como raíz, o los `COPY` del Dockerfile fallan.
2. **Builder:** **Dockerfile** (no Railpack).
3. **Ruta del Dockerfile:** `infrastructure/docker/Dockerfile.quantum-api`  
   - En el dashboard del servicio, o usando [`railway.json`](../railway.json) en la raíz (`dockerfilePath` y `healthcheckPath`).

`railway.json` describe el **API**; el servicio **web** debe tener builder propio en el dashboard (ver arriba).

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
