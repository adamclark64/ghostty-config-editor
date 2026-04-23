import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/tauri";
import {
  useConfigPaths,
  useSchema,
  useSessionStatus,
} from "@/hooks/useSchema";
import { useConfig } from "@/hooks/useConfig";
import { Toolbar } from "@/components/Toolbar";
import { KeyGroupList } from "@/components/KeyGroupList";
import { FieldRenderer } from "@/components/FieldRenderer";
import { ValidationPanel } from "@/components/ValidationPanel";
import { BackupList } from "@/components/BackupList";
import { ThemeGallery } from "@/components/ThemeGallery";
import type { ConfigEntry, ConfigKey, ValidationResult } from "@/types";

export default function App() {
  const schemaQ = useSchema();
  const pathsQ = useConfigPaths();
  const sessionQ = useSessionStatus();
  const config = useConfig(schemaQ.data);
  const qc = useQueryClient();

  const [search, setSearch] = useState("");
  const [group, setGroup] = useState<string | null>(null);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [showBackups, setShowBackups] = useState(false);
  const [showThemes, setShowThemes] = useState(false);

  /** Validate → write (with backup) → reload Ghostty. Invalidates caches. */
  async function saveAndReload(entries: ConfigEntry[], reload = true) {
    try {
      const r = await api.saveAndReload(entries, reload);
      await qc.invalidateQueries({ queryKey: ["config"] });
      await qc.invalidateQueries({ queryKey: ["backups"] });
      await qc.invalidateQueries({ queryKey: ["session-status"] });
      const reloadNote = r.reload_ok
        ? "reloaded"
        : r.reload_error
        ? `saved (reload failed: ${r.reload_error})`
        : "saved";
      setToast(`Saved → ${reloadNote}`);
      setTimeout(() => setToast(null), 5000);
    } catch (e) {
      setToast(`Save failed: ${String(e)}`);
      setTimeout(() => setToast(null), 6000);
    }
  }

  const saveMut = useMutation({
    mutationFn: () => saveAndReload(config.draft, true),
  });

  const validateMut = useMutation({
    mutationFn: () => api.validateConfig(config.draft),
    onSuccess: (r) => setValidation(r),
  });

  async function handleRevert() {
    if (config.isDirty) {
      config.reset();
      setToast("Dropped unsaved edits");
      setTimeout(() => setToast(null), 2500);
      return;
    }
    if (sessionQ.data?.is_modified) {
      try {
        await api.revertSession();
        await api.reloadGhostty().catch(() => {}); // best-effort
        await qc.invalidateQueries({ queryKey: ["config"] });
        await qc.invalidateQueries({ queryKey: ["backups"] });
        await qc.invalidateQueries({ queryKey: ["session-status"] });
        setToast("Reverted to session start + reloaded Ghostty");
        setTimeout(() => setToast(null), 4000);
      } catch (e) {
        setToast(`Revert failed: ${String(e)}`);
        setTimeout(() => setToast(null), 5000);
      }
    }
  }

  async function handleKeepSession() {
    try {
      await api.keepSession();
      await qc.invalidateQueries({ queryKey: ["session-status"] });
      setToast("Session baseline cleared — current config is your new start");
      setTimeout(() => setToast(null), 4000);
    } catch (e) {
      setToast(`Keep failed: ${String(e)}`);
      setTimeout(() => setToast(null), 5000);
    }
  }

  const { groups, filteredKeys } = useMemo(() => {
    const schema = schemaQ.data ?? [];
    const buckets = new Map<string, ConfigKey[]>();
    for (const k of schema) {
      const arr = buckets.get(k.group) ?? [];
      arr.push(k);
      buckets.set(k.group, arr);
    }
    const groupList = Array.from(buckets.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([name, keys]) => {
        const dirtyCount = keys.filter((k) => isKeyDirty(k)).length;
        return { name, count: keys.length, dirtyCount };
      });

    const q = search.trim().toLowerCase();
    const filtered = schema.filter((k) => {
      if (group && k.group !== group) return false;
      if (!q) return true;
      return (
        k.name.toLowerCase().includes(q) ||
        k.docs.toLowerCase().includes(q)
      );
    });

    return { groups: groupList, filteredKeys: filtered };

    function isKeyDirty(k: ConfigKey): boolean {
      const original = buildValuesMap(config.original)[k.name] ?? [];
      const current = config.valuesByKey.get(k.name) ?? [];
      return JSON.stringify(original) !== JSON.stringify(current);
    }
  }, [
    schemaQ.data,
    config.original,
    config.valuesByKey,
    search,
    group,
  ]);

  /**
   * Apply a set of key→values overrides to the current on-disk config and
   * immediately save + reload. Used by the theme gallery so picking a theme
   * is a live, one-click preview.
   *
   * We replace the draft with the merged result before saving so the field
   * editor immediately reflects the applied theme. Without this, `draft`
   * holds the pre-theme values while disk (and `original` once refetched)
   * advances — making the UI look unchanged *and* re-enabling Save, which
   * would then write the stale draft back and revert the theme.
   */
  async function applyEntriesAndGo(entries: Array<[string, string[]]>) {
    const base = config.original.slice();
    const next = mergeValues(base, entries);
    config.replace(next);
    await saveAndReload(next, true);
  }

  const configPath = pathsQ.data?.real;

  if (schemaQ.isLoading) {
    return <Centered>Loading Ghostty schema…</Centered>;
  }
  if (schemaQ.error) {
    return (
      <Centered>
        <div className="text-red-300">{String(schemaQ.error)}</div>
      </Centered>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <Toolbar
        configPath={configPath}
        isDirty={config.isDirty}
        saving={saveMut.isPending}
        session={sessionQ.data}
        onSaveAndReload={() => saveMut.mutate()}
        onValidate={() => validateMut.mutate()}
        onRevert={handleRevert}
        onKeepSession={handleKeepSession}
        onShowBackups={() => setShowBackups(true)}
        onShowThemes={() => setShowThemes(true)}
        search={search}
        onSearch={setSearch}
      />
      <div className="flex-1 grid grid-cols-[220px_1fr_360px] min-h-0">
        <aside className="border-r border-zinc-800 scroll-y chrome-panel">
          <KeyGroupList groups={groups} selected={group} onSelect={setGroup} />
        </aside>
        <main className="scroll-y">
          {filteredKeys.map((k) => {
            const current = config.valuesByKey.get(k.name) ?? [""];
            const isDirty =
              JSON.stringify(buildValuesMap(config.original)[k.name] ?? []) !==
              JSON.stringify(config.valuesByKey.get(k.name) ?? []);
            return (
              <FieldRenderer
                key={k.name}
                def={k}
                values={current}
                isDirty={isDirty}
                onChange={(values) => config.setValues(k.name, values)}
              />
            );
          })}
          {filteredKeys.length === 0 && (
            <div className="p-8 text-sm text-zinc-400">No matching keys.</div>
          )}
        </main>
        <aside className="border-l border-zinc-800 scroll-y chrome-panel">
          <div className="p-4 border-b border-zinc-800 text-[11px] uppercase tracking-wider text-zinc-500">
            Validation
          </div>
          <ValidationPanel result={validation} />
        </aside>
      </div>
      {toast && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 chrome-panel border border-zinc-700 rounded text-sm text-zinc-100">
          {toast}
        </div>
      )}
      {showBackups && <BackupList onClose={() => setShowBackups(false)} />}
      {showThemes && (
        <ThemeGallery
          onClose={() => setShowThemes(false)}
          onApplyEntries={(entries) => {
            applyEntriesAndGo(entries);
          }}
        />
      )}
    </div>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full flex items-center justify-center text-zinc-400 text-sm">
      {children}
    </div>
  );
}

function buildValuesMap(entries: ConfigEntry[]): Record<string, string[]> {
  const m: Record<string, string[]> = {};
  for (const e of entries) {
    if (e.kind === "entry") {
      (m[e.key] ??= []).push(e.value);
    }
  }
  return m;
}

/**
 * Given an on-disk entry list and a set of [key, values] overrides, produce
 * a new entry list where:
 *   - all existing entries for overridden keys are removed
 *   - the new values are inserted at the position of the first removed entry
 *     (or appended before trailing blanks if the key wasn't present)
 *   - comments / blank lines / other keys are preserved
 */
function mergeValues(
  base: ConfigEntry[],
  overrides: Array<[string, string[]]>
): ConfigEntry[] {
  let next = base.slice();
  for (const [key, values] of overrides) {
    const filtered: ConfigEntry[] = [];
    let insertAt: number | null = null;
    for (const e of next) {
      if (e.kind === "entry" && e.key === key) {
        if (insertAt === null) insertAt = filtered.length;
        continue;
      }
      filtered.push(e);
    }
    const nonEmpty = values.filter((v) => v !== "");
    const newEntries: ConfigEntry[] = nonEmpty.map((value) => ({
      kind: "entry" as const,
      key,
      value,
    }));
    if (insertAt === null) {
      let tailBlanks = 0;
      for (let i = filtered.length - 1; i >= 0; i--) {
        if (filtered[i].kind === "blank") tailBlanks++;
        else break;
      }
      filtered.splice(filtered.length - tailBlanks, 0, ...newEntries);
    } else {
      filtered.splice(insertAt, 0, ...newEntries);
    }
    next = filtered;
  }
  return next;
}
