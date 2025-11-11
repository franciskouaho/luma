"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useOnboarding } from "@/hooks/use-onboarding";

interface OnboardingGuardProps {
  children: React.ReactNode;
}

export default function OnboardingGuard({ children }: OnboardingGuardProps) {
  const { onboardingCompleted, loading, user } = useOnboarding();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Ne pas rediriger si on est déjà sur la page d'onboarding
    if (pathname === "/onboarding") {
      return;
    }

    // Attendre que le chargement soit terminé
    if (loading) {
      return;
    }

    // Si pas d'utilisateur, ne rien faire (AuthGuard s'en occupera)
    if (!user) {
      return;
    }

    // Si l'onboarding n'est pas complété, rediriger
    if (onboardingCompleted === false) {
      router.push("/onboarding");
    }
  }, [onboardingCompleted, loading, user, router, pathname]);

  // Afficher un loader pendant la vérification
  if (loading || (user && onboardingCompleted === null)) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div
            className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"
            style={{ borderColor: '#9B6BFF' }}
          ></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  // Si l'onboarding n'est pas complété, afficher le loader (le temps de la redirection)
  if (user && onboardingCompleted === false && pathname !== "/onboarding") {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div
            className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"
            style={{ borderColor: '#9B6BFF' }}
          ></div>
          <p className="text-gray-600">Redirection...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
