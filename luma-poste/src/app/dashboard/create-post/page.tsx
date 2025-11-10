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
} from "lucide-react";
import { useConnectedAccounts } from "@/hooks/use-connected-accounts";

// Icône TikTok personnalisée
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
);

export default function DashboardPage() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const { isPlatformConnected } = useConnectedAccounts();

  // Fonction pour vérifier si un type de post est disponible
  const isPostTypeAvailable = (platforms: string[]) => {
    return platforms.some((platform) => isPlatformConnected(platform));
  };

  const postTypes = [
    {
      id: "text",
      name: "Text Post",
      description:
        "Create a simple text-based post for your social media accounts",
      icon: Type,
      color: "from-blue-500 to-blue-600",
      iconColor: "text-gray-500",
      bgGradient: "from-blue-50 to-blue-100/50",
      platforms: ["twitter", "linkedin", "instagram"],
      platformIcons: [
        { name: "Twitter", icon: Twitter, color: "text-blue-500" },
        { name: "LinkedIn", icon: Linkedin, color: "text-blue-700" },
        { name: "Instagram", icon: Instagram, color: "text-pink-500" },
      ],
      isAvailable: true,
    },
    {
      id: "image",
      name: "Image Post",
      description:
        "Upload and share images with captions across your platforms",
      icon: Image,
      color: "from-green-500 to-green-600",
      iconColor: "text-gray-500",
      bgGradient: "from-green-50 to-green-100/50",
      platforms: ["instagram", "twitter", "linkedin"],
      platformIcons: [
        { name: "Instagram", icon: Instagram, color: "text-pink-500" },
        { name: "Twitter", icon: Twitter, color: "text-blue-500" },
        { name: "LinkedIn", icon: Linkedin, color: "text-blue-700" },
      ],
      isAvailable: true,
    },
    {
      id: "video",
      name: "Video Post",
      description: "Upload and share videos with captions and hashtags",
      icon: Video,
      color: "from-purple-500 to-purple-600",
      iconColor: "text-purple-600",
      bgGradient: "from-purple-50 to-purple-100/50",
      platforms: ["youtube", "instagram", "tiktok"],
      platformIcons: [
        { name: "YouTube", icon: Youtube, color: "text-red-600" },
        { name: "Instagram", icon: Instagram, color: "text-pink-500" },
        { name: "TikTok", icon: TikTokIcon, color: "text-black" },
      ],
      isAvailable: true,
    },
    {
      id: "carousel",
      name: "Carousel Post",
      description: "Create multi-image posts for Instagram and LinkedIn",
      icon: Mountain,
      color: "from-orange-500 to-orange-600",
      iconColor: "text-orange-600",
      bgGradient: "from-orange-50 to-orange-100/50",
      platforms: ["instagram", "linkedin"],
      platformIcons: [
        { name: "Instagram", icon: Instagram, color: "text-pink-500" },
        { name: "LinkedIn", icon: Linkedin, color: "text-blue-700" },
      ],
      isAvailable: true,
    },
  ];

  const availablePostTypes = postTypes.filter((pt) => pt.isAvailable).length;
  const totalPostTypes = postTypes.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modern Sticky Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Create New Post
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Choose your content type and publish across platforms
              </p>
            </div>
            <Link
              href="/dashboard/accounts"
              className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Connect Account
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg p-5 border border-gray-200 hover:border-purple-300 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-purple-600 uppercase tracking-wide mb-1">
                  Available Types
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {availablePostTypes}/{totalPostTypes}
                </p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-5 border border-gray-200 hover:border-purple-300 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Quick Create
                </p>
                <p className="text-2xl font-bold text-gray-900">Ready</p>
              </div>
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-gray-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-5 border border-gray-200 hover:border-purple-300 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Multi-Platform
                </p>
                <p className="text-2xl font-bold text-gray-900">Enabled</p>
              </div>
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <ArrowRight className="w-5 h-5 text-gray-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Post Type Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {postTypes.map((postType) => {
            const Icon = postType.icon;
            const isAvailable = postType.isAvailable;

            return (
              <div
                key={postType.id}
                className="relative"
                onMouseEnter={() => isAvailable && setHoveredCard(postType.id)}
                onMouseLeave={() => isAvailable && setHoveredCard(null)}
              >
                {isAvailable ? (
                  <Link href={`/dashboard/create-post/${postType.id}`}>
                    <div
                      className={`bg-white rounded-lg overflow-hidden border border-gray-200 transition-colors cursor-pointer ${
                        hoveredCard === postType.id
                          ? "border-purple-300"
                          : "hover:border-purple-200"
                      }`}
                    >
                      {/* Header */}
                      <div className="relative p-6 bg-gray-50 border-b border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                          <div className={`w-10 h-10 ${postType.id === 'video' ? 'bg-purple-100' : 'bg-gray-100'} rounded-lg flex items-center justify-center`}>
                            <Icon className={`w-5 h-5 ${postType.id === 'video' ? 'text-purple-600' : 'text-gray-600'}`} />
                          </div>
                          <div className="px-3 py-1 bg-white rounded-full text-xs font-medium text-gray-600 border border-gray-200">
                            Available
                          </div>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">
                          {postType.name}
                        </h3>
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        <p className="text-sm text-gray-600 mb-6 line-clamp-2 leading-relaxed">
                          {postType.description}
                        </p>

                        {/* Platforms */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                              Platforms
                            </span>
                            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full font-medium">
                              {postType.platformIcons.length}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {postType.platformIcons.map((platform) => {
                              const PlatformIcon = platform.icon;
                              return (
                                <div
                                  key={platform.name}
                                  className="w-10 h-10 bg-white rounded-lg shadow-sm border border-gray-200 flex items-center justify-center hover:scale-110 transition-transform duration-200"
                                  title={platform.name}
                                >
                                  <PlatformIcon
                                    className={`h-5 w-5 ${platform.color}`}
                                  />
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* CTA */}
                        <button
                          className={`w-full py-2.5 bg-gradient-to-r ${postType.color} text-white text-sm font-semibold rounded-lg hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 group/btn`}
                        >
                          Create {postType.name}
                          <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    </div>
                  </Link>
                ) : (
                  <div className="bg-white rounded-lg overflow-hidden border border-gray-200 opacity-50 cursor-not-allowed">
                    {/* Header */}
                    <div className="relative p-6 bg-gray-50 border-b border-gray-200">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Icon className="w-5 h-5 text-gray-400" />
                        </div>
                        <div className="px-3 py-1 bg-gray-200 rounded-full text-xs font-medium text-gray-500 flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          Locked
                        </div>
                      </div>
                      <h3 className="text-lg font-bold text-gray-400">
                        {postType.name}
                      </h3>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <p className="text-sm text-gray-400 mb-6 line-clamp-2 leading-relaxed">
                        {postType.description}
                      </p>

                      {/* Platforms */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                            Platforms
                          </span>
                          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-400 rounded-full font-medium">
                            {postType.platformIcons.length}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {postType.platformIcons.map((platform) => {
                            const PlatformIcon = platform.icon;
                            return (
                              <div
                                key={platform.name}
                                className="w-10 h-10 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center"
                                title={platform.name}
                              >
                                <PlatformIcon className="h-5 w-5 text-gray-400" />
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* CTA disabled */}
                      <button
                        disabled
                        className="w-full py-2.5 bg-gray-200 text-gray-400 text-sm font-medium rounded-lg cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <Lock className="w-4 h-4" />
                        Connect Account
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 bg-white rounded-lg p-8 border border-gray-200">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Plus className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  Unlock More Post Types
                </h3>
                <p className="text-sm text-gray-600">
                  Connect additional social media accounts to access all
                  features
                </p>
              </div>
            </div>
            <Link
              href="/dashboard/accounts"
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
            >
              Connect Accounts
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
