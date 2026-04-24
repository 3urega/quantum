# Pre-flight: qué comprobar **antes** de desplegar (y qué petará después si no)

Orden lógico para ahorrarte ciclos de “build OK → healthcheck roto → 502”.

---

## 1. Servicio `web` (Next)

| Comprobación | Si falla, qué verás |
|--------------|----------------------|
| **Root directory = vacío** (raíz del monorepo) | Build sin `workspaces` / `@quantum-ops/shared-types` 404, o `COPY` de Dockerfile incorrecto. |
| **Docker file path** = `infrastructure/docker/Dockerfile.web` (en el **panel**; el [`railway.json`](../railway.json) no fija `dockerfilePath` para no chocar con el API ni con *root* `apps/quantum-api`) | “Dockerfile not found” o se usa otro builder por error. |
| **Variables de *build*:** `NEXT_PUBLIC_QUANTUM_API_URL` = URL pública del API (HTTPS) | En producción, el JS llama a `127.0.0.1:8000` o queda incrustado un fallback malo. |
| **Variables de *runtime* (opcionales):** `QUANTUM_API_SERVER_URL` hacia el API alcanzable por el contenedor (p. ej. red privada) | Página inicio/SSR con “could not reach API” o errores al hidratar. |
| **Healthcheck** (si heredas [railway.json](../railway.json)): path `/health` o `/` (ambos existen en el front) | Despliegue nunca *healthy* aunque el contenedor levante. |
| **Puerto:** el server standalone lee `PORT`; no pongas en el *Start Command* cosas raras tipo `PORT=3000` que pisen a Railway. | 502, edge no conecta. |

**Comprobación local (misma lógica que el build de Railway, contexto = raíz del repo):**

```bash
# Desde la raíz del repositorio
docker build -f infrastructure/docker/Dockerfile.web -t qo-web:check --build-arg NEXT_PUBLIC_QUANTUM_API_URL="https://TU-API.railway.app" .
```

Si esto falla, el desplieuge en Railway fallará igual.

---

## 2. Servicio `quantum` (API)

| Comprobación | Si falla, qué verás |
|--------------|----------------------|
| **Contexto de Docker coherente** | Ver [railway-quantum-api](railway-quantum-api.md): **O** `Root = vacío` + Dockerfile `infrastructure/docker/Dockerfile.quantum-api`, **O** `Root = apps/quantum-api` + [`Dockerfile` en esa carpeta](../apps/quantum-api/Dockerfile). Mezclar *root* = subcarpeta con Dockerfile de *infra* → `... not found` en `COPY`. |
| `QUANTUM_API_DATABASE_URL` (Postgres en Railway o externo) | El proceso no arranca, crash loop, o tablas; healthcheck o arranque fallan. |
| `QUANTUM_API_CORS_ORIGINS` incluye el **origen exacto** del `web` (p. ej. `https://web-xxx.railway.app`) | Página carga, pero `fetch` al API: CORS en consola. |
| **Uvicorn** en `0.0.0.0` y **mismo `PORT` que Railway** (en la imagen usamos [`docker-entrypoint.sh`](../apps/quantum-api/docker-entrypoint.sh); no pongas *Start Command* en el panel que lo pise, p. ej. solo `uvicorn` sin `--host 0.0.0.0` o puerto fijo) | Healthcheck *service unavailable* aunque el build sea OK. |
| **`QUANTUM_API_DATABASE_URL`** apuntando al Postgres del proyecto (variable de referencia `DATABASE_URL` de Railway si aplica) | `create_all` en el arranque + conexión DB: sin URL buena o con conexión lenta, el API tarda o no levanta a tiempo. |

**Comprobación local:**

```bash
docker build -f infrastructure/docker/Dockerfile.quantum-api -t qo-api:check .
# Opcional: con DB real en la URL de entorno, run y curl /health
```

Con **root = `apps/quantum-api`**, construye con:

```bash
docker build -f apps/quantum-api/Dockerfile -t qo-api:subdir:check apps/quantum-api
```

---

## 3. Orden en Railway

1. Crea/arranca el **Postgres** (o define `QUANTUM_API_DATABASE_URL` correcta).  
2. Despliega el **API**; comprueba `https://&lt;api&gt;/health` en el navegador.  
3. Añade el origen del **web** a CORS en el API.  
4. Despliega el **web** con `NEXT_PUBLIC_QUANTUM_API_URL` al API ya conocido.  
5. Móvil / Capacitor: `CAPACITOR_SERVER_URL` = URL del **web**, no del API (ver [webview](../webview.md)).

---

## 4. Riesgo residual (no lo cubre el repo a solas)

- **Límites de memoria (Qiskit / builds Node):** en logs de build, OOM.  
- **Dominios y HTTPS:** mezclar `http` API y `https` web puede dar problemas de *mixed content* en navegador.  
- **Divergencia de rama:** Railway despliega el commit conectado; cámbialo o haz pull antes de reintentar.

---

## 5. Script útil en el monorepo

- `npm run check:railway-docker` — construye solo con Docker las imágenes `infrastructure/docker/Dockerfile.quantum-api` y `Dockerfile.web` (mismo *context* `.` = raíz del monorepo que en Railway con *Root* vacío). Requiere **Docker** en tu máquina/CI. Si falla aquí, el desplieuge con esos Dockerfiles fallará también.
- `npm run docker:build` (equivalente a `docker compose build`) levanta **web + api + postgres**; útil para probar E2E local.
