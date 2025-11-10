export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  createdAt: Date;
}

export interface TikTokIdea {
  id: string;
  userId: string;
  title: string;
  description: string;
  hook: string;
  script: string;
  tags: string[];
  niche: string;
  targetAudience: string;
  createdAt: Date;
  isFavorite: boolean;
}

export interface TikTokProfile {
  username: string;
  followers: number;
  following: number;
  likes: number;
  videos: number;
  bio: string;
}

export interface AnalyticsInsight {
  type: "strength" | "opportunity" | "warning";
  title: string;
  description: string;
  icon: string;
}

export interface GenerateIdeaRequest {
  niche: string;
  targetAudience: string;
  contentType?: string;
  tone?: string;
}

export interface GenerateIdeaResponse {
  ideas: Array<{
    title: string;
    description: string;
    hook: string;
    script: string;
    tags: string[];
  }>;
}
