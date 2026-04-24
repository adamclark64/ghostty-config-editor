import { useMemo, useState } from "react";
import { FieldRow } from "@/components/primitives/layout";
import { ColorSwatch } from "@/components/primitives/ColorSwatch";
import {
  Segmented,
  Stepper,
  TextInput,
  Toggle,
} from "@/components/primitives/inputs";
import { useConfigCtx } from "@/context/ConfigContext";
import { keysForSection, type SectionId } from "@/lib/sections";
import type { ConfigKey } from "@/types";

/**
 * Catch-all renderer for schema keys routed to this section that the
 * hand-crafted section UI hasn't surfaced explicitly. Guarantees that every
 * key the search lands on can be edited somewhere, even if coarsely.
 */
export function MoreSettings({
  sectionId,
  handled,
  title = "More settings",
  subtitle,
}: {
  sectionId: SectionId;
  handled: readonly string[];
  title?: string;
  subtitle?: string;
}) {
  const cfg = useConfigCtx();
  const handledSet = useMemo(() => new Set(handled), [handled]);

  const keys = useMemo(
    () =>
      keysForSection(cfg.schema, sectionId)
        .filter((k) => !handledSet.has(k.name))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [cfg.schema, sectionId, handledSet]
  );

  const [expanded, setExpanded] = useState(false);

  if (keys.length === 0) return null;

  return (
    <>
      <div
        className="flex items-center justify-between px-6 pt-[14px] pb-1.5 cursor-pointer"
        onClick={() => setExpanded((v) => !v)}
      >
        <div
          className="text-[10.5px] font-bold uppercase tracking-[0.06em]"
          style={{ color: "var(--subtle)" }}
        >
          {title}
          <span
            className="ml-2 tabular-nums"
            style={{ color: "var(--muted)" }}
          >
            {keys.length}
          </span>
        </div>
        <button
          type="button"
          className="text-[11px] font-medium"
          style={{ color: "var(--muted)" }}
        >
          {expanded ? "Hide" : "Show"}
        </button>
      </div>
      {subtitle && (
        <div
          className="px-6 pb-2 text-[11.5px] max-w-[620px]"
          style={{ color: "var(--muted)" }}
        >
          {subtitle}
        </div>
      )}
      {expanded &&
        keys.map((k) => (
          <FieldRow
            key={k.name}
            label={k.name}
            defaultValue={k.defaults[0]}
          >
            <GenericField k={k} />
          </FieldRow>
        ))}
    </>
  );
}

function GenericField({ k }: { k: ConfigKey }) {
  const cfg = useConfigCtx();
  const value = cfg.get(k.name);

  switch (k.widget.kind) {
    case "bool": {
      const on = value === "true";
      return (
        <Toggle value={on} onChange={(v) => cfg.set(k.name, String(v))} />
      );
    }
    case "number": {
      const n = parseFloat(value);
      return (
        <Stepper
          value={Number.isFinite(n) ? n : parseFloat(k.defaults[0] ?? "0") || 0}
          onChange={(v) => cfg.set(k.name, String(v))}
          min={-9999}
          max={9999}
          step={1}
        />
      );
    }
    case "enum": {
      const opts = k.widget.values;
      if (opts.length > 0 && opts.length <= 6) {
        return (
          <Segmented
            value={value || k.defaults[0] || opts[0]}
            onChange={(v) => cfg.set(k.name, v)}
            options={opts}
          />
        );
      }
      return (
        <select
          value={value}
          onChange={(e) => cfg.set(k.name, e.target.value)}
          className="px-2.5 py-1.5 rounded-md text-[12px] outline-none"
          style={{
            background: "var(--input-bg)",
            border: "1px solid var(--border)",
            color: "var(--fg)",
            fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace',
          }}
        >
          <option value="">(unset)</option>
          {opts.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      );
    }
    case "color":
      return (
        <>
          <ColorSwatch
            value={value || "#000000"}
            onChange={(v) => cfg.set(k.name, v)}
            size={22}
          />
          <TextInput
            value={value}
            onChange={(v) => cfg.set(k.name, v)}
            placeholder={k.defaults[0] ?? "#ffffff"}
            width={130}
          />
        </>
      );
    default:
      return (
        <TextInput
          value={value}
          onChange={(v) => cfg.set(k.name, v)}
          placeholder={k.defaults[0]}
          width={260}
        />
      );
  }
}
