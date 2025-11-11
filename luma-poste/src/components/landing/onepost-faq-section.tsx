"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function OnePostFAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqs = [
    {
      question: "Quelles plateformes sociales supportez-vous ?",
      answer: "Nous supportons TikTok, Instagram, Facebook, LinkedIn, X (Twitter) et YouTube. Toutes les connexions utilisent les APIs officielles pour garantir la sécurité de vos données."
    },
    {
      question: "Comment fonctionne l'essai gratuit de 7 jours ?",
      answer: "Vous pouvez tester toutes les fonctionnalités de LumaPost gratuitement pendant 7 jours, sans carte bancaire requise. Vous pourrez ensuite choisir le plan qui vous convient le mieux."
    },
    {
      question: "Combien de comptes sociaux puis-je connecter ?",
      answer: "Cela dépend de votre plan : le plan Starter permet 5 comptes, Professional 15 comptes, et Enterprise des comptes illimités. Vous pouvez connecter plusieurs comptes d'une même plateforme."
    },
    {
      question: "Que sont les crédits IA et comment les utiliser ?",
      answer: "Les crédits IA vous permettent d'utiliser notre assistant intelligent pour générer des idées de contenu, optimiser vos légendes et analyser les tendances. Chaque plan inclut un quota mensuel de crédits."
    },
    {
      question: "Mes publications auront-elles moins de portée avec LumaPost ?",
      answer: "Non ! Nous utilisons les APIs officielles de chaque plateforme, donc vos publications ont exactement la même portée que si vous publiiez directement. Beaucoup d'utilisateurs voient même un meilleur engagement grâce à la programmation optimale."
    },
    {
      question: "Puis-je programmer mes publications à l'avance ?",
      answer: "Absolument ! Tous nos plans incluent la programmation de publications. Vous pouvez créer votre contenu à l'avance et le planifier aux meilleurs horaires pour maximiser votre engagement."
    },
    {
      question: "Comment puis-je annuler mon abonnement ?",
      answer: "Vous pouvez annuler votre abonnement à tout moment depuis votre tableau de bord, sans frais. Votre compte restera actif jusqu'à la fin de la période payée."
    },
    {
      question: "LumaPost est-il sécurisé ?",
      answer: "Oui, la sécurité est notre priorité. Nous utilisons OAuth pour les connexions (vos mots de passe ne sont jamais stockés), le chiffrement SSL, et nous sommes conformes au RGPD."
    },
    {
      question: "Puis-je gérer une équipe avec LumaPost ?",
      answer: "Oui ! Les plans Professional et Enterprise permettent d'ajouter des membres à votre équipe. Le plan Professional inclut jusqu'à 3 utilisateurs, et Enterprise une équipe illimitée."
    },
    {
      question: "Que se passe-t-il si j'ai besoin d'aide ?",
      answer: "Notre équipe support est disponible par email. Les utilisateurs Professional reçoivent une réponse sous 24h, et les utilisateurs Enterprise bénéficient d'un support dédié."
    }
  ];

  return (
    <section id="faq" className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="text-sm font-semibold uppercase tracking-wide mb-2" style={{ color: '#9B6BFF' }}>
            FAQ
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Questions fréquentes
          </h2>
          <p className="text-lg text-gray-600">
            Tout ce que vous devez savoir sur LumaPost
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-purple-200 transition-colors"
            >
              <button
                onClick={() => toggleItem(index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
              >
                <span className="text-lg font-semibold text-gray-900 pr-8">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-5 h-5 flex-shrink-0 transition-transform ${
                    openIndex === index ? 'transform rotate-180' : ''
                  }`}
                  style={{ color: '#9B6BFF' }}
                />
              </button>

              {openIndex === index && (
                <div className="px-6 pb-5">
                  <p className="text-gray-600 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
