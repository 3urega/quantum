"use client";

import { getBellBlochState, type BellBlochStep } from "./bloch3d/blochMath";

/**
 * P1 / D.5: lightweight 2D Bloch "disc" (no three.js) — one sphere per qubit, Bell narrative.
 * Full R3F spec lives in /esfera.md at the repo root. Ángulos: {@link getBellBlochState}.
 */

type BlochQubitProps = {
  label: string;
  /** Bloch angles: |0> = theta 0; |+> = theta π/2, φ 0 */
  theta: number;
  phi: number;
  /** "pure" or faded for mixed / entangled hint */
  vectorOpacity?: number;
};

function vectorEndpoint(r: number, theta: number, phi: number) {
  const x = r * Math.sin(theta) * Math.cos(phi);
  const z = r * Math.cos(theta);
  return { x, z };
}

function BlochDisc({ label, theta, phi, vectorOpacity = 1 }: BlochQubitProps) {
  const cx = 55;
  const cy = 55;
  const r = 40;
  const { x, z } = vectorEndpoint(r * 0.88, theta, phi);
  const px = cx + x;
  const py = cy - z;

  return (
    <div className="inline-flex flex-col items-center gap-1">
      <span className="text-[10px] font-mono text-zinc-500">{label}</span>
      <svg viewBox="0 0 110 110" className="w-28 h-28" aria-hidden>
        <circle
          cx={cx}
          cy={cy}
          r={r}
          className="fill-zinc-900/20 stroke-zinc-500/50 dark:fill-zinc-950/40"
          strokeWidth="1"
        />
        <line
          x1={cx - r * 0.9}
          y1={cy}
          x2={cx + r * 0.9}
          y2={cy}
          className="stroke-rose-500/40"
          strokeWidth="0.5"
        />
        <line
          x1={cx}
          y1={cy - r * 0.9}
          x2={cx}
          y2={cy + r * 0.9}
          className="stroke-emerald-500/40"
          strokeWidth="0.5"
        />
        <line
          x1={cx}
          y1={cy}
          x2={cx}
          y2={cy - r * 0.85}
          className="stroke-blue-500/30"
          strokeWidth="0.5"
        />
        <line
          x1={cx}
          y1={cy}
          x2={px}
          y2={py}
          className="stroke-cyan-400"
          strokeWidth="2.2"
          strokeLinecap="round"
          style={{ opacity: vectorOpacity }}
        />
        <circle
          cx={px}
          cy={py}
          r="3.5"
          className="fill-cyan-400"
          style={{ opacity: vectorOpacity }}
        />
      </svg>
    </div>
  );
}

type Props = {
  /** 0: |00> init, 1: after H on q0, 2: after CNOT (entangled — show fade + link) */
  step: BellBlochStep;
  className?: string;
};

export function BlochPreview2D({ step, className = "" }: Props) {
  const { q0, q1, entangled } = getBellBlochState(step);
  const op = entangled ? 0.45 : 1;

  return (
    <div className={className}>
      <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-2">
        Bloch (partial view)
      </p>
      <div className="flex flex-wrap items-end justify-center gap-6">
        <BlochDisc label="Qubit 0" theta={q0.theta} phi={q0.phi} vectorOpacity={op} />
        <BlochDisc label="Qubit 1" theta={q1.theta} phi={q1.phi} vectorOpacity={op} />
      </div>
      {entangled ? (
        <p className="mt-2 text-xs text-amber-700/90 dark:text-amber-200/90 max-w-sm">
          Estado de 2 qubits entrelazado: no es un producto de estados 1-qubit. Las esferas solo
          dan intuición; el estado global es (|00⟩+|11⟩)/√2.
        </p>
      ) : null}
    </div>
  );
}
