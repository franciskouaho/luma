import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "./firebase";

// Types pour Firestore
export interface Video {
  id: string;
  userId: string;
  workspaceId?: string;
  title: string;
  storageKey: string;
  thumbnailKey?: string;
  duration: number;
  size: number;
  status: "uploaded" | "processing" | "ready" | "error" | "failed";
  createdAt: FieldValue;
  updatedAt: FieldValue;
}

export interface Schedule {
  id: string;
  userId: string;
  workspaceId?: string;
  videoId?: string;
  accountId?: string;
  title?: string;
  description?: string;
  hashtags?: string[];
  caption?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  platforms?: string[];
  mediaType?: string;
  scheduledAt: FieldValue;
  status: "scheduled" | "queued" | "published" | "failed" | "draft";
  lastError?: string;
  tiktokUrl?: string;
  publishId?: string; // ID de publication TikTok
  views?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  createdAt: FieldValue;
  updatedAt: FieldValue;
}

export interface TikTokAccount {
  id: string;
  userId: string;
  workspaceId?: string;
  platform: "tiktok";
  tiktokUserId: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  accessTokenEnc: string;
  refreshTokenEnc: string;
  expiresAt: FieldValue;
  isActive: boolean;
  scopes?: string[]; // Scopes autorisés pour ce compte
  createdAt: FieldValue;
  updatedAt: FieldValue;
}

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  createdAt: FieldValue;
  updatedAt: FieldValue;
  settings: {
    allowMemberInvites: boolean;
    requireApprovalForPosts: boolean;
    allowMemberAccountConnections: boolean;
  };
}

export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  userId: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: "owner" | "admin" | "editor" | "viewer";
  status: "active" | "pending" | "suspended";
  invitedBy: string;
  joinedAt?: FieldValue;
  createdAt: FieldValue;
  updatedAt: FieldValue;
}

export interface WorkspaceInvitation {
  id: string;
  workspaceId: string;
  email: string;
  invitedBy: string;
  role: "admin" | "editor" | "viewer";
  status: "pending" | "accepted" | "declined" | "expired";
  token: string;
  expiresAt: FieldValue;
  createdAt: FieldValue;
  updatedAt: FieldValue;
}

export interface UserSettings {
  id: string;
  userId: string;
  profile: {
    name: string;
    email: string;
    timezone: string;
    language: string;
  };
  notifications: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    publishSuccess: boolean;
    publishFailure: boolean;
    weeklyReport: boolean;
    newFollower: boolean;
  };
  privacy: {
    dataRetention: string;
    analyticsSharing: boolean;
    profileVisibility: string;
  };
  integrations: {
    autoSync: boolean;
    backupEnabled: boolean;
    apiAccess: boolean;
  };
  apiKey?: string;
  deleted?: boolean;
  deletedAt?: FieldValue;
  createdAt: FieldValue;
  updatedAt: FieldValue;
}

// Service pour les vidéos
export class VideoService {
  private collection = "videos";

  async create(
    video: Omit<Video, "id" | "createdAt" | "updatedAt">,
  ): Promise<string> {
    const now = FieldValue.serverTimestamp();
    const docRef = await adminDb.collection(this.collection).add({
      ...video,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  }

  async getById(id: string): Promise<Video | null> {
    const docRef = adminDb.collection(this.collection).doc(id);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      return { id: docSnap.id, ...docSnap.data() } as Video;
    }
    return null;
  }

  async getByUserId(
    userId: string,
    limitCount = 10,
    lastDoc?: Record<string, unknown>,
  ): Promise<Video[]> {
    let q = adminDb
      .collection(this.collection)
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .limit(limitCount);

    if (lastDoc) {
      q = q.startAfter(lastDoc);
    }

    const querySnapshot = await q.get();
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Video[];
  }

  async update(id: string, updates: Partial<Video>): Promise<void> {
    const docRef = adminDb.collection(this.collection).doc(id);
    await docRef.update({
      ...updates,
      updatedAt: FieldValue.serverTimestamp(),
    });
  }

  async delete(id: string): Promise<void> {
    const docRef = adminDb.collection(this.collection).doc(id);
    await docRef.delete();
  }
}

// Service pour les planifications
export class ScheduleService {
  private collection = "schedules";

  async create(
    schedule: Omit<Schedule, "id" | "createdAt" | "updatedAt">,
  ): Promise<string> {
    const now = FieldValue.serverTimestamp();
    const docRef = await adminDb.collection(this.collection).add({
      ...schedule,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  }

  async getById(id: string): Promise<Schedule | null> {
    const docRef = adminDb.collection(this.collection).doc(id);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      return { id: docSnap.id, ...docSnap.data() } as Schedule;
    }
    return null;
  }

  async getByUserId(
    userId: string,
    status?: string,
    limitCount = 10,
  ): Promise<Schedule[]> {
    let q = adminDb
      .collection(this.collection)
      .where("userId", "==", userId)
      .orderBy("scheduledAt", "desc")
      .limit(limitCount);

    if (status) {
      q = q.where("status", "==", status);
    }

    const querySnapshot = await q.get();
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Schedule[];
  }

  async getByWorkspaceId(workspaceId: string): Promise<Schedule[]> {
    const q = adminDb
      .collection(this.collection)
      .where("workspaceId", "==", workspaceId)
      .orderBy("scheduledAt", "desc");

    const querySnapshot = await q.get();
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Schedule[];
  }

  async getScheduledForPublishing(): Promise<Schedule[]> {
    const now = FieldValue.serverTimestamp();
    const q = adminDb
      .collection(this.collection)
      .where("status", "==", "scheduled")
      .where("scheduledAt", "<=", now)
      .orderBy("scheduledAt", "asc");

    const querySnapshot = await q.get();
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Schedule[];
  }

  async getAll(): Promise<Schedule[]> {
    const q = adminDb.collection(this.collection).orderBy("createdAt", "desc");

    const querySnapshot = await q.get();
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Schedule[];
  }

  async update(id: string, updates: Partial<Schedule>): Promise<void> {
    const docRef = adminDb.collection(this.collection).doc(id);

    // Filtrer les valeurs undefined pour éviter les erreurs Firestore
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([, value]) => value !== undefined),
    );

    await docRef.update({
      ...filteredUpdates,
      updatedAt: FieldValue.serverTimestamp(),
    });
  }

  async delete(id: string): Promise<void> {
    const docRef = adminDb.collection(this.collection).doc(id);
    await docRef.delete();
  }
}

// Service pour les comptes TikTok
export class TikTokAccountService {
  private collection = "accounts";

  async create(
    account: Omit<TikTokAccount, "id" | "createdAt" | "updatedAt">,
  ): Promise<string> {
    const now = FieldValue.serverTimestamp();
    const docRef = await adminDb.collection(this.collection).add({
      ...account,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  }

  async getByUserId(userId: string): Promise<TikTokAccount[]> {
    console.log("🔍 TikTokAccountService - searching for userId:", userId);

    const q = adminDb
      .collection(this.collection)
      .where("userId", "==", userId)
      .where("platform", "==", "tiktok")
      .where("isActive", "==", true);

    console.log("🔍 TikTokAccountService - executing query with filters:", {
      userId,
      platform: "tiktok",
      isActive: true,
    });

    const querySnapshot = await q.get();
    console.log(
      "🔍 TikTokAccountService - query returned",
      querySnapshot.docs.length,
      "documents",
    );

    const accounts = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      console.log("🔍 TikTokAccountService - found document:", {
        id: doc.id,
        userId: data.userId,
        platform: data.platform,
        isActive: data.isActive,
        username: data.username,
      });
      return {
        id: doc.id,
        ...data,
      };
    }) as TikTokAccount[];

    console.log(
      "🔍 TikTokAccountService - returning",
      accounts.length,
      "accounts",
    );
    return accounts;
  }

  async getById(id: string): Promise<TikTokAccount | null> {
    const docRef = adminDb.collection(this.collection).doc(id);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      return { id: docSnap.id, ...docSnap.data() } as TikTokAccount;
    }
    return null;
  }

  async update(id: string, updates: Partial<TikTokAccount>): Promise<void> {
    const docRef = adminDb.collection(this.collection).doc(id);
    await docRef.update({
      ...updates,
      updatedAt: FieldValue.serverTimestamp(),
    });
  }

  async delete(id: string): Promise<void> {
    const docRef = adminDb.collection(this.collection).doc(id);
    await docRef.update({
      isActive: false,
      updatedAt: FieldValue.serverTimestamp(),
    });
  }
}

// Service pour les workspaces
export class WorkspaceService {
  private collection = "workspaces";

  async create(
    workspace: Omit<Workspace, "id" | "createdAt" | "updatedAt">,
  ): Promise<string> {
    const now = FieldValue.serverTimestamp();
    const docRef = await adminDb.collection(this.collection).add({
      ...workspace,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  }

  async getById(id: string): Promise<Workspace | null> {
    const docRef = adminDb.collection(this.collection).doc(id);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      return { id: docSnap.id, ...docSnap.data() } as Workspace;
    }
    return null;
  }

  async getByOwnerId(ownerId: string): Promise<Workspace[]> {
    const q = adminDb
      .collection(this.collection)
      .where("ownerId", "==", ownerId)
      .orderBy("createdAt", "desc");

    const querySnapshot = await q.get();
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Workspace[];
  }

  async update(id: string, updates: Partial<Workspace>): Promise<void> {
    const docRef = adminDb.collection(this.collection).doc(id);
    await docRef.update({
      ...updates,
      updatedAt: FieldValue.serverTimestamp(),
    });
  }

  async delete(id: string): Promise<void> {
    const docRef = adminDb.collection(this.collection).doc(id);
    await docRef.delete();
  }
}

// Service pour les membres de workspace
export class WorkspaceMemberService {
  private collection = "workspaceMembers";

  async create(
    member: Omit<WorkspaceMember, "id" | "createdAt" | "updatedAt">,
  ): Promise<string> {
    const now = FieldValue.serverTimestamp();
    const docRef = await adminDb.collection(this.collection).add({
      ...member,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  }

  async getByWorkspaceId(workspaceId: string): Promise<WorkspaceMember[]> {
    const q = adminDb
      .collection(this.collection)
      .where("workspaceId", "==", workspaceId)
      .orderBy("createdAt", "asc");

    const querySnapshot = await q.get();
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as WorkspaceMember[];
  }

  async getByUserId(userId: string): Promise<WorkspaceMember[]> {
    const q = adminDb
      .collection(this.collection)
      .where("userId", "==", userId)
      .where("status", "==", "active")
      .orderBy("createdAt", "desc");

    const querySnapshot = await q.get();
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as WorkspaceMember[];
  }

  async getById(id: string): Promise<WorkspaceMember | null> {
    const docRef = adminDb.collection(this.collection).doc(id);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      return { id: docSnap.id, ...docSnap.data() } as WorkspaceMember;
    }
    return null;
  }

  async getByWorkspaceAndUser(
    workspaceId: string,
    userId: string,
  ): Promise<WorkspaceMember | null> {
    const q = adminDb
      .collection(this.collection)
      .where("workspaceId", "==", workspaceId)
      .where("userId", "==", userId)
      .limit(1);

    const querySnapshot = await q.get();
    if (querySnapshot.empty) return null;

    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() } as WorkspaceMember;
  }

  async update(id: string, updates: Partial<WorkspaceMember>): Promise<void> {
    const docRef = adminDb.collection(this.collection).doc(id);
    await docRef.update({
      ...updates,
      updatedAt: FieldValue.serverTimestamp(),
    });
  }

  async delete(id: string): Promise<void> {
    const docRef = adminDb.collection(this.collection).doc(id);
    await docRef.delete();
  }
}

// Service pour les utilisateurs
export class UserService {
  private collection = "users";

  async getUserByEmail(email: string): Promise<{
    uid: string;
    email: string;
    displayName: string;
    photoURL?: string;
  } | null> {
    try {
      // Vérifier si l'utilisateur existe dans Firebase Auth
      const { adminAuth } = await import("./firebase");
      const userRecord = await adminAuth.getUserByEmail(email);

      if (userRecord) {
        return {
          uid: userRecord.uid,
          email: userRecord.email || email,
          displayName: userRecord.displayName || email.split("@")[0],
          photoURL: userRecord.photoURL,
        };
      }
      return null;
    } catch (error) {
      console.error("Erreur lors de la vérification de l'utilisateur:", error);
      return null;
    }
  }

  async getUserById(uid: string): Promise<{
    uid: string;
    email: string;
    displayName: string;
    photoURL?: string;
  } | null> {
    try {
      const { adminAuth } = await import("./firebase");
      const userRecord = await adminAuth.getUser(uid);

      if (userRecord) {
        return {
          uid: userRecord.uid,
          email: userRecord.email || "",
          displayName:
            userRecord.displayName ||
            userRecord.email?.split("@")[0] ||
            "Utilisateur",
          photoURL: userRecord.photoURL,
        };
      }
      return null;
    } catch (error) {
      console.error("Erreur lors de la récupération de l'utilisateur:", error);
      return null;
    }
  }
}

// Service pour les paramètres utilisateur
export class UserSettingsService {
  private collection = "userSettings";

  async getByUserId(userId: string): Promise<UserSettings | null> {
    const docRef = adminDb.collection(this.collection).doc(userId);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      return { id: docSnap.id, userId, ...docSnap.data() } as UserSettings;
    }
    return null;
  }

  async create(
    settings: Omit<UserSettings, "id" | "createdAt" | "updatedAt">,
  ): Promise<string> {
    const now = FieldValue.serverTimestamp();
    const docRef = adminDb.collection(this.collection).doc(settings.userId);
    await docRef.set({
      ...settings,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  }

  async update(userId: string, updates: Partial<UserSettings>): Promise<void> {
    const docRef = adminDb.collection(this.collection).doc(userId);

    // Filtrer les valeurs undefined pour éviter les erreurs Firestore
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([, value]) => value !== undefined),
    );

    await docRef.set(
      {
        ...filteredUpdates,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
  }

  async delete(userId: string): Promise<void> {
    const docRef = adminDb.collection(this.collection).doc(userId);
    await docRef.update({
      deleted: true,
      deletedAt: FieldValue.serverTimestamp(),
    });
  }
}

// Service pour les invitations de workspace
export class WorkspaceInvitationService {
  private collection = "workspaceInvitations";

  async create(
    invitation: Omit<WorkspaceInvitation, "id" | "createdAt" | "updatedAt">,
  ): Promise<string> {
    const now = FieldValue.serverTimestamp();
    const docRef = await adminDb.collection(this.collection).add({
      ...invitation,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  }

  async getByToken(token: string): Promise<WorkspaceInvitation | null> {
    const q = adminDb
      .collection(this.collection)
      .where("token", "==", token)
      .where("status", "==", "pending")
      .limit(1);

    const querySnapshot = await q.get();
    if (querySnapshot.empty) return null;

    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() } as WorkspaceInvitation;
  }

  async getByEmail(email: string): Promise<WorkspaceInvitation[]> {
    const q = adminDb
      .collection(this.collection)
      .where("email", "==", email)
      .orderBy("createdAt", "desc");

    const querySnapshot = await q.get();
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as WorkspaceInvitation[];
  }

  async update(
    id: string,
    updates: Partial<WorkspaceInvitation>,
  ): Promise<void> {
    const docRef = adminDb.collection(this.collection).doc(id);
    await docRef.update({
      ...updates,
      updatedAt: FieldValue.serverTimestamp(),
    });
  }

  async delete(id: string): Promise<void> {
    const docRef = adminDb.collection(this.collection).doc(id);
    await docRef.delete();
  }
}

// Instances des services
export const videoService = new VideoService();
export const scheduleService = new ScheduleService();
export const tiktokAccountService = new TikTokAccountService();
export const workspaceService = new WorkspaceService();
export const workspaceMemberService = new WorkspaceMemberService();
export const workspaceInvitationService = new WorkspaceInvitationService();
export const userService = new UserService();
export const userSettingsService = new UserSettingsService();
