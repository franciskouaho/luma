"use client";

import { useState, useEffect, FormEvent } from "react";
import { Check } from "lucide-react";
import { collection, addDoc, serverTimestamp, getCountFromServer } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";

export default function WaitlistPage() {
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [signupsCount, setSignupsCount] = useState(127); // Valeur par défaut

  // Charger le nombre d'inscriptions au démarrage
  useEffect(() => {
    const fetchSignupsCount = async () => {
      try {
        const waitlistRef = collection(db, "waitlist");
        const snapshot = await getCountFromServer(waitlistRef);
        setSignupsCount(snapshot.data().count);
      } catch (err) {
        console.error("Erreur lors du chargement du compteur:", err);
        // Garder la valeur par défaut en cas d'erreur
      }
    };

    fetchSignupsCount();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!firstName.trim() || !email.trim()) {
      setError("Veuillez remplir tous les champs");
      return;
    }

    if (!email.includes("@")) {
      setError("Email invalide");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Ajouter à Firestore
      await addDoc(collection(db, "waitlist"), {
        firstName: firstName.trim(),
        email: email.toLowerCase().trim(),
        createdAt: serverTimestamp(),
        source: "web"
      });

      setSuccess(true);
      setFirstName("");
      setEmail("");

      // Incrémenter le compteur localement
      setSignupsCount(prev => prev + 1);
    } catch (err) {
      console.error("Erreur lors de l'inscription:", err);
      setError("Une erreur est survenue. Réessayez.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-100 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#9B6BFF' }}>
                <span className="text-white font-bold text-lg">L</span>
              </div>
              <span className="text-xl font-semibold text-gray-900">LumaPost</span>
            </div>

            {/* Follow Launch Button */}
            <a
              href="#waitlist"
              className="text-white text-sm font-medium px-6 py-2 rounded-lg transition-all hover:opacity-90"
              style={{ backgroundColor: '#9B6BFF' }}
            >
              Suivre le lancement
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-2xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 mb-8">
            <span className="inline-block px-4 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-medium">
              En développement
            </span>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="flex -space-x-2">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: '#9B6BFF' }}>M</div>
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: '#F97316' }}>T</div>
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: '#EC4899' }}>S</div>
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: '#3B82F6' }}>J</div>
              </div>
              <span className="font-semibold text-gray-900">{signupsCount}</span>
              <span>créateurs inscrits</span>
            </div>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Publiez sur tous vos réseaux{" "}
            <span style={{ color: '#9B6BFF' }}>10x plus rapidement</span>
          </h1>

          {/* Subheading */}
          <p className="text-xl text-gray-600 mb-12 max-w-xl mx-auto leading-relaxed">
            Gagne du temps avec une plateforme tout en un. Automatise tes publications, programme ton contenu, et développe ta présence. Rejoins la waitlist aujourd&apos;hui
          </p>

          {/* Waitlist Form */}
          <div id="waitlist" className="max-w-md mx-auto mb-12">
            {success ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#10B981' }}>
                    <Check className="w-6 h-6 text-white" strokeWidth={3} />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Tu es inscrit !
                </h3>
                <p className="text-gray-600 text-sm">
                  On te tiendra au courant dès le lancement. Merci de ta confiance ! 🚀
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    placeholder="Prénom..."
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    disabled={loading}
                    className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all disabled:opacity-50"
                  />
                  <input
                    type="email"
                    placeholder="Email..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all disabled:opacity-50"
                  />
                </div>

                {error && (
                  <p className="text-sm text-red-600 text-left">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full text-white text-base font-semibold px-8 py-3.5 rounded-lg transition-all hover:opacity-90 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#9B6BFF' }}
                >
                  {loading ? "Inscription..." : "Rejoindre la waitlist"}
                </button>

                <p className="text-xs text-gray-500">
                  Essai gratuit 14 jours. Sans engagement.
                </p>
              </form>
            )}
          </div>

          {/* Product Screenshot/Mockup */}
          <div className="relative max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
              {/* Mock Browser Header */}
              <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center gap-2">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <div className="flex-1 text-center text-xs text-gray-500">
                  app.lumapost.fr
                </div>
              </div>

              {/* Mock Content */}
              <div className="aspect-video bg-gradient-to-br from-purple-50 via-white to-pink-50 p-8">
                <div className="max-w-3xl mx-auto">
                  {/* Mock Dashboard */}
                  <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="h-8 bg-gray-200 rounded w-32"></div>
                      <div className="h-8 bg-purple-200 rounded w-24"></div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="bg-gray-50 rounded-lg p-4 h-24"></div>
                      <div className="bg-purple-50 rounded-lg p-4 h-24"></div>
                      <div className="bg-pink-50 rounded-lg p-4 h-24"></div>
                    </div>

                    <div className="space-y-3">
                      <div className="bg-gray-100 rounded h-16"></div>
                      <div className="bg-gray-100 rounded h-16"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating badges */}
            <div className="absolute -left-4 top-1/4 bg-white rounded-lg shadow-xl border border-gray-200 px-4 py-2 transform -rotate-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">⚡</span>
                <span className="text-sm font-semibold text-gray-900">Gain de temps</span>
              </div>
            </div>

            <div className="absolute -right-4 top-1/3 bg-white rounded-lg shadow-xl border border-gray-200 px-4 py-2 transform rotate-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📊</span>
                <span className="text-sm font-semibold text-gray-900">Analytics</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#9B6BFF' }}>
                <span className="text-white font-bold text-sm">L</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">LumaPost</span>
            </div>

            <div className="flex gap-6 text-sm text-gray-600">
              <a href="#" className="hover:text-gray-900 transition-colors">Mentions légales</a>
              <a href="#" className="hover:text-gray-900 transition-colors">Confidentialité</a>
              <a href="#" className="hover:text-gray-900 transition-colors">Contact</a>
            </div>

            <p className="text-sm text-gray-500">
              © 2025 LumaPost. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
