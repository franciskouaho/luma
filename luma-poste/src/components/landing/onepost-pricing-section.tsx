"use client";

import { Check } from "lucide-react";
import { FaFacebook, FaInstagram, FaLinkedin, FaXTwitter, FaYoutube, FaTiktok } from "react-icons/fa6";

export default function OnePostPricingSection() {
  const plans = [
    {
      name: "Starter",
      subtitle: "Parfait pour démarrer votre présence en ligne",
      price: "€12",
      period: "/mois",
      popular: false,
      features: [
        "5 comptes sociaux connectés",
        "Toutes les plateformes :",
        "500 publications/mois",
        "Posts; Carrousels; Reels; Stories; Vidéos",
        "Calendrier de publication",
        "50 crédits IA/mois",
        "Analytics basiques",
        "Support email"
      ]
    },
    {
      name: "Professional",
      subtitle: "Pour les entreprises qui veulent se développer",
      price: "€29",
      period: "/mois",
      popular: true,
      features: [
        "15 comptes sociaux connectés",
        "Toutes les plateformes :",
        "Publications illimitées",
        "Posts; Carrousels; Reels; Stories; Vidéos",
        "Calendrier de publication",
        "250 crédits IA/mois",
        "Analytics avancées",
        "Équipe jusqu'à 3 utilisateurs",
        "Support par email en 24h"
      ]
    },
    {
      name: "Enterprise",
      subtitle: "Solution complète pour les grandes équipes",
      price: "€89",
      period: "/mois",
      popular: false,
      badge: "Meilleure offre",
      features: [
        "Comptes sociaux illimités",
        "Toutes les plateformes :",
        "Publications illimitées",
        "Posts; Carrousels; Reels; Stories; Vidéos",
        "Calendrier de publication",
        "+3000 crédits IA/mois",
        "Analytics avancées + rapports",
        "Équipe illimitée",
        "Support dédié par email"
      ]
    }
  ];

  const platforms = [FaFacebook, FaInstagram, FaLinkedin, FaXTwitter, FaYoutube, FaTiktok];

  return (
    <section id="pricing" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-4">
          <p className="text-sm font-semibold uppercase tracking-wide mb-2" style={{ color: '#9B6BFF' }}>
            Tarifs
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Des prix simples et transparents
          </h2>
          <p className="text-lg text-gray-600 mb-12">
            Commencez gratuitement pendant 7 jours, puis choisissez le plan qui correspond à vos besoins
          </p>
        </div>

        {/* Toggle (Monthly/Annual) - Optional */}
        <div className="flex justify-center mb-12">
          <div className="bg-gray-100 rounded-lg p-1 inline-flex gap-1">
            <button className="px-6 py-2 text-sm font-semibold rounded-md text-white transition-all" style={{ backgroundColor: '#9B6BFF' }}>
              Mensuel
            </button>
            <button className="px-6 py-2 text-sm font-semibold text-gray-700 rounded-md hover:bg-gray-200 transition-all">
              Annuel
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-white rounded-2xl p-8 transition-all hover:shadow-xl ${
                plan.popular
                  ? 'border-2 shadow-lg'
                  : 'border'
              } border-gray-200`}
              style={plan.popular ? { borderColor: '#9B6BFF' } : {}}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <div className="text-white px-4 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: '#F97316' }}>
                    Plus populaire
                  </div>
                </div>
              )}

              {/* Best Offer Badge */}
              {plan.badge && (
                <div className="absolute -top-3 right-4">
                  <div className="text-white px-4 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: '#3B82F6' }}>
                    {plan.badge}
                  </div>
                </div>
              )}

              {/* Plan Name */}
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {plan.name}
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                {plan.subtitle}
              </p>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-600">{plan.period}</span>
                </div>
              </div>

              {/* CTA Button */}
              <a
                href="/auth"
                className={`block text-center px-6 py-3 rounded-lg font-semibold mb-6 transition-all ${
                  plan.popular
                    ? 'text-white hover:opacity-90'
                    : 'text-gray-700 border-2 border-gray-300 hover:bg-gray-50'
                }`}
                style={plan.popular ? { backgroundColor: '#9B6BFF' } : {}}
              >
                Commencer l&apos;essai gratuit →
              </a>

              {/* Trial Info */}
              <div className="text-center mb-6">
                <span className="inline-block px-3 py-1 bg-green-50 text-green-700 rounded-md text-xs font-medium">
                  Essai gratuit 7 jours
                </span>
              </div>

              <p className="text-xs text-center text-gray-500 mb-6">
                0€ aujourd&apos;hui, annulez à tout moment
              </p>

              {/* Features List */}
              <ul className="space-y-3">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    {feature === "Toutes les plateformes :" ? (
                      <div className="w-full">
                        <div className="flex items-center gap-2 mb-2">
                          <Check className="w-4 h-4 flex-shrink-0" style={{ color: '#9B6BFF' }} strokeWidth={3} />
                          <span className="text-gray-900 font-medium">{feature}</span>
                        </div>
                        <div className="flex gap-2 ml-6">
                          {platforms.map((Icon, pidx) => (
                            <Icon key={pidx} className="w-4 h-4 text-gray-400" />
                          ))}
                        </div>
                      </div>
                    ) : (
                      <>
                        <Check className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#9B6BFF' }} strokeWidth={3} />
                        <span className="text-gray-700">{feature}</span>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
