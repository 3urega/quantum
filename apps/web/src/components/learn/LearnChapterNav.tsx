"use client";

import Link from "next/link";
import { getPrevNext } from "@/lib/learn/curriculum";

type Props = {
  slug: string;
};

export function LearnChapterNav({ slug }: Props) {
  const { prev, next } = getPrevNext(slug);

  return (
    <nav
      className="mt-12 flex flex-wrap items-stretch justify-between gap-4 border-t border-zinc-200 pt-8 dark:border-zinc-800"
      aria-label="Navegación del currículo"
    >
      {prev ? (
        <Link
          href={`/learn/${prev.slug}`}
          className="flex min-w-[10rem] flex-1 flex-col rounded-lg border border-zinc-200/80 px-4 py-3 text-left text-sm transition-colors hover:border-cyan-500/40 dark:border-zinc-800"
        >
          <span className="text-xs text-zinc-500">Anterior</span>
          <span className="font-medium text-cyan-800 dark:text-cyan-200">{prev.title}</span>
        </Link>
      ) : (
        <div className="min-w-[10rem] flex-1" />
      )}
      {next ? (
        <Link
          href={`/learn/${next.slug}`}
          className="flex min-w-[10rem] flex-1 flex-col items-end rounded-lg border border-zinc-200/80 px-4 py-3 text-right text-sm transition-colors hover:border-cyan-500/40 dark:border-zinc-800"
        >
          <span className="text-xs text-zinc-500">Siguiente</span>
          <span className="font-medium text-cyan-800 dark:text-cyan-200">{next.title}</span>
        </Link>
      ) : (
        <div className="min-w-[10rem] flex-1" />
      )}
    </nav>
  );
}
