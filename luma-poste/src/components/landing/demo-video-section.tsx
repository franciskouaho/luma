"use client";

import { Check, Play } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useRef } from "react";

export default function DemoVideoSection() {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const features = [
    "Tour complet de l'interface",
    "Démonstration de publication multi-plateforme",
    "Gestion du calendrier et programmation"
  ];

  const handlePlayClick = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVideoEnd = () => {
    setIsPlaying(false);
  };

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

          {/* Right Column - Video Player */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            {/* Browser Window Container */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-white group">
              {/* Browser Header */}
              <div className="bg-gradient-to-r from-gray-100 to-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white px-4 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                  <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                  <span className="text-xs text-gray-600 font-medium">lumapost.app/demo</span>
                </div>
                <div className="w-20"></div>
              </div>

              {/* Video Container */}
              <div className="relative aspect-video bg-white flex items-center justify-center overflow-hidden">
                {/* Video Element */}
                <video
                  ref={videoRef}
                  className="absolute inset-0 w-full h-full object-cover"
                  onEnded={handleVideoEnd}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  controls={isPlaying}
                  preload="metadata"
                >
                  <source src="/demo.mp4" type="video/mp4" />
                  Votre navigateur ne supporte pas la lecture de vidéos.
                </video>

                {/* Overlay when not playing */}
                {!isPlaying && (
                  <div className="absolute inset-0 bg-black/5 backdrop-blur-[2px] flex items-center justify-center">
                    {/* Title Overlay - Top Left */}
                    <div className="absolute top-6 left-6 bg-gray-900/90 backdrop-blur-md text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-xl border border-white/10">
                      Démo complète de LumaPost
                    </div>

                    {/* Play Button - Center */}
                    <button
                      onClick={handlePlayClick}
                      className="relative z-20 w-28 h-28 rounded-full bg-[#9B6BFF] flex items-center justify-center transition-all duration-300 hover:scale-110 hover:bg-[#8855FF] shadow-2xl shadow-purple-500/40 group-hover:shadow-purple-500/60"
                      aria-label="Lire la vidéo"
                    >
                      <Play className="w-8 h-8 text-white fill-current ml-1.5" />
                    </button>

                    {/* Duration Badge - Bottom Right */}
                    <div className="absolute bottom-6 right-6 bg-gray-900/90 backdrop-blur-md text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-xl border border-white/10">
                      2:30
                    </div>
                  </div>
                )}
              </div>

              {/* Footer with Text */}
              <div className="bg-white px-6 py-4 border-t border-gray-100">
                <p className="text-center text-gray-800">
                  Publier du contenu ne devrait pas être aussi <span className="text-[#9B6BFF] font-semibold">difficile</span>
                </p>
              </div>
            </div>

            {/* Decorative Blur Background */}
            <div className="absolute -inset-6 bg-gradient-to-r from-purple-400/20 via-pink-400/20 to-purple-400/20 rounded-3xl opacity-40 blur-3xl -z-10 group-hover:opacity-60 transition-opacity duration-500" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
