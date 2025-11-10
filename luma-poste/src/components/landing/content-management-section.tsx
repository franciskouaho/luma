"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Eye, Calendar, Edit3, Palette, Video } from "lucide-react";

export default function ContentManagementSection() {
  return (
    <section className="py-20 bg-white border-t border-gray-200">
      {/* Content Management Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Content Management Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
          {/* Left Side - Screenshot */}
          <div className="order-2 lg:order-1">
            <div className="bg-gray-900 rounded-2xl p-6 shadow-2xl">
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                    <Edit3 className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-white text-lg font-semibold">Edit Scheduled Post</h3>
                </div>
                
                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                  <div className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium">Main Caption</div>
                  <div className="bg-gray-700 text-gray-300 px-4 py-2 rounded-lg text-sm">Twitter</div>
                  <div className="bg-gray-700 text-gray-300 px-4 py-2 rounded-lg text-sm">Youtube</div>
                  <div className="bg-gray-700 text-gray-300 px-4 py-2 rounded-lg text-sm">Instagram</div>
                  <div className="bg-gray-700 text-gray-300 px-4 py-2 rounded-lg text-sm">Tiktok</div>
                  <div className="bg-gray-700 text-gray-300 px-4 py-2 rounded-lg text-sm">Threads</div>
                </div>

                {/* Caption Input */}
                <div className="mb-6">
                  <div className="text-white text-sm mb-2">Caption</div>
                  <div className="bg-gray-700 rounded-lg p-4">
                    <div className="text-gray-300 text-sm leading-relaxed">
                      grow + try these and 1000 more hobbies using our app 'Curiosity Quench' #hobbies #foryou #viral #fyp #trending #chess #reading #acting #maincharacter #science
                    </div>
                    <div className="text-gray-500 text-xs mt-2">169/2200</div>
                  </div>
                </div>

                {/* Schedule */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <div className="text-white text-sm mb-2">Schedule Date</div>
                    <div className="bg-gray-700 rounded-lg p-3 text-gray-300 text-sm">2024-12-12</div>
                  </div>
                  <div>
                    <div className="text-white text-sm mb-2">Schedule Time</div>
                    <div className="bg-gray-700 rounded-lg p-3 text-gray-300 text-sm">08:00 PM</div>
                  </div>
                </div>

                {/* Accounts */}
                <div className="mb-6">
                  <div className="text-white text-sm mb-3">Select Accounts (One per platform)</div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between bg-gray-700 rounded-lg p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-black rounded flex items-center justify-center text-white text-xs">♪</div>
                        <span className="text-gray-300 text-sm">Tiktok</span>
                        <span className="text-gray-400 text-xs">jack friks, Curiosity Quench</span>
                      </div>
                      <div className="w-4 h-4 bg-purple-600 rounded-full"></div>
                    </div>
                    <div className="flex items-center justify-between bg-gray-700 rounded-lg p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-white text-xs">@</div>
                        <span className="text-gray-300 text-sm">Threads</span>
                        <span className="text-gray-400 text-xs">jack friks, curiosity.quench</span>
                      </div>
                      <div className="w-4 h-4 bg-purple-600 rounded-full"></div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm">
                    Delete
                  </Button>
                  <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700 px-4 py-2 rounded-lg text-sm">
                    Cancel
                  </Button>
                  <Button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm">
                    Save Changes
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Content */}
          <div className="order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 text-purple-600 font-semibold text-sm uppercase tracking-wide mb-4">
              <Calendar className="w-4 h-4" />
              CONTENT MANAGEMENT
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Manage content{" "}
              <span className="text-purple-600">efficiently</span>
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed mb-8">
              View all your scheduled and published posts in one place. Track what's been posted, 
              edit upcoming posts, and stay on top of your content strategy.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/auth">
                <Button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-lg transition-all duration-300 hover:shadow-lg hover:scale-105 flex items-center gap-2">
                  Get started
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="#pricing">
                <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-4 text-lg font-semibold rounded-lg transition-all duration-300">
                  See pricing
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Content Studio Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Side - Content */}
          <div>
            <div className="inline-flex items-center gap-2 text-purple-600 font-semibold text-sm uppercase tracking-wide mb-4">
              <Palette className="w-4 h-4" />
              CONTENT STUDIO
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Create videos{" "}
              <span className="text-purple-600">easily</span>
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed mb-8">
              Proven templates to quickly create videos for your brand. Basic drag-and-drop editor 
              to customize for your needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/auth">
                <Button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-lg transition-all duration-300 hover:shadow-lg hover:scale-105 flex items-center gap-2">
                  Try studio
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="#examples">
                <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-4 text-lg font-semibold rounded-lg transition-all duration-300">
                  <Eye className="w-5 h-5 mr-2" />
                  View Examples
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Side - Screenshot */}
          <div>
            <div className="bg-gray-900 rounded-2xl p-6 shadow-2xl">
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-white text-lg font-semibold mb-6">Content Studio</h3>
                
                {/* Video Creation Options */}
                <div className="space-y-4 mb-6">
                  <div className="bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-white font-semibold">NEW AI-Powered AI UGC Video Creator</div>
                      <div className="flex gap-2">
                        <span className="bg-red-600 text-white text-xs px-2 py-1 rounded">SUPERHOT</span>
                        <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">infinite</span>
                      </div>
                    </div>
                    <p className="text-gray-300 text-sm mb-3">Create authentic UGC-style product demos, testimonials...</p>
                    <Button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm">
                      Try AI UGC Creator
                    </Button>
                  </div>

                  <div className="bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-white font-semibold">2x2 Grid Video</div>
                      <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded">Trending 20M+ views</span>
                    </div>
                    <p className="text-gray-300 text-sm mb-3">Create videos with this format (tested & proven to...)</p>
                    <Button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm">
                      Use Template
                    </Button>
                  </div>

                  <div className="bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-white font-semibold">AI UGC Creator</div>
                      <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded">Trending 10+ views</span>
                    </div>
                    <p className="text-gray-300 text-sm mb-3">UGC-style videos in seconds using our AI-power... Perfect for product demos...</p>
                    <Button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm">
                      Use Template
                    </Button>
                  </div>
                </div>

                {/* Video Preview */}
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Video className="w-4 h-4 text-white" />
                    <span className="text-white text-sm font-medium">Single Fade-in Video Example Output</span>
                  </div>
                  <div className="bg-gray-600 rounded-lg aspect-video flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-gray-500 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Video className="w-6 h-6 text-white" />
                      </div>
                      <p className="text-gray-300 text-sm">Video Preview</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
