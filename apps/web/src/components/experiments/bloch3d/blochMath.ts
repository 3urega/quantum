/**
 * Estado de Bloch para el relato del experimento Bell (2 qubits), alineado con BlochPreview2D / lab.
 * 3D y 2D leen de aquí para no desincronizar ángulos.
 */
export type BellBlochStep = 0 | 1 | 2;

export type QubitBlochAngles = {
  theta: number;
  phi: number;
};

export type BellBlochState = {
  q0: QubitBlochAngles;
  q1: QubitBlochAngles;
  entangled: boolean;
};

/** 0: |00⟩; 1: tras H en q0; 2: tras CNOT (entrelazado). */
export function getBellBlochState(step: BellBlochStep): BellBlochState {
  return {
    q0: { theta: step >= 1 ? Math.PI / 2 : 0, phi: 0 },
    q1: { theta: step >= 2 ? Math.PI / 2 : 0, phi: 0 },
    entangled: step >= 2,
  };
}

/** Punto en la esfera unitaria de Bloch: (sin θ cos φ, sin θ sin φ, cos θ). */
export function blochVectorUnit(theta: number, phi: number): [number, number, number] {
  return [
    Math.sin(theta) * Math.cos(phi),
    Math.sin(theta) * Math.sin(phi),
    Math.cos(theta),
  ];
}
