import React, { useCallback, useEffect, useState } from "react";
import { AppState, StyleSheet, Text, View } from "react-native";
import { API_URL } from "~/constants/api";
import { palette, typography } from "~/theme";

const CHECK_INTERVAL_MS = 30_000;
const CHECK_TIMEOUT_MS = 5_000;

const OfflineBanner = () => {
  const [offline, setOffline] = useState(false);

  const checkConnection = useCallback(async () => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), CHECK_TIMEOUT_MS);
    try {
      await fetch(API_URL, { method: "HEAD", signal: controller.signal });
      setOffline(false);
    } catch {
      setOffline(true);
    } finally {
      clearTimeout(timeout);
    }
  }, []);

  useEffect(() => {
    void checkConnection();
    const interval = setInterval(() => void checkConnection(), CHECK_INTERVAL_MS);
    const appState = AppState.addEventListener("change", (state) => {
      if (state === "active") void checkConnection();
    });
    return () => {
      clearInterval(interval);
      appState.remove();
    };
  }, [checkConnection]);

  if (!offline) return null;
  return (
    <View style={styles.banner} accessibilityRole="alert">
      <Text style={styles.text}>You're offline. Some information may be out of date.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: { backgroundColor: palette.warning, paddingHorizontal: 16, paddingVertical: 8 },
  text: { ...typography.textSm, ...typography.fontSemiBold, color: palette.black, textAlign: "center" },
});

export default OfflineBanner;
