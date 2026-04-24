import { ColorSwatch } from "@/components/primitives/ColorSwatch";
import { TextInput } from "@/components/primitives/inputs";
import { FieldRow } from "@/components/primitives/layout";
import { useConfigCtx } from "@/context/ConfigContext";

interface ColorRowProps {
  label: string;
  /** Value to show when the user hasn't set anything. */
  fallback?: string;
  /** Overrides the config key if different from the label. */
  configKey?: string;
}

export function ColorRow({
  label,
  fallback = "#000000",
  configKey,
}: ColorRowProps) {
  const cfg = useConfigCtx();
  const key = configKey ?? label;
  const value = cfg.get(key);
  const effective = value || fallback;
  const def = cfg.defaultOf(key);

  return (
    <FieldRow label={label} defaultValue={def} configKey={key}>
      <ColorSwatch
        value={effective}
        onChange={(hex) => cfg.set(key, hex)}
        size={24}
      />
      <TextInput
        value={value}
        onChange={(v) => cfg.set(key, v)}
        placeholder={fallback}
        width={120}
      />
    </FieldRow>
  );
}
