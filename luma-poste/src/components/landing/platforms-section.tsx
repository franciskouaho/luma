"use client";

import { FaFacebook, FaInstagram, FaLinkedin, FaXTwitter, FaYoutube, FaTiktok } from "react-icons/fa6";

export default function PlatformsSection() {
  const platforms = [
    {
      name: "Facebook",
      displayName: "Facebook",
      icon: FaFacebook,
      color: "#1877F2",
      subtitle: "Pages"
    },
    {
      name: "Instagram",
      displayName: "Instagram",
      icon: FaInstagram,
      color: "linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)",
      subtitle: "Profils Professionnels et Créateurs"
    },
    {
      name: "LinkedIn",
      displayName: "LinkedIn",
      icon: FaLinkedin,
      color: "#0A66C2",
      subtitle: "Profils et Pages"
    },
    {
      name: "X",
      displayName: "X (Twitter)",
      icon: FaXTwitter,
      color: "#000000",
      subtitle: "Comptes"
    },
    {
      name: "YouTube",
      displayName: "YouTube",
      icon: FaYoutube,
      color: "#FF0000",
      subtitle: "Chaînes"
    },
    {
      name: "TikTok",
      displayName: "TikTok",
      icon: FaTiktok,
      color: "#000000",
      subtitle: "Comptes"
    }
  ];

  return (
    <section id="platforms" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="text-sm font-semibold uppercase tracking-wide mb-2" style={{ color: '#9B6BFF' }}>
            Plateformes
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Publiez sur <span style={{ color: '#9B6BFF' }}>toutes vos plateformes</span> en un clic
          </h2>
          <p className="text-lg text-gray-600">
            Connectez tous vos comptes sociaux et gérez votre présence en ligne depuis un seul endroit
          </p>
        </div>

        {/* Platform Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {platforms.map((platform, index) => {
            const Icon = platform.icon;
            const isGradient = platform.color.startsWith('linear');

            return (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all text-center group"
              >
                <div className="relative inline-block mb-6">
                  {/* Icon Circle with Badge */}
                  <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center text-white relative"
                    style={isGradient ? { background: platform.color } : { backgroundColor: platform.color }}
                  >
                    <Icon className="w-10 h-10" />
                  </div>
                  {/* Check Badge */}
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#9B6BFF' }}>
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {platform.displayName}
                </h3>
                <p className="text-sm text-gray-600">
                  {platform.subtitle}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
