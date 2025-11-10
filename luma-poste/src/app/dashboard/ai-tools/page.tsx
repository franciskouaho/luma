"use client";

import {
  AlertCircle,
  CheckCircle2,
  CircleX,
  Download,
  Loader2,
  Upload,
} from "lucide-react";

import { useCallback, useEffect, useRef, useState } from "react";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_WATERMARK_API_URL ?? "http://localhost:8000"
).replace(/\/+$/, "");

type TaskStatus =
  | "UPLOADING"
  | "PROCESSING"
  | "FINISHED"
  | "ERROR"
  | "CANCELLED";

type BackendStatus = {
  percentage: number;
  status: TaskStatus;
  download_url: string | null;
};

type TaskItem = {
  id: string;
  fileName: string;
  fileSize: number;
  status: TaskStatus;
  progress: number;
  downloadUrl?: string;
  error?: string;
  originalPreviewUrl?: string;
  resultPreviewUrl?: string;
};

const buildApiUrl = (path: string) => {
  if (!path) return API_BASE_URL;
  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
};

const formatFileSize = (sizeInBytes: number) =>
  `${(sizeInBytes / 1024 / 1024).toFixed(1)} MB`;

const generateId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2, 12);

export default function AIToolsPage() {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [estimatedTime, setEstimatedTime] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string | null>(null);
  const [processingStartTime, setProcessingStartTime] = useState<number | null>(
    null,
  );
  const [batchMode, setBatchMode] = useState(false);
  const [videosPerSecond, setVideosPerSecond] = useState<number>(0);
  const [concurrentVideos, setConcurrentVideos] = useState<number>(0);

  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const tasksRef = useRef<TaskItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewUrlsRef = useRef<string[]>([]);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    tasksRef.current = tasks;
  }, [tasks]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files).slice(0, 20);
      setSelectedFiles(files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).slice(0, 20);
      setSelectedFiles(files);
    }
  };

  useEffect(() => {
    previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    const urls = selectedFiles.map((file) => URL.createObjectURL(file));
    previewUrlsRef.current = urls;
    setPreviewUrls(urls);

    // Calculer l'estimation du temps de traitement
    if (selectedFiles.length > 0) {
      estimateProcessingTime(selectedFiles).then((seconds) => {
        setEstimatedTime(formatEstimatedTime(seconds));
      });
    } else {
      setEstimatedTime(null);
    }

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [selectedFiles]);

  const cancelActiveTasks = useCallback(() => {
    const activeTasks = tasksRef.current.filter(
      (task) => task.status === "UPLOADING" || task.status === "PROCESSING",
    );

    if (activeTasks.length === 0) {
      return;
    }

    const activeTaskIds = activeTasks.map((task) => task.id);

    activeTasks.forEach((task) => {
      if (task.originalPreviewUrl) {
        URL.revokeObjectURL(task.originalPreviewUrl);
      }
      if (task.resultPreviewUrl) {
        URL.revokeObjectURL(task.resultPreviewUrl);
      }
    });

    setTasks((prev) =>
      prev.map((task) =>
        activeTaskIds.includes(task.id)
          ? {
              ...task,
              status: "CANCELLED" as TaskStatus,
              progress: 0,
              downloadUrl: undefined,
              originalPreviewUrl: undefined,
              resultPreviewUrl: undefined,
            }
          : task,
      ),
    );

    const payload = JSON.stringify({ task_ids: activeTaskIds });

    // Utiliser fetch avec keepalive au lieu de sendBeacon pour s'assurer que les headers sont corrects
    void fetch(`${API_BASE_URL}/cancel_tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    }).catch((err) => {
      console.error("Failed to cancel tasks:", err);
    });
  }, []);

  useEffect(() => {
    const handleBeforeUnload = () => {
      cancelActiveTasks();
    };

    const handlePageHide = () => {
      cancelActiveTasks();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("pagehide", handlePageHide);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("pagehide", handlePageHide);
      cancelActiveTasks();
    };
  }, [cancelActiveTasks]);

  const pollStatuses = useCallback(async () => {
    const activeTasks = tasksRef.current.filter(
      (task) => task.status === "UPLOADING" || task.status === "PROCESSING",
    );

    if (activeTasks.length === 0) {
      return;
    }

    try {
      const updates = await Promise.all(
        activeTasks.map(async (task) => {
          const response = await fetch(
            `${API_BASE_URL}/get_results?remove_task_id=${task.id}`,
          );
          if (!response.ok) {
            throw new Error(`Statut HTTP inattendu: ${response.status}`);
          }
          const data = (await response.json()) as BackendStatus;
          return { id: task.id, data };
        }),
      );

      setTasks((prev) => {
        const updatedTasks = prev.map((task) => {
          const update = updates.find((item) => item.id === task.id);
          if (!update) {
            return task;
          }

          return {
            ...task,
            status: update.data.status,
            progress: update.data.percentage ?? 0,
            downloadUrl: update.data.download_url ?? undefined,
            resultPreviewUrl:
              update.data.status === "FINISHED" && update.data.download_url
                ? buildApiUrl(update.data.download_url)
                : task.resultPreviewUrl,
          };
        });

        // Check if all tasks are finished for ZIP download
        const allFinished = updatedTasks.every(
          (task) =>
            task.status === "FINISHED" ||
            task.status === "ERROR" ||
            task.status === "CANCELLED",
        );

        const successfulTasks = updatedTasks.filter(
          (task) => task.status === "FINISHED",
        );

        // Auto-download ZIP when batch completes (for multiple videos)
        if (
          allFinished &&
          successfulTasks.length > 1 &&
          updatedTasks.length > 1
        ) {
          setTimeout(() => {
            // Create ZIP download automatically
            const zipFilename = `watermarks_removed_${successfulTasks.length}_videos.zip`;
            const taskIds = successfulTasks.map((t) => t.id).join(",");

            // Show notification first
            setErrorMessage(
              `🎉 ZIP automatique: ${successfulTasks.length} vidéos téléchargées!`,
            );

            // Trigger automatic ZIP download
            const link = document.createElement("a");
            link.href = `${API_BASE_URL}/download_batch_zip?tasks=${taskIds}`;
            link.download = zipFilename;
            link.style.display = "none";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Clear notification after 5 seconds
            setTimeout(() => setErrorMessage(null), 5000);
          }, 2000);
        }

        return updatedTasks;
      });
    } catch (error) {
      console.error("Erreur lors du polling des statuts:", error);
    }
  }, []);

  useEffect(() => {
    const hasActiveTasks = tasks.some(
      (task) => task.status === "UPLOADING" || task.status === "PROCESSING",
    );

    if (hasActiveTasks && !pollingRef.current) {
      void pollStatuses();
      pollingRef.current = setInterval(() => {
        void pollStatuses();
      }, 2000); // Polling toutes les 2 secondes au lieu de 4
    } else if (!hasActiveTasks && pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, [tasks, pollStatuses]);

  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, []);

  const getVideoDuration = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        resolve(video.duration);
      };
      video.onerror = () => {
        resolve(0); // Fallback si erreur
      };
      video.src = URL.createObjectURL(file);
    });
  };

  const estimateProcessingTime = async (files: File[]): Promise<number> => {
    // Pour les images, temps fixe
    const imageFiles = files.filter((f) => f.type.startsWith("image/"));
    const videoFiles = files.filter((f) => f.type.startsWith("video/"));

    let totalSeconds = imageFiles.length * 15; // ~15 secondes par image

    // Pour les vidéos, estimer en fonction de la durée
    // Formule: ~3-4 secondes de traitement par seconde de vidéo (modèle IA lent)
    for (const videoFile of videoFiles) {
      const duration = await getVideoDuration(videoFile);
      totalSeconds += duration * 3;
    }

    return Math.ceil(totalSeconds);
  };

  const formatEstimatedTime = (seconds: number): string => {
    if (seconds < 60) {
      return `~${seconds} secondes`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (remainingSeconds === 0) {
      return `~${minutes} minute${minutes > 1 ? "s" : ""}`;
    }
    return `~${minutes} min ${remainingSeconds}s`;
  };

  const handleUpload = async () => {
    if (!selectedFiles.length || isUploading) {
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);

    // Traitement batch : envoyer jusqu'à 20 vidéos simultanément
    const uploadPromises = selectedFiles.map(async (file) => {
      const originalPreviewUrl = URL.createObjectURL(file);
      try {
        const formData = new FormData();
        formData.append("video", file);

        const response = await fetch(`${API_BASE_URL}/submit_remove_task`, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error(
            `Échec de l'envoi (${response.status} ${response.statusText})`,
          );
        }

        const data = (await response.json()) as { task_id: string };

        return {
          id: data.task_id,
          fileName: file.name,
          fileSize: file.size,
          status: "PROCESSING" as TaskStatus,
          progress: 0,
          originalPreviewUrl,
        };
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Erreur inconnue lors de l'envoi.";
        setErrorMessage(message);
        URL.revokeObjectURL(originalPreviewUrl);
        return {
          id: generateId(),
          fileName: file.name,
          fileSize: file.size,
          status: "ERROR" as TaskStatus,
          progress: 0,
          error: message,
          originalPreviewUrl,
        };
      }
    });

    const newTasks = await Promise.all(uploadPromises);
    setTasks((prev) => [...prev, ...newTasks]);

    // Démarrer le timer de décompte
    setProcessingStartTime(Date.now());

    setSelectedFiles([]);
    setIsUploading(false);
  };

  const removeSelectedFile = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    index: number,
  ) => {
    e.stopPropagation();
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
  };

  // Fonction pour calculer le temps restant
  const updateTimeRemaining = useCallback(() => {
    const activeTask = tasks.find(
      (task) => task.status === "PROCESSING" || task.status === "UPLOADING",
    );

    if (!activeTask || !processingStartTime) {
      setTimeRemaining(null);
      return;
    }

    const elapsed = (Date.now() - processingStartTime) / 1000;
    const progress = Math.max(activeTask.progress, 0.01); // Éviter division par 0
    const estimatedTotal = elapsed / (progress / 100);
    const remaining = Math.max(0, estimatedTotal - elapsed);

    if (remaining < 60) {
      setTimeRemaining(`${Math.ceil(remaining)}s restantes`);
    } else {
      const minutes = Math.floor(remaining / 60);
      const seconds = Math.ceil(remaining % 60);
      setTimeRemaining(`${minutes}m ${seconds}s restantes`);
    }
  }, [tasks, processingStartTime]);

  // Effect pour mettre à jour le countdown
  useEffect(() => {
    const hasActiveTask = tasks.some(
      (task) => task.status === "PROCESSING" || task.status === "UPLOADING",
    );

    if (hasActiveTask && processingStartTime) {
      updateTimeRemaining();
      if (!countdownRef.current) {
        countdownRef.current = setInterval(updateTimeRemaining, 1000);
      }
    } else {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
      setTimeRemaining(null);
      if (!hasActiveTask) {
        setProcessingStartTime(null);
      }
    }

    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
    };
  }, [tasks, processingStartTime, updateTimeRemaining]);

  const renderTaskStatus = (task: TaskItem) => {
    if (task.status === "FINISHED") {
      return (
        <div className="flex items-center space-x-2 text-green-600">
          <CheckCircle2 className="w-4 h-4" />
          <span>Terminé</span>
        </div>
      );
    }

    if (task.status === "ERROR") {
      return (
        <div className="flex items-center space-x-2 text-red-600">
          <AlertCircle className="w-4 h-4" />
          <span>Erreur</span>
        </div>
      );
    }

    if (task.status === "CANCELLED") {
      return (
        <div className="flex items-center space-x-2 text-gray-500">
          <CircleX className="w-4 h-4" />
          <span>Annulé</span>
        </div>
      );
    }

    return (
      <div className="flex items-center space-x-2 text-blue-600">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>{task.status === "UPLOADING" ? "Upload" : "Traitement"}...</span>
      </div>
    );
  };

  const activeTask = tasks
    .slice()
    .reverse()
    .find((task) => task.originalPreviewUrl);

  const activeTaskProgress = Math.min(
    Math.max(activeTask?.progress ?? 0, 0),
    100,
  );
  const isActiveProcessing =
    activeTask?.status === "UPLOADING" || activeTask?.status === "PROCESSING";
  const isActiveFinished =
    activeTask?.status === "FINISHED" && !!activeTask.resultPreviewUrl;
  const isActiveError = activeTask?.status === "ERROR";
  const isActiveCancelled = activeTask?.status === "CANCELLED";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Watermark & Text Remover
          </h1>
          <p className="text-gray-600">
            Easily remove distracting watermarks and logos from videos and
            images. Process up to 20 videos simultaneously!
          </p>

          {/* Performance Indicator */}
          <div className="mt-4 flex justify-center items-center gap-6">
            <div className="flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-full">
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-amber-700">
                ⚡ 30-45s par vidéo (qualité max)
              </span>
            </div>
            {selectedFiles.length > 1 && (
              <div className="flex items-center gap-2 bg-purple-50 px-4 py-2 rounded-full">
                <span className="text-sm font-medium text-purple-700">
                  🚀 {selectedFiles.length} videos batch
                </span>
              </div>
            )}
            {batchMode && concurrentVideos > 1 && (
              <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full">
                <span className="text-sm font-medium text-blue-700">
                  📊 {concurrentVideos} concurrent
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 px-8 py-12">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="space-y-10">
            {/* Zone de drag & drop */}
            <div className="relative rounded-3xl">
              {/* Bordure de progression qui se remplit progressivement autour */}
              {activeTask && (isActiveProcessing || isActiveFinished) && (
                <div className="absolute inset-0 rounded-3xl pointer-events-none">
                  {/* Bordure de fond (grise) */}
                  <div className="absolute inset-0 rounded-3xl border-4 border-gray-200" />

                  {/* Bordures de progression - se remplissent séquentiellement */}
                  <div className="absolute inset-0 rounded-3xl overflow-hidden">
                    {/* Top border - 0-25% */}
                    <div
                      className="absolute top-0 left-0 h-1 transition-all duration-300 ease-out"
                      style={{
                        width: `${Math.min(activeTaskProgress * 4, 100)}%`,
                        backgroundColor: isActiveFinished
                          ? "#22c55e"
                          : "#a855f7",
                      }}
                    />
                    {/* Right border - 25-50% */}
                    {activeTaskProgress > 25 && (
                      <div
                        className="absolute top-0 right-0 w-1 transition-all duration-300 ease-out"
                        style={{
                          height: `${Math.min((activeTaskProgress - 25) * 4, 100)}%`,
                          backgroundColor: isActiveFinished
                            ? "#22c55e"
                            : "#a855f7",
                        }}
                      />
                    )}
                    {/* Bottom border - 50-75% */}
                    {activeTaskProgress > 50 && (
                      <div
                        className="absolute bottom-0 right-0 h-1 transition-all duration-300 ease-out"
                        style={{
                          width: `${Math.min((activeTaskProgress - 50) * 4, 100)}%`,
                          backgroundColor: isActiveFinished
                            ? "#22c55e"
                            : "#a855f7",
                        }}
                      />
                    )}
                    {/* Left border - 75-100% */}
                    {activeTaskProgress > 75 && (
                      <div
                        className="absolute bottom-0 left-0 w-1 transition-all duration-300 ease-out"
                        style={{
                          height: `${Math.min((activeTaskProgress - 75) * 4, 100)}%`,
                          backgroundColor: isActiveFinished
                            ? "#22c55e"
                            : "#a855f7",
                        }}
                      />
                    )}
                  </div>
                </div>
              )}
              <div
                className={`relative overflow-hidden border border-solid rounded-3xl p-12 lg:p-20 transition-colors min-h-[560px] flex items-center justify-center`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(147,51,234,0.12),transparent_55%)]" />
                <div className="w-full max-w-5xl cursor-pointer space-y-10 relative z-10">
                  {activeTask ? (
                    <div onClick={(e) => e.stopPropagation()}>
                      <div className="space-y-8 md:space-y-10">
                        <div className="flex flex-col items-center gap-3 text-center">
                          <span className="inline-flex items-center gap-2 rounded-full bg-purple-100 px-4 py-1 text-xs font-semibold text-purple-700 uppercase tracking-wider">
                            Live Preview
                          </span>
                          <h2 className="text-3xl font-bold text-gray-900 leading-snug">
                            Prévisualisation en direct
                          </h2>
                          <p className="text-sm text-gray-600">
                            Glissez-déposez une nouvelle vidéo ou cliquez pour
                            en sélectionner une autre.
                          </p>
                          <div className="flex items-center gap-3">
                            <div
                              className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm text-gray-700"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {renderTaskStatus(activeTask)}
                              {isActiveProcessing && (
                                <span className="text-gray-500">
                                  · {activeTaskProgress}%
                                </span>
                              )}
                              {isActiveProcessing && timeRemaining && (
                                <span className="text-purple-600 font-medium">
                                  · {timeRemaining}
                                </span>
                              )}
                              {isActiveProcessing && videosPerSecond > 0 && (
                                <span className="text-green-600 font-medium">
                                  · {videosPerSecond.toFixed(1)}vid/s
                                </span>
                              )}
                            </div>
                            {isActiveFinished && activeTask.downloadUrl && (
                              <div className="flex flex-col items-center gap-3">
                                <div className="flex items-center gap-3">
                                  <a
                                    href={buildApiUrl(activeTask.downloadUrl)}
                                    onClick={(e) => e.stopPropagation()}
                                    className="inline-flex items-center gap-2 rounded-full bg-green-600 hover:bg-green-700 text-white px-6 py-2 text-sm font-medium transition-colors shadow-md shadow-green-500/20"
                                  >
                                    <Download className="w-4 h-4" />
                                    Télécharger
                                  </a>
                                  {tasks.filter((t) => t.status === "FINISHED")
                                    .length > 1 && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const successfulTasks = tasks.filter(
                                          (t) => t.status === "FINISHED",
                                        );
                                        const zipFilename = `watermarks_removed_${successfulTasks.length}_videos.zip`;

                                        // Create and trigger ZIP download
                                        const taskIds = successfulTasks
                                          .map((t) => t.id)
                                          .join(",");
                                        const link =
                                          document.createElement("a");
                                        link.href = `${API_BASE_URL}/download_batch_zip?tasks=${taskIds}`;
                                        link.download = zipFilename;
                                        link.style.display = "none";
                                        document.body.appendChild(link);
                                        link.click();
                                        document.body.removeChild(link);
                                      }}
                                      className="inline-flex items-center gap-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 text-sm font-medium transition-colors shadow-md shadow-blue-500/20"
                                    >
                                      <Download className="w-4 h-4" />
                                      ZIP (
                                      {
                                        tasks.filter(
                                          (t) => t.status === "FINISHED",
                                        ).length
                                      }
                                      )
                                    </button>
                                  )}
                                </div>
                                {tasks.filter((t) => t.status === "FINISHED")
                                  .length > 1 && (
                                  <div className="text-center">
                                    <p className="text-xs text-green-600 font-medium animate-pulse">
                                      📦 ZIP téléchargé automatiquement ✅
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2 lg:max-w-4xl lg:mx-auto">
                          <div className="space-y-3">
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                              Original
                            </p>
                            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-black/90 h-[320px] flex items-center justify-center">
                              {activeTask.originalPreviewUrl ? (
                                <video
                                  src={activeTask.originalPreviewUrl}
                                  controls
                                  playsInline
                                  className="w-full h-full object-contain bg-black"
                                  onClick={(e) => e.stopPropagation()}
                                />
                              ) : (
                                <div className="flex items-center justify-center text-sm text-gray-400">
                                  Prévisualisation indisponible
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="space-y-3">
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                              Résultat
                            </p>
                            <div
                              className={`overflow-hidden rounded-2xl border h-[320px] flex items-center justify-center ${
                                isActiveFinished
                                  ? "border-gray-200 bg-black/90"
                                  : isActiveError
                                    ? "border-red-200 bg-red-50"
                                    : isActiveCancelled
                                      ? "border-amber-200 bg-amber-50/80"
                                      : "border-gray-200 bg-slate-50"
                              }`}
                            >
                              {isActiveFinished ? (
                                <video
                                  src={activeTask.resultPreviewUrl}
                                  controls
                                  playsInline
                                  className="w-full h-full object-contain bg-black"
                                  onClick={(e) => e.stopPropagation()}
                                />
                              ) : (
                                <div className="flex flex-col items-center justify-center gap-3 text-sm">
                                  {isActiveProcessing ? (
                                    <>
                                      <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
                                      <div className="text-center">
                                        <p className="text-gray-700 font-medium">
                                          Suppression des watermarks...
                                        </p>
                                        <p className="text-sm text-gray-500 mt-1">
                                          {activeTaskProgress}% terminé
                                        </p>
                                        {timeRemaining && (
                                          <p className="text-sm text-purple-600 font-medium mt-1">
                                            ⏱️ {timeRemaining}
                                          </p>
                                        )}
                                        {selectedFiles.length > 1 && (
                                          <p className="text-sm text-blue-600 font-medium mt-1">
                                            📦 ZIP auto + suppression totale
                                          </p>
                                        )}
                                      </div>
                                    </>
                                  ) : isActiveError ? (
                                    <>
                                      <AlertCircle className="h-6 w-6 text-red-500" />
                                      <span>Erreur de traitement</span>
                                    </>
                                  ) : isActiveCancelled ? (
                                    <>
                                      <CircleX className="h-6 w-6 text-gray-500" />
                                      <span>Traitement annulé</span>
                                    </>
                                  ) : (
                                    <span>Prévisualisation indisponible</span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-10">
                      {selectedFiles.length === 0 && (
                        <>
                          <div className="text-center space-y-4">
                            <span className="inline-flex items-center gap-2 rounded-full bg-purple-100 px-4 py-1 text-xs font-semibold text-purple-700 uppercase tracking-wider">
                              Drag & Drop
                            </span>
                            <h2 className="text-4xl font-extrabold text-gray-900 leading-tight">
                              Supprimez les filigranes en quelques secondes
                            </h2>
                            <p className="text-base text-gray-600 max-w-2xl mx-auto">
                              Importez vos vidéos et images, nous nous chargeons
                              d’effacer les logos, textes et éléments gênants
                              tout en conservant la qualité originale.
                            </p>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              fileInputRef.current?.click();
                            }}
                            className="bg-linear-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-12 py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-3 transition-all shadow-md shadow-purple-500/20 mx-auto"
                          >
                            <Upload className="w-6 h-6" />
                            <span>Ajouter un fichier</span>
                          </button>

                          <div className="space-y-4">
                            <p className="text-base text-gray-600 font-medium text-center">
                              Cliquez ici pour sélectionner des fichiers ou
                              glissez-déposez-les directement.
                            </p>
                            <p className="text-sm text-gray-500 text-center">
                              Formats pris en charge : MP4, MOV, M4V, 3GP, AVI,
                              JPG, PNG, JPEG
                            </p>
                          </div>
                        </>
                      )}

                      {selectedFiles.length > 0 && (
                        <div className="space-y-6">
                          <div className="flex flex-col items-center gap-3 text-center">
                            <h3 className="text-xl font-semibold text-gray-900">
                              {selectedFiles.length} fichier(s) sélectionné(s)
                            </h3>
                            {/* Batch Processing Performance Indicator */}
                            {selectedFiles.length > 1 && (
                              <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
                                <div className="flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-full">
                                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                                  <span className="text-xs font-medium text-amber-700">
                                    🎯 30-45s (100% clean)
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 bg-purple-50 px-3 py-1.5 rounded-full">
                                  <span className="text-xs font-medium text-purple-700">
                                    🎯 {Math.min(selectedFiles.length, 20)}{" "}
                                    vidéos → suppression totale
                                  </span>
                                </div>
                                {selectedFiles.length > 5 && (
                                  <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-full">
                                    <span className="text-xs font-medium text-blue-700">
                                      📊 Qualité maximale
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}
                            {estimatedTime && (
                              <div className="bg-gray-50 px-4 py-2 rounded-lg">
                                <span className="text-sm text-gray-600">
                                  Temps estimé total:{" "}
                                  <span className="font-medium">
                                    {estimatedTime}
                                  </span>
                                </span>
                              </div>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                fileInputRef.current?.click();
                              }}
                              className="inline-flex items-center gap-2 rounded-lg border border-purple-200 px-4 py-2 text-sm font-medium text-purple-700 hover:border-purple-300 hover:bg-purple-50 transition-colors"
                            >
                              <Upload className="w-4 h-4" />
                              Ajouter un autre fichier
                            </button>
                          </div>
                          <div className="grid gap-3 max-w-2xl mx-auto sm:grid-cols-3 lg:grid-cols-4">
                            {selectedFiles.map((file, index) => (
                              <div
                                key={`${file.name}-${index}`}
                                className="relative overflow-hidden rounded-2xl border border-gray-200 bg-gray-900/80 text-white shadow-sm transition-transform hover:-translate-y-1 aspect-9/16"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {previewUrls[index] ? (
                                  file.type.startsWith("image/") ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                      src={previewUrls[index]}
                                      alt={file.name}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <video
                                      src={previewUrls[index]}
                                      className="h-full w-full object-cover"
                                      controls
                                      playsInline
                                      preload="metadata"
                                    />
                                  )
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center bg-gray-800 text-sm text-gray-300">
                                    Aperçu indisponible
                                  </div>
                                )}
                                <button
                                  onClick={(e) => removeSelectedFile(e, index)}
                                  className="absolute top-2 right-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur transition hover:bg-black/80"
                                  aria-label="Supprimer ce fichier"
                                >
                                  ×
                                </button>
                                <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 via-black/20 to-transparent p-3">
                                  <p className="truncate text-sm font-medium">
                                    {file.name}
                                  </p>
                                  <p className="text-xs text-white/70">
                                    {formatFileSize(file.size)}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="flex flex-col items-end gap-3">
                            {estimatedTime && !isUploading && (
                              <div className="flex items-center gap-2 text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
                                <svg
                                  className="w-4 h-4 text-blue-600"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                                <span className="font-medium text-blue-700">
                                  Temps estimé : {estimatedTime}
                                </span>
                              </div>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                void handleUpload();
                              }}
                              disabled={isUploading}
                              className={`group relative inline-flex items-center justify-center gap-2 rounded-xl px-8 py-3 text-base font-semibold text-white transition-all shadow-lg ${
                                isUploading
                                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                  : "bg-linear-to-r from-purple-600 via-purple-700 to-purple-600 hover:shadow-purple-500/30"
                              }`}
                            >
                              {!isUploading && (
                                <span className="absolute inset-0 rounded-xl border border-white/20 opacity-0 transition-opacity group-hover:opacity-100" />
                              )}
                              {isUploading ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  Traitement...
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="h-5 w-5 text-white/90" />
                                  Lancer le nettoyage
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )}

                      {errorMessage && (
                        <div className="max-w-md mx-auto text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                          {errorMessage}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Input caché (en dehors de la zone de drag & drop) */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".mp4,.mov,.m4v,.3gp,.avi,.jpg,.png,.jpeg"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
