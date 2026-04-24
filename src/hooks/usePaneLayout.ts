import { useCallback, useEffect, useState } from "react";

const SIDEBAR_DEFAULT = 236;
const PREVIEW_DEFAULT = 300;
const SIDEBAR_MIN = 180;
const SIDEBAR_MAX = 420;
const PREVIEW_MIN = 240;
const PREVIEW_MAX = 520;

const LIVE_DEFAULT = 180;
const LIVE_MIN = 80;
const LIVE_MAX = 600;

const KEYS = {
  sw: "ui:sidebar-width",
  pw: "ui:preview-width",
  sc: "ui:sidebar-collapsed",
  pc: "ui:preview-collapsed",
  lh: "ui:live-preview-height",
} as const;

function readNumber(key: string, fallback: number): number {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const n = parseFloat(raw);
    return Number.isFinite(n) ? n : fallback;
  } catch {
    return fallback;
  }
}

function readBool(key: string): boolean {
  try {
    return localStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}

/**
 * Pane sizing + collapsed state, persisted to localStorage so the layout
 * survives reloads. Widths are clamped into a sensible range so a user can't
 * drag the sidebar off-screen.
 */
export function usePaneLayout() {
  const [sidebarWidth, setSidebarWidthState] = useState(() =>
    readNumber(KEYS.sw, SIDEBAR_DEFAULT)
  );
  const [previewWidth, setPreviewWidthState] = useState(() =>
    readNumber(KEYS.pw, PREVIEW_DEFAULT)
  );
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() =>
    readBool(KEYS.sc)
  );
  const [previewCollapsed, setPreviewCollapsed] = useState(() =>
    readBool(KEYS.pc)
  );
  const [liveHeight, setLiveHeightState] = useState(() =>
    readNumber(KEYS.lh, LIVE_DEFAULT)
  );

  useEffect(() => {
    try {
      localStorage.setItem(KEYS.sw, String(sidebarWidth));
    } catch {
      // ignore — private mode etc.
    }
  }, [sidebarWidth]);
  useEffect(() => {
    try {
      localStorage.setItem(KEYS.pw, String(previewWidth));
    } catch {
      // ignore
    }
  }, [previewWidth]);
  useEffect(() => {
    try {
      localStorage.setItem(KEYS.sc, sidebarCollapsed ? "1" : "0");
    } catch {
      // ignore
    }
  }, [sidebarCollapsed]);
  useEffect(() => {
    try {
      localStorage.setItem(KEYS.pc, previewCollapsed ? "1" : "0");
    } catch {
      // ignore
    }
  }, [previewCollapsed]);
  useEffect(() => {
    try {
      localStorage.setItem(KEYS.lh, String(liveHeight));
    } catch {
      // ignore
    }
  }, [liveHeight]);

  const setSidebarWidth = useCallback((n: number) => {
    setSidebarWidthState(Math.max(SIDEBAR_MIN, Math.min(SIDEBAR_MAX, n)));
  }, []);

  const setPreviewWidth = useCallback((n: number) => {
    setPreviewWidthState(Math.max(PREVIEW_MIN, Math.min(PREVIEW_MAX, n)));
  }, []);

  const setLiveHeight = useCallback((n: number) => {
    setLiveHeightState(Math.max(LIVE_MIN, Math.min(LIVE_MAX, n)));
  }, []);

  return {
    sidebarWidth,
    previewWidth,
    sidebarCollapsed,
    previewCollapsed,
    liveHeight,
    setSidebarWidth,
    setPreviewWidth,
    setLiveHeight,
    toggleSidebar: () => setSidebarCollapsed((v) => !v),
    togglePreview: () => setPreviewCollapsed((v) => !v),
  };
}
