# QUANTUM OPS LAB — ROADMAP EJECUTABLE PARA CURSOR

## Objetivo del roadmap

Construir un **MVP serio y visualmente potente** de una plataforma de experimentación cuántica basada en:

* **Next.js**
* **Tailwind**
* **Qiskit**
* **FastAPI**
* una UX premium
* experimentos reproducibles
* comparación entre backends y resultados

---

# FASE 0 — DEFINICIÓN DEL PRODUCTO

## Estado: antes de picar código “de verdad”

Esta fase evita que el proyecto se convierta en una suma de componentes bonitos sin tesis.

---

## ✅ Checklist Fase 0

* [x] Definir el **nombre provisional del producto**
* [x] Escribir una **frase de producto** de una línea
* [x] Definir los **3 tipos de experimento iniciales**
* [x] Definir el **scope exacto del MVP**
* [x] Definir qué es “wow” en este producto
* [x] Definir qué queda explícitamente fuera del MVP

**Scope MVP (v1):** catálogo de templates, workspace por experimento, ejecución local (simulador), historial en memoria hasta persistencia; experimentos: Bell, GHZ, QAOA vs clásico, VQE toy — alineado con [PRD.md](PRD.md).

**Explícitamente fuera del MVP v1:** multi‑tenant y auth de producto, circuit editor libre, backends cloud reales (IBM/Azure), ruido avanzado y calibración, colas distribuidas (Celery), capa “copilot” / IA, comparación multi‑run persistida avanzada (llega en fases posteriores del roadmap).

---

## Recomendación concreta

### Nombre provisional

**Quantum Ops Lab**

### Frase de producto

> A modern workspace to design, run, compare and understand quantum experiments.

### 3 experimentos iniciales del MVP

No metas demasiados.

Empieza con estos 3:

#### 1. **Bell / GHZ / Entanglement**

Para:

* visualización
* onboarding
* medición
* distribución de resultados

#### 2. **QAOA vs solver clásico**

Para:

* comparación cuántico vs clásico
* optimización
* storytelling fuerte

#### 3. **VQE toy problem**

Para:

* energía
* optimización variacional
* sensación de “serio”

---

## Lo que debe producir “wow”

Tu wow no debe ser “mira un circuito”.

Tu wow debe ser:

* elegir experimento en una UI preciosa
* lanzar ejecución
* ver circuitos + métricas + resultados + comparativas
* guardar versiones
* comparar runs
* sentir que estás operando un sistema serio

---

# FASE 1 — ARQUITECTURA BASE

## Meta: dejar montada la columna vertebral correcta

Aquí decides bien el shape del sistema.

---

## Arquitectura recomendada

# Frontend

* **Next.js**
* **App Router**
* **TypeScript**
* **Tailwind**
* **Framer Motion**
* **React Flow** (para experiment graph / workflow graph)
* **Recharts** o **Visx** (métricas)
* **Monaco** (si luego metes editor DSL / JSON / Python snippets)

# Backend

* **FastAPI**
* **Qiskit**
* **Pydantic**
* **Celery / RQ / simple background jobs** *(solo más adelante si hace falta)*
* SQLite o Postgres al principio, según tu preferencia

Mi recomendación:

## haz esto:

* **Next.js como producto principal**
* **FastAPI como “Quantum Engine”**
* **Postgres** si quieres hacerlo serio desde el principio

---

## Estructura recomendada del monorepo

```txt
quantum-ops-lab/
  apps/
    web/                 # Next.js app
    quantum-engine/      # FastAPI + Qiskit
  packages/
    ui/                  # componentes compartidos (opcional)
    types/               # tipos compartidos
  docs/
    product/
    architecture/
    prompts/
```

Si no quieres monorepo aún, hazlo simple:

```txt
quantum-ops-lab/
  web/
  quantum-engine/
  docs/
```

---

## ✅ Checklist Fase 1

* [x] Crear repo principal
* [x] Crear app **Next.js**
* [x] Crear servicio **FastAPI**
* [x] Crear estructura de carpetas limpia
* [x] Definir contrato HTTP entre frontend y backend
* [x] Añadir `.env.example` para ambos lados
* [x] Crear documentación base del proyecto

---

# FASE 2 — MODELO DE DOMINIO

## Meta: pensar como producto serio, no como demo

Aquí defines qué entidades existen en tu sistema.

---

# Entidades principales

Estas son las que yo pondría desde el principio:

---

## 1) **ExperimentTemplate**

Un tipo de experimento disponible.

Ejemplos:

* `bell_state`
* `ghz_state`
* `qaoa_routing`
* `vqe_toy`

```ts
type ExperimentTemplate = {
  id: string
  slug: string
  name: string
  description: string
  category: "entanglement" | "optimization" | "variational"
  parametersSchema: unknown
}
```

---

## 2) **ExperimentRun**

Una ejecución concreta.

```ts
type ExperimentRun = {
  id: string
  templateId: string
  backend: "local_simulator" | "noisy_simulator" | "cloud"
  shots: number
  parameters: Record<string, unknown>
  status: "draft" | "queued" | "running" | "completed" | "failed"
  createdAt: string
}
```

---

## 3) **ExperimentResult**

Resultado técnico.

```ts
type ExperimentResult = {
  runId: string
  metrics: {
    circuitDepth?: number
    gateCount?: number
    transpilationTimeMs?: number
    executionTimeMs?: number
  }
  distributions?: Record<string, number>
  energy?: number
  score?: number
  classicalBaseline?: {
    score?: number
    energy?: number
    executionTimeMs?: number
  }
}
```

---

## 4) **ExperimentVersion**

Para iteraciones y comparativas.

```ts
type ExperimentVersion = {
  id: string
  runId: string
  parentVersionId?: string
  label: string
  createdAt: string
}
```

---

## 5) **AuditEvent**

Esto te viene de perlas por lo que ya has construido con ATO.

```ts
type AuditEvent = {
  id: string
  runId: string
  actor: "system" | "user" | "engine"
  eventType: string
  payload: Record<string, unknown>
  createdAt: string
}
```

---

## ✅ Checklist Fase 2

* [ ] Definir entidades del dominio
* [ ] Definir tipos TypeScript compartidos
* [ ] Definir modelos Pydantic equivalentes
* [ ] Definir shape de respuestas del backend
* [ ] Documentar el ciclo de vida de un experimento

---

# FASE 3 — PRIMERA EXPERIENCIA USABLE

## Meta: que ya se sienta como producto

No empieces por “todo el backend”.

Empieza por la experiencia principal.

---

# Flujo MVP ideal

## El usuario entra y hace esto:

### Paso 1

Elige un experimento:

* Bell
* GHZ
* QAOA
* VQE

### Paso 2

Configura:

* backend
* shots
* parámetros

### Paso 3

Ejecuta

### Paso 4

Ve:

* circuito
* métricas
* resultados
* baseline
* comparativa

### Paso 5

Guarda el run

Eso ya es una experiencia muy buena.

---

# Pantallas principales del MVP

---

## 1) **Landing / Home**

No marketing.
Producto.

Debe comunicar inmediatamente:

> “esto es una workstation de experimentación”

Contenido:

* hero limpio
* cards de experimentos
* CTA “Launch experiment”
* mini previews de visualizaciones

---

## 2) **Experiment Catalog**

Una galería elegante de templates:

* Bell State
* GHZ State
* QAOA Routing
* VQE Toy Problem

Cada card debe mostrar:

* nombre
* categoría
* dificultad
* qué demuestra
* CTA “Open”

---

## 3) **Experiment Workspace**

Esta es la pantalla más importante.

Y aquí es donde tienes que lucirte.

---

# Layout recomendado del Workspace

```txt
┌──────────────────────────────────────────────────────────┐
│ Top bar: experiment title / backend / run status        │
├───────────────┬───────────────────────────────┬──────────┤
│ Left panel    │ Main canvas                   │ Right    │
│ Parameters    │ Circuit / Graph / Results     │ Insights │
│ Backend       │                               │ Metrics  │
│ Shots         │                               │ Audit    │
├───────────────┴───────────────────────────────┴──────────┤
│ Bottom tabs: Overview | Circuit | Results | Compare     │
└──────────────────────────────────────────────────────────┘
```

---

## Panel izquierdo

### “Control surface”

Aquí el usuario configura:

* backend
* shots
* noise on/off
* parámetros del experimento
* ejecutar / duplicar / guardar

---

## Panel central

### “Visual core”

Aquí ocurre la magia visual.

Dependiendo del tab:

* circuito
* distributions
* score
* graph
* comparison
* evolution

---

## Panel derecho

### “Intelligence panel”

Aquí muestras:

* resumen del run
* métricas clave
* observaciones
* baseline comparison
* audit trail

Esto le da muchísimo feeling de producto serio.

---

## 4) **Run History**

Lista de ejecuciones guardadas:

* template
* fecha
* backend
* score
* estado

Con capacidad de abrirlas.

---

## 5) **Compare View**

Pantalla donde comparas dos o más runs.

Esto te va a dar muchísimo valor percibido.

---

## ✅ Checklist Fase 3

* [ ] Diseñar shell principal de la app
* [ ] Crear landing de producto
* [ ] Crear catálogo de experimentos
* [ ] Crear workspace principal
* [ ] Crear vista de historial
* [ ] Crear vista de comparación

---

# FASE 4 — MOTOR CUÁNTICO REAL

## Meta: dejar de ser solo frontend bonito

Aquí entra Qiskit de verdad.

---

# Qué debe hacer tu backend cuántico en v1

No intentes hacerlo todo.

Tu motor en v1 debe soportar:

* crear circuitos base
* ejecutar en simulador local
* devolver métricas
* devolver resultados
* devolver baseline clásico cuando aplique

---

# Endpoints recomendados (FastAPI)

---

## `GET /templates`

Devuelve los experimentos disponibles.

```json
[
  {
    "id": "bell_state",
    "name": "Bell State",
    "category": "entanglement"
  }
]
```

---

## `POST /runs`

Crea una ejecución.

```json
{
  "templateId": "bell_state",
  "backend": "local_simulator",
  "shots": 1024,
  "parameters": {}
}
```

---

## `POST /runs/{id}/execute`

Ejecuta el experimento.

---

## `GET /runs/{id}`

Devuelve estado y metadata.

---

## `GET /runs/{id}/results`

Devuelve resultados finales.

---

## `GET /runs`

Historial.

---

## `POST /runs/compare`

Comparación entre runs.

---

## ✅ Checklist Fase 4

* [ ] Crear FastAPI base
* [ ] Añadir endpoint de templates
* [ ] Añadir endpoint de creación de run
* [ ] Añadir endpoint de ejecución
* [ ] Añadir endpoint de resultados
* [ ] Añadir endpoint de historial
* [ ] Añadir endpoint de comparación

---

# FASE 5 — IMPLEMENTACIÓN DE EXPERIMENTOS

## Meta: tener contenido real y potente

Aquí defines qué computa el sistema.

---

# EXPERIMENTO 1 — Bell State

## Perfecto para empezar

### Qué demuestra

* superposición
* entrelazamiento
* medición

### Qué debe mostrar

* circuito
* distribution
* mediciones
* explicación técnica

### Backend

Qiskit local simulator

---

## ✅ Checklist Bell State

* [ ] Crear generador de circuito Bell
* [ ] Ejecutar en simulador local
* [ ] Calcular distribution
* [ ] Devolver métricas del circuito
* [ ] Mostrar resultados en UI

---

# EXPERIMENTO 2 — GHZ State

### Qué demuestra

* entanglement multi-qubit
* scaling

### Qué debe mostrar

* circuito
* mediciones
* comparación con Bell

---

## ✅ Checklist GHZ

* [x] Crear circuito GHZ
* [x] Permitir elegir número de qubits
* [x] Ejecutar
* [x] Mostrar distributions
* [x] Mostrar impacto en profundidad / gates

---

# EXPERIMENTO 3 — QAOA vs solver clásico

## Este es MUY importante para el posicionamiento

Porque aquí tu app deja de parecer “solo educativa”.

### Qué demuestra

* optimización
* benchmark
* comparación cuántico vs clásico

### Caso de uso

“routing problem” o “toy graph optimization”

### Qué debe mostrar

* problema de entrada
* formulación
* score cuántico
* score clásico
* tiempo
* comparación

---

## ✅ Checklist QAOA

* [ ] Definir toy optimization problem
* [ ] Implementar pipeline QAOA simple
* [ ] Implementar baseline clásico
* [ ] Devolver score / tiempo / solución
* [ ] Mostrar comparación en UI

---

# EXPERIMENTO 4 — VQE Toy Problem

## Más técnico, más “serio”

### Qué demuestra

* variational methods
* optimization loop
* energy minimization

### Qué debe mostrar

* energy curve
* convergence
* parámetros
* resultado final

---

## ✅ Checklist VQE

* [ ] Crear toy Hamiltonian
* [ ] Ejecutar VQE simple
* [ ] Capturar iteraciones
* [ ] Devolver curva de energía
* [ ] Mostrar visualización de convergencia

---

# FASE 6 — VISUALIZACIONES “WOW”

## Meta: que la app impresione de verdad

Aquí está una parte enorme del valor percibido.

---

# Visualizaciones que SÍ valen la pena

No pongas 30 charts porque sí.

Pon pocas, muy buenas y muy útiles.

---

## 1) **Circuit Visualization**

Muy importante.

* diagrama de circuito
* limpio
* elegante
* integrado en la UI

---

## 2) **Measurement Distribution**

Bar chart de resultados:

* `00`
* `01`
* `10`
* `11`

Muy importante para Bell / GHZ.

---

## 3) **Metric Summary Cards**

Cards con:

* circuit depth
* gate count
* transpilation time
* execution time
* score / energy

---

## 4) **Classical vs Quantum Comparison**

Tabla / cards comparativas.

Esto es potentísimo.

---

## 5) **Optimization / Energy Curve**

Muy buena para VQE y QAOA.

---

## 6) **Experiment Lineage Graph**

Aquí entra tu ADN de sistemas.

Un grafo de versiones:

* run original
* ajuste de parámetros
* nueva ejecución
* comparación

Esto te posiciona muy arriba.

---

## ✅ Checklist Fase 6

* [ ] Visualización de circuitos
* [ ] Visualización de distributions
* [ ] Cards de métricas
* [ ] Comparador clásico vs cuántico
* [ ] Curva de optimización
* [ ] Grafo de versiones

---

# FASE 7 — PERSISTENCIA Y REPRODUCIBILIDAD

## Meta: convertirlo en herramienta, no demo

Aquí empieza a sentirse “software serio”.

---

# Qué debes guardar

Cada run debe persistir:

* experimento
* parámetros
* backend
* shots
* métricas
* resultados
* timestamps
* lineage
* audit trail

---

# Tablas mínimas sugeridas

* `experiment_template`
* `experiment_run`
* `experiment_result`
* `experiment_version`
* `audit_event`

---

## ✅ Checklist Fase 7

* [ ] Crear esquema de persistencia
* [ ] Guardar runs
* [ ] Guardar resultados
* [ ] Guardar lineage
* [ ] Guardar audit trail
* [ ] Cargar historial desde UI

---

# FASE 8 — COMPARACIÓN SERIA

## Meta: que el usuario pueda pensar, no solo mirar

Aquí es donde tu producto sube de nivel.

---

# Qué debe permitir la comparación

Comparar dos o más runs en:

* backend
* parámetros
* depth
* gate count
* score
* tiempo
* distributions
* energy
* baseline

Esto es una función MUY buena.

---

## UX recomendada

Seleccionar 2 runs y abrir una vista tipo:

```txt
Run A         vs         Run B
----------------------------------------
Backend       Local      Noisy
Shots         1024       2048
Depth         12         14
Gate Count    32         37
Score         0.81       0.76
Baseline      0.84       0.84
```

Y debajo:

* charts
* curvas
* observaciones

---

## ✅ Checklist Fase 8

* [ ] Selección múltiple de runs
* [ ] Vista de comparación
* [ ] Métricas lado a lado
* [ ] Comparativa visual
* [ ] Conclusión automática / insight

---

# FASE 9 — BACKENDS MÁS SERIOS

## Meta: acercarte a infraestructura real

No lo haría al principio.
Pero sí lo tendría como siguiente salto.

---

# Backends recomendados

## v1

* local simulator

## v1.5

* noisy simulator

## v2

* IBM Quantum backend

---

## Qué aporta cada uno

### Local simulator

rápido, reproducible, fácil

### Noisy simulator

más realista, más interesante

### Cloud backend

mucho más posicionamiento y credibilidad

---

## ✅ Checklist Fase 9

* [ ] Añadir noisy simulator
* [ ] Diseñar abstracción de backend
* [ ] Añadir soporte IBM Quantum
* [ ] Mostrar diferencias entre backends

---

# FASE 10 — CAPA “INTELIGENTE”

## Meta: convertirlo en producto frontier de verdad

Aquí puedes empezar a mezclar con lo que ya dominas.

Pero ojo: esto es **después**, no antes.

---

# Ideas fuertes aquí

---

## 1) **Experiment Copilot**

Un asistente que ayude a:

* explicar resultados
* sugerir próximos experimentos
* detectar anomalías
* comparar runs

---

## 2) **Auto-generated Experiment Summary**

Generar resumen tipo:

> “This run produced a Bell-state-like measurement distribution with strong correlation between qubits…”

Muy buena feature.

---

## 3) **Experiment Graph Planner**

Esto sí sería muy tuyo.

Un sistema que convierta:

> “quiero comparar un estado GHZ de 3 y 5 qubits”

en un pequeño plan experimental reproducible.

---

## ✅ Checklist Fase 10

* [ ] Añadir resumen automático de resultados
* [ ] Añadir sugerencias de iteración
* [ ] Añadir copiloto experimental
* [ ] Añadir planificador de experimentos

---

# ROADMAP TEMPORAL RECOMENDADO

Ahora te lo bajo a tiempo realista.

---

# PLAN DE 30 DÍAS

## Objetivo: tener un MVP precioso y funcional

---

## Semana 1 — Foundation

* [ ] Crear repo
* [ ] Montar Next.js + Tailwind
* [ ] Montar FastAPI + Qiskit
* [ ] Definir entidades del dominio
* [ ] Crear catálogo de experimentos
* [ ] Crear shell visual de la app

---

## Semana 2 — Primer experimento serio

* [ ] Implementar Bell State
* [ ] Crear configuración de experimento
* [ ] Ejecutar desde UI
* [ ] Mostrar circuit + distributions + métricas
* [ ] Guardar runs

---

## Semana 3 — Producto real

* [x] Añadir GHZ
* [ ] Añadir historial
* [ ] Añadir comparación básica
* [ ] Añadir visualizaciones mejores
* [ ] Añadir audit trail

---

## Semana 4 — Posicionamiento fuerte

* [ ] Añadir QAOA toy problem
* [ ] Añadir baseline clásico
* [ ] Añadir compare view
* [ ] Refinar UI brutalmente
* [ ] Preparar demo pública

---

# PLAN DE 60–90 DÍAS

## Objetivo: convertirlo en proyecto bandera

---

## Mes 2

* [ ] Añadir VQE
* [ ] Añadir noisy simulator
* [ ] Añadir lineage graph
* [ ] Añadir experiment versioning
* [ ] Añadir resúmenes automáticos

---

## Mes 3

* [ ] Añadir backend cloud real
* [ ] Añadir capa copiloto
* [ ] Añadir workflows compuestos
* [ ] Añadir export / shareable runs
* [ ] Añadir landing pública seria

---

# MI RECOMENDACIÓN MÁS IMPORTANTE

No dejes que esto se convierta en:

> “una colección de cosas cuánticas”

Tu producto debe girar alrededor de una sola promesa:

# **hacer experimentación cuántica más operable, comparable y entendible**

Si mantienes eso, el proyecto puede ser muy serio.

Si no, se convertirá en un “science toy”.

Y tú no quieres un toy.
Quieres un **artefacto de posicionamiento fuerte**.

---

# PROMPT MAESTRO PARA CURSOR

Ahora sí: te dejo el prompt bien planteado para que tu agente lo convierta en roadmap ejecutable dentro del repo.

# QUANTUM OPS LAB — PRODUCT & EXECUTION ROADMAP

We are building a serious frontier product called **Quantum Ops Lab**.

This is NOT a toy educational app, not a notebook clone, and not a fake “quantum startup”.
It should be a **credible, modern, technically meaningful product** for designing, running, comparing, and understanding quantum experiments.

The app should sit at the intersection of:

* quantum computing
* product-grade UX
* experiment workflows
* computational tooling
* simulation and execution systems
* reproducibility and auditability

The product should feel like:

* a premium technical workstation
* a modern computational lab
* a serious operator workspace

It should NOT feel like:

* a random dashboard
* a CSS wrapper around notebooks
* a cluttered scientific interface
* a tutorial site

---

## CORE PRODUCT VISION

Quantum Ops Lab is a web application where a technical user can:

1. define an experiment
2. choose a backend
3. configure parameters
4. execute runs
5. inspect results
6. compare runs
7. save experiment history
8. track experiment lineage

We are not positioning ourselves as quantum physicists.
We are positioning ourselves as builders of the **software/product layer that makes advanced computation more usable**.

---

## PRIMARY MVP GOAL

Build a visually impressive and technically credible MVP where a user can:

* choose from a small set of predefined experiment templates
* configure and run them from a modern UI
* execute them through a Python quantum backend
* inspect circuit metrics and result distributions
* compare quantum and classical baselines where relevant
* save and compare experiment runs

---

## INITIAL EXPERIMENTS (STRICT MVP SCOPE)

We should start with these experiments only:

### 1. Bell State

Purpose:

* demonstrate superposition / entanglement
* show measurement distributions

### 2. GHZ State

Purpose:

* multi-qubit entanglement
* show scaling and complexity

### 3. QAOA vs Classical Solver

Purpose:

* compare a toy quantum optimization workflow against a classical baseline
* make the app feel more product-serious and less educational

### 4. VQE Toy Problem

Purpose:

* show a variational optimization workflow
* visualize energy convergence

Do not add more experiments until these are implemented well.

---

## REQUIRED STACK

### Frontend

* Next.js
* TypeScript
* Tailwind
* Framer Motion
* React Flow (for lineage / experiment graph if useful)
* Recharts or Visx for charts
* optional Monaco editor later if useful

### Backend

* Python
* FastAPI
* Qiskit
* Pydantic

Prefer a clean separation between:

* web product app
* quantum execution engine

---

## RECOMMENDED PROJECT STRUCTURE

Use a structure like this unless a clearly better one is justified:

quantum-ops-lab/
web/
quantum-engine/
docs/

Or if monorepo is preferable:

quantum-ops-lab/
apps/
web/
quantum-engine/
packages/
types/
ui/
docs/

---

## WHAT I NEED YOU TO PRODUCE

I want you to act as:

* a product architect
* a systems designer
* a staff-level technical planner
* a product-minded engineering lead

Produce a **clear execution roadmap** for implementation.

---

## OUTPUT FORMAT I WANT

I want the roadmap broken into **phases**, each with:

* goal
* what is included
* why it matters
* implementation tasks
* completion checklist

The roadmap must be **concrete and executable**, not abstract.

---

## REQUIRED PHASES

Design the roadmap using these phases:

### Phase 0 — Product Definition

* define product scope
* define MVP boundaries
* define success criteria

### Phase 1 — Architecture Foundation

* repo structure
* app boundaries
* contracts between frontend and backend
* environment setup

### Phase 2 — Domain Modeling

Define core domain entities such as:

* ExperimentTemplate
* ExperimentRun
* ExperimentResult
* ExperimentVersion
* AuditEvent

Also define lifecycle/state transitions for runs.

### Phase 3 — UX Shell / Product Surface

Design the first serious user experience:

* home / launch screen
* experiment catalog
* experiment workspace
* run history
* compare view

### Phase 4 — Quantum Engine API

Define the backend API shape:

* templates
* create run
* execute run
* fetch result
* history
* compare

### Phase 5 — Experiment Implementations

Implementation plan for:

* Bell
* GHZ
* QAOA
* VQE

### Phase 6 — Visualization Layer

Plan visualizations for:

* circuit diagrams
* measurement distributions
* metric cards
* optimization curves
* classical vs quantum comparison
* lineage graph

### Phase 7 — Persistence & Reproducibility

Plan:

* database schema
* run persistence
* result persistence
* lineage
* audit trail

### Phase 8 — Comparison & Insight Layer

Plan:

* compare runs
* side-by-side metrics
* visual comparisons
* result interpretation

### Phase 9 — Advanced Backends

Plan:

* local simulator
* noisy simulator
* cloud backend support

### Phase 10 — Intelligent Layer

Plan future layer for:

* experiment summaries
* suggested next experiments
* assistant/copilot
* experiment planner

---

## IMPORTANT PRODUCT REQUIREMENTS

This product must prioritize:

* clarity
* elegance
* visual trust
* technical seriousness
* reproducibility
* comparison
* interpretability

It must NOT prioritize:

* gimmicks
* too many features
* fake “AI magic”
* overclaiming quantum advantage

---

## VERY IMPORTANT UX REQUIREMENTS

The app should feel like:

* Stripe for quantum workflows
* Vercel for computational experiments
* Linear for technical execution

Avoid:

* dark academic clutter
* over-dense dashboards
* low-contrast hacker aesthetics
* childish educational UI

Aim for:

* beautiful whitespace
* clear hierarchy
* premium interactions
* precise visualizations
* strong visual calm

---

## WHAT TO DELIVER NOW

I want you to produce:

1. a **full roadmap**
2. a **recommended MVP implementation order**
3. a **30-day build plan**
4. a **90-day evolution plan**
5. a **“build this first” checklist**
6. a proposed **folder structure**
7. a proposed **domain model**
8. a proposed **frontend route structure**
9. a proposed **backend API contract**
10. a proposed **state model for experiment runs**

Write it like a serious technical product blueprint.
Avoid hype.
Avoid fluff.
Be concrete, sharp, and implementation-oriented.