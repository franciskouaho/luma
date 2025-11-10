"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Star, Play } from "lucide-react";
import { FaXTwitter } from "react-icons/fa6";

export default function TestimonialsSection() {
  const testimonials = [
    {
      name: "David",
      handle: "@ninthdensity",
      text: "Finally, social media posting tool for the rest of us. Thanks team!",
      rating: 5,
      platform: "twitter",
      avatar: "bg-gradient-to-br from-blue-500 to-blue-600"
    },
    {
      name: "Fer",
      handle: "@fer_chvs",
      text: "Luma Post is the best investment i've made in months. It's simple and works, exactly what i was searching to handle multiple channels.",
      rating: 5,
      platform: "twitter",
      avatar: "bg-gradient-to-br from-emerald-500 to-emerald-600"
    },
    {
      name: "Julian",
      handle: "@BuiltByJulian",
      text: "Luma Post is amazing, makes my life so much easier!",
      rating: 5,
      platform: "twitter",
      avatar: "bg-gradient-to-br from-purple-500 to-purple-600"
    },
    {
      name: "Yorgo Hoebeke",
      handle: "@yorgohoebeke",
      text: "Best price/quality of all platforms of this kind by far",
      rating: 5,
      platform: "twitter",
      avatar: "bg-gradient-to-br from-orange-500 to-orange-600"
    },
    {
      name: "Patty",
      handle: "@pattybuilds",
      text: "The content studio has slowly been bringing in customers tho and I appreciate you so much for that + saves me soooo much time can spend days just building new shit cause all the marketing on autopilot. Love it",
      rating: 5,
      platform: "twitter",
      avatar: "bg-gradient-to-br from-pink-500 to-pink-600"
    }
  ];

  return (
    <section id="testimonials" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Title */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-8 leading-tight">
            Loved by{" "}
            <span className="relative inline-block">
              <span className="text-purple-600">1,392</span>
              <svg className="absolute -bottom-2 left-0 w-full" height="8" viewBox="0 0 200 8" fill="none">
                <path d="M0 4 Q50 0, 100 4 T200 4" stroke="#9333ea" strokeWidth="6" fill="none" strokeLinecap="round"/>
              </svg>
            </span>
            {" "}users
          </h2>
          <p className="text-xl text-gray-600 mb-10">Here's what they are saying about Luma Post</p>

          {/* CTA Button */}
          <Link href="/auth">
            <Button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-10 py-6 text-lg font-semibold rounded-xl transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/30 flex items-center gap-2 mx-auto">
              Try it for free
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {/* Video Testimonial */}
          <div className="group">
            <div className="bg-white rounded-xl p-6 border border-gray-200 h-full hover:shadow-lg transition-all duration-300 hover:border-purple-300">
              <div className="relative mb-4">
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl aspect-video flex items-center justify-center overflow-hidden">
                  <div className="text-center text-white">
                    <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                      <Play className="w-7 h-7 ml-1" />
                    </div>
                    <p className="text-sm font-medium">Watch Testimonial</p>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-sm text-gray-600">Video from a satisfied customer</p>
              </div>
            </div>
          </div>

          {/* Text Testimonials */}
          {testimonials.map((testimonial, index) => (
            <div key={index} className="group">
              <div className="bg-white rounded-xl p-6 border border-gray-200 h-full hover:shadow-lg transition-all duration-300 hover:border-purple-300">
                <div className="flex items-start gap-3 mb-4">
                  <div className={`w-11 h-11 ${testimonial.avatar} rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md`}>
                    {testimonial.name[0]}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.handle}</div>
                  </div>
                  <div className="w-7 h-7 bg-gray-900 rounded-md flex items-center justify-center text-white shadow-sm">
                    {testimonial.platform === 'twitter' ? <FaXTwitter className="w-3.5 h-3.5" /> : '📱'}
                  </div>
                </div>

                <div className="flex gap-0.5 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>

                <p className="text-gray-700 leading-relaxed text-[15px]">{testimonial.text}</p>
              </div>
            </div>
          ))}

          {/* Stats Testimonial */}
          <div className="group">
            <div className="bg-white rounded-xl p-6 border border-gray-200 h-full hover:shadow-lg transition-all duration-300 hover:border-purple-300">
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-5 mb-4">
                <div className="text-center text-white">
                  <div className="text-3xl font-bold text-purple-400 mb-2">+100%</div>
                  <div className="text-sm text-gray-300 mb-5">Growth from Luma Post</div>
                  <div className="grid grid-cols-2 gap-3 text-xs mb-4">
                    <div className="bg-black/30 rounded-lg p-2">
                      <div className="text-purple-400 font-semibold text-base">$119</div>
                      <div className="text-gray-400 mt-1">This week</div>
                    </div>
                    <div className="bg-black/30 rounded-lg p-2">
                      <div className="text-gray-400 text-base">$0</div>
                      <div className="text-gray-400 mt-1">Last week</div>
                    </div>
                  </div>
                  <div className="bg-black/30 rounded-lg p-2 inline-block">
                    <div className="text-purple-400 font-semibold text-lg">4</div>
                    <div className="text-gray-400 text-xs">New customers</div>
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 bg-gradient-to-br from-pink-500 to-pink-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md">
                  P
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">Patty</div>
                  <div className="text-sm text-gray-500">@pattybuilds</div>
                </div>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 text-yellow-400 fill-current" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Key Stats */}
        <div className="bg-gradient-to-br from-purple-50 to-white rounded-2xl p-10 border border-purple-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
            <div className="group">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-2xl mb-4 group-hover:bg-purple-200 transition-colors">
                <span className="text-3xl">🌐</span>
              </div>
              <div className="text-5xl font-bold text-purple-600 mb-3">9</div>
              <div className="text-sm text-gray-600 font-medium uppercase tracking-wider">Social Platforms</div>
            </div>
            <div className="group">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-2xl mb-4 group-hover:bg-purple-200 transition-colors">
                <span className="text-3xl">📊</span>
              </div>
              <div className="text-5xl font-bold text-purple-600 mb-3">627K+</div>
              <div className="text-sm text-gray-600 font-medium uppercase tracking-wider">Posts Published</div>
            </div>
            <div className="group">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-2xl mb-4 group-hover:bg-purple-200 transition-colors">
                <span className="text-3xl">⚡</span>
              </div>
              <div className="text-5xl font-bold text-purple-600 mb-3">2min</div>
              <div className="text-sm text-gray-600 font-medium uppercase tracking-wider">Time to Post</div>
            </div>
          </div>
        </div>

        {/* Featured On */}
        <div className="mt-20 text-center">
          <div className="text-xs text-gray-500 uppercase tracking-widest mb-8 font-semibold">Featured On</div>
          <div className="flex flex-wrap justify-center items-center gap-12">
            <div className="text-2xl font-bold text-gray-300 hover:text-gray-600 transition-colors cursor-pointer">
              Starter Story
            </div>
            <div className="text-2xl font-bold text-gray-300 hover:text-gray-600 transition-colors cursor-pointer">
              TinyLaunch
            </div>
            <div className="text-2xl font-bold text-gray-300 hover:text-gray-600 transition-colors cursor-pointer">
              Product Hunt
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}