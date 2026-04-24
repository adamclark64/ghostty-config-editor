import { SectionRouter } from "@/components/sections/SectionRouter";
import type { SectionId } from "@/lib/sections";

interface SectionEditorProps {
  active: SectionId;
  compareBanner?: boolean;
  onBrowseThemes: () => void;
}

export function SectionEditor({
  active,
  compareBanner,
  onBrowseThemes,
}: SectionEditorProps) {
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
