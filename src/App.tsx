import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/tauri";
import { useConfigPaths, useSchema, useSessionStatus } from "@/hooks/useSchema";
import { ConfigProvider, useConfigCtx } from "@/context/ConfigContext";
import { Titlebar } from "@/components/shell/Titlebar";
import { Sidebar } from "@/components/shell/Sidebar";
import { SectionEditor } from "@/components/shell/SectionEditor";
import { PreviewPane } from "@/components/shell/PreviewPane";
import { PaneHandle } from "@/components/shell/PaneHandle";
import type { TargetKey } from "@/components/shell/SectionEditor";
import { Toast } from "@/components/shell/Toast";
import { BackupList } from "@/components/BackupList";
import { ThemeGallery } from "@/components/ThemeGallery";
import { useColorScheme } from "@/hooks/useColorScheme";
import { usePaneLayout } from "@/hooks/usePaneLayout";
import { generateRandomTheme, randomThemeEntries } from "@/lib/random-theme";
import type { ConfigEntry, ValidationResult } from "@/types";
import type { SectionId } from "@/lib/sections";

export default function App() {
  useColorScheme();

  const schemaQ = useSchema();

  if (schemaQ.isLoading) {
    return (
      <Centered>
        <span style={{ color: "var(--muted)" }}>Loading Ghostty schema…</span>
      </Centered>
    );
  }
  if (schemaQ.error || !schemaQ.data) {
    return (
      <Centered>
        <span style={{ color: "var(--danger)" }}>
          {String(schemaQ.error ?? "Failed to load schema")}
        </span>
      </Centered>
    );
  }

  return (
    <ConfigProvider schema={schemaQ.data}>
      <Shell schema={schemaQ.data} />
    </ConfigProvider>
  );
}

interface ToastState {
  message: string;
  tone: "info" | "success" | "error";
}

function Shell({ schema }: { schema: import("@/types").ConfigKey[] }) {
  const pathsQ = useConfigPaths();
  const sessionQ = useSessionStatus();
  const qc = useQueryClient();
  const cfg = useConfigCtx();
  const { preference: schemePreference, cycle: cycleScheme } = useColorScheme();
  const panes = usePaneLayout();

  const [activeSection, setActiveSection] = useState<SectionId>("colors");
  const [query, setQuery] = useState("");
  const [compareOpen, setCompareOpen] = useState(false);
  const [showThemes, setShowThemes] = useState(false);
  const [showBackups, setShowBackups] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [target, setTarget] = useState<TargetKey | null>(null);

  const jumpToKey = (id: SectionId, key: string) => {
    setActiveSection(id);
    setTarget((prev) => ({ key, nonce: (prev?.nonce ?? 0) + 1 }));
  };

  const showToast = (message: string, tone: ToastState["tone"] = "info") => {
    setToast({ message, tone });
    window.setTimeout(() => setToast(null), 4500);
  };

  const unsavedCount = useMemo(() => countChangedKeys(cfg.original, cfg.draft), [
    cfg.original,
    cfg.draft,
  ]);

  const saveMut = useMutation({
    mutationFn: async () => api.saveAndReload(cfg.draft, true),
    onSuccess: async (r) => {
      await qc.invalidateQueries({ queryKey: ["config"] });
      await qc.invalidateQueries({ queryKey: ["backups"] });
      await qc.invalidateQueries({ queryKey: ["session-status"] });
      if (r.reload_ok) {
        showToast("Saved. Ghostty reloaded.", "success");
      } else if (r.reload_error) {
        showToast(`Saved; reload failed: ${r.reload_error}`, "info");
      } else {
        showToast("Saved.", "success");
      }
    },
    onError: (e) => showToast(`Save failed: ${String(e)}`, "error"),
  });

  const validateMut = useMutation({
    mutationFn: () => api.validateConfig(cfg.draft),
    onSuccess: (r) => {
      setValidation(r);
      if (r.ok) showToast("Configuration is valid.", "success");
      else showToast("Validation failed — see preview pane.", "error");
    },
    onError: (e) => showToast(`Validate failed: ${String(e)}`, "error"),
  });

  async function handleRevert() {
    if (cfg.isDirty) {
      cfg.reset();
      setValidation(null);
      showToast("Dropped unsaved edits.", "info");
      return;
    }
    // Second-tier revert: restore the on-disk config to the session baseline.
    if (sessionQ.data?.is_modified) {
      try {
        await api.revertSession();
        await api.reloadGhostty().catch(() => {});
        await qc.invalidateQueries({ queryKey: ["config"] });
        await qc.invalidateQueries({ queryKey: ["backups"] });
        await qc.invalidateQueries({ queryKey: ["session-status"] });
        showToast("Reverted to session baseline + reloaded Ghostty.", "success");
      } catch (e) {
        showToast(`Revert failed: ${String(e)}`, "error");
      }
    }
  }

  const revertDisabled = !cfg.isDirty && !sessionQ.data?.is_modified;

  function handleRandomize() {
    const next = mergeValues(cfg.original, randomThemeEntries(generateRandomTheme()));
    cfg.replace(next);
    setValidation(null);
    showToast("Randomized colors — review the diff before saving.", "info");
  }

  return (
    <div className="h-full flex flex-col" style={{ background: "var(--bg)" }}>
      <Titlebar
        title="Ghostty Config"
        configPath={pathsQ.data?.real}
        dirty={cfg.isDirty}
        compareOpen={compareOpen}
        onCompare={() => setCompareOpen((v) => !v)}
        onRandomize={handleRandomize}
        onRevert={handleRevert}
        revertDisabled={revertDisabled}
        onValidate={() => validateMut.mutate()}
        validating={validateMut.isPending}
        onSave={() => saveMut.mutate()}
        saving={saveMut.isPending}
        sidebarCollapsed={panes.sidebarCollapsed}
        onToggleSidebar={panes.toggleSidebar}
        previewCollapsed={panes.previewCollapsed}
        onTogglePreview={panes.togglePreview}
        schemePreference={schemePreference}
        onCycleScheme={cycleScheme}
      />
      <div className="flex-1 min-h-0 flex">
        {!panes.sidebarCollapsed && (
          <div
            className="flex-shrink-0 min-h-0"
            style={{ width: panes.sidebarWidth }}
          >
            <Sidebar
              active={activeSection}
              onSelect={setActiveSection}
              onJumpToKey={jumpToKey}
              query={query}
              onQueryChange={setQuery}
              connected={!!sessionQ.data?.baseline_exists}
              unsavedCount={unsavedCount}
              schema={schema}
              onShowBackups={() => setShowBackups(true)}
            />
          </div>
        )}
        <PaneHandle
          side="left"
          label="Sidebar"
          collapsed={panes.sidebarCollapsed}
          onResize={(dx) => panes.setSidebarWidth(panes.sidebarWidth + dx)}
          onToggle={panes.toggleSidebar}
        />
        <SectionEditor
          active={activeSection}
          compareBanner={compareOpen}
          onBrowseThemes={() => setShowThemes(true)}
          target={target}
        />
        <PaneHandle
          side="right"
          label="Preview"
          collapsed={panes.previewCollapsed}
          onResize={(dx) => panes.setPreviewWidth(panes.previewWidth + dx)}
          onToggle={panes.togglePreview}
        />
        {!panes.previewCollapsed && (
          <div
            className="flex-shrink-0 min-h-0"
            style={{ width: panes.previewWidth }}
          >
            <PreviewPane
              compareOpen={compareOpen}
              validation={validation}
              liveHeight={panes.liveHeight}
              onResizeLive={(dy) => panes.setLiveHeight(panes.liveHeight + dy)}
            />
          </div>
        )}
      </div>

      {showThemes && (
        <ThemeGallery
          onClose={() => setShowThemes(false)}
          onApplyEntries={(entries) => {
            const next = mergeValues(cfg.original, entries);
            cfg.replace(next);
            setShowThemes(false);
            showToast("Theme applied to draft. Save & Reload to commit.", "info");
          }}
        />
      )}

      {showBackups && <BackupList onClose={() => setShowBackups(false)} />}

      {toast && <Toast message={toast.message} tone={toast.tone} />}
    </div>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="h-full flex items-center justify-center text-sm"
      style={{ background: "var(--bg)" }}
    >
      {children}
    </div>
  );
}

function countChangedKeys(original: ConfigEntry[], draft: ConfigEntry[]): number {
  const byKey = (list: ConfigEntry[]) => {
    const m = new Map<string, string[]>();
    for (const e of list) {
      if (e.kind === "entry") {
        const arr = m.get(e.key) ?? [];
        arr.push(e.value);
        m.set(e.key, arr);
      }
    }
    return m;
  };
  const a = byKey(original);
  const b = byKey(draft);
  const keys = new Set([...a.keys(), ...b.keys()]);
  let n = 0;
  for (const k of keys) {
    if (JSON.stringify(a.get(k) ?? []) !== JSON.stringify(b.get(k) ?? [])) n++;
  }
  return n;
}

/**
 * Apply `[key, values]` overrides onto an existing entry list, preserving
 * comments and blanks. An empty `values` array clears the key entirely.
 * New values slot in at the position of the first removed entry, or at the
 * end (before trailing blanks) if the key wasn't already present.
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
    const toInsert: ConfigEntry[] = values
      .filter((v) => v !== "")
      .map((value) => ({ kind: "entry" as const, key, value }));
    if (insertAt === null) {
      let tailBlanks = 0;
      for (let i = filtered.length - 1; i >= 0; i--) {
        if (filtered[i].kind === "blank") tailBlanks++;
        else break;
      }
      filtered.splice(filtered.length - tailBlanks, 0, ...toInsert);
    } else {
      filtered.splice(insertAt, 0, ...toInsert);
    }
    next = filtered;
  }
  return next;
}
