// Configuration pour basculer entre landing page et waitlist
export const APP_CONFIG = {
  // Mettre à true pour afficher la waitlist, false pour la landing page
  showWaitlist: true,

  // Informations de la waitlist
  waitlist: {
    signupsCount: 127, // Nombre d'inscrits (à mettre à jour)
    launchDate: "Janvier 2026", // Date de lancement prévue
    offset: 130, // Offset ajouté au nombre réel d'inscriptions Firebase
  }
} as const;
