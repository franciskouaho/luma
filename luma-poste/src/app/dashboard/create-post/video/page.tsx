"use client";

import TikTokSettings, {
  TikTokPostSettings,
  TikTokSettingsValidation,
} from "@/components/tiktok/TikTokSettings";
import { Checkbox } from "@/components/ui/checkbox";
import { PlatformIcon } from "@/components/ui/platform-icon";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import {
  Calendar,
  Clock,
  History,
  Info,
  Play,
  Save,
  Settings,
  Sparkles,
  Upload,
  Wand2,
  X,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

interface TikTokAccount {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  isActive: boolean;
  platform: string;
}

interface Platform {
  id: string;
  name: string;
  icon: string;
  color: string;
  connected: boolean;
  username?: string;
  avatar?: string;
  displayName?: string;
  accountId?: string;
}

// REQUIRED BY TIKTOK: All interaction settings must be OFF by default
// Privacy level must have NO default value (user must manually select)
const DEFAULT_TIKTOK_SETTINGS: TikTokPostSettings = {
  privacyLevel: null, // REQUIRED: No default value - user must manually select
  allowComments: false, // REQUIRED: Must be unchecked by default
  allowDuet: false, // REQUIRED: Must be unchecked by default
  allowStitch: false, // REQUIRED: Must be unchecked by default
  commercialContent: {
    enabled: false, // REQUIRED: Must be off by default
    yourBrand: false,
    brandedContent: false,
  },
};

const getResetTikTokSettings = (): TikTokPostSettings => ({
  ...DEFAULT_TIKTOK_SETTINGS,
});

function CreateVideoPostPageContent() {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [selectedHashtags, setSelectedHashtags] = useState<string[]>([]);
  const [hashtagInput, setHashtagInput] = useState("");
  const [showHashtagSuggestions, setShowHashtagSuggestions] = useState(false);
  const [showCoverModal, setShowCoverModal] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Hashtags populaires par catégorie
  const popularHashtags = {
    general: [
      "#fyp",
      "#viral",
      "#trending",
      "#foryou",
      "#explore",
      "#reels",
      "#tiktok",
      "#funny",
      "#comedy",
      "#dance",
    ],
    lifestyle: [
      "#lifestyle",
      "#motivation",
      "#inspiration",
      "#selfcare",
      "#wellness",
      "#mindfulness",
      "#positivity",
      "#growth",
      "#success",
      "#happiness",
    ],
    tech: [
      "#tech",
      "#innovation",
      "#ai",
      "#coding",
      "#programming",
      "#startup",
      "#entrepreneur",
      "#business",
      "#digital",
      "#future",
    ],
    food: [
      "#food",
      "#cooking",
      "#recipe",
      "#delicious",
      "#yummy",
      "#foodie",
      "#homemade",
      "#healthy",
      "#tasty",
      "#chef",
    ],
    travel: [
      "#travel",
      "#wanderlust",
      "#adventure",
      "#explore",
      "#vacation",
      "#trip",
      "#journey",
      "#destination",
      "#world",
      "#nature",
    ],
    fashion: [
      "#fashion",
      "#style",
      "#outfit",
      "#ootd",
      "#trendy",
      "#beauty",
      "#makeup",
      "#skincare",
      "#glam",
      "#chic",
    ],
  };

  // Fonctions pour gérer les hashtags
  const addHashtag = (hashtag: string) => {
    const cleanHashtag = hashtag.startsWith("#") ? hashtag : `#${hashtag}`;
    if (
      !selectedHashtags.includes(cleanHashtag) &&
      selectedHashtags.length < 5
    ) {
      setSelectedHashtags([...selectedHashtags, cleanHashtag]);
    }
    setHashtagInput("");
    setShowHashtagSuggestions(false);
  };

  const removeHashtag = (hashtag: string) => {
    setSelectedHashtags(selectedHashtags.filter((h) => h !== hashtag));
  };

  const handleHashtagInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && hashtagInput.trim()) {
      e.preventDefault();
      addHashtag(hashtagInput.trim());
    }
  };

  // Fermer les suggestions quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (
        !target.closest(".hashtag-suggestions") &&
        !target.closest(".hashtag-input")
      ) {
        setShowHashtagSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Mettre à jour le caption avec les hashtags
  const updateCaptionWithHashtags = () => {
    const hashtagsText = selectedHashtags.join(" ");
    const baseCaption = caption.replace(/\s*#\w+/g, "").trim();
    return baseCaption + (hashtagsText ? `\n\n${hashtagsText}` : "");
  };

  const [selectedCoverFrame, setSelectedCoverFrame] = useState<number>(0);
  const [videoDuration, setVideoDuration] = useState<number | null>(null);
  const [coverFrames, setCoverFrames] = useState<string[]>([]);
  const [scheduleEnabled, setScheduleEnabled] = useState(true);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [accounts, setAccounts] = useState<TikTokAccount[]>([]);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [primaryActionProgress, setPrimaryActionProgress] = useState(0);
  const [editingDraftData, setEditingDraftData] = useState<{
    id: string;
    videoUrl: string;
    caption: string;
    thumbnailUrl?: string;
  } | null>(null);
  const [editingScheduleData, setEditingScheduleData] = useState<{
    id: string;
    videoUrl: string;
    caption: string;
    thumbnailUrl?: string;
    scheduledAt: string;
  } | null>(null);
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string | null>(null);
  const [isGeneratingFrames, setIsGeneratingFrames] = useState(false);
  const tiktokSettingsRef = useRef<TikTokPostSettings>(
    getResetTikTokSettings(),
  );
  const [tiktokInitialSettings, setTiktokInitialSettings] =
    useState<TikTokPostSettings>(getResetTikTokSettings());
  const [tiktokSettingsKey, setTiktokSettingsKey] = useState(0);
  const [tiktokValidation, setTikTokValidation] =
    useState<TikTokSettingsValidation | null>(null);
  const [showTikTokSettingsInline, setShowTikTokSettingsInline] =
    useState(false);
  const [showVideoProcessingInline, setShowVideoProcessingInline] =
    useState(false);
  const [videoProcessingSettings, setVideoProcessingSettings] = useState({
    enabled: true,
    rememberPreference: false,
  });
  const [showAICaptionInline, setShowAICaptionInline] = useState(false);
  const [showPastCaptionsInline, setShowPastCaptionsInline] = useState(false);
  const handleTikTokSettingsChange = useCallback(
    (settings: TikTokPostSettings) => {
      tiktokSettingsRef.current = settings;
    },
    [],
  );
  const resetTikTokSettings = useCallback(
    (override?: Partial<TikTokPostSettings>) => {
      const next: TikTokPostSettings = {
        ...getResetTikTokSettings(),
        ...(override ?? {}),
      };
      tiktokSettingsRef.current = next;
      setTiktokInitialSettings(next);
      setTiktokSettingsKey((key) => key + 1);
      setTikTokValidation(null);
    },
    [],
  );
  const [videoDurationError, setVideoDurationError] = useState<string | null>(
    null,
  );
  const [publishStatus, setPublishStatus] = useState<{
    publishId?: string;
    status?: string;
    history: { timestamp: string; message: string }[];
  }>({ history: [] });
  const [pendingPublishId, setPendingPublishId] = useState<string | null>(null);
  const [creatorInfo, setCreatorInfo] = useState<any>(null);
  const [, setLoadingCreatorInfo] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchParams = useSearchParams();

  const addStatusEntry = (
    message: string,
    overrides?: Partial<{ publishId: string; status: string }>,
  ) => {
    setPublishStatus((prev) => ({
      publishId: overrides?.publishId ?? prev.publishId,
      status: overrides?.status ?? prev.status,
      history: [
        { timestamp: new Date().toISOString(), message },
        ...prev.history,
      ],
    }));
  };

  const getSelectedTikTokAccountId = () => {
    return selectedPlatforms.find((id) =>
      accounts.some((acc) => acc.id === id && acc.platform === "tiktok"),
    );
  };

  const ensureSubmissionPrerequisites = (action: "publish" | "schedule") => {
    if (!videoFile) {
      toast({
        variant: "destructive",
        title: "Vidéo manquante",
        description:
          "Merci de sélectionner un fichier vidéo avant de continuer.",
      });
      return false;
    }

    if (selectedPlatforms.length === 0) {
      toast({
        variant: "destructive",
        title: "Plateforme non sélectionnée",
        description: "Choisissez au moins une plateforme avant de publier.",
      });
      return false;
    }

    if (videoDurationError) {
      toast({
        variant: "destructive",
        title: "Durée vidéo non conforme",
        description: videoDurationError,
      });
      return false;
    }

    const tikTokAccountId = getSelectedTikTokAccountId();
    const currentTikTokSettings = tiktokSettingsRef.current;
    if (tikTokAccountId) {
      if (!creatorInfo) {
        toast({
          variant: "destructive",
          title: "Infos créateur en cours",
          description:
            "Patientez le chargement des informations TikTok avant de lancer la publication.",
        });
        return false;
      }

      if (!currentTikTokSettings.privacyLevel) {
        toast({
          variant: "destructive",
          title: "Privacy obligatoire",
          description:
            "Sélectionnez une option de privacy fournie par TikTok avant de continuer.",
        });
        return false;
      }

      if (!tiktokValidation?.privacySelected) {
        toast({
          variant: "destructive",
          title: "Privacy manquante",
          description:
            "Vous devez choisir une privacy TikTok avant de publier.",
        });
        return false;
      }

      if (!tiktokValidation?.brandedContentPrivacyValid) {
        toast({
          variant: "destructive",
          title: "Privacy incompatible",
          description:
            'Branded content ne peut pas être publié en mode "only me". Adaptez vos réglages.',
        });
        return false;
      }

      if (!tiktokValidation?.commercialSelectionValid) {
        toast({
          variant: "destructive",
          title: "Choix commercial requis",
          description:
            "Indiquez si votre contenu promeut votre marque, un tiers ou les deux.",
        });
        return false;
      }
    }

    if (!caption.trim()) {
      toast({
        title: "Caption vide",
        description:
          "Vous publiez sans description. Vous pouvez ajouter une description si vous le souhaitez.",
        duration: 3000,
      });
    }

    if (action === "publish") {
      addStatusEntry("Début de la publication...");
    }

    return true;
  };

  const pollPublishStatus = async (
    publishId: string,
    accountId: string,
    attempt = 0,
  ) => {
    if (!user) return;
    const maxAttempts = 12;
    try {
      const response = await fetch("/api/publish/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          publishId,
          accountId,
          userId: user.uid,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Statut introuvable");
      }

      setPublishStatus((prev) => ({
        publishId,
        status: data.status,
        history: [
          {
            timestamp: new Date().toISOString(),
            message: data.failReason
              ? `Status: ${data.status} - ${data.failReason}`
              : `Status: ${data.status}`,
          },
          ...prev.history,
        ],
      }));

      if (
        data.status &&
        [
          "PROCESSING_DOWNLOAD",
          "PROCESSING_UPLOAD",
          "PROCESSING_POST",
        ].includes(data.status) &&
        attempt < maxAttempts
      ) {
        setTimeout(
          () => pollPublishStatus(publishId, accountId, attempt + 1),
          5000,
        );
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Erreur inconnue lors du suivi de statut";
      addStatusEntry(`Erreur statut TikTok : ${message}`);
    }
  };

  const selectedTikTokAccountId = getSelectedTikTokAccountId();
  const publishDisabledReason = (() => {
    if (!videoFile) return "Ajoutez une vidéo avant de continuer";
    if (selectedPlatforms.length === 0)
      return "Sélectionnez au moins une plateforme";
    return null;
  })();

  const primaryActionDisabled =
    publishDisabledReason !== null ||
    (scheduleEnabled ? isScheduling : isPublishing);
  const publishButtonTitle = publishDisabledReason ?? undefined;

  const creatorBlocked = false;
  const showCreatorBlockedBanner = false;

  // Fonction pour charger les informations du créateur TikTok
  const loadCreatorInfo = async (accountId: string) => {
    if (!user) return;

    setLoadingCreatorInfo(true);
    try {
      const response = await fetch(
        `/api/tiktok/creator-info?userId=${user.uid}&accountId=${accountId}`,
      );
      const data = await response.json();

      if (data.success) {
        setCreatorInfo(data.creatorInfo);
      } else {
        console.error(
          "Erreur lors du chargement des infos créateur:",
          data.error,
        );
        toast({
          title: "Erreur",
          description:
            "Impossible de charger les informations du créateur TikTok",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erreur lors du chargement des infos créateur:", error);
      toast({
        title: "Erreur",
        description: "Erreur lors du chargement des informations du créateur",
        variant: "destructive",
      });
    } finally {
      setLoadingCreatorInfo(false);
    }
  };

  // Charger les informations du créateur quand un compte TikTok est sélectionné
  useEffect(() => {
    if (selectedPlatforms.length > 0 && accounts.length > 0) {
      const tiktokAccount = accounts.find((acc) =>
        selectedPlatforms.includes(acc.id),
      );
      if (tiktokAccount) {
        loadCreatorInfo(tiktokAccount.id);
      }
    }
  }, [selectedPlatforms, accounts, user]);

  useEffect(() => {
    if (!creatorInfo?.max_video_post_duration_sec || videoDuration == null) {
      setVideoDurationError(null);
      return;
    }

    if (videoDuration > creatorInfo.max_video_post_duration_sec) {
      const maxSeconds = creatorInfo.max_video_post_duration_sec;
      const minutes = Math.floor(maxSeconds / 60);
      const seconds = maxSeconds % 60;
      setVideoDurationError(
        `La vidéo dépasse la durée maximale autorisée (${minutes} min ${seconds}s). Merci de sélectionner une vidéo plus courte.`,
      );
    } else {
      setVideoDurationError(null);
    }
  }, [videoDuration, creatorInfo]);

  // Initialiser les dates par défaut
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(tomorrow.getHours() + 1, 0, 0, 0);

    setScheduleDate(tomorrow.toISOString().split("T")[0]);
    setScheduleTime(tomorrow.toTimeString().slice(0, 5));
  }, []);

  // Mémoriser l'URL de la vidéo
  const videoUrl = useMemo(() => {
    if (!videoFile) return null;

    if (uploadedVideoUrl) {
      return uploadedVideoUrl;
    }

    if (editingDraftData?.videoUrl) {
      return editingDraftData.videoUrl;
    }

    if (editingScheduleData?.videoUrl) {
      return editingScheduleData.videoUrl;
    }

    return URL.createObjectURL(videoFile);
  }, [videoFile, uploadedVideoUrl, editingDraftData, editingScheduleData]);

  // Nettoyer les URLs d'objet lors du démontage
  useEffect(() => {
    return () => {
      if (videoUrl && videoUrl.startsWith("blob:")) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [videoUrl]);

  // Charger les comptes connectés
  useEffect(() => {
    const fetchAccounts = async () => {
      if (!user?.uid) {
        console.log("🔍 No user available, skipping accounts fetch");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log("🔍 Starting accounts fetch...");

        const response = await fetch(`/api/accounts?userId=${user.uid}`);
        console.log("🔍 Fetch accounts response status:", response.status);
        console.log(
          "🔍 Response headers:",
          Object.fromEntries(response.headers.entries()),
        );

        if (response.ok) {
          const data = await response.json();
          console.log("🔍 Raw accounts data:", JSON.stringify(data, null, 2));
          console.log("🔍 Accounts array length:", data.accounts?.length || 0);
          console.log("🔍 Individual accounts:", data.accounts);

          setAccounts(data.accounts || []);

          const platformMap: { [key: string]: Platform } = {};

          (data.accounts || []).forEach(
            (account: TikTokAccount, index: number) => {
              console.log(`🔍 Processing account ${index}:`, {
                id: account.id,
                platform: account.platform,
                username: account.username,
                displayName: account.displayName,
                isActive: account.isActive,
              });

              if (account.platform === "tiktok") {
                console.log(
                  `🔍 Adding TikTok account to platform map:`,
                  account.id,
                );
                platformMap[account.id] = {
                  id: account.id,
                  name: "TikTok",
                  icon: "♪",
                  color: "bg-black",
                  connected: true,
                  username: account.displayName || account.username,
                  avatar: account.avatarUrl,
                  displayName: account.displayName,
                  accountId: account.id,
                };
              } else {
                console.log(
                  `🔍 Skipping non-TikTok account:`,
                  account.platform,
                );
              }
            },
          );

          console.log("🔍 Final platform map:", platformMap);
          console.log("🔍 Platform map keys:", Object.keys(platformMap));
          console.log("🔍 Platforms array:", Object.values(platformMap));

          const platformsArray = Object.values(platformMap);
          setPlatforms(platformsArray);
          console.log(
            "🔍 Set platforms state with:",
            platformsArray.length,
            "platforms",
          );

          const firstTikTokAccount = data.accounts?.find(
            (account: TikTokAccount) => account.platform === "tiktok",
          );
          if (firstTikTokAccount) {
            console.log("🔍 Setting selected platform:", firstTikTokAccount.id);
            setSelectedPlatforms([firstTikTokAccount.id]);
          } else {
            console.log("🔍 No TikTok accounts found in data");
            console.log(
              "🔍 Available platforms in data:",
              data.accounts?.map((a: any) => a.platform),
            );
          }
        } else {
          console.error("🔍 Response not ok:", response.status);
          const errorText = await response.text();
          console.error("🔍 Error response body:", errorText);
        }
      } catch (error) {
        console.error("🔍 Error during accounts fetch:", error);
        console.error(
          "🔍 Error stack:",
          error instanceof Error ? error.stack : "No stack",
        );
      } finally {
        setLoading(false);
        console.log("🔍 Accounts fetch completed");
      }
    };

    fetchAccounts();
  }, [user?.uid]);

  // Charger les données du draft à éditer
  useEffect(() => {
    const isEditMode = searchParams?.get("edit") === "true";
    const editType = searchParams?.get("type");

    if (isEditMode && editType === "draft") {
      try {
        const draftData = localStorage.getItem("editingDraft");
        if (draftData) {
          const draft = JSON.parse(draftData);

          setEditingDraftData(draft);
          setCaption(draft.caption || "");
          setSelectedPlatforms(draft.platforms || []);

          if (draft.thumbnailUrl) {
            setCoverFrames([draft.thumbnailUrl]);
            setSelectedCoverFrame(0);
          }

          if (draft.videoFile && draft.videoUrl) {
            const mockFile = new File([""], draft.videoFile, {
              type: "video/mp4",
              lastModified: Date.now(),
            });
            setVideoFile(mockFile);
          }

          localStorage.removeItem("editingDraft");
        }
      } catch (error) {
        console.error("Erreur lors du chargement du draft:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger le draft",
          variant: "destructive",
        });
      }
    }
  }, [searchParams, toast]);

  // Charger les données du schedule à éditer
  useEffect(() => {
    const isEditMode = searchParams?.get("edit") === "true";
    const editType = searchParams?.get("type");

    if (isEditMode && editType === "schedule") {
      try {
        const scheduleData = localStorage.getItem("editingSchedule");
        if (scheduleData) {
          const schedule = JSON.parse(scheduleData);

          setEditingScheduleData(schedule);
          setCaption(schedule.caption || "");
          setSelectedPlatforms(schedule.platforms || []);

          if (schedule.thumbnailUrl) {
            setCoverFrames([schedule.thumbnailUrl]);
            setSelectedCoverFrame(0);
          }

          if (schedule.videoUrl) {
            setUploadedVideoUrl(schedule.videoUrl);
            const mockFile = new File([""], "video.mp4", { type: "video/mp4" });
            Object.defineProperty(mockFile, "size", { value: 1000000 });
            setVideoFile(mockFile);
          }

          if (schedule.scheduledAt) {
            const scheduledDate = new Date(
              schedule.scheduledAt._seconds * 1000,
            );
            setScheduleDate(scheduledDate.toISOString().split("T")[0]);
            setScheduleTime(scheduledDate.toTimeString().slice(0, 5));
          }

          localStorage.removeItem("editingSchedule");
        }
      } catch (error) {
        console.error("Erreur lors du chargement du schedule:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger le schedule",
          variant: "destructive",
        });
      }
    }
  }, [searchParams, toast]);

  const handlePlatformSelect = (platformId: string) => {
    const platform = platforms.find((p) => p.id === platformId);
    if (!platform?.connected) return;

    setSelectedPlatforms((prev) =>
      prev.includes(platformId)
        ? prev.filter((id) => id !== platformId)
        : [...prev, platformId],
    );
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setVideoFile(file);
      setUploadedVideoUrl(null);
      setEditingDraftData(null);
      setEditingScheduleData(null);
      setCoverFrames([]);
      setSelectedCoverFrame(0);
      setVideoDuration(null);
      setVideoDurationError(null);

      setTimeout(() => generateCoverFrames(file), 100);
    }
  };

  const generateCoverFrames = async (file: File) => {
    if (isGeneratingFrames) return;

    setIsGeneratingFrames(true);
    setCoverFrames([]);
    setSelectedCoverFrame(0);

    try {
      const video = document.createElement("video");
      video.src = URL.createObjectURL(file);
      video.crossOrigin = "anonymous";
      video.muted = true;
      video.preload = "metadata";

      await new Promise<void>((resolve, reject) => {
        video.addEventListener(
          "loadedmetadata",
          () => {
            setVideoDuration(video.duration || 0);
            resolve();
          },
          { once: true },
        );

        video.addEventListener(
          "error",
          () => {
            reject(new Error("Erreur de chargement vidéo"));
          },
          { once: true },
        );

        setTimeout(() => reject(new Error("Timeout")), 10000);
      });

      const frameCount = 8;
      const frames: string[] = [];

      for (let i = 0; i < frameCount; i++) {
        const time = (video.duration / frameCount) * i;
        try {
          const frame = await generateFrameAtTime(video, time);
          frames.push(frame);
        } catch (error) {
          console.warn(`Erreur frame ${i}:`, error);
        }
      }

      const validFrames = frames.filter((f) => f);
      setCoverFrames(validFrames);

      URL.revokeObjectURL(video.src);
    } catch (error) {
      console.error("Erreur génération frames:", error);
      toast({
        title: "Erreur",
        description: "Impossible de générer les miniatures",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingFrames(false);
    }
  };

  const generateFrameAtTime = (
    video: HTMLVideoElement,
    time: number,
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const frameVideo = video.cloneNode() as HTMLVideoElement;
      frameVideo.currentTime = time;
      frameVideo.muted = true;

      const onSeeked = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = frameVideo.videoWidth || 640;
          canvas.height = frameVideo.videoHeight || 480;
          const ctx = canvas.getContext("2d");

          if (ctx) {
            ctx.drawImage(frameVideo, 0, 0, canvas.width, canvas.height);
            const frameDataUrl = canvas.toDataURL("image/jpeg", 0.8);
            resolve(frameDataUrl);
          } else {
            reject(new Error("Impossible de créer le contexte canvas"));
          }
        } catch (error) {
          reject(error);
        }
      };

      frameVideo.addEventListener("seeked", onSeeked, { once: true });
      frameVideo.addEventListener("error", reject, { once: true });

      setTimeout(() => reject(new Error("Timeout")), 5000);
    });
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith("video/")) {
      setVideoFile(file);
      setUploadedVideoUrl(null);
      setEditingDraftData(null);
      setEditingScheduleData(null);
      setVideoDuration(null);
      setVideoDurationError(null);
      generateCoverFrames(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleCoverFrameSelect = (frameIndex: number) => {
    if (frameIndex >= 0 && frameIndex < coverFrames.length) {
      setSelectedCoverFrame(frameIndex);
    }
  };

  const handleSetCover = () => {
    if (coverFrames.length > 0 && coverFrames[selectedCoverFrame]) {
      toast({
        title: "Couverture sélectionnée",
        description: `Frame ${selectedCoverFrame + 1} définie comme couverture`,
      });
      setShowCoverModal(false);
    }
  };

  const uploadVideoToStorage = async (file: File): Promise<string> => {
    try {
      const timestamp = Date.now();
      const fileName = `videos/${timestamp}_${file.name}`;

      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileName", fileName);

      const response = await fetch("/api/upload/sign", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'upload");
      }

      const result = await response.json();
      return result.downloadURL;
    } catch (error) {
      console.error("Erreur upload vidéo:", error);
      throw error;
    }
  };

  const uploadImageToStorage = async (
    imageDataUrl: string,
    fileName: string,
  ): Promise<string> => {
    try {
      if (imageDataUrl.includes("storage.googleapis.com")) {
        return imageDataUrl;
      }

      let blob: Blob;

      if (imageDataUrl.startsWith("data:")) {
        const response = await fetch(imageDataUrl);
        blob = await response.blob();
      } else if (imageDataUrl.startsWith("http")) {
        const response = await fetch(imageDataUrl);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        blob = await response.blob();
      } else {
        const base64Data = imageDataUrl.replace(
          /^data:image\/[a-z]+;base64,/,
          "",
        );
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        blob = new Blob([byteArray], { type: "image/jpeg" });
      }

      const file = new File([blob], fileName, { type: "image/jpeg" });

      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileName", fileName);

      const uploadResponse = await fetch("/api/upload/sign", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error("Erreur lors de l'upload de l'image");
      }

      const result = await uploadResponse.json();
      return result.downloadURL;
    } catch (error) {
      console.error("Erreur upload image:", error);
      throw error;
    }
  };

  const getVideoUrl = async (): Promise<string> => {
    if (uploadedVideoUrl) return uploadedVideoUrl;
    if (editingDraftData?.videoUrl) {
      return editingDraftData.videoUrl;
    }
    if (editingScheduleData?.videoUrl) return editingScheduleData.videoUrl;

    if (!videoFile) throw new Error("Aucune vidéo disponible");

    const url = await uploadVideoToStorage(videoFile);
    setUploadedVideoUrl(url);
    return url;
  };

  const getThumbnailUrl = async (): Promise<string> => {
    if (coverFrames.length > 0 && coverFrames[selectedCoverFrame]) {
      const timestamp = Date.now();
      const thumbnailFileName = `thumbnails/${timestamp}_thumbnail.jpg`;
      return await uploadImageToStorage(
        coverFrames[selectedCoverFrame],
        thumbnailFileName,
      );
    }
    if (editingScheduleData?.thumbnailUrl) {
      return editingScheduleData.thumbnailUrl;
    }
    return "";
  };

  const resetForm = () => {
    setVideoFile(null);
    setCaption("");
    setSelectedPlatforms(platforms.length > 0 ? [platforms[0].id] : []);
    setCoverFrames([]);
    setSelectedCoverFrame(0);
    setUploadedVideoUrl(null);
    setEditingDraftData(null);
    setEditingScheduleData(null);
    setUploadProgress(0);
    setVideoDuration(null);
    setVideoDurationError(null);
    resetTikTokSettings();
    setShowTikTokSettingsInline(false);
    setPrimaryActionProgress(0);

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(tomorrow.getHours() + 1, 0, 0, 0);
    setScheduleDate(tomorrow.toISOString().split("T")[0]);
    setScheduleTime(tomorrow.toTimeString().slice(0, 5));
  };

  const handlePublishNow = async () => {
    if (!user?.uid) {
      toast({
        variant: "destructive",
        title: "Erreur d'authentification",
        description: "Vous devez être connecté pour publier.",
      });
      return;
    }

    if (!ensureSubmissionPrerequisites("publish")) return;

    const tikTokAccountId = getSelectedTikTokAccountId();
    const orderedPlatforms = tikTokAccountId
      ? [
          tikTokAccountId,
          ...selectedPlatforms.filter((id) => id !== tikTokAccountId),
        ]
      : [...selectedPlatforms];

    const currentVideoFile = videoFile;
    if (!currentVideoFile) {
      return;
    }

    try {
      setIsPublishing(true);
      setPublishStatus({ history: [] });
      setPendingPublishId(null);
      toast({
        title: "Publication en cours",
        description: "Veuillez patienter...",
        duration: 0,
      });

      const videoUrl = await getVideoUrl();
      const thumbnailUrl = await getThumbnailUrl();

      const postData = {
        userId: user.uid,
        caption,
        videoFile: currentVideoFile.name,
        videoUrl,
        thumbnailUrl,
        platforms: orderedPlatforms,
        scheduledAt: new Date(),
        status: "pending",
        mediaType: "video",
        tiktokSettings: selectedPlatforms.some(
          (id) => accounts.find((acc) => acc.id === id)?.platform === "tiktok",
        )
          ? tiktokSettingsRef.current
          : undefined,
      };

      const response = await fetch("/api/publish/now", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData),
      });

      const result = await response.json();

      if (response.ok) {
        setPublishStatus((prev) => ({
          publishId: result.publishId,
          status: result.status,
          history: prev.history,
        }));
        if (result.message) {
          addStatusEntry(result.message, {
            publishId: result.publishId,
            status: result.status,
          });
        }
        if (result.publishId && tikTokAccountId) {
          setPendingPublishId(result.publishId);
          pollPublishStatus(result.publishId, tikTokAccountId);
        }
        if (result.inboxMode) {
          toast({
            title: "Vidéo envoyée dans TikTok !",
            description: result.instructions,
            duration: 8000,
          });

          setTimeout(() => {
            toast({
              title: "📱 Étapes suivantes",
              description:
                result.nextSteps?.join(" • ") ||
                "Ouvrez TikTok pour finaliser la publication",
              duration: 10000,
            });
          }, 2000);
        } else if (result.directPostSuccess) {
          toast({
            title: "🎉 Publication directe réussie !",
            description: `Vidéo publiée avec succès sur TikTok (${result.privacyLevel})`,
            duration: 6000,
          });
        } else {
          toast({
            title: "Publication en cours",
            description:
              result.message || "Votre vidéo est en cours de publication",
            duration: 5000,
          });
        }
        resetForm();
      } else {
        throw new Error(result.error || "Erreur de publication");
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description:
          error instanceof Error ? error.message : "Erreur de publication",
      });
      addStatusEntry(
        error instanceof Error
          ? `Erreur publication : ${error.message}`
          : "Erreur de publication inconnue",
      );
    } finally {
      setPrimaryActionProgress(100);
      setTimeout(() => setPrimaryActionProgress(0), 400);
      setIsPublishing(false);
    }
  };

  const handleSchedule = async () => {
    if (!user?.uid) {
      toast({
        variant: "destructive",
        title: "Erreur d'authentification",
        description:
          "Vous devez être connecté pour programmer une publication.",
      });
      return;
    }

    if (
      !ensureSubmissionPrerequisites(scheduleEnabled ? "schedule" : "publish")
    )
      return;

    const tikTokAccountId = getSelectedTikTokAccountId();
    const orderedPlatforms = tikTokAccountId
      ? [
          tikTokAccountId,
          ...selectedPlatforms.filter((id) => id !== tikTokAccountId),
        ]
      : [...selectedPlatforms];

    const currentVideoFile = videoFile;
    if (!currentVideoFile) {
      return;
    }

    try {
      setIsScheduling(true);
      if (!scheduleEnabled) {
        setPublishStatus({ history: [] });
      }
      toast({
        title: scheduleEnabled
          ? "Planification en cours"
          : "Publication en cours",
        description: "Veuillez patienter...",
        duration: 0,
      });

      const videoUrl = await getVideoUrl();
      const thumbnailUrl = await getThumbnailUrl();

      const scheduledDateTime = scheduleEnabled
        ? new Date(`${scheduleDate}T${scheduleTime}:00`)
        : new Date();

      const postData = {
        userId: user.uid,
        caption,
        videoFile: currentVideoFile.name,
        videoUrl,
        thumbnailUrl,
        platforms: orderedPlatforms,
        scheduledAt: scheduledDateTime,
        status: "scheduled",
        mediaType: "video",
        tiktokSettings: selectedPlatforms.some(
          (id) => accounts.find((acc) => acc.id === id)?.platform === "tiktok",
        )
          ? tiktokSettingsRef.current
          : undefined,
      };

      const isEditing = editingScheduleData?.id;
      const url = isEditing
        ? `/api/schedules?id=${editingScheduleData.id}`
        : "/api/schedules";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData),
      });

      const result = await response.json();

      if (response.ok) {
        const action = isEditing
          ? "modifié"
          : scheduleEnabled
            ? "programmé"
            : "publié";
        toast({
          title: `Post ${action} avec succès !`,
          description: scheduleEnabled
            ? `Programmé pour le ${scheduleDate} à ${scheduleTime}`
            : "Publication en cours",
        });
        resetForm();
      } else {
        throw new Error(result.error || "Erreur");
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description:
          error instanceof Error ? error.message : "Erreur de planification",
      });
    } finally {
      setPrimaryActionProgress(100);
      setTimeout(() => setPrimaryActionProgress(0), 400);
      setIsScheduling(false);
    }
  };

  const handleSaveToDrafts = async () => {
    if (!videoFile || selectedPlatforms.length === 0) {
      toast({
        variant: "destructive",
        title: "Champs manquants",
        description:
          "Veuillez sélectionner une vidéo et au moins une plateforme",
      });
      return;
    }

    if (isSavingDraft) return;

    setIsSavingDraft(true);
    setUploadProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => (prev >= 90 ? prev : prev + 10));
      }, 200);

      const videoUrl = await getVideoUrl();
      setUploadProgress(100);
      clearInterval(progressInterval);

      const thumbnailUrl = await getThumbnailUrl();

      const draftData = {
        userId: "FGcdXcRXVoVfsSwJIciurCeuCXz1",
        caption,
        videoFile: videoFile.name,
        videoUrl,
        platforms: selectedPlatforms,
        status: "draft",
        mediaType: "video",
        thumbnailUrl,
      };

      const response = await fetch("/api/drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draftData),
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Brouillon sauvegardé !",
          description: "Votre vidéo a été sauvegardée avec succès",
        });
        resetForm();
      } else {
        throw new Error(result.error || "Erreur de sauvegarde");
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description:
          error instanceof Error ? error.message : "Erreur de sauvegarde",
      });
    } finally {
      setIsSavingDraft(false);
      setUploadProgress(0);
    }
  };

  const primaryActionInFlight = isPublishing || isScheduling;
  useEffect(() => {
    if (!primaryActionInFlight) {
      return;
    }
    setPrimaryActionProgress((prev) => (prev < 10 ? 10 : prev));
    const intervalId = window.setInterval(() => {
      setPrimaryActionProgress((prev) => (prev >= 90 ? prev : prev + 5));
    }, 200);
    return () => window.clearInterval(intervalId);
  }, [primaryActionInFlight]);

  // REQUIRED BY TIKTOK: Generate compliance declaration text based on commercial content
  const getTikTokComplianceText = () => {
    const currentSettings = tiktokSettingsRef.current;
    const hasCommercialContent = currentSettings.commercialContent.enabled &&
      (currentSettings.commercialContent.yourBrand || currentSettings.commercialContent.brandedContent);

    if (!hasCommercialContent) {
      // No commercial content
      return "By posting, you agree to TikTok's Music Usage Confirmation";
    }

    const onlyYourBrand = currentSettings.commercialContent.yourBrand && !currentSettings.commercialContent.brandedContent;
    const onlyBrandedContent = !currentSettings.commercialContent.yourBrand && currentSettings.commercialContent.brandedContent;
    const both = currentSettings.commercialContent.yourBrand && currentSettings.commercialContent.brandedContent;

    if (onlyYourBrand) {
      return "By posting, you agree to TikTok's Music Usage Confirmation";
    } else if (onlyBrandedContent || both) {
      return "By posting, you agree to TikTok's Branded Content Policy and Music Usage Confirmation";
    }

    return "By posting, you agree to TikTok's Music Usage Confirmation";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modern Header with Sticky Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {editingScheduleData ? "Edit Schedule" : "Create Video Post"}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {editingScheduleData
                  ? "Modifiez votre planification"
                  : "Créez et planifiez vos vidéos"}
              </p>
              {creatorInfo?.nickname && (
                <p className="text-xs text-gray-500 mt-1">
                  Compte TikTok : @{creatorInfo.nickname}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleSaveToDrafts}
                disabled={
                  isSavingDraft || !videoFile || selectedPlatforms.length === 0
                }
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                {isSavingDraft ? "Saving..." : "Save Draft"}
              </button>
              <button
                onClick={scheduleEnabled ? handleSchedule : handlePublishNow}
                disabled={primaryActionDisabled}
                title={publishButtonTitle}
                className="relative flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {primaryActionProgress > 0 && (
                  <>
                    <span className="pointer-events-none absolute inset-0 rounded-lg bg-white/10" />
                    <span
                      className="pointer-events-none absolute bottom-0 left-0 h-1 rounded-b-lg bg-white/80 transition-[width] duration-150 ease-out"
                      style={{ width: `${primaryActionProgress}%` }}
                    />
                  </>
                )}
                <span className="relative z-10 flex items-center gap-2">
                  {scheduleEnabled ? (
                    <>
                      <Calendar className="w-4 h-4" />
                      {isScheduling ? "Scheduling..." : "Schedule"}
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      {isPublishing ? "Publishing..." : "Publish Now"}
                    </>
                  )}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Platform Selection */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                Select Platform
              </h3>
              {loading ? (
                <div className="text-center py-8">
                  <div className="inline-block w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                  <p className="text-sm text-gray-500 mt-3">
                    Loading accounts...
                  </p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {platforms.length === 0 && (
                    <div className="text-sm text-gray-500 p-4 border border-gray-200 rounded-lg bg-gray-50">
                      Aucun compte TikTok connecté. Allez sur{" "}
                      <a
                        href="/dashboard/accounts"
                        className="text-purple-600 hover:underline"
                      >
                        Comptes
                      </a>{" "}
                      pour connecter votre compte TikTok.
                    </div>
                  )}
                  {platforms.map((platform) => (
                    <button
                      key={platform.id}
                      onClick={() => handlePlatformSelect(platform.id)}
                      disabled={!platform.connected}
                      className={`relative group flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all duration-200 ${
                        selectedPlatforms.includes(platform.id)
                          ? "border-purple-500 bg-purple-50 shadow-sm scale-105"
                          : platform.connected
                            ? "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                            : "border-gray-100 opacity-50 cursor-not-allowed"
                      }`}
                    >
                      <PlatformIcon
                        platform={platform.name.toLowerCase()}
                        size="sm"
                        profileImageUrl={
                          platform.connected ? platform.avatar : undefined
                        }
                        username={
                          platform.connected ? platform.username : undefined
                        }
                        className="w-10 h-10 rounded-full"
                      />
                      <div className="text-left">
                        <div className="text-sm font-semibold text-gray-900">
                          {platform.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {platform.connected
                            ? platform.username
                            : "Not connected"}
                        </div>
                      </div>
                      {selectedPlatforms.includes(platform.id) && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center shadow-lg">
                          <svg
                            className="w-3 h-3 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Video Upload */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                Upload Video
              </h3>

              {!videoFile ? (
                <div
                  className={`relative border-2 border-dashed rounded-lg p-12 transition-all duration-300 cursor-pointer group ${
                    isDragging
                      ? "border-purple-500 bg-purple-50/50 scale-[0.99]"
                      : "border-gray-300 hover:border-purple-400 hover:bg-gray-50/50"
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                >
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-20 h-20 rounded-lg flex items-center justify-center mb-4 transition-all duration-300 ${
                        isDragging
                          ? "bg-purple-500 scale-110 shadow-lg shadow-purple-500/30"
                          : "bg-gradient-to-br from-purple-500 to-purple-600 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-purple-500/30"
                      }`}
                    >
                      <Upload className="w-10 h-10 text-white" />
                    </div>
                    <p className="text-lg font-semibold text-gray-900 mb-1">
                      {isDragging
                        ? "Drop your video here"
                        : "Click or drag to upload"}
                    </p>
                    <p className="text-sm text-gray-500">
                      MP4, MOV, or WebM • Max 500MB
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="relative group">
                  <div className="relative aspect-video bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg overflow-hidden shadow-lg">
                    {videoUrl && (
                      <video
                        src={videoUrl}
                        className="w-full h-full object-cover"
                        muted
                        playsInline
                        preload="metadata"
                      />
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Play className="w-8 h-8 text-white ml-1" />
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setVideoFile(null);
                        setVideoDuration(null);
                        setVideoDurationError(null);
                        setUploadedVideoUrl(null);
                        setCoverFrames([]);
                        setSelectedCoverFrame(0);
                      }}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center hover:bg-black/70 transition-all duration-200 opacity-0 group-hover:opacity-100"
                    >
                      <X className="w-5 h-5 text-white" />
                    </button>
                  </div>
                  <div className="mt-4 flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                        <Play className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {videoFile.name}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Ready to publish
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowCoverModal(true)}
                        disabled={
                          isGeneratingFrames || coverFrames.length === 0
                        }
                        className="px-4 py-2 text-xs font-medium text-purple-700 bg-purple-100 hover:bg-purple-200 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isGeneratingFrames ? "Generating..." : "Set Cover"}
                      </button>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 text-xs font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-all duration-200"
                      >
                        Change
                      </button>
                    </div>
                  </div>
                  {videoDurationError && (
                    <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                      {videoDurationError}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Caption & Hashtags */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                Caption & Hashtags
              </h3>

              <div className="relative">
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Write your caption here... (optional)"
                  className="w-full h-32 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 resize-none text-sm text-gray-900 placeholder:text-gray-400 transition-all duration-200 bg-white"
                  maxLength={2200}
                />
                <div className="absolute bottom-3 right-3">
                  <span className="text-xs text-gray-400 bg-white/90 px-2 py-1 rounded-md">
                    {caption.length}/2200
                  </span>
                </div>
              </div>

              {/* Hashtags */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-gray-900">
                    Hashtags
                  </h4>
                  <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full font-medium">
                    {selectedHashtags.length}/5
                  </span>
                </div>

                {selectedHashtags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {selectedHashtags.map((hashtag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-100 to-purple-50 text-purple-700 rounded-lg text-sm font-medium group hover:from-purple-200 hover:to-purple-100 transition-all duration-200 shadow-sm"
                      >
                        {hashtag}
                        <button
                          onClick={() => removeHashtag(hashtag)}
                          className="hover:bg-purple-300/50 rounded-full p-0.5 transition-colors duration-200"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <div className="relative hashtag-input">
                  <input
                    type="text"
                    value={hashtagInput}
                    onChange={(e) => setHashtagInput(e.target.value)}
                    onFocus={() => setShowHashtagSuggestions(true)}
                    onKeyPress={handleHashtagInputKeyPress}
                    placeholder="Add hashtag and press Enter..."
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-sm text-gray-900 placeholder:text-gray-400 transition-all duration-200 bg-white"
                  />

                  {showHashtagSuggestions && (
                    <div className="hashtag-suggestions absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-20 max-h-80 overflow-y-auto">
                      <div className="p-4">
                        <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                          Popular hashtags
                        </h5>
                        {Object.entries(popularHashtags).map(
                          ([category, hashtags]) => (
                            <div key={category} className="mb-4 last:mb-0">
                              <h6 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-purple-400"></div>
                                {category}
                              </h6>
                              <div className="flex flex-wrap gap-2">
                                {hashtags
                                  .filter(
                                    (hashtag) =>
                                      !selectedHashtags.includes(hashtag) &&
                                      hashtag
                                        .toLowerCase()
                                        .includes(hashtagInput.toLowerCase()),
                                  )
                                  .map((hashtag) => (
                                    <button
                                      key={hashtag}
                                      onClick={() => addHashtag(hashtag)}
                                      disabled={selectedHashtags.length >= 5}
                                      className="px-3 py-1.5 text-xs font-medium bg-gray-100 hover:bg-purple-100 text-gray-700 hover:text-purple-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                                    >
                                      {hashtag}
                                    </button>
                                  ))}
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Advanced Options */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                Advanced Options
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setShowAICaptionInline(!showAICaptionInline)}
                  className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50/50 transition-all duration-200 group"
                >
                  <Sparkles className="w-4 h-4 text-gray-600 group-hover:text-purple-600 transition-colors" />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-purple-700">
                    {showAICaptionInline ? "Masquer AI Caption" : "AI Caption"}
                  </span>
                </button>
                <button
                  onClick={() =>
                    setShowPastCaptionsInline(!showPastCaptionsInline)
                  }
                  className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50/50 transition-all duration-200 group"
                >
                  <History className="w-4 h-4 text-gray-600 group-hover:text-purple-600 transition-colors" />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-purple-700">
                    {showPastCaptionsInline
                      ? "Masquer Past Captions"
                      : "Past Captions"}
                  </span>
                </button>
                <button
                  onClick={() =>
                    setShowVideoProcessingInline(!showVideoProcessingInline)
                  }
                  className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50/50 transition-all duration-200 group"
                >
                  <Wand2 className="w-4 h-4 text-gray-600 group-hover:text-purple-600 transition-colors" />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-purple-700">
                    {showVideoProcessingInline
                      ? "Masquer Processing"
                      : "Processing"}
                  </span>
                </button>
                <button
                  onClick={async () => {
                    if (
                      !selectedPlatforms.some(
                        (id) =>
                          accounts.find((acc) => acc.id === id)?.platform ===
                          "tiktok",
                      )
                    ) {
                      toast({
                        title: "TikTok non sélectionné",
                        description:
                          "Sélectionnez d'abord un compte TikTok pour accéder à ces paramètres.",
                        variant: "destructive",
                      });
                      return;
                    }

                    // Toggle the settings display
                    const willShow = !showTikTokSettingsInline;
                    setShowTikTokSettingsInline(willShow);

                    // Force reload creator info when opening settings
                    if (willShow) {
                      const tikTokAccountId = getSelectedTikTokAccountId();
                      if (tikTokAccountId && !creatorInfo) {
                        await loadCreatorInfo(tikTokAccountId);
                      }
                    }
                  }}
                  className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50/50 transition-all duration-200 group"
                >
                  <Settings className="w-4 h-4 text-gray-600 group-hover:text-purple-600 transition-colors" />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-purple-700">
                    {showTikTokSettingsInline
                      ? "Masquer TikTok Config"
                      : "TikTok Config"}
                  </span>
                </button>
              </div>

              {/* AI Caption Settings */}
              {showAICaptionInline && (
                <div className="mt-6">
                  <div className="rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-slate-900">
                          AI Caption Generator
                        </h4>
                        <p className="text-xs text-slate-500 mt-1">
                          Generate engaging captions automatically using AI
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 space-y-3">
                      <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-xl hover:from-purple-700 hover:to-purple-600 transition-all duration-200">
                        <Sparkles className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          Generate AI Caption
                        </span>
                      </button>
                    </div>

                    <div className="mt-4 rounded-xl border border-purple-100 bg-purple-50 px-4 py-3">
                      <div className="flex items-start gap-2">
                        <Sparkles className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <h5 className="text-sm font-medium text-purple-900 mb-2">
                            AI Caption features:
                          </h5>
                          <ul className="text-xs text-purple-700 space-y-1">
                            <li>• Generate engaging and trending captions</li>
                            <li>• Analyze video content for context</li>
                            <li>• Add relevant hashtags automatically</li>
                            <li>• Optimize for each social platform</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Past Captions Settings */}
              {showPastCaptionsInline && (
                <div className="mt-6">
                  <div className="rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-slate-900">
                          Past Captions Library
                        </h4>
                        <p className="text-xs text-slate-500 mt-1">
                          Reuse and modify your previous successful captions
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2">
                      <div className="p-3 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 cursor-pointer">
                        <p className="text-sm text-slate-800 line-clamp-2">
                          "Just dropped the most amazing content! 🔥 Can't wait
                          for you all to see this..."
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          Used 3 days ago • 2.4k likes
                        </p>
                      </div>
                      <div className="p-3 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 cursor-pointer">
                        <p className="text-sm text-slate-800 line-clamp-2">
                          "Behind the scenes magic ✨ This is how we make it
                          happen..."
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          Used 1 week ago • 1.8k likes
                        </p>
                      </div>
                      <div className="p-3 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 cursor-pointer">
                        <p className="text-sm text-slate-800 line-clamp-2">
                          "Tutorial time! Follow along for the step-by-step
                          process 📚"
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          Used 2 weeks ago • 3.1k likes
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3">
                      <div className="flex items-start gap-2">
                        <History className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <h5 className="text-sm font-medium text-amber-900 mb-2">
                            Why reuse captions:
                          </h5>
                          <ul className="text-xs text-amber-700 space-y-1">
                            <li>• Save time with proven successful content</li>
                            <li>• Maintain consistent brand voice</li>
                            <li>• Learn from your best performing posts</li>
                            <li>
                              • Quickly adapt content for different platforms
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Video Processing Settings */}
              {showVideoProcessingInline && (
                <div className="mt-6">
                  <div className="rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-4 shadow-inner">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-slate-900">
                          Enable Video Processing
                        </h4>
                        <p className="text-xs text-slate-500 mt-1">
                          Videos will be processed for optimization and platform
                          compatibility
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          setVideoProcessingSettings((prev) => ({
                            ...prev,
                            enabled: !prev.enabled,
                          }))
                        }
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 ${
                          videoProcessingSettings.enabled
                            ? "bg-gradient-to-r from-green-600 to-green-500 shadow-md shadow-green-500/30"
                            : "bg-gray-300"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${
                            videoProcessingSettings.enabled
                              ? "translate-x-6"
                              : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>

                    <div className="mt-4 flex items-start gap-3">
                      <Checkbox
                        id="remember-processing-preference"
                        checked={videoProcessingSettings.rememberPreference}
                        onCheckedChange={(checked) =>
                          setVideoProcessingSettings((prev) => ({
                            ...prev,
                            rememberPreference: !!checked,
                          }))
                        }
                      />
                      <label
                        htmlFor="remember-processing-preference"
                        className="text-sm text-slate-700"
                      >
                        Remember this preference for future posts
                      </label>
                    </div>

                    <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
                      <div className="flex items-start gap-2">
                        <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <h5 className="text-sm font-medium text-blue-900 mb-2">
                            Why we process videos:
                          </h5>
                          <ul className="text-xs text-blue-700 space-y-1">
                            <li>
                              • Optimize file size and quality for faster
                              uploads
                            </li>
                            <li>
                              • Ensure compatibility across all social platforms
                            </li>
                            <li>
                              • Convert to formats required by specific
                              platforms
                            </li>
                            <li>• Generate thumbnails for video previews</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {showTikTokSettingsInline && (
                <div className="mt-6">
                  {/* Conditions d'affichage */}
                  {!selectedPlatforms.some(
                    (id) =>
                      accounts.find((acc) => acc.id === id)?.platform ===
                      "tiktok",
                  ) ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <p className="text-gray-600">
                        Sélectionnez un compte TikTok pour voir les paramètres
                      </p>
                    </div>
                  ) : !creatorInfo ? (
                    <div className="text-center py-8 bg-blue-50 rounded-lg">
                      <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                      <p className="text-blue-600">
                        Chargement des informations du créateur...
                      </p>
                    </div>
                  ) : (
                    <TikTokSettings
                      key={`${tiktokSettingsKey}-inline`}
                      creatorInfo={creatorInfo}
                      onSettingsChange={handleTikTokSettingsChange}
                      onValidationChange={setTikTokValidation}
                      initialSettings={tiktokInitialSettings}
                      postType="video"
                    />
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Schedule */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                  Schedule Post
                </h3>
                <button
                  onClick={() => setScheduleEnabled(!scheduleEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 ${
                    scheduleEnabled
                      ? "bg-gradient-to-r from-purple-600 to-purple-500 shadow-md shadow-purple-500/30"
                      : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${
                      scheduleEnabled ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {scheduleEnabled && (
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      <Calendar className="w-3.5 h-3.5 inline mr-1.5 mb-0.5" />
                      Date
                    </label>
                    <input
                      type="date"
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-sm text-gray-900 transition-all duration-200 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      <Clock className="w-3.5 h-3.5 inline mr-1.5 mb-0.5" />
                      Time
                    </label>
                    <input
                      type="time"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-sm text-gray-900 transition-all duration-200 bg-white"
                    />
                  </div>
                  <div className="flex items-start gap-2 p-3 bg-purple-50 rounded-lg border border-purple-100">
                    <Info className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-purple-700">
                      Your post will be published at {scheduleTime} (local time)
                    </p>
                  </div>
                </div>
              )}

              {/* REQUIRED BY TIKTOK: Music Usage Confirmation Declaration */}
              {selectedTikTokAccountId && (
                <div className="mb-6">
                  <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-blue-800 leading-relaxed">
                      <p>By posting, you agree to TikTok's{" "}
                        {tiktokSettingsRef.current.commercialContent.enabled &&
                         (tiktokSettingsRef.current.commercialContent.brandedContent ||
                          (tiktokSettingsRef.current.commercialContent.yourBrand && tiktokSettingsRef.current.commercialContent.brandedContent)) && (
                          <>
                            <a
                              href="https://www.tiktok.com/legal/page/row/bc-policy/en"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline hover:text-blue-900 font-medium"
                            >
                              Branded Content Policy
                            </a>
                            {" "}and{" "}
                          </>
                        )}
                        <a
                          href="https://www.tiktok.com/legal/page/row/music-usage-confirmation/en"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline hover:text-blue-900 font-medium"
                        >
                          Music Usage Confirmation
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Media Preview */}
              {videoFile && videoUrl && (
                <div className="mb-6">
                  <h4 className="text-xs font-medium text-gray-700 mb-3">
                    Preview
                  </h4>
                  <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg aspect-[9/16] max-w-[200px] mx-auto overflow-hidden shadow-lg group">
                    <video
                      src={videoUrl}
                      className="w-full h-full object-cover cursor-pointer"
                      muted
                      playsInline
                      controls
                      preload="metadata"
                      onClick={(e) => {
                        const video = e.target as HTMLVideoElement;
                        if (video.paused) {
                          video.play();
                        } else {
                          video.pause();
                        }
                      }}
                    />
                  </div>
                </div>
              )}

              {isSavingDraft && uploadProgress > 0 && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-700">
                      Uploading...
                    </span>
                    <span className="text-xs font-medium text-purple-600">
                      {uploadProgress}%
                    </span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                TikTok Publish Status
              </h3>
              <p className="text-xs text-gray-500 mb-4">
                La mise en ligne peut prendre quelques minutes après avoir
                cliqué sur Publish. Surveillez l’évolution ci-dessous.
              </p>
              {publishStatus.publishId && (
                <div className="mb-3 text-xs text-gray-500">
                  ID TikTok :{" "}
                  <span className="font-mono">{publishStatus.publishId}</span>
                </div>
              )}
              {publishStatus.status && (
                <p className="text-xs text-gray-600 mb-3">
                  Statut actuel :{" "}
                  <span className="font-semibold">{publishStatus.status}</span>
                </p>
              )}
              <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                {publishStatus.history.length === 0 ? (
                  <p className="text-xs text-gray-400">
                    Lancez une publication pour voir le suivi temps réel.
                  </p>
                ) : (
                  publishStatus.history.map((entry, index) => (
                    <div
                      key={`${entry.timestamp}-${index}`}
                      className="rounded-lg border border-gray-100 bg-gray-50 p-3"
                    >
                      <p className="text-[11px] text-gray-400">
                        {new Date(entry.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </p>
                      <p className="text-sm text-gray-700">{entry.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cover Frame Selection Modal */}
      {showCoverModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 w-full max-w-6xl h-[85vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
              <h2 className="text-lg font-bold text-gray-900">
                Select Cover Frame
              </h2>
              <button
                onClick={() => setShowCoverModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors duration-200"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            <div className="mb-4 flex-shrink-0">
              {/* Cover Preview */}
              <div className="text-center">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Cover Preview
                </h3>
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg aspect-[9/16] flex items-center justify-center max-w-[250px] mx-auto shadow-xl">
                  {coverFrames.length > 0 ? (
                    <img
                      src={coverFrames[selectedCoverFrame]}
                      alt="Selected cover frame"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="text-white text-center p-3">
                      <div className="animate-spin rounded-full h-6 w-6 border-4 border-white/20 border-t-white mx-auto mb-2"></div>
                      <p className="text-xs">Generating frames...</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Frame Timeline Grid */}
            {coverFrames.length > 0 && (
              <div className="flex-1 flex flex-col min-h-0">
                <div className="flex items-center gap-2 mb-3 flex-shrink-0">
                  <Info className="h-4 w-4 text-purple-600" />
                  <p className="text-sm text-gray-600">
                    Select a frame from the video timeline
                  </p>
                </div>

                {/* Frame thumbnails grid */}
                <div className="grid grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-2 p-3 bg-gray-50 rounded-lg flex-1 overflow-y-auto">
                  {coverFrames.map((frame, index) => (
                    <div
                      key={index}
                      onClick={() => handleCoverFrameSelect(index)}
                      className={`relative aspect-[9/16] rounded-md overflow-hidden cursor-pointer transition-all duration-200 ${
                        selectedCoverFrame === index
                          ? "ring-2 ring-purple-500 scale-105 shadow-md"
                          : "ring-1 ring-gray-200 hover:ring-2 hover:ring-purple-300 hover:scale-102"
                      }`}
                    >
                      <img
                        src={frame}
                        alt={`Frame ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {/* Frame number overlay */}
                      <div className="absolute bottom-0.5 left-0.5 bg-black/70 text-white text-xs px-1 py-0.5 rounded text-[10px]">
                        {index + 1}
                      </div>
                      {/* Selected indicator */}
                      {selectedCoverFrame === index && (
                        <div className="absolute inset-0 bg-purple-500/20 flex items-center justify-center">
                          <div className="w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center">
                            <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Timeline indicator */}
                <div className="mt-2 flex items-center justify-between text-xs text-gray-500 flex-shrink-0">
                  <span>Start</span>
                  <span>
                    Frame {selectedCoverFrame + 1} of {coverFrames.length}
                  </span>
                  <span>End</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-3 border-t border-gray-200 flex-shrink-0">
              <button
                onClick={() => setShowCoverModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSetCover}
                disabled={coverFrames.length === 0}
                className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-purple-500 text-white text-sm font-semibold rounded-lg hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Set as Cover
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CreateVideoPostPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4"></div>
            <p className="text-sm text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <CreateVideoPostPageContent />
    </Suspense>
  );
}
