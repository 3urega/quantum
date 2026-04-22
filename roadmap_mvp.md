# Roadmap MVP — Quantum Ops Lab

Versión: 1.4  
Estado: **activo** (sustituye al plan macro para el cierre pre–Android)  
Contexto: [`feedback.md`](feedback.md), **wireframe Next.js (§1.2)**, y especificación **esfera de Bloch** ([`esfera.md`](esfera.md), §1.3) para intuición de estado (post–P0 / P1, no bloquea el núcleo compare+circuito).

---

## 0. Frase de producto del MVP (bloquea el alcance)

### Definición prioritaria (feedback senior, sin humo)

> **Objetivo:** permitir **ejecutar, entender y comparar** un único experimento cuántico simple (Bell) de forma **visual, reproducible y sin fricción**. El producto no es “ejecutar circuitos”, es **entender qué está pasando**.

> **MVP = solo Bell state**, bien hecho: Run → resultado (distribución) → ajustar `shots` → volver a ejecutar → **comparar dos runs** (lo que convierte la app en “lab”). Un simulador; parámetros mínimos (`shots`).

### Alineación con el plan previo (v1.0)

La frase original sigue siendo válida como resumen:

> Un experimento (**Bell**) ejecutado, guardado, entendible y **comparable** entre al menos dos runs, sin añadir QAOA/VQE hasta que esto cierre.

**Cambio explícito respecto a la v1.0 del roadmap:** el feedback senior fija **un solo experimento en el flujo del MVP** — **sin GHZ en el núcleo**. GHZ en el repo pasa a tratarse como **post–MVP v1 estricto** (Fase F u ocultar del flujo principal hasta cerrar Bell). Hasta entonces, lo implementado con GHZ es **coherente técnicamente** pero **dispersa** respecto al MVP mínimo descrito abajo.

**Fuera del MVP v1 estricto (hasta aprobación explícita pos–v1):** QAOA, VQE, **catálogo multi-experimento como experiencia principal**, GHZ como primer plano, varios backends, ruido, auth, editor de circuitos, workflows complejos, app Android, “copiloto” IA, tutoriales largos desacoplados como **sustitutos** de la explicación inline.

---

## 1. Objetivo medible (Definition of Done del MVP)

| Criterio | Cómo se verifica | Estado v1.4 (producto) |
|----------|------------------|------------------------|
| Un solo experimento en el núcleo | **Solo Bell** en el flujo principal; misma calidad end-to-end. | Cumplido (CTA home + lab Bell; GHZ no es el primer acto). |
| Comparación de runs (“killer feature”) | Dos runs de Bell, **distribuciones alineadas** (lado a lado o diff); ver §0 feedback senior. | Cumplido (`POST /runs/compare` + panel en [`BellWorkspace`](apps/web/src/components/experiments/BellWorkspace.tsx)). |
| Visual “lab”, no “panel + API” | **Diagrama** H + CNOT; estado \|ψ⟩ (p. ej. (\|00⟩+\|11⟩)/√2); intuición “correlacionados”; no solo OpenQASM. | Cumplido (SVG + fórmula + Bloch 2D de apoyo). |
| Resultado claro | Barras `00`/`11` y lectura de probabilidad; gráfico simple. | Cumplido (porcentajes en histograma). |
| Reproducibilidad | Mismo `template_id` + `shots` documentados; run persistido; resultados recargables. | Cumplido (Postgres + historial en lab). |
| Explicación **inline** | H, CNOT y lectura del histograma accesibles **en la vista** (hover, toggle o bloques colapsables), sin depender de `/learn` como única fuente. | Cumplido (`<details>`, tooltips en diagrama). |
| Dominio explícito | Run/Result documentados (`docs/domain/experiment-lifecycle.md`); tipos y API alineados. | Cumplido + ejemplos API compare/lab en lifecycle (v1.4). |
| Roadmap = realidad | README + este archivo; estados “hecho / en curso / fuera de MVP estricto” claros. | Cumplido (Fase D/E/G alineadas al código en esta versión). |

**G.2 (DoD):** la tabla anterior queda revisada para v1.4. **Fuera de alcance explícito del P0:** Bloch **3D** (R3F) según [`esfera.md`](esfera.md); la UI incluye preview 2D como P1 parcial (D.5).

### Criterios de éxito (feedback senior)

1. Alguien ejecuta Bell en pocos segundos una vez el entorno está listo (orden de magnitud **~10 s**).
2. **Entiende el resultado** sin depender solo de documentación externa.
3. **Compara dos ejecuciones** (mismo experimento).
4. Sensación: *“ah, ahora entiendo mejor esto”* — mejor que solo notebooks.

### 1.1 Layout objetivo

Una **vista principal** que concentre: circuito + estado/intuición a un lado; Run, `shots` y chart al otro; historial y **modo comparar** abajo o en panel. **Implementado** en `/experiments/bell-state` ([`BellWorkspace`](apps/web/src/components/experiments/BellWorkspace.tsx)). Reducir saltos hacia catálogo sigue siendo mejora opcional (home ya prioriza Bell).

### 1.2 Especificación UI — wireframe listo para Next.js (Bell)

Referencia de implementación: **una sola pantalla** usable en ~10 s; prioridad visual: **Run** → **chart** → **circuito** → **historial** (exploración).

**Estructura general (ASCII):**

```text
┌ Header: título + badge/selector "Bell" (escalable después) ─┐
├──────────────────────────────────────────────────────────────┤
│ [Columna izq: EXPERIMENTO]   [Columna der: RUN PANEL]        │
│  Circuito H+CNOT (ideal SVG)   Shots + [Run Experiment]     │
│  Estado |ψ⟩ = (|00⟩+|11⟩)/√2   Resultado: bar chart 00/11   │
│  Explicación (toggle, colapsada)                             │
├──────────────────────────────────────────────────────────────┤
│ HISTORIAL: filas con checkbox, meta (shots, conteos), hora   │
│ [Compare Selected] (habilitado solo con 2 seleccionados)    │
│ Panel COMPARACIÓN: charts Run A vs Run B lado a lado         │
└──────────────────────────────────────────────────────────────┘
```

**Componentes (modelo mental React / implementación):**

| Bloque | Contenido mínimo |
|--------|------------------|
| `Header` | Título producto + `ExperimentBadge` / selector (solo Bell en MVP). |
| Panel izquierdo | `BellCircuitDiagram` (ASCII/SVG: `q0 ─H─■─`, `q1 ───X─`), `StateFormula` (mono), `Explanation` lista (H superposición, CNOT entrelazamiento), **collapsed por defecto**. |
| Panel derecho | `Shots` input, `Run Experiment` con estados loading/disabled, `BarChart` (Recharts, Chart.js o barras con `%` width). |
| Historial | Lista de `RunItem`: checkbox, resumen shots + conteos por etiqueta si cabe, timestamp. |
| Compare | Botón deshabilitado si `selectedRuns !== 2`; `ComparePanel` con dos charts o series alineadas. |

**Look & feel:** fondo claro u oscuro limpio; **mono** para fórmulas; acento azul/violeta (coherente con Tailwind actual).

**Microinteracciones (P0/P1 según tiempo):**

* Tooltips en puertas **H** / **CNOT** al hover (enlaza con D.2b).
* Animación leve al actualizar el chart al llegar resultado.
* Highlight al comparar dos series (contraste Run A / Run B).

**Detalle de alto impacto (percepción “no es un panel aburrido”):** al pulsar Run, **breve secuencia** en el circuito (delay + resalte de puertas / “ejecución fake”) aunque el cálculo real sea instantáneo — refuerza que “algo cuántico ocurre”. Encajar en Fase D como tarea explícita (ver D.8).

**Añadido v1.3 (P1):** en el panel izquierdo puede ir una **Bloch interactiva**; resumen mínimo en [§1.3](#13-esfera-de-bloch), detalle en [`esfera.md`](esfera.md).

### 1.3 Esfera de Bloch

**Documento de referencia:** [`esfera.md`](esfera.md) (única fuente alargada: layout, 2 esferas + entrelazamiento, Run, tooltips/timeline, shots vs histograma, compare, R3F, fases **Bloch-1/2/3**, `BlochSphere.tsx` y deps).

**En este plan:** prioridad **P1**, tarea **D.5**, alineado con **D.7** / **D.8**; no reemplaza D.1 ni D.2. El resto: **solo** en el enlace.

### Encaje con el código actual (transparencia)

| Tema (feedback “1 página”) | Estado aproximado en el repo |
|----------------------------|------------------------------|
| Solo Bell en el flujo | **Parcial:** Bell es foco (home + orden de catálogo); GHZ sigue E2E; QAOA/VQE próximamente. |
| Run, `shots`, un backend | **Hecho** para Bell (y GHZ). |
| Distribución / barras | **Hecho.** |
| Comparar 2 runs | **Hecho** (`POST /runs/compare` + UI). |
| Circuito visual (H+CNOT) | **Hecho** (diagrama SVG en lab Bell). |
| Estado + intuición inline | **Hecho** (fórmula + texto + Bloch 2D). |
| Una pantalla / wireframe §1.2 | **Hecho** (`BellWorkspace`, columna experimento / run + historial + compare). |
| Historial (timestamp, params) | **Hecho** con Postgres; **en lab:** checkboxes + compare. |
| Hover/toggle + tooltips puertas | **Hecho** (acordeón, `<title>` en SVG, transiciones en barras). |
| Animación “run” en circuito | **Hecho** (secuencia H → CNOT antes de ejecutar). |
| Esfera(s) de Bloch 3D | **Pendiente (opcional):** preview 2D en UI; R3F en [`esfera.md`](esfera.md) ([§1.3](#13-esfera-de-bloch)). |

---

## 2. Fases (orden fijo; no se salta de fase sin checklist completa)

### Fase A — Sincronizar verdad y foco (1–2 días)

| Paso | Tarea | Hecho |
|------|--------|------|
| A.1 | Declarar en README el **MVP v1** en un párrafo (enlace a este archivo). | [x] |
| A.2 | En `docs/domain/roadmap.md`, añadir nota al inicio: *“El plan de ejecución actual es `roadmap_mvp.md`; las fases 5–10 siguen siendo visión, no commit inmediato.”* | [x] |
| A.3 | Revisar claims del README (qué “funciona de verdad” vs “registrado en API”) para alinear con feedback §4. | [x] |
| A.4 | (Opcional) Mover o etiquetar QAOA/VQE en la UI como “Próximamente” si generan ruido cognitivo. | [x] |

**Salida:** una sola fuente de verdad para el equipo: este roadmap + README honesto.

---

### Fase B — Cerrar el dominio mínimo (2–4 días)

*Justificación feedback §3: comparar y escalar sin dolor requiere modelo de datos claro.*

| Paso | Tarea | Hecho |
|------|--------|------|
| B.1 | Documento corto (p. ej. `docs/domain/experiment-lifecycle.md`): estados de Run, qué se guarda en `Result`, qué es `template_id` vs slug. | [x] |
| B.2 | Alinear DTOs TypeScript y esquemas Pydantic con ese documento (sin reescribir toda la app: solo gaps). | [x] |
| B.3 | Lista explícita de `metrics` y `artifacts` requeridos para el experimento hero + comparación. | [x] |
| B.4 | `Noise model` / backends extra: **explícitamente** “futuro” en el doc (una línea) para no bloquear MVP. | [x] |

**Salida:** comparación entre runs y futuras features no requieren reinterpretar el dominio cada vez.

---

### Fase C — Elegir y profundizar UN experimento (core producto) (1–2 semanas)

*Justificación feedback §1: un experimento excelente > cuatro mediocres. La referencia pone Bell; el código ya lo tiene muy recorrido.*

| Paso | Tarea | Hecho |
|------|--------|------|
| C.1 | **Congelar** el experimento hero: *Bell state* (recomendado) o GHZ; el otro queda con UX secundaria o con mensaje de foco MVP. | [x] |
| C.2 | Flujo: configurar → ejecutar → ver resultado → quedar en historial, sin regresiones. | [x] |
| C.3 | Modo aprendizaje: repasar textos del hero para que sigan al usuario paso a paso (mismo tono y precisión en todos los bloques). | [x] |
| C.4 | Asegurar **reproducibilidad operativa:** mismos parámetros → expectativas documentadas; diferencias por shots explicadas en copy. | [x] |

**Salida:** el feedback “falta momento wow” se ataca en Fase D; aquí aseguramos un solo hilo sólido.

*Nota v1.1:* la Fase C se dio por cerrada con **Bell hero + GHZ secundario**. El feedback “1 página” recorta el MVP a **Bell only**; GHZ pasa a Fase F / retirada del flujo principal hasta validar D+E en Bell.

---

### Fase D — “Momento wow” en UI: visualizar y entender (1–2 semanas)

*Justificación feedback §2: el producto compite con “no entender qué está pasando”, no con notebooks.*

| Paso | Tarea | Prioridad | Hecho |
|------|--------|------------|------|
| D.0 | **Afinar experiencia “solo Bell”** en el producto: entry rápida a Bell (p. ej. CTA en home o default), y plan para **reducir** GHZ/QAOA/VQE como ruido hasta post–MVP (catálogo mínimo o sección “Más adelante”). | P0 | [x] |
| D.1 | **Visualización de circuito** (diagrama H + CNOT legible) para Bell, además o encima de OpenQASM. | P0 | [x] |
| D.1b | **Estado e intuición** en la misma vista: fórmula del estado (p. ej. \|Φ⁺⟩), frase de correlación; no solo en `/learn`. | P0 | [x] |
| D.2 | **Histograma** con probabilidades / lectura clara; refinar bajo modo aprendizaje o tooltips. | P0 | [x] |
| D.2b | Explicación **inline** (hover, toggle, acordeón): qué hace H, CNOT, cómo leer el chart (objetivo: sin depender solo de tutoriales largos). | P0 | [x] |
| D.3 | **Comparación visual entre dos runs** (Bell): mismas etiquetas, dos series o diff — *killer feature*. | P0 | [x] |
| D.4 | Vista o panel de **diff** de parámetros (shots) + métricas + tiempos entre los dos runs. | P0 | [x] |
| D.5 | **Esfera de Bloch (P1).** **[`esfera.md`](esfera.md)** (R3F) **no** implementado; **preview 2D** en lab (`BlochPreview2D`). R3F queda como mejora opcional. | P1 | [x] |
| D.6 | **Pantalla Bell según §1.2:** header + dos columnas (experimento \| run+resultado) + bloque historial + panel comparación; puede ser evolución de `/experiments/bell-state` o ruta única tipo `/lab/bell`. | P0 | [x] |
| D.7 | **Microinteracciones:** tooltips en H/CNOT, transición suave al actualizar barras, highlight en modo compare. | P1 | [x] |
| D.8 | **Feedback al Run:** animación breve o highlight secuencial en el diagrama del circuito durante la ejecución (puede usar delay + estado visual *fake*). | P1 | [x] |

\*D.5: criterio “producto v1.4” = preview 2D + copy; R3F según `esfera.md` no bloquea cierre.

**Salida:** la frase *“workstation y comparable”* se siente en la UI; el wireframe §1.2 es la **brújula** de componentes y layout.

**Orden sugerido de implementación:** D.0 → D.6 (estructura) → D.1 + D.1b + D.2 + D.2b (contenido paneles) → E + D.3 + D.4 (comparar) → D.7 + D.8 (pulido). **D.5 (Bloch)** en paralelo o tras D.1/D.1b y D.8; criterio de \((\theta,\phi)\) y fases de Bloch en [`esfera.md`](esfera.md).

---

### Fase E — Capa de comparación en backend (en paralelo o justo antes de D.3–D.4) (3–7 días)

*Justificación: comparar requiere contrato; el feedback pide comparar 2 runs como pilar del MVP.*

| Paso | Tarea | Hecho |
|------|--------|------|
| E.1 | Diseñar `POST /runs/compare` (o `GET` con query) con ids de run y el mismo `template_id`. | [x] |
| E.2 | Respuesta: delta de métricas, estructura para alinear dos histogramas (etiquetas comunes, conteos). | [x] |
| E.3 | Reglas: rechazar mezclar templates distintos; error claro. | [x] |
| E.4 | Tests o contrato mínimo documentado (OpenAPI / ejemplo JSON). | [x] |

**Salida:** la UI de comparación no depende de lógica solo en el cliente.

---

### Fase F — GHZ y resto de plantillas (después de cerrar D+E+G con **solo Bell**)

*El feedback “1 página” deja GHZ **fuera** del núcleo del MVP. Reintroducir GHZ (y el catálogo amplio) solo cuando el cierre de Bell con **D (P0: D.0, D.1, D.1b, D.2, D.2b, D.3, D.4, D.6)**, **E** y **G.1** esté verde. **D.5, D.7, D.8 (P1)** y Bloch-2/Bloch-3 no bloquean Fase F por sí solos, si se acuerda explícitamente el alcance mínimo de Bell P0.*

| Paso | Tarea | Hecho |
|------|--------|------|
| F.1 | Mismos estándares de visual y comparación que el hero, reutilizando componentes. | [ ] |
| F.2 | No duplicar lógica de negocio: reutilizar comparación y vista de circuito. | [ ] |

**Salida:** GHZ añade valor sin reabrir un segundo MVP paralelo desordenado.

---

### Fase G — Cierre y verificación (2–3 días)

| Paso | Tarea | Hecho |
|------|--------|------|
| G.1 | Demo de 3 minutos: abrir app → un experimento hero → 2 runs → comparar → leer explicación. | [x] |
| G.2 | Checklist de Definition of Done (sección 1) todo en **sí** o ajuste de alcance explícito. | [x] |
| G.3 | Commit de “MVP v1” en mensaje/ tag si usáis versionado semántico de producto. | [x] |

**Salida:** listo para decidir **Android** (Capacitor, etc.) sin arrastrar deuda estructural del feedback.

---

## 3. Mapa a los temas del feedback

| Tema | Origen | Dónde en este roadmap |
|------|--------|------------------------|
| Dispersión | `feedback.md` | Sección 0, F. A–C; v1.1: **sólo Bell** + GHZ fuera del núcleo. |
| “1 página” / flujo mínimo | Feedback senior | §1 criterios de éxito, §1.2 wireframe, Fase D (D.0, D.6–D.8). |
| Wireframe Next.js | Nuevo feedback | §1.2, D.6–D.8, orden sugerido al final de Fase D. |
| Esfera de Bloch (2 qubits, R3F) | [`esfera.md`](esfera.md) | §1.3, D.5 (Bloch-1…3), refuerza D.7, D.8, D.2b. |
| Entender, no solo ejecutar | Feedback senior | D.1b, D.2b, D.1; killer compare D.3 + E. |
| Comparar = lab | Feedback senior | D.3, D.4, Fase E; **prioridad** sobre segundo experimento. |
| `feedback.md` (workstation) | Archivo clásico | Cerrado en A–C; wow en D. |
| “No entender qué pasa” | Ambos | D.1b, D.2b, copy Bell, comparación. |
| QAOA / VQE después | Ambos | §4, sección 0. |

---

## 4. Qué no está en este MVP (reafirmado; alineado al feedback senior)

* Play Store / **Android** / Capacitor (solo después de Fase G; **G cerrada en v1.4** respecto a Bell+compare+DoD documental).
* **Más de un experimento en el flujo principal** (GHZ, QAOA, VQE como “primera experiencia” — van después de Bell + compare).
* Múltiples backends, ruido, autenticación, editor de circuitos, workflows complejos.
* Nuevos tutoriales **como sustituto** de la explicación en la vista de Bell (el `/learn` actual puede seguir, pero el MVP estricto exige **inline** en el experimento).
* “Segundo MVP” (otro hilo) sin cerrar Fase G.
* **Bloch 3D interactiva** no es criterio del **MVP P0**; va en **D.5 (P1)**. Especificación: [`esfera.md`](esfera.md), [§1.3](#13-esfera-de-bloch).

---

## 5. Revisión

Revisar este documento al terminar Fase D o al cambiar el experimento hero, lo que ocurra primero.

*Última actualización: **v1.4** — Fase D/E/G cerradas en documentación; DoD §1 verificada; contrato E.4 en `experiment-lifecycle.md` §7; demo y verificación en README y `docs/VERIFY_BELL_MVP.md`.*

2026-04-22 — Fase A completada: README, nota en `docs/domain/roadmap.md`, copy en home y catálogo, `apps/web/src/lib/experiment-availability.ts`.
2026-04-22 — Fase B completada: `docs/domain/experiment-lifecycle.md`, referencias en `packages/shared-types` y `app/schemas/common.py`.  
2026-04-22 — Fase C completada: hero Bell + ruta secundaria GHZ en UI (`getTemplateMvpRole`, badges en catálogo), copy de reproducibilidad, enlaces a Historial y pasos 3b alineados en Bell/GHZ.

**2026-04-22 — v1.1 del plan:** se incorpora el documento “Quantum Ops Lab — MVP (v1)” (objetivo, flujo 7 pasos, núcleo Bell-only, layout una pantalla, criterios de éxito). Se explicita desalineación: repo aún enseña GHZ y catálogo; el **MVP estricto** recorta a Bell + compare + viz + inline; GHZ/ catálogo → pos–D+E o Fase F.

**v1.2:** se añade **wireframe implementable** (§1.2): columnas experimento / run, historial con selección, panel compare, componentes concretos, jerarquía visual, microinteracciones (D.7) y animación al ejecutar (D.8). Fase D ampliada; orden de build sugerido al cerrar la tabla D.

**v1.3:** se incorpora la **esfera de Bloch** como **§1.3** y **D.5**; enlace a [`esfera.md`](esfera.md); fila de encaje; **Fase F** aclarada (P0 + E + G.1; P1 no bloquea salvo acuerdo).

**v1.3.1:** **§1.3** recortada: el detalle (UX, fases, código) queda en [`esfera.md`](esfera.md); el roadmap mantiene punteros y mínimo contractual.

**v1.4:** Cierre **Fase D/E** en código + **Fase G**: DoD §1 ampliada con columna de verificación; tablas D/E/G marcadas; encaje al día; contrato **E.4** en [`docs/domain/experiment-lifecycle.md`](docs/domain/experiment-lifecycle.md) (JSON + OpenAPI); demo en [README](README.md); verificación manual documentada ([`docs/VERIFY_BELL_MVP.md`](docs/VERIFY_BELL_MVP.md)). Bloch 3D (R3F) permanece fuera del cierre P0.

Revisión posterior: el archivo de feedback pasa a llamarse `feedback.md` (antes `feedbakc.md`); correcciones de redacción en `experiment-lifecycle.md` (estado `draft`) y en README (Bell hero vs GHZ E2E).
