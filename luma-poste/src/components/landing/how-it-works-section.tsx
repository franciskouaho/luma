"use client";

import { Link2, Zap, Rocket } from "lucide-react";
import { motion } from "framer-motion";

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
    <section id="how-it-works" className="py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-sm font-bold uppercase tracking-wider mb-3 text-purple-600">
              Processus simplifié
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
              En <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">3 étapes simples</span>
            </h2>
          </motion.div>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-24 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-transparent via-purple-200 to-transparent -z-10" />

          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className={`relative h-full`}
              >
                <div className={`
                  h-full rounded-2xl p-8 bg-white transition-all duration-300
                  ${index === 2
                    ? 'border-2 border-purple-500 shadow-xl shadow-purple-500/10'
                    : 'border border-gray-100 shadow-lg hover:shadow-xl hover:border-purple-200'
                  }
                `}>
                  {/* Step Number & Icon */}
                  <div className="flex items-center justify-between mb-8">
                    <div className="relative">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm ${index === 2 ? 'bg-purple-600 text-white' : 'bg-purple-50 text-purple-600'}`}>
                        <Icon className="w-8 h-8" />
                      </div>
                      {/* Connector Dot */}
                      <div className="hidden md:block absolute top-1/2 -translate-y-1/2 -right-12 w-3 h-3 rounded-full bg-white border-2 border-purple-200 z-10" />
                    </div>
                    <div className="text-6xl font-bold opacity-10 text-purple-900 select-none">
                      {step.number}
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed mb-8 text-sm">{step.description}</p>

                  {/* Features List */}
                  <ul className="space-y-3">
                    {step.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 bg-purple-500" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
