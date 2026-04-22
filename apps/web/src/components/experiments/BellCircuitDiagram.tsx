"use client";

type Gate = "none" | "H" | "CNOT" | "done";

type Props = {
  /** D.8: which gate to highlight during fake execution animation. */
  activeGate: Gate;
  className?: string;
};

function gateClass(active: boolean) {
  return active
    ? "fill-cyan-400/30 stroke-cyan-500 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]"
    : "fill-zinc-800/50 stroke-zinc-500/80 dark:fill-zinc-900/50 dark:stroke-zinc-600";
}

export function BellCircuitDiagram({ activeGate, className = "" }: Props) {
  const hOn = activeGate === "H";
  const cxOn = activeGate === "CNOT";

  return (
    <div className={className}>
      <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-2">
        H + CNOT (Bell)
      </p>
      <svg
        viewBox="0 0 280 100"
        className="w-full max-w-md h-auto text-foreground"
        role="img"
        aria-label="Circuit: Hadamard on qubit 0, then CNOT with control 0, target 1"
      >
        {/* Wires */}
        <line
          x1="10"
          y1="32"
          x2="250"
          y2="32"
          className="stroke-zinc-400 dark:stroke-zinc-500"
          strokeWidth="1.5"
        />
        <line
          x1="10"
          y1="68"
          x2="250"
          y2="68"
          className="stroke-zinc-400 dark:stroke-zinc-500"
          strokeWidth="1.5"
        />
        <text x="2" y="36" className="fill-zinc-500 text-[9px] font-mono">
          q0
        </text>
        <text x="2" y="72" className="fill-zinc-500 text-[9px] font-mono">
          q1
        </text>
        {/* H on q0 */}
        <g>
          <title>Hadamard: superposición en el qubit 0 (rotación relevante alrededor del eje adecuado en la esfera de Bloch).</title>
          <rect
            x="48"
            y="18"
            width="32"
            height="28"
            rx="3"
            className={gateClass(hOn)}
            strokeWidth="1.2"
          />
          <text x="64" y="35" textAnchor="middle" className="fill-current text-sm font-mono">
            H
          </text>
        </g>
        {/* CNOT: vertical + control dot + target not */}
        <g>
          <title>CNOT: el control (punto) está en q0; el NOT en q1; crea entrelazamiento a partir de superposición.</title>
          <line
            x1="140"
            y1="32"
            x2="140"
            y2="68"
            className={cxOn ? "stroke-cyan-400" : "stroke-zinc-500"}
            strokeWidth={cxOn ? 2 : 1.2}
          />
          <circle
            cx="140"
            cy="32"
            r="5"
            className={cxOn ? "fill-cyan-400" : "fill-zinc-700"}
            stroke="currentColor"
            strokeWidth="0.5"
          />
          <g transform="translate(128, 56)">
            <rect
              x="0"
              y="0"
              width="24"
              height="24"
              rx="2"
              className={gateClass(cxOn)}
              strokeWidth="1"
            />
            <line
              x1="4"
              y1="12"
              x2="20"
              y2="12"
              className="stroke-foreground/90"
              strokeWidth="1.2"
            />
            <line
              x1="12"
              y1="4"
              x2="12"
              y2="20"
              className="stroke-foreground/90"
              strokeWidth="1.2"
            />
            <circle cx="12" cy="12" r="2.5" className="fill-foreground" />
          </g>
        </g>
        {activeGate === "done" ? (
          <text x="200" y="50" className="fill-emerald-500/90 text-[10px] font-mono">
            ✓
          </text>
        ) : null}
      </svg>
    </div>
  );
}
