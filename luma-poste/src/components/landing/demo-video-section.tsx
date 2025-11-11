"use client";

import { Check } from "lucide-react";

export default function DemoVideoSection() {
  const features = [
    "Tour complet de l'interface",
    "Démonstration de publication multi-plateforme",
    "Gestion du calendrier et programmation"
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-4">
          <p className="text-sm font-semibold uppercase tracking-wide mb-2" style={{ color: '#9B6BFF' }}>
            Découvrez LumaPost
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Description */}
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Voyez LumaPost en <span style={{ color: '#9B6BFF' }}>action</span>
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Découvrez comment LumaPost peut transformer votre gestion des réseaux sociaux.
            </p>

            {/* Features */}
            <ul className="space-y-4 mb-8">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: '#9B6BFF' }}>
                    <Check className="w-4 h-4 text-white" strokeWidth={3} />
                  </div>
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right Column - Video Placeholder */}
          <div className="relative">
            <div className="relative bg-white rounded-2xl overflow-hidden shadow-2xl border border-gray-200">
              {/* Video Container */}
              <div className="aspect-video bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center relative">
                {/* Play Button */}
                <button className="w-20 h-20 rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-2xl" style={{ backgroundColor: '#9B6BFF' }}>
                  <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </button>

                {/* Placeholder Image - vous pouvez remplacer par une vraie miniature */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-purple-600/20"></div>

                {/* Duration Badge */}
                <div className="absolute bottom-4 right-4 bg-black/80 text-white px-3 py-1 rounded-md text-sm font-medium">
                  2:30
                </div>

                {/* Title Overlay */}
                <div className="absolute top-4 left-4 bg-black/80 text-white px-4 py-2 rounded-lg text-sm font-medium">
                  Démo complète de LumaPost
                </div>
              </div>

              {/* Mockup Interface Below Video */}
              <div className="p-6 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                  <p className="text-xs text-gray-500">Interface LumaPost</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
