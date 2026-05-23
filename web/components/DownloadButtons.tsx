import type { LatestRelease } from "@/lib/release";

type Props = {
  release: LatestRelease;
  variant?: "hero" | "compact";
};

export function DownloadButtons({ release, variant = "hero" }: Props) {
  const { aarch64DmgUrl, x64DmgUrl, releasePageUrl, version, tagName } =
    release;

  const hasDirectLinks = Boolean(aarch64DmgUrl && x64DmgUrl);
  const isHero = variant === "hero";

  if (!hasDirectLinks) {
    return (
      <div className="flex flex-col items-start gap-3">
        <a
          href={releasePageUrl}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-base font-semibold text-[#1a0a2e] transition hover:bg-accent-strong"
        >
          Download for macOS
          <span aria-hidden>↓</span>
        </a>
        <span className="text-sm text-muted">
          Pick the right build on the GitHub Releases page.
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start gap-3">
      <div className="flex flex-wrap gap-3">
        <a
          href={aarch64DmgUrl!}
          className="group inline-flex items-center gap-3 rounded-full bg-accent px-6 py-3 text-base font-semibold text-[#1a0a2e] shadow-[0_10px_40px_-12px_rgba(198,160,246,0.45)] transition hover:bg-accent-strong"
        >
          <span>Download for Apple Silicon</span>
          <span className="text-xs font-medium opacity-70">.dmg</span>
        </a>
        <a
          href={x64DmgUrl!}
          className="inline-flex items-center gap-3 rounded-full border border-border-strong bg-surface px-6 py-3 text-base font-semibold text-fg transition hover:border-accent hover:text-accent"
        >
          <span>Download for Intel</span>
          <span className="text-xs font-medium text-muted">.dmg</span>
        </a>
      </div>
      {isHero && (
        <p className="text-sm text-muted">
          macOS · {tagName} ·{" "}
          <a
            href={releasePageUrl}
            className="underline decoration-dotted underline-offset-4 hover:text-fg"
          >
            release notes
          </a>{" "}
          · v{version}
        </p>
      )}
    </div>
  );
}
