import { useEffect, useMemo, useRef } from "react";
import { Icon } from "@/components/Icon";
import { SECTIONS, sectionForKey, type SectionId } from "@/lib/sections";
import type { ConfigKey } from "@/types";

interface SidebarProps {
  active: SectionId;
  onSelect: (id: SectionId) => void;
  query: string;
  onQueryChange: (q: string) => void;
  connected: boolean;
  unsavedCount: number;
  schema: ConfigKey[];
  onShowBackups: () => void;
}

export function Sidebar({
  active,
  onSelect,
  query,
  onQueryChange,
  connected,
  unsavedCount,
  schema,
  onShowBackups,
}: SidebarProps) {
  const searchRef = useRef<HTMLInputElement>(null);

  // ⌘K focuses the search input from anywhere in the app.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const q = query.trim().toLowerCase();

  const filtered = q
    ? SECTIONS.filter((s) => s.label.toLowerCase().includes(q))
    : SECTIONS;

  const keyMatches = useMemo(() => {
    if (!q) return [];
    return schema
      .filter(
        (k) =>
          k.name.toLowerCase().includes(q) ||
          k.docs.toLowerCase().includes(q)
      )
      .slice(0, 20);
  }, [schema, q]);

  return (
    <aside
      className="w-full h-full flex flex-col"
      style={{ background: "var(--bg-2)" }}
    >
      <div className="p-2.5">
        <label
          className="flex items-center gap-2 h-[32px] px-2.5 rounded-md"
          style={{
            background: "var(--input-bg)",
            border: "1px solid var(--border)",
          }}
        >
          <Icon name="search" size={13} />
          <input
            ref={searchRef}
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape" && query) {
                e.preventDefault();
                onQueryChange("");
              }
            }}
            placeholder="Search sections & keys"
            className="flex-1 bg-transparent border-none outline-none text-[12px] text-fg placeholder:text-subtle"
          />
          {query ? (
            <button
              type="button"
              onClick={() => {
                onQueryChange("");
                searchRef.current?.focus();
              }}
              aria-label="Clear search"
              title="Clear (Esc)"
              className="inline-flex items-center justify-center w-[18px] h-[18px] rounded"
              style={{ color: "var(--muted)" }}
            >
              <Icon name="x" size={12} />
            </button>
          ) : (
            <span
              className="text-[10px] font-mono px-1.5 py-0.5 rounded"
              style={{
                background: "var(--surface-raised)",
                color: "var(--muted)",
                border: "1px solid var(--border)",
              }}
            >
              ⌘K
            </span>
          )}
        </label>
      </div>

      <div
        className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-[0.08em]"
        style={{ color: "var(--subtle)" }}
      >
        Sections
      </div>

      <nav className="flex-1 overflow-y-auto scroll-y px-2 pb-2 space-y-0.5">
        {filtered.map((s) => {
          const isActive = s.id === active;
          return (
            <button
              key={s.id}
              onClick={() => onSelect(s.id)}
              className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-md text-[12.5px] transition-colors"
              style={{
                background: isActive ? "var(--surface-active)" : "transparent",
                color: isActive ? "var(--accent)" : "var(--fg)",
                fontWeight: isActive ? 600 : 500,
              }}
            >
              <Icon name={s.icon} size={14} stroke={1.7} />
              <span>{s.label}</span>
              <span
                className="ml-auto text-[11px] tabular-nums"
                style={{ color: "var(--subtle)" }}
              >
                {s.count}
              </span>
            </button>
          );
        })}
        {filtered.length === 0 && (
          <div className="px-3 py-3 text-[12px]" style={{ color: "var(--muted)" }}>
            No matching sections
          </div>
        )}

        {keyMatches.length > 0 && (
          <>
            <div
              className="mt-2 px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-[0.08em] border-t"
              style={{ color: "var(--subtle)", borderColor: "var(--border)" }}
            >
              Keys matching “{q}”
            </div>
            <ul className="space-y-0.5">
              {keyMatches.map((k) => {
                const sec = sectionForKey(k);
                return (
                  <li key={k.name}>
                    <button
                      onClick={() => onSelect(sec)}
                      className="w-full text-left px-3 py-1 rounded-md text-[11.5px] font-mono"
                      style={{
                        background: "transparent",
                        color: "var(--fg)",
                      }}
                    >
                      <span>{k.name}</span>
                      <span
                        className="ml-2 text-[10px]"
                        style={{ color: "var(--subtle)" }}
                      >
                        → {SECTIONS.find((s) => s.id === sec)?.label}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </nav>

      <div
        className="border-t border-border px-3 py-2.5 text-[11px] flex items-center gap-2"
        style={{ color: "var(--muted)" }}
      >
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-1.5">
            <span
              className="inline-block w-1.5 h-1.5 rounded-full"
              style={{ background: connected ? "var(--success)" : "var(--muted)" }}
            />
            <span>{connected ? "ghostty connected" : "no ghostty process"}</span>
          </div>
          <div>
            {unsavedCount === 0
              ? "no unsaved changes"
              : `${unsavedCount} change${unsavedCount === 1 ? "" : "s"} unsaved`}
          </div>
        </div>
        <button
          type="button"
          onClick={onShowBackups}
          className="flex-shrink-0 px-2 py-1 rounded-md text-[11px]"
          style={{
            background: "var(--surface-raised)",
            border: "1px solid var(--border)",
            color: "var(--fg)",
          }}
          title="Restore a previous config from auto-backup"
        >
          Backups
        </button>
      </div>
    </aside>
  );
}
