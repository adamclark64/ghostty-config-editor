/**
 * Ghostty stores keybinds as `keybind = <chord>=<action>` entries, where
 * `<chord>` is a plus-joined modifier+key list (e.g. `super+shift+t`).
 * We mirror that format verbatim on the wire; the UI renders the chord as
 * individual keycaps with macOS glyphs.
 */

export interface Keybind {
  /** Raw chord string, e.g. `super+shift+t`. */
  chord: string;
  /** Raw action string, e.g. `new_tab`. */
  action: string;
  /** Raw `keybind` entry for this binding (used as a diff/id key). */
  raw: string;
}

export function parseBinding(raw: string): Keybind | null {
  const eq = raw.indexOf("=");
  if (eq < 0) return null;
  const chord = raw.slice(0, eq).trim();
  const action = raw.slice(eq + 1).trim();
  if (!chord || !action) return null;
  return { chord, action, raw };
}

export function parseBindings(raws: string[]): Keybind[] {
  return raws
    .map((r) => parseBinding(r))
    .filter((b): b is Keybind => b !== null);
}

export function emitBinding(chord: string, action: string): string {
  return `${chord}=${action}`;
}

/** Split a chord like `super+shift+t` into its parts. */
export function chordParts(chord: string): string[] {
  return chord.split("+").map((p) => p.trim()).filter(Boolean);
}

const GLYPH_MAP: Record<string, string> = {
  super: "⌘",
  cmd: "⌘",
  command: "⌘",
  shift: "⇧",
  control: "⌃",
  ctrl: "⌃",
  alt: "⌥",
  option: "⌥",
  opt: "⌥",
  up: "↑",
  down: "↓",
  left: "←",
  right: "→",
  tab: "⇥",
  enter: "⏎",
  return: "⏎",
  escape: "⎋",
  esc: "⎋",
  space: "␣",
  backspace: "⌫",
  delete: "⌦",
};

export function partToGlyph(part: string): string {
  const p = part.toLowerCase();
  return GLYPH_MAP[p] ?? part.toUpperCase();
}
