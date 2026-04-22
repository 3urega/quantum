"use client";

import Link from "next/link";

type Props = {
  templateName: string;
  badge: string;
  learnHref: string;
  learnLabel: string;
};

export function ExperimentLabHeader({ templateName, badge, learnHref, learnLabel }: Props) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200/80 pb-4 dark:border-zinc-800">
      <div>
        <p className="text-xs font-mono uppercase tracking-widest text-cyan-600 dark:text-cyan-400">
          Quantum Ops Lab
        </p>
        <div className="mt-1 flex items-center gap-2 flex-wrap">
          <h2 className="text-lg font-semibold">{templateName}</h2>
          <span
            className="text-[10px] font-medium rounded-full border border-cyan-500/50 bg-cyan-500/10 px-2 py-0.5 text-cyan-900 dark:text-cyan-200"
            title="Experimento"
          >
            {badge}
          </span>
        </div>
      </div>
      <Link
        href={learnHref}
        className="text-sm font-medium text-violet-700 underline-offset-2 hover:underline dark:text-violet-400"
      >
        {learnLabel}
      </Link>
    </header>
  );
}
