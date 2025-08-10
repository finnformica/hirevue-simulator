import { PricingCards } from "@/components/pricing/pricing-cards";
import { getPricingData } from "@/lib/payments/fetch";

export default async function PricingPage() {
  const { proPrices, currentPlan } = await getPricingData();

  return (
    <>
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Start practicing for free or upgrade to Pro for unlimited access to
          all features and advanced analytics
        </p>
      </div>

      <PricingCards
        proPrices={proPrices}
        currentPlan={currentPlan}
        variant="pricing"
      />
    </>
  );
}
