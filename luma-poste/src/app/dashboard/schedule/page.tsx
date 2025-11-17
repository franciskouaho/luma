"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Image from "next/image";
import {
  Calendar,
  Play,
  AlertCircle,
  Plus,
  Loader2,
  RefreshCw,
  Info,
  Camera,
  Edit3,
  Trash2,
  Clock,
  CheckCircle,
  TrendingUp,
  Filter,
} from "lucide-react";
import { useSchedules } from "@/hooks/use-schedules";
import { useAuth } from "@/hooks/use-auth";
import { PlatformIcon } from "@/components/ui/platform-icon";

export default function SchedulePage() {
  const { user } = useAuth();
  const { schedules, loading, error } = useSchedules(user?.uid, undefined);

  const [sortBy, setSortBy] = useState("newest");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all");
  const [accountFilter, setAccountFilter] = useState("all");
  const [accounts, setAccounts] = useState<any[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState<string | null>(null);

  useEffect(() => {
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

    fetchAccounts();
  }, [user]);

  const formatDate = (
    dateInput: string | { _seconds: number; _nanoseconds: number },
  ) => {
    try {
      let date: Date;

      if (typeof dateInput === "object" && dateInput._seconds) {
        date = new Date(dateInput._seconds * 1000);
      } else if (typeof dateInput === "string") {
        date = new Date(dateInput);
      } else {
        return { date: "Date invalide", time: "" };
      }

      if (isNaN(date.getTime())) {
        return { date: "Date invalide", time: "" };
      }

      return {
        date: date.toLocaleDateString("fr-FR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }),
        time: date.toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
      };
    } catch {
      return { date: "Date invalide", time: "" };
    }
  };

  const filteredSchedules = schedules.filter((schedule) => {
    if (
      platformFilter !== "all" &&
      !schedule.platforms?.includes(platformFilter)
    )
      return false;
    return true;
  });

  const handleCreateSchedule = () => {
    window.location.href = "/dashboard/create-post/video";
  };

  const handleEditSchedule = async (id: string) => {
    try {
      const response = await fetch(`/api/schedules?id=${id}`);
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération de la planification");
      }

      const data = await response.json();
      const schedule = data.schedule;

      if (schedule) {
        localStorage.setItem(
          "editingSchedule",
          JSON.stringify({
            id: schedule.id,
            caption: schedule.caption,
            platforms: schedule.platforms,
            scheduledAt: schedule.scheduledAt,
            videoUrl: schedule.videoUrl,
            thumbnailUrl: schedule.thumbnailUrl,
            mediaType: schedule.mediaType,
          }),
        );

        window.location.href = "/dashboard/create-post/video?edit=true&type=schedule";
      } else {
        alert("Planification non trouvée");
      }
    } catch (error) {
      console.error(
        "Erreur lors de la récupération de la planification:",
        error,
      );
      alert("Erreur lors de la récupération de la planification");
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    setScheduleToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteSchedule = async () => {
    if (!scheduleToDelete) return;

    try {
      const response = await fetch(`/api/schedules?id=${scheduleToDelete}`, {
        method: "DELETE",
      });

      if (response.ok) {
        const result = await response.json();
        window.location.reload();
      } else {
        const errorData = await response.json();
        console.error("Erreur lors de la suppression:", errorData);
        alert(
          `Erreur lors de la suppression: ${errorData.error || "Erreur inconnue"}`,
        );
      }
    } catch (error) {
      console.error(
        "Erreur lors de la suppression de la planification:",
        error,
      );
      alert("Erreur lors de la suppression de la planification");
    } finally {
      setDeleteDialogOpen(false);
      setScheduleToDelete(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modern Sticky Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Scheduled Posts
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Manage and plan your upcoming publications
              </p>
            </div>
            <button
              onClick={() => (window.location.href = "/dashboard/create-post/video")}
              className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Schedule Post
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
                  Total Scheduled
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
                  This Week
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {
                    filteredSchedules.filter((s) => {
                      const scheduleDate = new Date(s.scheduledAt);
                      const now = new Date();
                      const weekFromNow = new Date(
                        now.getTime() + 7 * 24 * 60 * 60 * 1000,
                      );
                      return scheduleDate >= now && scheduleDate <= weekFromNow;
                    }).length
                  }
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
                <p className="text-xs font-medium text-purple-600 uppercase tracking-wide mb-1">
                  Today
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {
                    filteredSchedules.filter((s) => {
                      const scheduleDate = new Date(s.scheduledAt);
                      const today = new Date();
                      return (
                        scheduleDate.toDateString() === today.toDateString()
                      );
                    }).length
                  }
                </p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-5 border border-gray-200 hover:border-purple-300 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                  This Month
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {
                    filteredSchedules.filter((s) => {
                      const scheduleDate = new Date(s.scheduledAt);
                      const now = new Date();
                      const monthFromNow = new Date(
                        now.getTime() + 30 * 24 * 60 * 60 * 1000,
                      );
                      return (
                        scheduleDate >= now && scheduleDate <= monthFromNow
                      );
                    }).length
                  }
                </p>
              </div>
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-gray-600" />
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
                value={platformFilter}
                onChange={(e) => setPlatformFilter(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-white transition-all duration-200"
              >
                <option value="all">All Platforms</option>
                <option value="instagram">Instagram</option>
                <option value="facebook">Facebook</option>
                <option value="tiktok">TikTok</option>
                <option value="youtube">YouTube</option>
                <option value="twitter">Twitter</option>
                <option value="linkedin">LinkedIn</option>
              </select>

              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-white transition-all duration-200"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>

            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-200">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4"></div>
              <div className="absolute inset-0 w-16 h-16 border-4 border-purple-100 rounded-full animate-ping"></div>
            </div>
            <p className="text-gray-700 font-medium">Loading schedules...</p>
            <p className="text-gray-500 text-sm mt-2">Please wait a moment</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-6">
            <div className="flex items-center text-red-600">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold">Error loading schedules</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Posts Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSchedules.length === 0 ? (
              <div className="col-span-full">
                <div className="bg-white rounded-lg p-12 shadow-sm border border-gray-200 text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-500/30">
                    <Calendar className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    No Scheduled Posts
                  </h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    Create your first schedule to automate your social media
                    publications.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                      onClick={handleCreateSchedule}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Schedule Post
                    </button>
                    <button
                      onClick={() =>
                        (window.location.href = "/dashboard/create-post/video")
                      }
                      className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-all duration-200"
                    >
                      <Camera className="w-4 h-4" />
                      Create Post
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              filteredSchedules.map((schedule) => {
                const dateInfo = formatDate(schedule.scheduledAt);
                return (
                  <div
                    key={schedule.id}
                    className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200 hover:border-purple-300 transition-colors"
                  >
                    {/* Header */}
                    <div className="relative p-6 bg-gradient-to-r from-purple-50 to-slate-50 border-b border-gray-200">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                            <Camera className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-xs font-medium text-purple-700 uppercase tracking-wide">
                            Video
                          </span>
                        </div>
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                          Scheduled
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-lg font-bold text-gray-900">
                            {dateInfo.date}
                          </div>
                          <div className="flex items-center gap-1.5 mt-1">
                            <Clock className="w-3.5 h-3.5 text-gray-500" />
                            <span className="text-sm text-gray-600 font-medium">
                              {dateInfo.time}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <button
                            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white transition-all duration-200"
                            onClick={() => handleEditSchedule(schedule.id)}
                          >
                            <Edit3 className="w-4 h-4 text-gray-600" />
                          </button>
                          <button
                            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-red-50 transition-all duration-200"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleDeleteSchedule(schedule.id);
                            }}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
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
                              alt="Video thumbnail"
                              width={400}
                              height={200}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover/thumbnail:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover/thumbnail:bg-black/20 transition-all duration-300 flex items-center justify-center">
                              <div className="opacity-0 group-hover/thumbnail:opacity-100 transition-opacity duration-300">
                                <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                                  <Play className="w-7 h-7 text-gray-700 ml-0.5" />
                                </div>
                              </div>
                            </div>
                          </>
                        ) : schedule.videoUrl ? (
                          <div className="relative w-full h-full">
                            <video
                              src={schedule.videoUrl}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover/thumbnail:scale-105"
                              muted
                              preload="metadata"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover/thumbnail:bg-black/20 transition-all duration-300 flex items-center justify-center">
                              <div className="opacity-0 group-hover/thumbnail:opacity-100 transition-opacity duration-300">
                                <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                                  <Play className="w-7 h-7 text-gray-700 ml-0.5" />
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="text-center">
                              <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Play className="w-8 h-8 text-gray-600" />
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
                            {schedule.platforms?.length || 0} account(s)
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {schedule.platforms?.map((platformId, index) => {
                            const account = accounts.find(
                              (acc) => acc.id === platformId,
                            );
                            const platformName = account?.platform || "tiktok";
                            const username =
                              account?.displayName ||
                              account?.username ||
                              "Unknown";

                            return (
                              <div
                                key={index}
                                className="relative group/platform"
                              >
                                <PlatformIcon
                                  platform={platformName}
                                  size="md"
                                  className="w-10 h-10 border-2 border-white shadow-md hover:shadow-lg transition-all duration-200 hover:scale-110"
                                  profileImageUrl={account?.avatarUrl}
                                  username={username}
                                />
                              </div>
                            );
                          }) || (
                            <div className="relative group/platform">
                              <PlatformIcon
                                platform="tiktok"
                                size="md"
                                className="w-10 h-10 border-2 border-white shadow-md"
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <button
                          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition-all duration-200"
                          onClick={() => handleEditSchedule(schedule.id)}
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          Edit
                        </button>
                        <button
                          className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-red-50 transition-all duration-200 group/delete"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDeleteSchedule(schedule.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-gray-400 group-hover/delete:text-red-600 transition-colors" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-white/95 backdrop-blur-xl border-gray-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-gray-900">
              Delete Schedule
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              Are you sure you want to delete this schedule? This action cannot
              be undone and the post will not be published.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteSchedule}
              className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 rounded-lg"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
