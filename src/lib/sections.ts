import type { IconName } from "@/components/Icon";

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
