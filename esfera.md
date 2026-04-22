Perfecto — aquí es donde tu producto pasa de “correcto” a **potente de verdad**.
Te diseño la **interacción exacta de la esfera de Bloch integrada en tu UI**, no solo visual, sino conectada al flujo del experimento.

---

# 🧠 Objetivo de la Bloch Sphere en tu producto

No es decorativa.

👉 Debe responder a:

> “¿qué le pasa al estado cuántico cuando ejecuto el circuito?”

---

# 📍 Dónde va en tu layout

Modificación mínima del wireframe:

```plaintext
[ IZQUIERDA ]
- Circuito
- Estado (fórmula)
- Explicación

[ DERECHA ]
- Run
- Resultado (chart)

[ NUEVO: debajo del circuito o en panel izquierdo ]
- 🌐 Bloch Sphere (interactiva)
```

👉 Alternativa (mejor UX):

```plaintext
┌──────────────┬──────────────────────────┐
│ Circuito     │ Run + Resultado          │
│ Estado       │                          │
│              │                          │
│ 🌐 Bloch     │                          │
│ Sphere       │                          │
└──────────────┴──────────────────────────┘
```

---

# ⚠️ Decisión importante (clave técnica)

Bell = 2 qubits → **NO hay una única esfera de Bloch**

👉 Solución UX:

## Opción MVP (recomendada)

Mostrar:

* **Bloch sphere del qubit 0**
* **Bloch sphere del qubit 1**
* * indicador de **entrelazamiento**

---

# 🎮 Interacción completa

## 1️⃣ Estado inicial

Al cargar:

* ambos qubits en:

[
|0\rangle
]

Visual:

* vector apuntando a **+Z (polo norte)**

---

## 2️⃣ Animación del circuito

Cuando el usuario hace:

👉 `Run Experiment`

Se ejecuta esto:

### Paso A — Highlight gate

* se ilumina **H**
* animación: 300–500ms

### Paso B — Bloch update

Para qubit 0:

* pasa de:

  * Z → X (ecuador)

👉 rotación visible en la esfera

---

### Paso C — CNOT

* highlight en CNOT
* animación breve

---

### Paso D — Estado final

Aquí viene lo importante:

👉 estado entrelazado → **no representable como Bloch independiente**

---

## 3️⃣ Representación del entrelazamiento

### Visual:

* las dos esferas:

  * aparecen “conectadas”
  * (línea / glow / icono)

### Estado:

* vector de cada qubit → **colapsado al centro**
  (mixed state visual)

👉 Esto es CLAVE para intuición:

> “ya no puedes describir cada qubit por separado”

---

# 🧩 Comportamiento detallado

## 🎯 Hover sobre gates

Hover en H:

* resalta rotación en esfera:

  * tooltip: “rotación π/2 alrededor de Y”

Hover en CNOT:

* tooltip:

  * “genera entrelazamiento”

---

## 🎯 Toggle modo

Botón:

```tsx
[ View Mode: Single Qubit | Full State ]
```

### Single Qubit

* muestra esferas

### Full State

* muestra:

  ```
  |ψ⟩ = (|00⟩ + |11⟩)/√2
  ```
* * amplitudes

---

## 🎯 Slider de evolución (MUY potente)

```tsx
[ Timeline: 0 ---- 100% ]
```

Permite:

* ver paso a paso:

  * estado inicial
  * después de H
  * después de CNOT

👉 esto es oro para entender

---

# 🔄 Interacción con parámetros

Cuando cambias:

### Shots

* NO afecta esfera (correcto físicamente)
* solo afecta histograma

👉 esto enseña algo importante:

> el estado ≠ resultados medidos

---

# ⚖️ Interacción con comparación

Cuando seleccionas 2 runs:

* esfera muestra:

  * estado ideal (igual)
* chart muestra:

  * diferencias estadísticas

👉 insight visual inmediato

---

# 🎨 Diseño visual

## Esfera

* 3D (three.js o react-three-fiber)
* semi-transparente
* ejes X, Y, Z visibles

## Vector

* flecha con glow
* color:

  * azul → estado puro
  * gris → estado mixto (entrelazado)

---

# 🔥 Microinteracciones clave

### 1. Rotación suave

Cuando cambia estado:

* interpolación (no salto)

---

### 2. Pulso en entrelazamiento

Cuando aparece:

* pequeño “pulse” visual entre esferas

---

### 3. Fade a mixed state

Cuando hay entrelazamiento:

* vector pierde definición

---

# 🧠 Modelo mental que enseñas (muy importante)

Tu UI transmite:

1. estados = vectores
2. puertas = rotaciones
3. medición = probabilidades
4. entrelazamiento = no separable

👉 esto es exactamente lo que quieres

---

# 🚀 MVP realista (implementación)

Empieza así:

## Fase 1

* 1 esfera (solo qubit 0)
* rotación con H
* sin entrelazamiento

## Fase 2

* 2 esferas
* animación básica
* estado mixto visual

## Fase 3

* timeline
* tooltips
* comparación

---

# 🧠 Insight final

La Bloch sphere en tu producto no es:

> “visualización bonita”

es:

> **el puente entre matemáticas y intuición**

Aquí tienes un **componente listo para usar con React + react-three-fiber** que renderiza una **esfera de Bloch interactiva** con:

* esfera + ejes
* vector de estado
* soporte para ángulos (\theta, \phi)
* animación suave
* base para integrar con tus gates (X, H, etc.)

👉 pensado para que lo enchufes directamente en tu MVP.

---

# 📦 1. Instalación

```bash
npm install three @react-three/fiber @react-three/drei
```

---

# 🧩 2. Componente `BlochSphere.tsx`

```tsx
"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Line } from "@react-three/drei";
import { useMemo } from "react";

type Props = {
  theta: number; // [0, π]
  phi: number;   // [0, 2π]
};

function BlochVector({ theta, phi }: Props) {
  const [x, y, z] = useMemo(() => {
    return [
      Math.sin(theta) * Math.cos(phi),
      Math.sin(theta) * Math.sin(phi),
      Math.cos(theta),
    ];
  }, [theta, phi]);

  return (
    <Line
      points={[
        [0, 0, 0],
        [x, y, z],
      ]}
      color="hotpink"
      lineWidth={3}
    />
  );
}

function Axes() {
  return (
    <>
      {/* X axis */}
      <Line points={[[-1.2, 0, 0], [1.2, 0, 0]]} color="red" />
      {/* Y axis */}
      <Line points={[[0, -1.2, 0], [0, 1.2, 0]]} color="green" />
      {/* Z axis */}
      <Line points={[[0, 0, -1.2], [0, 0, 1.2]]} color="blue" />
    </>
  );
}

function Sphere() {
  return (
    <mesh>
      <sphereGeometry args={[1, 64, 64]} />
      <meshStandardMaterial
        color="#222"
        wireframe
        transparent
        opacity={0.3}
      />
    </mesh>
  );
}

export default function BlochSphere({ theta, phi }: Props) {
  return (
    <div style={{ width: "100%", height: "300px" }}>
      <Canvas camera={{ position: [2, 2, 2] }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[3, 3, 3]} />

        <Sphere />
        <Axes />
        <BlochVector theta={theta} phi={phi} />

        <OrbitControls enableZoom={false} />
      </Canvas>
    </div>
  );
}
```

---

# 🧪 3. Uso en tu app

```tsx
import BlochSphere from "@/components/BlochSphere";

export default function Page() {
  return (
    <div>
      <BlochSphere theta={Math.PI / 2} phi={0} />
    </div>
  );
}
```

---

# 🎯 4. Estados típicos (para tu producto)

Puedes mapear directamente:

```ts
// |0>
theta = 0;
phi = 0;

// |1>
theta = Math.PI;
phi = 0;

// |+>
theta = Math.PI / 2;
phi = 0;

// |->
theta = Math.PI / 2;
phi = Math.PI;
```

---

# ⚡ 5. Conectar con gates (ejemplo real)

## X gate → rotación π alrededor de X

```ts
setTheta(Math.PI - theta);
setPhi(-phi);
```

---

## H gate (aproximación visual)

```ts
setTheta(Math.PI / 2);
setPhi(0);
```

---

# 🔥 6. Animación suave (muy recomendable)

Puedes añadir esto:

```tsx
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";

function AnimatedVector({ theta, phi }: Props) {
  const ref = useRef<any>();

  useFrame(() => {
    if (!ref.current) return;

    const x = Math.sin(theta) * Math.cos(phi);
    const y = Math.sin(theta) * Math.sin(phi);
    const z = Math.cos(theta);

    ref.current.geometry.setFromPoints([
      [0, 0, 0],
      [x, y, z],
    ]);
  });

  return <line ref={ref} />;
}
```

---

# 🧠 7. Cómo integrarlo con tu flujo

Cuando haces:

👉 Run experiment

Puedes:

1. simular pasos del circuito
2. actualizar `theta, phi`
3. animar transición

---

# 🚀 8. Siguiente nivel (cuando quieras)

Puedes evolucionar esto a:

* dos esferas (2 qubits)
* estado mixto (vector difuso)
* timeline de evolución
* animación por gates (H, X, CNOT)

---

# 🧠 Insight final

Este componente ya te da:

👉 representación geométrica real del estado
👉 base para enseñar rotaciones
👉 integración directa con tu producto