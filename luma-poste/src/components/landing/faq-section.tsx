"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { FaXTwitter, FaInstagram, FaLinkedin, FaFacebook, FaTiktok, FaYoutube, FaPinterest } from "react-icons/fa6";
import { SiBluesky, SiThreads } from "react-icons/si";

export default function FAQSection() {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const faqs = [
    {
      question: "Why switch from Buffer or Hootsuite?",
      answer: "Luma Post offers better pricing, more intuitive interface, and superior customer support. Unlike other platforms that charge per user, we offer unlimited team members and unlimited posts at a fraction of the cost. Plus, our content studio and AI-powered features give you more value for your investment."
    },
    {
      question: "What social platforms do you support?",
      answer: "We support 9 major social media platforms: X (Twitter), Instagram, LinkedIn, Facebook, TikTok, YouTube, Bluesky, Threads, and Pinterest. We're constantly adding new platforms based on user demand."
    },
    {
      question: "How many social accounts can I connect?",
      answer: "With our Creator plan, you can connect up to 15 social accounts. With our Pro plan, you get unlimited connected accounts. You can connect multiple accounts per platform, perfect for managing both personal and business profiles."
    },
    {
      question: "What is a social account?",
      answer: "A social account is any social media profile you connect to Luma Post. For example, if you have 2 Instagram accounts, 1 Facebook page, and 1 Twitter account, that counts as 4 social accounts. Each platform connection counts as one account."
    },
    {
      question: "Can I connect 2 accounts to the same platform?",
      answer: "Yes! You can connect multiple accounts from the same platform. This is perfect for managing personal and business accounts, or multiple brands. Each account is managed separately with its own content and posting schedule."
    },
    {
      question: "How many posts can I make and schedule per month?",
      answer: "All our plans include unlimited posts and scheduling. You can post as much as you want without any restrictions. Whether you post 10 times or 1000 times per month, you'll never hit a limit."
    },
    {
      question: "What types of content can I post?",
      answer: "You can post text, images, videos, carousels, and stories across all supported platforms. Our content studio also provides templates for creating engaging videos and graphics. We support all major content formats including hashtags, mentions, and links."
    },
    {
      question: "Will my posts get less reach using this app?",
      answer: "No! Luma Post uses official APIs from each platform, so your posts have the same reach as if you posted directly on the platform. In fact, many users see better engagement because they can post consistently and at optimal times."
    },
    {
      question: "Can I cancel anytime?",
      answer: "Yes, you can cancel your subscription at any time with no cancellation fees. Your account will remain active until the end of your current billing period, and you can reactivate anytime."
    },
    {
      question: "Can I get a refund?",
      answer: "We offer a 7-day free trial so you can test all features before committing. If you're not satisfied within the first 7 days of your paid subscription, we offer a full refund. Contact our support team for assistance."
    },
    {
      question: "Do I need to share my social media passwords with you?",
      answer: "No! We use secure OAuth connections that don't require your passwords. You'll be redirected to each platform to authorize Luma Post to post on your behalf. Your passwords are never shared or stored on our servers."
    },
    {
      question: "I have another question",
      answer: "We're here to help! You can reach our support team through the chat widget on our website, email us at support@luma-post.com, or join our community Discord. Our average response time is under 2 hours during business hours."
    }
  ];

  const platforms = [
    { name: "X", icon: FaXTwitter, bgColor: "bg-gray-900" },
    { name: "Instagram", icon: FaInstagram, bgColor: "bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500" },
    { name: "LinkedIn", icon: FaLinkedin, bgColor: "bg-blue-600" },
    { name: "Facebook", icon: FaFacebook, bgColor: "bg-blue-500" },
    { name: "TikTok", icon: FaTiktok, bgColor: "bg-gray-900" },
    { name: "YouTube", icon: FaYoutube, bgColor: "bg-red-600" },
    { name: "Bluesky", icon: SiBluesky, bgColor: "bg-blue-400" },
    { name: "Threads", icon: SiThreads, bgColor: "bg-gray-900" },
    { name: "Pinterest", icon: FaPinterest, bgColor: "bg-red-500" }
  ];

  return (
    <section id="faq" className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 text-purple-600 font-semibold text-sm uppercase tracking-wide mb-4">
            FAQ
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
            Frequently Asked Questions
          </h2>
          
          {/* Platform Icons */}
          <div className="flex flex-wrap justify-center items-center gap-4 mb-8">
            <span className="text-gray-600 font-medium">Post to:</span>
            {platforms.map((platform, index) => {
              const Icon = platform.icon;
              return (
                <div
                  key={index}
                  className={`w-10 h-10 rounded-lg ${platform.bgColor} flex items-center justify-center text-white shadow-sm`}
                  title={platform.name}
                >
                  <Icon className="w-5 h-5" />
                </div>
              );
            })}
          </div>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <button
                onClick={() => toggleItem(index)}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 rounded-lg transition-colors duration-200"
              >
                <span className="text-lg font-semibold text-gray-900 pr-4">
                  {faq.question}
                </span>
                <div className="flex-shrink-0">
                  {openItems.includes(index) ? (
                    <Minus className="w-5 h-5 text-gray-600" />
                  ) : (
                    <Plus className="w-5 h-5 text-gray-600" />
                  )}
                </div>
              </button>
              
              {openItems.includes(index) && (
                <div className="px-6 pb-4">
                  <div className="border-t border-gray-100 pt-4">
                    <p className="text-gray-700 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Additional Help */}
        <div className="mt-12 text-center">
          <div className="bg-gray-50 rounded-2xl p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Still have questions?
            </h3>
            <p className="text-gray-600 mb-6">
              Our support team is here to help you get the most out of Luma Post.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:support@luma-post.com"
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
              >
                Email Support
              </a>
              <a
                href="#"
                className="border border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
              >
                Join Community
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}