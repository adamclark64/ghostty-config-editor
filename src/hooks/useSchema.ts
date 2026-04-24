import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/tauri";

export function useSchema() {
  return useQuery({
    queryKey: ["schema"],
    queryFn: api.getSchema,
    staleTime: Infinity,
  });
}

export function useConfigPaths() {
  return useQuery({
    queryKey: ["config-paths"],
    queryFn: api.getConfigPath,
  });
}

export function useThemes() {
  return useQuery({
    queryKey: ["themes"],
    queryFn: api.listThemes,
    staleTime: Infinity,
  });
}

export function useFonts() {
  return useQuery({
    queryKey: ["fonts"],
    queryFn: api.listFonts,
    staleTime: Infinity,
  });
}

export function useActions() {
  return useQuery({
    queryKey: ["actions"],
    queryFn: api.listActions,
    staleTime: Infinity,
  });
}

export function useBackups() {
  return useQuery({
    queryKey: ["backups"],
    queryFn: api.listBackups,
  });
}

export function useThemePreviews() {
  return useQuery({
    queryKey: ["theme-previews"],
    queryFn: api.listThemePreviews,
    staleTime: Infinity,
  });
}

/**
 * Themes from the iTerm2-Color-Schemes GitHub repo. Fetched and cached on
 * the Rust side (24h TTL); on first open this triggers a ~300-request fan-out
 * so the query can take a few seconds. Subsequent calls are instant.
 */
export function useRemoteThemes(enabled: boolean) {
  return useQuery({
    queryKey: ["remote-themes"],
    queryFn: api.listRemoteThemes,
    enabled,
    staleTime: Infinity,
  });
}

export function useSessionStatus() {
  return useQuery({
    queryKey: ["session-status"],
    queryFn: api.sessionStatus,
    refetchInterval: 2000, // keep the "experimenting" pill fresh
  });
}
