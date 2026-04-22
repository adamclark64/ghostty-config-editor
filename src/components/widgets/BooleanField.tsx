interface Props {
  value: string;
  onChange: (v: string) => void;
}

export function BooleanField({ value, onChange }: Props) {
  const isTrue = value === "true";
  return (
    <label className="inline-flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={isTrue}
        onChange={(e) => onChange(e.target.checked ? "true" : "false")}
        className="w-4 h-4 accent-amber-400"
      />
      <span className="text-sm text-zinc-200 font-mono">
        {isTrue ? "true" : "false"}
      </span>
    </label>
  );
}
