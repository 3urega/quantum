"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState, type SVGProps } from "react";
import { useLearnMode } from "@/contexts/LearnModeContext";

function IconMenu(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function IconClose(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18 18 6M6 6l12 12" />
    </svg>
  );
}

export function SiteHeader() {
  const { learnMode, toggleLearnMode } = useLearnMode();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const drawerTitleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  useEffect(() => {
    closeMobile();
  }, [pathname, closeMobile]);

  useEffect(() => {
    if (!mobileOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMobile();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeMobile]);

  useEffect(() => {
    if (!mobileOpen) return;
    const t = window.setTimeout(() => {
      panelRef.current?.querySelector<HTMLElement>("a")?.focus();
    }, 100);
    return () => window.clearTimeout(t);
  }, [mobileOpen]);

  const navLinkClass =
    "rounded-lg px-3 py-3 text-base font-medium text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-foreground dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white md:rounded-none md:p-0 md:text-sm md:font-normal md:hover:bg-transparent";

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-[var(--background)]/95 backdrop-blur-sm dark:border-zinc-800">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-3 px-4 py-3 md:gap-4 md:px-6 md:py-4">
          <div className="flex min-w-0 flex-1 items-center gap-6 md:gap-8">
            <Link
              href="/"
              className="truncate font-semibold text-base tracking-tight md:text-lg"
              onClick={() => setMobileOpen(false)}
            >
              Quantum Ops Lab
            </Link>
            <nav
              className="hidden md:flex md:flex-wrap md:items-center md:gap-4 md:text-sm md:text-zinc-600 dark:md:text-zinc-400"
              aria-label="Principal"
            >
              <Link className={`${navLinkClass} md:inline`} href="/experiments">
                Experiments
              </Link>
              <Link className={`${navLinkClass} md:inline`} href="/learn">
                Aprende
              </Link>
              <Link className={`${navLinkClass} md:inline`} href="/runs">
                Historial
              </Link>
            </nav>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <div className="hidden items-center gap-2 md:flex">
              <span id="learn-mode-label" className="text-xs text-zinc-500 dark:text-zinc-400">
                Modo aprendizaje
              </span>
              <button
                type="button"
                onClick={toggleLearnMode}
                className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border transition-colors ${
                  learnMode
                    ? "border-violet-500/60 bg-violet-200/90 dark:border-violet-500/50 dark:bg-violet-900/50"
                    : "border-zinc-300 bg-zinc-200 dark:border-zinc-600 dark:bg-zinc-800"
                }`}
                role="switch"
                aria-checked={learnMode}
                aria-label="Modo aprendizaje"
              >
                <span
                  className={`pointer-events-none inline-block h-6 w-6 translate-y-0.5 rounded-full shadow transition-transform ${
                    learnMode
                      ? "translate-x-5 bg-violet-600 dark:bg-violet-400"
                      : "translate-x-0.5 bg-white dark:bg-zinc-200"
                  }`}
                />
              </button>
              {learnMode ? (
                <span className="text-xs font-medium text-violet-700 dark:text-violet-300">Activado</span>
              ) : null}
            </div>

            <button
              type="button"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-zinc-300 text-zinc-700 transition-colors hover:bg-zinc-100 md:hidden dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav-drawer"
              onClick={() => setMobileOpen((o) => !o)}
            >
              <span className="sr-only">{mobileOpen ? "Cerrar menú" : "Abrir menú"}</span>
              {mobileOpen ? <IconClose className="h-5 w-5" /> : <IconMenu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Drawer móvil */}
      <div
        className={`fixed inset-0 z-50 md:hidden ${mobileOpen ? "pointer-events-auto" : "pointer-events-none"}`}
        aria-hidden={!mobileOpen}
      >
        <button
          type="button"
          className={`absolute inset-0 bg-black/40 transition-opacity duration-200 ${
            mobileOpen ? "opacity-100" : "opacity-0"
          }`}
          aria-label="Cerrar menú"
          tabIndex={mobileOpen ? 0 : -1}
          onClick={closeMobile}
        />

        <div
          ref={panelRef}
          id="mobile-nav-drawer"
          role="dialog"
          aria-modal="true"
          aria-labelledby={drawerTitleId}
          inert={!mobileOpen}
          className={`absolute top-0 left-0 flex h-full w-[min(88vw,300px)] flex-col border-r border-zinc-200 bg-[var(--background)] shadow-xl transition-transform duration-200 ease-out dark:border-zinc-800 ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
            <p id={drawerTitleId} className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Menú
            </p>
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              aria-label="Cerrar menú"
              onClick={closeMobile}
            >
              <IconClose className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-4" aria-label="Principal">
            <Link href="/experiments" className={navLinkClass} onClick={closeMobile}>
              Experiments
            </Link>
            <Link href="/learn" className={navLinkClass} onClick={closeMobile}>
              Aprende
            </Link>
            <Link href="/runs" className={navLinkClass} onClick={closeMobile}>
              Historial
            </Link>
          </nav>

          <div className="border-t border-zinc-200 p-4 dark:border-zinc-800">
            <p className="mb-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">Modo aprendizaje</p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={toggleLearnMode}
                className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full border transition-colors ${
                  learnMode
                    ? "border-violet-500/60 bg-violet-200/90 dark:border-violet-500/50 dark:bg-violet-900/50"
                    : "border-zinc-300 bg-zinc-200 dark:border-zinc-600 dark:bg-zinc-800"
                }`}
                role="switch"
                aria-checked={learnMode}
                aria-label="Modo aprendizaje"
              >
                <span
                  className={`pointer-events-none inline-block h-7 w-7 translate-y-px rounded-full shadow transition-transform ${
                    learnMode
                      ? "translate-x-7 bg-violet-600 dark:bg-violet-400"
                      : "translate-x-0.5 bg-white dark:bg-zinc-200"
                  }`}
                />
              </button>
              <span className="text-sm text-zinc-700 dark:text-zinc-300">{learnMode ? "Activado" : "Desactivado"}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
