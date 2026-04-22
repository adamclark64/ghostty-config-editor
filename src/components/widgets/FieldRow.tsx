import { ReactNode, useState } from "react";
import clsx from "clsx";
import type { ConfigKey } from "@/types";

interface FieldRowProps {
  def: ConfigKey;
  isDirty: boolean;
  children: ReactNode;
}

export function FieldRow({ def, isDirty, children }: FieldRowProps) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div
      className={clsx(
        "grid grid-cols-[220px_1fr_auto] gap-3 items-start px-4 py-3 border-b border-zinc-800",
        isDirty && "bg-amber-400/5"
      )}
    >
      <div className="flex flex-col">
        <code
          className={clsx(
            "font-mono text-sm leading-tight",
            isDirty ? "text-amber-300" : "text-zinc-100"
          )}
        >
          {def.name}
        </code>
        <span className="text-[11px] text-zinc-500 mt-0.5">{def.group}</span>
      </div>
      <div className="min-w-0">{children}</div>
      <button
        className="text-[11px] text-zinc-500 hover:text-zinc-200 self-start mt-1"
        onClick={() => setExpanded((e) => !e)}
        type="button"
      >
        {expanded ? "hide docs" : "docs"}
      </button>
      {expanded && def.docs.trim() && (
        <div className="col-span-3 mt-2 rounded chrome-input p-3 text-xs whitespace-pre-wrap text-zinc-300 font-mono leading-relaxed">
          {def.docs}
        </div>
      )}
    </div>
  );
}
