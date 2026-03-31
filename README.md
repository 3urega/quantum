# Quantum Ops Lab

Monorepo for **Quantum Ops Lab** — Next.js product shell + FastAPI quantum engine (Qiskit).

## Setup

```bash
npm install
cd apps/quantum-api && python3 -m venv .venv && ./.venv/bin/pip install -r requirements.txt && cd ../..
```

Copy [`.env.example`](.env.example) into `apps/web/.env.local` and adjust if needed.

## Development

Terminal 1 — API (default `http://127.0.0.1:8000`):

```bash
npm run dev:api
```

Terminal 2 — web (`http://localhost:3000`):

```bash
npm run dev
```

Open the home page to confirm API health, then **Experiments → Bell state** for the first end-to-end run.

## Tutoriales (español, LaTeX)

With the web app running, open **http://localhost:3000/learn** for MDX tutorials (KaTeX). Navigation: header link **“Aprende”**, experiment cards link theory pages, and Bell/GHZ workspaces link their modules. Editorial map: [`docs/tutoriales.md`](docs/tutoriales.md).

## Docker

Requires Docker Engine + Compose v2. From the repository root:

```bash
npm run docker:up
```

Or: `docker compose up --build`. The UI is at [http://localhost:3000](http://localhost:3000) and the API at [http://localhost:8000](http://localhost:8000). The browser calls the API via `localhost` (see comments in [.env.example](.env.example)).

- Detached: `npm run docker:up:detached`
- Build only: `npm run docker:build`

Images are defined under `infrastructure/docker/` (see [docker-compose.yml](docker-compose.yml)).

If `8000` or `3000` are already in use on the host, change the port mappings in `docker-compose.yml` (left side of `host:container`) and set `NEXT_PUBLIC_QUANTUM_API_URL` to match the API host port when rebuilding `web`.

## Layout

| Path | Role |
|------|------|
| `apps/web` | Next.js 16 (App Router), UI and API client |
| `apps/quantum-api` | FastAPI, templates, runs, Qiskit executors |
| `packages/shared-types` | Shared TypeScript DTOs |
| `docs/domain` | PRD, roadmap, architecture blueprint |
| `docs/tutoriales.md` | Map of didactic content; live pages under `/learn` |

Product and execution boundaries are defined in [`docs/domain/architecture.md`](docs/domain/architecture.md).
