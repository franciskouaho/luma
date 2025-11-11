import { APP_CONFIG } from "@/lib/config";
import WaitlistPage from "@/components/waitlist/waitlist-page";
import LandingHeader from "@/components/landing/header";
import HeroSection from "@/components/landing/hero-section";
import PainPointsSection from "@/components/landing/pain-points-section";
import HowItWorksSection from "@/components/landing/how-it-works-section";
import DemoVideoSection from "@/components/landing/demo-video-section";
import DetailedFeaturesSection from "@/components/landing/detailed-features-section";
import PlatformsSection from "@/components/landing/platforms-section";
import TestimonialsSection from "@/components/landing/testimonials-section";
import OnePostPricingSection from "@/components/landing/onepost-pricing-section";
import OnePostFAQSection from "@/components/landing/onepost-faq-section";
import FinalCTASection from "@/components/landing/final-cta-section";
import OnePostFooter from "@/components/landing/onepost-footer";

export default function Home() {
  // Afficher la waitlist ou la landing page selon la configuration
  if (APP_CONFIG.showWaitlist) {
    return <WaitlistPage />;
  }

  // Landing page complète
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <LandingHeader />
      <HeroSection />
      <PainPointsSection />
      <HowItWorksSection />
      <DemoVideoSection />
      <DetailedFeaturesSection />
      <PlatformsSection />
      <TestimonialsSection />
      <OnePostPricingSection />
      <OnePostFAQSection />
      <FinalCTASection />
      <OnePostFooter />
    </div>
  );
}