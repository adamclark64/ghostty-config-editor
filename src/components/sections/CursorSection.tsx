import { ColorSwatch } from "@/components/primitives/ColorSwatch";
import { FieldRow, GroupLabel, SecHeader } from "@/components/primitives/layout";
import {
  Segmented,
  Slider,
  TextInput,
  Toggle,
} from "@/components/primitives/inputs";
import { useConfigCtx } from "@/context/ConfigContext";

const CURSOR_STYLES = [
  { value: "block", label: "Block" },
  { value: "bar", label: "Bar" },
  { value: "underline", label: "Underline" },
] as const;

type CursorStyleValue = (typeof CURSOR_STYLES)[number]["value"];

export function CursorSection() {
  const cfg = useConfigCtx();

  const style = (cfg.get("cursor-style") || "block") as CursorStyleValue;
  const color = cfg.get("cursor-color") || "#ffffff";
  const blink = cfg.get("cursor-style-blink") !== "false";
  const thickness = parseFloat(cfg.get("cursor-thickness")) || 1;
  const opacityStr = cfg.get("cursor-opacity");
  const opacity = opacityStr === "" ? 1 : parseFloat(opacityStr);
  const background = cfg.get("background") || "#1e1e2e";
  const foreground = cfg.get("foreground") || "#cdd6f4";

  return (
    <>
      <SecHeader
        eyebrow="Section"
        title="Cursor"
        desc="Shape, color, blink. Previews below match your live theme."
      />

      <div className="px-6 pt-4 pb-2 grid grid-cols-3 gap-3">
        {CURSOR_STYLES.map((cs) => (
          <button
            key={cs.value}
            type="button"
            onClick={() => cfg.set("cursor-style", cs.value)}
            className="rounded-xl overflow-hidden text-left"
            style={{
              border:
                style === cs.value
                  ? "2px solid var(--accent)"
                  : "1px solid var(--border)",
            }}
          >
            <CursorPreview
              style={cs.value}
              color={color}
              blink={blink}
              thickness={thickness}
              bg={background}
              fg={foreground}
            />
            <div
              className="px-3 py-2 text-[12px] font-semibold"
              style={{
                background: "var(--surface)",
                color: style === cs.value ? "var(--accent)" : "var(--fg)",
              }}
            >
              {cs.label}
            </div>
          </button>
        ))}
      </div>

      <GroupLabel>Behavior</GroupLabel>
      <FieldRow label="cursor-style" defaultValue={cfg.defaultOf("cursor-style")}>
        <Segmented
          value={style}
          onChange={(v) => cfg.set("cursor-style", v)}
          options={CURSOR_STYLES as unknown as readonly { value: string; label: string }[]}
        />
      </FieldRow>
      <FieldRow
        label="cursor-style-blink"
        sub="Blink animation"
        defaultValue={cfg.defaultOf("cursor-style-blink")}
      >
        <Toggle
          value={blink}
          onChange={(v) => cfg.set("cursor-style-blink", String(v))}
        />
      </FieldRow>
      <FieldRow label="cursor-color" defaultValue={cfg.defaultOf("cursor-color")}>
        <ColorSwatch
          value={color}
          onChange={(v) => cfg.set("cursor-color", v)}
          size={24}
        />
        <TextInput
          value={cfg.get("cursor-color")}
          onChange={(v) => cfg.set("cursor-color", v)}
          placeholder="#ffffff"
          width={120}
        />
      </FieldRow>
      <FieldRow
        label="cursor-opacity"
        defaultValue={cfg.defaultOf("cursor-opacity")}
      >
        <Slider
          value={Number.isFinite(opacity) ? opacity : 1}
          onChange={(v) => cfg.set("cursor-opacity", v.toFixed(2))}
          min={0}
          max={1}
          step={0.05}
        />
        <span className="text-[11px] font-mono" style={{ color: "var(--muted)" }}>
          {(Number.isFinite(opacity) ? opacity : 1).toFixed(2)}
        </span>
      </FieldRow>
      <FieldRow
        label="cursor-thickness"
        sub="For bar/underline"
        defaultValue={cfg.defaultOf("cursor-thickness")}
      >
        <Slider
          value={thickness}
          onChange={(v) => cfg.set("cursor-thickness", String(v))}
          min={0.5}
          max={4}
          step={0.5}
        />
        <span className="text-[11px]" style={{ color: "var(--muted)" }}>
          ×
        </span>
      </FieldRow>
      <FieldRow
        label="cursor-click-to-move"
        defaultValue={cfg.defaultOf("cursor-click-to-move")}
      >
        <Toggle
          value={cfg.get("cursor-click-to-move") === "true"}
          onChange={(v) => cfg.set("cursor-click-to-move", String(v))}
        />
      </FieldRow>
    </>
  );
}

function CursorPreview({
  style,
  color,
  blink,
  thickness = 1,
  bg,
  fg,
}: {
  style: CursorStyleValue;
  color: string;
  blink: boolean;
  thickness?: number;
  bg: string;
  fg: string;
}) {
  const w = style === "bar" ? 2 * thickness : 9;
  const h = style === "underline" ? 2 * thickness : 15;
  const align = style === "underline" ? "flex-end" : "center";
  return (
    <div
      className="px-4 py-3.5 font-mono text-[14px] flex items-center"
      style={{ background: bg, color: fg }}
    >
      <span style={{ opacity: 0.8 }}>$</span>&nbsp;
      <span>ghostty --config</span>&nbsp;
      <span
        style={{
          display: "inline-flex",
          alignItems: align,
          height: 16,
        }}
      >
        <span
          style={{
            display: "inline-block",
            width: w,
            height: h,
            background: color,
            animation: blink ? "cursor-blink 1s steps(2) infinite" : "none",
          }}
        />
      </span>
    </div>
  );
}
