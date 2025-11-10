import { create } from "zustand";
import firestore from "@react-native-firebase/firestore";
import type { TikTokIdea } from "../types/tiktok";

interface IdeasState {
  ideas: TikTokIdea[];
  loading: boolean;
  error: string | null;

  // Actions
  fetchIdeas: (userId: string) => Promise<void>;
  addIdea: (idea: Omit<TikTokIdea, "id" | "createdAt">) => Promise<void>;
  toggleFavorite: (ideaId: string) => Promise<void>;
  deleteIdea: (ideaId: string) => Promise<void>;
  clearIdeas: () => void;
}

export const useIdeasStore = create<IdeasState>((set, get) => ({
  ideas: [],
  loading: false,
  error: null,

  fetchIdeas: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      const querySnapshot = await firestore()
        .collection("ideas")
        .where("userId", "==", userId)
        .orderBy("createdAt", "desc")
        .get();

      const ideas: TikTokIdea[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as TikTokIdea[];

      set({ ideas, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  addIdea: async (idea) => {
    set({ loading: true, error: null });
    try {
      const docRef = await firestore().collection("ideas").add({
        ...idea,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

      const newIdea: TikTokIdea = {
        ...idea,
        id: docRef.id,
        createdAt: new Date(),
      };

      set({ ideas: [newIdea, ...get().ideas], loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  toggleFavorite: async (ideaId: string) => {
    try {
      const idea = get().ideas.find((i) => i.id === ideaId);
      if (!idea) return;

      await firestore().collection("ideas").doc(ideaId).update({
        isFavorite: !idea.isFavorite,
      });

      set({
        ideas: get().ideas.map((i) =>
          i.id === ideaId ? { ...i, isFavorite: !i.isFavorite } : i
        ),
      });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  deleteIdea: async (ideaId: string) => {
    try {
      await firestore().collection("ideas").doc(ideaId).delete();
      set({ ideas: get().ideas.filter((i) => i.id !== ideaId) });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  clearIdeas: () => {
    set({ ideas: [], error: null });
  },
}));
