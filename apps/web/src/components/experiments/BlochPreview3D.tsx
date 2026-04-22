"use client";

import dynamic from "next/dynamic";
import { getBellBlochState, type BellBlochStep } from "./bloch3d/blochMath";

const BlochSphereCanvas = dynamic(
  () =>
    import("./bloch3d/BlochSphereCanvas").then((m) => ({ default: m.BlochSphereCanvas })),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex h-[300px] w-full items-center justify-center rounded-lg border border-dashed border-zinc-400/60 bg-zinc-100/30 text-sm text-zinc-500 dark:border-zinc-600 dark:bg-zinc-900/20 dark:text-zinc-400"
        aria-hidden
      >
        Cargando vista 3D…
      </div>
    ),
  },
);

type Props = {
  step: BellBlochStep;
  className?: string;
};

/**
 * P1: vista 3D (R3F) opcional, mismo estado que {@link BlochPreview2D}.
 * Cargada sin SSR para WebGL.
 */
export function BlochPreview3D({ step, className = "" }: Props) {
  const state = getBellBlochState(step);

  return (
    <div className={className}>
      <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-2">
        Bloch 3D (arrastra para orbitar)
      </p>
      <BlochSphereCanvas state={state} />
      <p className="mt-1.5 text-center text-[10px] text-zinc-500 font-mono">
        Qubit 0 (izq.) · Qubit 1 (der.)
        {state.entangled ? (
          <span className="text-amber-600/90 dark:text-amber-300/90"> · línea: correlación (intuición)</span>
        ) : null}
      </p>
    </div>
  );
}
