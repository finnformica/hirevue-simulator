"use client";

import { PricingCards } from "@/components/pricing/pricing-cards";
import { ProPrice } from "@/lib/payments/fetch";

interface CtaSectionProps {
  proPrices: ProPrice[];
  currentPlan: string;
}

export function CtaSection({ proPrices, currentPlan }: CtaSectionProps) {
  return (
    <section id="pricing" className="w-full bg-black py-20 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="bg-gradient-to-b from-gray-900 to-black border border-gray-800 rounded-lg p-8 md:p-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Land Your Dream Job?
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Join thousands of graduates who have successfully prepared for
              their interviews with GradGuru.
            </p>
          </div>

          <PricingCards
            proPrices={proPrices}
            currentPlan={currentPlan}
            variant="cta"
          />

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 md:p-8 mt-12">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="mb-6 md:mb-0">
                <h3 className="text-xl font-bold mb-2">
                  Still have questions?
                </h3>
                <p className="text-gray-400">
                  Our team is ready to help you get started with GradGuru.
                </p>
              </div>
              <a
                href="mailto:gradguruapp@gmail.com"
                className="bg-gray-800 hover:bg-gray-700 text-white font-medium px-6 py-3 rounded-md transition-colors whitespace-nowrap"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
