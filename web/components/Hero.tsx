import Image from "next/image";
import type { LatestRelease } from "@/lib/release";
import { repoUrl } from "@/lib/release";
import { screenshotExists } from "@/lib/screenshots";
import { DownloadButtons } from "./DownloadButtons";
import { HeroImageButton } from "./HeroImageButton";
import { HERO_SHOT } from "@/lib/shots";

type Props = {
  release: LatestRelease;
};

const HERO_SRC = "/screenshots/hero.png";

export function Hero({ release }: Props) {
  const hasHero = screenshotExists(HERO_SRC);

  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% -20%, color-mix(in srgb, var(--color-accent) 22%, transparent), transparent 60%)",
        }}
      />
      <div className="mx-auto flex max-w-6xl flex-col items-start gap-12 px-6 pb-16 pt-24 sm:pt-32 md:pb-24 lg:flex-row lg:items-center lg:gap-16">
        <div className="flex-1">
          <div className="mb-6 flex items-center gap-3">
            <Image
              src="/icon-256.png"
              alt="Ghostty Config Editor icon"
              width={56}
              height={56}
              priority
              className="rounded-2xl"
            />
            <span className="text-sm font-medium text-muted">
              Ghostty Config Editor
            </span>
          </div>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
            A visual editor for your{" "}
            <span className="text-accent">Ghostty</span> terminal config.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
            Edit Ghostty&apos;s ~580 config keys in a real UI: live preview,
            theme gallery, color picker, keybind editor, and timestamped
            backups. Never hand-edit a config file again.
          </p>
          <div className="mt-10">
            <DownloadButtons release={release} />
          </div>
          <div className="mt-6 flex items-center gap-4 text-sm text-muted">
            <a
              href={repoUrl}
              className="inline-flex items-center gap-2 text-muted transition hover:text-fg"
            >
              <GitHubIcon className="h-4 w-4" />
              <span>View source on GitHub</span>
            </a>
            <span className="text-subtle">·</span>
            <span>Free and open source · MIT</span>
          </div>
        </div>
        <div className="w-full flex-1 lg:max-w-[640px]">
          <HeroShot hasHero={hasHero} />
        </div>
      </div>
    </section>
  );
}

function HeroShot({ hasHero }: { hasHero: boolean }) {
  return (
    <div className="relative">
      <div
        className="absolute -inset-4 -z-10 rounded-3xl opacity-50 blur-2xl"
        style={{
          background:
            "linear-gradient(135deg, color-mix(in srgb, var(--color-accent) 40%, transparent), transparent 60%)",
        }}
        aria-hidden
      />
      {hasHero ? (
        <div className="overflow-hidden rounded-2xl border border-border-strong shadow-2xl">
          <HeroImageButton
            src={HERO_SHOT.src}
            alt={HERO_SHOT.alt}
            width={HERO_SHOT.width}
            height={HERO_SHOT.height}
          />
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border-strong bg-surface shadow-2xl">
          <div className="flex items-center gap-2 border-b border-border bg-bg-2 px-4 py-3">
            <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
            <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
            <span className="h-3 w-3 rounded-full bg-[#28c840]" />
            <span className="ml-3 text-xs text-muted">
              Ghostty Config Editor
            </span>
          </div>
          <div className="relative aspect-[16/10] bg-bg">
            <PlaceholderHeroIllustration />
          </div>
        </div>
      )}
    </div>
  );
}

function PlaceholderHeroIllustration() {
  return (
    <div className="absolute inset-0 grid grid-cols-[200px_1fr_240px] text-xs">
      <div className="border-r border-border bg-bg-2 p-3">
        <div className="mb-3 h-6 rounded-md bg-surface-raised" />
        {[
          "font-family",
          "font-size",
          "background",
          "foreground",
          "cursor-color",
          "window-padding-x",
          "keybind",
          "theme",
          "scrollback-limit",
        ].map((k, i) => (
          <div
            key={k}
            className="mb-1 truncate rounded px-2 py-1 font-mono text-[10px]"
            style={{
              background: i === 2 ? "var(--color-surface-raised)" : "transparent",
              color: i === 2 ? "var(--color-accent)" : "var(--color-muted)",
            }}
          >
            {k}
          </div>
        ))}
      </div>
      <div className="p-4">
        <div className="mb-2 text-[10px] uppercase tracking-wider text-muted">
          background
        </div>
        <div className="mb-4 flex items-center gap-2">
          <div className="h-8 w-8 rounded-md border border-border bg-[#1e1e2e]" />
          <div className="font-mono text-sm">#1e1e2e</div>
        </div>
        <div className="mb-2 text-[10px] uppercase tracking-wider text-muted">
          preview
        </div>
        <div className="rounded-md border border-border bg-[#1e1e2e] p-3 font-mono text-[10px] text-[#cdd6f4]">
          <div>
            <span className="text-[#a6e3a1]">$</span> ghostty --version
          </div>
          <div className="text-[#bac2de]">ghostty 1.0.0</div>
          <div className="mt-1">
            <span className="text-[#a6e3a1]">$</span>{" "}
            <span className="opacity-60">_</span>
          </div>
        </div>
      </div>
      <div className="border-l border-border bg-bg-2 p-3">
        <div className="mb-2 text-[10px] uppercase tracking-wider text-muted">
          Themes
        </div>
        {[
          ["Catppuccin Mocha", "#1e1e2e"],
          ["Tokyo Night", "#1a1b26"],
          ["Rosé Pine", "#191724"],
          ["Gruvbox Dark", "#282828"],
        ].map(([name, color]) => (
          <div
            key={name}
            className="mb-1 flex items-center gap-2 rounded px-2 py-1.5"
          >
            <div
              className="h-3 w-3 rounded-sm border border-border"
              style={{ background: color }}
            />
            <span className="truncate text-[10px]">{name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-2c-3.2.7-3.87-1.36-3.87-1.36-.52-1.32-1.27-1.68-1.27-1.68-1.04-.71.08-.69.08-.69 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.69 1.25 3.35.96.1-.74.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 5.78 0c2.21-1.49 3.18-1.18 3.18-1.18.62 1.59.23 2.76.11 3.05.74.81 1.18 1.84 1.18 3.1 0 4.42-2.69 5.39-5.26 5.68.41.36.78 1.05.78 2.12v3.14c0 .31.21.67.8.56C20.21 21.38 23.5 17.07 23.5 12 23.5 5.65 18.35.5 12 .5Z"
      />
    </svg>
  );
}
