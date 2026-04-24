import { rgbToHex } from "@/lib/color";

/**
 * Ghostty stores the palette as repeated `palette = N=#rrggbb` entries where
 * N is any index from 0 to 255. Helpers here marshal between that rep and a
 * fixed-size array indexed 0..255.
 *
 * The palette is grouped into three contiguous ranges:
 *   0–15    standard ANSI (8 normal + 8 bright)
 *   16–231  xterm 6×6×6 RGB colour cube
 *   232–255 24-step grayscale ramp
 *
 * Indices 0–15 are what virtually every TUI cares about; the rest are the
 * xterm-256 extended palette used by syntax highlighters, file managers,
 * and anything that does 256-colour output.
 */

export const PALETTE_SIZE = 256;

const STANDARD_16: readonly string[] = [
  "#45475a",
  "#f38ba8",
  "#a6e3a1",
  "#f9e2af",
  "#89b4fa",
  "#f5c2e7",
  "#94e2d5",
  "#bac2de",
  "#585b70",
  "#f38ba8",
  "#a6e3a1",
  "#f9e2af",
  "#89b4fa",
  "#f5c2e7",
  "#94e2d5",
  "#a6adc8",
];

/** xterm color-cube levels for the 16–231 range. */
const CUBE_LEVELS = [0, 95, 135, 175, 215, 255] as const;

function buildFallback(): string[] {
  const out: string[] = new Array(PALETTE_SIZE);
  for (let i = 0; i < 16; i++) out[i] = STANDARD_16[i];
  for (let r = 0; r < 6; r++) {
    for (let g = 0; g < 6; g++) {
      for (let b = 0; b < 6; b++) {
        out[16 + r * 36 + g * 6 + b] = rgbToHex(
          CUBE_LEVELS[r],
          CUBE_LEVELS[g],
          CUBE_LEVELS[b]
        );
      }
    }
  }
  for (let i = 0; i < 24; i++) {
    const v = 8 + i * 10;
    out[232 + i] = rgbToHex(v, v, v);
  }
  return out;
}

export const ANSI_FALLBACK: readonly string[] = buildFallback();

/** Parse raw palette value list from the config into a 256-slot array. */
export function parsePalette(values: string[]): (string | undefined)[] {
  const slots: (string | undefined)[] = new Array(PALETTE_SIZE).fill(undefined);
  for (const v of values) {
    const m = v.match(/^\s*(\d+)\s*=\s*(#?[0-9a-fA-F]{3,8})\s*$/);
    if (!m) continue;
    const idx = parseInt(m[1], 10);
    if (idx < 0 || idx >= PALETTE_SIZE) continue;
    let hex = m[2];
    if (!hex.startsWith("#")) hex = "#" + hex;
    slots[idx] = hex;
  }
  return slots;
}

/** Emit `N=#rrggbb` entries for every defined slot, in index order. */
export function emitPalette(slots: (string | undefined)[]): string[] {
  const out: string[] = [];
  for (let i = 0; i < slots.length; i++) {
    const v = slots[i];
    if (v !== undefined && v !== "") out.push(`${i}=${v}`);
  }
  return out;
}
