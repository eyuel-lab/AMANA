import Hero from "@/components/home/Hero";
import CategoryStrip from "@/components/home/CategoryStrip";
import StepsSection from "@/components/home/StepsSection";
import TrustGrid from "@/components/home/TrustGrid";
import HomeClosing from "@/components/home/HomeClosing";
import FaqSection from "@/components/home/FaqSection";

export default function Home() {
  return (
    <>
      <Hero />
      <CategoryStrip />
      <StepsSection />
      <TrustGrid />
      <HomeClosing />
      <FaqSection />
    </>
  );
}