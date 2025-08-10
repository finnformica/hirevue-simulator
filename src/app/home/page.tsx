import { CtaSection } from "@/components/home/cta";
import { FeatureSection } from "@/components/home/feature";
import { Footer } from "@/components/home/footer";
import { HeroSection } from "@/components/home/hero";
import { Navbar } from "@/components/home/navbar";
import { getPricingData } from "@/lib/payments/fetch";

// Prices are fresh for one hour max
export const revalidate = 3600;

export default async function HomePage() {
  const { proPrices, currentPlan } = await getPricingData();

  return (
    <div className="bg-black text-white min-h-screen w-full">
      <Navbar />
      <main>
        <HeroSection />
        <FeatureSection />
        <CtaSection proPrices={proPrices} currentPlan={currentPlan} />
      </main>
      <Footer />
    </div>
  );
}
