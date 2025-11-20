"use client";

import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function FinalCTASection() {
  return (
    <section className="py-32 relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gray-900 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-600/20 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8 leading-tight">
            Arrêtez de perdre du temps sur la gestion de vos <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">réseaux sociaux</span>
          </h2>

          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
            Rejoignez plus de 1000 créateurs qui ont choisi LumaPost pour automatiser leur présence en ligne.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth" className="w-full sm:w-auto">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#9B6BFF] hover:bg-[#8B5BEF] text-white px-10 py-5 text-lg font-bold rounded-xl transition-all shadow-lg shadow-purple-500/30"
              >
                Commencer l&apos;essai gratuit
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>

            <p className="text-sm text-gray-400 mt-4 sm:mt-0 sm:absolute sm:-bottom-12">
              Pas de carte bancaire requise • Annulation à tout moment
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
