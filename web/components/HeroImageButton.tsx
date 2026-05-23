"use client";

import Image from "next/image";
import { useGallery } from "./GalleryProvider";

type Props = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

export function HeroImageButton({ src, alt, width, height }: Props) {
  const { openAt, has } = useGallery();
  const clickable = has(src);

  if (!clickable) {
    return (
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority
        className="h-auto w-full"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => openAt(src)}
      className="group block w-full cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      aria-label={`Open larger view: ${alt}`}
    >
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority
        className="h-auto w-full transition-transform duration-300 group-hover:scale-[1.015]"
      />
    </button>
  );
}
