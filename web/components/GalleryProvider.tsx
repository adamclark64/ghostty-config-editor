"use client";

import Image from "next/image";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type GalleryItem = {
  title: string;
  src: string;
  alt: string;
  width: number;
  height: number;
};

type GalleryCtx = {
  openAt: (src: string) => void;
  has: (src: string) => boolean;
};

const Ctx = createContext<GalleryCtx | null>(null);

export function useGallery(): GalleryCtx {
  const v = useContext(Ctx);
  if (!v) {
    return { openAt: () => {}, has: () => false };
  }
  return v;
}

export function GalleryProvider({
  items,
  children,
}: {
  items: GalleryItem[];
  children: ReactNode;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const indexBySrc = useMemo(() => {
    const m = new Map<string, number>();
    items.forEach((it, i) => m.set(it.src, i));
    return m;
  }, [items]);

  const openAt = useCallback(
    (src: string) => {
      const idx = indexBySrc.get(src);
      if (idx !== undefined) setOpenIndex(idx);
    },
    [indexBySrc],
  );
  const has = useCallback((src: string) => indexBySrc.has(src), [indexBySrc]);

  const close = useCallback(() => setOpenIndex(null), []);
  const prev = useCallback(() => {
    setOpenIndex((i) =>
      i === null ? null : (i - 1 + items.length) % items.length,
    );
  }, [items.length]);
  const next = useCallback(() => {
    setOpenIndex((i) => (i === null ? null : (i + 1) % items.length));
  }, [items.length]);

  useEffect(() => {
    if (openIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [openIndex, close, prev, next]);

  return (
    <Ctx.Provider value={{ openAt, has }}>
      {children}
      {openIndex !== null && (
        <Lightbox
          items={items}
          index={openIndex}
          onClose={close}
          onPrev={prev}
          onNext={next}
        />
      )}
    </Ctx.Provider>
  );
}

function Lightbox({
  items,
  index,
  onClose,
  onPrev,
  onNext,
}: {
  items: GalleryItem[];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const item = items[index];
  const hasMultiple = items.length > 1;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/85 backdrop-blur-sm"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-4 top-4 z-10 rounded-full border border-white/20 bg-black/40 p-2 text-white/90 transition hover:bg-black/60 hover:text-white"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          className="h-5 w-5"
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 6l12 12M18 6L6 18"
          />
        </svg>
      </button>

      {hasMultiple && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onPrev();
            }}
            aria-label="Previous image"
            className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/20 bg-black/40 p-3 text-white/90 transition hover:bg-black/60 hover:text-white sm:left-6"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="h-5 w-5"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 18l-6-6 6-6"
              />
            </svg>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            aria-label="Next image"
            className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/20 bg-black/40 p-3 text-white/90 transition hover:bg-black/60 hover:text-white sm:right-6"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="h-5 w-5"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 6l6 6-6 6"
              />
            </svg>
          </button>
        </>
      )}

      <div
        className="flex max-h-[90vh] max-w-[95vw] flex-col items-center gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="overflow-hidden rounded-xl border border-white/15 shadow-2xl">
          <Image
            src={item.src}
            alt={item.alt}
            width={item.width}
            height={item.height}
            priority
            className="h-auto max-h-[80vh] w-auto max-w-[95vw] object-contain"
          />
        </div>
        <div className="flex w-full items-center justify-between gap-4 text-sm text-white/80">
          <span className="font-medium">{item.title}</span>
          {hasMultiple && (
            <span className="font-mono text-xs text-white/60">
              {index + 1} / {items.length}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
