interface Props {
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}

export function ListField({ values, onChange, placeholder }: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      {values.map((v, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            type="text"
            className="flex-1 rounded border border-zinc-700 chrome-input text-zinc-100 placeholder-zinc-500 px-2 py-1 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-amber-400/70"
            value={v}
            placeholder={placeholder}
            onChange={(e) => {
              const next = values.slice();
              next[i] = e.target.value;
              onChange(next);
            }}
          />
          <button
            type="button"
            className="text-xs text-zinc-500 hover:text-red-300 px-2"
            onClick={() => onChange(values.filter((_, j) => j !== i))}
            aria-label="remove"
          >
            ✕
          </button>
        </div>
      ))}
      <button
        type="button"
        className="self-start text-xs text-amber-300 hover:text-amber-200 mt-1"
        onClick={() => onChange([...values, ""])}
      >
        + add entry
      </button>
    </div>
  );
}
