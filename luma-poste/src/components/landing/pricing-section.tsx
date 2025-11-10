"use client";

import { Button } from "@/components/ui/button";
import { Check, Star } from "lucide-react";
import Link from "next/link";

export default function PricingSection() {
  const plans = [
    {
      name: "Creator",
      price: "$29",
      period: "/month",
      discount: null,
      description: "Best for growing creators",
      features: [
        "15 connected social accounts",
        "Multiple accounts per platform",
        "Unlimited posts",
        "Schedule posts",
        "Carousel posts",
        "Bulk video scheduling",
        "Content studio access",
        "API add-on available",
        "Human support"
      ],
      popular: true,
      gradient: "from-purple-600 to-purple-700",
      note: "$0.00 due today, cancel anytime"
    },
    {
      name: "Pro",
      price: "$49",
      period: "/month",
      discount: "Best deal",
      description: "Best for scaling brands",
      features: [
        "Unlimited connected accounts",
        "Multiple accounts per platform",
        "Unlimited posts",
        "Schedule posts",
        "Carousel posts",
        "Bulk video scheduling",
        "Content studio access",
        "API add-on available",
        "Viral growth consulting",
        "Priority human support"
      ],
      popular: false,
      gradient: "from-purple-700 to-purple-800"
    }
  ];

  return (
    <section id="pricing" className="py-20 relative bg-gradient-to-br from-gray-50 to-white">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-r from-purple-100 to-purple-200 rounded-full blur-3xl opacity-60"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-r from-purple-200 to-purple-100 rounded-full blur-3xl opacity-60"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Simple{" "}
            <span className="text-purple-600">
              Pricing
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose the plan that fits your needs. No hidden fees, no surprises.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-white border rounded-3xl p-8 transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                plan.popular 
                  ? 'border-purple-300 shadow-2xl shadow-purple-500/20' 
                  : 'border-gray-200 hover:border-purple-300'
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    Most popular
                  </div>
                </div>
              )}

              {/* Discount Badge */}
              {plan.discount && !plan.popular && (
                <div className="absolute -top-4 right-4">
                  <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-2 rounded-full text-sm font-semibold">
                    {plan.discount}
                  </div>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-4">{plan.description}</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-600">{plan.period}</span>
                </div>
                {plan.note && (
                  <p className="text-sm text-purple-600 font-medium mt-2">{plan.note}</p>
                )}
              </div>

              {/* Features */}
              <div className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <Link href="/auth">
                <Button className={`w-full bg-gradient-to-r ${plan.gradient} hover:opacity-90 text-white border-0 rounded-full py-3 font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/30`}>
                  Get Started
                </Button>
              </Link>
            </div>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 text-center">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-gray-600">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-purple-600" />
              <span>No setup fees</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-purple-600" />
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-purple-600" />
              <span>24/7 support</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-purple-600" />
              <span>Money-back guarantee</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}