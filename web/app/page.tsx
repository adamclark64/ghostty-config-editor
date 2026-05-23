import { Hero } from "@/components/Hero";
import { FeatureGrid } from "@/components/FeatureGrid";
import { ScreenshotRow } from "@/components/ScreenshotRow";
import { InstallSteps } from "@/components/InstallSteps";
import { Faq } from "@/components/Faq";
import { Footer } from "@/components/Footer";
import { getLatestRelease } from "@/lib/release";

export default async function Home() {
  const release = await getLatestRelease();
  return (
    <>
      <Hero release={release} />
      <FeatureGrid />
      <ScreenshotRow />
      <InstallSteps release={release} />
      <Faq />
      <Footer />
    </>
  );
}
