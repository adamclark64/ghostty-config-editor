import clsx from "clsx";
import type { SessionStatus } from "@/types";

interface Props {
  configPath?: string;
  isDirty: boolean;
  saving: boolean;
  session?: SessionStatus;
  onSaveAndReload: () => void;
  onValidate: () => void;
  onRevert: () => void;
  onKeepSession: () => void;
  onShowBackups: () => void;
  onShowThemes: () => void;
  onImport: () => void;
  onExport: () => void;
  search: string;
  onSearch: (q: string) => void;
}

export function Toolbar({
  configPath,
  isDirty,
  saving,
  session,
  onSaveAndReload,
  onValidate,
  onRevert,
  onKeepSession,
  onShowBackups,
  onShowThemes,
  onImport,
  onExport,
  search,
  onSearch,
}: Props) {
  const sessionModified = session?.is_modified ?? false;
  const canRevert = isDirty || sessionModified;

  // Label & semantics of the Revert button shift based on what's undoable.
  const revertLabel = isDirty
    ? "Revert edits"
    : sessionModified
    ? "Revert to session start"
    : "Revert";
  const revertTitle = isDirty
    ? "Drop unsaved in-memory edits"
    : sessionModified
    ? "Restore the config from when you opened the app"
    : "Nothing to revert";

  return (
    <div className="flex items-center gap-2 px-4 py-2 border-b border-zinc-800 chrome-panel">
      <button
        type="button"
        onClick={onSaveAndReload}
        disabled={!isDirty || saving}
        className={clsx(
          "px-3 py-1 text-sm rounded border",
          isDirty && !saving
            ? "border-amber-400/70 text-amber-200 bg-amber-400/10 hover:bg-amber-400/20"
            : "border-zinc-800 text-zinc-600 cursor-not-allowed"
        )}
        title="Validate, write (with backup), and ⌘⇧, Ghostty"
      >
        {saving ? "Saving…" : "Save & Reload"}
      </button>
      <button
        type="button"
        onClick={onValidate}
        className="px-3 py-1 text-sm rounded border border-zinc-700 text-zinc-200 hover:bg-zinc-800"
      >
        Validate
      </button>
      <button
        type="button"
        onClick={onRevert}
        disabled={!canRevert}
        title={revertTitle}
        className={clsx(
          "px-3 py-1 text-sm rounded border",
          canRevert
            ? "border-zinc-700 text-zinc-200 hover:bg-zinc-800"
            : "border-zinc-800 text-zinc-600 cursor-not-allowed"
        )}
      >
        {revertLabel}
      </button>
      {sessionModified && (
        <button
          type="button"
          onClick={onKeepSession}
          className="px-3 py-1 text-sm rounded border border-emerald-500/60 text-emerald-200 bg-emerald-500/10 hover:bg-emerald-500/20"
          title="Treat current config as the new session start — clears the baseline"
        >
          Keep
        </button>
      )}
      <button
        type="button"
        onClick={onShowBackups}
        className="px-3 py-1 text-sm rounded border border-zinc-700 text-zinc-200 hover:bg-zinc-800"
      >
        Backups
      </button>
      <button
        type="button"
        onClick={onShowThemes}
        className="px-3 py-1 text-sm rounded border border-zinc-700 text-zinc-200 hover:bg-zinc-800"
      >
        Themes
      </button>
      <button
        type="button"
        onClick={onImport}
        className="px-3 py-1 text-sm rounded border border-zinc-700 text-zinc-200 hover:bg-zinc-800"
        title="Replace the current draft with a config file from disk"
      >
        Import
      </button>
      <button
        type="button"
        onClick={onExport}
        className="px-3 py-1 text-sm rounded border border-zinc-700 text-zinc-200 hover:bg-zinc-800"
        title="Write the current draft to a file of your choice"
      >
        Export
      </button>
      {sessionModified && <ExperimentingPill mtime={session?.baseline_mtime ?? null} />}
      <div className="flex-1" />
      <input
        type="text"
        placeholder="Search 580 keys…"
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        className="w-80 rounded border border-zinc-700 chrome-input text-zinc-100 placeholder-zinc-500 px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-amber-400/70"
      />
      <div
        className="text-[11px] text-zinc-500 font-mono truncate max-w-xs"
        title={configPath}
      >
        {configPath ?? "…"}
      </div>
    </div>
  );
}

function ExperimentingPill({ mtime }: { mtime: number | null }) {
  const label = mtime
    ? `Experimenting — since ${formatTime(mtime)}`
    : "Experimenting";
  return (
    <span
      className="ml-1 px-2 py-0.5 rounded-full text-[11px] border border-amber-400/50 text-amber-200 bg-amber-400/10"
      title="Your config has drifted from where you started this session. Click 'Revert' to go back or 'Keep' to freeze this as the new start."
    >
      {label}
    </span>
  );
}

function formatTime(epochSecs: number): string {
  const d = new Date(epochSecs * 1000);
  const hh = d.getHours().toString().padStart(2, "0");
  const mm = d.getMinutes().toString().padStart(2, "0");
  return `${hh}:${mm}`;
}
