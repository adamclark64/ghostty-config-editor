import { open as openDialog } from "@tauri-apps/plugin-dialog";
import { FieldRow, GroupLabel, SecHeader } from "@/components/primitives/layout";
import {
  Chip,
  Segmented,
  TextInput,
} from "@/components/primitives/inputs";
import { useConfigCtx } from "@/context/ConfigContext";

const SHELL_FEATURES = ["cursor", "sudo", "title", "ssh-env", "ssh-terminfo"] as const;

export function ShellSection() {
  const cfg = useConfigCtx();

  const featuresRaw = cfg.get("shell-integration-features");
  const features = featuresRaw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const toggleFeature = (f: string) => {
    const on = features.includes(f);
    const next = on ? features.filter((x) => x !== f) : [...features, f];
    cfg.set("shell-integration-features", next.join(","));
  };

  return (
    <>
      <SecHeader
        eyebrow="Section"
        title="Shell & Session"
        desc="Integration with zsh/bash/fish, startup command, working directory."
      />

      <GroupLabel>Command</GroupLabel>
      <FieldRow label="command" sub="Override shell" defaultValue="(login shell)">
        <TextInput
          value={cfg.get("command")}
          onChange={(v) => cfg.set("command", v)}
          placeholder="/bin/zsh --login"
          width={320}
        />
      </FieldRow>
      <FieldRow label="working-directory" defaultValue="(inherit)">
        <TextInput
          value={cfg.get("working-directory")}
          onChange={(v) => cfg.set("working-directory", v)}
          placeholder="~"
          width={240}
        />
        <button
          type="button"
          onClick={async () => {
            const picked = await openDialog({
              multiple: false,
              directory: true,
              title: "Pick a working directory",
            });
            if (typeof picked === "string") cfg.set("working-directory", picked);
          }}
          className="px-2.5 py-1 rounded-md text-[12px]"
          style={{
            background: "var(--surface-raised)",
            border: "1px solid var(--border)",
            color: "var(--fg)",
          }}
        >
          Browse…
        </button>
      </FieldRow>

      <GroupLabel>Shell integration</GroupLabel>
      <FieldRow
        label="shell-integration"
        defaultValue={cfg.defaultOf("shell-integration")}
      >
        <Segmented
          value={cfg.get("shell-integration") || "detect"}
          onChange={(v) => cfg.set("shell-integration", v)}
          options={["none", "detect", "bash", "zsh", "fish"]}
        />
      </FieldRow>
      <FieldRow
        label="shell-integration-features"
        defaultValue={cfg.defaultOf("shell-integration-features")}
      >
        <div className="flex flex-wrap gap-1.5">
          {SHELL_FEATURES.map((f) => (
            <Chip
              key={f}
              active={features.includes(f)}
              onClick={() => toggleFeature(f)}
            >
              {f}
            </Chip>
          ))}
        </div>
      </FieldRow>
      <FieldRow label="term" defaultValue={cfg.defaultOf("term") ?? "xterm-ghostty"}>
        <TextInput
          value={cfg.get("term")}
          onChange={(v) => cfg.set("term", v)}
          placeholder="xterm-ghostty"
          width={220}
        />
      </FieldRow>
    </>
  );
}
