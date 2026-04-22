interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  monospace?: boolean;
}

export function TextField({ value, onChange, placeholder, monospace = true }: Props) {
  return (
    <input
      type="text"
      className={`w-full rounded border border-zinc-700 chrome-input text-zinc-100 placeholder-zinc-500 px-2 py-1 text-sm ${monospace ? "font-mono" : ""} focus:outline-none focus:ring-1 focus:ring-amber-400/70`}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
