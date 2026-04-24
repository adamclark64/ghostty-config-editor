import { FieldRow, GroupLabel, SecHeader } from "@/components/primitives/layout";
import {
  Segmented,
  Slider,
  Stepper,
  TextInput,
  Toggle,
} from "@/components/primitives/inputs";
import { MoreSettings } from "@/components/primitives/MoreSettings";
import { useConfigCtx } from "@/context/ConfigContext";
import { open as openDialog } from "@tauri-apps/plugin-dialog";

const WINDOW_HANDLED = [
  "background",
  "background-blur",
  "background-image",
  "background-opacity",
  "confirm-close-surface",
  "foreground",
  "macos-titlebar-style",
  "quit-after-last-window-closed",
  "window-decoration",
  "window-height",
  "window-padding-balance",
  "window-padding-x",
  "window-padding-y",
  "window-theme",
  "window-width",
] as const;

export function WindowSection() {
  const cfg = useConfigCtx();

  const paddingX = parseFloat(cfg.get("window-padding-x")) || 12;
  const paddingY = parseFloat(cfg.get("window-padding-y")) || 12;
  const bgOpacityRaw = cfg.get("background-opacity");
  const bgOpacity = bgOpacityRaw === "" ? 0.95 : parseFloat(bgOpacityRaw);
  const bgBlurRaw = cfg.get("background-blur");
  const bgBlur = bgBlurRaw === "" ? 20 : parseFloat(bgBlurRaw);
  const background = cfg.get("background") || "#1e1e2e";
  const foreground = cfg.get("foreground") || "#cdd6f4";

  return (
    <>
      <SecHeader
        eyebrow="Section"
        title="Window"
        desc="Chrome, padding, blur. Changes visualized live."
      />

      <div className="px-6 pt-4 pb-2">
        <div
          className="relative rounded-xl overflow-hidden"
          style={{
            height: 180,
            background:
              "repeating-linear-gradient(45deg, var(--surface-hover) 0 8px, var(--surface) 8px 16px)",
            border: "1px solid var(--border)",
          }}
        >
          <div
            className="absolute rounded-md overflow-hidden"
            style={{
              inset: 12,
              background,
              opacity: Number.isFinite(bgOpacity) ? bgOpacity : 0.95,
              transition: "opacity .15s",
            }}
          />
          <div
            className="absolute rounded flex items-center justify-center font-mono text-[11px]"
            style={{
              left: 12 + paddingX,
              right: 12 + paddingX,
              top: 12 + paddingY,
              bottom: 12 + paddingY,
              border: `1px dashed ${foreground}`,
              opacity: 0.55,
              color: foreground,
            }}
          >
            content
          </div>
          <div
            className="absolute top-1.5 left-[18px] font-mono text-[10px] px-1.5 py-0.5 rounded"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              color: "var(--muted)",
            }}
          >
            padding: {paddingX}px × {paddingY}px · opacity:{" "}
            {Math.round(
              (Number.isFinite(bgOpacity) ? bgOpacity : 0.95) * 100
            )}
            %
          </div>
        </div>
      </div>

      <GroupLabel>Padding</GroupLabel>
      <FieldRow label="window-padding-x" defaultValue={cfg.defaultOf("window-padding-x")}>
        <Slider
          value={paddingX}
          onChange={(v) => cfg.set("window-padding-x", String(v))}
          min={0}
          max={48}
        />
        <Stepper
          value={paddingX}
          onChange={(v) => cfg.set("window-padding-x", String(v))}
          min={0}
          max={200}
          unit="px"
        />
      </FieldRow>
      <FieldRow label="window-padding-y" defaultValue={cfg.defaultOf("window-padding-y")}>
        <Slider
          value={paddingY}
          onChange={(v) => cfg.set("window-padding-y", String(v))}
          min={0}
          max={48}
        />
        <Stepper
          value={paddingY}
          onChange={(v) => cfg.set("window-padding-y", String(v))}
          min={0}
          max={200}
          unit="px"
        />
      </FieldRow>
      <FieldRow
        label="window-padding-balance"
        defaultValue={cfg.defaultOf("window-padding-balance")}
      >
        <Toggle
          value={cfg.get("window-padding-balance") === "true"}
          onChange={(v) => cfg.set("window-padding-balance", String(v))}
        />
      </FieldRow>

      <GroupLabel>Background</GroupLabel>
      <FieldRow
        label="background-opacity"
        defaultValue={cfg.defaultOf("background-opacity")}
      >
        <Slider
          value={Number.isFinite(bgOpacity) ? bgOpacity : 0.95}
          onChange={(v) =>
            cfg.set("background-opacity", v.toFixed(2))
          }
          min={0}
          max={1}
          step={0.01}
        />
        <span className="text-[11px]" style={{ color: "var(--muted)", width: 48 }}>
          {Math.round((Number.isFinite(bgOpacity) ? bgOpacity : 0.95) * 100)}%
        </span>
      </FieldRow>
      <FieldRow
        label="background-blur"
        sub="macOS only"
        defaultValue={cfg.defaultOf("background-blur")}
      >
        <Slider
          value={Number.isFinite(bgBlur) ? bgBlur : 20}
          onChange={(v) => cfg.set("background-blur", String(Math.round(v)))}
          min={0}
          max={100}
        />
        <Stepper
          value={Number.isFinite(bgBlur) ? bgBlur : 20}
          onChange={(v) => cfg.set("background-blur", String(v))}
          min={0}
          max={100}
        />
      </FieldRow>
      <FieldRow label="background-image" defaultValue="(empty)">
        <TextInput
          value={cfg.get("background-image")}
          onChange={(v) => cfg.set("background-image", v)}
          placeholder="/path/to/image.png"
          width={280}
        />
        <button
          type="button"
          onClick={async () => {
            const picked = await openDialog({
              multiple: false,
              directory: false,
              title: "Pick a background image",
            });
            if (typeof picked === "string") cfg.set("background-image", picked);
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

      <GroupLabel>Chrome</GroupLabel>
      <FieldRow label="window-decoration" defaultValue={cfg.defaultOf("window-decoration")}>
        <Segmented
          value={cfg.get("window-decoration") || "auto"}
          onChange={(v) => cfg.set("window-decoration", v)}
          options={["auto", "server", "client", "none"]}
        />
      </FieldRow>
      <FieldRow label="window-theme" defaultValue={cfg.defaultOf("window-theme")}>
        <Segmented
          value={cfg.get("window-theme") || "auto"}
          onChange={(v) => cfg.set("window-theme", v)}
          options={["auto", "system", "light", "dark", "ghostty"]}
        />
      </FieldRow>
      <FieldRow label="window-width × height" sub="Initial size, cells" configKey={null}>
        <Stepper
          value={parseFloat(cfg.get("window-width")) || 120}
          onChange={(v) => cfg.set("window-width", String(v))}
          min={40}
          max={400}
        />
        <span style={{ color: "var(--muted)" }}>×</span>
        <Stepper
          value={parseFloat(cfg.get("window-height")) || 40}
          onChange={(v) => cfg.set("window-height", String(v))}
          min={10}
          max={200}
        />
      </FieldRow>
      <FieldRow
        label="confirm-close-surface"
        defaultValue={cfg.defaultOf("confirm-close-surface")}
      >
        <Toggle
          value={cfg.get("confirm-close-surface") !== "false"}
          onChange={(v) => cfg.set("confirm-close-surface", String(v))}
        />
      </FieldRow>
      <FieldRow
        label="quit-after-last-window-closed"
        defaultValue={cfg.defaultOf("quit-after-last-window-closed")}
      >
        <Toggle
          value={cfg.get("quit-after-last-window-closed") === "true"}
          onChange={(v) => cfg.set("quit-after-last-window-closed", String(v))}
        />
      </FieldRow>
      <FieldRow
        label="macos-titlebar-style"
        sub="macOS only"
        defaultValue={cfg.defaultOf("macos-titlebar-style")}
      >
        <Segmented
          value={cfg.get("macos-titlebar-style") || "transparent"}
          onChange={(v) => cfg.set("macos-titlebar-style", v)}
          options={["native", "transparent", "tabs", "hidden"]}
        />
      </FieldRow>

      <MoreSettings
        sectionId="window"
        handled={WINDOW_HANDLED}
        subtitle="Every remaining window-group schema key, editable with a generic widget inferred from its type."
      />
    </>
  );
}
