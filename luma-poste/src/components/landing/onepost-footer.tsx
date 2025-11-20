"use client";

import Link from "next/link";
import { FaFacebook, FaInstagram, FaLinkedin, FaXTwitter, FaYoutube, FaTiktok } from "react-icons/fa6";
import Image from "next/image";

export default function OnePostFooter() {
  const currentYear = new Date().getFullYear();

  const footerSections = {
    navigation: [
      { name: "Blog", href: "/blog" },
      { name: "Guides", href: "/guides" },
      { name: "Contact", href: "/contact" }
    ],
    platforms: [
      { name: "Facebook", href: "#platforms" },
      { name: "Instagram", href: "#platforms" },
      { name: "LinkedIn", href: "#platforms" },
      { name: "TikTok", href: "#platforms" }
    ],
    legal: [
      { name: "Mentions légales", href: "/legal" },
      { name: "Politique de confidentialité", href: "/privacy" },
      { name: "Conditions générales", href: "/terms" },
      { name: "Politique Cookies", href: "/cookies" },
      { name: "Gérer mes cookies", href: "#cookies" }
    ]
  };

  const socialLinks = [
    { icon: FaFacebook, href: "#", label: "Facebook" },
    { icon: FaInstagram, href: "#", label: "Instagram" },
    { icon: FaLinkedin, href: "#", label: "LinkedIn" },
    { icon: FaXTwitter, href: "#", label: "X (Twitter)" },
    { icon: FaYoutube, href: "#", label: "YouTube" },
    { icon: FaTiktok, href: "#", label: "TikTok" }
  ];

  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-12 mb-16">
          {/* Brand Column */}
          <div className="col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                <span className="text-white font-bold text-xl">L</span>
              </div>
              <span className="text-xl font-bold text-gray-900">lumapost</span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              La plateforme tout-en-un pour gérer et automatiser votre présence sur les réseaux sociaux.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-bold text-gray-900 mb-6">Navigation</h4>
            <ul className="space-y-4">
              {footerSections.navigation.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-600 hover:text-purple-600 transition-colors text-sm font-medium"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Platforms */}
          <div>
            <h4 className="font-bold text-gray-900 mb-6">Plateformes</h4>
            <ul className="space-y-4">
              {footerSections.platforms.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-600 hover:text-purple-600 transition-colors text-sm font-medium"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-bold text-gray-900 mb-6">Légal</h4>
            <ul className="space-y-4">
              {footerSections.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-600 hover:text-purple-600 transition-colors text-sm font-medium"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Socials */}
          <div>
            <h4 className="font-bold text-gray-900 mb-6">Suivez-nous</h4>
            <div className="flex flex-wrap gap-3">
              {socialLinks.map((social, index) => (
                <Link
                  key={index}
                  href={social.href}
                  className="w-10 h-10 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-500 hover:bg-purple-50 hover:text-purple-600 hover:border-purple-100 transition-all duration-300"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            © {currentYear} LumaPost. Tous droits réservés.
          </p>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span className="w-2 h-2 rounded-full bg-green-400"></span>
            <span>Tous les systèmes opérationnels</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
