interface TerminalPreviewProps {
  background: string;
  foreground: string;
  cursorColor: string;
  palette: string[];
  fontFamily?: string;
  size?: "sm" | "md" | "lg";
  blink?: boolean;
  promptUser?: string;
  promptHost?: string;
  /** When true, fill the parent's full height (parent must have a fixed height). */
  fillHeight?: boolean;
}

/**
 * Renders a fake `eza -la` session so the user can see the colour palette
 * and font stack in context. Not a real terminal — purely visual.
 */
export function TerminalPreview({
  background,
  foreground,
  cursorColor,
  palette,
  fontFamily,
  size = "md",
  blink = true,
  promptUser = "you",
  promptHost = "mac",
  fillHeight = false,
}: TerminalPreviewProps) {
  const fontSize = size === "sm" ? 10 : size === "lg" ? 14 : 12;
  const family =
    fontFamily ||
    'ui-monospace, "JetBrains Mono", "SF Mono", Menlo, monospace';
  const bg = background || "#1e1e2e";
  const fg = foreground || "#cdd6f4";
  const cur = cursorColor || "#f5e0dc";
  const c = palette;

  const pick = (i: number, fb: string) => c[i] ?? fb;

  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{
        background: bg,
        color: fg,
        fontFamily: family,
        fontSize,
        lineHeight: 1.55,
        padding: 10,
        height: fillHeight ? "100%" : undefined,
      }}
    >
      <div>
        <span style={{ color: pick(2, "#a6e3a1") }}>
          {promptUser}@{promptHost}
        </span>
        <span>:</span>
        <span style={{ color: pick(4, "#89b4fa") }}>~/dev</span>
        <span style={{ color: pick(5, "#f5c2e7") }}>$</span> eza -la --icons
      </div>
      <div className="mt-0.5">
        <span style={{ color: pick(4, "#89b4fa") }}>drwx</span>
        <span style={{ opacity: 0.6 }}>------ </span>
        <span style={{ color: pick(3, "#f9e2af") }}>2.1k</span>{" "}
        <span style={{ color: pick(1, "#f38ba8") }}>{promptUser}</span> Apr 23{" "}
        <span style={{ color: pick(4, "#89b4fa") }}>📁 .config</span>
      </div>
      <div>
        <span style={{ color: pick(4, "#89b4fa") }}>-rw-</span>
        <span style={{ opacity: 0.6 }}>r--r-- </span>
        <span style={{ color: pick(3, "#f9e2af") }}>256</span>{" "}
        <span style={{ color: pick(1, "#f38ba8") }}>{promptUser}</span> Apr 23{" "}
        <span style={{ color: pick(6, "#94e2d5") }}>config.toml</span>
      </div>
      <div>
        <span style={{ color: pick(4, "#89b4fa") }}>-rwx</span>
        <span style={{ opacity: 0.6 }}>r-xr-x </span>
        <span style={{ color: pick(3, "#f9e2af") }}>12k</span>{" "}
        <span style={{ color: pick(1, "#f38ba8") }}>{promptUser}</span> Apr 21{" "}
        <span style={{ color: pick(2, "#a6e3a1") }}>run.sh</span>
      </div>
      <div className="mt-1">
        <span style={{ color: pick(2, "#a6e3a1") }}>
          {promptUser}@{promptHost}
        </span>
        :
        <span style={{ color: pick(4, "#89b4fa") }}>~/dev</span>
        <span style={{ color: pick(5, "#f5c2e7") }}>$</span>{" "}
        <span
          style={{
            display: "inline-block",
            width: fontSize * 0.6,
            height: fontSize * 1.1,
            background: cur,
            verticalAlign: "text-bottom",
            animation: blink
              ? "cursor-blink 1s steps(2) infinite"
              : undefined,
          }}
        />
      </div>
    </div>
  );
}
