"use client";

import { Star } from "lucide-react";

export default function TestimonialsSection() {
  const testimonials = [
    {
      name: "Marie",
      role: "CEO",
      company: "Studio Créatif",
      initial: "M",
      bgColor: "#9B6BFF",
      text: "Le meilleur rapport qualité/prix de toutes les plateformes de ce type, de loin. LumaPost m'a fait économiser du temps chaque jour sur la gestion de mes réseaux sociaux.",
      rating: 5
    },
    {
      name: "Thomas",
      role: "Entrepreneur",
      company: "TechStart",
      initial: "T",
      bgColor: "#F97316",
      text: "LumaPost est le meilleur investissement que j'ai fait ces derniers mois. C'est simple et ça marche, exactement ce que je cherchais pour gérer plusieurs canaux efficacement.",
      rating: 5
    },
    {
      name: "Sophie",
      role: "Community Manager",
      company: "Digital Agency",
      initial: "S",
      bgColor: "#EC4899",
      text: "Le temps c'est de l'argent, et utiliser LumaPost quotidiennement m'a fait économiser les deux depuis deux semaines. ROI incroyable !",
      rating: 5
    }
  ];

  return (
    <section id="testimonials" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-4">
          <p className="text-sm font-semibold uppercase tracking-wide mb-2" style={{ color: '#9B6BFF' }}>
            Témoignages
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
            Ils nous font <span style={{ color: '#9B6BFF' }}>confiance</span>
          </h2>
          <p className="text-lg text-gray-600 mb-12">
            Découvrez comment LumaPost transforme le quotidien de nos clients
          </p>
        </div>

        {/* Stats Bar */}
        <div className="flex flex-wrap justify-center items-center gap-8 mb-16">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: '#9B6BFF' }}>M</div>
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: '#F97316' }}>T</div>
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: '#EC4899' }}>S</div>
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: '#3B82F6' }}>J</div>
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: '#10B981' }}>A</div>
            </div>
            <span className="text-sm font-semibold text-gray-700">10+ clients satisfaits</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
              ))}
            </div>
            <span className="text-sm font-semibold text-gray-700">4.9/5 étoiles</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#9B6BFF' }}>
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-gray-700">19+ posts publiés</span>
          </div>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white rounded-2xl p-8 border border-gray-200 hover:shadow-lg transition-all">
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>

              {/* Testimonial Text */}
              <p className="text-gray-700 leading-relaxed mb-6">
                {testimonial.text}
              </p>

              {/* Author Info */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold" style={{ backgroundColor: testimonial.bgColor }}>
                  {testimonial.initial}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-500">{testimonial.role}</div>
                  <div className="text-xs text-gray-400">{testimonial.company}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}