"use client";

import { FaTiktok, FaInstagram, FaFacebook, FaYoutube, FaXTwitter, FaLinkedin, FaPinterest } from "react-icons/fa6";
import { SiBluesky, SiThreads } from "react-icons/si";

interface LoadingScreenProps {
  message?: string;
}

export default function LoadingScreen({ message = "Loading dashboard..." }: LoadingScreenProps) {
  const socialIcons = [
    { Icon: FaTiktok, color: "text-gray-900" },
    { Icon: FaInstagram, color: "text-pink-600" },
    { Icon: FaFacebook, color: "text-blue-600" },
    { Icon: FaYoutube, color: "text-red-600" },
    { Icon: FaXTwitter, color: "text-gray-900" },
    { Icon: FaLinkedin, color: "text-blue-700" },
    { Icon: SiThreads, color: "text-gray-900" },
    { Icon: SiBluesky, color: "text-blue-500" },
    { Icon: FaPinterest, color: "text-red-600" }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        {/* Logo */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-2 mb-8">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-900">
              <span className="text-white font-bold text-xl">L</span>
            </div>
            <span className="text-2xl font-semibold text-gray-900">Luma Post</span>
          </div>
        </div>

        {/* Social Icons */}
        <div className="flex items-center justify-center gap-4 mb-12">
          {socialIcons.map((social, index) => {
            const Icon = social.Icon;
            return (
              <Icon
                key={index}
                className={`w-7 h-7 ${social.color}`}
              />
            );
          })}
        </div>

        {/* Loading Spinner */}
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900 mb-4"></div>
          <p className="text-gray-600 text-sm">{message}</p>
        </div>
      </div>
    </div>
  );
}
