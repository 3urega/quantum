# Despliegue fijado: Vercel (web) + Railway (API + Postgres)

**No tienes que elegir entre cinco cosas:** esta es la vía. El front deja de pelear con Docker en Railway; el API sigue en contenedor donde encaja.

Orden: **Postgres y API en Railway** → luego **Vercel** con la URL del API → luego **CORS**.

---

## A) Railway — Postgres

1. Proyecto → **New** → **Database** → **PostgreSQL** (o el plugin que ofrezca tu cuenta).
2. Cuando exista, copia la **URL interna** o la que Railway exponga como `DATABASE_URL` (formato `postgresql://…` o `postgres://…`).

---

## B) Railway — servicio `quantum` (API)

1. **New** → **Empty service** / **GitHub** → mismo repo.
2. **Settings → Service**
   - **Root directory:** **vacío** (raíz del monorepo).
3. **Settings → Build**
   - **Builder:** Docker
   - **Dockerfile path:** `infrastructure/docker/Dockerfile.quantum-api`
4. **Settings → Deploy**
   - **Start command / Custom start command:** **vacío** (usa el `ENTRYPOINT` de la imagen).
5. **Variables** (mínimo):

| Variable | Valor |
|----------|--------|
| `QUANTUM_API_DATABASE_URL` | Pega el `DATABASE_URL` del paso A (o referencia al servicio Postgres en Railway, si usáis *Variable Reference*). |
| `QUANTUM_API_CORS_ORIGINS` | De momento: `https://localhost:3000` o un placeholder. Lo **actualizas** al final con la URL de Vercel. |

6. **Deploy** y espera a que pase el healthcheck.
7. Anota la URL pública del servicio, p. ej. `https://quantum-production-XXXX.up.railway.app` — es tu **API pública**.

**Comprueba** en el navegador: `https://<tu-dominio-api>/health` → JSON con `"status":"ok"`.

---

## C) Vercel — `apps/web` (Next)

1. [vercel.com](https://vercel.com) → **Add New** → **Project** → importar el **mismo** repo.
2. **Root Directory:** `apps/web`
3. **Framework Preset:** Next.js (debería autodetectar).
4. **Project settings** (una vez creado) → **General** → activa **Include source files outside of the Root Directory in the Build Step** (o equivalente) para que resuelva `packages/shared-types` y el monorepo.
5. El repo ya trae [`apps/web/vercel.json`](../apps/web/vercel.json): instala y construye **desde la raíz** del monorepo (`npm ci` + `npm run build -w @quantum-ops/web`).

6. **Environment Variables** (Production):

| Nombre | Valor |
|--------|--------|
| `NEXT_PUBLIC_QUANTUM_API_URL` | La URL pública del API del paso B (**https**, sin barra final o coherente con el código). |
| `QUANTUM_API_SERVER_URL` (opcional) | Misma URL pública del API, o la URL **privada** de Railway (red interna) si en SSR Vercel puede resolverla. Si dudas, **mismo valor que** `NEXT_PUBLIC_QUANTUM_API_URL` al principio. |

7. **Deploy**. Cuando acabe, anota el dominio de Vercel, p. ej. `https://tu-proyecto.vercel.app`.

---

## D) CORS — cerrar el círculo

En **Railway → servicio API → Variables**, edita:

`QUANTUM_API_CORS_ORIGINS` = `https://tu-proyecto.vercel.app,http://localhost:3000,http://127.0.0.1:3000`

(ajusta el dominio de Vercel; sin barra final en el origen).

Redeploy del API o reinicio del servicio para que cargue la variable.

---

## E) Móvil / Capacitor (si aplica)

En tu máquina, antes de `npx cap sync android`:

```bash
export CAPACITOR_SERVER_URL=https://tu-proyecto.vercel.app
```

(HTTPS del **front** en Vercel, no la URL del API.)

---

## F) Qué no hagas (para no reventar otra vez)

- No pongas el **mismo** servicio de Railway a construir el **web** y el **api** con el mismo criterio de **root** sin leer [railway-preflight.md](railway-preflight.md).
- No dejes un **Start command** raro en el API que pise el `docker-entrypoint.sh`.
- No desplieges el **web** en Vercel **sin** `NEXT_PUBLIC_QUANTUM_API_URL` en **Production** (es el build del cliente).

---

## Resumen

| Dónde | Qué |
|--------|-----|
| **Railway** | Postgres + API (`Dockerfile` de `infrastructure/`, root vacío) |
| **Vercel** | Solo `apps/web`, env con URL del API |
| **API** | CORS con origen = dominio de Vercel |

Esto es el despliegue: **Vercel + Railway(Postgres+API)**, y listo.
