import SidebarLayout from '@/components/SidebarLayout';
import OnboardingGuard from '@/components/auth/onboarding-guard';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <OnboardingGuard>
      <SidebarLayout>{children}</SidebarLayout>
    </OnboardingGuard>
  );
}