/**
 * Platform gating. Ghostty's config surface is mostly universal but a
 * handful of keys are macOS-only (`macos-*`) or Linux-only (`gtk-*`).
 *
 * This build targets macOS only — see HANDOFF.md. Linux/Windows callers
 * should treat their branches as dead code for now.
 */

export const isMac =
  typeof navigator !== "undefined" &&
  /Mac|iPhone|iPad|iPod/.test(navigator.platform);

export const isLinux =
  typeof navigator !== "undefined" && /Linux/.test(navigator.platform);

export const isWindows =
  typeof navigator !== "undefined" && /Win/.test(navigator.platform);
