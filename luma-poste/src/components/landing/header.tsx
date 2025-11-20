'use client';

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export default function LandingHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
              <Image
                src="/assets/logo/logo.png"
                alt="LumaPost Logo"
                width={32}
                height={32}
                className="object-contain"
              />
            </div>
            <span className="text-lg font-semibold text-gray-900">lumapost</span>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="#features" className="text-sm text-gray-700 hover:text-gray-900 transition-colors font-medium">
              Fonctionnalités
            </Link>
            <Link href="#platforms" className="text-sm text-gray-700 hover:text-gray-900 transition-colors font-medium">
              Plateformes
            </Link>
            <Link href="#pricing" className="text-sm text-gray-700 hover:text-gray-900 transition-colors font-medium">
              Tarifs
            </Link>
            <Link href="#faq" className="text-sm text-gray-700 hover:text-gray-900 transition-colors font-medium">
              FAQ
            </Link>
            <Link href="/blog" className="text-sm text-gray-700 hover:text-gray-900 transition-colors font-medium">
              Blog
            </Link>
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/auth">
              <Button className="text-white text-sm font-medium px-6 py-2 rounded-lg transition-all hover:opacity-90 shadow-md hover:shadow-lg" style={{ backgroundColor: '#9B6BFF' }}>
                Essayer maintenant
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-purple-600 transition-colors"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <nav className="flex flex-col space-y-4">
              <Link href="#features" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                Fonctionnalités
              </Link>
              <Link href="#platforms" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                Plateformes
              </Link>
              <Link href="#pricing" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                Tarifs
              </Link>
              <Link href="#faq" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                FAQ
              </Link>
              <Link href="/blog" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                Blog
              </Link>
              <div className="pt-4 flex flex-col gap-2">
                <Link href="/auth">
                  <Button className="w-full shadow-md" style={{ backgroundColor: '#9B6BFF', color: 'white' }}>
                    Essayer maintenant
                  </Button>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}