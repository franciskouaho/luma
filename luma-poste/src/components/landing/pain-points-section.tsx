"use client";

import { Clock, DollarSign, AlertTriangle, Info } from "lucide-react";

export default function PainPointsSection() {
  const painPoints = [
    {
      icon: Clock,
      iconColor: "#9B6BFF",
      title: "Publication manuelle",
      description: "Des heures perdues à publier votre contenu un par un sur chaque plateforme (aïe)"
    },
    {
      icon: DollarSign,
      iconColor: "#9B6BFF",
      title: "Prix injustement élevés",
      description: "Vous n'êtes pas une multinationale, alors pourquoi payer comme si vous en étiez une ?"
    },
    {
      icon: AlertTriangle,
      iconColor: "#9B6BFF",
      title: "Fonctionnalités superflues",
      description: "99 fonctionnalités dont vous n'avez pas besoin... mais que vous payez quand même"
    },
    {
      icon: Info,
      iconColor: "#9B6BFF",
      title: "Outils complexes",
      description: "Une courbe d'apprentissage plus raide qu'une fusée qui décolle. Houston, on a un problème !"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Publier du contenu ne devrait pas être aussi <span style={{ color: '#9B6BFF' }}>difficile</span>
          </h2>
          <p className="text-lg text-gray-600">
            Les autres solutions et outils...
          </p>
        </div>

        {/* Pain Points Grid */}
        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto mb-16">
          {painPoints.map((point, index) => {
            const Icon = point.icon;
            return (
              <div
                key={index}
                className="bg-gray-50 rounded-xl p-8 border border-gray-100 hover:border-purple-200 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${point.iconColor}15` }}>
                      <Icon className="w-6 h-6" style={{ color: point.iconColor }} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {point.title}
                    </h3>
                    <p className="text-gray-600">
                      {point.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Solution Statement */}
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            Perdre des heures ou dépenser une fortune ? Vous ne devriez pas avoir à choisir...
          </p>
          <p className="text-xl font-semibold" style={{ color: '#9B6BFF' }}>
            Avec LumaPost, fini ces problèmes. Une solution simple, efficace et abordable.
          </p>
        </div>
      </div>
    </section>
  );
}
