import * as Application from "expo-application";
import { Platform } from "react-native";
import { API_URL } from "~/constants/api";
import TokenManager from "~/services/TokenManager";

const REPORT_TIMEOUT_MS = 4_000;

class CrashReporterService {
  async report(error: Error, componentStack?: string | null): Promise<void> {
    const token = (await TokenManager.getToken()) ?? (await TokenManager.refreshToken());
    if (!token) return;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REPORT_TIMEOUT_MS);
    try {
      await fetch(`${API_URL}/users/client-errors`, {
        method: "POST",
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: error.message.slice(0, 500),
          stack: error.stack?.slice(0, 5000),
          componentStack: componentStack?.slice(0, 3000),
          platform: Platform.OS,
          appVersion: Application.nativeApplicationVersion || undefined,
        }),
      });
    } catch {
      // Crash reporting must never cause a second application failure.
    } finally {
      clearTimeout(timeout);
    }
  }
}

export default new CrashReporterService();
