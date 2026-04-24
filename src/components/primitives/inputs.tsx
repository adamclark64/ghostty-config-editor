import type { ReactNode } from "react";

export function TextInput({
  value,
  onChange,
  placeholder,
  mono = true,
  width,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  mono?: boolean;
  width?: number | string;
}) {
  return (
    <input
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="px-2.5 py-1.5 rounded-md text-[12px] outline-none transition-colors focus:ring-0"
      style={{
        background: "var(--input-bg)",
        border: "1px solid var(--border)",
        color: "var(--fg)",
        fontFamily: mono
          ? 'ui-monospace, "SF Mono", Menlo, monospace'
          : "inherit",
        width,
        minWidth: 0,
      }}
    />
  );
}

export function Toggle({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      aria-pressed={value}
      className="relative w-[34px] h-5 rounded-full transition-colors"
      style={{
        background: value ? "var(--accent)" : "var(--input-bg)",
        border: "1px solid var(--border)",
      }}
    >
      <span
        className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"
        style={{
          left: value ? 15 : 1,
          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
        }}
      />
    </button>
  );
}

type SegOpt = string | { value: string; label: string };

export function Segmented({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: readonly SegOpt[];
}) {
  return (
    <div
      className="inline-flex rounded-md p-0.5"
      style={{
        background: "var(--input-bg)",
        border: "1px solid var(--border)",
      }}
    >
      {options.map((o) => {
        const v = typeof o === "string" ? o : o.value;
        const l = typeof o === "string" ? o : o.label;
        const active = v === value;
        return (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            className="px-2.5 py-1 rounded text-[11.5px] transition-colors"
            style={{
              background: active ? "var(--surface-raised)" : "transparent",
              color: active ? "var(--fg)" : "var(--muted)",
              fontWeight: active ? 600 : 500,
              boxShadow: active ? "0 1px 3px rgba(0,0,0,0.15)" : undefined,
            }}
          >
            {l}
          </button>
        );
      })}
    </div>
  );
}

export function Stepper({
  value,
  onChange,
  min = 0,
  max = 999,
  step = 1,
  unit,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}) {
  const clamp = (v: number) => Math.max(min, Math.min(max, v));
  return (
    <div
      className="inline-flex items-stretch rounded-md overflow-hidden"
      style={{
        background: "var(--input-bg)",
        border: "1px solid var(--border)",
      }}
    >
      <button
        type="button"
        onClick={() => onChange(clamp(value - step))}
        className="px-2 text-[14px]"
        style={{ color: "var(--muted)" }}
      >
        −
      </button>
      <input
        type="number"
        value={Number.isFinite(value) ? value : 0}
        min={min}
        max={max}
        step={step}
        onChange={(e) => {
          const n = parseFloat(e.target.value);
          if (!Number.isNaN(n)) onChange(clamp(n));
        }}
        className="w-14 bg-transparent border-0 outline-none text-center font-mono text-[12px]"
        style={{ color: "var(--fg)" }}
      />
      {unit && (
        <span
          className="flex items-center pr-2 text-[11px]"
          style={{ color: "var(--muted)" }}
        >
          {unit}
        </span>
      )}
      <button
        type="button"
        onClick={() => onChange(clamp(value + step))}
        className="px-2 text-[14px]"
        style={{ color: "var(--muted)" }}
      >
        +
      </button>
    </div>
  );
}

export function Slider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  width,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  width?: number | string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div
      className="relative flex items-center h-5"
      style={{ flex: 1, minWidth: 160, width }}
    >
      <div
        className="relative flex-1 h-1.5 rounded-full"
        style={{
          background: "var(--input-bg)",
          border: "1px solid var(--border)",
        }}
      >
        <div
          className="absolute left-0 top-0 bottom-0 rounded-full"
          style={{ width: `${pct}%`, background: "var(--accent)" }}
        />
        <div
          className="absolute w-3.5 h-3.5 rounded-full pointer-events-none"
          style={{
            left: `${pct}%`,
            top: "50%",
            transform: "translate(-50%, -50%)",
            background: "var(--fg)",
            boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
          }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-ew-resize"
        />
      </div>
    </div>
  );
}

export function Chip({
  children,
  active,
  onClick,
  title,
  style,
}: {
  children: ReactNode;
  active?: boolean;
  onClick?: () => void;
  title?: string;
  style?: React.CSSProperties;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono transition-colors"
      style={{
        background: active ? "color-mix(in oklab, var(--accent) 15%, transparent)" : "var(--input-bg)",
        color: active ? "var(--accent)" : "var(--fg)",
        border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
        ...style,
      }}
    >
      {children}
    </button>
  );
}
