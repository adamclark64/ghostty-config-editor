import { useMemo, type ReactNode } from "react";
import { TerminalPreview } from "@/components/primitives/TerminalPreview";
import { PaneHandle } from "@/components/shell/PaneHandle";
import { useConfigCtx } from "@/context/ConfigContext";
import { contrast } from "@/lib/color";
import { ANSI_FALLBACK, parsePalette } from "@/lib/palette";
import type { ConfigEntry, ValidationResult } from "@/types";

interface PreviewPaneProps {
  /** When true, render the preview against the on-disk config instead of the draft. */
  compareOpen: boolean;
  validation: ValidationResult | null;
  liveHeight: number;
  onResizeLive: (delta: number) => void;
}

export function PreviewPane({
  compareOpen,
  validation,
  liveHeight,
  onResizeLive,
}: PreviewPaneProps) {
  const cfg = useConfigCtx();
  const source = compareOpen ? cfg.original : cfg.draft;

  const byKey = useMemo(() => buildValuesByKey(source), [source]);
  const get = (key: string) => byKey.get(key)?.[0] ?? "";
  const getAll = (key: string) => byKey.get(key) ?? [];

  const background = get("background") || "#1e1e2e";
  const foreground = get("foreground") || "#cdd6f4";
  const cursorColor = get("cursor-color") || "#f5e0dc";
  const fontFamily = get("font-family") || undefined;
  const blink = get("cursor-style-blink") !== "false";
  const palette = useMemo(() => {
    const slots = parsePalette(getAll("palette"));
    return slots.map((s, i) => s ?? ANSI_FALLBACK[i]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [byKey]);

  const ratio = contrast(foreground, background);
  const passAA = ratio >= 4.5;

  const diffs = useMemo(() => diffEntries(cfg.original, cfg.draft), [
    cfg.original,
    cfg.draft,
  ]);

  return (
    <aside
      className="w-full h-full flex flex-col gap-3 p-4 min-h-0"
      style={{ background: "var(--bg-2)" }}
    >
      <Header
        label={compareOpen ? "Before snapshot" : "Live preview"}
        pill={
          compareOpen
            ? { text: "● frozen", tone: "muted" }
            : { text: "● ready", tone: "success" }
        }
      />
      <div
        className="rounded-lg overflow-hidden flex-shrink-0"
        style={{
          border: "1px solid var(--border)",
          height: liveHeight,
        }}
      >
        <TerminalPreview
          background={background}
          foreground={foreground}
          cursorColor={cursorColor}
          palette={palette}
          fontFamily={fontFamily}
          blink={blink}
          size="md"
          fillHeight
        />
      </div>
      <PaneHandle
        side="top"
        label="Live preview"
        onResize={onResizeLive}
      />

      <Header label="Contrast" />
      <Card>
        <Row label="fg on bg" value={`${ratio.toFixed(2)}:1`} />
        <Row
          label="WCAG AA body"
          value={passAA ? "✓ pass" : "✗ fail"}
          valueColor={passAA ? "var(--success)" : "var(--danger)"}
        />
      </Card>

      {validation && (
        <>
          <Header
            label="Validation"
            pill={{
              text: validation.ok ? "● valid" : "● invalid",
              tone: validation.ok ? "success" : "muted",
            }}
          />
          <Card scroll maxHeight={160}>
            <pre
              className="font-mono text-[11px] whitespace-pre-wrap m-0"
              style={{
                color: validation.ok ? "var(--success)" : "var(--danger)",
              }}
            >
              {validation.ok
                ? validation.message || "Configuration is valid."
                : validation.message || "Validation failed."}
            </pre>
          </Card>
        </>
      )}

      <Header label={`Diff (${diffs.length})`} />
      <Card fillHeight>
        {diffs.length === 0 ? (
          <div className="text-[12px]" style={{ color: "var(--muted)" }}>
            No changes yet.
          </div>
        ) : (
          <div className="font-mono text-[11px] flex flex-col gap-2">
            {diffs.map((d, i) => (
              <DiffEntry key={i} entry={d} />
            ))}
          </div>
        )}
      </Card>
    </aside>
  );
}

function Header({
  label,
  pill,
}: {
  label: string;
  pill?: { text: string; tone: "success" | "muted" };
}) {
  return (
    <div className="flex items-center justify-between">
      <div
        className="text-[11px] font-bold uppercase tracking-[0.06em]"
        style={{ color: "var(--muted)" }}
      >
        {label}
      </div>
      {pill && (
        <span
          className="text-[10px] px-1.5 py-0.5 rounded-full"
          style={{
            background: "var(--surface-raised)",
            color: pill.tone === "success" ? "var(--success)" : "var(--muted)",
            border: "1px solid var(--border)",
          }}
        >
          {pill.text}
        </span>
      )}
    </div>
  );
}

function Card({
  children,
  scroll,
  maxHeight,
  fillHeight,
}: {
  children: ReactNode;
  /** Clamp to a scrolling sub-card (the default if maxHeight is set). */
  scroll?: boolean;
  /** Override default cap when `scroll` is true. */
  maxHeight?: number;
  /** Grow to fill remaining pane height and scroll internally. */
  fillHeight?: boolean;
}) {
  const shouldScroll = scroll || maxHeight !== undefined || fillHeight;
  return (
    <div
      className="rounded-lg p-3"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        flex: fillHeight ? "1 1 auto" : undefined,
        minHeight: fillHeight ? 0 : undefined,
        maxHeight:
          !fillHeight && shouldScroll ? maxHeight ?? 220 : undefined,
        overflow: shouldScroll ? "auto" : undefined,
      }}
    >
      {children}
    </div>
  );
}

function Row({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <div className="flex items-center justify-between text-[11px]">
      <span style={{ color: "var(--muted)" }}>{label}</span>
      <span className="font-mono" style={{ color: valueColor ?? "var(--fg)" }}>
        {value}
      </span>
    </div>
  );
}

interface DiffRecord {
  key: string;
  before: string[];
  after: string[];
}

function DiffEntry({ entry }: { entry: DiffRecord }) {
  const cfg = useConfigCtx();
  const { key, before, after } = entry;

  // Palette and keybind render per-slot / per-chord so users see which row
  // actually moved, not a whole-list dump.
  if (key === "palette" || key === "keybind") {
    return <ListDiff record={entry} />;
  }

  const onEdit = (index: number, next: string) => {
    const updated = [...after];
    updated[index] = next;
    cfg.setAll(key, updated);
  };

  return (
    <div className="flex items-start gap-2">
      <div className="flex-1 flex flex-col gap-[1px] min-w-0">
        {after.length === 0 ? (
          <span className="italic" style={{ color: "var(--muted)" }}>
            (removed)
          </span>
        ) : (
          after.map((v, i) => (
            <EditableLine
              key={`a${i}`}
              prefix={`+ ${key} = `}
              value={v}
              onChange={(nv) => onEdit(i, nv)}
            />
          ))
        )}
        {before.map((v, i) => (
          <span
            key={`b${i}`}
            style={{
              color: "var(--muted)",
              textDecoration: "line-through",
            }}
          >
            − {key} = {v}
          </span>
        ))}
      </div>
      <RevertButton onClick={() => cfg.setAll(key, before)} />
    </div>
  );
}

function EditableLine({
  prefix,
  value,
  onChange,
}: {
  prefix: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center" style={{ color: "var(--success)" }}>
      <span className="whitespace-pre">{prefix}</span>
      <input
        className="flex-1 min-w-0 font-mono text-[11px] bg-transparent outline-none border-0 p-0 m-0"
        style={{ color: "var(--success)" }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
      />
    </div>
  );
}

function RevertButton({
  onClick,
  title,
}: {
  onClick: () => void;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title ?? "Revert this change"}
      className="shrink-0 text-[10px] px-1.5 py-0.5 rounded font-mono"
      style={{
        color: "var(--muted)",
        background: "var(--surface-raised)",
        border: "1px solid var(--border)",
      }}
    >
      ↺
    </button>
  );
}

function ListDiff({ record }: { record: DiffRecord }) {
  const cfg = useConfigCtx();
  const { key, before, after } = record;
  const identify = key === "palette" ? paletteId : keybindId;
  const idx = (list: string[]) => {
    const m = new Map<string, string>();
    for (const v of list) m.set(identify(v), v);
    return m;
  };
  const bIdx = idx(before);
  const aIdx = idx(after);
  const allIds = new Set<string>([...bIdx.keys(), ...aIdx.keys()]);
  const lines: { kind: "+" | "-" | "~"; id: string; before?: string; after?: string }[] = [];
  for (const id of allIds) {
    const b = bIdx.get(id);
    const a = aIdx.get(id);
    if (b === undefined && a !== undefined) lines.push({ kind: "+", id, after: a });
    else if (a === undefined && b !== undefined) lines.push({ kind: "-", id, before: b });
    else if (a !== b) lines.push({ kind: "~", id, before: b, after: a });
  }
  lines.sort((x, y) => x.id.localeCompare(y.id, undefined, { numeric: true }));

  // Replace (or remove) the row with `id` in the current `after` list,
  // preserving relative order of other entries.
  const applyForId = (id: string, nextValue: string | null) => {
    const updated: string[] = [];
    let replaced = false;
    for (const v of after) {
      if (identify(v) === id) {
        if (nextValue !== null) updated.push(nextValue);
        replaced = true;
      } else {
        updated.push(v);
      }
    }
    if (!replaced && nextValue !== null) updated.push(nextValue);
    cfg.setAll(key, updated);
  };

  return (
    <div className="flex flex-col gap-[1px]">
      {lines.map((ln) => (
        <div key={ln.id} className="flex items-start gap-2">
          <div className="flex-1 flex flex-col gap-[1px] min-w-0">
            {ln.after !== undefined && (
              <EditableLine
                prefix={`+ ${key} = `}
                value={ln.after}
                onChange={(nv) => applyForId(ln.id, nv)}
              />
            )}
            {ln.before !== undefined && (
              <span
                style={{
                  color: "var(--muted)",
                  textDecoration: "line-through",
                }}
              >
                − {key} = {ln.before}
              </span>
            )}
          </div>
          <RevertButton
            onClick={() => applyForId(ln.id, ln.before ?? null)}
            title={`Revert ${key} ${ln.id}`}
          />
        </div>
      ))}
    </div>
  );
}

function paletteId(v: string): string {
  const m = v.match(/^\s*(\d+)\s*=/);
  return m ? m[1].padStart(2, "0") : v;
}

function keybindId(v: string): string {
  // chord is before the first '=' (ghostty: `keybind = ctrl+a=action`)
  const eq = v.indexOf("=");
  return eq < 0 ? v : v.slice(0, eq).trim();
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

function diffEntries(
  original: ConfigEntry[],
  draft: ConfigEntry[]
): DiffRecord[] {
  const a = buildValuesByKey(original);
  const b = buildValuesByKey(draft);
  const keys = new Set<string>([...a.keys(), ...b.keys()]);
  const out: DiffRecord[] = [];
  for (const k of keys) {
    const before = a.get(k) ?? [];
    const after = b.get(k) ?? [];
    if (JSON.stringify(before) === JSON.stringify(after)) continue;
    out.push({ key: k, before, after });
  }
  out.sort((x, y) => x.key.localeCompare(y.key));
  return out;
}
