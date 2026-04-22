import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/tauri";
import type { ConfigEntry, ConfigKey } from "@/types";

/**
 * Holds the on-disk entry list plus in-flight edits. A draft entry with the
 * same key replaces the first on-disk occurrence. For repeatable keys the
 * draft stores all values at once (we re-emit them in order).
 */
export interface ConfigModel {
  /** Original, untouched list (reference for diff). */
  original: ConfigEntry[];
  /** Currently staged entry list — what will be written on save. */
  draft: ConfigEntry[];
  /** Quick lookup: name -> list of values (one entry per key occurrence). */
  valuesByKey: Map<string, string[]>;
}

function buildValuesByKey(entries: ConfigEntry[]): Map<string, string[]> {
  const m = new Map<string, string[]>();
  for (const e of entries) {
    if (e.kind === "entry") {
      const arr = m.get(e.key) ?? [];
      arr.push(e.value);
      m.set(e.key, arr);
    }
  }
  return m;
}

export function useConfig(schema: ConfigKey[] | undefined) {
  const query = useQuery({
    queryKey: ["config"],
    queryFn: api.readConfig,
  });

  const [draft, setDraft] = useState<ConfigEntry[] | null>(null);

  useEffect(() => {
    if (query.data && draft === null) {
      setDraft(query.data);
    }
  }, [query.data, draft]);

  const original = query.data ?? [];
  const current = draft ?? original;

  const valuesByKey = useMemo(() => buildValuesByKey(current), [current]);

  const setValues = useCallback(
    (key: string, values: string[]) => {
      setDraft((prev) => {
        const base = prev ?? query.data ?? [];
        // Remove all existing entries for this key, then append new values
        // at the position of the first removed entry (preserving block order).
        const next: ConfigEntry[] = [];
        let insertedAt: number | null = null;
        for (const e of base) {
          if (e.kind === "entry" && e.key === key) {
            if (insertedAt === null) insertedAt = next.length;
            continue;
          }
          next.push(e);
        }
        const newEntries: ConfigEntry[] = values
          .filter((v) => v !== null && v !== undefined)
          .map((value) => ({ kind: "entry" as const, key, value }));
        if (insertedAt === null) {
          // Key not present yet — append near end but before trailing blanks.
          let tailBlanks = 0;
          for (let i = next.length - 1; i >= 0; i--) {
            if (next[i].kind === "blank") tailBlanks++;
            else break;
          }
          next.splice(next.length - tailBlanks, 0, ...newEntries);
        } else {
          next.splice(insertedAt, 0, ...newEntries);
        }
        return next;
      });
    },
    [query.data]
  );

  const reset = useCallback(() => setDraft(query.data ?? []), [query.data]);

  const isDirty = useMemo(() => {
    if (draft === null) return false;
    return JSON.stringify(draft) !== JSON.stringify(original);
  }, [draft, original]);

  void schema; // reserved for future use (e.g., defaulting behavior)

  return {
    query,
    draft: current,
    original,
    valuesByKey,
    setValues,
    reset,
    isDirty,
  };
}
