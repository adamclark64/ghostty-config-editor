import { useEffect, useRef } from "react";

interface PaneHandleProps {
  /**
   * Which side of the handle the pane being resized lives on.
   * Determines drag-delta sign for width/height calculation.
   *   vertical orientation: "left" | "right"
   *   horizontal orientation: "top" | "bottom"
   */
  side: "left" | "right" | "top" | "bottom";
  /** Called with a pixel delta during drag (positive = widening/taller). */
  onResize: (delta: number) => void;
  /** Fired on handle double-click or collapsed-rail click. */
  onToggle?: () => void;
  /** True when the adjacent pane is collapsed — renders a restore rail. */
  collapsed?: boolean;
  /** Aria label (e.g. "Resize sidebar"). */
  label?: string;
}

/**
 * Thin handle between panes. Drag to resize, double-click to toggle collapse
 * of the adjacent pane. Works in either a horizontal flex row (vertical
 * handle, `side: left | right`) or a vertical flex column (horizontal
 * handle, `side: top | bottom`).
 *
 * Uses window-level mousemove/mouseup listeners during a drag so fast drags
 * that leave the handle still track. Cursor is globally overridden during
 * drag to avoid flicker when the pointer crosses pane boundaries.
 */
export function PaneHandle({
  side,
  onResize,
  onToggle,
  collapsed,
  label,
}: PaneHandleProps) {
  const isHorizontal = side === "top" || side === "bottom";
  const draggingRef = useRef(false);
  const lastCoordRef = useRef(0);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!draggingRef.current) return;
      const curr = isHorizontal ? e.clientY : e.clientX;
      const d = curr - lastCoordRef.current;
      lastCoordRef.current = curr;
      const signed = side === "left" || side === "top" ? d : -d;
      onResize(signed);
    };
    const onUp = () => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [side, isHorizontal, onResize]);

  const startDrag = (e: React.MouseEvent) => {
    if (collapsed) return;
    e.preventDefault();
    draggingRef.current = true;
    lastCoordRef.current = isHorizontal ? e.clientY : e.clientX;
    document.body.style.cursor = isHorizontal ? "row-resize" : "col-resize";
    document.body.style.userSelect = "none";
  };

  if (collapsed) {
    const collapseArrow =
      side === "left" ? "›" : side === "right" ? "‹" : side === "top" ? "⌄" : "⌃";
    return (
      <button
        type="button"
        onClick={onToggle}
        aria-label={label ? `Expand ${label.toLowerCase()}` : "Expand pane"}
        className="flex-shrink-0 flex items-center justify-center"
        style={{
          ...(isHorizontal ? { height: 10, width: "100%" } : { width: 10 }),
          background: "var(--bg-2)",
          borderLeft: side === "left" ? "1px solid var(--border)" : undefined,
          borderRight: side === "right" ? "1px solid var(--border)" : undefined,
          borderTop: side === "top" ? "1px solid var(--border)" : undefined,
          borderBottom: side === "bottom" ? "1px solid var(--border)" : undefined,
          cursor: "pointer",
          color: "var(--subtle)",
        }}
      >
        <span
          className="font-mono text-[10px]"
          style={
            isHorizontal
              ? { letterSpacing: "0.08em" }
              : { writingMode: "vertical-rl", letterSpacing: "0.08em" }
          }
        >
          {collapseArrow}
        </span>
      </button>
    );
  }

  return (
    <div
      role="separator"
      aria-label={label ?? "Resize pane"}
      aria-orientation={isHorizontal ? "horizontal" : "vertical"}
      onMouseDown={startDrag}
      onDoubleClick={onToggle}
      className="flex-shrink-0 relative group"
      style={{
        ...(isHorizontal ? { height: 4, width: "100%" } : { width: 4 }),
        cursor: isHorizontal ? "row-resize" : "col-resize",
        background: "var(--border)",
      }}
    >
      <div
        className="absolute group-hover:bg-[color:var(--accent)]"
        style={{
          opacity: 0.15,
          ...(isHorizontal
            ? { inset: "-4px 0" }
            : { inset: "0 -4px" }),
        }}
      />
    </div>
  );
}
