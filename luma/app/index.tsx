import AsyncStorage from "@react-native-async-storage/async-storage";
import auth from "@react-native-firebase/auth";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Image, StyleSheet, View } from "react-native";
import { STORAGE_KEYS } from "../src/constants/storage";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged((user) => {
      setTimeout(() => {
        if (user) {
          (async () => {
            try {
              const hasCompleted = await AsyncStorage.getItem(
                STORAGE_KEYS.onboardingComplete
              );
              if (hasCompleted === "true") {
                router.replace("/(tabs)");
              } else {
                router.replace("/onboarding");
              }
            } catch {
              router.replace("/(tabs)");
            }
          })();
        } else {
          router.replace("/auth/login");
        }
      }, 1200);
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <LinearGradient
    colors={[
      "rgba(8, 12, 22, 1)",
      "rgba(12, 16, 30, 1)",
      "rgba(25, 21, 39, 1)",
    ]}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={styles.container}
  >
      <View style={styles.content}>
        <Image
          source={require("../assets/images/splash-icon.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  logo: {
    width: "70%",
    maxWidth: 240,
    aspectRatio: 1,
  },
});
