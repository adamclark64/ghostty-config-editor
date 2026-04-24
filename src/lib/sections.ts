import type { IconName } from "@/components/Icon";
import type { ConfigKey } from "@/types";

export type SectionId =
  | "colors"
  | "font"
  | "cursor"
  | "window"
  | "keybinds"
  | "mouse"
  | "rendering"
  | "scrollback"
  | "shell"
  | "clipboard"
  | "app"
  | "advanced";

export interface SectionMeta {
  id: SectionId;
  label: string;
  icon: IconName;
  /** Approximate key count shown in the sidebar. */
  count: number;
}

export const SECTIONS: readonly SectionMeta[] = [
  { id: "colors", label: "Colors & Theme", icon: "palette", count: 22 },
  { id: "font", label: "Font", icon: "type", count: 33 },
  { id: "cursor", label: "Cursor", icon: "cursor", count: 6 },
  { id: "window", label: "Window", icon: "window", count: 58 },
  { id: "keybinds", label: "Keybinds", icon: "keys", count: 1 },
  { id: "mouse", label: "Mouse", icon: "mouse", count: 4 },
  { id: "rendering", label: "Rendering", icon: "render", count: 4 },
  { id: "scrollback", label: "Scrollback", icon: "scroll", count: 2 },
  { id: "shell", label: "Shell & Session", icon: "shell", count: 16 },
  { id: "clipboard", label: "Clipboard", icon: "clipboard", count: 7 },
  { id: "app", label: "App", icon: "app", count: 14 },
  { id: "advanced", label: "Advanced", icon: "gear", count: 33 },
];

/**
 * Ghostty's `group` metadata is human-readable prose; this map aligns the
 * schema's groups to our sidebar section IDs.
 */
const GROUP_TO_SECTION: Record<string, SectionId> = {
  colors: "colors",
  color: "colors",
  theme: "colors",
  font: "font",
  cursor: "cursor",
  window: "window",
  keybind: "keybinds",
  keybinds: "keybinds",
  mouse: "mouse",
  rendering: "rendering",
  render: "rendering",
  scrollback: "scrollback",
  shell: "shell",
  clipboard: "clipboard",
  app: "app",
  advanced: "advanced",
};

export function sectionForKey(k: ConfigKey): SectionId {
  const lower = k.group.toLowerCase();
  for (const [needle, sec] of Object.entries(GROUP_TO_SECTION)) {
    if (lower.includes(needle)) return sec;
  }
  // Prefix-based fallback for common ghostty conventions.
  if (k.name.startsWith("font-")) return "font";
  if (k.name.startsWith("cursor-")) return "cursor";
  if (k.name.startsWith("window-")) return "window";
  if (k.name.startsWith("macos-")) return "app";
  if (k.name.startsWith("gtk-")) return "app";
  if (k.name.startsWith("clipboard-")) return "clipboard";
  if (k.name.startsWith("background-") || k.name.startsWith("palette")) return "colors";
  if (k.name.startsWith("shell-")) return "shell";
  if (k.name.startsWith("mouse-")) return "mouse";
  return "advanced";
}

export function keysForSection(
  schema: ConfigKey[],
  id: SectionId
): ConfigKey[] {
  return schema.filter((k) => sectionForKey(k) === id);
}
