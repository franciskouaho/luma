"use client";

import { FaFacebook, FaInstagram, FaLinkedin, FaXTwitter, FaYoutube, FaTiktok } from "react-icons/fa6";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

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
    <section id="platforms" className="py-24 bg-white relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gray-50/50 rounded-full blur-3xl -z-10" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-sm font-bold uppercase tracking-wider mb-3 text-purple-600">
              Plateformes
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Publiez sur <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">toutes vos plateformes</span> en un clic
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Connectez tous vos comptes sociaux et gérez votre présence en ligne depuis un seul endroit
            </p>
          </motion.div>
        </div>

        {/* Platform Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {platforms.map((platform, index) => {
            const Icon = platform.icon;
            const isGradient = platform.color.startsWith('linear');

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:border-purple-100 transition-all duration-300"
              >
                <div className="flex items-center gap-6">
                  <div className="relative">
                    {/* Icon Circle */}
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-md transform group-hover:scale-110 transition-transform duration-300"
                      style={isGradient ? { background: platform.color } : { backgroundColor: platform.color }}
                    >
                      <Icon className="w-8 h-8" />
                    </div>
                    {/* Check Badge */}
                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-sm border border-gray-100">
                      <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-white" strokeWidth={4} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-purple-600 transition-colors">
                      {platform.displayName}
                    </h3>
                    <p className="text-sm text-gray-500 font-medium">
                      {platform.subtitle}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
