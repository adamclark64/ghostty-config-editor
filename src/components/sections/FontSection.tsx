import { useMemo } from "react";
import { FieldRow, GroupLabel, SecHeader } from "@/components/primitives/layout";
import {
  Chip,
  Slider,
  Stepper,
  TextInput,
  Toggle,
} from "@/components/primitives/inputs";
import { useConfigCtx } from "@/context/ConfigContext";
import { useFonts } from "@/hooks/useSchema";
import { ANSI_FALLBACK, parsePalette } from "@/lib/palette";

const CURATED_FONTS: readonly string[] = [
  "JetBrainsMono Nerd Font",
  "Fira Code",
  "IBM Plex Mono",
  "Hack",
  "Berkeley Mono",
  "Monaspace Neon",
  "SF Mono",
  "Menlo",
];

const COMMON_FEATURES: readonly [string, string][] = [
  ["calt", "Contextual alternates"],
  ["liga", "Standard ligatures"],
  ["dlig", "Discretionary ligatures"],
  ["zero", "Slashed zero"],
  ["ss01", "Stylistic set 1"],
  ["ss02", "Stylistic set 2"],
];

export function FontSection() {
  const cfg = useConfigCtx();
  const fontsQ = useFonts();

  const family = cfg.get("font-family") || "JetBrainsMono Nerd Font";
  const size = parseFloat(cfg.get("font-size")) || 14;

  const background = cfg.get("background") || "#1e1e2e";
  const foreground = cfg.get("foreground") || "#cdd6f4";
  const palette = useMemo(() => {
    const slots = parsePalette(cfg.getAll("palette"));
    return slots.map((s, i) => s ?? ANSI_FALLBACK[i]);
  }, [cfg]);

  const discovered = fontsQ.data ?? [];
  const extraDiscovered = useMemo(
    () => discovered.filter((f) => !CURATED_FONTS.includes(f)).slice(0, 12),
    [discovered]
  );

  const featureString = cfg.get("font-feature");
  const featureActive = (tag: string) => featureString.includes(`+${tag}`);
  const toggleFeature = (tag: string) => {
    const on = featureActive(tag);
    const existing = featureString
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const without = existing.filter((t) => t.replace(/^[+-]/, "") !== tag);
    const next = on ? [...without, `-${tag}`] : [...without, `+${tag}`];
    cfg.set("font-feature", next.join(", "));
  };

  return (
    <>
      <SecHeader
        eyebrow="Section"
        title="Font"
        desc="Set your mono family, size, and feature flags. Bold/italic variants can inherit or use a different family."
      />

      <div className="px-6 pt-4 pb-2">
        <div
          className="rounded-lg p-4"
          style={{
            background,
            color: foreground,
            border: "1px solid var(--border)",
            fontFamily: `${family}, ui-monospace, Menlo, monospace`,
            fontSize: size,
            lineHeight: 1.5,
          }}
        >
          <div style={{ color: palette[2] }}>
            const <span style={{ color: palette[4] }}>editor</span> ={" "}
            <span style={{ color: palette[5] }}>new</span> ConfigEditor();
          </div>
          <div style={{ color: palette[3] }}>
            {"// ligatures: => != <= >= === !== ->"}
          </div>
          <div>
            <span style={{ color: palette[2] }}>function</span>{" "}
            <span style={{ color: palette[4] }}>render</span>() {"{"}
          </div>
          <div>
            &nbsp;&nbsp;
            <span style={{ color: palette[5] }}>return</span>{" "}
            "The quick brown fox 0123456789";
          </div>
          <div>{"}"}</div>
        </div>
      </div>

      <GroupLabel>Family</GroupLabel>
      <FieldRow
        label="font-family"
        sub="Primary mono family — click a card to pick"
        defaultValue={cfg.defaultOf("font-family")}
        configKey="font-family"
      >
        <div className="w-full grid grid-cols-2 gap-2">
          {CURATED_FONTS.map((f) => (
            <FontCard
              key={f}
              family={f}
              active={family === f}
              onClick={() => cfg.set("font-family", f)}
            />
          ))}
        </div>
      </FieldRow>
      {extraDiscovered.length > 0 && (
        <FieldRow
          label="also installed"
          sub="detected on this system"
          configKey={null}
        >
          <div className="flex flex-wrap gap-1.5">
            {extraDiscovered.map((f) => (
              <Chip
                key={f}
                active={family === f}
                onClick={() => cfg.set("font-family", f)}
                style={{
                  fontFamily: `${f}, ui-monospace, monospace`,
                }}
              >
                {f}
              </Chip>
            ))}
          </div>
        </FieldRow>
      )}
      <FieldRow
        label="font-family (custom)"
        sub="Enter any family name"
        configKey={null}
      >
        <TextInput
          value={cfg.get("font-family")}
          onChange={(v) => cfg.set("font-family", v)}
          placeholder="JetBrainsMono Nerd Font"
          width={260}
        />
      </FieldRow>
      <FieldRow
        label="font-family-bold"
        sub="Optional override"
        defaultValue="(inherit)"
      >
        <TextInput
          value={cfg.get("font-family-bold")}
          onChange={(v) => cfg.set("font-family-bold", v)}
          placeholder="(inherit)"
          width={220}
        />
      </FieldRow>
      <FieldRow label="font-family-italic" defaultValue="(inherit)">
        <TextInput
          value={cfg.get("font-family-italic")}
          onChange={(v) => cfg.set("font-family-italic", v)}
          placeholder="(inherit)"
          width={220}
        />
      </FieldRow>
      <FieldRow label="font-family-bold-italic" defaultValue="(inherit)">
        <TextInput
          value={cfg.get("font-family-bold-italic")}
          onChange={(v) => cfg.set("font-family-bold-italic", v)}
          placeholder="(inherit)"
          width={220}
        />
      </FieldRow>

      <GroupLabel>Size &amp; metrics</GroupLabel>
      <FieldRow label="font-size" defaultValue={cfg.defaultOf("font-size")}>
        <Slider
          value={size}
          onChange={(v) => cfg.set("font-size", String(v))}
          min={8}
          max={32}
          step={0.5}
        />
        <Stepper
          value={size}
          onChange={(v) => cfg.set("font-size", String(v))}
          min={8}
          max={64}
          step={0.5}
          unit="pt"
        />
      </FieldRow>
      <FieldRow label="font-thicken" sub="Thicken strokes" defaultValue="false">
        <Toggle
          value={cfg.get("font-thicken") === "true"}
          onChange={(v) => cfg.set("font-thicken", String(v))}
        />
      </FieldRow>
      <NumericRow keyName="adjust-cell-height" unit="px" min={-5} max={5} step={0.5} />
      <NumericRow keyName="adjust-cell-width" unit="px" min={-5} max={5} step={0.5} />

      <GroupLabel>Features &amp; ligatures</GroupLabel>
      <FieldRow
        label="font-feature"
        sub="OpenType feature tags (comma-separated)"
      >
        <TextInput
          value={cfg.get("font-feature")}
          onChange={(v) => cfg.set("font-feature", v)}
          placeholder="-calt, -liga, +ss01"
          width={360}
        />
      </FieldRow>
      <FieldRow label="common features" sub="quick toggles" configKey={null}>
        <div className="flex flex-wrap gap-1.5">
          {COMMON_FEATURES.map(([tag, desc]) => {
            const on = featureActive(tag);
            return (
              <Chip
                key={tag}
                active={on}
                onClick={() => toggleFeature(tag)}
                title={desc}
              >
                {on ? "+" : "−"}
                {tag}
              </Chip>
            );
          })}
        </div>
      </FieldRow>
    </>
  );
}

function FontCard({
  family,
  active,
  onClick,
}: {
  family: string;
  active: boolean;
  onClick: () => void;
}) {
  const stack = `${family}, ui-monospace, monospace`;
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-left rounded-lg p-3 transition-colors"
      style={{
        background: active
          ? "color-mix(in oklab, var(--accent) 8%, var(--surface))"
          : "var(--surface)",
        border: active ? "1.5px solid var(--accent)" : "1px solid var(--border)",
      }}
    >
      <div
        className="text-[12px] font-semibold truncate"
        style={{
          color: active ? "var(--accent)" : "var(--fg)",
          fontFamily: stack,
        }}
      >
        {family}
      </div>
      <div
        className="mt-1 font-mono text-[12.5px] leading-snug"
        style={{ color: "var(--fg)", fontFamily: stack }}
      >
        Aa Bb 0123
      </div>
      <div
        className="font-mono text-[12.5px] leading-snug"
        style={{ color: "var(--muted)", fontFamily: stack }}
      >
        =&gt; != &lt;= fi æ
      </div>
    </button>
  );
}

function NumericRow({
  keyName,
  unit,
  min,
  max,
  step,
}: {
  keyName: string;
  unit: string;
  min: number;
  max: number;
  step: number;
}) {
  const cfg = useConfigCtx();
  const raw = cfg.get(keyName);
  const value = parseFloat(raw) || 0;
  return (
    <FieldRow label={keyName} defaultValue={cfg.defaultOf(keyName)}>
      <Slider
        value={value}
        onChange={(v) => cfg.set(keyName, String(v))}
        min={min}
        max={max}
        step={step}
      />
      <span className="text-[11px]" style={{ color: "var(--muted)" }}>
        {unit}
      </span>
    </FieldRow>
  );
}
