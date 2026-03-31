<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (under `apps/web`) before writing any code. Heed deprecation notices.

# Useful commands

```bash
npm install
npm run dev       # Next.js en apps/web (http://localhost:3000)
npm run dev:api   # FastAPI + Qiskit en apps/quantum-api (http://127.0.0.1:8000)
npm run build
npm run lint
npm run docker:up        # Compose: web + quantum-api (requiere Docker)
npm run docker:build
```

Primera vez en Python: `cd apps/quantum-api && python3 -m venv .venv && ./.venv/bin/pip install -r requirements.txt`

Copy `.env.example` to `apps/web/.env.local` for `NEXT_PUBLIC_QUANTUM_API_URL`.

Didactic content (Spanish, MDX + KaTeX): routes under `/learn` in `apps/web/src/app/learn/`. See `docs/tutoriales.md` for the integration map.

# Architecture

- **Monorepo:** `apps/web` (Next.js product shell), `apps/quantum-api` (FastAPI + Qiskit execution).
- **Contracts:** `packages/shared-types` (TypeScript DTOs) + Pydantic schemas in the API — see `docs/domain/architecture.md`.
- Quantum circuits and simulation stay in **Python**, not in Next.js route handlers.

# Documentation

- Detailed conventions with examples live in `docs/`.
- **Do NOT read all docs upfront.**
- When working on a task, use this map to find and read only the docs relevant to your task:

```
docs/
├── code-style.md
├── documentation-format.md
├── backend/
│   ├── api-routes-reflect-metadata.md
│   ├── dependency-injection-diod.md
│   ├── hexagonal-architecture.md
│   └── thin-api-routes.md
├── database/
│   ├── not-null-fields.md
│   ├── table-naming-singular-plural-convention.md
│   └── text-over-varchar-char-convention.md
├── testing/
│   ├── mock-objects.md
│   └── object-mothers.md
├── domain/
│   ├── PRD.md
│   ├── roadmap.md
│   └── architecture.md
└── tutoriales.md    # mapa de tutoriales; contenido en /learn (app)
```

<!-- END:nextjs-agent-rules -->
