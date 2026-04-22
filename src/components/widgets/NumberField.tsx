interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

export function NumberField({ value, onChange, placeholder }: Props) {
  return (
    <input
      type="text"
      inputMode="decimal"
      className="w-40 rounded border border-zinc-700 chrome-input text-zinc-100 placeholder-zinc-500 px-2 py-1 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-amber-400/70"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
