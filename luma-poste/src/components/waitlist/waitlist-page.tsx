"use client";

import { useState, useEffect, FormEvent } from "react";
import { Check, Sparkles } from "lucide-react";
import Image from "next/image";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";
import { motion } from "framer-motion";

export default function WaitlistPage() {
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [signupsCount, setSignupsCount] = useState(130); // Valeur par défaut (offset)

  // Charger le nombre d'inscriptions au démarrage
  useEffect(() => {
    const fetchSignupsCount = async () => {
      try {
        const response = await fetch("/api/waitlist/count");
        const data = await response.json();
        if (data.success) {
          setSignupsCount(data.count);
        }
      } catch (err) {
        console.error("Erreur lors du chargement du compteur:", err);
        // Garder la valeur par défaut en cas d'erreur
      }
    };

    fetchSignupsCount();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!firstName.trim() || !email.trim()) {
      setError("Veuillez remplir tous les champs");
      return;
    }

    if (!email.includes("@")) {
      setError("Email invalide");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Ajouter à Firestore
      await addDoc(collection(db, "waitlist"), {
        firstName: firstName.trim(),
        email: email.toLowerCase().trim(),
        createdAt: serverTimestamp(),
        source: "web"
      });

      setSuccess(true);
      setFirstName("");
      setEmail("");

      // Incrémenter le compteur localement
      setSignupsCount(prev => prev + 1);
    } catch (err) {
      console.error("Erreur lors de l'inscription:", err);
      setError("Une erreur est survenue. Réessayez.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col overflow-hidden relative">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-[#9B6BFF]/10 rounded-full blur-3xl opacity-60" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-100/50 rounded-full blur-3xl opacity-60" />
      </div>

      {/* Header */}
      <header className="border-b border-gray-100/50 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden">
                <Image
                  src="/logo.png"
                  alt="LumaPost Logo"
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
              <span className="text-xl font-bold text-gray-900 tracking-tight">LumaPost</span>
            </div>

            {/* Follow Launch Button */}
            <a
              href="#waitlist"
              className="group relative inline-flex items-center justify-center px-6 py-2.5 text-sm font-semibold text-white transition-all duration-200 rounded-lg hover:opacity-90 hover:shadow-lg hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#9B6BFF]"
              style={{ backgroundColor: '#9B6BFF' }}
            >
              Suivre le lancement
              <Sparkles className="w-4 h-4 ml-2 text-yellow-400 group-hover:rotate-12 transition-transform" />
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-3 mb-10 bg-white p-1.5 pr-6 rounded-full shadow-sm border border-gray-200/60 hover:border-[#9B6BFF]/30 transition-colors"
          >
            <span className="inline-flex items-center px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold uppercase tracking-wide border border-green-100">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2 animate-pulse" />
              En développement
            </span>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <div className="flex -space-x-2">
                {[
                  { l: 'M', c: '#9B6BFF' },
                  { l: 'T', c: '#F97316' },
                  { l: 'S', c: '#EC4899' },
                  { l: 'J', c: '#3B82F6' }
                ].map((avatar, i) => (
                  <div
                    key={i}
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold ring-2 ring-white"
                    style={{ backgroundColor: avatar.c }}
                  >
                    {avatar.l}
                  </div>
                ))}
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-bold text-gray-900">{signupsCount}</span>
                <span className="text-gray-500">créateurs inscrits</span>
              </div>
            </div>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold text-gray-900 mb-8 leading-[1.1] tracking-tight"
          >
            Publiez sur tous vos réseaux{" "}
            <span style={{ color: '#9B6BFF' }}>
              10x plus rapidement
            </span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed font-medium"
          >
            Gagne du temps avec une plateforme tout en un. Automatise tes publications, programme ton contenu, et développe ta présence. Rejoins la waitlist aujourd&apos;hui
          </motion.p>

          {/* Waitlist Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            id="waitlist"
            className="max-w-md mx-auto mb-16"
          >
            {success ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center"
              >
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-600" strokeWidth={3} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Tu es inscrit !
                </h3>
                <p className="text-gray-600">
                  On te tiendra au courant dès le lancement. Merci de ta confiance ! 🚀
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 bg-white p-2 rounded-2xl shadow-xl shadow-[#9B6BFF]/5 border border-gray-100">
                <div className="flex flex-col gap-3 p-2">
                  <input
                    type="text"
                    placeholder="Prénom..."
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    disabled={loading}
                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9B6BFF]/20 focus:border-[#9B6BFF] transition-all disabled:opacity-50 font-medium"
                  />
                  <input
                    type="email"
                    placeholder="Email..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9B6BFF]/20 focus:border-[#9B6BFF] transition-all disabled:opacity-50 font-medium"
                  />
                </div>

                {error && (
                  <div className="px-2">
                    <p className="text-sm text-red-600 font-medium flex items-center gap-2 bg-red-50 p-3 rounded-lg">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                      {error}
                    </p>
                  </div>
                )}

                <div className="p-2 pt-0">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full text-white text-lg font-bold px-8 py-4 rounded-xl transition-all hover:opacity-90 shadow-lg shadow-[#9B6BFF]/25 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
                    style={{ backgroundColor: '#9B6BFF' }}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Inscription...
                      </span>
                    ) : (
                      "Rejoindre la waitlist"
                    )}
                  </button>

                  <p className="text-xs text-gray-400 mt-3 font-medium">
                    Essai gratuit 7 jours. Sans engagement.
                  </p>
                </div>
              </form>
            )}
          </motion.div>

          {/* Product Screenshot/Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="relative max-w-5xl mx-auto"
          >
            <div className="bg-white rounded-2xl shadow-2xl shadow-[#9B6BFF]/10 border border-gray-200/80 overflow-hidden ring-1 ring-gray-900/5">
              {/* Mock Browser Header */}
              <div className="bg-gray-50/80 backdrop-blur-sm border-b border-gray-200 px-4 py-3 flex items-center gap-4">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#FF5F57] border border-[#E0443E]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#FEBC2E] border border-[#D89E24]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#28C840] border border-[#1AAB29]"></div>
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="px-4 py-1 bg-white rounded-md border border-gray-200 text-xs font-medium text-gray-500 flex items-center gap-2 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    lumapost.com
                  </div>
                </div>
                <div className="w-16"></div> {/* Spacer for centering */}
              </div>

              {/* Screenshot */}
              <div className="relative w-full group cursor-default">
                <Image
                  src="/luma-waitlist.png"
                  alt="LumaPost Dashboard Preview"
                  width={1920}
                  height={1080}
                  className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-[1.01]"
                  priority
                />

                {/* Overlay gradient on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#9B6BFF]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              </div>
            </div>

            {/* Floating badges - desktop uniquement */}
            {[
              {
                icon: "⚡",
                title: "Gain de temps",
                tag: "Publier",
                color: "#9B6BFF",
                bgColor: "bg-purple-50",
                textColor: "text-purple-700",
                tagBg: "bg-purple-100",
                pos: "-left-12 top-1/4",
                rot: "-rotate-6"
              },
              {
                icon: "🚀",
                title: "Programmation",
                tag: "Auto-post",
                color: "#10B981",
                bgColor: "bg-green-50",
                textColor: "text-green-700",
                tagBg: "bg-green-100",
                pos: "-right-12 top-1/4",
                rot: "rotate-6"
              },
              {
                icon: "📊",
                title: "Analytics",
                tag: "Stats",
                color: "#F97316",
                bgColor: "bg-orange-50",
                textColor: "text-orange-700",
                tagBg: "bg-orange-100",
                pos: "-left-8 bottom-1/4",
                rot: "rotate-3"
              },
              {
                icon: "🎯",
                title: "Multi-comptes",
                tag: "TikTok",
                color: "#EC4899",
                bgColor: "bg-pink-50",
                textColor: "text-pink-700",
                tagBg: "bg-pink-100",
                pos: "-right-8 bottom-1/3",
                rot: "-rotate-3"
              }
            ].map((badge, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.6 + (i * 0.1), duration: 0.5 }}
                className={`hidden lg:block absolute ${badge.pos} bg-white/90 backdrop-blur-md rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/50 px-5 py-4 transform ${badge.rot} hover:scale-110 hover:rotate-0 transition-all duration-300 cursor-default z-20`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-inner text-white"
                    style={{ backgroundColor: badge.color }}
                  >
                    {badge.icon}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{badge.title}</p>
                    <span
                      className="inline-block mt-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide"
                      style={{ backgroundColor: `${badge.color}20`, color: badge.color }}
                    >
                      {badge.tag}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Features grid - mobile uniquement */}
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4 lg:hidden">
            {[
              { icon: "⚡", title: "Gain de temps", tag: "Publier", color: "#9B6BFF" },
              { icon: "🚀", title: "Programmation", tag: "Auto-post", color: "#10B981" },
              { icon: "📊", title: "Analytics", tag: "Stats", color: "#F97316" },
              { icon: "🎯", title: "Multi-comptes", tag: "TikTok", color: "#EC4899" }
            ].map((feature, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 px-5 py-4 flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl text-white"
                  style={{ backgroundColor: feature.color }}
                >
                  {feature.icon}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{feature.title}</p>
                  <span
                    className="inline-block mt-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide"
                    style={{ backgroundColor: `${feature.color}20`, color: feature.color }}
                  >
                    {feature.tag}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white/50 backdrop-blur-sm py-8 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center shadow-md">
                <Image
                  src="/logo.png"
                  alt="LumaPost Logo"
                  width={20}
                  height={20}
                  className="object-contain invert brightness-0"
                />
              </div>
              <span className="text-sm font-bold text-gray-900">LumaPost</span>
            </div>

            <div className="flex gap-8 text-sm font-medium text-gray-500">
              <a href="#" className="hover:text-[#9B6BFF] transition-colors">Mentions légales</a>
              <a href="#" className="hover:text-[#9B6BFF] transition-colors">Confidentialité</a>
              <a href="#" className="hover:text-[#9B6BFF] transition-colors">Contact</a>
            </div>

            <p className="text-sm text-gray-400 font-medium">
              © 2025 LumaPost. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
