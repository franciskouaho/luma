"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Check, ArrowRight, Star, PlayCircle } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <section
      id="home"
      className="relative overflow-hidden bg-white pt-32 pb-20 lg:pt-40 lg:pb-32"
    >
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
        <div className="absolute top-20 left-0 w-[500px] h-[500px] bg-purple-100/50 rounded-full blur-3xl -translate-x-1/2" />
        <div className="absolute top-40 right-0 w-[500px] h-[500px] bg-blue-100/50 rounded-full blur-3xl translate-x-1/2" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Column - Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-100 text-purple-700 text-sm font-medium mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
              </span>
              Nouvelle version disponible
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-[1.1] tracking-tight">
              Publiez sur <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
                tous vos réseaux
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-lg">
              LumaPost automatise vos publications sur TikTok, Instagram, LinkedIn, X et YouTube. Gagnez 10h par semaine.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 mb-10">
              <Link href="/auth">
                <Button className="h-14 px-8 text-lg rounded-xl shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all hover:-translate-y-0.5 text-white" style={{ backgroundColor: '#9B6BFF' }}>
                  Commencer gratuitement
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>

            {/* Social Proof */}
            <div className="flex items-center gap-4 text-sm font-medium text-gray-600">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className={`w-10 h-10 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-white shadow-sm ${['bg-purple-500', 'bg-blue-500', 'bg-pink-500', 'bg-orange-500'][i - 1]
                    }`}>
                    {['JD', 'AM', 'SL', 'KR'][i - 1]}
                  </div>
                ))}
              </div>
              <div className="flex flex-col">
                <div className="flex text-yellow-400">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <span>+1000 créateurs nous font confiance</span>
              </div>
            </div>
          </motion.div>

          {/* Right Column - 3D Dashboard Visual */}
          <div className="relative perspective-[2000px]">
            <motion.div
              initial={{ opacity: 0, rotateX: 10, rotateY: -10, scale: 0.9 }}
              animate={{ opacity: 1, rotateX: 0, rotateY: 0, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
              className="relative z-10"
            >
              {/* Main Card */}
              <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200/60 overflow-hidden backdrop-blur-sm transform transition-transform hover:scale-[1.02] duration-500">
                <div className="bg-gray-50/80 border-b border-gray-200/60 px-4 py-3 flex items-center gap-2 backdrop-blur-md">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-400/80" />
                  </div>
                  <div className="flex-1 text-center text-[10px] text-gray-400 font-medium font-mono">
                    lumapost.app/dashboard
                  </div>
                </div>
                <div className="relative aspect-[16/10] w-full bg-gray-100">
                  <Image
                    src="/luma-waitlist.png"
                    alt="LumaPost Dashboard"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              </div>

              {/* Floating Element 1: Status (Top Left) */}
              <motion.div
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -left-8 top-1/4 bg-white p-4 rounded-2xl shadow-xl border border-gray-100 z-20 max-w-[180px] hidden md:block"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                    <Check className="w-5 h-5" strokeWidth={3} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Statut</p>
                    <p className="text-sm font-bold text-gray-900">Publié ✅</p>
                  </div>
                </div>
              </motion.div>

              {/* Floating Element 2: Engagement (Bottom Right) */}
              <motion.div
                animate={{ y: [0, 15, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -right-8 bottom-1/4 bg-white p-4 rounded-2xl shadow-xl border border-gray-100 z-20 hidden md:block"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                    <Star className="w-5 h-5 fill-current" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Engagement</p>
                    <p className="text-sm font-bold text-gray-900">+124% 🚀</p>
                  </div>
                </div>
              </motion.div>

              {/* Floating Element 3: Scheduled (Top Right) */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute -right-4 top-12 bg-white p-3 rounded-xl shadow-lg border border-gray-100 z-20 hidden md:flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 font-medium">Programmé</p>
                  <p className="text-xs font-bold text-gray-900">Demain, 18h 📅</p>
                </div>
              </motion.div>

              {/* Floating Element 4: New Comment (Bottom Left) */}
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                className="absolute -left-4 bottom-20 bg-white p-3 rounded-xl shadow-lg border border-gray-100 z-20 hidden md:flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-600">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 font-medium">Nouveau commentaire</p>
                  <p className="text-xs font-bold text-gray-900">Super post ! 🔥</p>
                </div>
              </motion.div>
            </motion.div>

            {/* Decorative Blobs */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-purple-200/30 to-blue-200/30 rounded-full blur-3xl -z-10" />
          </div>
        </div>
      </div>
    </section>
  );
}
