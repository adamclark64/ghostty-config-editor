import Image from "next/image";
import { screenshotExists } from "@/lib/screenshots";

type Shot = {
  title: string;
  body: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  accent: string;
};

const SHOTS: Shot[] = [
  {
    title: "Browse 463 built-in themes",
    body: "The Theme Gallery shows every community palette rendered with a sample prompt so you can compare side-by-side. Filter, click to preview, double-click to apply — or hit Random theme to roll the dice.",
    src: "/screenshots/theme-gallery.png",
    alt: "Theme gallery showing 463 built-in Ghostty themes",
    width: 2000,
    height: 1252,
    accent: "Themes",
  },
  {
    title: "Pick colors with feedback",
    body: "Edit base colors and the full ANSI palette with hex inputs and a swatch picker. The live preview re-renders as you type, and the contrast card flags any change that fails WCAG AA.",
    src: "/screenshots/color-editor.png",
    alt: "Color editor with ANSI palette and live preview pane showing WCAG contrast",
    width: 2000,
    height: 1252,
    accent: "Colors",
  },
  {
    title: "See every mono font on your system",
    body: "Pick from popular families like JetBrainsMono Nerd Font, Fira Code, or IBM Plex Mono — or any monospace family detected on your Mac. Each card previews ligatures and digits before you commit.",
    src: "/screenshots/font-picker.png",
    alt: "Font picker with cards previewing installed monospace families",
    width: 2000,
    height: 1252,
    accent: "Fonts",
  },
  {
    title: "Every key, even the obscure ones",
    body: "The Advanced section covers low-level knobs most users shouldn’t touch — but it’s there when you need it, with inline docs, type validation, and a warning banner so you know what you’re getting into.",
    src: "/screenshots/advanced.png",
    alt: "Advanced section with low-level configuration keys and a documentation tooltip",
    width: 2000,
    height: 1252,
    accent: "Advanced",
  },
];

export function ScreenshotRow() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16 md:py-24">
      <div className="mb-12 max-w-2xl">
        <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
          See it work.
        </h2>
        <p className="mt-4 text-lg text-muted">
          A few of the surfaces you spend the most time in.
        </p>
      </div>
      <div className="flex flex-col gap-20 md:gap-28">
        {SHOTS.map((shot, i) => (
          <div
            key={shot.src}
            className={`grid items-center gap-10 md:grid-cols-2 md:gap-16 ${
              i % 2 === 1 ? "md:[&>div:first-child]:order-2" : ""
            }`}
          >
            <div className="overflow-hidden rounded-2xl border border-border-strong bg-surface shadow-xl">
              <ScreenshotImage shot={shot} />
            </div>
            <div>
              <h3 className="text-2xl font-semibold tracking-tight">
                {shot.title}
              </h3>
              <p className="mt-3 text-base leading-relaxed text-muted">
                {shot.body}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ScreenshotImage({ shot }: { shot: Shot }) {
  if (screenshotExists(shot.src)) {
    return (
      <Image
        src={shot.src}
        alt={shot.alt}
        width={shot.width}
        height={shot.height}
        className="h-auto w-full"
      />
    );
  }
  return <ScreenshotPlaceholder label={shot.accent} />;
}

function ScreenshotPlaceholder({ label }: { label: string }) {
  return (
    <div
      className="relative flex aspect-[16/10] items-center justify-center"
      style={{
        background:
          "radial-gradient(ellipse 70% 80% at 30% 20%, color-mix(in srgb, var(--color-accent) 18%, transparent), transparent), var(--color-bg-2)",
      }}
    >
      <div
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            "linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
        aria-hidden
      />
      <div className="relative z-10 flex flex-col items-center gap-3">
        <span className="rounded-full border border-border-strong bg-surface px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-muted">
          {label}
        </span>
        <span className="font-mono text-xs text-subtle">
          screenshot · 16:10
        </span>
      </div>
    </div>
  );
}
