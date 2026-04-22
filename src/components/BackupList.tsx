import { useBackups } from "@/hooks/useSchema";
import { api } from "@/api/tauri";
import { useQueryClient } from "@tanstack/react-query";

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

  return (
    <div className="absolute inset-0 bg-black/75 flex items-center justify-center z-20">
      <div className="chrome-panel rounded-lg border border-zinc-700 w-[700px] max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
          <h2 className="text-sm font-semibold text-zinc-100">Backups</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-100"
          >
            ✕
          </button>
        </div>
        <div className="flex-1 scroll-y">
          {backups && backups.length > 0 ? (
            backups.map((b) => (
              <div
                key={b.path}
                className="flex items-center gap-3 px-4 py-2 border-b border-zinc-800 hover:bg-zinc-800/40"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-mono text-zinc-100">
                    {formatStamp(b.stamp)}
                  </div>
                  <div className="text-[11px] text-zinc-500 font-mono truncate">
                    {b.path}
                  </div>
                </div>
                <div className="text-[11px] text-zinc-500 font-mono">
                  {(b.size / 1024).toFixed(1)} KB
                </div>
                <button
                  type="button"
                  onClick={() => restore(b.path)}
                  className="px-3 py-1 text-xs rounded border border-zinc-700 text-zinc-200 hover:bg-zinc-800"
                >
                  Restore
                </button>
              </div>
            ))
          ) : (
            <div className="p-6 text-sm text-zinc-400">
              No backups yet. Backups are created automatically on save.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
