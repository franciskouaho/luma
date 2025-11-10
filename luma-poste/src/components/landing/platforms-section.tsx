"use client";


export default function PlatformsSection() {
  const platforms = [
    { name: "X", displayName: "X (Twitter)", icon: "X", color: "bg-black" },
    { name: "Instagram", displayName: "Instagram", icon: "📷", color: "bg-gradient-to-br from-purple-600 to-pink-600" },
    { name: "LinkedIn", displayName: "LinkedIn", icon: "in", color: "bg-blue-600" },
    { name: "Facebook", displayName: "Facebook", icon: "f", color: "bg-blue-500" },
    { name: "TikTok", displayName: "TikTok", icon: "♪", color: "bg-black" },
    { name: "YouTube", displayName: "YouTube", icon: "▶", color: "bg-red-600" },
    { name: "Bluesky", displayName: "Bluesky", icon: "🦋", color: "bg-blue-400" },
    { name: "Threads", displayName: "Threads", icon: "@", color: "bg-black" },
    { name: "Pinterest", displayName: "Pinterest", icon: "P", color: "bg-red-500" },
    { name: "More", displayName: "More to come", icon: "⋯", color: "bg-gray-300" }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Supported Platforms */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Supported Platforms
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            These are all the platforms you can post to from within Luma Post.
          </p>
        </div>

        {/* Platform Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-16">
          {platforms.map((platform, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 hover:scale-105 text-center"
            >
              <div className={`w-16 h-16 ${platform.color} rounded-xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4`}>
                {platform.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{platform.displayName}</h3>
            </div>
          ))}
        </div>


      </div>
    </section>
  );
}
