"use client";

export default function FinalCTASection() {
  return (
    <section className="py-32 bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
          Arrêtez de perdre du temps sur la gestion de vos réseaux sociaux
        </h2>

        <a
          href="/auth"
          className="inline-flex items-center gap-2 text-white px-10 py-5 text-lg font-semibold rounded-lg transition-all hover:opacity-90 shadow-2xl mt-8"
          style={{ backgroundColor: '#9B6BFF' }}
        >
          Commencer l&apos;essai gratuit
        </a>
      </div>
    </section>
  );
}
