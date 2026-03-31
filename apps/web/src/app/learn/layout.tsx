import "katex/dist/katex.min.css";
import Link from "next/link";
import type { ReactNode } from "react";

export default function LearnLayout({ children }: { children: ReactNode }) {
  return (
    <div lang="es" className="flex flex-1 flex-col">
      <div className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-950/50">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-3 px-6 py-3 text-sm">
          <Link href="/learn" className="font-medium text-cyan-700 dark:text-cyan-400">
            Tutoriales
          </Link>
          <span className="text-zinc-400">/</span>
          <Link href="/" className="text-zinc-600 hover:text-foreground dark:text-zinc-400">
            Volver al inicio
          </Link>
          <Link
            href="/experiments"
            className="text-zinc-600 hover:text-foreground dark:text-zinc-400"
          >
            Experimentos
          </Link>
        </div>
      </div>
      <article
        className={[
          "learn-mdx mx-auto w-full max-w-3xl flex-1 px-6 py-10",
          "[&_h1]:mb-4 [&_h1]:text-3xl [&_h1]:font-semibold [&_h1]:tracking-tight",
          "[&_h2]:mb-3 [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-semibold",
          "[&_h3]:mb-2 [&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-medium",
          "[&_p]:my-3 [&_p]:leading-relaxed [&_p]:text-zinc-700 dark:text-zinc-300",
          "[&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:text-zinc-700 dark:text-zinc-300",
          "[&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:text-zinc-700 dark:text-zinc-300",
          "[&_li]:my-1",
          "[&_a]:text-cyan-700 [&_a]:underline [&_a]:underline-offset-2 dark:text-cyan-400",
          "[&_blockquote]:my-4 [&_blockquote]:border-l-4 [&_blockquote]:border-cyan-500/50 [&_blockquote]:pl-4 [&_blockquote]:italic",
          "[&_hr]:my-8 [&_hr]:border-zinc-200 dark:[&_hr]:border-zinc-800",
          "[&_.katex-display]:my-6 [&_.katex-display]:overflow-x-auto",
        ].join(" ")}
      >
        {children}
      </article>
    </div>
  );
}
