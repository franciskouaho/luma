"use client";

import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";
import { GoogleSignInButton } from "@/components/auth/google-signin-button";
import { useRouter } from "next/navigation";
import LoadingScreen from "@/components/loading-screen";
import Link from "next/link";
import { motion } from "framer-motion";

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
    <div className="min-h-screen bg-white grid lg:grid-cols-2">
      {/* Left Column - Auth Form */}
      <div className="flex flex-col justify-center items-center p-8 lg:p-12 relative">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 mb-12">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <span className="text-white font-bold text-xl">L</span>
            </div>
            <span className="text-xl font-bold text-gray-900">lumapost</span>
          </Link>

          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">
              Bienvenue sur LumaPost
            </h1>
            <p className="text-gray-600">
              Connectez-vous ou créez un compte pour commencer à gérer vos réseaux sociaux.
            </p>
          </div>

          {/* Auth Card */}
          <div className="space-y-6">
            <GoogleSignInButton user={user} onUserChange={setUser} />

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">
                  Sécurisé par Google
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-sm text-gray-500">
            En continuant, vous acceptez nos{" "}
            <Link href="/terms" className="font-medium text-purple-600 hover:text-purple-500 underline underline-offset-4">
              Conditions d'utilisation
            </Link>{" "}
            et notre{" "}
            <Link href="/privacy" className="font-medium text-purple-600 hover:text-purple-500 underline underline-offset-4">
              Politique de confidentialité
            </Link>
            .
          </p>
        </div>
      </div>

      {/* Right Column - Visual */}
      <div className="hidden lg:block relative bg-gray-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 to-gray-900/50 z-10" />

        {/* Background Image/Pattern */}
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-20" />

        {/* Decorative Blobs */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-500/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-500/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        {/* Content Overlay */}
        <div className="relative z-20 h-full flex flex-col justify-center px-12 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h2 className="text-4xl font-bold mb-6 leading-tight">
              Gérez tous vos réseaux sociaux au même endroit.
            </h2>
            <p className="text-lg text-gray-300 max-w-md mb-8">
              Rejoignez des milliers de créateurs qui gagnent du temps avec LumaPost.
            </p>

            {/* Testimonial Card */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 max-w-md">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex text-yellow-400">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              <p className="text-gray-200 italic mb-4">
                "LumaPost a complètement changé ma façon de travailler. Je gagne un temps précieux chaque semaine."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400" />
                <div>
                  <p className="font-semibold">Sarah M.</p>
                  <p className="text-xs text-gray-400">Créatrice de contenu</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
