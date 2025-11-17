"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Info,
  Edit3,
  Camera,
  Globe,
  MoreHorizontal,
  Trash2,
  Send,
  Plus,
  Calendar,
  TrendingUp,
  Users,
  Filter,
  Search,
  Grid3X3,
  List,
  Eye,
  Share2,
  FileText,
  Clock,
  CheckCircle,
} from "lucide-react";
import Image from "next/image";
import { PlatformIcon } from "@/components/ui/platform-icon";
import { useAuth } from "@/hooks/use-auth";

interface Draft {
  id: string;
  caption: string;
  createdAt: Date | { seconds: number; nanoseconds: number };
  status: "draft";
  platforms: string[];
  userId: string;
  mediaType?: "video" | "image" | "text";
  thumbnailUrl?: string;
  videoFile?: string;
  videoUrl?: string;
}

export default function DraftsPage() {
  const { user } = useAuth();
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<string>("newest");
  const [filterPlatform, setFilterPlatform] = useState<string>("all");
  const [filterTime, setFilterTime] = useState<string>("all");
  const [filterAccount, setFilterAccount] = useState<string>("all");
  const [accounts, setAccounts] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchDrafts = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/drafts");
        if (!response.ok) {
          throw new Error("Failed to fetch drafts");
        }
        const data = await response.json();
        setDrafts(data.drafts || []);
      } catch (error) {
        console.error("Error fetching drafts:", error);
        setDrafts(mockDrafts);
      } finally {
        setLoading(false);
      }
    };

    const fetchAccounts = async () => {
      if (!user?.uid) return;
      
      try {
        const token = await user.getIdToken();
        const response = await fetch(`/api/accounts?userId=${user.uid}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setAccounts(data.accounts || []);
        }
      } catch (error) {
        console.error("Error fetching accounts:", error);
      }
    };

    fetchDrafts();
    fetchAccounts();
  }, [user]);

  const filteredDrafts = drafts
    .filter((draft) => {
      const matchesPlatform =
        filterPlatform === "all" || draft.platforms.includes(filterPlatform);
      const matchesAccount =
        filterAccount === "all" || draft.userId === filterAccount;
      return matchesPlatform && matchesAccount;
    })
    .sort((a, b) => {
      if (sortBy === "newest") {
        return (
          new Date(b.createdAt as any).getTime() -
          new Date(a.createdAt as any).getTime()
        );
      } else {
        return (
          new Date(a.createdAt as any).getTime() -
          new Date(b.createdAt as any).getTime()
        );
      }
    });

  const formatDate = (
    date: Date | { seconds: number; nanoseconds: number } | string,
  ) => {
    let dateObj: Date;

    if (date instanceof Date) {
      dateObj = date;
    } else if (typeof date === "object" && "seconds" in date) {
      dateObj = new Date(date.seconds * 1000 + date.nanoseconds / 1000000);
    } else if (typeof date === "string") {
      dateObj = new Date(date);
    } else {
      dateObj = new Date();
    }

    return dateObj.toLocaleDateString("en-US", {
      month: "numeric",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  };

  const handlePublishDraft = (draftId: string) => {
    alert("Fonctionnalité de publication à venir !");
  };

  const handleEditDraft = (draft: Draft) => {
    localStorage.setItem(
      "editingDraft",
      JSON.stringify({
        id: draft.id,
        caption: draft.caption,
        platforms: draft.platforms,
        mediaType: draft.mediaType,
        thumbnailUrl: draft.thumbnailUrl,
        videoFile: draft.videoFile,
        videoUrl: (draft as any).videoUrl,
      }),
    );
    window.location.href = "/dashboard/upload?edit=true";
  };

  const handleDeleteDraft = async (draftId: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce brouillon ?")) {
      try {
        const response = await fetch(`/api/drafts?id=${draftId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          setDrafts((prev) => prev.filter((draft) => draft.id !== draftId));
        } else {
          console.error("Erreur lors de la suppression du draft");
          alert("Erreur lors de la suppression du brouillon");
        }
      } catch (error) {
        console.error("Erreur lors de la suppression du draft:", error);
        alert("Erreur lors de la suppression du brouillon");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-purple-100 rounded-full mx-auto animate-ping"></div>
          </div>
          <p className="text-gray-700 font-medium">Loading drafts...</p>
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
                Drafts
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Manage and finalize your content in progress
              </p>
            </div>
            <button
              onClick={() => (window.location.href = "/dashboard/upload")}
              className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Draft
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
                  Total Drafts
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {filteredDrafts.length}
                </p>
              </div>
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-gray-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-5 border border-gray-200 hover:border-purple-300 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Videos
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {filteredDrafts.filter((d) => d.mediaType === "video").length}
                </p>
              </div>
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <Camera className="w-5 h-5 text-gray-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-5 border border-gray-200 hover:border-purple-300 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Images
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {filteredDrafts.filter((d) => d.mediaType === "image").length}
                </p>
              </div>
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-gray-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-5 border border-gray-200 hover:border-purple-300 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-purple-600 uppercase tracking-wide mb-1">
                  Texts
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {filteredDrafts.filter((d) => d.mediaType === "text").length}
                </p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
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
                <option value="facebook">Facebook</option>
                <option value="instagram">Instagram</option>
                <option value="twitter">Twitter</option>
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

        {/* Drafts Grid */}
        <div
          className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}
        >
          {filteredDrafts.map((draft) => (
            <div
              key={draft.id}
              className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200 hover:border-purple-300 transition-colors"
            >
              {/* Header */}
              <div className="relative p-6 bg-gradient-to-r from-orange-50 to-slate-50 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-md">
                      {draft.mediaType === "video" && (
                        <Camera className="w-4 h-4 text-white" />
                      )}
                      {draft.mediaType === "image" && (
                        <Globe className="w-4 h-4 text-white" />
                      )}
                      {draft.mediaType === "text" && (
                        <FileText className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <span className="text-xs font-medium text-orange-700 uppercase tracking-wide capitalize">
                      {draft.mediaType || "text"}
                    </span>
                  </div>
                  <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                    Draft
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-lg font-bold text-gray-900">
                      {formatDate(draft.createdAt).split(",")[0]}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Clock className="w-3.5 h-3.5 text-gray-500" />
                      <span className="text-sm text-gray-600 font-medium">
                        Created {formatDate(draft.createdAt).split(",")[1]}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white transition-all duration-200">
                      <Eye className="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                      className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white transition-all duration-200"
                      onClick={() => handleEditDraft(draft)}
                    >
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
                    {draft.caption || "No description available"}
                  </p>
                </div>

                {/* Thumbnail */}
                <div className="relative w-full h-44 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg mb-4 overflow-hidden group/thumbnail">
                  {draft.thumbnailUrl &&
                  (typeof draft.thumbnailUrl === "string"
                    ? draft.thumbnailUrl.trim() !== ""
                    : (draft.thumbnailUrl as any).downloadUrl &&
                      (draft.thumbnailUrl as any).downloadUrl.trim() !== "") ? (
                    <>
                      <Image
                        src={
                          typeof draft.thumbnailUrl === "string"
                            ? draft.thumbnailUrl
                            : (draft.thumbnailUrl as any).downloadUrl
                        }
                        alt="Draft thumbnail"
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
                        <div className="w-16 h-16 bg-orange-300 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Camera className="w-8 h-8 text-gray-500" />
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
                      Target Platforms
                    </span>
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full font-medium">
                      {draft.platforms.length} account(s)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {draft.platforms.map((platformId, index) => {
                      const account = accounts.find(
                        (acc) => acc.id === platformId,
                      );
                      const platformName = account?.platform || "tiktok";
                      const username =
                        account?.displayName || account?.username || "Unknown";

                      return (
                        <div key={index} className="relative group/platform">
                          <PlatformIcon
                            platform={platformName}
                            size="md"
                            className="w-10 h-10 border-2 border-white shadow-md hover:shadow-lg transition-all duration-200 hover:scale-110"
                            profileImageUrl={account?.avatarUrl}
                            username={username}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <button
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-500 text-white text-sm font-semibold rounded-lg hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-200"
                      onClick={() => handlePublishDraft(draft.id)}
                    >
                      <Send className="w-3.5 h-3.5" />
                      Publish
                    </button>
                    <button
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-orange-700 bg-orange-50 hover:bg-orange-100 rounded-lg transition-all duration-200"
                      onClick={() => handleEditDraft(draft)}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Edit
                    </button>
                  </div>
                  <button
                    className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-red-50 transition-all duration-200 group/delete"
                    onClick={() => handleDeleteDraft(draft.id)}
                  >
                    <Trash2 className="w-4 h-4 text-gray-400 group-hover/delete:text-red-600 transition-colors" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredDrafts.length === 0 && (
          <div className="bg-white rounded-lg p-12 shadow-sm border border-gray-200 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-orange-500/30">
              <Edit3 className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              No drafts found
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Start creating your first content and save it as a draft to
              finalize later.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => (window.location.href = "/dashboard/upload")}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create Draft
              </button>
              <button
                onClick={() => (window.location.href = "/dashboard/all-posts")}
                className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-all duration-200"
              >
                <Calendar className="w-4 h-4" />
                View All Posts
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const mockDrafts: Draft[] = [
  {
    id: "1",
    caption: "This is a draft video post about new features!",
    createdAt: new Date("2025-01-18T10:00:00Z"),
    status: "draft",
    platforms: ["tiktok"],
    userId: "FGcdXcRXVoVfsSwJIciurCeuCXz1",
    mediaType: "video",
    thumbnailUrl: "https://via.placeholder.com/150/FF0000/FFFFFF?text=Draft1",
  },
  {
    id: "2",
    caption:
      "Exciting new update coming soon! This is a longer caption to test the line clamp functionality.",
    createdAt: new Date("2025-01-17T15:30:00Z"),
    status: "draft",
    platforms: ["tiktok", "facebook"],
    userId: "FGcdXcRXVoVfsSwJIciurCeuCXz1",
    mediaType: "video",
    thumbnailUrl: "https://via.placeholder.com/150/00FF00/FFFFFF?text=Draft2",
  },
  {
    id: "3",
    caption: "Quick tip for better content creation!",
    createdAt: new Date("2025-01-16T09:15:00Z"),
    status: "draft",
    platforms: ["tiktok"],
    userId: "FGcdXcRXVoVfsSwJIciurCeuCXz1",
    mediaType: "image",
    thumbnailUrl: "https://via.placeholder.com/150/0000FF/FFFFFF?text=Draft3",
  },
];
