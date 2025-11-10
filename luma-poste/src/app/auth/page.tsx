"use client";

import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";
import { GoogleSignInButton } from "@/components/auth/google-signin-button";
import { useRouter } from "next/navigation";
import LoadingScreen from "@/components/loading-screen";

export default function AuthPage() {
  const [user, setUser] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);

      // Rediriger automatiquement vers le dashboard si l'utilisateur est connecté
      if (user) {
        router.push('/dashboard');
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Luma Post
          </h1>
          <p className="text-gray-600">
            Sign in or create your account to start scheduling content
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          {/* Google Sign-in Button */}
          <GoogleSignInButton user={user} onUserChange={setUser} />
        </div>
      </div>
    </div>
  );
}
