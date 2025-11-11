"use client";

import Link from "next/link";
import { FaFacebook, FaInstagram, FaLinkedin, FaXTwitter } from "react-icons/fa6";

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
    { icon: FaXTwitter, href: "#", label: "X (Twitter)" }
  ];

  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Logo */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#9B6BFF' }}>
                <span className="text-white font-bold text-lg">L</span>
              </div>
              <span className="text-xl font-semibold text-gray-900">lumapost</span>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-gray-900 font-semibold mb-4 uppercase text-sm tracking-wide">Navigation</h4>
            <ul className="space-y-3">
              {footerSections.navigation.map((link, index) => (
                <li key={index}>
                  <Link href={link.href} className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Platforms */}
          <div>
            <h4 className="text-gray-900 font-semibold mb-4 uppercase text-sm tracking-wide">Plateformes</h4>
            <ul className="space-y-3">
              {footerSections.platforms.map((link, index) => (
                <li key={index}>
                  <Link href={link.href} className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-gray-900 font-semibold mb-4 uppercase text-sm tracking-wide">Légal</h4>
            <ul className="space-y-3">
              {footerSections.legal.map((link, index) => (
                <li key={index}>
                  <Link href={link.href} className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h4 className="text-gray-900 font-semibold mb-4 uppercase text-sm tracking-wide">Suivez-nous</h4>
            <div className="flex items-center gap-3">
              {socialLinks.map((social, index) => (
                <Link
                  key={index}
                  href={social.href}
                  className="w-10 h-10 bg-gray-100 hover:bg-purple-100 rounded-full flex items-center justify-center text-gray-600 hover:text-purple-600 transition-all"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-200 pt-8 text-center">
          <p className="text-gray-500 text-sm">
            © {currentYear} LumaPost. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}
