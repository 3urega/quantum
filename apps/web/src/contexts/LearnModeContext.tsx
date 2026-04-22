"use client";

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

const STORAGE_KEY = "quantum-ops-learn-mode";

type LearnModeContextValue = {
  learnMode: boolean;
  setLearnMode: (value: boolean) => void;
  toggleLearnMode: () => void;
};

const LearnModeContext = createContext<LearnModeContextValue | null>(null);

const listeners = new Set<() => void>();

/** After first client paint so getSnapshot matches getServerSnapshot (false) during SSR/first pass. */
let didHydrate = false;

function readStored(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function writeStored(value: boolean): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, value ? "1" : "0");
  } catch {
    /* ignore */
  }
}

function emit(): void {
  for (const l of listeners) l();
}

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY || e.key == null) callback();
  };
  if (typeof window !== "undefined") {
    window.addEventListener("storage", onStorage);
  }
  return () => {
    listeners.delete(callback);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", onStorage);
    }
  };
}

function getSnapshot(): boolean {
  if (typeof window === "undefined" || !didHydrate) return false;
  return readStored();
}

function getServerSnapshot(): boolean {
  return false;
}

export function LearnModeProvider({ children }: { children: ReactNode }) {
  const learnMode = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useLayoutEffect(() => {
    didHydrate = true;
    emit();
  }, []);

  const setLearnMode = useCallback((value: boolean) => {
    didHydrate = true;
    writeStored(value);
    emit();
  }, []);

  const toggleLearnMode = useCallback(() => {
    didHydrate = true;
    writeStored(!readStored());
    emit();
  }, []);

  const value = useMemo<LearnModeContextValue>(
    () => ({ learnMode, setLearnMode, toggleLearnMode }),
    [learnMode, setLearnMode, toggleLearnMode],
  );

  return (
    <LearnModeContext.Provider value={value}>
      {children}
    </LearnModeContext.Provider>
  );
}

export function useLearnMode(): LearnModeContextValue {
  const ctx = useContext(LearnModeContext);
  if (!ctx) {
    throw new Error("useLearnMode must be used within LearnModeProvider");
  }
  return ctx;
}

export function useLearnModeOptional(): LearnModeContextValue | null {
  return useContext(LearnModeContext);
}
