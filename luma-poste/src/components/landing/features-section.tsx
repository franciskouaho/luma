"use client";

import { Check } from "lucide-react";
import { FaXTwitter, FaInstagram, FaLinkedin } from "react-icons/fa6";

export default function FeaturesSection() {
  const features = [
    {
      emoji: "📆",
      title: "Simple Calendar",
      description: "Designed to give you the best experience.",
      benefits: [
        "Easy-to-use dashboard",
        "Manage everything in one place",
        "NO chaos anymore"
      ],
      mockupType: "calendar"
    },
    {
      emoji: "🤖",
      title: "Generate Captions with AI",
      description: "No more manual writing.",
      benefits: [
        "Matches your brand tone",
        "Fits each platform",
        "Multiple tone options"
      ],
      mockupType: "ai-caption"
    }
  ];

  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Powerful{" "}
            <span className="bg-purple-600 text-white px-3 py-1 rounded-lg">Features</span>{" "}
            Built to{" "}
            <span className="relative inline-block">
              Save Time
              <svg className="absolute -bottom-2 left-0 w-full" height="8" viewBox="0 0 200 8" fill="none">
                <path d="M0 4 Q50 0, 100 4 T200 4" stroke="#9333ea" strokeWidth="6" fill="none" strokeLinecap="round"/>
              </svg>
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Everything you need to plan, create, and publish faster - without switching tabs or tools.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {features.map((feature, index) => (
            <div key={index} className="space-y-6">
              {/* Feature Header */}
              <div>
                <h3 className="text-3xl font-bold text-gray-900 mb-3">
                  {index + 1}. {feature.title} {feature.emoji}
                </h3>
                <p className="text-gray-600 text-lg mb-6">{feature.description}</p>

                {/* Benefits List */}
                <div className="space-y-3">
                  {feature.benefits.map((benefit, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
                        <Check className="w-4 h-4 text-white stroke-[3]" />
                      </div>
                      <span className="text-gray-900 font-medium">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Feature Mockup */}
              <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl overflow-hidden shadow-lg">
                {feature.mockupType === "calendar" ? (
                  <CalendarMockup />
                ) : (
                  <AICaptionMockup />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Calendar Mockup Component
function CalendarMockup() {
  return (
    <div className="p-6 bg-white">
      <div className="space-y-4">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-gray-900">June 2025</h4>
          <div className="flex gap-2">
            <button className="text-sm px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50">Prev</button>
            <button className="text-sm px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50">Next</button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
          {Array.from({ length: 35 }, (_, i) => {
            const hasPost = [2, 5, 9, 12, 16, 19, 23, 26, 30].includes(i);
            return (
              <div
                key={i}
                className={`aspect-square border border-gray-200 rounded-lg flex items-center justify-center text-sm ${
                  hasPost ? 'bg-purple-100 border-purple-300 font-semibold' : 'bg-white'
                }`}
              >
                {i > 0 && i <= 30 ? i : ''}
                {hasPost && <div className="w-1 h-1 bg-purple-600 rounded-full absolute mt-5"></div>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// AI Caption Mockup Component
function AICaptionMockup() {
  return (
    <div className="p-6 bg-white space-y-4">
      {/* Post Creation Header */}
      <div className="border-b border-gray-200 pb-4">
        <h4 className="text-lg font-semibold text-gray-900">Create New Post</h4>
      </div>

      {/* Caption Input */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-700">Write Your Captions</label>
        <div className="bg-gray-50 border border-gray-300 rounded-lg p-4 min-h-[120px]">
          <p className="text-gray-600 text-sm">
            🚀 Just launched our new feature! Excited to share how this will revolutionize your workflow...
          </p>
        </div>
      </div>

      {/* AI Options */}
      <div className="flex gap-2">
        <button className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-sm font-medium rounded-lg hover:from-purple-700 hover:to-purple-800">
          Generate with AI 🤖
        </button>
        <button className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50">
          Tone
        </button>
      </div>

      {/* Platform Selection */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { name: 'LinkedIn', icon: FaLinkedin, color: 'bg-purple-100 text-purple-700 border border-purple-300' },
          { name: 'Twitter', icon: FaXTwitter, color: 'bg-purple-100 text-purple-700 border border-purple-300' },
          { name: 'Instagram', icon: FaInstagram, color: 'bg-purple-100 text-purple-700 border border-purple-300' }
        ].map((platform) => {
          const Icon = platform.icon;
          return (
            <div
              key={platform.name}
              className={`${platform.color} px-3 py-2 rounded-lg flex items-center justify-center gap-2 text-xs font-medium`}
            >
              <Icon className="w-4 h-4" />
              {platform.name}
            </div>
          );
        })}
      </div>
    </div>
  );
}
