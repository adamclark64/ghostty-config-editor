import { useEffect, useRef } from "react";
import { SectionRouter } from "@/components/sections/SectionRouter";
import type { SectionId } from "@/lib/sections";

export interface TargetKey {
  key: string;
  /** Monotonic counter so clicking the same search hit twice re-fires. */
  nonce: number;
}

interface SectionEditorProps {
  active: SectionId;
  compareBanner?: boolean;
  onBrowseThemes: () => void;
  target: TargetKey | null;
}

export function SectionEditor({
  active,
  compareBanner,
  onBrowseThemes,
  target,
}: SectionEditorProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!target) return;
    // Wait one paint so the freshly-routed section has mounted its rows
    // before we try to find the target.
    const handle = window.requestAnimationFrame(() => {
      const el = scrollRef.current?.querySelector(
        `[data-config-key="${CSS.escape(target.key)}"]`
      ) as HTMLElement | null;
      if (!el) return;
      el.scrollIntoView({ block: "center", behavior: "smooth" });
      el.classList.remove("field-flash");
      // Force a reflow so the animation restarts when the same key is
      // targeted twice in a row.
      void el.offsetWidth;
      el.classList.add("field-flash");
    });
    return () => window.cancelAnimationFrame(handle);
  }, [target]);

  return (
    <main className="min-w-0 flex-1 flex flex-col overflow-hidden">
      {compareBanner && (
        <div
          className="sticky top-0 z-10 px-6 py-2 text-[12px] flex items-center gap-2 border-b"
          style={{
            background: "color-mix(in oklab, var(--accent) 10%, var(--bg))",
            borderColor: "var(--accent)",
            color: "var(--fg)",
          }}
        >
          <strong>Before snapshot</strong>
          <span style={{ color: "var(--muted)" }}>
            — showing previous values. Editing is disabled; toggle Compare off to
            return.
          </span>
        </div>
      )}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto scroll-y"
        style={{
          pointerEvents: compareBanner ? "none" : "auto",
          opacity: compareBanner ? 0.7 : 1,
        }}
      >
        <SectionRouter id={active} onBrowseThemes={onBrowseThemes} />
      </div>
    </main>
  );
}
