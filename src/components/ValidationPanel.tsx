import type { ValidationResult } from "@/types";

interface Props {
  result: ValidationResult | null;
}

export function ValidationPanel({ result }: Props) {
  if (!result) {
    return (
      <div className="p-4 text-xs text-zinc-400 leading-relaxed">
        Click <b className="text-zinc-200">Validate</b> to dry-run your changes through{" "}
        <code className="text-zinc-200">ghostty +validate-config</code>.
      </div>
    );
  }
  return (
    <div className="p-4 text-xs">
      <div
        className={
          "mb-2 font-semibold " +
          (result.ok ? "text-green-300" : "text-red-300")
        }
      >
        {result.ok ? "Config is valid" : "Validation failed"}
      </div>
      <pre className="whitespace-pre-wrap font-mono text-zinc-200 chrome-input p-2 rounded">
        {result.message || "(no output)"}
      </pre>
    </div>
  );
}
