"use client";

import { UserPlus, Edit3, Calendar, Rocket } from "lucide-react";

export default function HowItWorksSection() {
  const steps = [
    {
      icon: <UserPlus className="w-10 h-10" />,
      number: "01",
      title: "Connect Your Accounts",
      description: "Link all your social media platforms in minutes. We support 9 major platforms including Instagram, TikTok, LinkedIn, and more."
    },
    {
      icon: <Edit3 className="w-10 h-10" />,
      number: "02",
      title: "Create Your Content",
      description: "Use our intuitive content studio to craft engaging posts. Add images, videos, and customize for each platform or post everywhere at once."
    },
    {
      icon: <Calendar className="w-10 h-10" />,
      number: "03",
      title: "Schedule or Publish",
      description: "Choose to publish immediately or schedule for later. Our smart scheduling suggests the best times for maximum engagement."
    },
    {
      icon: <Rocket className="w-10 h-10" />,
      number: "04",
      title: "Track Performance",
      description: "Monitor your posts' performance with detailed analytics. See what works and optimize your content strategy."
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            How{" "}
            <span className="text-purple-600">Luma Post</span>
            {" "}Works
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get started in minutes and streamline your social media management
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connection Lines (hidden on mobile) */}
          <div className="hidden lg:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-200 via-purple-400 to-purple-200" style={{ top: '3rem' }}></div>
          
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Step Card */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg hover:shadow-2xl hover:border-purple-300 transition-all duration-300 hover:-translate-y-2">
                {/* Number Badge */}
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-r from-purple-600 to-purple-700 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {step.number}
                </div>
                
                {/* Icon */}
                <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-purple-200 rounded-xl flex items-center justify-center text-purple-600 mb-6">
                  {step.icon}
                </div>
                
                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <a
            href="/auth"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-8 py-4 text-lg font-semibold rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/30 hover:scale-105"
          >
            Get Started Now
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
