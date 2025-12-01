"use client";

export default function HelpPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Centre d'aide</h1>
        
        <div className="space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Comment publier une vidéo ?</h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>Allez dans "Create Post" → "Video"</li>
              <li>Sélectionnez votre compte TikTok</li>
              <li>Uploadez votre vidéo</li>
              <li>Configurez les paramètres (privacy, interactions, etc.)</li>
              <li>Cliquez sur "Publish Now"</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Comment connecter mon compte TikTok ?</h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>Allez dans "Connections" (Comptes)</li>
              <li>Cliquez sur "Connect TikTok"</li>
              <li>Autorisez l'application sur TikTok</li>
              <li>Votre compte sera connecté automatiquement</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Problèmes courants</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">La publication échoue</h3>
                <p className="text-gray-700">
                  Vérifiez que votre compte TikTok est un Business Account et que vous avez autorisé tous les scopes requis.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Timeout lors de la publication</h3>
                <p className="text-gray-700">
                  La publication peut prendre quelques minutes. Vérifiez votre profil TikTok pour voir si la vidéo a été publiée.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Support</h2>
            <p className="text-gray-700">
              Pour toute question, contactez-nous à : <a href="mailto:support@lumapost.fr" className="text-purple-600 hover:underline">support@lumapost.fr</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

