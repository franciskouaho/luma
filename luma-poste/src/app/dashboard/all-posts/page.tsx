"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Info,
  CheckCircle,
  Camera,
  Video,
  Image as ImageIcon,
  FileText,
  Clock,
  Send,
  Plus,
  Calendar,
  TrendingUp,
  Users,
  Filter,
  Search,
  Grid3X3,
  List,
  MoreHorizontal,
  Edit3,
  Trash2,
  Eye,
  Share2,
} from "lucide-react";
import { PlatformIcon } from "@/components/ui/platform-icon";
import Image from "next/image";

export default function AllPostsPage() {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<string>("newest");
  const [filterPlatform, setFilterPlatform] = useState<string>("all");
  const [filterTime, setFilterTime] = useState<string>("all");
  const [filterAccount, setFilterAccount] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Récupérer les schedules
        const schedulesResponse = await fetch(
          "/api/schedules?userId=FGcdXcRXVoVfsSwJIciurCeuCXz1",
        );
        if (schedulesResponse.ok) {
          const schedulesData = await schedulesResponse.json();

          // Convertir les dates Firestore
          const schedulesWithDates = (schedulesData.schedules || []).map(
            (schedule: any) => {
              let scheduledAt;
              if (schedule.scheduledAt?._seconds) {
                scheduledAt = new Date(schedule.scheduledAt._seconds * 1000);
              } else if (schedule.scheduledAt?.toDate) {
                scheduledAt = schedule.scheduledAt.toDate();
              } else {
                scheduledAt = new Date(schedule.scheduledAt);
              }

              return {
                ...schedule,
                scheduledAt,
              };
            },
          );

          setSchedules(schedulesWithDates);
        }

        // Récupérer les comptes
        const accountsResponse = await fetch("/api/accounts");
        if (accountsResponse.ok) {
          const accountsData = await accountsResponse.json();
          setAccounts(accountsData.accounts || []);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filtrer et trier les schedules
  const filteredSchedules = schedules
    .filter((schedule) => {
      const matchesPlatform =
        filterPlatform === "all" ||
        schedule.platforms.some((platformId: string) => {
          const account = accounts.find((acc) => acc.id === platformId);
          return account?.platform === filterPlatform;
        });
      const matchesAccount =
        filterAccount === "all" || schedule.userId === filterAccount;
      return matchesPlatform && matchesAccount;
    })
    .sort((a, b) => {
      if (sortBy === "newest") {
        return (
          new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()
        );
      } else {
        return (
          new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
        );
      }
    });

  const getContentTypeIcon = (mediaType: string) => {
    switch (mediaType?.toLowerCase()) {
      case "video":
        return <Video className="h-4 w-4 text-gray-500" />;
      case "image":
        return <ImageIcon className="h-4 w-4 text-purple-600" />;
      case "text":
        return <FileText className="h-4 w-4 text-gray-600" />;
      default:
        return <Video className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Clock className="h-4 w-4 text-gray-500" />;
      case "published":
        return <Send className="h-4 w-4 text-purple-600" />;
      case "draft":
        return <FileText className="h-4 w-4 text-gray-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return (
          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
            Scheduled
          </span>
        );
      case "published":
        return (
          <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
            Published
          </span>
        );
      case "draft":
        return (
          <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
            Draft
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
            Scheduled
          </span>
        );
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "numeric",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-purple-100 rounded-full mx-auto animate-ping"></div>
          </div>
          <p className="text-gray-700 font-medium">Loading posts...</p>
          <p className="text-gray-500 text-sm mt-2">Please wait a moment</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modern Sticky Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                All Posts
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Manage and view all your content
              </p>
            </div>
            <button
              onClick={() => (window.location.href = "/dashboard/upload")}
              className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Post
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-5 border border-gray-200 hover:border-purple-300 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Total Posts
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {filteredSchedules.length}
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
                  Published
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {
                    filteredSchedules.filter((s) => s.status === "published")
                      .length
                  }
                </p>
              </div>
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-gray-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-5 border border-gray-200 hover:border-purple-300 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-purple-600 uppercase tracking-wide mb-1">
                  Scheduled
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {
                    filteredSchedules.filter((s) => s.status === "scheduled")
                      .length
                  }
                </p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-purple-600" />
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
                  {filteredSchedules.filter((s) => s.status === "draft").length}
                </p>
              </div>
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-gray-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">
                  Filters:
                </span>
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-white transition-all duration-200"
              >
                <option value="newest">Most Recent</option>
                <option value="oldest">Oldest First</option>
              </select>

              <select
                value={filterPlatform}
                onChange={(e) => setFilterPlatform(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-white transition-all duration-200"
              >
                <option value="all">All Platforms</option>
                <option value="tiktok">TikTok</option>
                <option value="instagram">Instagram</option>
                <option value="twitter">Twitter</option>
                <option value="linkedin">LinkedIn</option>
                <option value="youtube">YouTube</option>
              </select>

              <select
                value={filterTime}
                onChange={(e) => setFilterTime(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-white transition-all duration-200"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    viewMode === "grid"
                      ? "bg-white shadow-sm text-purple-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    viewMode === "list"
                      ? "bg-white shadow-sm text-purple-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Posts Grid */}
        <div
          className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}
        >
          {filteredSchedules.map((schedule) => (
            <div
              key={schedule.id}
              className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200 hover:border-purple-300 transition-colors"
            >
              {/* Header */}
              <div className="relative p-6 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-slate-200 to-slate-300 rounded-lg flex items-center justify-center">
                      {getContentTypeIcon(schedule.mediaType)}
                    </div>
                    <span className="text-xs font-medium text-gray-600 uppercase tracking-wide capitalize">
                      {schedule.mediaType || "video"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(schedule.status)}
                    {getStatusBadge(schedule.status)}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-lg font-bold text-gray-900">
                      {formatDate(schedule.scheduledAt)}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Clock className="w-3.5 h-3.5 text-gray-500" />
                      <span className="text-sm text-gray-600 font-medium">
                        {formatTime(schedule.scheduledAt)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white transition-all duration-200">
                      <Eye className="w-4 h-4 text-gray-600" />
                    </button>
                    <button className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white transition-all duration-200">
                      <Edit3 className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Caption */}
                <div className="mb-4">
                  <p className="text-sm text-gray-700 line-clamp-3 leading-relaxed">
                    {schedule.caption || "No description available"}
                  </p>
                </div>

                {/* Thumbnail */}
                <div className="relative w-full h-44 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg mb-4 overflow-hidden group/thumbnail">
                  {schedule.thumbnailUrl ? (
                    <>
                      <Image
                        src={schedule.thumbnailUrl}
                        alt="Thumbnail"
                        width={400}
                        height={200}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover/thumbnail:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover/thumbnail:bg-black/20 transition-all duration-300 flex items-center justify-center">
                        <div className="opacity-0 group-hover/thumbnail:opacity-100 transition-opacity duration-300">
                          <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                            <Camera className="w-7 h-7 text-gray-700" />
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Camera className="w-8 h-8 text-gray-600" />
                        </div>
                        <p className="text-sm text-gray-500 font-medium">
                          No preview available
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Platforms */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Platforms
                    </span>
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full font-medium">
                      {schedule.platforms.length} account(s)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {schedule.platforms.map((platformId: string) => {
                      const account = accounts.find(
                        (acc) => acc.id === platformId,
                      );
                      return account ? (
                        <div
                          key={platformId}
                          className="relative group/platform"
                        >
                          <PlatformIcon
                            platform={account.platform}
                            size="md"
                            profileImageUrl={account.avatarUrl}
                            username={account.username}
                            className="w-10 h-10 border-2 border-white shadow-md hover:shadow-lg transition-all duration-200 hover:scale-110"
                          />
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-200">
                    <Share2 className="w-3.5 h-3.5" />
                    Share
                  </button>
                  <button className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-all duration-200">
                    <MoreHorizontal className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredSchedules.length === 0 && !loading && (
          <div className="bg-white rounded-lg p-12 shadow-sm border border-gray-200 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-500/30">
              <Calendar className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              No posts found
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Create your first post to start managing your social media
              content.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => (window.location.href = "/dashboard/upload")}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create New Post
              </button>
              <button
                onClick={() => (window.location.href = "/dashboard/schedule")}
                className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-all duration-200"
              >
                <Clock className="w-4 h-4" />
                Schedule Post
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
