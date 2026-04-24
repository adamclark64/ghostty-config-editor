import { ColorSwatch } from "@/components/primitives/ColorSwatch";
import { FieldRow, SecHeader } from "@/components/primitives/layout";
import {
  Slider,
  TextInput,
  Toggle,
} from "@/components/primitives/inputs";
import { useConfigCtx } from "@/context/ConfigContext";

export function RenderingSection() {
  const cfg = useConfigCtx();
  const splitOpacityRaw = cfg.get("unfocused-split-opacity");
  const splitOpacity = splitOpacityRaw === "" ? 0.7 : parseFloat(splitOpacityRaw);
  const minContrastRaw = cfg.get("minimum-contrast");
  const minContrast = minContrastRaw === "" ? 1 : parseFloat(minContrastRaw);
  const splitFill = cfg.get("unfocused-split-fill") || "#000000";

  return (
    <>
      <SecHeader
        eyebrow="Section"
        title="Rendering"
        desc="How inactive splits look and how low-contrast cells are clamped."
      />
      <FieldRow
        label="unfocused-split-opacity"
        defaultValue={cfg.defaultOf("unfocused-split-opacity")}
      >
        <Slider
          value={Number.isFinite(splitOpacity) ? splitOpacity : 0.7}
          onChange={(v) => cfg.set("unfocused-split-opacity", v.toFixed(2))}
          min={0}
          max={1}
          step={0.05}
        />
        <span className="text-[11px] font-mono" style={{ color: "var(--muted)" }}>
          {(Number.isFinite(splitOpacity) ? splitOpacity : 0.7).toFixed(2)}
        </span>
      </FieldRow>
      <FieldRow
        label="unfocused-split-fill"
        defaultValue={cfg.defaultOf("unfocused-split-fill")}
      >
        <ColorSwatch
          value={splitFill}
          onChange={(v) => cfg.set("unfocused-split-fill", v)}
          size={24}
        />
        <TextInput
          value={cfg.get("unfocused-split-fill")}
          onChange={(v) => cfg.set("unfocused-split-fill", v)}
          placeholder="#000000"
          width={120}
        />
      </FieldRow>
      <FieldRow
        label="minimum-contrast"
        sub="Bump low-contrast cells"
        defaultValue={cfg.defaultOf("minimum-contrast")}
      >
        <Slider
          value={Number.isFinite(minContrast) ? minContrast : 1}
          onChange={(v) => cfg.set("minimum-contrast", v.toFixed(1))}
          min={1}
          max={21}
          step={0.5}
        />
        <span className="text-[11px] font-mono" style={{ color: "var(--muted)" }}>
          {(Number.isFinite(minContrast) ? minContrast : 1).toFixed(1)}:1
        </span>
      </FieldRow>
      <FieldRow
        label="bold-is-bright"
        defaultValue={cfg.defaultOf("bold-is-bright")}
      >
        <Toggle
          value={cfg.get("bold-is-bright") === "true"}
          onChange={(v) => cfg.set("bold-is-bright", String(v))}
        />
      </FieldRow>
    </>
  );
}
