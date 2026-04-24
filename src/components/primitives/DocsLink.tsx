import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface DocsLinkProps {
  text: string;
}

/**
 * Muted "docs" trigger shown at the right of a FieldRow. Hovering or focusing
 * it shows a portalled popover with the full docs text — multi-line, mono,
 * wrapped to a readable width. The docs come from ghostty's schema.
 */
export function DocsLink({ text }: DocsLinkProps) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    // Render above the trigger when near the bottom of the viewport.
    const vw = window.innerWidth;
    const width = 360;
    const top = Math.min(window.innerHeight - 16, r.bottom + 6);
    const left = Math.max(8, Math.min(vw - width - 8, r.left - width + r.width));
    setPos({ top, left });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (popRef.current?.contains(t)) return;
      if (triggerRef.current?.contains(t)) return;
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

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen((v) => !v)}
        className="text-[11px] underline-offset-2 hover:underline"
        style={{ color: "var(--subtle)" }}
        aria-label="Show docs"
      >
        docs
      </button>
      {open &&
        createPortal(
          <div
            ref={popRef}
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
            className="rounded-lg p-3 font-mono text-[11.5px] whitespace-pre-wrap leading-relaxed"
            style={{
              position: "fixed",
              top: pos.top,
              left: pos.left,
              width: 360,
              maxHeight: 280,
              overflowY: "auto",
              background: "var(--surface-raised)",
              border: "1px solid var(--border)",
              color: "var(--fg)",
              boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
              zIndex: 1000,
            }}
          >
            {text.trim()}
          </div>,
          document.body
        )}
    </>
  );
}
