# Tutoriales didácticos — mapa de integración (Quantum Ops Lab)

**Audiencia objetivo:** personas con formación matemática sólida (como mínimo estudiantes de física o equivalente) que quieren **contexto teórico** y **puente** entre el formalismo y lo que la aplicación ejecuta.

**Idioma:** español.

**Notación:** en este documento se usa LaTeX en línea (`$...$`) y en bloque (`$$...$$`) como convención para el contenido educativo que luego podrá vivir en MDX, páginas Next, tooltips o paneles laterales.

---

## 1. Principios del diseño educativo

- **Un tutorial no sustituye** un libro de QC; aquí se ofrece **lo mínimo vital** para interpretar circuitos, histogramas y métricas de la app.
- Cada bloque debe enlazar **qué ves en pantalla** ↔ **qué objeto matemático es** (estado, medida, shots, profundidad, etc.).
- **Progresión:** postulados y notación $\rightarrow$ qubit y Bloch $\rightarrow$ entrelazamiento (Bell, GHZ) $\rightarrow$ por qué el simulador y los “shots”.
- Los contenidos largos pueden vivir en rutas tipo `/learn/...` o en un **panel “Teoría”** colapsable dentro del workspace del experimento.

---

## 2. Puntos de la app donde encajan tutoriales (estado actual)

| Área actual | Ruta / componente | Implementación viva |
|-------------|-------------------|---------------------|
| Inicio | `apps/web/src/app/page.tsx` | CTA **“Tutoriales y fundamentos (ES)”** → [`/learn/fundamentos`](http://localhost:3000/learn/fundamentos) |
| Catálogo | `/experiments` | Enlace “Teoría: …” por plantilla → `/learn/bell`, `/learn/ghz`, `/learn/qaoa`, `/learn/vqe` |
| Detalle Bell | `BellWorkspace` | Párrafo con enlace al tutorial [`/learn/bell`](/learn/bell) |
| Detalle GHZ | `GhzWorkspace` | Párrafo con enlace al tutorial [`/learn/ghz`](/learn/ghz) |
| Placeholder QAOA/VQE | `experiments/[slug]` | Enlace a [`/learn/qaoa`](/learn/qaoa) y [`/learn/vqe`](/learn/vqe) |
| Navegación global | `layout.tsx` | **“Aprende”** → [`/learn`](/learn) |
| Contenido MDX | `apps/web/src/app/learn/**/*.mdx` | Pila: `@next/mdx`, `remark-math`, `rehype-katex`, CSS KaTeX en `learn/layout.tsx` |

**Rutas públicas (dev, prefijo `http://localhost:3000`):**

- `/learn` — índice
- `/learn/fundamentos` — notación, medida, Born, shots
- `/learn/bell` — Bell y circuito en la app
- `/learn/ghz` — GHZ y escalado
- `/learn/qaoa`, `/learn/vqe` — vistas previas didácticas (ejecución pendiente en API/UI)

---

## 3. Contenido teórico sugerido (español + LaTeX)

### 3.0. Notación y postulados (módulo transversal)

**Inserción:** página `/learn/fundamentos` o modal desde la home.

- Estado normalizado: $\lvert \psi \rangle \in \mathbb{C}^d$, con $\langle \psi \vert \psi \rangle = 1$.
- Medida en base computacional para $n$ qubits: resultados $k \in \{0,1\}^n$ con probabilidades $p(k) = \lvert \langle k \vert \psi \rangle \rvert^2$.
- Un *shot* es una muestra independiente de esa distribución; con $N$ shots, los conteos aproximan $N \cdot p(k)$.

**Teorema (Born, forma básica):** si el estado previo a la medida en la base $\{\lvert i \rangle\}$ es $\lvert \psi \rangle$, la probabilidad del resultado $\lvert i \rangle$ es

$$
P(i) = \lvert \langle i \vert \psi \rangle \rvert^2.
$$

*En la app:* el histograma del experimento muestra frecuencias empíricas de esos resultados.

---

### 3.1. Bell (experimento actual)

**Inserción:** panel lateral o bloque bajo el workspace Bell.

- Base computacional de dos qubits: $\lvert 00 \rangle, \lvert 01 \rangle, \lvert 10 \rangle, \lvert 11 \rangle$.
- Hadamard y CNOT:

$$
H = \frac{1}{\sqrt{2}} \begin{pmatrix} 1 & 1 \\ 1 & -1 \end{pmatrix}, \qquad
\mathrm{CNOT}\lvert a,b \rangle = \lvert a, b \oplus a \rangle.
$$

- Circuito típico para $\lvert \Phi^+ \rangle$:

$$
\lvert \Phi^+ \rangle = \frac{1}{\sqrt{2}} \left( \lvert 00 \rangle + \lvert 11 \rangle \right).
$$

**Qué debe reconocer el usuario en la UI:** concentración de la masa en $\lvert 00 \rangle$ y $\lvert 11 \rangle$ con probabilidades cercanas a $1/2$ cada una en el caso ideal (y fluctuaciones estadísticas si $N$ no es enorme).

**Ejercicio guiado (opcional en el doc):** comparar la profundidad del circuito tras *transpile* con la intuición “una H, un CX, mediciones”.

---

### 3.2. GHZ (experimento actual)

**Inserción:** panel bajo `GhzWorkspace`.

- Estado GHZ en $n$ qubits:

$$
\lvert \mathrm{GHZ}_n \rangle = \frac{1}{\sqrt{2}} \left( \lvert 0 \rangle^{\otimes n} + \lvert 1 \rangle^{\otimes n} \right).
$$

- Construcción en la app: $H$ en el qubit 0 y $\mathrm{CX}$ en cadena $0 \to 1$, $1 \to 2$, …

**Ámbito del histograma:** hay $2^n$ resultados posibles; en el caso ideal solo $\lvert 0\dots0 \rangle$ y $\lvert 1\dots1 \rangle$ tienen probabilidad $1/2$ cada uno (el resto $0$). Con ruido numérico o decoherencia en otros backends (futuro), podrían aparecer otras barras — buen gancho para un apartado “simulador vs ruido” más adelante.

**Fórmula útil para el lector:** número de etiquetas posibles en la medida es $2^n$; eso explica por qué el panel con muchos qubits puede requerir **scroll** o agregación visual en iteraciones futuras.

---

### 3.3. Métricas del circuito (transversal)

**Inserción:** tooltip o párrafo fijo bajo “Circuit metrics” en Bell y GHZ.

- **Profundidad:** longitud del camino crítico de puertas tras compilación al conjunto admitido por el backend — proxy de “tiempo” o coste en hardware real.
- **Conteo de puertas:** $\{H: n_h, \mathrm{CX}: n_{\mathrm{cx}}, \ldots\}$ — útil para comparar runs o versiones del mismo template.

No hace falta un teorema aquí; basta una definición operacional ligada a lo que devuelve el JSON del API.

---

### 3.4. Arquitectura producto vs motor (opcional, audiencia técnica)

**Inserción:** `/learn/arquitectura` o pie de la home.

- El **navegador** pide resultados al **motor cuántico** (FastAPI + Qiskit); los DTO son la “cápsula” pedagógica entre SDK y UI.
- Sin base de datos todavía: los *runs* son efímeros — conecta con la idea de **reproducibilidad** como siguiente capítulo del roadmap (persistencia).

---

## 4. Formato implementado

Se usa **MDX** en `apps/web/src/app/learn/` con `remark-math` + `rehype-katex` + CSS de KaTeX (solo en el layout de `/learn`). Plugins declarados por **nombre** en [`apps/web/next.config.ts`](../apps/web/next.config.ts) para compatibilidad con Turbopack.

Opciones futuras: Markdown en `docs/` generado a sitio estático, o JSON de cards editables sin redeploy (ver §5 del roadmap de contenido).

---

## 5. Roadmap de contenido (prioridad)

1. **Fundamentos + Bell** (máximo impacto / ya ejecutable).
2. **GHZ y escalado** (segundo experimento activo).
3. **Cómo leer el histograma y los shots** (corto, reutilizable).
4. Stubs honestos para **QAOA** y **VQE** con prerequisitos y enlaces externos curados.
5. Cuando exista persistencia: mini-tutorial “**mismo circuito, dos runs**” introduciendo comparación informal antes de la vista Compare.

---

## 6. Criterios de calidad

- Cada sección debe terminar con **“En esta pantalla…”** enlazando texto a UI.
- Evitar jerga sin definir ($\oplus$, $\otimes$, $\langle \cdot \vert \cdot \rangle$).
- Mantener **un solo nivel de rigor**: no mezclar demostraciones largas con una app que aún no enseña álgebra lineal desde cero; ofrecer en su lugar **remisiones** a notas estándar (Nielsen & Chuang, etc.) en una bibliografía breve al final del módulo.

---

## 7. Bibliografía sugerida (una línea por recurso)

- Nielsen, M. A. y Chuang, I. L., *Quantum Computation and Quantum Information* (definiciones de estados, medidas, circuitos).
- Notas de circuitos y Qiskit en la documentación oficial de IBM Quantum / Qiskit (enlace en inglés, avisar al lector).

Este archivo es el **mapa editorial**; las rutas canónicas del contenido didáctico viven en **`/learn/*`** dentro de la app. Ampliar texto editando los `.mdx` correspondientes.
