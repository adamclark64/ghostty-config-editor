import { FieldRow, GroupLabel, SecHeader } from "@/components/primitives/layout";
import {
  Chip,
  Segmented,
  Toggle,
} from "@/components/primitives/inputs";
import { useConfigCtx } from "@/context/ConfigContext";
import { isLinux, isMac } from "@/lib/platform";

const BELL_FEATURES = ["audio", "system", "attention", "title"] as const;

export function AppSection() {
  const cfg = useConfigCtx();

  const bellRaw = cfg.get("bell-features");
  const bell = bellRaw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const toggleBell = (f: string) => {
    const on = bell.includes(f);
    const next = on ? bell.filter((x) => x !== f) : [...bell, f];
    cfg.set("bell-features", next.join(","));
  };

  return (
    <>
      <SecHeader
        eyebrow="Section"
        title="App"
        desc="Start behavior, single-instance, dock, notifications."
      />

      <GroupLabel>Instance</GroupLabel>
      {isLinux && (
        <FieldRow
          label="gtk-single-instance"
          sub="Linux only"
          defaultValue={cfg.defaultOf("gtk-single-instance")}
        >
          <Segmented
            value={cfg.get("gtk-single-instance") || "desktop"}
            onChange={(v) => cfg.set("gtk-single-instance", v)}
            options={["desktop", "true", "false"]}
          />
        </FieldRow>
      )}
      {isMac && (
        <FieldRow
          label="macos-option-as-alt"
          sub="macOS only"
          defaultValue={cfg.defaultOf("macos-option-as-alt")}
        >
          <Segmented
            value={cfg.get("macos-option-as-alt") || "false"}
            onChange={(v) => cfg.set("macos-option-as-alt", v)}
            options={["true", "false", "left", "right"]}
          />
        </FieldRow>
      )}
      {isMac && (
        <FieldRow
          label="macos-non-native-fullscreen"
          sub="macOS only"
          defaultValue={cfg.defaultOf("macos-non-native-fullscreen")}
        >
          <Toggle
            value={cfg.get("macos-non-native-fullscreen") === "true"}
            onChange={(v) =>
              cfg.set("macos-non-native-fullscreen", String(v))
            }
          />
        </FieldRow>
      )}

      <GroupLabel>Notifications</GroupLabel>
      <FieldRow
        label="bell-features"
        sub="How to signal the bell"
        defaultValue={cfg.defaultOf("bell-features")}
      >
        <div className="flex flex-wrap gap-1.5">
          {BELL_FEATURES.map((f) => (
            <Chip
              key={f}
              active={bell.includes(f)}
              onClick={() => toggleBell(f)}
            >
              {f}
            </Chip>
          ))}
        </div>
      </FieldRow>
      <FieldRow
        label="desktop-notifications"
        defaultValue={cfg.defaultOf("desktop-notifications")}
      >
        <Toggle
          value={cfg.get("desktop-notifications") !== "false"}
          onChange={(v) => cfg.set("desktop-notifications", String(v))}
        />
      </FieldRow>
    </>
  );
}
