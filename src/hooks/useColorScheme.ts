import { useCallback, useEffect, useState } from "react";

export type ColorScheme = "light" | "dark";
export type SchemePreference = ColorScheme | "system";

const PREF_KEY = "ui:scheme";

function readPref(): SchemePreference {
  try {
    const v = localStorage.getItem(PREF_KEY);
    if (v === "light" || v === "dark" || v === "system") return v;
  } catch {
    // ignore
  }
  return "system";
}

function systemScheme(): ColorScheme {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

/**
 * Tracks the effective color scheme and a user preference that can override
 * the OS setting. Mirrors the active scheme to `<html data-scheme=...>` so
 * CSS variable tokens cascade without per-component wiring.
 */
export function useColorScheme() {
  const [preference, setPreferenceState] = useState<SchemePreference>(readPref);
  const [sysScheme, setSysScheme] = useState<ColorScheme>(systemScheme);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setSysScheme(mq.matches ? "dark" : "light");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const effective: ColorScheme = preference === "system" ? sysScheme : preference;

  useEffect(() => {
    document.documentElement.setAttribute("data-scheme", effective);
  }, [effective]);

  const setPreference = useCallback((p: SchemePreference) => {
    setPreferenceState(p);
    try {
      if (p === "system") localStorage.removeItem(PREF_KEY);
      else localStorage.setItem(PREF_KEY, p);
    } catch {
      // ignore
    }
  }, []);

  return {
    scheme: effective,
    preference,
    setPreference,
    /** Cycle system → light → dark → system. */
    cycle: () => {
      setPreference(
        preference === "system" ? "light" : preference === "light" ? "dark" : "system"
      );
    },
  };
}
