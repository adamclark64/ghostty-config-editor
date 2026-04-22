import { useThemes } from "@/hooks/useSchema";

interface Props {
  value: string;
  onChange: (v: string) => void;
}

export function ThemePicker({ value, onChange }: Props) {
  const { data: themes } = useThemes();
  const listId = "ghostty-themes";
  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        list={listId}
        className="w-96 rounded border border-zinc-700 chrome-input text-zinc-100 placeholder-zinc-500 px-2 py-1 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-amber-400/70"
        value={value}
        placeholder="e.g. Catppuccin Mocha"
        onChange={(e) => onChange(e.target.value)}
      />
      <datalist id={listId}>
        {(themes ?? []).map((t) => (
          <option key={t} value={t} />
        ))}
      </datalist>
      <span className="text-[11px] text-zinc-500 font-mono">
        {themes ? `${themes.length} available` : "—"}
      </span>
    </div>
  );
}
