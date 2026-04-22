import { useMemo, useState } from "react";
import { useThemePreviews } from "@/hooks/useSchema";
import type { ThemePreview } from "@/types";

interface Props {
  onClose: () => void;
  /**
   * Apply a set of [key, values] overrides to the config and save+reload.
   * An empty `values` array clears that key entirely.
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
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<ThemePreview | null>(null);

  const filtered = useMemo(() => {
    const list = themes ?? [];
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter((t) => t.name.toLowerCase().includes(q));
  }, [themes, query]);

  /** Apply a theme by name; clears any explicit overrides that would shadow it. */
  function applyPreset(name: string) {
    const clear: Array<[string, string[]]> = COLOR_OVERRIDE_KEYS.map((k) => [k, []]);
    onApplyEntries([["theme", [name]], ...clear]);
  }

  function randomPreset() {
    const list = themes ?? [];
    if (list.length === 0) return;
    const pick = list[Math.floor(Math.random() * list.length)];
    applyPreset(pick.name);
  }

  function randomPalette() {
    const t = generateRandomTheme();
    onApplyEntries([
      ["theme", []], // clear any preset so direct colors win
      ["background", [t.background]],
      ["foreground", [t.foreground]],
      ["cursor-color", [t.cursor]],
      ["palette", t.palette.map((c, i) => `${i}=${c}`)],
    ]);
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

  return (
    <div className="absolute inset-0 bg-black/75 flex items-center justify-center z-20">
      <div className="chrome-panel rounded-lg border border-zinc-700 w-[1000px] max-h-[85vh] overflow-hidden flex flex-col">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800">
          <h2 className="text-sm font-semibold text-zinc-100">Themes</h2>
          <input
            type="text"
            placeholder="Filter…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-64 rounded border border-zinc-700 chrome-input text-zinc-100 placeholder-zinc-500 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-amber-400/70"
          />
          <div className="flex-1" />
          <button
            type="button"
            onClick={randomPreset}
            className="px-3 py-1 text-xs rounded border border-zinc-700 text-zinc-200 hover:bg-zinc-800"
            title="Apply a random preset theme"
          >
            🎲 Random preset
          </button>
          <button
            type="button"
            onClick={randomPalette}
            className="px-3 py-1 text-xs rounded border border-amber-400/70 text-amber-200 bg-amber-400/10 hover:bg-amber-400/20"
            title="Generate a random coherent palette"
          >
            ✨ Random palette
          </button>
          <button
            type="button"
            onClick={onClose}
            className="ml-1 text-zinc-400 hover:text-zinc-100 px-2"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 grid grid-cols-[1fr_320px] min-h-0">
          <div className="scroll-y p-3 grid grid-cols-2 gap-2 auto-rows-min">
            {isLoading && (
              <div className="col-span-2 p-8 text-center text-zinc-400 text-sm">
                Loading themes…
              </div>
            )}
            {filtered.map((t) => (
              <button
                key={t.name}
                type="button"
                onClick={() => setSelected(t)}
                onDoubleClick={() => applyPreset(t.name)}
                className={
                  "text-left rounded border p-2 hover:border-amber-400/60 transition-colors " +
                  (selected?.name === t.name
                    ? "border-amber-400"
                    : "border-zinc-800")
                }
                style={{
                  background: t.background ?? "#111",
                  color: t.foreground ?? "#ddd",
                }}
              >
                <div className="text-xs font-semibold truncate mb-1">
                  {t.name}
                </div>
                <Swatches palette={t.palette} />
                <div className="mt-1 font-mono text-[10px] opacity-75">
                  {sampleLine(t)}
                </div>
              </button>
            ))}
            {!isLoading && filtered.length === 0 && (
              <div className="col-span-2 p-8 text-center text-zinc-400 text-sm">
                No themes match.
              </div>
            )}
          </div>

          <div className="border-l border-zinc-800 scroll-y">
            {selected ? (
              <DetailPane
                theme={selected}
                onApplyByName={() => applyPreset(selected.name)}
                onApplyAsPalette={() => applyAsPalette(selected)}
              />
            ) : (
              <div className="p-6 text-xs text-zinc-500">
                Click a theme to preview. Double-click to apply.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
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

function sampleLine(t: ThemePreview): string {
  // Fake a prompt line so the card carries real character weight.
  void t;
  return "$ ls -la  •  {} fn main() { 42 }";
}

function DetailPane({
  theme,
  onApplyByName,
  onApplyAsPalette,
}: {
  theme: ThemePreview;
  onApplyByName: () => void;
  onApplyAsPalette: () => void;
}) {
  return (
    <div className="flex flex-col h-full">
      <div
        className="p-4 border-b border-zinc-800"
        style={{
          background: theme.background ?? "#111",
          color: theme.foreground ?? "#ddd",
        }}
      >
        <div className="text-sm font-semibold mb-2">{theme.name}</div>
        <pre className="font-mono text-xs whitespace-pre-wrap leading-relaxed m-0">
{`# ghostty theme sample
export PATH=$HOME/bin:$PATH
git checkout -b feat/theme
`}<span style={{ color: theme.palette[1] || "#f88" }}>error:</span>{` not found
`}<span style={{ color: theme.palette[2] || "#8f8" }}>✓</span>{` 42 passed
`}<span style={{ color: theme.palette[3] || "#ff8" }}>warning:</span>{` deprecated
`}<span style={{ color: theme.palette[4] || "#88f" }}>→</span>{` cd ../src`}
        </pre>
      </div>
      <div className="p-3 flex flex-col gap-2">
        <button
          type="button"
          onClick={onApplyByName}
          className="px-3 py-1.5 text-xs rounded border border-amber-400/70 text-amber-200 bg-amber-400/10 hover:bg-amber-400/20"
        >
          Apply as preset — theme = {theme.name}
        </button>
        <button
          type="button"
          onClick={onApplyAsPalette}
          className="px-3 py-1.5 text-xs rounded border border-zinc-700 text-zinc-200 hover:bg-zinc-800"
        >
          Apply as explicit palette (override)
        </button>
        <div className="text-[11px] text-zinc-500 leading-relaxed mt-2">
          <b>Preset</b> writes <code>theme = {theme.name}</code> and clears
          any explicit <code>background</code>, <code>foreground</code>,
          <code>cursor-color</code>, and <code>palette</code> lines so the
          theme actually takes effect. <b>Explicit palette</b> writes every
          color into your config directly (freezes the look — no dependence
          on the theme file).
        </div>
      </div>
    </div>
  );
}

/**
 * Generate a reasonably cohesive random theme by picking one base hue,
 * building a 16-color palette from a rotated HSL wheel, and choosing
 * background/foreground with enough luminance contrast.
 */
function generateRandomTheme() {
  const darkMode = Math.random() > 0.35;
  const baseHue = Math.floor(Math.random() * 360);
  const baseSat = 30 + Math.floor(Math.random() * 40); // 30–70
  const bgLight = darkMode ? 8 + Math.floor(Math.random() * 8) : 92;
  const fgLight = darkMode ? 85 + Math.floor(Math.random() * 10) : 12;

  const background = hsl(baseHue, Math.min(baseSat, 25), bgLight);
  const foreground = hsl(baseHue, Math.min(baseSat, 20), fgLight);
  const cursor = hsl((baseHue + 30) % 360, 80, darkMode ? 70 : 45);

  // 16 ANSI colors: 0=bg-ish black, 1..6 = red/green/yellow/blue/magenta/cyan
  // (normal), 7 = fg-ish white, 8..15 = brights.
  const anchors = [
    { h: 0, s: 0, l: darkMode ? 20 : 35 }, // 0 black
    { h: 0, s: 75, l: darkMode ? 60 : 45 }, // 1 red
    { h: 120, s: 55, l: darkMode ? 55 : 40 }, // 2 green
    { h: 45, s: 80, l: darkMode ? 65 : 45 }, // 3 yellow
    { h: 220, s: 65, l: darkMode ? 65 : 45 }, // 4 blue
    { h: 300, s: 55, l: darkMode ? 65 : 45 }, // 5 magenta
    { h: 180, s: 55, l: darkMode ? 60 : 40 }, // 6 cyan
    { h: 0, s: 0, l: darkMode ? 80 : 25 }, // 7 white
  ];
  const palette: string[] = [];
  for (const a of anchors) {
    palette.push(hsl((a.h + baseHue) % 360, a.s, a.l));
  }
  for (const a of anchors) {
    // brights: 10% lighter, a touch more saturated
    palette.push(
      hsl((a.h + baseHue) % 360, Math.min(100, a.s + 10), Math.min(95, a.l + 15))
    );
  }

  return { background, foreground, cursor, palette };
}

function hsl(h: number, s: number, l: number): string {
  // HSL → hex.
  const S = s / 100;
  const L = l / 100;
  const C = (1 - Math.abs(2 * L - 1)) * S;
  const Hp = h / 60;
  const X = C * (1 - Math.abs((Hp % 2) - 1));
  let r = 0, g = 0, b = 0;
  if (Hp < 1) [r, g, b] = [C, X, 0];
  else if (Hp < 2) [r, g, b] = [X, C, 0];
  else if (Hp < 3) [r, g, b] = [0, C, X];
  else if (Hp < 4) [r, g, b] = [0, X, C];
  else if (Hp < 5) [r, g, b] = [X, 0, C];
  else [r, g, b] = [C, 0, X];
  const m = L - C / 2;
  const toHex = (n: number) =>
    Math.round((n + m) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
