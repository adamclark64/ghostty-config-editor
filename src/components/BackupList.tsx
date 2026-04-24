import { createPortal } from "react-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Icon } from "@/components/Icon";
import { useBackups } from "@/hooks/useSchema";
import { api } from "@/api/tauri";

interface Props {
  onClose: () => void;
}

function formatStamp(s: string) {
  const m = s.match(/^(\d{4})(\d{2})(\d{2})-(\d{2})(\d{2})(\d{2})/);
  if (!m) return s;
  return `${m[1]}-${m[2]}-${m[3]} ${m[4]}:${m[5]}:${m[6]}`;
}

export function BackupList({ onClose }: Props) {
  const { data: backups, refetch } = useBackups();
  const qc = useQueryClient();

  async function restore(path: string) {
    await api.restoreBackup(path);
    await qc.invalidateQueries({ queryKey: ["config"] });
    await refetch();
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.65)" }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="rounded-xl overflow-hidden flex flex-col"
        style={{
          width: 720,
          maxHeight: "80vh",
          background: "var(--surface-raised)",
          border: "1px solid var(--border)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
        }}
      >
        <div
          className="flex items-center justify-between px-4 py-3 border-b"
          style={{ borderColor: "var(--border)" }}
        >
          <h2 className="text-[14px] font-semibold" style={{ color: "var(--fg)" }}>
            Backups
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded"
            style={{ color: "var(--muted)" }}
            aria-label="Close backups"
          >
            <Icon name="x" size={14} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto scroll-y">
          {backups && backups.length > 0 ? (
            backups.map((b, i) => (
              <div
                key={b.path}
                className="flex items-center gap-3 px-4 py-2.5 border-b"
                style={{
                  borderColor:
                    i === backups.length - 1 ? "transparent" : "var(--border)",
                }}
              >
                <div className="flex-1 min-w-0">
                  <div
                    className="text-[13px] font-mono"
                    style={{ color: "var(--fg)" }}
                  >
                    {formatStamp(b.stamp)}
                  </div>
                  <div
                    className="text-[11px] font-mono truncate"
                    style={{ color: "var(--subtle)" }}
                  >
                    {b.path}
                  </div>
                </div>
                <div
                  className="text-[11px] font-mono tabular-nums"
                  style={{ color: "var(--muted)" }}
                >
                  {(b.size / 1024).toFixed(1)} KB
                </div>
                <button
                  type="button"
                  onClick={() => restore(b.path)}
                  className="px-3 py-1 rounded-md text-[12px]"
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    color: "var(--fg)",
                  }}
                >
                  Restore
                </button>
              </div>
            ))
          ) : (
            <div
              className="p-6 text-[12.5px]"
              style={{ color: "var(--muted)" }}
            >
              No backups yet. Backups are created automatically on save.
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
