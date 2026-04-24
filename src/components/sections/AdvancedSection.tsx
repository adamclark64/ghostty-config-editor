import { useState } from "react";
import { open as openDialog } from "@tauri-apps/plugin-dialog";
import { Icon } from "@/components/Icon";
import { FieldRow, GroupLabel, SecHeader } from "@/components/primitives/layout";
import {
  Segmented,
  Stepper,
  TextInput,
  Toggle,
} from "@/components/primitives/inputs";
import { MoreSettings } from "@/components/primitives/MoreSettings";
import { useConfigCtx } from "@/context/ConfigContext";

const ADVANCED_HANDLED = [
  "abnormal-command-exit-runtime",
  "config-file",
  "custom-shader",
  "custom-shader-animation",
  "language",
  "wait-after-command",
] as const;

export function AdvancedSection() {
  const cfg = useConfigCtx();
  const runtime = parseFloat(cfg.get("abnormal-command-exit-runtime")) || 250;

  return (
    <>
      <SecHeader
        eyebrow="Section"
        title="Advanced"
        desc="Low-level knobs. Most users shouldn't touch these."
      />

      <div className="px-6 pt-3">
        <div
          className="rounded-lg p-3 text-[12px] flex items-center gap-2"
          style={{
            background: "color-mix(in oklab, var(--danger) 10%, transparent)",
            border: "1px solid var(--border)",
            color: "var(--fg)",
          }}
        >
          <Icon name="gear" size={14} />
          Wrong values here can make ghostty fail to launch. Run Validate
          before Save.
        </div>
      </div>

      <FieldRow label="language" defaultValue={cfg.defaultOf("language")}>
        <TextInput
          value={cfg.get("language")}
          onChange={(v) => cfg.set("language", v)}
          placeholder="en_US.UTF-8"
          width={220}
        />
      </FieldRow>
      <FieldRow
        label="config-file"
        sub="Additional config to include"
        defaultValue={cfg.defaultOf("config-file")}
      >
        <TextInput
          value={cfg.get("config-file")}
          onChange={(v) => cfg.set("config-file", v)}
          placeholder="~/.config/ghostty/custom"
          width={340}
        />
      </FieldRow>
      <FieldRow
        label="wait-after-command"
        defaultValue={cfg.defaultOf("wait-after-command")}
      >
        <Toggle
          value={cfg.get("wait-after-command") === "true"}
          onChange={(v) => cfg.set("wait-after-command", String(v))}
        />
      </FieldRow>
      <FieldRow
        label="abnormal-command-exit-runtime"
        sub="ms"
        defaultValue={cfg.defaultOf("abnormal-command-exit-runtime")}
      >
        <Stepper
          value={runtime}
          onChange={(v) => cfg.set("abnormal-command-exit-runtime", String(v))}
          min={0}
          max={10_000}
          step={50}
          unit="ms"
        />
      </FieldRow>
      <FieldRow label="custom-shader" defaultValue={cfg.defaultOf("custom-shader")}>
        <TextInput
          value={cfg.get("custom-shader")}
          onChange={(v) => cfg.set("custom-shader", v)}
          placeholder="/path/to/shader.glsl"
          width={300}
        />
        <button
          type="button"
          onClick={async () => {
            const picked = await openDialog({
              multiple: false,
              directory: false,
              title: "Pick a custom shader",
            });
            if (typeof picked === "string") cfg.set("custom-shader", picked);
          }}
          className="px-2.5 py-1 rounded-md text-[12px]"
          style={{
            background: "var(--surface-raised)",
            border: "1px solid var(--border)",
            color: "var(--fg)",
          }}
        >
          Choose…
        </button>
      </FieldRow>
      <FieldRow
        label="custom-shader-animation"
        defaultValue={cfg.defaultOf("custom-shader-animation")}
      >
        <Segmented
          value={cfg.get("custom-shader-animation") || "false"}
          onChange={(v) => cfg.set("custom-shader-animation", v)}
          options={["true", "false", "always"]}
        />
      </FieldRow>

      <UnknownKeysPanel />
    </>
  );
}

function UnknownKeysPanel() {
  const cfg = useConfigCtx();
  const [open, setOpen] = useState(false);
  const keys = cfg.unknownKeys;
  if (keys.length === 0) return null;

  return (
    <>
      <GroupLabel>Unknown keys</GroupLabel>
      <div className="px-6 pb-6">
        <div
          className="rounded-lg overflow-hidden"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
          }}
        >
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-2.5 text-left"
          >
            <span className="text-[12px]" style={{ color: "var(--fg)" }}>
              {keys.length} key{keys.length === 1 ? "" : "s"} in your config not
              covered by this editor
            </span>
            <span className="text-[11px]" style={{ color: "var(--muted)" }}>
              {open ? "hide" : "show"}
            </span>
          </button>
          {open && (
            <div className="px-4 pb-3">
              <div
                className="text-[11px] mb-2"
                style={{ color: "var(--muted)" }}
              >
                These keys are preserved on save — edit them in the config
                file directly until the editor surfaces them.
              </div>
              <ul className="flex flex-wrap gap-1.5">
                {keys.map((k) => (
                  <li
                    key={k}
                    className="font-mono text-[11.5px] px-2 py-0.5 rounded"
                    style={{
                      background: "var(--input-bg)",
                      border: "1px solid var(--border)",
                      color: "var(--fg)",
                    }}
                  >
                    {k}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
      <MoreSettings sectionId="advanced" handled={ADVANCED_HANDLED} />
    </>
  );
}
