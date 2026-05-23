import { repoUrl } from "@/lib/release";

const ITEMS: { q: string; a: React.ReactNode }[] = [
  {
    q: "Does it modify my real config file?",
    a: (
      <>
        Yes — that&apos;s the point. But every save first writes a timestamped{" "}
        <span className="font-mono">.bak-YYYYMMDD-HHMMSS</span> next to the
        original, so you can roll back from inside the app at any time.
      </>
    ),
  },
  {
    q: "Where do backups live?",
    a: (
      <>
        Right next to your config file (e.g.{" "}
        <span className="font-mono">~/.config/ghostty/config.bak-…</span>). The
        in-app backup browser lists them all and restores with one click.
      </>
    ),
  },
  {
    q: "Linux and Windows?",
    a: (
      <>
        The app builds for all three Tauri targets, but only macOS DMGs are
        published right now. If you need Linux or Windows binaries, open an
        issue on GitHub.
      </>
    ),
  },
  {
    q: "Does it need Ghostty to be installed?",
    a: (
      <>
        Yes — the schema of ~580 keys is parsed from your installed Ghostty
        binary, so the editor stays in sync with whatever version you have.
      </>
    ),
  },
  {
    q: "Is it really free?",
    a: (
      <>
        Free and open source under MIT. Source, issues, and releases all live
        at{" "}
        <a
          href={repoUrl}
          className="underline decoration-dotted underline-offset-4 hover:text-fg"
        >
          github.com/adamclark64/ghostty-config-editor
        </a>
        .
      </>
    ),
  },
];

export function Faq() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-16 md:py-24">
      <h2 className="mb-10 text-3xl font-semibold tracking-tight md:text-4xl">
        Questions.
      </h2>
      <div className="flex flex-col divide-y divide-border">
        {ITEMS.map((it) => (
          <details key={it.q} className="group py-5">
            <summary className="flex cursor-pointer items-start justify-between gap-4 text-base font-medium text-fg [&::-webkit-details-marker]:hidden">
              <span>{it.q}</span>
              <span className="mt-1 text-muted transition group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-muted">{it.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
