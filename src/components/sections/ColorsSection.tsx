import { useMemo } from "react";
import { ColorSwatch } from "@/components/primitives/ColorSwatch";
import { DocsLink } from "@/components/primitives/DocsLink";
import { GroupLabel, SecHeader } from "@/components/primitives/layout";
import { ColorRow } from "./ColorRow";
import { MoreSettings } from "@/components/primitives/MoreSettings";
import { useConfigCtx } from "@/context/ConfigContext";
import { useThemePreviews } from "@/hooks/useSchema";
import { themeAsExplicitEntries, toCard } from "@/lib/theme-previews";
import { ANSI_FALLBACK, emitPalette, parsePalette } from "@/lib/palette";
import { luminance } from "@/lib/color";

const COLORS_HANDLED = [
  "background",
  "foreground",
  "palette",
  "theme",
] as const;

interface ColorsSectionProps {
  onBrowseThemes: () => void;
}

export function ColorsSection({ onBrowseThemes }: ColorsSectionProps) {
  const cfg = useConfigCtx();
  const themesQ = useThemePreviews();

  const currentTheme = cfg.get("theme");
  const previews = themesQ.data ?? [];
  const cards = useMemo(() => previews.slice(0, 12).map(toCard), [previews]);
  const availableThemeCount = previews.length;

  const applyTheme = (name: string) => {
    const preview = previews.find((p) => p.name === name);
    if (!preview) {
      cfg.set("theme", name);
      return;
    }
    for (const [key, values] of themeAsExplicitEntries(preview)) {
      cfg.setAll(key, values);
    }
  };

  const rawPalette = cfg.getAll("palette");
  const slots = useMemo(() => parsePalette(rawPalette), [rawPalette]);

  const setPaletteSlot = (index: number, hex: string) => {
    const next = slots.slice();
    next[index] = hex;
    cfg.setAll("palette", emitPalette(next));
  };

  const background = cfg.get("background") || "#282c34";
  const foreground = cfg.get("foreground") || "#ffffff";

  return (
    <>
      <SecHeader
        eyebrow="Section"
        title="Colors & Theme"
        desc="Pick a theme or dial in each slot. Changes hot-reload in your ghostty window."
      />

      <div
        className="flex items-start gap-3 px-6 py-4 border-b"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="w-[200px] flex-shrink-0 pt-1">
          <div className="font-mono text-[12.5px]" style={{ color: "var(--fg)" }}>
            theme
          </div>
          <div className="text-[11px]" style={{ color: "var(--muted)" }}>
            {availableThemeCount > 0
              ? `${availableThemeCount} available`
              : "loading…"}
          </div>
          {cfg.docsOf("theme") && (
            <div className="mt-1">
              <DocsLink text={cfg.docsOf("theme")!} />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0 flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={onBrowseThemes}
            className="flex items-center justify-center px-3 rounded-lg text-[12px]"
            style={{
              width: 96,
              height: 54,
              flexShrink: 0,
              position: "sticky",
              left: 0,
              zIndex: 1,
              background: "var(--surface-raised)",
              border: "1px solid var(--border)",
              color: "var(--fg)",
              boxShadow: "6px 0 12px var(--bg)",
            }}
          >
            Browse all →
          </button>
          {cards.map((t) => {
            const isActive = t.name === currentTheme;
            return (
              <button
                key={t.name}
                onClick={() => applyTheme(t.name)}
                className="flex-shrink-0 rounded-lg overflow-hidden flex flex-col text-left"
                style={{
                  width: 132,
                  height: 54,
                  background: t.bg,
                  color: t.fg,
                  fontFamily: 'ui-monospace, Menlo, monospace',
                  fontSize: 10,
                  border: isActive
                    ? "1.5px solid var(--accent)"
                    : "1px solid var(--border)",
                }}
              >
                <div className="px-2 pt-1.5">
                  <span style={{ color: t.accent }}>$</span>{" "}
                  <span style={{ opacity: 0.9 }}>ghostty</span>
                </div>
                <div className="px-2 pt-0.5 pb-1.5 flex justify-between items-center">
                  <span className="truncate" style={{ fontSize: 9.5 }}>
                    {t.name}
                  </span>
                  <span className="flex gap-0.5 flex-shrink-0 ml-1">
                    <span
                      className="w-2 h-2 rounded-sm"
                      style={{ background: t.accent }}
                    />
                    <span
                      className="w-2 h-2 rounded-sm"
                      style={{ background: t.fg, opacity: 0.5 }}
                    />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <GroupLabel>Base colors</GroupLabel>
      <ColorRow label="background" fallback="#282c34" />
      <ColorRow label="foreground" fallback="#ffffff" />
      <ColorRow label="cursor-color" fallback="#ffffff" />
      <ColorRow label="selection-background" fallback="auto" />
      <ColorRow label="selection-foreground" fallback="auto" />

      <div className="flex items-center justify-between pr-6">
        <GroupLabel>ANSI palette</GroupLabel>
        {cfg.docsOf("palette") && <DocsLink text={cfg.docsOf("palette")!} />}
      </div>

      <div className="px-6 pt-1.5 pb-5">
        <div className="text-[11px] font-semibold uppercase tracking-[0.06em] mb-2" style={{ color: "var(--subtle)" }}>
          Standard (0–15)
        </div>
        <div className="grid grid-cols-8 gap-1.5 max-w-[600px]">
          {Array.from({ length: 16 }).map((_, i) => (
            <PaletteCell
              key={i}
              index={i}
              value={slots[i] ?? ANSI_FALLBACK[i]}
              overridden={slots[i] !== undefined}
              onChange={(hex) => setPaletteSlot(i, hex)}
              showLabel
            />
          ))}
        </div>
        <div className="mt-3 text-[11px]" style={{ color: "var(--muted)" }}>
          The first 8 are "normal", 8–15 are "bright" variants. These are what
          virtually every TUI actually uses — override here to retheme most
          of your terminal output.
        </div>

        <div
          className="mt-5 text-[11px] font-semibold uppercase tracking-[0.06em] mb-2"
          style={{ color: "var(--subtle)" }}
        >
          Colour cube (16–231)
        </div>
        <div
          className="grid gap-[3px]"
          style={{ gridTemplateColumns: "repeat(36, minmax(0, 1fr))" }}
        >
          {Array.from({ length: 216 }).map((_, j) => {
            const i = 16 + j;
            return (
              <PaletteCell
                key={i}
                index={i}
                value={slots[i] ?? ANSI_FALLBACK[i]}
                overridden={slots[i] !== undefined}
                onChange={(hex) => setPaletteSlot(i, hex)}
                compact
              />
            );
          })}
        </div>
        <div className="mt-2 text-[11px]" style={{ color: "var(--muted)" }}>
          xterm 6×6×6 cube — rarely overridden individually; most themes leave
          these to the defaults.
        </div>

        <div
          className="mt-5 text-[11px] font-semibold uppercase tracking-[0.06em] mb-2"
          style={{ color: "var(--subtle)" }}
        >
          Grayscale (232–255)
        </div>
        <div
          className="grid gap-[3px]"
          style={{ gridTemplateColumns: "repeat(24, minmax(0, 1fr))" }}
        >
          {Array.from({ length: 24 }).map((_, j) => {
            const i = 232 + j;
            return (
              <PaletteCell
                key={i}
                index={i}
                value={slots[i] ?? ANSI_FALLBACK[i]}
                overridden={slots[i] !== undefined}
                onChange={(hex) => setPaletteSlot(i, hex)}
                compact
              />
            );
          })}
        </div>
        <div className="mt-2 text-[11px]" style={{ color: "var(--muted)" }}>
          24-step ramp from near-black to near-white.
        </div>
      </div>

      <GroupLabel>Preview</GroupLabel>
      <div className="px-6 pb-6 pt-1">
        <div
          className="rounded-lg overflow-hidden"
          style={{ border: "1px solid var(--border)" }}
        >
          <div
            className="px-4 py-3 font-mono text-[12px]"
            style={{
              background,
              color: foreground,
            }}
          >
            Sample: the quick brown fox 0123456789
          </div>
        </div>
      </div>
      <MoreSettings sectionId="colors" handled={COLORS_HANDLED} />
    </>
  );
}

interface PaletteCellProps {
  index: number;
  value: string;
  overridden: boolean;
  onChange: (hex: string) => void;
  showLabel?: boolean;
  compact?: boolean;
}

function PaletteCell({
  index,
  value,
  overridden,
  onChange,
  showLabel,
  compact,
}: PaletteCellProps) {
  const textColor = luminance(value) > 0.4 ? "#000" : "#fff";
  return (
    <ColorSwatch
      value={value}
      onChange={onChange}
      label={`Palette slot ${index}`}
      className="relative aspect-square rounded-[4px] flex items-center justify-center cursor-pointer"
      style={{
        background: value,
        border: overridden
          ? "1.5px solid var(--accent)"
          : "1px solid rgba(0,0,0,0.15)",
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)",
      }}
    >
      {showLabel && !compact && (
        <span
          className="font-mono text-[10px] font-semibold pointer-events-none"
          style={{ color: textColor }}
        >
          {index}
        </span>
      )}
    </ColorSwatch>
  );
}
