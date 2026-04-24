import { Icon, type IconName } from "@/components/Icon";
import { isMac } from "@/lib/platform";
import type { SchemePreference } from "@/hooks/useColorScheme";

interface TitlebarProps {
  title: string;
  configPath?: string;
  dirty: boolean;
  compareOpen: boolean;
  onCompare: () => void;
  onRevert: () => void;
  revertDisabled?: boolean;
  onValidate: () => void;
  validating?: boolean;
  onSave: () => void;
  saving?: boolean;
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  previewCollapsed: boolean;
  onTogglePreview: () => void;
  schemePreference: SchemePreference;
  onCycleScheme: () => void;
}

export function Titlebar({
  title,
  configPath,
  dirty,
  compareOpen,
  onCompare,
  onRevert,
  revertDisabled,
  onValidate,
  validating,
  onSave,
  saving,
  sidebarCollapsed,
  onToggleSidebar,
  previewCollapsed,
  onTogglePreview,
  schemePreference,
  onCycleScheme,
}: TitlebarProps) {
  const schemeIcon: IconName =
    schemePreference === "system"
      ? "system"
      : schemePreference === "light"
      ? "sun"
      : "moon";
  const schemeLabel =
    schemePreference === "system"
      ? "Theme: system"
      : schemePreference === "light"
      ? "Theme: light"
      : "Theme: dark";

  return (
    <div
      className="h-[44px] flex items-center px-3 border-b border-border select-none"
      style={{ background: "var(--bg-2)" }}
    >
      {isMac && <TrafficLights />}
      <div className="flex items-center gap-1 pl-1">
        <IconToggle
          onClick={onToggleSidebar}
          icon="panel-left"
          active={!sidebarCollapsed}
          title={sidebarCollapsed ? "Show sidebar" : "Hide sidebar"}
        />
        <IconToggle
          onClick={onTogglePreview}
          icon="panel-right"
          active={!previewCollapsed}
          title={previewCollapsed ? "Show preview" : "Hide preview"}
        />
      </div>
      <div className="flex-1 flex items-center justify-center gap-3 text-[13px] min-w-0">
        <span className="font-semibold text-fg">{title}</span>
        {configPath && (
          <span className="text-muted font-mono text-[11px] truncate">
            {configPath}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2 pr-2">
        <IconToggle
          onClick={onCycleScheme}
          icon={schemeIcon}
          title={`${schemeLabel} — click to cycle`}
        />
        <HeaderButton
          onClick={onCompare}
          icon="diff"
          active={compareOpen}
          disabled={!dirty && !compareOpen}
        >
          {compareOpen ? "Viewing before" : "Compare"}
        </HeaderButton>
        <HeaderButton
          onClick={onRevert}
          icon="undo"
          disabled={revertDisabled ?? !dirty}
        >
          Revert
        </HeaderButton>
        <HeaderButton onClick={onValidate} icon="check" disabled={validating}>
          {validating ? "Validating…" : "Validate"}
        </HeaderButton>
        <HeaderButton
          onClick={onSave}
          icon="save"
          primary
          disabled={saving || !dirty}
        >
          {saving ? "Saving…" : "Save & Reload"}
        </HeaderButton>
      </div>
    </div>
  );
}

function IconToggle({
  icon,
  onClick,
  active,
  title,
}: {
  icon: IconName;
  onClick: () => void;
  active?: boolean;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      aria-pressed={active}
      className="inline-flex items-center justify-center w-[28px] h-[26px] rounded-md"
      style={{
        background: active ? "var(--surface-active)" : "transparent",
        color: active ? "var(--fg)" : "var(--muted)",
        border: "1px solid transparent",
      }}
    >
      <Icon name={icon} size={14} />
    </button>
  );
}

function TrafficLights() {
  // Purely decorative placeholder — the real traffic lights come from macOS
  // when `decorations: true` is set on the Tauri window. We leave the spacer
  // so the centered title has room on the left.
  return <div className="w-[68px]" aria-hidden />;
}

interface HeaderButtonProps {
  icon: React.ComponentProps<typeof Icon>["name"];
  onClick?: () => void;
  primary?: boolean;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}

function HeaderButton({
  icon,
  onClick,
  primary,
  active,
  disabled,
  children,
}: HeaderButtonProps) {
  const base =
    "inline-flex items-center gap-1.5 h-[26px] px-2.5 rounded-md text-[12px] font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed";
  const style = primary
    ? {
        background: "var(--accent)",
        color: "#14141a",
        border: "1px solid transparent",
      }
    : active
    ? {
        background: "var(--accent)",
        color: "#14141a",
        border: "1px solid transparent",
      }
    : {
        background: "var(--surface-raised)",
        color: "var(--fg)",
        border: "1px solid var(--border)",
      };
  return (
    <button className={base} style={style} onClick={onClick} disabled={disabled}>
      <Icon name={icon} size={13} />
      {children}
    </button>
  );
}
