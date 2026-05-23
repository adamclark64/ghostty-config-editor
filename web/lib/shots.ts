export type Shot = {
  title: string;
  body: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  accent: string;
};

export const HERO_SHOT: Shot = {
  title: "Ghostty Config Editor",
  body: "The main editor — Colors and Theme section with live preview.",
  src: "/screenshots/hero.png",
  alt: "Ghostty Config Editor — Colors and Theme section with live preview",
  width: 2000,
  height: 1252,
  accent: "Overview",
};

export const ROW_SHOTS: Shot[] = [
  {
    title: "Browse 463 built-in themes",
    body: "The Theme Gallery shows every community palette rendered with a sample prompt so you can compare side-by-side. Filter, click to preview, double-click to apply — or hit Random theme to roll the dice.",
    src: "/screenshots/theme-gallery.png",
    alt: "Theme gallery showing 463 built-in Ghostty themes",
    width: 2000,
    height: 1252,
    accent: "Themes",
  },
  {
    title: "Pick colors with feedback",
    body: "Edit base colors and the full ANSI palette with hex inputs and a swatch picker. The live preview re-renders as you type, and the contrast card flags any change that fails WCAG AA.",
    src: "/screenshots/color-editor.png",
    alt: "Color editor with ANSI palette and live preview pane showing WCAG contrast",
    width: 2000,
    height: 1252,
    accent: "Colors",
  },
  {
    title: "See every mono font on your system",
    body: "Pick from popular families like JetBrainsMono Nerd Font, Fira Code, or IBM Plex Mono — or any monospace family detected on your Mac. Each card previews ligatures and digits before you commit.",
    src: "/screenshots/font-picker.png",
    alt: "Font picker with cards previewing installed monospace families",
    width: 2000,
    height: 1252,
    accent: "Fonts",
  },
  {
    title: "Every key, even the obscure ones",
    body: "The Advanced section covers low-level knobs most users shouldn’t touch — but it’s there when you need it, with inline docs, type validation, and a warning banner so you know what you’re getting into.",
    src: "/screenshots/advanced.png",
    alt: "Advanced section with low-level configuration keys and a documentation tooltip",
    width: 2000,
    height: 1252,
    accent: "Advanced",
  },
];
