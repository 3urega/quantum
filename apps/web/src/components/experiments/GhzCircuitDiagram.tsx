"use client";

type Phase = "none" | "H" | "CNOT" | "done";

function gateFill(active: boolean) {
  return active
    ? "fill-cyan-400/30 stroke-cyan-500 drop-shadow-[0_0_6px_rgba(34,211,238,0.55)]"
    : "fill-zinc-800/50 stroke-zinc-500/80 dark:fill-zinc-900/50 dark:stroke-zinc-600";
}

type Props = {
  numQubits: number;
  activePhase: Phase;
  className?: string;
};

/**
 * H en q0 + CNOT en cadena (0→1, 1→2, …), como en el backend (ghz.py).
 * Esquemático: si n>8, el dibujo usa 8 hilos y una nota con el n real.
 */
export function GhzCircuitDiagram({ numQubits, activePhase, className = "" }: Props) {
  const n = Math.max(3, Math.min(10, Math.floor(numQubits)));
  const drawN = n > 8 ? 8 : n;
  const hOn = activePhase === "H" || activePhase === "done";
  const cnotOn = activePhase === "CNOT" || activePhase === "done";

  const dy = 12;
  const y0 = 18;
  const wireX0 = 24;
  const hColX = 52;
  const cnotStartX = 100;
  const cnotStep = 40;
  const nCnot = drawN - 1;
  const wireX1 = cnotStartX + Math.max(0, nCnot - 1) * cnotStep + 28;

  const w = wireX1 + 12;
  const h = y0 + drawN * dy + 8;

  const y = (i: number) => y0 + i * dy + 0;

  return (
    <div className={className}>
      <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-2">
        H + CNOT en cadena (GHZ)
        {n > 8 ? (
          <span className="ml-1 normal-case text-amber-700/90 dark:text-amber-300/90">
            (esquema con 8 hilos; n={n})
          </span>
        ) : null}
      </p>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="w-full max-w-xl h-auto text-foreground"
        role="img"
        aria-label={`Circuito GHZ: Hadamard en el qubit 0 y ${nCnot} CNOTs encadenados para ${n} qubits.`}
      >
        {Array.from({ length: drawN }, (_, i) => (
          <line
            key={`w-${i}`}
            x1={wireX0}
            y1={y(i)}
            x2={wireX1}
            y2={y(i)}
            className="stroke-zinc-400 dark:stroke-zinc-500"
            strokeWidth="1.2"
          />
        ))}
        {Array.from({ length: drawN }, (_, i) => (
          <text key={`q-${i}`} x="4" y={y(i) + 3} className="fill-zinc-500 text-[8px] font-mono">
            q{i}
          </text>
        ))}

        <g>
          <rect
            x={hColX - 2}
            y={y(0) - 10}
            width="26"
            height="20"
            rx="3"
            className={gateFill(hOn)}
            strokeWidth="1.1"
          />
          <text x={hColX + 10} y={y(0) + 4} textAnchor="middle" className="fill-current text-xs font-mono">
            H
          </text>
        </g>

        {Array.from({ length: nCnot }, (_, k) => {
          const x = cnotStartX + k * cnotStep;
          const c = k;
          const t = k + 1;
          return (
            <g key={`cx-${k}`}>
              <line
                x1={x}
                y1={y(c)}
                x2={x}
                y2={y(t)}
                className={cnotOn ? "stroke-cyan-400" : "stroke-zinc-500"}
                strokeWidth={cnotOn ? 2 : 1.2}
              />
              <circle
                cx={x}
                cy={y(c)}
                r="3.5"
                className={cnotOn ? "fill-cyan-400" : "fill-zinc-200 dark:fill-zinc-700 stroke-zinc-500"}
                strokeWidth="0.8"
              />
              <g transform={`translate(${x - 4},${y(t) - 4})`}>
                <rect
                  width="8"
                  height="8"
                  className="fill-zinc-100/90 dark:fill-zinc-800/90 stroke-zinc-500/90"
                />
                <line x1="0" y1="4" x2="8" y2="4" className="stroke-foreground" strokeWidth="1.1" />
                <line x1="4" y1="0" x2="4" y2="8" className="stroke-foreground" strokeWidth="1.1" />
              </g>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
