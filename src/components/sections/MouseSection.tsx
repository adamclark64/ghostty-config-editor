import { FieldRow, SecHeader } from "@/components/primitives/layout";
import {
  Segmented,
  Slider,
  Toggle,
} from "@/components/primitives/inputs";
import { MoreSettings } from "@/components/primitives/MoreSettings";
import { useConfigCtx } from "@/context/ConfigContext";

const MOUSE_HANDLED = [
  "focus-follows-mouse",
  "mouse-hide-while-typing",
  "mouse-scroll-multiplier",
  "mouse-shift-capture",
] as const;

export function MouseSection() {
  const cfg = useConfigCtx();
  const scrollRaw = cfg.get("mouse-scroll-multiplier");
  const scroll = scrollRaw === "" ? 1 : parseFloat(scrollRaw);

  return (
    <>
      <SecHeader
        eyebrow="Section"
        title="Mouse"
        desc="Click behavior, hide-while-typing, scroll multiplier."
      />
      <FieldRow
        label="mouse-hide-while-typing"
        defaultValue={cfg.defaultOf("mouse-hide-while-typing")}
      >
        <Toggle
          value={cfg.get("mouse-hide-while-typing") === "true"}
          onChange={(v) => cfg.set("mouse-hide-while-typing", String(v))}
        />
      </FieldRow>
      <FieldRow
        label="mouse-shift-capture"
        defaultValue={cfg.defaultOf("mouse-shift-capture")}
      >
        <Segmented
          value={cfg.get("mouse-shift-capture") || "false"}
          onChange={(v) => cfg.set("mouse-shift-capture", v)}
          options={["false", "true", "always", "never"]}
        />
      </FieldRow>
      <FieldRow
        label="mouse-scroll-multiplier"
        defaultValue={cfg.defaultOf("mouse-scroll-multiplier")}
      >
        <Slider
          value={Number.isFinite(scroll) ? scroll : 1}
          onChange={(v) => cfg.set("mouse-scroll-multiplier", v.toFixed(1))}
          min={0.1}
          max={5}
          step={0.1}
        />
        <span className="text-[11px] font-mono" style={{ color: "var(--muted)" }}>
          {(Number.isFinite(scroll) ? scroll : 1).toFixed(1)}×
        </span>
      </FieldRow>
      <FieldRow
        label="focus-follows-mouse"
        defaultValue={cfg.defaultOf("focus-follows-mouse")}
      >
        <Toggle
          value={cfg.get("focus-follows-mouse") === "true"}
          onChange={(v) => cfg.set("focus-follows-mouse", String(v))}
        />
      </FieldRow>
      <MoreSettings sectionId="mouse" handled={MOUSE_HANDLED} />
    </>
  );
}
