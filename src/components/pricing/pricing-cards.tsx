"use client";

import {
  BarChart3,
  BookOpen,
  Clock,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { checkoutAction } from "@/lib/payments/actions";
import { ProPrice } from "@/lib/payments/fetch";

interface Plan {
  name: string;
  price: string;
  period: string;
  description: string;
  features: {
    text: string;
    included: boolean;
    icon: React.ComponentType<any>;
  }[];
  buttonText: string;
  buttonVariant: "outline" | "default";
  popular: boolean;
  priceId?: string;
  isCurrentPlan: boolean;
  isFreePlan?: boolean;
}

interface PricingCardsProps {
  proPrices: ProPrice[];
  currentPlan: string;
  variant?: "pricing" | "cta";
}

export function PricingCards({
  proPrices,
  currentPlan,
  variant = "pricing",
}: PricingCardsProps) {
  const [isQuarterly, setIsQuarterly] = useState(false);

  // Find available pricing options
  const monthlyPrice = proPrices.find((price) => price.interval === "month");
  const quarterlyPrice = proPrices.find(
    (price) => price.interval === "quarter"
  );
  const selectedPrice = isQuarterly ? quarterlyPrice : monthlyPrice;

  const plans: Plan[] = [
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

  const renderFeature = (feature: Plan["features"][0]) => {
    const Icon = feature.icon;
    return (
      <li
        key={feature.text}
        className={`flex items-start ${!feature.included ? "opacity-50" : ""}`}
      >
        <Icon
          size={18}
          className={`mr-2 flex-shrink-0 mt-0.5 ${
            feature.included ? "text-green-400" : "text-gray-500"
          }`}
        />
        <span
          className={`${feature.included ? "text-gray-300" : "text-gray-500"}`}
        >
          {feature.text}
        </span>
      </li>
    );
  };

  const renderButton = (plan: Plan) => {
    if (variant === "cta") {
      if (plan.isFreePlan) {
        return (
          <a
            href="/auth/sign-in"
            className="bg-gray-800 hover:bg-gray-700 text-white font-medium px-4 py-2 rounded-md transition-colors text-center"
          >
            Get Started
          </a>
        );
      }
      return (
        <a
          href="/auth/sign-in"
          className={`w-full inline-block text-center font-medium px-4 py-2 rounded-md transition-colors ${
            plan.popular
              ? "bg-green-500 hover:bg-green-600 text-black"
              : "bg-gray-800 hover:bg-gray-700 text-white"
          }`}
        >
          Get Pro
        </a>
      );
    }

    if (plan.isCurrentPlan) {
      return (
        <div className="bg-gray-800 text-gray-400 font-medium px-4 py-2 rounded-md text-center cursor-not-allowed">
          {plan.buttonText}
        </div>
      );
    }

    // Pricing page variant
    if (plan.isFreePlan) {
      return (
        <Button
          variant="outline"
          className="w-full"
          disabled={plan.isCurrentPlan}
        >
          {plan.buttonText}
        </Button>
      );
    }

    return (
      <form action={checkoutAction}>
        <input type="hidden" name="priceId" value={plan.priceId || ""} />
        <Button
          type="submit"
          className="w-full bg-green-500 hover:bg-green-600"
        >
          {plan.buttonText}
        </Button>
      </form>
    );
  };

  const renderPricingCard = (plan: Plan) => {
    if (variant === "cta") {
      return (
        <div
          key={plan.name}
          className={`bg-black border border-gray-800 rounded-lg p-6 flex flex-col ${
            plan.popular ? "bg-green-500/10 border-green-500/30 relative" : ""
          }`}
        >
          {plan.popular && (
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-500 text-black text-xs font-bold px-3 py-1 rounded-full">
              MOST POPULAR
            </div>
          )}
          <div
            className={`mb-2 ${plan.popular ? "text-green-400" : "text-gray-400"}`}
          >
            {plan.name}
          </div>
          <h3 className="text-2xl font-bold mb-1">
            £{plan.price}
            <span className="text-lg font-normal text-gray-400">
              /{plan.period}
            </span>
          </h3>
          <p className="text-sm text-gray-400 mb-6">{plan.description}</p>
          <ul className="space-y-3 mb-8 flex-grow">
            {plan.features.map(renderFeature)}
          </ul>
          {renderButton(plan)}
        </div>
      );
    }

    // Pricing page variant
    return (
      <Card
        key={plan.name}
        className={`relative bg-gray-900 border-gray-800 ${
          plan.popular ? "ring-2 ring-green-500" : ""
        }`}
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
          <ul className="space-y-3">{plan.features.map(renderFeature)}</ul>
          {renderButton(plan)}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className={variant === "cta" ? "" : "max-w-7xl mx-auto"}>
      {quarterlyPrice && monthlyPrice && (
        <div className="flex items-center justify-center mb-8">
          <span
            className={`text-sm mr-3 ${
              !isQuarterly ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Monthly
          </span>
          <Switch
            checked={isQuarterly}
            onCheckedChange={setIsQuarterly}
            className="mx-2"
          />
          <span
            className={`text-sm ml-3 ${
              isQuarterly ? "text-gray-300" : "text-gray-600"
            }`}
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

      <div
        className={
          variant === "cta"
            ? "grid grid-cols-1 md:grid-cols-2 gap-8"
            : "grid md:grid-cols-2 gap-8 max-w-4xl mx-auto"
        }
      >
        {plans.map(renderPricingCard)}
      </div>
    </div>
  );
}
