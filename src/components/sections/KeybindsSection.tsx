import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Icon } from "@/components/Icon";
import { SecHeader } from "@/components/primitives/layout";
import { useConfigCtx } from "@/context/ConfigContext";
import {
  chordParts,
  emitBinding,
  parseBindings,
  partToGlyph,
  type Keybind,
} from "@/lib/keybinds";

export function KeybindsSection() {
  const cfg = useConfigCtx();
  const raws = cfg.getAll("keybind");
  const bindings = useMemo(() => parseBindings(raws), [raws]);

  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<{ index: number; kb: Keybind } | null>(null);
  const [adding, setAdding] = useState(false);

  const filtered = bindings.filter((b) =>
    (b.action + b.chord).toLowerCase().includes(query.toLowerCase())
  );

  const writeAll = (next: Keybind[]) => {
    cfg.setAll("keybind", next.map((b) => emitBinding(b.chord, b.action)));
  };

  const update = (i: number, kb: Keybind) => {
    const next = bindings.slice();
    next[i] = kb;
    writeAll(next);
  };

  const remove = (i: number) => {
    const next = bindings.slice();
    next.splice(i, 1);
    writeAll(next);
  };

  const add = (kb: Keybind) => {
    writeAll([...bindings, kb]);
  };

  return (
    <>
      <SecHeader
        eyebrow="Section"
        title="Keybinds"
        desc="Your current bindings. Click Edit to capture a new chord."
      />

      <div className="flex items-center gap-2 px-6 pt-3 pb-2">
        <div
          className="flex-1 flex items-center gap-2 h-[32px] px-2.5 rounded-md"
          style={{
            background: "var(--input-bg)",
            border: "1px solid var(--border)",
          }}
        >
          <Icon name="search" size={13} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter bindings…"
            className="flex-1 bg-transparent border-none outline-none text-[12px]"
            style={{ color: "var(--fg)" }}
          />
        </div>
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="inline-flex items-center gap-1.5 h-[32px] px-3 rounded-md text-[12px] font-medium"
          style={{
            background: "var(--surface-raised)",
            border: "1px solid var(--border)",
            color: "var(--fg)",
          }}
        >
          <Icon name="diff" size={13} /> Add binding
        </button>
      </div>

      <div className="px-6 pb-6">
        {filtered.length === 0 ? (
          <div
            className="rounded-lg p-6 text-[12.5px] text-center"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              color: "var(--muted)",
            }}
          >
            {bindings.length === 0
              ? "No keybinds in your config yet. Add one to get started."
              : "No bindings match your filter."}
          </div>
        ) : (
          <div
            className="rounded-lg overflow-hidden"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
            }}
          >
            {filtered.map((b, i) => {
              const originalIndex = bindings.indexOf(b);
              return (
                <div
                  key={`${b.chord}:${b.action}:${i}`}
                  className="flex items-center gap-3 px-4 py-2.5 border-b"
                  style={{
                    borderColor:
                      i === filtered.length - 1 ? "transparent" : "var(--border)",
                  }}
                >
                  <div className="flex gap-1 flex-shrink-0 min-w-[160px]">
                    {chordParts(b.chord).map((part, j, arr) => (
                      <div key={j} className="flex items-center gap-1">
                        <Keycap>{partToGlyph(part)}</Keycap>
                        {j < arr.length - 1 && (
                          <span
                            className="text-[10px]"
                            style={{ color: "var(--subtle)" }}
                          >
                            +
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                  <span
                    className="font-mono text-[12px]"
                    style={{ color: "var(--accent)" }}
                  >
                    {b.action}
                  </span>
                  <span className="flex-1" />
                  <button
                    type="button"
                    onClick={() => setEditing({ index: originalIndex, kb: b })}
                    className="px-2.5 py-1 rounded text-[11px]"
                    style={{
                      background: "var(--surface-raised)",
                      border: "1px solid var(--border)",
                      color: "var(--fg)",
                    }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(originalIndex)}
                    className="p-1 rounded"
                    style={{
                      background: "var(--surface-raised)",
                      border: "1px solid var(--border)",
                      color: "var(--muted)",
                    }}
                    aria-label="Remove binding"
                  >
                    <Icon name="x" size={11} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {(editing || adding) && (
        <ChordCaptureModal
          initial={editing?.kb}
          onClose={() => {
            setEditing(null);
            setAdding(false);
          }}
          onSubmit={(kb) => {
            if (editing) update(editing.index, kb);
            else add(kb);
            setEditing(null);
            setAdding(false);
          }}
        />
      )}
    </>
  );
}

function Keycap({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center justify-center px-1.5 font-mono text-[11px] font-semibold"
      style={{
        minWidth: 22,
        height: 22,
        background: "var(--surface-raised)",
        border: "1px solid var(--border-strong)",
        borderRadius: 5,
        boxShadow: "0 1px 0 var(--border)",
      }}
    >
      {children}
    </span>
  );
}

interface ChordCaptureModalProps {
  initial?: Keybind;
  onClose: () => void;
  onSubmit: (kb: Keybind) => void;
}

/**
 * Focus-trapped modal that listens for keydown and reports the captured chord
 * in ghostty's `super+shift+t` format. Modifiers are inferred from `event.*Key`
 * booleans; the final key is `event.key` (lowercased for letters, mapped for
 * specials). Enter/escape close-without-capture so the user can still submit.
 */
function ChordCaptureModal({ initial, onClose, onSubmit }: ChordCaptureModalProps) {
  const [chord, setChord] = useState(initial?.chord ?? "");
  const [action, setAction] = useState(initial?.action ?? "");
  const [capturing, setCapturing] = useState(!initial);
  const captureRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!capturing) return;
    const el = captureRef.current;
    el?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setCapturing(false);
        e.preventDefault();
        return;
      }
      if (e.key === "Tab") return; // let focus move out
      e.preventDefault();
      const mods: string[] = [];
      if (e.metaKey) mods.push("super");
      if (e.ctrlKey) mods.push("ctrl");
      if (e.altKey) mods.push("alt");
      if (e.shiftKey) mods.push("shift");
      const key = normalizeKey(e.key);
      if (!key) return; // modifier-only press — wait for a real key
      setChord([...mods, key].join("+"));
      setCapturing(false);
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [capturing]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !capturing) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [capturing, onClose]);

  const canSubmit = chord.length > 0 && action.length > 0;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.6)" }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="rounded-xl p-5 w-[420px]"
        style={{
          background: "var(--surface-raised)",
          border: "1px solid var(--border)",
        }}
      >
        <div className="text-[14px] font-semibold mb-3">
          {initial ? "Edit binding" : "Add binding"}
        </div>

        <div className="text-[11px] uppercase tracking-[0.06em] mb-1.5" style={{ color: "var(--muted)" }}>
          Chord
        </div>
        <div
          ref={captureRef}
          tabIndex={0}
          onClick={() => setCapturing(true)}
          className="flex items-center gap-1.5 px-3 py-2.5 rounded-md cursor-pointer outline-none focus-visible:ring-2"
          style={{
            background: "var(--input-bg)",
            border: capturing
              ? "1px solid var(--accent)"
              : "1px solid var(--border)",
            minHeight: 42,
          }}
        >
          {chord ? (
            chordParts(chord).map((part, j, arr) => (
              <div key={j} className="flex items-center gap-1">
                <Keycap>{partToGlyph(part)}</Keycap>
                {j < arr.length - 1 && (
                  <span className="text-[10px]" style={{ color: "var(--subtle)" }}>
                    +
                  </span>
                )}
              </div>
            ))
          ) : (
            <span className="text-[12px]" style={{ color: "var(--muted)" }}>
              {capturing ? "Press keys…" : "Click to capture"}
            </span>
          )}
          <span className="ml-auto text-[11px]" style={{ color: "var(--subtle)" }}>
            {capturing ? "listening" : "click to re-capture"}
          </span>
        </div>

        <div
          className="text-[11px] uppercase tracking-[0.06em] mt-3 mb-1.5"
          style={{ color: "var(--muted)" }}
        >
          Action
        </div>
        <input
          value={action}
          onChange={(e) => setAction(e.target.value)}
          placeholder="new_tab"
          className="w-full px-3 py-2 rounded-md text-[12px] font-mono outline-none"
          style={{
            background: "var(--input-bg)",
            border: "1px solid var(--border)",
            color: "var(--fg)",
          }}
        />

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-md text-[12px]"
            style={{
              background: "var(--surface-raised)",
              border: "1px solid var(--border)",
              color: "var(--fg)",
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!canSubmit}
            onClick={() => onSubmit({ chord, action, raw: emitBinding(chord, action) })}
            className="px-3 py-1.5 rounded-md text-[12px] font-medium disabled:opacity-50"
            style={{
              background: "var(--accent)",
              color: "#14141a",
              border: "1px solid transparent",
            }}
          >
            {initial ? "Update" : "Add"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

function normalizeKey(key: string): string | null {
  if (!key) return null;
  // Modifier-only presses report the modifier name as the key — skip until a
  // real key follows.
  const modOnly = new Set(["Control", "Shift", "Alt", "Meta", "Command", "Option"]);
  if (modOnly.has(key)) return null;
  if (key.length === 1) return key.toLowerCase();
  // Specials: Arrow keys, Enter, Tab, Escape, Backspace, Delete, Space, F1…F24
  const map: Record<string, string> = {
    ArrowUp: "up",
    ArrowDown: "down",
    ArrowLeft: "left",
    ArrowRight: "right",
    Enter: "enter",
    Tab: "tab",
    Escape: "escape",
    Backspace: "backspace",
    Delete: "delete",
    " ": "space",
  };
  if (map[key]) return map[key];
  return key.toLowerCase();
}
