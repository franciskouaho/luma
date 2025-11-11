"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Check } from "lucide-react";
import {
  FaXTwitter,
  FaInstagram,
  FaLinkedin,
  FaFacebook,
  FaTiktok,
  FaYoutube,
} from "react-icons/fa6";
import { useMemo } from "react";

export default function HeroSection() {
  return (
    <section
      id="home"
      className="relative overflow-hidden bg-white pt-24 pb-16"
    >
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div>
            {/* Main Headline */}
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Publiez sur <span style={{ color: '#9B6BFF' }}>tous vos réseaux</span> en un instant
            </h1>

            {/* Subtitle */}
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Fini de publier manuellement. LumaPost automatise vos publications sur TikTok, Instagram, LinkedIn, X et YouTube. Automatisez en un clic.
            </p>

            {/* Features List */}
            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: '#9B6BFF' }}>
                  <Check className="w-3 h-3 text-white" strokeWidth={3} />
                </div>
                <span className="text-gray-700">Publication simultanée sur toutes vos plateformes</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: '#9B6BFF' }}>
                  <Check className="w-3 h-3 text-white" strokeWidth={3} />
                </div>
                <span className="text-gray-700">Programmation automatique optimisée</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: '#9B6BFF' }}>
                  <Check className="w-3 h-3 text-white" strokeWidth={3} />
                </div>
                <span className="text-gray-700">Génération d&apos;idées avec IA</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: '#9B6BFF' }}>
                  <Check className="w-3 h-3 text-white" strokeWidth={3} />
                </div>
                <span className="text-gray-700">Import Google Drive + banques d&apos;images</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <Link href="/auth">
                <Button className="text-white text-base font-semibold px-8 py-6 rounded-lg transition-all hover:opacity-90 shadow-lg" style={{ backgroundColor: '#9B6BFF' }}>
                  Commencez maintenant
                </Button>
              </Link>
              <Link href="#pricing">
                <Button variant="outline" className="text-gray-700 border-2 border-gray-300 text-base font-semibold px-8 py-6 rounded-lg hover:bg-gray-50">
                  Voir les tarifs
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Column - Social Platforms Animation */}
          <div className="relative flex items-center justify-center lg:justify-end">
            <div className="relative w-full max-w-md aspect-square">
              {/* Central Plus Button */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                <div className="w-24 h-24 rounded-full flex items-center justify-center shadow-2xl" style={{ backgroundColor: '#9B6BFF' }}>
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                {/* Pulse rings */}
                <div className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ backgroundColor: '#9B6BFF' }}></div>
              </div>

              {/* Social Media Icons - Positioned Around Center */}
              {/* Facebook - Top Left */}
              <div className="absolute top-8 left-8 w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                <FaFacebook className="w-8 h-8 text-white" />
              </div>

              {/* Instagram - Top Right */}
              <div className="absolute top-8 right-8 w-16 h-16 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                <FaInstagram className="w-8 h-8 text-white" />
              </div>

              {/* LinkedIn - Middle Right */}
              <div className="absolute top-1/2 -translate-y-1/2 right-0 w-16 h-16 bg-blue-700 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                <FaLinkedin className="w-8 h-8 text-white" />
              </div>

              {/* X (Twitter) - Bottom Left */}
              <div className="absolute bottom-16 left-0 w-16 h-16 bg-black rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                <FaXTwitter className="w-8 h-8 text-white" />
              </div>

              {/* YouTube - Bottom Center */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                <FaYoutube className="w-8 h-8 text-white" />
              </div>

              {/* TikTok - Middle Left */}
              <div className="absolute top-1/2 -translate-y-1/2 left-0 w-16 h-16 bg-black rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                <FaTiktok className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
