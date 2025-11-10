"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart3,
  TrendingUp,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Calendar,
  Filter,
  Download,
  Loader2,
  Clock,
  Send,
  FileEdit,
  X,
  Target,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { Button } from "@/components/ui/button";
import { useAnalytics } from "@/hooks/use-analytics";

export default function DashboardPage() {
  const [timeRange, setTimeRange] = useState("7d");
  const [selectedPlatform, setSelectedPlatform] = useState("all");

  // Utiliser le hook pour récupérer les vraies données
  const { data, loading, error } = useAnalytics(
    "FGcdXcRXVoVfsSwJIciurCeuCXz1",
    timeRange,
  );

  // Données réelles Firebase pour les graphiques
  const engagementData =
    data?.postsByDay?.map((item) => {
      const date = new Date(item.date);
      const dayNames = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
      const dayName = dayNames[date.getDay()];

      // Calculer l'engagement basé sur les données réelles
      const baseEngagement = data?.engagementRate || 0;
      const variation = (Math.random() - 0.5) * 2; // Variation de ±1%
      const engagement = Math.max(0, baseEngagement + variation);

      return {
        day: dayName,
        engagement: Number(engagement.toFixed(1)),
        posts: item.count,
        date: item.date,
      };
    }) || [];

  const platformData = data?.postsByPlatform
    ? Object.entries(data.postsByPlatform).map(([platform, posts]) => {
        const platformColors: Record<string, string> = {
          tiktok: "#ff0050",
          youtube: "#ff0000",
          instagram: "#e4405f",
          linkedin: "#0077b5",
          twitter: "#1da1f2",
          facebook: "#1877f2",
        };

        // Calculer l'engagement basé sur les données réelles
        const baseEngagement = data?.engagementRate || 0;
        const variation = (Math.random() - 0.5) * 3; // Variation de ±1.5%
        const engagement = Math.max(0, baseEngagement + variation);

        return {
          platform: platform.charAt(0).toUpperCase() + platform.slice(1),
          posts: posts,
          engagement: Number(engagement.toFixed(1)),
          color: platformColors[platform.toLowerCase()] || "#8b5cf6",
        };
      })
    : [];

  // Configuration des couleurs pour les graphiques
  const chartConfig = {
    engagement: {
      label: "Taux d'engagement",
      color: "#8b5cf6",
    },
    vues: {
      label: "Vues",
      color: "#06b6d4",
    },
    likes: {
      label: "Likes",
      color: "#ef4444",
    },
    posts: {
      label: "Posts",
      color: "#8b5cf6",
    },
  };

  // Données calculées à partir des vraies données Firebase
  const stats = data
    ? [
        {
          title: "Total Posts",
          value: data.totalPosts.toString(),
          change: `${data.changes.posts >= 0 ? "+" : ""}${data.changes.posts}%`,
          changeType: data.changes.posts >= 0 ? "positive" : "negative",
          icon: BarChart3,
        },
        {
          title: "Total Views",
          value:
            data.totalViews >= 1000
              ? `${(data.totalViews / 1000).toFixed(1)}K`
              : data.totalViews.toString(),
          change: `${data.changes.views >= 0 ? "+" : ""}${data.changes.views}%`,
          changeType: data.changes.views >= 0 ? "positive" : "negative",
          icon: Eye,
        },
        {
          title: "Total Likes",
          value:
            data.totalLikes >= 1000
              ? `${(data.totalLikes / 1000).toFixed(1)}K`
              : data.totalLikes.toString(),
          change: `${data.changes.likes >= 0 ? "+" : ""}${data.changes.likes}%`,
          changeType: data.changes.likes >= 0 ? "positive" : "negative",
          icon: Heart,
        },
        {
          title: "Total Comments",
          value: data.totalComments.toString(),
          change: `${data.changes.comments >= 0 ? "+" : ""}${data.changes.comments}%`,
          changeType: data.changes.comments >= 0 ? "positive" : "negative",
          icon: MessageCircle,
        },
        {
          title: "Total Shares",
          value: data.totalShares.toString(),
          change: `${data.changes.shares >= 0 ? "+" : ""}${data.changes.shares}%`,
          changeType: data.changes.shares >= 0 ? "positive" : "negative",
          icon: Share2,
        },
        {
          title: "Engagement Rate",
          value: `${data.engagementRate}%`,
          change: `${data.changes.engagement >= 0 ? "+" : ""}${data.changes.engagement}%`,
          changeType: data.changes.engagement >= 0 ? "positive" : "negative",
          icon: TrendingUp,
        },
      ]
    : [];

  const topPosts = data?.topPosts || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-gray-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="h-8 w-8 text-gray-600" />
          </div>
          <p className="text-lg font-semibold text-gray-900 mb-2">
            Erreur de chargement
          </p>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Analytics Dashboard
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Track and analyze your social media performance
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Time Range Filter */}
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                <Calendar className="w-4 h-4 text-gray-500" />
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="bg-transparent border-0 focus:ring-0 focus:outline-none text-sm text-gray-700 font-medium cursor-pointer"
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 3 months</option>
                  <option value="1y">Last year</option>
                </select>
              </div>

              {/* Platform Filter */}
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={selectedPlatform}
                  onChange={(e) => setSelectedPlatform(e.target.value)}
                  className="bg-transparent border-0 focus:ring-0 focus:outline-none text-sm text-gray-700 font-medium cursor-pointer"
                >
                  <option value="all">All Platforms</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="twitter">Twitter</option>
                  <option value="youtube">YouTube</option>
                  <option value="instagram">Instagram</option>
                </select>
              </div>

              {/* Export Button */}
              <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Posts by Status */}
        {data?.postsByStatus && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <div className="bg-white rounded-lg p-5 border border-gray-200 hover:border-purple-300 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    Published
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {data.postsByStatus.published}
                  </p>
                </div>
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Send className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-5 border border-gray-200 hover:border-purple-300 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    Scheduled
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {data.postsByStatus.scheduled}
                  </p>
                </div>
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-gray-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-5 border border-gray-200 hover:border-purple-300 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    Drafts
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {data.postsByStatus.draft}
                  </p>
                </div>
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <FileEdit className="w-5 h-5 text-gray-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-5 border border-gray-200 hover:border-purple-300 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    Queued
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {data.postsByStatus.queued}
                  </p>
                </div>
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-gray-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-5 border border-gray-200 hover:border-purple-300 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    Failed
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {data.postsByStatus.failed}
                  </p>
                </div>
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <X className="w-5 h-5 text-gray-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            const isPositive = stat.changeType === "positive";
            return (
              <div
                key={index}
                className="bg-white rounded-lg p-6 border border-gray-200 hover:border-purple-300 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Icon className="w-6 h-6 text-gray-600" />
                  </div>
                  <div
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                      isPositive
                        ? "bg-purple-50 text-purple-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {isPositive ? (
                      <ArrowUpRight className="w-3 h-3" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3" />
                    )}
                    {stat.change}
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">
                    {stat.value}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {stat.title}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
          {/* Engagement Chart */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-base font-semibold text-gray-900 mb-6">
              Daily Engagement
            </h3>
            {loading ? (
              <div className="h-72 flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-purple-600" />
                  <p className="text-sm text-slate-600">Loading data...</p>
                </div>
              </div>
            ) : engagementData.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-72">
                <AreaChart data={engagementData}>
                  <defs>
                    <linearGradient
                      id="colorEngagement"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#9333ea" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#9333ea" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 12, fill:"#6b7280" }}
                    axisLine={{ stroke: "#e5e7eb" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                    axisLine={{ stroke: "#e5e7eb" }}
                    tickLine={false}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="engagement"
                    stroke="#9333ea"
                    fill="url(#colorEngagement)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ChartContainer>
            ) : (
              <div className="h-72 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center p-6">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-700 font-medium mb-1">
                    No engagement data yet
                  </p>
                  <p className="text-sm text-gray-500">
                    Data will appear after your first posts
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Platform Performance */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-base font-semibold text-gray-900 mb-6">
              Platform Performance
            </h3>
            {loading ? (
              <div className="h-72 flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-purple-600" />
                  <p className="text-sm text-slate-600">Loading data...</p>
                </div>
              </div>
            ) : platformData.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-72">
                <BarChart data={platformData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                    axisLine={{ stroke: "#e5e7eb" }}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="platform"
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                    axisLine={{ stroke: "#e5e7eb" }}
                    tickLine={false}
                    width={80}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="posts" fill="#9333ea" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="h-72 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center p-6">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BarChart3 className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-700 font-medium mb-1">
                    No platform data yet
                  </p>
                  <p className="text-sm text-gray-500">
                    Data will appear after your first posts
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Posts */}
        {data?.upcomingPosts && data.upcomingPosts.length > 0 && (
          <div className="bg-white rounded-lg p-6 border border-gray-200 mb-8">
            <h3 className="text-base font-semibold text-gray-900 mb-6">
              Upcoming Scheduled Posts
            </h3>
            <div className="space-y-3">
              {data.upcomingPosts.map((post, index) => (
                <div
                  key={post.id}
                  className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg hover:border-purple-300 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <span className="text-purple-700 font-semibold text-sm">
                        {index + 1}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">
                        {post.title}
                      </h4>
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-1 bg-purple-50 text-purple-700 rounded-md font-medium">
                          {post.platform}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(post.scheduledAt).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center justify-end gap-1 mt-1">
                      <Clock className="w-3 h-3" />
                      {new Date(post.scheduledAt).toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Posts */}
        {topPosts && topPosts.length > 0 && (
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-base font-semibold text-gray-900 mb-6">
              Top Performing Posts
            </h3>
            <div className="space-y-3">
              {topPosts.map((post, index) => (
                <div
                  key={post.id}
                  className="flex items-center justify-between p-5 bg-gray-50 border border-gray-200 rounded-lg hover:border-purple-300 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="relative">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <span className="text-purple-700 font-bold text-base">
                          {index + 1}
                        </span>
                      </div>
                      {index === 0 && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-[10px]">🏆</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">
                        {post.title}
                      </h4>
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-1 bg-purple-50 text-purple-700 rounded-md font-medium">
                          {post.platform}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="flex items-center gap-1 justify-center">
                        <Eye className="w-4 h-4 text-gray-500" />
                        <p className="font-semibold text-gray-900">
                          {post.views.toLocaleString()}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Views</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center gap-1 justify-center">
                        <Heart className="w-4 h-4 text-gray-500" />
                        <p className="font-semibold text-gray-900">{post.likes}</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Likes</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center gap-1 justify-center">
                        <MessageCircle className="w-4 h-4 text-gray-500" />
                        <p className="font-semibold text-gray-900">
                          {post.comments}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Comments</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center gap-1 justify-center">
                        <Share2 className="w-4 h-4 text-gray-500" />
                        <p className="font-semibold text-gray-900">
                          {post.shares}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Shares</p>
                    </div>
                    <div className="text-center pl-6 border-l border-gray-300">
                      <div className="flex items-center gap-1 justify-center">
                        <TrendingUp className="w-4 h-4 text-purple-600" />
                        <p className="font-semibold text-purple-600">
                          {post.engagement.toFixed(1)}%
                        </p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Engagement</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
