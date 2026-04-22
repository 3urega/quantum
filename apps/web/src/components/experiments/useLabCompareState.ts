"use client";

import type { RunCompareResponseDTO, RunWithResultDTO } from "@quantum-ops/shared-types";
import { useCallback, useEffect, useState } from "react";
import { compareRuns, fetchRunsForLab } from "@/lib/api";

/**
 * Fase F.2: historial con resultados + comparación de dos runs (mismo template) sin duplicar lógica.
 */
export function useLabCompareState(templateId: string) {
  const [labRows, setLabRows] = useState<RunWithResultDTO[]>([]);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [compare, setCompare] = useState<RunCompareResponseDTO | null>(null);
  const [compareBusy, setCompareBusy] = useState(false);
  const [compareError, setCompareError] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    setHistoryError(null);
    try {
      const rows = await fetchRunsForLab(templateId, 25);
      setLabRows(rows);
    } catch (e) {
      setHistoryError(e instanceof Error ? e.message : "Failed to load history");
    }
  }, [templateId]);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  const clearCompare = useCallback(() => {
    setCompare(null);
    setCompareError(null);
  }, []);

  const toggleSelect = useCallback(
    (id: string) => {
      setCompare(null);
      setCompareError(null);
      setSelected((prev) => {
        if (prev.includes(id)) {
          return prev.filter((x) => x !== id);
        }
        if (prev.length >= 2) {
          return [prev[1]!, id];
        }
        return [...prev, id];
      });
    },
    [],
  );

  const onCompare = useCallback(async () => {
    if (selected.length !== 2) return;
    setCompareBusy(true);
    setCompareError(null);
    setCompare(null);
    try {
      const res = await compareRuns(selected[0]!, selected[1]!);
      setCompare(res);
    } catch (e) {
      setCompareError(e instanceof Error ? e.message : "Compare failed");
    } finally {
      setCompareBusy(false);
    }
  }, [selected]);

  return {
    labRows,
    historyError,
    loadHistory,
    selected,
    toggleSelect,
    compare,
    compareBusy,
    compareError,
    onCompare,
    clearCompare,
  };
}
