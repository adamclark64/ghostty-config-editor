import { FieldRow, SecHeader } from "@/components/primitives/layout";
import { Segmented, Toggle } from "@/components/primitives/inputs";
import { useConfigCtx } from "@/context/ConfigContext";

export function ClipboardSection() {
  const cfg = useConfigCtx();
  return (
    <>
      <SecHeader
        eyebrow="Section"
        title="Clipboard"
        desc="Read/write permissions, trim, paste protection."
      />
      <FieldRow label="clipboard-read" defaultValue={cfg.defaultOf("clipboard-read")}>
        <Segmented
          value={cfg.get("clipboard-read") || "ask"}
          onChange={(v) => cfg.set("clipboard-read", v)}
          options={["allow", "deny", "ask"]}
        />
      </FieldRow>
      <FieldRow label="clipboard-write" defaultValue={cfg.defaultOf("clipboard-write")}>
        <Segmented
          value={cfg.get("clipboard-write") || "allow"}
          onChange={(v) => cfg.set("clipboard-write", v)}
          options={["allow", "deny", "ask"]}
        />
      </FieldRow>
      <FieldRow
        label="clipboard-trim-trailing-spaces"
        defaultValue={cfg.defaultOf("clipboard-trim-trailing-spaces")}
      >
        <Toggle
          value={cfg.get("clipboard-trim-trailing-spaces") !== "false"}
          onChange={(v) => cfg.set("clipboard-trim-trailing-spaces", String(v))}
        />
      </FieldRow>
      <FieldRow
        label="clipboard-paste-protection"
        defaultValue={cfg.defaultOf("clipboard-paste-protection")}
      >
        <Toggle
          value={cfg.get("clipboard-paste-protection") !== "false"}
          onChange={(v) => cfg.set("clipboard-paste-protection", String(v))}
        />
      </FieldRow>
      <FieldRow
        label="clipboard-paste-bracketed-safe"
        defaultValue={cfg.defaultOf("clipboard-paste-bracketed-safe")}
      >
        <Toggle
          value={cfg.get("clipboard-paste-bracketed-safe") !== "false"}
          onChange={(v) => cfg.set("clipboard-paste-bracketed-safe", String(v))}
        />
      </FieldRow>
      <FieldRow label="copy-on-select" defaultValue={cfg.defaultOf("copy-on-select")}>
        <Segmented
          value={cfg.get("copy-on-select") || "false"}
          onChange={(v) => cfg.set("copy-on-select", v)}
          options={["true", "false", "clipboard"]}
        />
      </FieldRow>
    </>
  );
}
