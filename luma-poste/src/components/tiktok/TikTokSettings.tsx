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
  privacyLevel: "PUBLIC_TO_EVERYONE",
  allowComments: true,
  allowDuet: true,
  allowStitch: true,
  commercialContent: {
    enabled: true,
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
    // Enable interactions by default
    allowComments: true,
    allowDuet: true,
    allowStitch: true,
  });
  const consentAccepted = true; // Always accepted since consent section is removed
  const initialSettingsSnapshot = useRef<string | null>(null);

  const creatorCanPost = true; // Always allow posting
  const commercialSelectionValid = true; // Always valid since switches can be on/off independently

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
        // Enable interactions by default
        allowComments: true,
        allowDuet: true,
        allowStitch: true,
        privacyLevel: "PUBLIC_TO_EVERYONE",
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
    setSettings((prev) => {
      const next: TikTokPostSettings = {
        ...prev,
        allowComments: creatorInfo.comment_disabled ? false : true,
        allowDuet: creatorInfo.duet_disabled ? false : true,
        allowStitch: creatorInfo.stitch_disabled ? false : true,
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
              value={settings.privacyLevel ?? "PUBLIC_TO_EVERYONE"}
              onValueChange={handlePrivacyChange}
            >
              <SelectTrigger className="mt-3 h-11 rounded-xl border border-slate-200 bg-white text-sm max-w-xs">
                <SelectValue placeholder="Public" />
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
              Activez les interactions souhaitées (tout est coché par défaut).
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

          {/* Section Branded Content - Layout horizontal */}
          <section className="rounded-2xl border border-slate-100 bg-white px-4 py-4 space-y-4">
            <div>
              <Label className="text-sm font-medium text-slate-900 mb-3 block">
                Disclose Branded Content
              </Label>
              <p className="text-xs text-slate-500 mb-4">
                Indique si ce contenu est un partenariat rémunéré.
              </p>

              {/* Layout horizontal pour les deux options */}
              <div className="grid gap-3 sm:grid-cols-2">
                {/* Your Brand */}
                <div className="flex items-center justify-between p-3 rounded-xl border-2 border-slate-200 bg-white">
                  <div>
                    <Label
                      htmlFor="commercial-your-brand"
                      className="text-sm font-medium text-slate-900"
                    >
                      Promote Your Own Brand
                    </Label>
                    <p className="text-xs text-slate-500">
                      Labeled as 'Promotional content'
                    </p>
                  </div>
                  <Switch
                    id="commercial-your-brand"
                    checked={settings.commercialContent.yourBrand}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange("yourBrand", !!checked)
                    }
                  />
                </div>

                {/* Branded Content */}
                <div className="flex items-center justify-between p-3 rounded-xl border-2 border-slate-200 bg-white">
                  <div>
                    <Label
                      htmlFor="commercial-branded-content"
                      className="text-sm font-medium text-slate-900"
                    >
                      Disclose Branded Content
                    </Label>
                    <p className="text-xs text-slate-500">
                      Labeled as 'Paid partnership'
                    </p>
                  </div>
                  <Switch
                    id="commercial-branded-content"
                    checked={settings.commercialContent.brandedContent}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange("brandedContent", !!checked)
                    }
                  />
                </div>
              </div>

              {/* Messages de validation */}
              <div className="mt-4 space-y-2">
                {settings.commercialContent.yourBrand &&
                  settings.commercialContent.brandedContent && (
                    <p className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
                      Your photo/video will be labeled as 'Paid partnership'
                    </p>
                  )}
              </div>
            </div>
          </section>
        </div>
      </CardContent>
    </Card>
  );
}
