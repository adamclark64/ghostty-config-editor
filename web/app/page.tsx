import { Hero } from "@/components/Hero";
import { FeatureGrid } from "@/components/FeatureGrid";
import { ScreenshotRow } from "@/components/ScreenshotRow";
import { InstallSteps } from "@/components/InstallSteps";
import { Faq } from "@/components/Faq";
import { Footer } from "@/components/Footer";
import { GalleryProvider, type GalleryItem } from "@/components/GalleryProvider";
import { getLatestRelease } from "@/lib/release";
import { screenshotExists } from "@/lib/screenshots";
import { HERO_SHOT, ROW_SHOTS } from "@/lib/shots";

export default async function Home() {
  const release = await getLatestRelease();

  const galleryItems: GalleryItem[] = [HERO_SHOT, ...ROW_SHOTS]
    .filter((s) => screenshotExists(s.src))
    .map(({ title, src, alt, width, height }) => ({
      title,
      src,
      alt,
      width,
      height,
    }));

  return (
    <GalleryProvider items={galleryItems}>
      <Hero release={release} />
      <FeatureGrid />
      <ScreenshotRow />
      <InstallSteps release={release} />
      <Faq />
      <Footer />
    </GalleryProvider>
  );
}
