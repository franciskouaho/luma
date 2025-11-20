"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Type,
  Image,
  Video,
  Twitter,
  Linkedin,
  Instagram,
  Youtube,
  Mountain,
  Lock,
  Plus,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  LayoutTemplate,
  Wand2,
} from "lucide-react";
import { useConnectedAccounts } from "@/hooks/use-connected-accounts";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

// Icône TikTok personnalisée
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
);

export default function CreatePostPage() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const { isPlatformConnected } = useConnectedAccounts();

  const postTypes = [
    {
      id: "text",
      name: "Post Texte",
      description:
        "Créez un post simple basé sur du texte pour vos réseaux sociaux",
      icon: Type,
      color: "text-blue-600",
      bg: "bg-blue-50",
      gradient: "from-blue-500 to-cyan-500",
      platforms: ["twitter", "linkedin", "instagram"],
      platformIcons: [
        { name: "Twitter", icon: Twitter, color: "text-blue-400" },
        { name: "LinkedIn", icon: Linkedin, color: "text-blue-700" },
        { name: "Instagram", icon: Instagram, color: "text-pink-600" },
      ],
      isAvailable: false,
    },
    {
      id: "image",
      name: "Post Image",
      description:
        "Partagez des images avec des légendes sur vos plateformes",
      icon: Image,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      gradient: "from-emerald-500 to-teal-500",
      platforms: ["instagram", "twitter", "linkedin"],
      platformIcons: [
        { name: "Instagram", icon: Instagram, color: "text-pink-600" },
        { name: "Twitter", icon: Twitter, color: "text-blue-400" },
        { name: "LinkedIn", icon: Linkedin, color: "text-blue-700" },
      ],
      isAvailable: false,
    },
    {
      id: "video",
      name: "Post Vidéo",
      description: "Publiez des vidéos avec légendes et hashtags optimisés",
      icon: Video,
      color: "text-purple-600",
      bg: "bg-purple-50",
      gradient: "from-purple-600 to-indigo-600",
      platforms: ["youtube", "instagram", "tiktok"],
      platformIcons: [
        { name: "YouTube", icon: Youtube, color: "text-red-600" },
        { name: "Instagram", icon: Instagram, color: "text-pink-600" },
        { name: "TikTok", icon: TikTokIcon, color: "text-black" },
      ],
      isAvailable: true,
    },
    {
      id: "carousel",
      name: "Carrousel",
      description: "Créez des posts multi-images pour Instagram et LinkedIn",
      icon: LayoutTemplate,
      color: "text-orange-600",
      bg: "bg-orange-50",
      gradient: "from-orange-500 to-red-500",
      platforms: ["instagram", "linkedin"],
      platformIcons: [
        { name: "Instagram", icon: Instagram, color: "text-pink-600" },
        { name: "LinkedIn", icon: Linkedin, color: "text-blue-700" },
      ],
      isAvailable: false,
    },
  ];

  const availablePostTypes = postTypes.filter((pt) => pt.isAvailable).length;
  const totalPostTypes = postTypes.length;

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 lg:p-8">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="max-w-7xl mx-auto space-y-8"
      >
        {/* Header */}
        <motion.div variants={item} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              Créer un nouveau post
            </h1>
            <p className="text-gray-500 mt-1">
              Choisissez votre type de contenu et publiez sur vos réseaux
            </p>
          </div>
          <Link href="/dashboard/accounts">
            <Button className="bg-gray-900 hover:bg-gray-800 text-white shadow-lg shadow-gray-900/20 rounded-xl">
              <Plus className="w-4 h-4 mr-2" />
              Connecter un compte
            </Button>
          </Link>
        </motion.div>

        {/* Stats Cards */}
        <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <CheckCircle2 className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-3xl font-bold text-gray-900">
                {availablePostTypes}/{totalPostTypes}
              </span>
            </div>
            <p className="text-sm font-medium text-gray-500">Types disponibles</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-3xl font-bold text-gray-900">Prêt</span>
            </div>
            <p className="text-sm font-medium text-gray-500">Création rapide</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <ArrowRight className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-3xl font-bold text-gray-900">Activé</span>
            </div>
            <p className="text-sm font-medium text-gray-500">Multi-plateforme</p>
          </div>
        </motion.div>

        {/* Post Type Cards */}
        <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {postTypes.map((postType) => {
            const Icon = postType.icon;
            const isAvailable = postType.isAvailable;

            return (
              <div
                key={postType.id}
                className="relative group"
                onMouseEnter={() => isAvailable && setHoveredCard(postType.id)}
                onMouseLeave={() => isAvailable && setHoveredCard(null)}
              >
                {isAvailable ? (
                  <Link href={`/dashboard/create-post/${postType.id}`}>
                    <div className="h-full bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-purple-200 transition-all duration-300 overflow-hidden flex flex-col">
                      {/* Header with Gradient */}
                      <div className={`relative p-6 bg-gradient-to-br ${postType.gradient} opacity-90 group-hover:opacity-100 transition-opacity`}>
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                          <Icon className="w-24 h-24 text-white transform rotate-12 translate-x-4 -translate-y-4" />
                        </div>

                        <div className="relative z-10">
                          <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center mb-4 border border-white/30 shadow-lg">
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <h3 className="text-xl font-bold text-white mb-1">
                            {postType.name}
                          </h3>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold text-white border border-white/30 uppercase tracking-wider">
                              Disponible
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-6 flex-1 flex flex-col justify-between">
                        <div>
                          <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                            {postType.description}
                          </p>

                          {/* Platforms */}
                          <div className="mb-6">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                              Compatible avec
                            </p>
                            <div className="flex items-center gap-2">
                              {postType.platformIcons.map((platform) => {
                                const PlatformIcon = platform.icon;
                                return (
                                  <div
                                    key={platform.name}
                                    className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100 group-hover:border-purple-100 transition-colors"
                                    title={platform.name}
                                  >
                                    <PlatformIcon className={`w-4 h-4 ${platform.color}`} />
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        {/* CTA */}
                        <div className="flex items-center text-purple-600 font-semibold text-sm group-hover:translate-x-1 transition-transform">
                          Commencer
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ) : (
                  <div className="h-full bg-white rounded-2xl border border-gray-100 shadow-sm opacity-60 grayscale hover:grayscale-0 transition-all duration-500 cursor-not-allowed flex flex-col">
                    <div className="p-6 bg-gray-50 border-b border-gray-100 relative overflow-hidden">
                      <div className="absolute top-3 right-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                          <Lock className="w-4 h-4 text-gray-500" />
                        </div>
                      </div>
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-4 border border-gray-200 shadow-sm">
                        <Icon className="w-6 h-6 text-gray-400" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {postType.name}
                      </h3>
                      <span className="px-2 py-0.5 bg-gray-200 rounded-full text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                        Bientôt
                      </span>
                    </div>

                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                          {postType.description}
                        </p>
                        <div className="flex items-center gap-2 opacity-50">
                          {postType.platformIcons.map((platform) => {
                            const PlatformIcon = platform.icon;
                            return (
                              <div
                                key={platform.name}
                                className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100"
                              >
                                <PlatformIcon className="w-4 h-4 text-gray-400" />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div variants={item} className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 shadow-xl text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Wand2 className="w-64 h-64 text-white transform rotate-12 translate-x-16 -translate-y-16" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-inner">
                <Plus className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">
                  Débloquez plus de formats
                </h3>
                <p className="text-gray-300 max-w-md">
                  Connectez d'autres comptes sociaux pour accéder à tous les types de posts et maximiser votre portée.
                </p>
              </div>
            </div>
            <Link href="/dashboard/accounts">
              <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100 border-0 shadow-lg shadow-black/20 rounded-xl font-bold">
                Connecter des comptes
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
