"use client";

/**
 * Aligned bar pair for /runs/compare (two runs, same label order).
 * Shared by Bell and GHZ lab views.
 */
export function CompareAlignedBarRow({
  labels,
  counts,
  shots,
  color,
  title,
}: {
  labels: string[];
  counts: number[];
  shots: number;
  color: string;
  title: string;
}) {
  const max = Math.max(1, ...counts);
  const minChartWidth = Math.max(24, labels.length * 2.25);
  return (
    <div className="space-y-2 min-w-0">
      <p className="text-xs font-medium text-zinc-500">{title}</p>
      <div className="overflow-x-auto pb-1 -mx-1 px-1">
        <div
          className="flex items-end gap-2 h-32 pt-1 flex-nowrap"
          style={{ minWidth: `${minChartWidth}rem` }}
        >
        {labels.map((label, i) => {
          const c = counts[i] ?? 0;
          const p = shots > 0 ? (c / shots) * 100 : 0;
          const h = `${Math.round((c / max) * 100)}%`;
          return (
            <div
              key={`${label}-${i}`}
              className="flex w-8 shrink-0 flex-col items-center gap-1 min-w-0"
            >
              <div
                className={`w-full min-h-[4px] rounded-t transition-all duration-500 ${color}`}
                style={{ height: h }}
                title={`${label}: ${c} (${p.toFixed(1)}%)`}
              />
              <span className="font-mono text-[10px] text-zinc-500 truncate w-full text-center">
                {label}
              </span>
              <span className="font-mono text-[9px] text-zinc-400">
                {c} · {(p / 100).toFixed(2)}
              </span>
            </div>
          );
        })}
        </div>
      </div>
    </div>
  );
}
