"use client";

import { Check, Play } from "lucide-react";
import { motion } from "framer-motion";

export default function DemoVideoSection() {
  const features = [
    "Tour complet de l'interface",
    "Démonstration de publication multi-plateforme",
    "Gestion du calendrier et programmation"
  ];

  return (
    <section className="py-24 bg-gray-50 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-purple-50/50 to-transparent pointer-events-none" />

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
              Découvrez LumaPost
            </p>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Column - Description */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Voyez LumaPost en <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">action</span>
            </h2>
            <p className="text-lg text-gray-600 mb-10 leading-relaxed">
              Découvrez comment LumaPost peut transformer votre gestion des réseaux sociaux avec une interface intuitive et puissante.
            </p>

            {/* Features */}
            <ul className="space-y-6 mb-10">
              {features.map((feature, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex items-center gap-4"
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-purple-100 text-purple-600 shadow-sm">
                    <Check className="w-5 h-5" strokeWidth={3} />
                  </div>
                  <span className="text-gray-700 font-medium text-lg">{feature}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Right Column - Video Placeholder */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="relative bg-gray-900 rounded-2xl overflow-hidden shadow-2xl border border-gray-800 group cursor-pointer">
              {/* Video Container */}
              <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center relative overflow-hidden">
                {/* Abstract Background in Video */}
                <div className="absolute inset-0 opacity-30">
                  <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,_rgba(155,107,255,0.2),transparent_70%)]" />
                </div>

                {/* Play Button */}
                <div className="relative z-10 w-24 h-24 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:bg-white/20 border border-white/20">
                  <div className="w-16 h-16 rounded-full bg-[#9B6BFF] flex items-center justify-center shadow-lg shadow-purple-500/30">
                    <Play className="w-6 h-6 text-white fill-current ml-1" />
                  </div>
                </div>

                {/* Duration Badge */}
                <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md text-white px-3 py-1.5 rounded-lg text-sm font-medium border border-white/10">
                  2:30
                </div>

                {/* Title Overlay */}
                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white px-4 py-2 rounded-lg text-sm font-medium border border-white/10">
                  Démo complète de LumaPost
                </div>
              </div>

              {/* Mockup Interface Below Video */}
              <div className="p-4 bg-gray-900 border-t border-gray-800">
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                  </div>
                  <p className="text-xs text-gray-500 font-mono">lumapost.app/demo</p>
                </div>
              </div>
            </div>

            {/* Decorative Blob */}
            <div className="absolute -inset-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-[2rem] opacity-20 blur-2xl -z-10 group-hover:opacity-30 transition-opacity duration-500" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
