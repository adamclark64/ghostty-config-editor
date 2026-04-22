interface Props {
  value: string;
  onChange: (v: string) => void;
}

function normalize(input: string): string {
  const trimmed = input.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(trimmed)) return trimmed.toLowerCase();
  if (/^#[0-9a-fA-F]{3}$/.test(trimmed)) {
    const [, r, g, b] = trimmed.match(/^#(.)(.)(.)$/)!;
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  return "#000000";
}

export function ColorField({ value, onChange }: Props) {
  const swatch = normalize(value);
  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        className="h-7 w-10 rounded border border-zinc-700 cursor-pointer"
        value={swatch}
        onChange={(e) => onChange(e.target.value)}
      />
      <input
        type="text"
        className="w-32 rounded border border-zinc-700 chrome-input text-zinc-100 placeholder-zinc-500 px-2 py-1 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-amber-400/70"
        value={value}
        placeholder="#rrggbb"
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
