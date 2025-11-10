'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export default function LandingHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-5">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-900">
              <span className="text-white font-bold text-lg">L</span>
            </div>
            <span className="text-lg font-medium text-gray-900">luma post</span>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="#pricing" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Pricing
            </Link>
            <Link href="#testimonials" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Reviews
            </Link>
            <Link href="#features" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Features
            </Link>
            <Link href="#platforms" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Platforms
            </Link>
            <Link href="#faq" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              FAQ
            </Link>
          </nav>

          {/* Login Button */}
          <div className="hidden md:flex items-center">
            <Link href="/auth">
              <Button className="bg-white text-gray-900 border border-gray-200 hover:bg-gray-50 rounded-lg px-6 py-2 text-sm font-medium transition-colors">
                Login
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
              <Link href="#pricing" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                Pricing
              </Link>
              <Link href="#testimonials" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                Reviews
              </Link>
              <Link href="#features" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                Features
              </Link>
              <Link href="#platforms" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                Platforms
              </Link>
              <Link href="#faq" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                FAQ
              </Link>
              <div className="pt-4">
                <Link href="/auth">
                  <Button className="bg-white text-gray-900 border border-gray-200 hover:bg-gray-50 rounded-lg px-6 py-2 text-sm font-medium transition-colors w-full">
                    Login
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