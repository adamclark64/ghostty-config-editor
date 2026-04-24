import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { ConfigEntry, ConfigKey } from "@/types";
import { useConfig } from "@/hooks/useConfig";

type ConfigModel = ReturnType<typeof useConfig>;

export interface ConfigCtx extends ConfigModel {
  schema: ConfigKey[];
  /** First value for a scalar key, or "" when absent. */
  get(key: string): string;
  /** All values (useful for repeatable keys like `palette` or `keybind`). */
  getAll(key: string): string[];
  /** Replace with a single value (pass "" to remove the key). */
  set(key: string, value: string): void;
  setAll(key: string, values: string[]): void;
  isDirtyKey(key: string): boolean;
  defaultOf(key: string): string | undefined;
  docsOf(key: string): string | undefined;
  schemaKey(key: string): ConfigKey | undefined;
  /** Keys that exist in the draft but aren't part of the known schema. */
  unknownKeys: string[];
  /** In-memory before/after: triggered by Compare UI. */
  original: ConfigEntry[];
}

const Ctx = createContext<ConfigCtx | null>(null);

export function ConfigProvider({
  schema,
  children,
}: {
  schema: ConfigKey[];
  children: ReactNode;
}) {
  const model = useConfig(schema);

  const schemaByName = useMemo(() => {
    const m = new Map<string, ConfigKey>();
    for (const k of schema) m.set(k.name, k);
    return m;
  }, [schema]);

  const originalByKey = useMemo(() => {
    const m = new Map<string, string[]>();
    for (const e of model.original) {
      if (e.kind === "entry") {
        const arr = m.get(e.key) ?? [];
        arr.push(e.value);
        m.set(e.key, arr);
      }
    }
    return m;
  }, [model.original]);

  const unknownKeys = useMemo(() => {
    const keys: string[] = [];
    for (const k of model.valuesByKey.keys()) {
      if (!schemaByName.has(k)) keys.push(k);
    }
    return keys;
  }, [model.valuesByKey, schemaByName]);

  const ctx: ConfigCtx = {
    ...model,
    schema,
    get: (key) => model.valuesByKey.get(key)?.[0] ?? "",
    getAll: (key) => model.valuesByKey.get(key) ?? [],
    set: (key, value) => model.setValues(key, value === "" ? [] : [value]),
    setAll: (key, values) => model.setValues(key, values),
    isDirtyKey: (key) => {
      const a = originalByKey.get(key) ?? [];
      const b = model.valuesByKey.get(key) ?? [];
      return JSON.stringify(a) !== JSON.stringify(b);
    },
    defaultOf: (key) => schemaByName.get(key)?.defaults[0],
    docsOf: (key) => schemaByName.get(key)?.docs,
    schemaKey: (key) => schemaByName.get(key),
    unknownKeys,
    original: model.original,
  };

  return <Ctx.Provider value={ctx}>{children}</Ctx.Provider>;
}

export function useConfigCtx(): ConfigCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error("useConfigCtx used outside ConfigProvider");
  return v;
}
