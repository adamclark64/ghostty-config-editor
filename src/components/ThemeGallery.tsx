import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Icon } from "@/components/Icon";
import { useRemoteThemes, useThemePreviews } from "@/hooks/useSchema";
import type { ThemePreview } from "@/types";

type ThemeSource = "builtin" | "community";

interface SelectedTheme {
  theme: ThemePreview;
  source: ThemeSource;
}

interface Props {
  onClose: () => void;
  /**
   * Apply a set of [key, values] overrides to the config. An empty `values`
   * array clears that key entirely. The caller decides whether to save.
   */
  onApplyEntries: (entries: Array<[string, string[]]>) => void;
}

/**
 * Keys that would silently shadow a `theme = X` preset if left in the file.
 * When applying a preset we clear these so the theme actually takes effect.
 */
const COLOR_OVERRIDE_KEYS = [
  "background",
  "foreground",
  "cursor-color",
  "cursor-text",
  "selection-background",
  "selection-foreground",
  "palette",
] as const;

export function ThemeGallery({ onClose, onApplyEntries }: Props) {
  const { data: themes, isLoading } = useThemePreviews();
  const { data: remote, isLoading: remoteLoading, error: remoteError } =
    useRemoteThemes(true);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<SelectedTheme | null>(null);

  const q = query.trim().toLowerCase();
  const filterFn = (t: ThemePreview) =>
    !q || t.name.toLowerCase().includes(q);

  const filtered = useMemo(() => (themes ?? []).filter(filterFn), [themes, q]);
  const filteredRemote = useMemo(
    () => (remote ?? []).filter(filterFn),
    [remote, q]
  );

  function applyPreset(name: string) {
    const clear: Array<[string, string[]]> = COLOR_OVERRIDE_KEYS.map((k) => [k, []]);
    onApplyEntries([["theme", [name]], ...clear]);
  }

  function randomPreset() {
    const pool = [...(themes ?? []), ...(remote ?? [])];
    if (pool.length === 0) return;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    applyPreset(pick.name);
  }

  function applyAsPalette(t: ThemePreview) {
    const entries: Array<[string, string[]]> = [["theme", []]];
    if (t.background) entries.push(["background", [t.background]]);
    if (t.foreground) entries.push(["foreground", [t.foreground]]);
    if (t.cursor_color) entries.push(["cursor-color", [t.cursor_color]]);
    entries.push([
      "palette",
      t.palette
        .map((c, i) => (c ? `${i}=${c}` : ""))
        .filter((s) => s !== ""),
    ]);
    onApplyEntries(entries);
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.65)" }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="rounded-xl overflow-hidden flex flex-col"
        style={{
          width: 1000,
          maxHeight: "85vh",
          background: "var(--surface-raised)",
          border: "1px solid var(--border)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
        }}
      >
        <div
          className="flex items-center gap-3 px-4 py-3 border-b"
          style={{ borderColor: "var(--border)" }}
        >
          <h2 className="text-[14px] font-semibold" style={{ color: "var(--fg)" }}>
            Themes
          </h2>
          <div
            className="flex items-center gap-2 h-[30px] px-2.5 rounded-md w-[260px]"
            style={{
              background: "var(--input-bg)",
              border: "1px solid var(--border)",
            }}
          >
            <Icon name="search" size={13} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter…"
              className="flex-1 bg-transparent border-none outline-none text-[12px]"
              style={{ color: "var(--fg)" }}
            />
          </div>
          <div className="flex-1" />
          <button
            type="button"
            onClick={randomPreset}
            className="inline-flex items-center gap-1.5 h-[30px] px-2.5 rounded-md text-[12px] font-medium"
            style={{
              background: "var(--surface-raised)",
              color: "var(--fg)",
              border: "1px solid var(--border)",
            }}
            title="Apply a random theme from built-in + community"
          >
            <Icon name="shuffle" size={13} />
            Random theme
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded"
            style={{ color: "var(--muted)" }}
            aria-label="Close themes"
          >
            <Icon name="x" size={14} />
          </button>
        </div>

        <div
          className="flex-1 grid min-h-0"
          style={{ gridTemplateColumns: "1fr 320px" }}
        >
          <div className="overflow-y-auto scroll-y p-3 flex flex-col gap-4">
            <ThemeSection
              title="Built-in"
              subtitle="Shipped with Ghostty — applied as a named preset."
              count={themes?.length}
              loading={isLoading}
              themes={filtered}
              source="builtin"
              selected={selected}
              onSelect={(t) => setSelected({ theme: t, source: "builtin" })}
              onApply={(t) => applyPreset(t.name)}
              emptyMessage={q ? "No built-in themes match." : "Loading themes…"}
            />

            <ThemeSection
              title="Community (iTerm2-Color-Schemes)"
              subtitle="Fetched from github.com/mbadolato/iTerm2-Color-Schemes. Applied as an explicit palette since ghostty doesn't know them by name."
              count={remote?.length}
              loading={remoteLoading && !remote}
              themes={filteredRemote}
              source="community"
              selected={selected}
              onSelect={(t) => setSelected({ theme: t, source: "community" })}
              onApply={(t) => applyAsPalette(t)}
              emptyMessage={
                remoteError
                  ? `Couldn't fetch community themes: ${String(remoteError)}`
                  : q
                  ? "No community themes match."
                  : "Fetching themes…"
              }
            />
          </div>

          <div
            className="overflow-y-auto scroll-y border-l"
            style={{ borderColor: "var(--border)" }}
          >
            {selected ? (
              <DetailPane
                theme={selected.theme}
                source={selected.source}
                onApplyByName={() => applyPreset(selected.theme.name)}
                onApplyAsPalette={() => applyAsPalette(selected.theme)}
              />
            ) : (
              <div className="p-5 text-[11.5px]" style={{ color: "var(--muted)" }}>
                Click a theme to preview. Double-click to apply.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

interface ThemeSectionProps {
  title: string;
  subtitle: string;
  count: number | undefined;
  loading: boolean;
  themes: ThemePreview[];
  source: ThemeSource;
  selected: SelectedTheme | null;
  onSelect: (t: ThemePreview) => void;
  onApply: (t: ThemePreview) => void;
  emptyMessage: string;
}

function ThemeSection({
  title,
  subtitle,
  count,
  loading,
  themes,
  source,
  selected,
  onSelect,
  onApply,
  emptyMessage,
}: ThemeSectionProps) {
  return (
    <section>
      <div
        className="flex items-baseline justify-between mb-1.5 px-0.5"
        style={{ color: "var(--fg)" }}
      >
        <div className="flex items-baseline gap-2">
          <h3 className="text-[12px] font-semibold uppercase tracking-[0.06em]">
            {title}
          </h3>
          {typeof count === "number" && (
            <span
              className="text-[11px] tabular-nums"
              style={{ color: "var(--subtle)" }}
            >
              {count}
            </span>
          )}
        </div>
      </div>
      <p className="text-[11px] mb-2 px-0.5" style={{ color: "var(--muted)" }}>
        {subtitle}
      </p>
      <div className="grid grid-cols-2 gap-2 auto-rows-min">
        {loading && (
          <div
            className="col-span-2 p-6 text-center text-[12px]"
            style={{ color: "var(--muted)" }}
          >
            {emptyMessage}
          </div>
        )}
        {!loading && themes.length === 0 && (
          <div
            className="col-span-2 p-6 text-center text-[12px]"
            style={{ color: "var(--muted)" }}
          >
            {emptyMessage}
          </div>
        )}
        {themes.map((t) => {
          const active =
            selected?.theme.name === t.name && selected.source === source;
          return (
            <button
              key={`${source}:${t.name}`}
              type="button"
              onClick={() => onSelect(t)}
              onDoubleClick={() => onApply(t)}
              className="text-left rounded-lg p-2.5 transition-colors"
              style={{
                background: t.background ?? "#111",
                color: t.foreground ?? "#ddd",
                border: active
                  ? "1.5px solid var(--accent)"
                  : "1px solid var(--border)",
              }}
            >
              <div className="text-[12px] font-semibold truncate mb-1.5">
                {t.name}
              </div>
              <Swatches palette={t.palette} />
              <div className="mt-1.5 font-mono text-[10px] opacity-75">
                $ ls -la · fn main() {"{ 42 }"}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function Swatches({ palette }: { palette: string[] }) {
  return (
    <div className="flex gap-[2px]">
      {palette.map((c, i) => (
        <div
          key={i}
          className="h-4 flex-1 rounded-[2px]"
          style={{ background: c || "transparent" }}
          title={`${i}: ${c}`}
        />
      ))}
    </div>
  );
}

function DetailPane({
  theme,
  source,
  onApplyByName,
  onApplyAsPalette,
}: {
  theme: ThemePreview;
  source: ThemeSource;
  onApplyByName: () => void;
  onApplyAsPalette: () => void;
}) {
  return (
    <div className="flex flex-col h-full">
      <div
        className="p-4 border-b"
        style={{
          background: theme.background ?? "#111",
          color: theme.foreground ?? "#ddd",
          borderColor: "var(--border)",
        }}
      >
        <div className="text-[13px] font-semibold mb-2">{theme.name}</div>
        <pre className="font-mono text-[11.5px] whitespace-pre-wrap leading-relaxed m-0">
{`# ghostty theme sample
export PATH=$HOME/bin:$PATH
git checkout -b feat/theme
`}
          <span style={{ color: theme.palette[1] || "#f88" }}>error:</span>
          {` not found
`}
          <span style={{ color: theme.palette[2] || "#8f8" }}>✓</span>
          {` 42 passed
`}
          <span style={{ color: theme.palette[3] || "#ff8" }}>warning:</span>
          {` deprecated
`}
          <span style={{ color: theme.palette[4] || "#88f" }}>→</span>
          {` cd ../src`}
        </pre>
      </div>
      <div className="p-3 flex flex-col gap-2">
        {source === "builtin" ? (
          <>
            <button
              type="button"
              onClick={onApplyByName}
              className="px-3 py-1.5 rounded-md text-[12px] font-medium"
              style={{
                background: "var(--accent)",
                color: "#14141a",
                border: "1px solid transparent",
              }}
            >
              Apply as preset — theme = {theme.name}
            </button>
            <button
              type="button"
              onClick={onApplyAsPalette}
              className="px-3 py-1.5 rounded-md text-[12px]"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                color: "var(--fg)",
              }}
            >
              Apply as explicit palette (override)
            </button>
            <div className="text-[11px] leading-relaxed mt-1.5" style={{ color: "var(--muted)" }}>
              <b>Preset</b> writes <code>theme = {theme.name}</code> and clears
              any explicit <code>background</code>, <code>foreground</code>,{" "}
              <code>cursor-color</code>, and <code>palette</code> lines so the
              theme actually takes effect. <b>Explicit palette</b> writes every
              color into your config directly (freezes the look — no dependence
              on the theme file).
            </div>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={onApplyAsPalette}
              className="px-3 py-1.5 rounded-md text-[12px] font-medium"
              style={{
                background: "var(--accent)",
                color: "#14141a",
                border: "1px solid transparent",
              }}
            >
              Apply as explicit palette
            </button>
            <div className="text-[11px] leading-relaxed mt-1.5" style={{ color: "var(--muted)" }}>
              Community themes aren't bundled with ghostty, so we can't use
              <code> theme = {theme.name}</code>. Applying writes the palette
              and base colors directly into your config — the result is frozen
              and doesn't depend on anything external.
            </div>
          </>
        )}
      </div>
    </div>
  );
}
