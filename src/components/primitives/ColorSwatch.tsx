import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { ColorPicker } from "./ColorPicker";

interface ColorSwatchProps {
  value: string;
  onChange: (hex: string) => void;
  size?: number;
  rounded?: number;
  label?: string;
  /** When provided, renders this instead of the default square swatch. */
  children?: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Clickable colour trigger that opens a popover HSV/hex picker. The popover
 * portals to document.body so overflow-hidden ancestors don't clip it.
 *
 * Pass `children` to fully customise the trigger — useful for palette-cell
 * grids where the swatch is the entire cell.
 */
export function ColorSwatch({
  value,
  onChange,
  size = 22,
  rounded = 6,
  label,
  children,
  className,
  style,
}: ColorSwatchProps) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (popRef.current?.contains(t)) return;
      if (btnRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const defaultStyle: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius: rounded,
    background: value || "transparent",
    border: "1px solid rgba(0,0,0,0.12)",
    boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.15)",
  };

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        aria-label={label ?? `Color ${value}`}
        onClick={() => {
          const r = btnRef.current?.getBoundingClientRect();
          if (r) setPos({ top: r.bottom + 6, left: r.left });
          setOpen((v) => !v);
        }}
        className={className ?? "flex-shrink-0 p-0 cursor-pointer"}
        style={children ? style : { ...defaultStyle, ...style }}
      >
        {children}
      </button>
      {open &&
        createPortal(
          <div
            ref={popRef}
            style={{
              position: "fixed",
              top: pos.top,
              left: pos.left,
              zIndex: 1000,
            }}
          >
            <ColorPicker value={value} onChange={onChange} />
          </div>,
          document.body
        )}
    </>
  );
}
