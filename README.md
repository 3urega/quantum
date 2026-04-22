# Quantum Ops Lab

Monorepo for **Quantum Ops Lab** — Next.js product shell + FastAPI quantum engine (Qiskit).

## MVP v1 (active)

The current execution plan is [**`roadmap_mvp.md`**](roadmap_mvp.md). Scope for v1: **Bell** as the hero experiment to polish first (compare runs, learn flow); **GHZ** is already end-to-end like Bell. Focus is **understandable** runs with persistence, then **comparing** at least two runs of the same template. **QAOA and VQE** are out of scope for this MVP until the checklist there is met. A longer product vision and historical backlog live under [`docs/domain/`](docs/domain/) (see note at the top of [`docs/domain/roadmap.md`](docs/domain/roadmap.md)).

## Setup

```bash
npm install
cd apps/quantum-api && python3 -m venv .venv && ./.venv/bin/pip install -r requirements.txt && cd ../..
```

Copy [`.env.example`](.env.example) into `apps/web/.env.local` and adjust if needed.

**PostgreSQL:** run metadata and results are stored in Postgres (`QUANTUM_API_DATABASE_URL` in `.env.example`). Before `npm run dev:api`, start a database — e.g. from the repo root:

```bash
docker compose up postgres -d
```

Then export `QUANTUM_API_DATABASE_URL` (or use a local `.env` file read by your shell) so it points at `127.0.0.1` and the same user/password/DB as in [docker-compose.yml](docker-compose.yml). With the full stack (`npm run docker:up`), the API container receives the URL to the `postgres` service automatically.

## Demo MVP v1 (~3 minutes)

1. **Arranca** la API y la web (ver *Development* abajo) con Postgres disponible. Si acabas de actualizar el repositorio, **reinicia** `uvicorn` para que existan `GET /runs/lab` y `POST /runs/compare` (ver [docs/VERIFY_BELL_MVP.md](docs/VERIFY_BELL_MVP.md) si el OpenAPI no los muestra).
2. Abre **http://localhost:3000** y comprueba el banner de salud de la API.
3. Clic en **Open Bell lab** (o ve a **/experiments/bell-state**).
4. Ajusta **Shots** si quieres; pulsa **Run experiment** (verás la secuencia H → CNOT en el diagrama) y el histograma.
5. Lanza un **segundo** run; en **Historial** marca **dos** filas y **Compare selected**; revisa el panel y el diff de `shots` / tiempos.
6. Despliega la **explicación** (acordeón) y, si aplica, el tutorial en `/learn/bell`.

Contrato JSON y errores: [docs/domain/experiment-lifecycle.md](docs/domain/experiment-lifecycle.md) (sección 7). Roadmap y DoD: [roadmap_mvp.md](roadmap_mvp.md) (v1.4).

## Development

Terminal 1 — API (default `http://127.0.0.1:8000`):

```bash
npm run dev:api
```

Terminal 2 — web (`http://localhost:3000`):

```bash
npm run dev
```

Open the home page to confirm API health, then **Open Bell lab** (or **Experiments** for the full catalog). **End-to-end execution** (Qiskit local simulator, workspace + `POST /runs/{id}/execute`) is wired for **Bell** and **GHZ** only. **QAOA** and **VQE** are listed in the API catalog but have **no executor** yet; running them returns *execution not implemented* (HTTP 501). For **Bell**, the lab view includes a **circuit diagram**, **histogram**, **run history with checkboxes**, and **`POST /runs/compare`** for two completed runs (same template). **Bloch:** 2D preview by default; an **optional 3D** (react-three-fiber) view loads in a collapsible block (WebGL). **GHZ** uses the same lab pattern and shared UI pieces (`/experiments/ghz-state`); the circuit diagram is GHZ-specific (H on q0 + CNOTs en cadena) and Bloch previews are omitted. Further Bloch polish (timeline, full `esfera.md` spec) follows `roadmap_mvp.md`. Completed runs appear under **Historial** (`/runs`) when Postgres is available.

## Tutoriales (español, LaTeX)

With the web app running, open **http://localhost:3000/learn** for MDX tutorials (KaTeX). Navigation: header link **“Aprende”**, experiment cards link theory pages, and Bell/GHZ workspaces link their modules. Editorial map: [`docs/tutoriales.md`](docs/tutoriales.md).

## Docker

Requires Docker Engine + Compose v2. From the repository root:

```bash
npm run docker:up
```

Or: `docker compose up --build`. Compose includes **postgres** (data volume `quantum_ops_pg`), **quantum-api**, and **web**. The UI is at [http://localhost:3000](http://localhost:3000) and the API at [http://localhost:8000](http://localhost:8000). The browser calls the API via `localhost` (see [.env.example](.env.example)). The `web` service sets `QUANTUM_API_SERVER_URL` to `http://quantum-api:8000` so **server-side** Next.js fetches (catalog, home health check, etc.) reach the API; inside the `web` container, `127.0.0.1:8000` would be wrong and surfaces as `fetch failed`.

- Detached: `npm run docker:up:detached`
- Build only: `npm run docker:build`

Images are defined under `infrastructure/docker/` (see [docker-compose.yml](docker-compose.yml)).

If `8000` or `3000` are already in use on the host, change the port mappings in `docker-compose.yml` (left side of `host:container`) and set `NEXT_PUBLIC_QUANTUM_API_URL` to match the API host port when rebuilding `web`.

## Layout

| Path | Role |
|------|------|
| `roadmap_mvp.md` | **Active** MVP plan (what we ship first) |
| `apps/web` | Next.js 16 (App Router), UI and API client |
| `apps/quantum-api` | FastAPI, templates, runs, Qiskit executors |
| `packages/shared-types` | Shared TypeScript DTOs |
| `docs/domain` | PRD, architecture, long-term roadmap (vision) |
| `docs/domain/experiment-lifecycle.md` | Run/Result lifecycle, `template_id` vs slug, metrics for comparison, **§7** compare/lab JSON + OpenAPI |
| `docs/VERIFY_BELL_MVP.md` | Comprobación manual de endpoints lab (Bell y GHZ) tras reiniciar la API |
| `docs/tutoriales.md` | Map of didactic content; live pages under `/learn` |

Product and execution boundaries are defined in [`docs/domain/architecture.md`](docs/domain/architecture.md).
