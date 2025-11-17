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

  // Step 1: Plan
  const [selectedPlan, setSelectedPlan] = useState("professional");
  const [promoCode, setPromoCode] = useState("");
  const [promoCodeApplied, setPromoCodeApplied] = useState(false);
  const [promoCodeError, setPromoCodeError] = useState("");
  const [validatingCode, setValidatingCode] = useState(false);

  // Step 2: Workspace
  const [workspaceName, setWorkspaceName] = useState("");
  const [workspaceType, setWorkspaceType] = useState("Personel");
  const [timezone, setTimezone] = useState("Paris (CET/CEST)");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth");
    }

    // Auto-fill workspace name with user's display name if available
    if (user?.displayName && !workspaceName) {
      setWorkspaceName(user.displayName);
    }

    // Détecter le retour du paiement Lemon Squeezy
    const urlParams = new URLSearchParams(window.location.search);
    const checkoutSuccess = urlParams.get("checkout");

    if (checkoutSuccess === "success") {
      // Récupérer le plan depuis localStorage
      const savedPlan = localStorage.getItem("selectedPlan");
      if (savedPlan) {
        setSelectedPlan(savedPlan);
      }
      // Passer à l'étape 2 pour créer le workspace
      setCurrentStep(2);
      // Nettoyer l'URL
      window.history.replaceState({}, "", "/onboarding");
    }
  }, [user, authLoading, router, workspaceName]);

  const handleApplyPromoCode = async () => {
    if (!promoCode.trim()) {
      setPromoCodeError("Veuillez entrer un code");
      return;
    }

    setValidatingCode(true);
    setPromoCodeError("");

    try {
      const idToken = await user?.getIdToken();
      const response = await fetch("/api/validate-promo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`,
        },
        body: JSON.stringify({ code: promoCode.trim() }),
      });

      const data = await response.json();

      if (response.ok && data.valid) {
        setPromoCodeApplied(true);
        setPromoCodeError("");
      } else {
        setPromoCodeError(data.message || "Code invalide");
        setPromoCodeApplied(false);
      }
    } catch (err) {
      console.error("Error validating promo code:", err);
      setPromoCodeError("Erreur lors de la validation");
      setPromoCodeApplied(false);
    } finally {
      setValidatingCode(false);
    }
  };

  const handlePayment = async () => {
    if (!user) return;

    setLoading(true);
    setError("");

    try {
      // Sauvegarder le plan sélectionné dans localStorage pour le retrouver après le paiement
      localStorage.setItem("selectedPlan", selectedPlan);

      // Récupérer l'ID token pour l'authentification API
      const idToken = await user.getIdToken();

      // Obtenir le variant ID selon le plan sélectionné
      const variantIds: Record<string, string> = {
        starter: process.env.NEXT_PUBLIC_LS_STARTER_VARIANT_ID || "",
        professional: process.env.NEXT_PUBLIC_LS_PRO_VARIANT_ID || "",
        premium: process.env.NEXT_PUBLIC_LS_PREMIUM_VARIANT_ID || "",
      };

      const variantId = variantIds[selectedPlan];

      if (!variantId) {
        setError("Plan non configuré");
        setLoading(false);
        return;
      }

      // Créer le checkout Lemon Squeezy - après paiement, revenir sur onboarding
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          variantId: variantId,
          plan: selectedPlan,
          workspaceName: "", // Sera créé à l'étape 2
          redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/onboarding?checkout=success`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Checkout API error:", errorData);
        throw new Error(errorData.error || "Failed to create checkout");
      }

      const { checkoutUrl } = await response.json();

      // Rediriger vers Lemon Squeezy checkout
      window.location.href = checkoutUrl;
    } catch (err) {
      console.error("Error creating payment:", err);
      setError("Une erreur est survenue. Réessayez.");
      setLoading(false);
    }
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      // Vérifier qu'un plan est sélectionné
      if (!selectedPlan) {
        setError("Veuillez sélectionner un plan");
        return;
      }
      setError("");

      // Si code promo appliqué, aller à l'étape workspace
      if (promoCodeApplied) {
        setCurrentStep(2);
        return;
      }

      // Sinon, rediriger directement vers le paiement Lemon Squeezy
      handlePayment();
    } else if (currentStep === 2) {
      if (!workspaceName.trim()) {
        setError("Veuillez entrer un nom de workspace");
        return;
      }
      setError("");
      handleComplete();
    }
  };

  const handleComplete = async () => {
    if (!user) return;

    setLoading(true);
    setError("");

    try {
      // Vérifier si l'utilisateur a déjà payé (via localStorage)
      const hasPaid = localStorage.getItem("selectedPlan") !== null;

      // Créer le workspace dans Firestore
      const workspaceRef = doc(db, "workspaces", `${user.uid}_default`);
      await setDoc(workspaceRef, {
        name: workspaceName,
        type: workspaceType,
        timezone: timezone,
        ownerId: user.uid,
        plan: selectedPlan,
        paymentStatus: promoCodeApplied ? "free" : (hasPaid ? "active" : "pending"),
        promoCode: promoCodeApplied ? promoCode : null,
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
        plan: selectedPlan,
        subscriptionStatus: promoCodeApplied ? "active" : (hasPaid ? "active" : "pending"),
        promoCode: promoCodeApplied ? promoCode : null,
        completedAt: serverTimestamp()
      }, { merge: true });

      // Nettoyer localStorage
      localStorage.removeItem("selectedPlan");

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
      price: "12,99€",
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
      price: "29,99€",
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
      price: "89,99€",
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

              {/* Code promo section */}
              <div className="max-w-md mx-auto mt-6 mb-4">
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Code promo ou beta
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      placeholder="BETA2025"
                      disabled={promoCodeApplied || validatingCode}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B6BFF] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed uppercase"
                    />
                    <button
                      onClick={handleApplyPromoCode}
                      disabled={promoCodeApplied || validatingCode || !promoCode.trim()}
                      className="px-6 py-2 text-white rounded-lg font-medium transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                      style={{ backgroundColor: '#9B6BFF' }}
                    >
                      {validatingCode ? "..." : promoCodeApplied ? "✓ Appliqué" : "Appliquer"}
                    </button>
                  </div>
                  {promoCodeError && (
                    <p className="text-xs text-red-600 mt-2">{promoCodeError}</p>
                  )}
                  {promoCodeApplied && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-green-700">
                      <Check className="w-4 h-4" strokeWidth={3} />
                      <span className="font-medium">Code valide ! Accès gratuit activé</span>
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    Pour beta testeurs et admins uniquement
                  </p>
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-600 text-center mb-4">{error}</p>
              )}

              <p className="text-sm text-gray-500 text-center">
                Étape {currentStep} sur {totalSteps} - Suivant : Créez votre workspace
              </p>
            </div>
          )}

          {currentStep === 2 && (
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B6BFF] focus:border-transparent"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B6BFF] focus:border-transparent appearance-none cursor-pointer"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B6BFF] focus:border-transparent appearance-none cursor-pointer"
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
