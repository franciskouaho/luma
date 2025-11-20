"use client";

import { Clock, DollarSign, AlertTriangle, Info } from "lucide-react";
import { motion } from "framer-motion";

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
      iconColor: "#F97316",
      title: "Prix injustement élevés",
      description: "Vous n'êtes pas une multinationale, alors pourquoi payer comme si vous en étiez une ?"
    },
    {
      icon: AlertTriangle,
      iconColor: "#EF4444",
      title: "Fonctionnalités superflues",
      description: "99 fonctionnalités dont vous n'avez pas besoin... mais que vous payez quand même"
    },
    {
      icon: Info,
      iconColor: "#3B82F6",
      title: "Outils complexes",
      description: "Une courbe d'apprentissage plus raide qu'une fusée qui décolle. Houston, on a un problème !"
    }
  ];

  return (
    <section className="py-24 bg-gray-50/50 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-100/40 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Publier du contenu ne devrait pas être aussi <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">difficile</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Les autres solutions sont souvent trop chères, trop complexes ou trop limitées. Il est temps de changer ça.
            </p>
          </motion.div>
        </div>

        {/* Pain Points Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-20">
          {painPoints.map((point, index) => {
            const Icon = point.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:border-purple-100 transition-all duration-300 group"
              >
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300"
                      style={{ backgroundColor: `${point.iconColor}15` }}
                    >
                      <Icon className="w-7 h-7" style={{ color: point.iconColor }} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors">
                      {point.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {point.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Solution Statement */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center bg-white rounded-3xl p-8 md:p-12 shadow-lg border border-purple-100 max-w-4xl mx-auto"
        >
          <p className="text-gray-600 mb-4 text-lg">
            Perdre des heures ou dépenser une fortune ? Vous ne devriez pas avoir à choisir...
          </p>
          <p className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
            Avec LumaPost, c&apos;est simple, efficace et abordable.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
