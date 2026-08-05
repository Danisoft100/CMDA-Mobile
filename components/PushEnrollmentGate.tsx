import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  AppState,
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
import PushNotificationService from "~/services/PushNotificationService";
import TokenManager from "~/services/TokenManager";

const NEW_ANDROID_PACKAGE = "net.cmdanigeria.app";

export default function PushEnrollmentGate() {
  const [visible, setVisible] = useState(false);
  const [working, setWorking] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const attemptedForSession = useRef(false);
  const registeredForSession = useRef(false);
  const enrollmentInFlight = useRef(false);
  const failedAttempts = useRef(0);

  const isNewAndroidApp = Application.applicationId === NEW_ANDROID_PACKAGE;

  const enroll = async (showProgress = true) => {
    if (!isNewAndroidApp || enrollmentInFlight.current) return;

    const authToken = await TokenManager.getToken();
    if (!authToken) return;

    enrollmentInFlight.current = true;
    if (showProgress) setWorking(true);

    try {
      const registered = await PushNotificationService.registerPushTokenOnLogin();
      if (registered) {
        failedAttempts.current = 0;
        registeredForSession.current = true;
        setVisible(false);
        setPermissionDenied(false);
        setErrorMessage(null);
        return;
      }

      const permission = await PushNotificationService.getPermissionStatus();
      const denied = permission === "denied";
      setPermissionDenied(denied);
      failedAttempts.current += 1;
      setErrorMessage(
        PushNotificationService.getLastRegistrationError() ||
          "The device could not register for notifications. Please try again.",
      );
      if (showProgress || denied || failedAttempts.current >= 2) {
        setVisible(true);
      }
    } catch (error) {
      failedAttempts.current += 1;
      setErrorMessage(
        error instanceof Error ? error.message : "Notification registration failed.",
      );
      if (showProgress || failedAttempts.current >= 2) setVisible(true);
    } finally {
      enrollmentInFlight.current = false;
      if (showProgress) setWorking(false);
    }
  };

  useEffect(() => {
    if (!isNewAndroidApp) return;

    const checkAuthenticatedSession = async () => {
      const authToken = await TokenManager.getToken();
      if (
        authToken &&
        !attemptedForSession.current &&
        !registeredForSession.current
      ) {
        attemptedForSession.current = true;
        // Automatic enrollment stays in the background. The gate is shown only
        // if permission or token registration actually needs user attention.
        await enroll(false);
        if (!registeredForSession.current && failedAttempts.current < 2) {
          attemptedForSession.current = false;
        }
      }
    };

    checkAuthenticatedSession();
    const interval = setInterval(checkAuthenticatedSession, 3_000);
    const appStateSubscription = AppState.addEventListener("change", (state) => {
      if (state === "active" && !registeredForSession.current) {
        attemptedForSession.current = false;
        checkAuthenticatedSession();
      }
    });

    return () => {
      clearInterval(interval);
      appStateSubscription.remove();
    };
  }, [isNewAndroidApp]);

  const openSettings = async () => {
    try {
      await Linking.openSettings();
    } catch {
      Alert.alert("Open settings", "Enable notifications in the CMDA app settings.");
    }
  };

  if (!isNewAndroidApp) return null;

  return (
    <Modal
      animationType="fade"
      onRequestClose={() => undefined}
      presentationStyle="fullScreen"
      visible={visible}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.iconCircle}>
            <MaterialIcons name="notifications-active" size={44} color="#9D3B7A" />
          </View>
          <Text style={styles.title}>Enable CMDA notifications</Text>
          <Text style={styles.description}>
            Notifications are required for messages, important announcements,
            event reminders, and account updates.
          </Text>

          {errorMessage ? (
            <View style={styles.errorCard}>
              <MaterialIcons name="info-outline" size={20} color="#9A3412" />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            accessibilityRole="button"
            disabled={working}
            onPress={permissionDenied ? openSettings : () => enroll(true)}
            style={[styles.primaryButton, working && styles.disabledButton]}
          >
            {working ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <MaterialIcons
                  name={permissionDenied ? "settings" : "refresh"}
                  size={21}
                  color="#FFFFFF"
                />
                <Text style={styles.primaryText}>
                  {permissionDenied ? "Open notification settings" : "Try registration again"}
                </Text>
              </>
            )}
          </TouchableOpacity>

          <Text style={styles.note}>
            The app will continue automatically once this device is registered.
          </Text>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FBF6F9" },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3E3ED",
    marginBottom: 22,
  },
  title: {
    color: "#24131F",
    fontSize: 27,
    fontWeight: "800",
    textAlign: "center",
  },
  description: {
    color: "#62515D",
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
    marginTop: 12,
    maxWidth: 440,
  },
  errorCard: {
    width: "100%",
    maxWidth: 440,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    borderRadius: 12,
    backgroundColor: "#FFF7ED",
    padding: 15,
    marginTop: 22,
  },
  errorText: {
    flex: 1,
    color: "#7C2D12",
    fontSize: 14,
    lineHeight: 20,
  },
  primaryButton: {
    width: "100%",
    maxWidth: 440,
    minHeight: 56,
    borderRadius: 12,
    backgroundColor: "#9D3B7A",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    marginTop: 24,
  },
  disabledButton: { opacity: 0.7 },
  primaryText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
  note: {
    color: "#756570",
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
    marginTop: 16,
  },
});
