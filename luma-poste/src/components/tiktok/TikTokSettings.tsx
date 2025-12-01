"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Info } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export interface TikTokPostSettings {
  privacyLevel: string | null;
  allowComments: boolean;
  allowDuet: boolean;
  allowStitch: boolean;
  commercialContent: {
    enabled: boolean;
    yourBrand: boolean;
    brandedContent: boolean;
  };
}

export interface TikTokSettingsValidation {
  privacySelected: boolean;
  consentAccepted: boolean;
  commercialSelectionValid: boolean;
  creatorCanPost: boolean;
  brandedContentPrivacyValid: boolean;
}

interface CreatorInfo {
  nickname: string;
  privacy_level_options: string[];
  max_video_post_duration_sec: number;
  can_post: boolean;
  max_posts_reached: boolean;
  duet_disabled: boolean;
  stitch_disabled: boolean;
  comment_disabled: boolean;
}

interface TikTokSettingsProps {
  creatorInfo: CreatorInfo | null;
  onSettingsChange: (settings: TikTokPostSettings) => void;
  onValidationChange?: (validation: TikTokSettingsValidation) => void;
  initialSettings?: Partial<TikTokPostSettings>;
  postType?: "video" | "photo";
}

const DEFAULT_SETTINGS: TikTokPostSettings = {
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

export default function TikTokSettings({
  creatorInfo,
  onSettingsChange,
  onValidationChange,
  initialSettings,
  postType = "video",
}: TikTokSettingsProps) {
  const [settings, setSettings] = useState<TikTokPostSettings>({
    ...DEFAULT_SETTINGS,
    ...initialSettings,
  });
  const consentAccepted = true; // Always accepted since consent section is removed
  const initialSettingsSnapshot = useRef<string | null>(null);

  const creatorCanPost = true; // Always allow posting

  // REQUIRED: If commercial content toggle is ON, at least one option must be selected
  const commercialSelectionValid = useMemo(() => {
    if (!settings.commercialContent.enabled) return true;
    return settings.commercialContent.yourBrand || settings.commercialContent.brandedContent;
  }, [settings.commercialContent.enabled, settings.commercialContent.yourBrand, settings.commercialContent.brandedContent]);

  const brandedContentPrivacyValid = useMemo(() => {
    if (!settings.commercialContent.brandedContent) return true;
    return settings.privacyLevel !== "SELF_ONLY";
  }, [settings.commercialContent.brandedContent, settings.privacyLevel]);

  const latestSettingsRef = useRef(settings);
  const latestValidationRef = useRef<TikTokSettingsValidation | null>(null);

  const effectiveCanPost = true; // Always allow posting

  useEffect(() => {
    latestSettingsRef.current = settings;
    onSettingsChange(settings);
  }, [settings, onSettingsChange]);

  useEffect(() => {
    const validation: TikTokSettingsValidation = {
      privacySelected: !!settings.privacyLevel,
      consentAccepted: true, // Always true since consent section is removed
      commercialSelectionValid,
      creatorCanPost: true, // Always allow posting
      brandedContentPrivacyValid,
    };
    latestValidationRef.current = validation;
    onValidationChange?.(validation);
  }, [
    commercialSelectionValid,
    effectiveCanPost,
    onValidationChange,
    settings.privacyLevel,
    brandedContentPrivacyValid,
  ]);

  const applyInitialSettings = useCallback(
    (override?: Partial<TikTokPostSettings>) => {
      const merged: TikTokPostSettings = {
        ...DEFAULT_SETTINGS,
        ...(initialSettings ?? {}),
        ...(override ?? {}),
      };
      setSettings(merged);
      initialSettingsSnapshot.current = JSON.stringify(initialSettings ?? {});
    },
    [initialSettings],
  );

  useEffect(() => {
    if (!creatorInfo) return;
    applyInitialSettings();
  }, [creatorInfo?.nickname, applyInitialSettings]);

  useEffect(() => {
    const initialJson = JSON.stringify(initialSettings ?? {});
    if (initialSettingsSnapshot.current === initialJson) {
      return;
    }
    const currentJson = JSON.stringify(latestSettingsRef.current ?? {});
    if (currentJson === initialJson) {
      initialSettingsSnapshot.current = initialJson;
      return;
    }
    applyInitialSettings();
  }, [initialSettings, applyInitialSettings]);

  useEffect(() => {
    if (!creatorInfo) return;
    // If interactions are disabled in TikTok app settings, force them to false
    setSettings((prev) => {
      const next: TikTokPostSettings = {
        ...prev,
        allowComments: creatorInfo.comment_disabled ? false : prev.allowComments,
        allowDuet: creatorInfo.duet_disabled ? false : prev.allowDuet,
        allowStitch: creatorInfo.stitch_disabled ? false : prev.allowStitch,
      };
      if (
        next.allowComments === prev.allowComments &&
        next.allowDuet === prev.allowDuet &&
        next.allowStitch === prev.allowStitch
      ) {
        return prev;
      }
      return next;
    });
  }, [
    creatorInfo?.comment_disabled,
    creatorInfo?.duet_disabled,
    creatorInfo?.stitch_disabled,
  ]);

  const handlePrivacyChange = (value: string) => {
    setSettings((prev) => ({
      ...prev,
      privacyLevel: value,
      commercialContent: {
        ...prev.commercialContent,
        brandedContent:
          value === "SELF_ONLY" ? false : prev.commercialContent.brandedContent,
      },
    }));
  };

  const handleCheckboxChange = (
    type: "yourBrand" | "brandedContent",
    checked: boolean,
  ) => {
    setSettings((prev) => ({
      ...prev,
      commercialContent: {
        ...prev.commercialContent,
        [type]: checked,
      },
    }));
  };

  const allowDuetVisible = postType === "video";
  const allowStitchVisible = postType === "video";

  if (!creatorInfo) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-gray-500">
            <Info className="h-4 w-4" />
            <span>Chargement des informations du créateur...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const avatarLetter = creatorInfo.nickname?.[0]?.toUpperCase() ?? "T";

  return (
    <Card className="rounded-[28px] border border-slate-200 bg-white">
      <CardHeader className="border-b border-slate-100 pb-4">
        <p className="mt-1 text-xs font-medium text-slate-400">
          Durée vidéo maximale :{" "}
          {Math.floor(creatorInfo.max_video_post_duration_sec / 60)} min{" "}
          {creatorInfo.max_video_post_duration_sec % 60}s
        </p>
      </CardHeader>
      <CardContent className="p-6 space-y-5">
        <div className="space-y-6">
          {/* Section Privacy - Pleine largeur */}
          <section className="rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-slate-900">
                Who can view this video
              </Label>
            </div>
            <Select
              value={settings.privacyLevel || ""}
              onValueChange={handlePrivacyChange}
            >
              <SelectTrigger className="mt-3 h-11 rounded-xl border border-slate-200 bg-white text-sm max-w-xs">
                <SelectValue placeholder="Select privacy level">
                  {settings.privacyLevel ? (
                    settings.privacyLevel === "PUBLIC_TO_EVERYONE" ? "Public" :
                    settings.privacyLevel === "SELF_ONLY" ? "Private (Only me)" :
                    settings.privacyLevel === "MUTUAL_FOLLOW_FRIENDS" ? "Friends" :
                    settings.privacyLevel
                  ) : "Select privacy level"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="rounded-xl border border-slate-100 bg-white">
                {!creatorInfo?.privacy_level_options && (
                  <div className="p-2 text-sm text-gray-500">
                    Loading privacy options...
                  </div>
                )}
                {creatorInfo?.privacy_level_options?.length === 0 && (
                  <div className="p-2 text-sm text-red-500">
                    No privacy options available
                  </div>
                )}
                {/* Always include PUBLIC_TO_EVERYONE as first option */}
                <SelectItem
                  key="PUBLIC_TO_EVERYONE"
                  value="PUBLIC_TO_EVERYONE"
                  disabled={false}
                >
                  Public{" "}
                  {!creatorInfo?.privacy_level_options?.includes(
                    "PUBLIC_TO_EVERYONE",
                  ) && "(Not available for this account)"}
                </SelectItem>
                {creatorInfo?.privacy_level_options
                  ?.filter((option) => option !== "PUBLIC_TO_EVERYONE")
                  .map((option) => {
                    const getDisplayName = (value: string) => {
                      switch (value) {
                        case "PUBLIC_TO_EVERYONE":
                          return "Public";
                        case "SELF_ONLY":
                          return "Private (Only me)";
                        default:
                          return value;
                      }
                    };

                    return (
                      <SelectItem
                        key={option}
                        value={option}
                        disabled={
                          option === "SELF_ONLY" &&
                          settings.commercialContent.brandedContent
                        }
                      >
                        {getDisplayName(option)}
                      </SelectItem>
                    );
                  })}
              </SelectContent>
            </Select>
            {!creatorInfo?.privacy_level_options?.includes(
              "PUBLIC_TO_EVERYONE",
            ) &&
              settings.privacyLevel === "PUBLIC_TO_EVERYONE" && (
                <p className="mt-2 rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-xs text-amber-600">
                  ⚠️ Public posting is not available for this TikTok account.
                  The post will be published with available privacy settings.
                </p>
              )}
            {settings.commercialContent.brandedContent &&
              settings.privacyLevel === "SELF_ONLY" && (
                <p className="mt-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-600">
                  Branded content ne peut pas être défini en "only me".
                </p>
              )}
          </section>

          {/* Section Interactions - Horizontal */}
          <section className="rounded-2xl border border-slate-100 bg-white px-4 py-4">
            <Label className="text-sm font-medium text-slate-900">
              Allow users to
            </Label>
            <p className="mt-1 text-xs text-slate-500">
              Manually enable the interactions you want to allow (all are unchecked by default).
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <Checkbox
                  id="allow-comments"
                  checked={
                    settings.allowComments && !creatorInfo.comment_disabled
                  }
                  onCheckedChange={(checked) =>
                    setSettings((prev) => ({
                      ...prev,
                      allowComments: !!checked,
                    }))
                  }
                  disabled={creatorInfo.comment_disabled}
                />
                <div>
                  <Label
                    htmlFor="allow-comments"
                    className="text-sm font-medium text-slate-900"
                  >
                    Comment
                  </Label>
                  <p className="text-xs text-slate-500">
                    Autorisez les utilisateurs à commenter votre vidéo.
                  </p>
                  {creatorInfo.comment_disabled && (
                    <p className="text-xs text-slate-400">
                      Désactivé côté TikTok.
                    </p>
                  )}
                </div>
              </div>

              {allowDuetVisible && (
                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <Checkbox
                    id="allow-duet"
                    checked={settings.allowDuet && !creatorInfo.duet_disabled}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({
                        ...prev,
                        allowDuet: !!checked,
                      }))
                    }
                    disabled={creatorInfo.duet_disabled}
                  />
                  <div>
                    <Label
                      htmlFor="allow-duet"
                      className="text-sm font-medium text-slate-900"
                    >
                      Duet
                    </Label>
                    <p className="text-xs text-slate-500">
                      Permettez aux créateurs de faire un Duet avec votre vidéo.
                    </p>
                    {creatorInfo.duet_disabled && (
                      <p className="text-xs text-slate-400">
                        Désactivé côté TikTok.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {allowStitchVisible && (
                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <Checkbox
                    id="allow-stitch"
                    checked={
                      settings.allowStitch && !creatorInfo.stitch_disabled
                    }
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({
                        ...prev,
                        allowStitch: !!checked,
                      }))
                    }
                    disabled={creatorInfo.stitch_disabled}
                  />
                  <div>
                    <Label
                      htmlFor="allow-stitch"
                      className="text-sm font-medium text-slate-900"
                    >
                      Stitch
                    </Label>
                    <p className="text-xs text-slate-500">
                      Autorisez les stitches avec votre vidéo.
                    </p>
                    {creatorInfo.stitch_disabled && (
                      <p className="text-xs text-slate-400">
                        Désactivé côté TikTok.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Section Disclose Video Content - REQUIRED BY TIKTOK */}
          <section className="rounded-2xl border border-slate-100 bg-white px-4 py-4 space-y-4">
            <div>
              {/* Main Toggle - OFF by default (REQUIRED) */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <Label className="text-sm font-medium text-slate-900">
                    Disclose video content
                  </Label>
                  <p className="text-xs text-slate-500 mt-1">
                    Turn on to disclose that this video promotes goods or services in exchange for something of value. Your video could promote yourself, a third party, or both.
                  </p>
                </div>
                <Switch
                  id="commercial-content-toggle"
                  checked={settings.commercialContent.enabled}
                  onCheckedChange={(checked) =>
                    setSettings((prev) => ({
                      ...prev,
                      commercialContent: {
                        ...prev.commercialContent,
                        enabled: !!checked,
                        // Reset selections when toggling off
                        yourBrand: !!checked && prev.commercialContent.yourBrand,
                        brandedContent: !!checked && prev.commercialContent.brandedContent,
                      },
                    }))
                  }
                />
              </div>

              {/* Checkboxes - Only shown when toggle is ON */}
              {settings.commercialContent.enabled && (
                <div className="space-y-3">
                  <div className="pl-4 border-l-2 border-blue-200 space-y-3">
                    {/* Your Brand Checkbox */}
                    <div className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50">
                      <Checkbox
                        id="commercial-your-brand"
                        checked={settings.commercialContent.yourBrand}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange("yourBrand", !!checked)
                        }
                      />
                      <div className="flex-1">
                        <Label
                          htmlFor="commercial-your-brand"
                          className="text-sm font-medium text-slate-900 cursor-pointer"
                        >
                          Your brand
                        </Label>
                        <p className="text-xs text-slate-500 mt-0.5">
                          You are promoting yourself or your own business. This video will be classified as Brand Organic.
                        </p>
                      </div>
                    </div>

                    {/* Branded Content Checkbox */}
                    <div className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50">
                      <Checkbox
                        id="commercial-branded-content"
                        checked={settings.commercialContent.brandedContent}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange("brandedContent", !!checked)
                        }
                        disabled={settings.privacyLevel === "SELF_ONLY"}
                      />
                      <div className="flex-1">
                        <Label
                          htmlFor="commercial-branded-content"
                          className={`text-sm font-medium cursor-pointer ${
                            settings.privacyLevel === "SELF_ONLY"
                              ? "text-slate-400"
                              : "text-slate-900"
                          }`}
                        >
                          Branded content
                        </Label>
                        <p className={`text-xs mt-0.5 ${
                          settings.privacyLevel === "SELF_ONLY"
                            ? "text-slate-400"
                            : "text-slate-500"
                        }`}>
                          You are promoting another brand or a third party. This video will be classified as Branded Content.
                        </p>
                        {settings.privacyLevel === "SELF_ONLY" && (
                          <p className="text-xs text-amber-600 mt-1">
                            Branded content visibility cannot be set to private.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Validation Warning - REQUIRED */}
                  {!commercialSelectionValid && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
                      <p className="text-xs text-amber-800 font-medium">
                        ⚠️ You need to indicate if your content promotes yourself, a third party, or both.
                      </p>
                    </div>
                  )}

                  {/* Status Messages - REQUIRED BY TIKTOK */}
                  {settings.commercialContent.yourBrand && !settings.commercialContent.brandedContent && (
                    <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2">
                      <p className="text-xs text-blue-800">
                        ℹ️ Your {postType === 'photo' ? 'photo' : 'video'} will be labeled "Promotional content"
                      </p>
                    </div>
                  )}
                  {!settings.commercialContent.yourBrand && settings.commercialContent.brandedContent && (
                    <div className="rounded-lg border border-purple-200 bg-purple-50 px-3 py-2">
                      <p className="text-xs text-purple-800">
                        ℹ️ Your {postType === 'photo' ? 'photo' : 'video'} will be labeled "Paid partnership"
                      </p>
                    </div>
                  )}
                  {settings.commercialContent.yourBrand && settings.commercialContent.brandedContent && (
                    <div className="rounded-lg border border-purple-200 bg-purple-50 px-3 py-2">
                      <p className="text-xs text-purple-800">
                        ℹ️ Your {postType === 'photo' ? 'photo' : 'video'} will be labeled "Paid partnership"
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        </div>
      </CardContent>
    </Card>
  );
}
