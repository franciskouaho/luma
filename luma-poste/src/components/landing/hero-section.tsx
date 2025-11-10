"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
import {
  FaXTwitter,
  FaInstagram,
  FaLinkedin,
  FaFacebook,
  FaTiktok,
  FaYoutube,
  FaPinterest,
} from "react-icons/fa6";
import { SiBluesky, SiThreads } from "react-icons/si";
import { useMemo } from "react";

export default function HeroSection() {
  const socialPlatforms = useMemo(
    () => [
      {
        name: "X",
        icon: FaXTwitter,
        bgColor: "bg-gray-900",
        iconColor: "text-white",
      },
      {
        name: "Instagram",
        icon: FaInstagram,
        bgColor: "bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500",
        iconColor: "text-white",
      },
      {
        name: "LinkedIn",
        icon: FaLinkedin,
        bgColor: "bg-blue-600",
        iconColor: "text-white",
      },
      {
        name: "Facebook",
        icon: FaFacebook,
        bgColor: "bg-blue-500",
        iconColor: "text-white",
      },
      {
        name: "TikTok",
        icon: FaTiktok,
        bgColor: "bg-gray-900",
        iconColor: "text-white",
      },
      {
        name: "YouTube",
        icon: FaYoutube,
        bgColor: "bg-red-600",
        iconColor: "text-white",
      },
      {
        name: "Bluesky",
        icon: SiBluesky,
        bgColor: "bg-blue-400",
        iconColor: "text-white",
      },
      {
        name: "Threads",
        icon: SiThreads,
        bgColor: "bg-gray-900",
        iconColor: "text-white",
      },
      {
        name: "Pinterest",
        icon: FaPinterest,
        bgColor: "bg-red-500",
        iconColor: "text-white",
      },
    ],
    [],
  );

  const testimonials = useMemo(
    () => [
      {
        name: "User 1",
        bgColor: "bg-gradient-to-br from-blue-400 to-blue-600",
      },
      {
        name: "User 2",
        bgColor: "bg-gradient-to-br from-purple-400 to-purple-600",
      },
      {
        name: "User 3",
        bgColor: "bg-gradient-to-br from-pink-400 to-pink-600",
      },
      {
        name: "User 4",
        bgColor: "bg-gradient-to-br from-orange-400 to-orange-600",
      },
      {
        name: "User 5",
        bgColor: "bg-gradient-to-br from-green-400 to-green-600",
      },
    ],
    [],
  );

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white pt-20"
    >
      {/* Background Effects - Optimized with will-change for better performance */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-gradient-to-r from-purple-100 to-purple-200 rounded-full blur-3xl opacity-60 will-change-transform"></div>
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-200 to-purple-100 rounded-full blur-3xl opacity-60 will-change-transform"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Social Media Platforms */}
        <div className="flex justify-center mb-10">
          <div className="flex flex-wrap justify-center gap-3">
            {socialPlatforms.map((platform, index) => {
              const Icon = platform.icon;
              return (
                <div
                  key={platform.name}
                  className={`w-12 h-12 rounded-xl ${platform.bgColor} flex items-center justify-center ${platform.iconColor} shadow-sm hover:scale-110 transition-transform duration-200 will-change-transform`}
                  role="img"
                  aria-label={`${platform.name} platform`}
                >
                  <Icon className="w-6 h-6" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="text-center max-w-4xl mx-auto">
          {/* Main Headline */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight tracking-tight">
            The social media
            <br />
            scheduler for founders
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-gray-600 mb-10 leading-relaxed max-w-2xl mx-auto font-normal">
            post to all social platforms from one dashboard. easy to use, fairly
            priced, with human support from jack 🧑‍💻.
          </p>

          {/* CTA Button */}
          <div className="mb-12">
            <Link href="/auth" prefetch={true}>
              <Button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-10 py-6 text-lg font-semibold rounded-xl transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/30 flex items-center gap-2 mx-auto will-change-transform">
                Essayer gratuitement
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>

          {/* Social Proof */}
          <div className="flex items-center justify-center gap-3 mb-16">
            <div className="flex -space-x-3">
              {testimonials.map((user, index) => (
                <div
                  key={user.name}
                  className={`w-11 h-11 ${user.bgColor} rounded-full border-2 border-white shadow-sm`}
                  title={user.name}
                  role="img"
                  aria-label={`Avatar de ${user.name}`}
                />
              ))}
            </div>
            <p className="text-sm text-gray-600 ml-2">
              Utilisé par{" "}
              <span className="font-semibold text-gray-900">1,392</span> clients
              satisfaits
            </p>
          </div>
        </div>

        {/* Video Demo Section */}
        <div className="mt-12 max-w-6xl mx-auto">
          <div className="relative bg-white rounded-2xl overflow-hidden shadow-2xl border border-gray-200">
            {/* Mock Interface Header */}
            <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex items-center gap-3">
              <div className="flex gap-2" role="presentation">
                <div
                  className="w-3 h-3 rounded-full bg-red-400"
                  aria-label="Fermer"
                ></div>
                <div
                  className="w-3 h-3 rounded-full bg-yellow-400"
                  aria-label="Réduire"
                ></div>
                <div
                  className="w-3 h-3 rounded-full bg-green-400"
                  aria-label="Agrandir"
                ></div>
              </div>
              <div className="text-sm text-gray-600 font-medium">
                Créer un nouveau post
              </div>
            </div>

            {/* Mock Interface Content with Video Overlay */}
            <div className="relative bg-gradient-to-br from-gray-50 to-white p-8">
              <div className="grid grid-cols-3 gap-6 mb-8">
                {/* Text Post Card */}
                <div
                  className="bg-white border-2 border-gray-200 rounded-xl p-6 text-center hover:border-emerald-400 transition-colors cursor-pointer will-change-transform"
                  role="button"
                  tabIndex={0}
                >
                  <div className="text-3xl mb-3" role="img" aria-label="Texte">
                    📝
                  </div>
                  <div className="text-sm font-medium text-gray-700">
                    Post Texte
                  </div>
                </div>

                {/* Image Post Card */}
                <div
                  className="bg-white border-2 border-gray-200 rounded-xl p-6 text-center hover:border-emerald-400 transition-colors cursor-pointer will-change-transform"
                  role="button"
                  tabIndex={0}
                >
                  <div className="text-3xl mb-3" role="img" aria-label="Image">
                    🖼️
                  </div>
                  <div className="text-sm font-medium text-gray-700">
                    Post Image
                  </div>
                </div>

                {/* Video Post Card */}
                <div
                  className="bg-white border-2 border-gray-200 rounded-xl p-6 text-center hover:border-emerald-400 transition-colors cursor-pointer will-change-transform"
                  role="button"
                  tabIndex={0}
                >
                  <div className="text-3xl mb-3" role="img" aria-label="Vidéo">
                    🎥
                  </div>
                  <div className="text-sm font-medium text-gray-700">
                    Post Vidéo
                  </div>
                </div>
              </div>

              {/* YouTube Video Overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/5 backdrop-blur-[2px]">
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden w-[500px]">
                  <div className="aspect-video bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center relative">
                    <Button
                      className="bg-red-600 hover:bg-red-700 text-white rounded-full p-5 transition-all duration-300 hover:scale-110 z-10 will-change-transform"
                      aria-label="Lire la vidéo de démonstration"
                    >
                      <div className="w-0 h-0 border-l-[18px] border-l-white border-t-[11px] border-t-transparent border-b-[11px] border-b-transparent ml-1"></div>
                    </Button>
                    <div className="absolute top-3 left-3 bg-black/80 text-white px-3 py-1 rounded text-xs font-medium">
                      Comment utiliser LumaPost ! (démo)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
