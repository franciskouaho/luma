import auth from "@react-native-firebase/auth";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import * as AppleAuthentication from "expo-apple-authentication";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { borderRadius, colors, spacing } from "../../src/theme/colors";

export default function LoginScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Configure Google Sign-In
    GoogleSignin.configure({
      webClientId:
        "939156653935-3o5g8lt8mjl2sa1nb6lk1sqm6tjrhv8m.apps.googleusercontent.com",
    });
  }, []);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);

    try {
      // Check if device supports Google Play services
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      // Get the users ID token
      const { data } = await GoogleSignin.signIn();
      const idToken = data?.idToken ?? null;

      // Create a Google credential with the token
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);

      // Sign-in the user with the credential
      await auth().signInWithCredential(googleCredential);
      router.replace("/");
    } catch (err: any) {
      console.error("Google Sign-In Error:", err);
      setError(err.message || "Erreur lors de la connexion");
    } finally {
      setLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setLoading(true);
    setError(null);

    try {
      const appleAuthRequestResponse = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      const { identityToken, nonce } = appleAuthRequestResponse as {
        identityToken: string | null;
        nonce?: string;
      };

      if (!identityToken) {
        throw new Error("No identity token received");
      }

      // Create an Apple credential with the token
      const appleCredential = auth.AppleAuthProvider.credential(
        identityToken,
        nonce ?? undefined,
      );

      // Sign-in the user with the credential
      await auth().signInWithCredential(appleCredential);
      router.replace("/");
    } catch (err: any) {
      if (err.code !== "ERR_REQUEST_CANCELED") {
        console.error("Apple Sign-In Error:", err);
        setError(err.message || "Erreur lors de la connexion");
      }
    } finally {
      setLoading(false);
    }
  };

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
      <StatusBar style="light" />
      <View style={styles.heroWrapper}>
        <Image
          source={require("../../assets/images/splash-icon.png")}
          style={styles.heroImage}
          resizeMode="contain"
        />
      </View>

      <Text style={styles.taglineTitle}>
        Idées, scripts et reposts automatiques grâce à l’IA
      </Text>

      <View style={styles.actions}>
        {Platform.OS === "ios" && (
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={
              AppleAuthentication.AppleAuthenticationButtonType.CONTINUE
            }
            buttonStyle={
              AppleAuthentication.AppleAuthenticationButtonStyle.WHITE
            }
            cornerRadius={borderRadius.button}
            style={styles.appleButton}
            onPress={handleAppleSignIn}
          />
        )}

        <TouchableOpacity
          style={styles.googleButton}
          onPress={handleGoogleSignIn}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.text} />
          ) : (
            <>
              <Text style={styles.googleIcon}>G</Text>
              <Text style={styles.googleText}>Continuer avec Google</Text>
            </>
          )}
        </TouchableOpacity>

        {error && <Text style={styles.error}>{error}</Text>}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
    justifyContent: "space-between",
  },
  heroWrapper: {
    flex: 0.6,
    alignItems: "center",
    justifyContent: "center",
  },
  heroImage: {
    width: "50%",
    maxWidth: 200,
    aspectRatio: 0.9,
  },
  taglineTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text,
    textAlign: "center",
    marginBottom: spacing.xl * 3,
    lineHeight: 32,
  },
  actions: {
    width: "100%",
    gap: spacing.md,
  },
  appleButton: {
    width: "100%",
    height: 54,
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: borderRadius.button,
    paddingVertical: spacing.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
  },
  googleIcon: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
  },
  googleText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  error: {
    color: colors.primary,
    textAlign: "center",
    marginTop: spacing.sm,
  },
});
