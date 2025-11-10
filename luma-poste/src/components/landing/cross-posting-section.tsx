"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Eye, Users, RefreshCw } from "lucide-react";

export default function CrossPostingSection() {
  const platforms = [
    { name: "Facebook", icon: "f", color: "bg-blue-500" },
    { name: "Instagram", icon: "📷", color: "bg-gradient-to-br from-purple-600 to-pink-600" },
    { name: "X", icon: "X", color: "bg-black" },
    { name: "LinkedIn", icon: "in", color: "bg-blue-600" },
    { name: "TikTok", icon: "♪", color: "bg-black" }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Side - Content */}
          <div className="space-y-8">
            <div>
              <div className="inline-flex items-center gap-2 text-purple-600 font-semibold text-sm uppercase tracking-wide mb-4">
                <RefreshCw className="w-4 h-4" />
                CROSS-POSTING
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Post to all platforms{" "}
                <span className="text-purple-600">instantly</span>
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed mb-8">
                Publish everywhere in 30 seconds, not 30 minutes. Manage all your personal and brand accounts 
                without switching back and forth. Connect your social media accounts and publish your content 
                across all platforms with a single click - no learning curve required.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/auth">
                <Button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-8 py-4 text-lg font-semibold rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/30 hover:scale-105 flex items-center gap-2">
                  Start posting
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="#platforms">
                <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-4 text-lg font-semibold rounded-lg transition-all duration-300">
                  <Eye className="w-5 h-5 mr-2" />
                  View platforms
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Side - Visual Diagram */}
          <div className="relative">
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200">
              {/* User Circle */}
              <div className="flex justify-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  <Users className="w-10 h-10" />
                </div>
              </div>

              {/* Central Hub */}
              <div className="flex justify-center mb-8">
                <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center text-white shadow-lg">
                  <RefreshCw className="w-8 h-8" />
                </div>
              </div>

              {/* Platform Connections */}
              <div className="grid grid-cols-5 gap-4">
                {platforms.map((platform, index) => (
                  <div key={index} className="flex flex-col items-center space-y-2">
                    <div className={`w-12 h-12 ${platform.color} rounded-lg flex items-center justify-center text-white font-semibold shadow-md`}>
                      {platform.icon}
                    </div>
                    <div className="text-xs text-gray-600 text-center font-medium">
                      {platform.name}
                    </div>
                  </div>
                ))}
              </div>

              {/* Connection Lines (Visual representation) */}
              <div className="absolute inset-0 pointer-events-none">
                {/* Lines from center to platforms */}
                <svg className="w-full h-full">
                  <defs>
                    <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#9333EA" stopOpacity="0.6" />
                      <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.6" />
                    </linearGradient>
                  </defs>
                  <line x1="50%" y1="25%" x2="10%" y2="75%" stroke="url(#lineGradient)" strokeWidth="2" strokeDasharray="5,5" />
                  <line x1="50%" y1="25%" x2="30%" y2="75%" stroke="url(#lineGradient)" strokeWidth="2" strokeDasharray="5,5" />
                  <line x1="50%" y1="25%" x2="50%" y2="75%" stroke="url(#lineGradient)" strokeWidth="2" strokeDasharray="5,5" />
                  <line x1="50%" y1="25%" x2="70%" y2="75%" stroke="url(#lineGradient)" strokeWidth="2" strokeDasharray="5,5" />
                  <line x1="50%" y1="25%" x2="90%" y2="75%" stroke="url(#lineGradient)" strokeWidth="2" strokeDasharray="5,5" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Demo Screenshot */}
        <div className="mt-20">
          <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200">
            <div className="relative">
              {/* Mock Dashboard Interface */}
              <div className="bg-gray-900 rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-white text-lg font-semibold">Review & Publish</h3>
                  <div className="text-purple-600 text-sm">✓ Post Scheduled Successfully</div>
                </div>
                
                <div className="bg-gray-800 rounded-lg p-4 mb-4">
                  <div className="text-white text-sm mb-2">Caption</div>
                  <div className="bg-gray-700 rounded p-3 text-white">wow!</div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-500 rounded-lg p-3 flex items-center gap-2">
                    <span className="text-white text-sm">Instagram</span>
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  </div>
                  <div className="bg-black rounded-lg p-3 flex items-center gap-2">
                    <span className="text-white text-sm">TikTok</span>
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  </div>
                  <div className="bg-blue-600 rounded-lg p-3 flex items-center gap-2">
                    <span className="text-white text-sm">LinkedIn</span>
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg">
                    View Scheduled Posts
                  </Button>
                  <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700 px-6 py-2 rounded-lg">
                    Done
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
