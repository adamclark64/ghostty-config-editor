import { repoUrl, releasesUrl } from "@/lib/release";

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-6 py-12 text-sm text-muted md:flex-row md:items-center">
        <div>
          <span className="font-medium text-fg">Ghostty Config Editor</span> —
          a community project, not affiliated with Ghostty.
        </div>
        <div className="flex flex-wrap gap-6">
          <a href={repoUrl} className="transition hover:text-fg">
            GitHub
          </a>
          <a href={releasesUrl} className="transition hover:text-fg">
            Releases
          </a>
          <a
            href={`${repoUrl}/issues`}
            className="transition hover:text-fg"
          >
            Issues
          </a>
          <a
            href="https://ghostty.org"
            target="_blank"
            rel="noreferrer"
            className="transition hover:text-fg"
          >
            Ghostty.org
          </a>
        </div>
      </div>
    </footer>
  );
}
