"use client";

import { Rocket, Calendar, FolderKanban, Sparkles } from "lucide-react";

export default function DetailedFeaturesSection() {
  const features = [
    {
      icon: Rocket,
      iconBg: "#FEF3F2",
      iconColor: "#9B6BFF",
      title: "Publication croisée",
      description: "Publiez sur tous vos réseaux sociaux simultanément en quelques clics.",
      details: [
        "Diffusez votre contenu instantanément sur TikTok, Instagram, Facebook, LinkedIn, X et YouTube",
        "Adaptez automatiquement vos publications aux spécificités de chaque plateforme",
        "Gérez tous vos comptes depuis une interface unique et centralisée"
      ]
    },
    {
      icon: Calendar,
      iconBg: "#FEF3F2",
      iconColor: "#9B6BFF",
      title: "Programmation intelligente",
      description: "Planifiez votre contenu aux meilleurs moments pour maximiser l'engagement.",
      details: [
        "Programmez vos posts aux horaires optimaux selon vos analyses",
        "Créez des calendriers de publication récurrents",
        "Visualisez votre planning éditorial en un coup d'œil"
      ]
    },
    {
      icon: FolderKanban,
      iconBg: "#FEF3F2",
      iconColor: "#9B6BFF",
      title: "Gestion de contenu",
      description: "Organisez et gérez efficacement votre contenu avec notre interface intuitive.",
      details: [
        "Bibliothèque centralisée pour tous vos médias",
        "Import direct depuis Google Drive",
        "Accès à des banques d'images gratuites"
      ]
    },
    {
      icon: Sparkles,
      iconBg: "#FEF3F2",
      iconColor: "#9B6BFF",
      title: "Génération de contenu avec IA",
      description: "Obtenez des suggestions de contenu personnalisées grâce à notre IA avancée.",
      details: [
        "Génération d'idées de posts adaptées à votre audience",
        "Suggestions de légendes optimisées pour chaque réseau",
        "Analyse de tendances pour rester pertinent"
      ]
    }
  ];

  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="text-sm font-semibold uppercase tracking-wide mb-2" style={{ color: '#9B6BFF' }}>
            Fonctionnalités
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Développez votre présence sociale avec <span style={{ color: '#9B6BFF' }}>moins d&apos;effort</span> pour <span style={{ color: '#9B6BFF' }}>moins d&apos;argent</span>
          </h2>
          <p className="text-lg text-gray-600">
            Découvrez les fonctionnalités de LumaPost...
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-2xl p-8 hover:border-purple-200 hover:shadow-lg transition-all"
              >
                {/* Icon & Title */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ backgroundColor: feature.iconBg }}>
                    <Icon className="w-7 h-7" style={{ color: feature.iconColor }} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {feature.title}
                  </h3>
                </div>

                {/* Description */}
                <p className="text-gray-600 mb-6">
                  {feature.description}
                </p>

                {/* Details List */}
                <ul className="space-y-2">
                  {feature.details.map((detail, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                      <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: '#9B6BFF' }}></div>
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-12">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">
            Gagnez du temps chaque jour sur la gestion de vos réseaux sociaux
          </h3>
          <p className="text-lg text-gray-600 mb-8">
            Testez LumaPost gratuitement pendant 7 jours.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href="/auth"
              className="inline-flex items-center gap-2 text-white px-8 py-4 text-lg font-semibold rounded-lg transition-all hover:opacity-90 shadow-lg"
              style={{ backgroundColor: '#9B6BFF' }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
              Commencer l&apos;essai gratuit
            </a>
            <a
              href="#pricing"
              className="inline-flex items-center gap-2 bg-white text-gray-700 border-2 border-gray-300 px-8 py-4 text-lg font-semibold rounded-lg hover:bg-gray-50 transition-all"
            >
              Voir les tarifs
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
