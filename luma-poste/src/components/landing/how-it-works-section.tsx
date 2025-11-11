"use client";

import { Link2, Zap, Rocket } from "lucide-react";

export default function HowItWorksSection() {
  const steps = [
    {
      icon: Link2,
      number: "01",
      title: "Connectez vos comptes",
      description: "Associez vos comptes TikTok, Instagram, LinkedIn, X, et YouTube. Chaque connexion est sécurisée avec une API officielle des plateformes pour protéger vos données.",
      features: [
        "6 plateformes à connecter",
        "Connexion sécurisée",
        "API officielle garantie"
      ]
    },
    {
      icon: Zap,
      number: "02",
      title: "Rédigez votre publication",
      description: "Écrivez votre contenu avec notre éditeur qui s'adapte à chaque réseau social. LumaPost enrichit vos publications avec vos médias Google Drive ou choisissez des visuels dans nos banques d'images gratuites.",
      features: [
        "IA booste vos idées de contenu",
        "Recommandations par l'IA",
        "Import Google Drive + banques d'images libres"
      ]
    },
    {
      icon: Rocket,
      number: "03",
      title: "Publiez partout",
      description: "Diffusez tout de suite ou planifiez vos publications. Notre IA analyse vos performances passées et vous indique les créneaux optimaux pour toucher un maximum de personnes sur chaque réseau.",
      features: [
        "Publication instantanée ou planifiée",
        "Toucher les meilleurs horaires",
        "Programmation récurrente"
      ]
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-4">
          <p className="text-sm font-semibold uppercase tracking-wide mb-2" style={{ color: '#9B6BFF' }}>
            Processus simplifié
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
            En <span style={{ color: '#9B6BFF' }}>3 étapes simples</span>
          </h2>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={index}
                className={`relative ${index === 2 ? 'border-2' : 'border'} ${index === 2 ? 'border-purple-300' : 'border-gray-200'} rounded-2xl p-8 bg-white hover:shadow-lg transition-all`}
              >
                {/* Step Number & Icon */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: index === 2 ? '#9B6BFF' : '#F3F4F6' }}>
                      <Icon className="w-8 h-8" style={{ color: index === 2 ? 'white' : '#9B6BFF' }} />
                    </div>
                  </div>
                  <div className="text-7xl font-bold opacity-10" style={{ color: '#9B6BFF' }}>
                    {step.number}
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed mb-6">{step.description}</p>

                {/* Features List */}
                <ul className="space-y-2">
                  {step.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                      <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: '#9B6BFF' }}></div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
