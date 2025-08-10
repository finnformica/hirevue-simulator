"use client";

import {
  BarChart3,
  BookOpen,
  Check,
  Clock,
  Target,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { checkoutAction, customerPortalAction } from "@/lib/payments/actions";

interface ProPrice {
  id: string;
  productId: string;
  unitAmount: number | null;
  currency: string;
  interval: string | undefined;
  trialPeriodDays?: number | null;
}

interface PricingDisplayProps {
  proPrices: ProPrice[];
  currentPlan: string;
}

export function PricingDisplay({
  proPrices,
  currentPlan,
}: PricingDisplayProps) {
  const [isQuarterly, setIsQuarterly] = useState(false);

  // Find available pricing options
  const monthlyPrice = proPrices.find((price) => price.interval === "month");
  const quarterlyPrice = proPrices.find(
    (price) => price.interval === "quarter"
  );
  const selectedPrice = isQuarterly ? quarterlyPrice : monthlyPrice;

  const plans = [
    {
      name: "Free",
      price: "0",
      period: isQuarterly ? "quarter" : "month",
      description: "Perfect for getting started with interview practice",
      features: [
        { text: "Unlimited interview attempts", included: true, icon: Clock },
        {
          text: "Detailed personalised feedback and scoring",
          included: true,
          icon: Target,
        },
        {
          text: "Access to 3 basic questions only",
          included: true,
          icon: BookOpen,
        },
        { text: "Industry-specific questions", included: false, icon: Users },
        {
          text: "Review and track past interview attempts",
          included: false,
          icon: BarChart3,
        },
        {
          text: "Advanced analytics & insights",
          included: false,
          icon: TrendingUp,
        },
      ],
      buttonText:
        currentPlan === "Free" ? "Your current plan" : "Downgrade to Free",
      buttonVariant: "outline" as const,
      popular: false,
      priceId: undefined,
      isCurrentPlan: currentPlan === "Free",
      isFreePlan: true,
    },
    {
      name: "Pro",
      price:
        selectedPrice && selectedPrice.unitAmount
          ? (selectedPrice.unitAmount / 100).toString()
          : "20",
      period: isQuarterly ? "quarter" : "month",
      description: "Unlimited practice with advanced features and analytics",
      features: [
        { text: "Unlimited interview attempts", included: true, icon: Clock },
        {
          text: "Detailed personalised feedback and scoring",
          included: true,
          icon: Target,
        },
        {
          text: "All question categories & difficulties",
          included: true,
          icon: BookOpen,
        },
        { text: "Industry-specific questions", included: true, icon: Users },
        {
          text: "Review and track past interview attempts",
          included: true,
          icon: BarChart3,
        },
        {
          text: "Advanced analytics & insights",
          included: true,
          icon: TrendingUp,
        },
      ],
      buttonText:
        currentPlan === "Pro" ? "Your current plan" : "Upgrade to Pro",
      buttonVariant: "default" as const,
      popular: true,
      priceId: selectedPrice?.id,
      isCurrentPlan: currentPlan === "Pro",
    },
  ];

  return (
    <>
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Start practicing for free or upgrade to Pro for unlimited access to
          all features and advanced analytics
        </p>
      </div>

      {/* Billing Toggle */}
      {quarterlyPrice && monthlyPrice && (
        <div className="flex items-center justify-center mb-8">
          <span
            className={`text-sm mr-3 ${!isQuarterly ? "text-gray-300" : "text-gray-600"}`}
          >
            Monthly
          </span>
          <Switch
            checked={isQuarterly}
            onCheckedChange={setIsQuarterly}
            className="mx-2"
          />
          <span
            className={`text-sm ml-3 ${isQuarterly ? "text-gray-300" : "text-gray-600"}`}
          >
            Quarterly
            {monthlyPrice?.unitAmount && quarterlyPrice?.unitAmount && (
              <span className="ml-2 text-green-500 text-xs">
                (Save{" "}
                {Math.round(
                  ((monthlyPrice.unitAmount * 3 - quarterlyPrice.unitAmount) /
                    (monthlyPrice.unitAmount * 3)) *
                    100
                )}
                %)
              </span>
            )}
          </span>
        </div>
      )}

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={`relative bg-gray-900 border-gray-800 ${plan.popular ? "ring-2 ring-green-500" : ""}`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-green-500 text-black px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
            )}

            <CardHeader className="text-center pb-8">
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold">£{plan.price}</span>
                <span className="text-gray-400 ml-1">/{plan.period}</span>
              </div>
              <p className="text-gray-400 text-sm">{plan.description}</p>
            </CardHeader>

            <CardContent className="space-y-6">
              {plan.isCurrentPlan ? (
                <Button
                  disabled
                  className={`w-full ${
                    plan.popular
                      ? "bg-gray-600 text-gray-300 cursor-not-allowed"
                      : "bg-gray-700 text-gray-400 cursor-not-allowed border-gray-600"
                  }`}
                  variant={plan.buttonVariant}
                >
                  {plan.buttonText}
                </Button>
              ) : plan.priceId ? (
                <form action={checkoutAction}>
                  <input type="hidden" name="priceId" value={plan.priceId} />
                  <Button
                    type="submit"
                    className={`w-full ${
                      plan.popular
                        ? "bg-green-500 hover:bg-green-600 text-black"
                        : "bg-gray-800 hover:bg-gray-700 text-white border-gray-700"
                    }`}
                    variant={plan.buttonVariant}
                  >
                    {plan.buttonText}
                  </Button>
                </form>
              ) : plan.isFreePlan ? (
                <form action={customerPortalAction}>
                  <Button
                    type="submit"
                    className={`w-full ${
                      plan.popular
                        ? "bg-green-500 hover:bg-green-600 text-black"
                        : "bg-gray-800 hover:bg-gray-700 text-white border-gray-700"
                    }`}
                    variant={plan.buttonVariant}
                  >
                    {plan.buttonText}
                  </Button>
                </form>
              ) : (
                <Button
                  className={`w-full ${
                    plan.popular
                      ? "bg-green-500 hover:bg-green-600 text-black"
                      : "bg-gray-800 hover:bg-gray-700 text-white border-gray-700"
                  }`}
                  variant={plan.buttonVariant}
                >
                  {plan.buttonText}
                </Button>
              )}

              <div className="space-y-4">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div
                      className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${
                        feature.included
                          ? "bg-green-500/20 text-green-500"
                          : "bg-gray-800 text-gray-500"
                      }`}
                    >
                      {feature.included ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        <X className="w-3 h-3" />
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <feature.icon
                        className={`w-4 h-4 ${feature.included ? "text-gray-300" : "text-gray-600"}`}
                      />
                      <span
                        className={`text-sm ${feature.included ? "text-gray-300" : "text-gray-600"}`}
                      >
                        {feature.text}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
