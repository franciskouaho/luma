// Configuration pour basculer entre landing page et waitlist
export const APP_CONFIG = {
  // Défini via NEXT_PUBLIC_SHOW_WAITLIST dans .env.local
  // Mettre à "true" pour afficher la waitlist, "false" pour la landing page
  showWaitlist: process.env.NEXT_PUBLIC_SHOW_WAITLIST === "true",

  // Informations de la waitlist
  waitlist: {
    signupsCount: parseInt(process.env.NEXT_PUBLIC_WAITLIST_SIGNUPS_COUNT || "127"),
    launchDate: process.env.NEXT_PUBLIC_WAITLIST_LAUNCH_DATE || "Janvier 2026",
    offset: parseInt(process.env.NEXT_PUBLIC_WAITLIST_OFFSET || "130"),
  },
} as const;
