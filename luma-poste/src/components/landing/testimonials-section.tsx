"use client";

import { Star, Quote } from "lucide-react";
import { motion } from "framer-motion";

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
    <section id="testimonials" className="py-24 bg-gray-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-0 w-64 h-64 bg-purple-100/50 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-0 w-64 h-64 bg-blue-100/50 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-sm font-bold uppercase tracking-wider mb-3 text-purple-600">
              Témoignages
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Ils nous font <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">confiance</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Découvrez comment LumaPost transforme le quotidien de nos clients
            </p>
          </motion.div>
        </div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-wrap justify-center items-center gap-8 mb-20 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 max-w-3xl mx-auto"
        >
          <div className="flex items-center gap-3">
            <div className="flex -space-x-3">
              {['M', 'T', 'S', 'J', 'A'].map((letter, i) => (
                <div key={i} className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold border-2 border-white"
                  style={{ backgroundColor: ['#9B6BFF', '#F97316', '#EC4899', '#3B82F6', '#10B981'][i] }}>
                  {letter}
                </div>
              ))}
            </div>
            <span className="text-sm font-semibold text-gray-700">1000+ clients satisfaits</span>
          </div>

          <div className="w-px h-8 bg-gray-200 hidden sm:block" />

          <div className="flex items-center gap-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
              ))}
            </div>
            <span className="text-sm font-semibold text-gray-700">4.9/5 étoiles</span>
          </div>

          <div className="w-px h-8 bg-gray-200 hidden sm:block" />

          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-purple-100 text-purple-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-gray-700">1M+ posts publiés</span>
          </div>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
              className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:border-purple-100 transition-all duration-300 relative group"
            >
              <Quote className="absolute top-6 right-6 w-8 h-8 text-purple-100 group-hover:text-purple-200 transition-colors" />

              {/* Stars */}
              <div className="flex gap-1 mb-6">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
              </div>

              {/* Testimonial Text */}
              <p className="text-gray-700 leading-relaxed mb-8 relative z-10">
                &quot;{testimonial.text}&quot;
              </p>

              {/* Author Info */}
              <div className="flex items-center gap-4 mt-auto border-t border-gray-50 pt-6">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-md" style={{ backgroundColor: testimonial.bgColor }}>
                  {testimonial.initial}
                </div>
                <div>
                  <div className="font-bold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-500">{testimonial.role}</div>
                  <div className="text-xs text-purple-600 font-medium">{testimonial.company}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}