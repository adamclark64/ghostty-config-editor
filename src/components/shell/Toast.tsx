interface ToastProps {
  message: string;
  tone?: "info" | "success" | "error";
}

export function Toast({ message, tone = "info" }: ToastProps) {
  const color =
    tone === "success"
      ? "var(--success)"
      : tone === "error"
      ? "var(--danger)"
      : "var(--accent)";
  return (
    <div
      className="fixed left-1/2 bottom-6 -translate-x-1/2 px-4 py-2 rounded-lg text-[12.5px]"
      style={{
        background: "var(--surface-raised)",
        border: `1px solid ${color}`,
        color: "var(--fg)",
        boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
        zIndex: 60,
      }}
    >
      {message}
    </div>
  );
}
