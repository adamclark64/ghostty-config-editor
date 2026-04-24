import { hslToHex } from "@/lib/color";

export interface RandomTheme {
  background: string;
  foreground: string;
  cursor: string;
  /** 16 ANSI colors: 0–7 normal, 8–15 brights. */
  palette: string[];
}

/**
 * Generate a reasonably cohesive random theme by picking one base hue,
 * building a 16-color palette from a rotated HSL wheel, and choosing
 * background/foreground with enough luminance contrast.
 */
export function generateRandomTheme(): RandomTheme {
  const darkMode = Math.random() > 0.35;
  const baseHue = Math.floor(Math.random() * 360);
  const baseSat = 30 + Math.floor(Math.random() * 40); // 30–70
  const bgLight = darkMode ? 8 + Math.floor(Math.random() * 8) : 92;
  const fgLight = darkMode ? 85 + Math.floor(Math.random() * 10) : 12;

  const background = hslToHex(baseHue, Math.min(baseSat, 25), bgLight);
  const foreground = hslToHex(baseHue, Math.min(baseSat, 20), fgLight);
  const cursor = hslToHex((baseHue + 30) % 360, 80, darkMode ? 70 : 45);

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
    palette.push(hslToHex((a.h + baseHue) % 360, a.s, a.l));
  }
  for (const a of anchors) {
    palette.push(
      hslToHex(
        (a.h + baseHue) % 360,
        Math.min(100, a.s + 10),
        Math.min(95, a.l + 15)
      )
    );
  }
  return { background, foreground, cursor, palette };
}

/**
 * Convert a random theme to the `[key, values][]` override shape consumed
 * by `onApplyEntries` / `mergeValues`. Clears the `theme` preset so the
 * explicit colors actually take effect.
 */
export function randomThemeEntries(t: RandomTheme): Array<[string, string[]]> {
  return [
    ["theme", []],
    ["background", [t.background]],
    ["foreground", [t.foreground]],
    ["cursor-color", [t.cursor]],
    ["palette", t.palette.map((c, i) => `${i}=${c}`)],
  ];
}
