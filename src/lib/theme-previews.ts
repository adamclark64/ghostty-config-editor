import type { ThemePreview } from "@/types";

export interface ThemeCard {
  name: string;
  bg: string;
  fg: string;
  accent: string;
}

/**
 * Pick the "accent" colour for a theme card. We use the brightest non-grey
 * palette cell; falls back to cyan (palette[6]) or foreground.
 */
export function themeAccent(t: ThemePreview): string {
  const candidates = [t.palette[5], t.palette[4], t.palette[6], t.palette[3]]
    .filter((c): c is string => !!c && c.length > 0);
  return candidates[0] ?? t.foreground ?? "#c6a0f6";
}

export function toCard(t: ThemePreview): ThemeCard {
  return {
    name: t.name,
    bg: t.background ?? "#1e1e2e",
    fg: t.foreground ?? "#cdd6f4",
    accent: themeAccent(t),
  };
}

/**
 * Build the [key, values] override list for applying a theme as an explicit
 * palette — writes the actual background/foreground/cursor/palette values
 * into the draft rather than relying on ghostty to resolve `theme = X` at
 * runtime. Used by the inline theme-card quick-pick so the editor's swatches
 * and preview pane reflect the new theme immediately.
 */
export function themeAsExplicitEntries(
  t: ThemePreview
): Array<[string, string[]]> {
  const entries: Array<[string, string[]]> = [];
  entries.push(["theme", [t.name]]);
  if (t.background) entries.push(["background", [t.background]]);
  if (t.foreground) entries.push(["foreground", [t.foreground]]);
  if (t.cursor_color) entries.push(["cursor-color", [t.cursor_color]]);
  if (t.selection_background)
    entries.push(["selection-background", [t.selection_background]]);
  if (t.selection_foreground)
    entries.push(["selection-foreground", [t.selection_foreground]]);
  const palette = t.palette
    .map((c, i) => (c ? `${i}=${c}` : ""))
    .filter((s) => s !== "");
  entries.push(["palette", palette]);
  return entries;
}
