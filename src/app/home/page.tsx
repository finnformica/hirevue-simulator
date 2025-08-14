import { CtaSection } from "@/components/home/cta";
import { FaqSection } from "@/components/home/faq";
import { FeatureSection } from "@/components/home/feature";
import { Footer } from "@/components/home/footer";
import { HeroSection } from "@/components/home/hero";
import { Navbar } from "@/components/home/navbar";
import { TestimonialsSection } from "@/components/home/testimonials";
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
        <TestimonialsSection />
        <FaqSection />
      </main>
      <Footer />
    </div>
  );
}
