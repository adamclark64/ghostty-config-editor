import { FieldRow, SecHeader } from "@/components/primitives/layout";
import { Slider, Stepper } from "@/components/primitives/inputs";
import { MoreSettings } from "@/components/primitives/MoreSettings";
import { useConfigCtx } from "@/context/ConfigContext";

const SCROLLBACK_HANDLED = [
  "click-repeat-interval",
  "scrollback-limit",
] as const;

export function ScrollbackSection() {
  const cfg = useConfigCtx();
  const limit = parseFloat(cfg.get("scrollback-limit")) || 10000;
  const clickInterval = parseFloat(cfg.get("click-repeat-interval")) || 500;

  return (
    <>
      <SecHeader
        eyebrow="Section"
        title="Scrollback"
        desc="How much history to keep per surface."
      />
      <FieldRow
        label="scrollback-limit"
        defaultValue={cfg.defaultOf("scrollback-limit")}
      >
        <Stepper
          value={limit}
          onChange={(v) => cfg.set("scrollback-limit", String(v))}
          min={0}
          max={100_000_000}
          step={1000}
          unit="lines"
        />
      </FieldRow>
      <FieldRow
        label="click-repeat-interval"
        defaultValue={cfg.defaultOf("click-repeat-interval")}
      >
        <Slider
          value={clickInterval}
          onChange={(v) => cfg.set("click-repeat-interval", String(Math.round(v)))}
          min={100}
          max={2000}
          step={50}
        />
        <span className="text-[11px] font-mono" style={{ color: "var(--muted)" }}>
          {Math.round(clickInterval)}ms
        </span>
      </FieldRow>
      <MoreSettings sectionId="scrollback" handled={SCROLLBACK_HANDLED} />
    </>
  );
}
