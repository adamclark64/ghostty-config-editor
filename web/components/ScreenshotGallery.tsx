"use client";

import Image from "next/image";
import { useGallery } from "./GalleryProvider";

export type GalleryShot = {
  title: string;
  body: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  accent: string;
  exists: boolean;
};

export function ScreenshotGallery({ shots }: { shots: GalleryShot[] }) {
  const { openAt, has } = useGallery();

  return (
    <div className="flex flex-col gap-20 md:gap-28">
      {shots.map((shot, i) => {
        const clickable = shot.exists && has(shot.src);
        return (
          <div
            key={shot.src}
            className={`grid items-center gap-10 md:grid-cols-2 md:gap-16 ${
              i % 2 === 1 ? "md:[&>div:first-child]:order-2" : ""
            }`}
          >
            <div className="overflow-hidden rounded-2xl border border-border-strong bg-surface shadow-xl">
              {clickable ? (
                <button
                  type="button"
                  onClick={() => openAt(shot.src)}
                  className="group block w-full cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  aria-label={`Open larger view: ${shot.title}`}
                >
                  <Image
                    src={shot.src}
                    alt={shot.alt}
                    width={shot.width}
                    height={shot.height}
                    className="h-auto w-full transition-transform duration-300 group-hover:scale-[1.015]"
                  />
                </button>
              ) : shot.exists ? (
                <Image
                  src={shot.src}
                  alt={shot.alt}
                  width={shot.width}
                  height={shot.height}
                  className="h-auto w-full"
                />
              ) : (
                <ScreenshotPlaceholder label={shot.accent} />
              )}
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
        );
      })}
    </div>
  );
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
