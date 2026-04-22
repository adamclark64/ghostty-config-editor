import clsx from "clsx";

interface Props {
  groups: { name: string; count: number; dirtyCount: number }[];
  selected: string | null;
  onSelect: (name: string | null) => void;
}

export function KeyGroupList({ groups, selected, onSelect }: Props) {
  return (
    <div className="py-2">
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={clsx(
          "w-full text-left px-4 py-1.5 text-sm",
          selected === null
            ? "bg-zinc-800 text-zinc-100"
            : "text-zinc-300 hover:bg-zinc-800/60 hover:text-zinc-100"
        )}
      >
        All keys
      </button>
      <div className="mt-1 border-t border-zinc-800" />
      {groups.map((g) => (
        <button
          key={g.name}
          type="button"
          onClick={() => onSelect(g.name)}
          className={clsx(
            "w-full text-left px-4 py-1.5 text-sm flex items-center justify-between",
            selected === g.name
              ? "bg-zinc-800 text-zinc-100"
              : "text-zinc-300 hover:bg-zinc-800/60 hover:text-zinc-100"
          )}
        >
          <span>{g.name}</span>
          <span
            className={clsx(
              "text-[11px] ml-2 font-mono",
              g.dirtyCount > 0 ? "text-amber-300" : "text-zinc-500"
            )}
          >
            {g.dirtyCount > 0 ? `${g.dirtyCount}•${g.count}` : g.count}
          </span>
        </button>
      ))}
    </div>
  );
}
