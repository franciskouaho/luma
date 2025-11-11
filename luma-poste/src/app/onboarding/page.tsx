"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowLeft, Check } from "lucide-react";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";
import { FaFacebook, FaInstagram, FaLinkedin, FaXTwitter, FaYoutube, FaTiktok } from "react-icons/fa6";

export default function OnboardingPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Step 1: Workspace
  const [workspaceName, setWorkspaceName] = useState("");
  const [workspaceType, setWorkspaceType] = useState("Personel");
  const [timezone, setTimezone] = useState("Paris (CET/CEST)");

  // Step 2: Plan
  const [selectedPlan, setSelectedPlan] = useState("professional");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth");
    }

    // Auto-fill workspace name with user's display name if available
    if (user?.displayName && !workspaceName) {
      setWorkspaceName(user.displayName);
    }
  }, [user, authLoading, router, workspaceName]);

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!workspaceName.trim()) {
        setError("Veuillez entrer un nom de workspace");
        return;
      }
      setError("");
      setCurrentStep(2);
    } else if (currentStep === 2) {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    if (!user) return;

    setLoading(true);
    setError("");

    try {
      // Créer le workspace dans Firestore
      const workspaceRef = doc(db, "workspaces", `${user.uid}_default`);
      await setDoc(workspaceRef, {
        name: workspaceName,
        type: workspaceType,
        timezone: timezone,
        ownerId: user.uid,
        plan: selectedPlan,
        createdAt: serverTimestamp(),
        settings: {
          allowMemberInvites: true,
          requireApprovalForPosts: false,
          allowMemberAccountConnections: true
        }
      });

      // Marquer l'onboarding comme complété
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, {
        onboardingCompleted: true,
        workspaceId: `${user.uid}_default`,
        completedAt: serverTimestamp()
      }, { merge: true });

      // Rediriger vers le dashboard
      router.push("/dashboard");
    } catch (err) {
      console.error("Error completing onboarding:", err);
      setError("Une erreur est survenue. Réessayez.");
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderColor: '#9B6BFF' }}></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  const totalSteps = 2;
  const progressPercentage = (currentStep / totalSteps) * 100;

  const plans = [
    {
      id: "starter",
      name: "Starter",
      subtitle: "Base solide pour débuter sereinement",
      price: "12€",
      period: "/mois",
      popular: false,
      features: [
        "5 comptes sociaux connectés",
        "Toutes les plateformes :",
        "500 publications/mois",
        "Posts; Carrousels; Reels; Stories; Vidéos",
        "Calendrier de publication",
        "50 crédits IA/mois",
        "Analytics basiques",
        "Support email"
      ]
    },
    {
      id: "professional",
      name: "Pro",
      subtitle: "Outils IA avancés pour les entreprises et équipes",
      price: "29€",
      period: "/mois",
      popular: true,
      badge: "Meilleure offre",
      features: [
        "15 comptes sociaux connectés",
        "Toutes les plateformes :",
        "Publications illimitées",
        "Posts; Carrousels; Reels; Stories; Vidéos",
        "Calendrier de publication",
        "250 crédits IA/mois",
        "Analytics avancées",
        "Équipe jusqu'à 3 utilisateurs",
        "Support par email en 24h"
      ]
    },
    {
      id: "premium",
      name: "Premium",
      subtitle: "Tout illimité + priorités et SLA",
      price: "89€",
      period: "/mois",
      popular: false,
      features: [
        "Comptes sociaux illimités",
        "Toutes les plateformes :",
        "Publications illimitées",
        "Posts; Carrousels; Reels; Stories; Vidéos",
        "Calendrier de publication",
        "+3000 crédits IA/mois",
        "Analytics avancées + rapports",
        "Équipe illimitée",
        "Support dédié par email"
      ]
    }
  ];

  const platforms = [FaFacebook, FaInstagram, FaLinkedin, FaXTwitter, FaYoutube, FaTiktok];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-100 py-4">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#9B6BFF' }}>
                <span className="text-white font-bold text-lg">L</span>
              </div>
              <span className="text-xl font-semibold text-gray-900">Démarrer avec LumaPost</span>
            </div>
            <span className="text-sm text-gray-500">
              Étape {currentStep} sur {totalSteps}
            </span>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="w-full bg-gray-100 h-2">
        <div
          className="h-full transition-all duration-300"
          style={{
            width: `${progressPercentage}%`,
            backgroundColor: '#9B6BFF'
          }}
        ></div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-6">
        <div className="w-full max-w-7xl">
          {currentStep === 1 && (
            <div className="text-center">
              {/* Icon */}
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6" style={{ backgroundColor: '#9B6BFF' }}>
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z" />
                </svg>
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                Créez votre workspace
              </h1>
              <p className="text-gray-600 mb-8">
                Quelques informations pour commencer
              </p>

              {/* Form */}
              <div className="space-y-6 text-left">
                {/* Workspace Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom du workspace
                  </label>
                  <input
                    type="text"
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                    placeholder={user?.displayName || "Mon Workspace"}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                {/* Workspace Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type de workspace
                  </label>
                  <select
                    value={workspaceType}
                    onChange={(e) => setWorkspaceType(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none cursor-pointer"
                  >
                    <option value="Personel">Personnel</option>
                    <option value="Equipe">Équipe</option>
                    <option value="Agence">Agence</option>
                  </select>
                </div>

                {/* Timezone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <span className="inline-flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Fuseau horaire
                    </span>
                  </label>
                  <p className="text-xs text-gray-500 mb-2">
                    Détecté automatiquement : Paris (CET/CEST)
                  </p>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none cursor-pointer"
                  >
                    <option value="Paris (CET/CEST)">Paris (CET/CEST)</option>
                    <option value="London (GMT/BST)">London (GMT/BST)</option>
                    <option value="New York (EST/EDT)">New York (EST/EDT)</option>
                    <option value="Los Angeles (PST/PDT)">Los Angeles (PST/PDT)</option>
                    <option value="Tokyo (JST)">Tokyo (JST)</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-2">
                    Les dates des posts planifiés seront affichées selon ce fuseau horaire
                  </p>
                </div>

                {error && (
                  <p className="text-sm text-red-600">{error}</p>
                )}
              </div>

              <p className="text-sm text-gray-500 mt-8">
                Étape {currentStep} sur {totalSteps} - Suivant : Choisissez votre plan
              </p>
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <div className="text-center mb-4">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  Choisissez votre plan
                </h1>
                <div className="flex justify-center mb-4">
                  <div className="bg-gray-100 rounded-lg p-1 inline-flex gap-1">
                    <button className="px-6 py-2 text-sm font-semibold rounded-md text-white transition-all" style={{ backgroundColor: '#9B6BFF' }}>
                      Mensuel
                    </button>
                    <button className="px-6 py-2 text-sm font-semibold text-gray-700 rounded-md hover:bg-gray-200 transition-all">
                      Annuel
                    </button>
                  </div>
                </div>
              </div>

              {/* Plans Grid */}
              <div className="grid md:grid-cols-3 gap-4 mb-4">
                {plans.map((plan, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedPlan(plan.id)}
                    className={`relative bg-white rounded-2xl p-5 text-left transition-all hover:shadow-xl ${
                      selectedPlan === plan.id
                        ? "border-2 shadow-lg"
                        : "border"
                    } border-gray-200`}
                    style={selectedPlan === plan.id ? { borderColor: '#9B6BFF' } : {}}
                  >
                    {/* Popular Badge */}
                    {plan.popular && (
                      <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                        <div className="text-white px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: '#F97316' }}>
                          Plus populaire
                        </div>
                      </div>
                    )}

                    {/* Best Offer Badge */}
                    {plan.badge && (
                      <div className="absolute -top-2.5 right-3">
                        <div className="text-white px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: '#3B82F6' }}>
                          {plan.badge}
                        </div>
                      </div>
                    )}

                    {/* Plan Name */}
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {plan.name}
                    </h3>
                    <p className="text-xs text-gray-600 mb-3">
                      {plan.subtitle}
                    </p>

                    {/* Price */}
                    <div className="mb-3">
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                        <span className="text-gray-600">{plan.period}</span>
                      </div>
                    </div>

                    {/* Trial Info */}
                    <div className="text-center mb-3">
                      <span className="inline-block px-3 py-1 bg-green-50 text-green-700 rounded-md text-xs font-medium">
                        Essai gratuit 7 jours
                      </span>
                    </div>

                    <p className="text-xs text-center text-gray-500 mb-4">
                      0€ aujourd&apos;hui, annulez à tout moment
                    </p>

                    {/* Features List */}
                    <ul className="space-y-1.5">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs">
                          {feature === "Toutes les plateformes :" ? (
                            <div className="w-full">
                              <div className="flex items-center gap-2 mb-1">
                                <Check className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#9B6BFF' }} strokeWidth={3} />
                                <span className="text-gray-900 font-medium">{feature}</span>
                              </div>
                              <div className="flex gap-1.5 ml-5">
                                {platforms.map((Icon, pidx) => (
                                  <Icon key={pidx} className="w-3.5 h-3.5 text-gray-400" />
                                ))}
                              </div>
                            </div>
                          ) : (
                            <>
                              <Check className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: '#9B6BFF' }} strokeWidth={3} />
                              <span className="text-gray-700">{feature}</span>
                            </>
                          )}
                        </li>
                      ))}
                    </ul>
                  </button>
                ))}
              </div>

              <p className="text-sm text-gray-500 text-center">
                Étape {currentStep} sur {totalSteps} - Suivant : Finalisation
              </p>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-6">
            {currentStep > 1 ? (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="flex items-center gap-2 px-6 py-3 text-gray-700 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-all font-medium"
                disabled={loading}
              >
                <ArrowLeft className="w-4 h-4" />
                Précédent
              </button>
            ) : (
              <div></div>
            )}

            <button
              onClick={handleNextStep}
              disabled={loading}
              className="flex items-center gap-2 px-8 py-3 text-white rounded-lg font-semibold transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#9B6BFF' }}
            >
              {loading ? "Chargement..." : currentStep === totalSteps ? "Continuer" : "Continuer"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
