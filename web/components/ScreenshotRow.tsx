import { screenshotExists } from "@/lib/screenshots";
import { ROW_SHOTS } from "@/lib/shots";
import { ScreenshotGallery, type GalleryShot } from "./ScreenshotGallery";

export function ScreenshotRow() {
  const shots: GalleryShot[] = ROW_SHOTS.map((s) => ({
    ...s,
    exists: screenshotExists(s.src),
  }));

  return (
    <section className="mx-auto max-w-6xl px-6 py-16 md:py-24">
      <div className="mb-12 max-w-2xl">
        <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
          See it work.
        </h2>
        <p className="mt-4 text-lg text-muted">
          A few of the surfaces you spend the most time in. Click any image for a closer look.
        </p>
      </div>
      <ScreenshotGallery shots={shots} />
    </section>
  );
}
