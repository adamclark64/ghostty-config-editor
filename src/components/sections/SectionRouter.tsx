import type { SectionId } from "@/lib/sections";
import { AdvancedSection } from "./AdvancedSection";
import { AppSection } from "./AppSection";
import { ClipboardSection } from "./ClipboardSection";
import { ColorsSection } from "./ColorsSection";
import { CursorSection } from "./CursorSection";
import { FontSection } from "./FontSection";
import { KeybindsSection } from "./KeybindsSection";
import { MouseSection } from "./MouseSection";
import { RenderingSection } from "./RenderingSection";
import { ScrollbackSection } from "./ScrollbackSection";
import { ShellSection } from "./ShellSection";
import { WindowSection } from "./WindowSection";

interface SectionRouterProps {
  id: SectionId;
  onBrowseThemes: () => void;
}

export function SectionRouter({ id, onBrowseThemes }: SectionRouterProps) {
  switch (id) {
    case "colors":
      return <ColorsSection onBrowseThemes={onBrowseThemes} />;
    case "font":
      return <FontSection />;
    case "cursor":
      return <CursorSection />;
    case "window":
      return <WindowSection />;
    case "keybinds":
      return <KeybindsSection />;
    case "mouse":
      return <MouseSection />;
    case "rendering":
      return <RenderingSection />;
    case "scrollback":
      return <ScrollbackSection />;
    case "shell":
      return <ShellSection />;
    case "clipboard":
      return <ClipboardSection />;
    case "app":
      return <AppSection />;
    case "advanced":
      return <AdvancedSection />;
  }
}
