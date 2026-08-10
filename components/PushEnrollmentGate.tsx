import React, { useEffect, useRef, useState } from "react";
import { Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import * as Application from "expo-application";
import { MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import PushNotificationService from "~/services/PushNotificationService";
import TokenManager from "~/services/TokenManager";

const NEW_ANDROID_PACKAGE = "net.cmdanigeria.app";

export default function PushEnrollmentGate() {
  const [showBanner, setShowBanner] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<"granted" | "denied" | "undetermined">("undetermined");
  const registered = useRef(false);
  const retryCount = useRef(0);

  const isNewAndroidApp = Application.applicationId === NEW_ANDROID_PACKAGE;

  const tryRegister = async () => {
    if (!isNewAndroidApp || registered.current) return;

    const authToken = await TokenManager.getToken();
    if (!authToken) return;

    try {
      const ok = await PushNotificationService.registerPushTokenOnLogin();
      if (ok) {
        registered.current = true;
        retryCount.current = 0;
        setShowBanner(false);
        return;
      }

      const permission = await PushNotificationService.getPermissionStatus();
      setPermissionStatus(permission);
      if (permission === "denied") {
        retryCount.current = 99;
        setShowBanner(true);
      } else if (retryCount.current < 3) {
        retryCount.current += 1;
      } else {
        setShowBanner(true);
      }
    } catch {
      if (retryCount.current < 3) retryCount.current += 1;
    }
  };

  useEffect(() => {
    if (!isNewAndroidApp) return;

    tryRegister();
    const interval = setInterval(tryRegister, 10_000);

    const sub = Linking.addEventListener("url", () => {
      if (!registered.current) tryRegister();
    });

    return () => {
      clearInterval(interval);
      sub.remove();
    };
  }, [isNewAndroidApp]);

  const handleEnable = async () => {
    if (permissionStatus === "denied") {
      await Linking.openSettings();
      return;
    }
    const granted = await PushNotificationService.requestPermissions();
    if (granted) await tryRegister();
  };

  if (!isNewAndroidApp || !showBanner || registered.current) return null;

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <View style={styles.banner}>
        <MaterialIcons name="notifications-off" size={18} color="#FFF" />
        <Text style={styles.text}>
          Notifications are off. You may miss messages and reminders.
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => void handleEnable()}
        >
          <Text style={styles.buttonText}>{permissionStatus === "denied" ? "Settings" : "Turn on"}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setShowBanner(false)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <MaterialIcons name="close" size={16} color="#FFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { position: "absolute", top: 0, left: 0, right: 0, zIndex: 9999 },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D97706",
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
  },
  text: { flex: 1, color: "#FFF", fontSize: 13, fontWeight: "500" },
  button: {
    backgroundColor: "#FFF",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  buttonText: { color: "#D97706", fontSize: 13, fontWeight: "700" },
});
