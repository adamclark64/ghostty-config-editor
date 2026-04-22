import { useFonts } from "@/hooks/useSchema";

interface Props {
  value: string;
  onChange: (v: string) => void;
}

export function FontPicker({ value, onChange }: Props) {
  const { data: fonts } = useFonts();
  const listId = "ghostty-fonts";
  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        list={listId}
        className="w-96 rounded border border-zinc-700 chrome-input text-zinc-100 placeholder-zinc-500 px-2 py-1 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-amber-400/70"
        value={value}
        placeholder="(system default)"
        onChange={(e) => onChange(e.target.value)}
      />
      <datalist id={listId}>
        {(fonts ?? []).map((f) => (
          <option key={f} value={f} />
        ))}
      </datalist>
    </div>
  );
}
