import { CtaSection } from "@/components/home/cta";
import { FeatureSection } from "@/components/home/feature";
import { Footer } from "@/components/home/footer";
import { HeroSection } from "@/components/home/hero";
import { Navbar } from "@/components/home/navbar";

export default async function HomePage() {
  return (
    <div className="bg-black text-white min-h-screen w-full">
      <Navbar />
      <main>
        <HeroSection />
        <FeatureSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}
