import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { View } from "react-native";

export default function OnboardingIntro() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/onboarding/goals");
  }, [router]);

  return <View />;
}
