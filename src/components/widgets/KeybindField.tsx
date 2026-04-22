import { useActions } from "@/hooks/useSchema";

interface Props {
  values: string[];
  onChange: (values: string[]) => void;
}

export function KeybindField({ values, onChange }: Props) {
  const { data: actions } = useActions();
  const listId = "ghostty-actions";

  const split = (entry: string): [string, string] => {
    const eq = entry.indexOf("=");
    if (eq === -1) return [entry, ""];
    return [entry.slice(0, eq), entry.slice(eq + 1)];
  };

  return (
    <div className="flex flex-col gap-1.5">
      <datalist id={listId}>
        {(actions ?? []).map((a) => (
          <option key={a} value={a} />
        ))}
      </datalist>
      {values.map((v, i) => {
        const [trigger, action] = split(v);
        return (
          <div key={i} className="flex items-center gap-2">
            <input
              type="text"
              className="w-44 rounded border border-zinc-700 chrome-input text-zinc-100 placeholder-zinc-500 px-2 py-1 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-amber-400/70"
              value={trigger}
              placeholder="super+t"
              onChange={(e) => {
                const next = values.slice();
                next[i] = `${e.target.value}=${action}`;
                onChange(next);
              }}
            />
            <span className="text-zinc-500 text-xs">=</span>
            <input
              type="text"
              list={listId}
              className="flex-1 rounded border border-zinc-700 chrome-input text-zinc-100 placeholder-zinc-500 px-2 py-1 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-amber-400/70"
              value={action}
              placeholder="new_tab"
              onChange={(e) => {
                const next = values.slice();
                next[i] = `${trigger}=${e.target.value}`;
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
        );
      })}
      <button
        type="button"
        className="self-start text-xs text-amber-300 hover:text-amber-200 mt-1"
        onClick={() => onChange([...values, "="])}
      >
        + add keybind
      </button>
    </div>
  );
}
