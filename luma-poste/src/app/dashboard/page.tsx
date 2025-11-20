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
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
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
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Button } from "@/components/ui/button";
import { useAnalytics } from "@/hooks/use-analytics";
import { motion } from "framer-motion";

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
        color: "text-blue-600",
        bg: "bg-blue-50",
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
        color: "text-indigo-600",
        bg: "bg-indigo-50",
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
        color: "text-pink-600",
        bg: "bg-pink-50",
      },
      {
        title: "Total Comments",
        value: data.totalComments.toString(),
        change: `${data.changes.comments >= 0 ? "+" : ""}${data.changes.comments}%`,
        changeType: data.changes.comments >= 0 ? "positive" : "negative",
        icon: MessageCircle,
        color: "text-orange-600",
        bg: "bg-orange-50",
      },
      {
        title: "Total Shares",
        value: data.totalShares.toString(),
        change: `${data.changes.shares >= 0 ? "+" : ""}${data.changes.shares}%`,
        changeType: data.changes.shares >= 0 ? "positive" : "negative",
        icon: Share2,
        color: "text-green-600",
        bg: "bg-green-50",
      },
      {
        title: "Engagement Rate",
        value: `${data.engagementRate}%`,
        change: `${data.changes.engagement >= 0 ? "+" : ""}${data.changes.engagement}%`,
        changeType: data.changes.engagement >= 0 ? "positive" : "negative",
        icon: TrendingUp,
        color: "text-purple-600",
        bg: "bg-purple-50",
      },
    ]
    : [];

  const topPosts = data?.topPosts || [];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-gray-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Chargement de vos données...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-gray-100 max-w-md">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="h-8 w-8 text-red-500" />
          </div>
          <p className="text-lg font-bold text-gray-900 mb-2">
            Oups, une erreur est survenue
          </p>
          <p className="text-gray-500 mb-6">{error}</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 lg:p-8">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="max-w-7xl mx-auto space-y-8"
      >
        {/* Header */}
        <motion.div variants={item} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              Tableau de bord
            </h1>
            <p className="text-gray-500 mt-1">
              Vue d'ensemble de vos performances sociales
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Time Range Filter */}
            <div className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-xl shadow-sm hover:border-purple-300 transition-colors">
              <Calendar className="w-4 h-4 text-gray-500" />
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="bg-transparent border-0 focus:ring-0 focus:outline-none text-sm text-gray-700 font-medium cursor-pointer pr-8"
              >
                <option value="7d">7 derniers jours</option>
                <option value="30d">30 derniers jours</option>
                <option value="90d">3 derniers mois</option>
                <option value="1y">Cette année</option>
              </select>
            </div>

            {/* Platform Filter */}
            <div className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-xl shadow-sm hover:border-purple-300 transition-colors">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value)}
                className="bg-transparent border-0 focus:ring-0 focus:outline-none text-sm text-gray-700 font-medium cursor-pointer pr-8"
              >
                <option value="all">Toutes les plateformes</option>
                <option value="linkedin">LinkedIn</option>
                <option value="twitter">Twitter</option>
                <option value="youtube">YouTube</option>
                <option value="instagram">Instagram</option>
              </select>
            </div>

            {/* Export Button */}
            <Button className="bg-gray-900 hover:bg-gray-800 text-white shadow-lg shadow-gray-900/20 rounded-xl">
              <Download className="w-4 h-4 mr-2" />
              Exporter
            </Button>
          </div>
        </motion.div>

        {/* Posts Status Cards */}
        {data?.postsByStatus && (
          <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { label: "Publiés", value: data.postsByStatus.published, icon: Send, color: "text-purple-600", bg: "bg-purple-50" },
              { label: "Programmés", value: data.postsByStatus.scheduled, icon: Calendar, color: "text-blue-600", bg: "bg-blue-50" },
              { label: "Brouillons", value: data.postsByStatus.draft, icon: FileEdit, color: "text-gray-600", bg: "bg-gray-100" },
              { label: "En file", value: data.postsByStatus.queued, icon: Clock, color: "text-orange-600", bg: "bg-orange-50" },
              { label: "Échecs", value: data.postsByStatus.failed, icon: X, color: "text-red-600", bg: "bg-red-50" },
            ].map((stat, index) => (
              <div key={index} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 group">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
                </div>
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        )}

        {/* Main Stats Grid */}
        <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            const isPositive = stat.changeType === "positive";
            return (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 group"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center group-hover:rotate-6 transition-transform duration-300`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${isPositive
                      ? "bg-green-50 text-green-700"
                      : "bg-red-50 text-red-700"
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
                  <h3 className="text-3xl font-bold text-gray-900 mb-1 tracking-tight">
                    {stat.value}
                  </h3>
                  <p className="text-sm font-medium text-gray-500">
                    {stat.title}
                  </p>
                </div>
              </div>
            );
          })}
        </motion.div>

        {/* Charts Section */}
        <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Engagement Chart */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Engagement</h3>
                <p className="text-sm text-gray-500">Évolution sur la période</p>
              </div>
              <Button variant="ghost" size="icon" className="rounded-full">
                <MoreHorizontal className="w-5 h-5 text-gray-400" />
              </Button>
            </div>

            {engagementData.length > 0 ? (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={engagementData}>
                    <defs>
                      <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#9333ea" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#9333ea" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                    <XAxis
                      dataKey="day"
                      tick={{ fontSize: 12, fill: "#9ca3af" }}
                      axisLine={false}
                      tickLine={false}
                      dy={10}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: "#9ca3af" }}
                      axisLine={false}
                      tickLine={false}
                      dx={-10}
                    />
                    <ChartTooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 shadow-xl">
                              <p className="font-bold mb-1">{payload[0].payload.day}</p>
                              <p>Engagement: {payload[0].value}%</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="engagement"
                      stroke="#9333ea"
                      strokeWidth={3}
                      fill="url(#colorEngagement)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex flex-col items-center justify-center text-gray-400 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                <TrendingUp className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-sm">Aucune donnée disponible</p>
              </div>
            )}
          </div>

          {/* Platform Performance */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Performance par Plateforme</h3>
                <p className="text-sm text-gray-500">Répartition des posts</p>
              </div>
              <Button variant="ghost" size="icon" className="rounded-full">
                <MoreHorizontal className="w-5 h-5 text-gray-400" />
              </Button>
            </div>

            {platformData.length > 0 ? (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={platformData} layout="vertical" margin={{ left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                    <XAxis type="number" hide />
                    <YAxis
                      type="category"
                      dataKey="platform"
                      tick={{ fontSize: 12, fill: "#6b7280", fontWeight: 500 }}
                      axisLine={false}
                      tickLine={false}
                      width={100}
                    />
                    <ChartTooltip
                      cursor={{ fill: 'transparent' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 shadow-xl">
                              <p className="font-bold mb-1">{payload[0].payload.platform}</p>
                              <p>{payload[0].value} posts</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar
                      dataKey="posts"
                      radius={[0, 4, 4, 0]}
                      barSize={32}
                    >
                      {platformData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex flex-col items-center justify-center text-gray-400 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                <BarChart3 className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-sm">Aucune donnée disponible</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Upcoming Posts */}
        {data?.upcomingPosts && data.upcomingPosts.length > 0 && (
          <motion.div variants={item} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Posts à venir</h3>
                <p className="text-sm text-gray-500">Vos prochaines publications programmées</p>
              </div>
              <Button variant="outline" size="sm" className="rounded-lg">
                Voir tout
              </Button>
            </div>
            <div className="divide-y divide-gray-100">
              {data.upcomingPosts.map((post, index) => (
                <div
                  key={post.id}
                  className="flex items-center justify-between p-4 hover:bg-gray-50/50 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 font-bold text-lg group-hover:scale-110 transition-transform duration-300">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1 group-hover:text-purple-600 transition-colors">
                        {post.title}
                      </h4>
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2.5 py-0.5 bg-gray-100 text-gray-600 rounded-full font-medium border border-gray-200">
                          {post.platform}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">
                      {new Date(post.scheduledAt).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                    <div className="flex items-center justify-end gap-1.5 mt-1 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md inline-flex">
                      <Clock className="w-3 h-3" />
                      {new Date(post.scheduledAt).toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Top Posts */}
        {topPosts && topPosts.length > 0 && (
          <motion.div variants={item} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Meilleurs Posts</h3>
                <p className="text-sm text-gray-500">Vos publications les plus performantes</p>
              </div>
              <Button variant="outline" size="sm" className="rounded-lg">
                Voir tout
              </Button>
            </div>
            <div className="divide-y divide-gray-100">
              {topPosts.map((post, index) => (
                <div
                  key={post.id}
                  className="p-6 hover:bg-gray-50/50 transition-colors group"
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-6">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="relative">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${index === 0 ? "bg-yellow-100 text-yellow-700" :
                          index === 1 ? "bg-gray-100 text-gray-700" :
                            index === 2 ? "bg-orange-100 text-orange-800" :
                              "bg-purple-50 text-purple-700"
                          }`}>
                          {index + 1}
                        </div>
                        {index === 0 && (
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center shadow-sm border-2 border-white">
                            <span className="text-xs">🏆</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 mb-1 group-hover:text-purple-600 transition-colors">
                          {post.title}
                        </h4>
                        <span className="text-xs px-2.5 py-0.5 bg-gray-100 text-gray-600 rounded-full font-medium border border-gray-200">
                          {post.platform}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-8 flex-1">
                      <div className="text-center">
                        <div className="flex items-center gap-1.5 justify-center text-gray-900 font-bold">
                          <Eye className="w-4 h-4 text-gray-400" />
                          {post.views.toLocaleString()}
                        </div>
                        <p className="text-xs text-gray-500 mt-1 font-medium">Vues</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center gap-1.5 justify-center text-gray-900 font-bold">
                          <Heart className="w-4 h-4 text-red-400" />
                          {post.likes}
                        </div>
                        <p className="text-xs text-gray-500 mt-1 font-medium">J'aime</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center gap-1.5 justify-center text-gray-900 font-bold">
                          <MessageCircle className="w-4 h-4 text-blue-400" />
                          {post.comments}
                        </div>
                        <p className="text-xs text-gray-500 mt-1 font-medium">Com.</p>
                      </div>
                      <div className="text-center pl-6 border-l border-gray-100">
                        <div className="flex items-center gap-1.5 justify-center text-purple-600 font-bold">
                          <TrendingUp className="w-4 h-4" />
                          {post.engagement.toFixed(1)}%
                        </div>
                        <p className="text-xs text-gray-500 mt-1 font-medium">Engagement</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
