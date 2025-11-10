"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  CheckCircle,
  Edit3,
  Globe,
  Camera,
  Info,
  Video,
  Image,
  FileText,
  Calendar as CalendarIcon,
  TrendingUp,
  Users,
  Filter,
  Grid3X3,
  List,
} from "lucide-react";
import { PlatformIcon } from "@/components/ui/platform-icon";

interface ScheduledPost {
  id: string;
  caption: string;
  scheduledAt: Date;
  status: "scheduled" | "published" | "draft";
  platforms: string[];
  userId: string;
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"month" | "week">("month");
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  const [accounts, setAccounts] = useState<
    Array<{
      id: string;
      platform: string;
      username: string;
      avatarUrl?: string;
    }>
  >([]);

  // Générer les jours du mois
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Ajouter les jours du mois précédent pour remplir la première semaine
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({
        date: prevDate,
        isCurrentMonth: false,
        isToday: false,
        posts: [],
      });
    }

    // Ajouter les jours du mois actuel
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isToday = date.toDateString() === new Date().toDateString();

      // Trouver les posts pour ce jour
      const dayPosts = scheduledPosts.filter((post) => {
        if (!post.scheduledAt) return false;
        const postDate = new Date(post.scheduledAt);
        return postDate.toDateString() === date.toDateString();
      });

      if (dayPosts.length > 0) {
      }

      days.push({
        date,
        isCurrentMonth: true,
        isToday,
        posts: dayPosts,
      });
    }

    // Ajouter les jours du mois suivant pour remplir la dernière semaine
    const remainingDays = 42 - days.length; // 6 semaines * 7 jours
    for (let day = 1; day <= remainingDays; day++) {
      const nextDate = new Date(year, month + 1, day);
      days.push({
        date: nextDate,
        isCurrentMonth: false,
        isToday: false,
        posts: [],
      });
    }

    return days;
  };

  // Charger les posts planifiés
  useEffect(() => {
    const fetchScheduledPosts = async () => {
      try {
        const response = await fetch(
          "/api/schedules?userId=FGcdXcRXVoVfsSwJIciurCeuCXz1",
        );
        if (response.ok) {
          const data = await response.json();

          // Convertir les dates Firestore en objets Date
          const posts = (data.schedules || []).map((post: any) => {
            let scheduledAt;
            if (post.scheduledAt?._seconds) {
              // Format Firestore avec _seconds et _nanoseconds
              scheduledAt = new Date(post.scheduledAt._seconds * 1000);
            } else if (post.scheduledAt?.toDate) {
              // Format Firestore avec méthode toDate
              scheduledAt = post.scheduledAt.toDate();
            } else {
              // Format string ou Date
              scheduledAt = new Date(post.scheduledAt);
            }

            return {
              ...post,
              scheduledAt,
            };
          });

          setScheduledPosts(posts);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des posts planifiés:", error);
      }
    };

    const fetchAccounts = async () => {
      try {
        const response = await fetch("/api/accounts");
        if (response.ok) {
          const data = await response.json();
          setAccounts(data.accounts || []);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des comptes:", error);
      }
    };

    fetchScheduledPosts();
    fetchAccounts();
  }, []);

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const goToOctober2025 = () => {
    setCurrentDate(new Date(2025, 9, 1)); // Octobre 2025
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("fr-FR", {
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getContentTypeIcon = (mediaType: string) => {
    switch (mediaType?.toLowerCase()) {
      case "video":
        return <Video className="h-3 w-3 text-blue-600" />;
      case "image":
        return <Image className="h-3 w-3 text-purple-600" />;
      case "text":
        return <FileText className="h-3 w-3 text-slate-600" />;
      default:
        return <FileText className="h-3 w-3 text-slate-600" />;
    }
  };

  const getPostIcon = (platforms: string[]) => {
    // Trouver le premier compte correspondant
    const account = accounts.find((acc) => platforms.includes(acc.id));

    if (account) {
      return (
        <PlatformIcon
          platform={account.platform}
          size="sm"
          profileImageUrl={account.avatarUrl}
          username={account.username}
          className="w-5 h-5"
        />
      );
    }

    // Par défaut, icône TikTok
    return <Camera className="h-5 w-5 text-slate-600" />;
  };

  const days = getDaysInMonth(currentDate);
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Calculer les statistiques
  const totalScheduled = scheduledPosts.length;
  const thisWeekPosts = scheduledPosts.filter((post) => {
    const postDate = new Date(post.scheduledAt);
    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return postDate >= now && postDate <= weekFromNow;
  }).length;
  const todayPosts = scheduledPosts.filter((post) => {
    const postDate = new Date(post.scheduledAt);
    const today = new Date();
    return postDate.toDateString() === today.toDateString();
  }).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Content Calendar
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Plan and manage your scheduled posts
              </p>
            </div>
            <button
              onClick={() => (window.location.href = "/dashboard/upload")}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Schedule Post
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg p-5 border border-gray-200 hover:border-purple-300 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Total Scheduled
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalScheduled}
                </p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <CalendarIcon className="w-5 h-5 text-purple-600" />
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
                  {thisWeekPosts}
                </p>
              </div>
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-gray-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-5 border border-gray-200 hover:border-purple-300 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Today
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {todayPosts}
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
                  Platforms
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {accounts.length}
                </p>
              </div>
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-gray-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Calendar Controls */}
        <div className="bg-white rounded-lg p-6 border border-gray-200 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* Month Navigation */}
              <button
                onClick={() => navigateMonth("prev")}
                className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-bold text-gray-900 min-w-[200px] text-center capitalize">
                {formatDate(currentDate)}
              </h2>
              <button
                onClick={() => navigateMonth("next")}
                className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              {/* Quick Navigation */}
              <button
                onClick={goToToday}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Today
              </button>
              <button
                onClick={goToOctober2025}
                className="px-4 py-2 text-sm font-medium text-purple-700 bg-purple-100 hover:bg-purple-200 rounded-lg transition-colors"
              >
                Oct 2025
              </button>

              {/* View Mode Toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("month")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    viewMode === "month"
                      ? "bg-white text-purple-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Month
                </button>
                <button
                  onClick={() => setViewMode("week")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    viewMode === "week"
                      ? "bg-white text-purple-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Week
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
            {weekDays.map((day) => (
              <div key={day} className="p-4 text-center">
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  {day}
                </span>
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7">
            {days.map((day, index) => (
              <div
                key={index}
                className={`min-h-[140px] border-r border-b border-gray-100 p-3 hover:bg-gray-50 group ${
                  day.isCurrentMonth ? "bg-white" : "bg-gray-50"
                } ${day.isToday ? "bg-purple-50 border-purple-200" : ""}`}
              >
                {/* Date Badge */}
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-sm font-semibold ${
                      day.isCurrentMonth ? "text-gray-900" : "text-gray-400"
                    } ${day.isToday ? "bg-purple-600 text-white px-2.5 py-1 rounded-full text-xs" : ""}`}
                  >
                    {day.date.getDate()}
                  </span>
                  {day.isCurrentMonth && (
                    <button className="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded-lg hover:bg-purple-100 transition-opacity">
                      <Plus className="w-3.5 h-3.5 text-purple-600" />
                    </button>
                  )}
                </div>

                {/* Posts */}
                <div className="space-y-1.5">
                  {day.posts.slice(0, 3).map((post, postIndex) => (
                    <div
                      key={postIndex}
                      className="bg-white border border-gray-200 rounded-lg p-2 hover:border-purple-300 cursor-pointer transition-colors relative group/post"
                    >
                      {/* Content Type Icon */}
                      <div className="absolute top-1.5 right-1.5 opacity-70">
                        {getContentTypeIcon((post as any).mediaType)}
                      </div>

                      {/* Time */}
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Clock className="w-3 h-3 text-purple-500" />
                        <span className="text-xs font-semibold text-slate-700">
                          {formatTime(post.scheduledAt)}
                        </span>
                      </div>

                      {/* Platform & Edit */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {getPostIcon(post.platforms)}
                        </div>
                        <button className="opacity-0 group-hover/post:opacity-100 w-5 h-5 flex items-center justify-center rounded hover:bg-slate-200 transition-all duration-200">
                          <Edit3 className="w-3 h-3 text-slate-600" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* More Posts Indicator */}
                  {day.posts.length > 3 && (
                    <button className="w-full text-xs font-semibold text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 px-2 py-1.5 rounded-lg text-center transition-colors">
                      +{day.posts.length - 3} more
                    </button>
                  )}

                  {/* Empty State */}
                  {day.posts.length === 0 && day.isCurrentMonth && (
                    <div className="text-center py-6 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-8 h-8 border-2 border-dashed border-gray-300 rounded-lg mx-auto flex items-center justify-center">
                        <Plus className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex flex-wrap items-center justify-center gap-4">
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
              <Clock className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-gray-700">
                Scheduled
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-gray-700">
                Published
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
              <Edit3 className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-medium text-gray-700">Draft</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
              <Video className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Video</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
              <Image className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-gray-700">Image</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
              <FileText className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Text</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
