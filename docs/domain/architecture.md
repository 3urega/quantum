# ARCHITECTURE BLUEPRINT — Quantum Ops Lab

**Version:** v0.1
**Status:** Execution Blueprint
**Purpose:** This document is the implementation source of truth for the first production-grade MVP architecture of Quantum Ops Lab.

---

# 1. Mission of this document

This file exists to answer one question clearly:

> **How should Quantum Ops Lab be built so that it is serious, extensible, and immediately executable?**

This is **not** a marketing document and **not** a vague product note.

This is the architectural contract that should guide:

* code structure
* domain boundaries
* API design
* persistence model
* UI/backend responsibilities
* implementation order

This blueprint should help the team or coding agents avoid:

* ad-hoc architecture
* random folder growth
* “just make it work” entropy
* mixing product UX concerns with quantum execution logic

---

# 2. High-Level System Overview

Quantum Ops Lab should be built as a **split system** with a strong boundary between:

## A. Product Application Layer

The user-facing product.

**Stack:**

* Next.js
* TypeScript
* Tailwind
* React
* App Router

**Responsibilities:**

* render the product UI
* manage experiment creation flows
* display runs, metrics, charts, comparisons
* orchestrate user interactions
* call backend APIs
* persist frontend-safe app state if needed

---

## B. Quantum Execution Layer

The computational execution engine.

**Stack:**

* Python
* FastAPI
* Qiskit
* Pydantic

**Responsibilities:**

* define experiment templates
* validate execution requests
* build circuits / optimization problems
* run simulations
* shape and return structured results
* expose execution APIs
* remain cleanly separable from UI

---

## C. Persistence Layer

Stores product and run history.

**Suggested stack:**

* PostgreSQL

**Responsibilities:**

* store experiment templates metadata (optional)
* store experiment runs
* store execution results
* store comparison lineage
* store audit / lifecycle events

---

# 3. Architecture Principles

These principles are mandatory.

## 3.1 Frontend is not the quantum engine

Do not put quantum logic in Next.js route handlers unless it is trivial orchestration.

The frontend app is the **product shell**, not the simulation engine.

---

## 3.2 Python owns computation

All experiment execution logic should live in the Python service.

This includes:

* Bell
* GHZ
* QAOA
* VQE
* backend-specific execution logic
* result shaping

---

## 3.3 The product must speak in domain objects

Avoid “raw SDK leakage” from Qiskit directly into frontend responses.

The frontend should receive **product-grade structured payloads**, not arbitrary scientific internals.

---

## 3.4 Reproducibility is a first-class concern

Every meaningful run should be representable as a durable record:

* what was executed
* with which parameters
* on which backend
* what result was produced

---

## 3.5 Templates before free-form

The first version should support **template-driven experiments**, not arbitrary quantum code execution.

This keeps the product coherent, safe, and buildable.

---

# 4. System Boundaries

## 4.1 What lives in Next.js

Next.js owns:

* landing
* experiment catalog
* experiment workspace UI
* run history UI
* compare UI
* charts and presentation
* request orchestration
* client-side state
* auth later (if ever needed)

---

## 4.2 What lives in FastAPI

FastAPI owns:

* experiment template registry
* parameter validation
* circuit / algorithm construction
* simulator execution
* metric extraction
* result shaping
* experiment comparison payload generation (optional)

---

## 4.3 What lives in PostgreSQL

Postgres owns:

* runs
* results
* versions / lineage
* audit events
* optional cached comparison summaries

---

# 5. Recommended Repository Structure

This should be implemented as a **monorepo-style workspace** with clear separation.

## Proposed root structure

```txt
quantum-ops-lab/
├─ apps/
│  ├─ web/                  # Next.js frontend
│  └─ quantum-api/          # FastAPI backend
├─ packages/
│  ├─ shared-types/         # Shared DTO contracts (TypeScript)
│  ├─ ui/                   # Shared UI components (optional later)
│  └─ config/               # Shared lint / ts / tooling config
├─ docs/
│  ├─ architecture/
│  ├─ product/
│  └─ api/
├─ infrastructure/
│  ├─ docker/
│  └─ database/
├─ .env.example
├─ docker-compose.yml
├─ package.json
└─ README.md
```

---

# 6. Frontend Architecture (Next.js)

The frontend should be organized as a **product app**, not as a generic folder dump.

## Recommended structure for `apps/web`

```txt
apps/web/
├─ src/
│  ├─ app/
│  │  ├─ layout.tsx
│  │  ├─ page.tsx
│  │  ├─ experiments/
│  │  │  ├─ page.tsx
│  │  │  └─ [slug]/page.tsx
│  │  ├─ runs/
│  │  │  ├─ page.tsx
│  │  │  └─ [id]/page.tsx
│  │  ├─ compare/
│  │  │  └─ page.tsx
│  │  └─ api/               # optional proxy routes only if needed
│  │
│  ├─ components/
│  │  ├─ layout/
│  │  ├─ marketing/
│  │  ├─ experiments/
│  │  ├─ runs/
│  │  ├─ compare/
│  │  ├─ charts/
│  │  └─ ui/
│  │
│  ├─ features/
│  │  ├─ experiments/
│  │  ├─ runs/
│  │  ├─ compare/
│  │  └─ workspace/
│  │
│  ├─ services/
│  │  ├─ api/
│  │  └─ queries/
│  │
│  ├─ lib/
│  │  ├─ utils/
│  │  ├─ formatters/
│  │  └─ constants/
│  │
│  ├─ hooks/
│  ├─ store/
│  ├─ types/
│  └─ styles/
├─ public/
└─ package.json
```

---

# 7. Frontend Module Responsibilities

## 7.1 `app/`

Owns routes and page-level composition.

Keep these files thin:

* fetch page-level data
* compose sections
* do not bury business logic here

---

## 7.2 `components/`

Pure presentation and reusable visual pieces.

Examples:

* hero blocks
* experiment cards
* metric cards
* charts
* side panels
* filters
* top bars

---

## 7.3 `features/`

Feature-specific UI logic and orchestration.

This is where real product behavior should live.

Examples:

* experiment launch form
* run comparison panel
* run history filters
* workspace state orchestration

This is a good place for:

* local feature hooks
* transformation logic
* screen-specific state

---

## 7.4 `services/`

All communication with backend APIs.

This should include:

* typed API clients
* request functions
* response parsing
* error shaping

Avoid fetch calls scattered through components.

---

## 7.5 `store/`

Use only if needed.

Recommended use:

* lightweight UI state
* persisted workspace preferences
* compare selection
* filters

Do **not** turn this into a dumping ground.

---

# 8. Backend Architecture (FastAPI)

The backend should be designed as a **clean computational service**.

## Recommended structure for `apps/quantum-api`

```txt
apps/quantum-api/
├─ app/
│  ├─ main.py
│  ├─ api/
│  │  ├─ routes/
│  │  │  ├─ health.py
│  │  │  ├─ templates.py
│  │  │  ├─ runs.py
│  │  │  └─ compare.py
│  │  └─ dependencies.py
│  │
│  ├─ core/
│  │  ├─ config.py
│  │  ├─ logging.py
│  │  └─ errors.py
│  │
│  ├─ domain/
│  │  ├─ experiment_template.py
│  │  ├─ experiment_run.py
│  │  ├─ experiment_result.py
│  │  ├─ experiment_metrics.py
│  │  ├─ comparison.py
│  │  └─ audit_event.py
│  │
│  ├─ application/
│  │  ├─ templates/
│  │  ├─ runs/
│  │  ├─ execution/
│  │  └─ compare/
│  │
│  ├─ infrastructure/
│  │  ├─ qiskit/
│  │  │  ├─ templates/
│  │  │  ├─ backends/
│  │  │  ├─ executors/
│  │  │  └─ metrics/
│  │  ├─ persistence/
│  │  │  ├─ models/
│  │  │  ├─ repositories/
│  │  │  └─ database.py
│  │  └─ serializers/
│  │
│  ├─ schemas/
│  │  ├─ templates.py
│  │  ├─ runs.py
│  │  ├─ results.py
│  │  └─ compare.py
│  │
│  └─ services/
│     ├─ template_registry.py
│     ├─ run_service.py
│     ├─ execution_service.py
│     └─ comparison_service.py
├─ tests/
├─ requirements.txt
└─ pyproject.toml
```

---

# 9. Backend Layer Responsibilities

## 9.1 `domain/`

Contains **core conceptual entities** of the system.

These are not HTTP-specific and not Qiskit-specific.

Examples:

* ExperimentTemplate
* ExperimentRun
* ExperimentResult
* ExperimentMetrics

---

## 9.2 `schemas/`

Owns FastAPI/Pydantic request/response models.

These are your API contracts.

---

## 9.3 `infrastructure/qiskit/`

Contains all Qiskit-specific implementation details.

This is where:

* Bell circuits are built
* GHZ circuits are built
* QAOA workflows are defined
* VQE workflows are defined

This folder should absorb SDK complexity so the rest of the app remains clean.

---

## 9.4 `services/`

Orchestrates application behavior.

Examples:

* template discovery
* run creation
* execution coordination
* result shaping
* comparison generation

---

## 9.5 `infrastructure/persistence/`

Owns DB models and repositories.

This layer should isolate:

* SQLAlchemy models
* session handling
* query logic
* persistence mappings

---

# 10. Core Domain Model

These are the core objects your system revolves around.

---

# 10.1 ExperimentTemplate

Represents a predefined experiment type.

## Fields

* `id`
* `slug`
* `name`
* `description`
* `category`
* `supported_backends`
* `parameter_schema`
* `visualization_type`
* `complexity_level`

## Example

```json
{
  "id": "bell-state",
  "slug": "bell-state",
  "name": "Bell State",
  "description": "Creates an entangled 2-qubit Bell state.",
  "category": "entanglement",
  "supported_backends": ["local_simulator", "noisy_simulator"],
  "parameter_schema": {
    "shots": { "type": "number", "required": true, "default": 1024 }
  },
  "visualization_type": "distribution",
  "complexity_level": "intro"
}
```

---

# 10.2 ExperimentRun

Represents a concrete execution request.

## Fields

* `id`
* `template_id`
* `backend`
* `shots`
* `parameters`
* `status`
* `created_at`
* `updated_at`

## Status values

* `draft`
* `queued`
* `running`
* `completed`
* `failed`

---

# 10.3 ExperimentResult

Represents the structured output of a run.

## Fields

* `run_id`
* `summary`
* `metrics`
* `artifacts`
* `raw_output` (optional internal use)

---

# 10.4 ExperimentMetrics

Represents technical execution metrics.

## Common fields

* `circuit_depth`
* `gate_counts`
* `qubit_count`
* `execution_time_ms`
* `transpile_time_ms`

## Optional fields depending on template

* `energy`
* `score`
* `convergence_curve`
* `measurement_distribution`

---

# 10.5 ComparisonRecord

Represents a comparison between runs.

## Fields

* `id`
* `run_ids`
* `comparison_summary`
* `diff_metrics`
* `created_at`

---

# 10.6 AuditEvent

Represents lifecycle or system trace events.

## Fields

* `id`
* `run_id`
* `actor`
* `event_type`
* `payload`
* `created_at`

## Example actor values

* `system`
* `user`
* `backend`

---

# 11. Experiment Template Strategy

The first version should be **template-driven**.

This means the backend should maintain a **registry** of supported experiment types.

## Registry concept

The system should have a registry that maps:

```txt
template_id -> execution handler
```

## Example

```txt
bell-state -> BellStateExecutor
ghz-state -> GHZExecutor
qaoa-routing -> QAOAExecutor
vqe-toy -> VQEExecutor
```

This is much better than writing “if/else quantum spaghetti” across the codebase.

---

# 12. Execution Architecture

This is the most important backend behavior.

---

# 12.1 Execution Flow

Every run should follow this lifecycle:

```txt
User configures experiment
→ Frontend sends run request
→ Backend validates request
→ Run record is created
→ Execution handler is selected
→ Circuit / problem is built
→ Backend executes experiment
→ Metrics are extracted
→ Structured result is persisted
→ Result is returned
```

---

# 12.2 Recommended execution abstraction

Each experiment template should implement a shared execution contract.

## Conceptual interface

Each executor should be responsible for:

* validating experiment-specific parameters
* building the quantum object / workflow
* selecting backend mode
* running execution
* extracting outputs
* shaping results

## Example executor families

* `BellStateExecutor`
* `GHZExecutor`
* `QAOAExecutor`
* `VQEExecutor`

---

# 12.3 Result shaping rule

Executors should **not** return arbitrary Qiskit internals directly.

They should return product-facing structured payloads such as:

```json
{
  "summary": {
    "title": "Bell State executed successfully",
    "description": "The resulting distribution shows correlated outcomes consistent with entanglement."
  },
  "metrics": {
    "circuitDepth": 2,
    "qubitCount": 2,
    "gateCounts": {
      "h": 1,
      "cx": 1,
      "measure": 2
    }
  },
  "artifacts": {
    "measurementDistribution": {
      "00": 0.51,
      "11": 0.49
    },
    "circuitDiagram": "...",
    "transpilationSummary": {}
  }
}
```

This is critical.

---

# 13. API Design

The frontend should talk to the backend through a small, deliberate API surface.

---

# 13.1 `GET /health`

Simple backend health endpoint.

## Returns

* service status
* version
* optional dependency checks

---

# 13.2 `GET /templates`

Returns the list of available experiment templates.

## Used by frontend for:

* experiment catalog
* workspace setup
* parameter form generation

---

# 13.3 `GET /templates/{template_id}`

Returns one template with detailed metadata.

## Used by frontend for:

* experiment workspace initialization

---

# 13.4 `POST /runs`

Creates a run request.

## Request body

```json
{
  "templateId": "bell-state",
  "backend": "local_simulator",
  "shots": 1024,
  "parameters": {}
}
```

## Response

```json
{
  "id": "run_123",
  "status": "draft"
}
```

---

# 13.5 `POST /runs/{run_id}/execute`

Executes a previously created run.

## Response

Can either:

* execute immediately and return completed result
* or return async state if long-running execution is added later

For MVP, immediate execution is acceptable.

---

# 13.6 `GET /runs`

Returns run history.

## Query params

Optional:

* template
* status
* backend
* date range

---

# 13.7 `GET /runs/{run_id}`

Returns run metadata and summary.

---

# 13.8 `GET /runs/{run_id}/results`

Returns the structured result payload.

---

# 13.9 `POST /compare`

Compares two or more runs.

## Request

```json
{
  "runIds": ["run_1", "run_2"]
}
```

## Response

A structured comparison object with:

* metadata comparison
* metric diffs
* chart-ready data
* optional textual summary

---

# 14. Database Design (MVP)

Use PostgreSQL from the start if possible.

---

# 14.1 Table: `experiment_run`

## Fields

* `id`
* `template_id`
* `backend`
* `shots`
* `parameters_json`
* `status`
* `created_at`
* `updated_at`

---

# 14.2 Table: `experiment_result`

## Fields

* `id`
* `run_id`
* `summary_json`
* `metrics_json`
* `artifacts_json`
* `raw_output_json`
* `created_at`

---

# 14.3 Table: `experiment_version`

## Fields

* `id`
* `run_id`
* `parent_version_id`
* `label`
* `created_at`

This is optional for MVP, but good to scaffold early if you want lineage later.

---

# 14.4 Table: `audit_event`

## Fields

* `id`
* `run_id`
* `actor`
* `event_type`
* `payload_json`
* `created_at`

---

# 15. Frontend → Backend Interaction Model

This is the intended product interaction contract.

---

# 15.1 Experiment Catalog Flow

```txt
Frontend loads /experiments
→ calls GET /templates
→ renders experiment cards
```

---

# 15.2 Experiment Workspace Flow

```txt
Frontend loads /experiments/[slug]
→ calls GET /templates/{slug}
→ renders configuration form
→ user chooses backend / shots / params
```

---

# 15.3 Run Execution Flow

```txt
User clicks Run
→ frontend calls POST /runs
→ receives run id
→ frontend calls POST /runs/{id}/execute
→ receives result
→ workspace updates to show metrics + visualizations
```

---

# 15.4 Run History Flow

```txt
Frontend loads /runs
→ calls GET /runs
→ renders run history table/cards
```

---

# 15.5 Compare Flow

```txt
User selects multiple runs
→ frontend calls POST /compare
→ renders side-by-side comparison UI
```

---

# 16. Frontend Screen Architecture

This section defines what the user should experience structurally.

---

# 16.1 Landing Page (`/`)

Purpose:

* communicate product thesis
* feel premium and frontier
* route users into experiments quickly

Sections:

* Hero
* Product thesis
* Experiment preview cards
* “How it works”
* CTA into experiment catalog

---

# 16.2 Experiment Catalog (`/experiments`)

Purpose:

* browse experiment types

Must include:

* Bell State
* GHZ
* QAOA
* VQE

Each card should show:

* name
* category
* complexity
* what it demonstrates

---

# 16.3 Experiment Workspace (`/experiments/[slug]`)

This is the core screen.

## Layout recommendation

```txt
┌─────────────────────────────────────────────┐
│ Top bar: experiment / backend / run status  │
├──────────────┬────────────────┬────────────┤
│ Config panel │ Main canvas    │ Insights   │
│ (left)       │ (center)       │ (right)    │
├──────────────┴────────────────┴────────────┤
│ Lower tabs: overview / circuit / results    │
└─────────────────────────────────────────────┘
```

### Left panel

* shots
* backend
* parameters
* run button

### Center panel

* circuit visualization
* charts
* main output

### Right panel

* metric cards
* execution summary
* audit / metadata

This screen should feel like:

> “I am operating a computational system.”

Not:

> “I am filling out a blog form.”

---

# 16.4 Run History (`/runs`)

Purpose:

* browse and revisit previous runs

Should support:

* filter by experiment
* filter by backend
* filter by status
* quick compare selection

---

# 16.5 Compare (`/compare`)

Purpose:

* compare runs side by side

Must support:

* metadata comparison
* metric comparison
* chart comparison
* result interpretation

---

# 17. Visualization Architecture

Visualization is a product pillar.

---

# 17.1 Visualization types by experiment

## Bell / GHZ

* circuit diagram
* measurement distribution
* gate counts
* depth summary

## QAOA

* optimization score
* selected solution
* cost evolution (if available)
* classical baseline comparison

## VQE

* energy curve
* convergence progression
* final energy
* backend metrics

---

# 17.2 Frontend visualization ownership

The frontend should render:

* charts
* metric cards
* result panels

The backend should provide:

* chart-ready data
* structured labels
* typed payloads

The backend should **not** send UI concerns like “card title colors” or random presentation strings.

---

# 18. Suggested Shared Contracts

Because frontend is TypeScript and backend is Python, you should stabilize your contracts early.

Recommended approach:

## Option A (simple)

Maintain a manually curated TypeScript DTO layer in:

```txt
packages/shared-types/
```

This package should define:

* TemplateDTO
* RunDTO
* ResultDTO
* CompareDTO

## Option B (more advanced later)

Generate TS types from OpenAPI.

For MVP, Option A is enough and much faster.

---

# 19. Recommended Implementation Order

This is the part your coding agent should actually execute against.

---

# Phase 1 — Foundation

## Goal

Create project structure and base contracts.

### Tasks

* scaffold monorepo structure
* create Next.js app
* create FastAPI app
* add Docker / env scaffolding
* define DTOs / contracts
* create backend health endpoint
* create frontend shell

### Done when

* both apps run locally
* frontend can call backend health

---

# Phase 2 — Experiment Templates

## Goal

Make templates real.

### Tasks

* implement template registry in backend
* expose `GET /templates`
* expose `GET /templates/{id}`
* build frontend experiment catalog page
* build experiment detail route

### Done when

* frontend shows real templates from backend

---

# Phase 3 — Bell State End-to-End

## Goal

First full vertical slice.

### Tasks

* implement BellStateExecutor
* create `POST /runs`
* create `POST /runs/{id}/execute`
* create result shaping
* create Bell workspace UI
* render measurement distribution
* render circuit metrics

### Done when

* a user can launch Bell State and see real results in UI

This is the first truly meaningful milestone.

---

# Phase 4 — GHZ

## Goal

Add complexity and scaling.

### Tasks

* implement GHZExecutor
* add qubit count parameter
* update frontend config form
* update result visualizations

### Done when

* GHZ is fully runnable and inspectable

---

# Phase 5 — Persistence

## Goal

Make the product stateful and serious.

### Tasks

* add PostgreSQL
* persist runs
* persist results
* add run history page
* add run detail page

### Done when

* previous runs can be revisited

---

# Phase 6 — Compare

## Goal

Introduce reasoning and product depth.

### Tasks

* implement compare endpoint
* implement compare UI
* support selecting runs
* render side-by-side metrics and charts

### Done when

* user can compare runs meaningfully

---

# Phase 7 — QAOA

## Goal

Add strategically important “serious” experiment.

### Tasks

* implement QAOA template
* add classical baseline
* expose score / optimization metrics
* create comparison visuals

### Done when

* user can compare a quantum optimization workflow against a classical baseline

This is one of the most portfolio-powerful milestones.

---

# Phase 8 — VQE

## Goal

Add advanced variational workflow.

### Tasks

* implement VQE toy problem
* expose convergence / energy metrics
* build dedicated result views

### Done when

* VQE runs are visually and technically understandable

---

# 20. What the coding agent should NOT do

This is important.

The coding agent should **not**:

* invent random architecture patterns not justified by current scope
* over-engineer auth or multi-user systems now
* add unnecessary AI assistant features before core execution exists
* build a free-form circuit IDE before templates work
* tightly couple frontend UI to raw Qiskit internals
* add dark cyberpunk styling that harms readability
* create “placeholder fake science” instead of structured real outputs

---

# 21. Definition of a Good MVP Build

A good MVP is not:

* huge
* broad
* full of tabs and empty states

A good MVP is one where:

* Bell works beautifully
* GHZ works clearly
* runs are persisted
* compare is useful
* QAOA adds strategic depth
* the UI feels premium and intentional

That is enough to make this product memorable.

---

# 22. Final Build Thesis

Quantum Ops Lab should be built as:

> **A premium computational workstation for structured quantum experimentation**

This means the product must feel like:

* a tool
* a system
* a serious interface

—not like:

* a tutorial
* a science fair toy
* a glorified chart dashboard

Every implementation decision should reinforce that identity.
