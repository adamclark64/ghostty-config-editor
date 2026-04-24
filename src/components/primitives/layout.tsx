import type { ReactNode } from "react";
import { DocsLink } from "./DocsLink";
import { useConfigCtx } from "@/context/ConfigContext";

export function SecHeader({
  eyebrow,
  title,
  desc,
}: {
  eyebrow: string;
  title: string;
  desc?: string;
}) {
  return (
    <div
      className="px-6 pt-[18px] pb-3 border-b"
      style={{ borderColor: "var(--border)" }}
    >
      <div
        className="text-[11px] uppercase tracking-[0.05em]"
        style={{ color: "var(--muted)" }}
      >
        {eyebrow}
      </div>
      <div className="text-[20px] font-semibold mt-0.5">{title}</div>
      {desc && (
        <div
          className="text-[12px] mt-1 max-w-[540px]"
          style={{ color: "var(--muted)" }}
        >
          {desc}
        </div>
      )}
    </div>
  );
}

export function GroupLabel({ children }: { children: ReactNode }) {
  return (
    <div
      className="px-6 pt-[14px] pb-1.5 text-[10.5px] font-bold uppercase tracking-[0.06em]"
      style={{ color: "var(--subtle)" }}
    >
      {children}
    </div>
  );
}

interface FieldRowProps {
  label: string;
  sub?: string;
  defaultValue?: string;
  children: ReactNode;
  /**
   * Schema key to pull docs from. Defaults to `label`; pass `null` to suppress
   * the docs link (useful for compound rows like "window-width × height").
   */
  configKey?: string | null;
  /** Explicit docs text, overriding the schema lookup. */
  docs?: string;
}

export function FieldRow({
  label,
  sub,
  defaultValue,
  children,
  configKey,
  docs,
}: FieldRowProps) {
  const cfg = useConfigCtx();
  const resolvedKey =
    configKey === null ? null : configKey ?? label;
  const docsText = docs ?? (resolvedKey ? cfg.docsOf(resolvedKey) : undefined);

  return (
    <div
      className="flex items-start gap-3 px-6 py-2.5 border-b"
      style={{ borderColor: "var(--border)" }}
      data-config-key={resolvedKey ?? undefined}
    >
      <div className="w-[200px] flex-shrink-0 pt-1">
        <div
          className="font-mono text-[12.5px]"
          style={{ color: "var(--fg)" }}
        >
          {label}
        </div>
        {sub && (
          <div className="text-[11px]" style={{ color: "var(--muted)" }}>
            {sub}
          </div>
        )}
        {defaultValue !== undefined && (
          <div className="text-[11px]" style={{ color: "var(--muted)" }}>
            default:{" "}
            <span className="font-mono">{defaultValue}</span>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0 flex items-center gap-2.5 flex-wrap">
        {children}
      </div>
      {docsText && (
        <div className="flex-shrink-0 pt-1">
          <DocsLink text={docsText} />
        </div>
      )}
    </div>
  );
}
