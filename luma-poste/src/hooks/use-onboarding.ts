import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";
import { useAuth } from "./use-auth";

export function useOnboarding() {
  const { user, loading: authLoading } = useAuth();
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkOnboarding = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));

        if (userDoc.exists()) {
          const userData = userDoc.data();
          setOnboardingCompleted(userData.onboardingCompleted === true);
        } else {
          // Si le document utilisateur n'existe pas, l'onboarding n'est pas complété
          setOnboardingCompleted(false);
        }
      } catch (error) {
        console.error("Error checking onboarding status:", error);
        setOnboardingCompleted(false);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      checkOnboarding();
    }
  }, [user, authLoading]);

  return {
    onboardingCompleted,
    loading: loading || authLoading,
    user
  };
}
