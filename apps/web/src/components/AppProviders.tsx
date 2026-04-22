"use client";

import type { ReactNode } from "react";
import { LearnModeProvider } from "@/contexts/LearnModeContext";

export function AppProviders({ children }: { children: ReactNode }) {
  return <LearnModeProvider>{children}</LearnModeProvider>;
}
