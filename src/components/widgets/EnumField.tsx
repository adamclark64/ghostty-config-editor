interface Props {
  value: string;
  onChange: (v: string) => void;
  values: string[];
}

export function EnumField({ value, onChange, values }: Props) {
  const known = values.includes(value);
  return (
    <div className="flex items-center gap-2">
      <select
        className="rounded border border-zinc-700 chrome-input text-zinc-100 px-2 py-1 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-amber-400/70"
        value={known ? value : ""}
        onChange={(e) => onChange(e.target.value)}
      >
        {!known && <option value="">(custom)</option>}
        {values.map((v) => (
          <option key={v} value={v}>
            {v}
          </option>
        ))}
      </select>
      {!known && value !== "" && (
        <code className="text-xs text-amber-300">= {value}</code>
      )}
    </div>
  );
}
