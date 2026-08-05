import React from "react";
import {
  Alert,
  Linking,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as Application from "expo-application";
import { MaterialIcons } from "@expo/vector-icons";

const OLD_ANDROID_PACKAGE = "com.symplytheo.cmdanigeriamobile";
const NEW_APK_URL =
  "https://expo.dev/artifacts/eas/GxGMJjDU1UzeSGfCWpFOli7CHJqrBcpyPJoR3upZb0Q.apk";

export default function OldAppMigrationGate() {
  const isOldAndroidApp = Application.applicationId === OLD_ANDROID_PACKAGE;

  if (!isOldAndroidApp) return null;

  const downloadNewApp = async () => {
    try {
      await Linking.openURL(NEW_APK_URL);
    } catch {
      Alert.alert(
        "Download unavailable",
        "Please visit cmdanigeria.net and select Download APK.",
      );
    }
  };

  return (
    <Modal
      animationType="fade"
      onRequestClose={() => undefined}
      presentationStyle="fullScreen"
      visible
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.iconCircle}>
            <MaterialIcons name="system-update" size={46} color="#9D3B7A" />
          </View>

          <Text style={styles.eyebrow}>IMPORTANT APP UPDATE</Text>
          <Text style={styles.title}>Move to the new CMDA app</Text>
          <Text style={styles.description}>
            This version has been retired. Install the new CMDA Nigeria app to
            keep receiving messages, announcements, and phone notifications.
          </Text>

          <View style={styles.stepsCard}>
            <Text style={styles.step}>1. Download and install the new app.</Text>
            <Text style={styles.step}>2. Sign in with your existing account.</Text>
            <Text style={styles.step}>3. Allow notifications when prompted.</Text>
            <Text style={styles.step}>4. Remove this old app after signing in.</Text>
          </View>

          <TouchableOpacity
            accessibilityRole="button"
            onPress={downloadNewApp}
            style={styles.downloadButton}
          >
            <MaterialIcons name="download" size={22} color="#FFFFFF" />
            <Text style={styles.downloadText}>Download the new app</Text>
          </TouchableOpacity>

          <Text style={styles.reassurance}>
            Your membership, profile, messages, and payment records are safe.
          </Text>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FBF6F9",
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  iconCircle: {
    width: 92,
    height: 92,
    borderRadius: 46,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3E3ED",
    marginBottom: 24,
  },
  eyebrow: {
    color: "#9D3B7A",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  title: {
    color: "#24131F",
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 12,
  },
  description: {
    color: "#62515D",
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
    maxWidth: 420,
  },
  stepsCard: {
    alignSelf: "stretch",
    maxWidth: 460,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginTop: 24,
    marginBottom: 24,
    gap: 10,
    shadowColor: "#24131F",
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  step: {
    color: "#44333F",
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "600",
  },
  downloadButton: {
    width: "100%",
    maxWidth: 460,
    minHeight: 56,
    borderRadius: 12,
    backgroundColor: "#9D3B7A",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  downloadText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  reassurance: {
    color: "#756570",
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
    marginTop: 18,
    maxWidth: 420,
  },
});
