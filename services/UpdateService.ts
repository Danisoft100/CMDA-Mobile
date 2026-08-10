import { Platform } from "react-native";
import Constants from "expo-constants";
import * as Updates from "expo-updates";

class UpdateService {
  private static instance: UpdateService;
  private isChecking = false;
  private checkInterval: ReturnType<typeof setInterval> | null = null;

  static getInstance(): UpdateService {
    if (!UpdateService.instance) {
      UpdateService.instance = new UpdateService();
    }
    return UpdateService.instance;
  }

  private isExpoGo(): boolean {
    return Constants.appOwnership === "expo";
  }

  private isUpdateEnabled(): boolean {
    return !this.isExpoGo() && Updates.isEnabled;
  }

  async checkForUpdate(): Promise<{ available: boolean; manifest?: any }> {
    if (this.isChecking) return { available: false };
    this.isChecking = true;

    try {
      if (!this.isUpdateEnabled()) return { available: false };

      const result = await Updates.checkForUpdateAsync();

      if (result.isAvailable) {
        return { available: true, manifest: result.manifest };
      }

      return { available: false };
    } catch (error) {
      console.error("[UpdateService] Check error:", error);
      return { available: false };
    } finally {
      this.isChecking = false;
    }
  }

  async fetchAndReload(): Promise<boolean> {
    try {
      if (!this.isUpdateEnabled()) return false;

      const result = await Updates.fetchUpdateAsync();

      if (result.isNew) {
        await Updates.reloadAsync();
        return true;
      }

      return false;
    } catch (error) {
      console.error("[UpdateService] Fetch/reload error:", error);
      return false;
    }
  }

  async silentUpdate(): Promise<void> {
    try {
      if (!this.isUpdateEnabled()) return;

      const result = await Updates.checkForUpdateAsync();

      if (result.isAvailable) {
        await Updates.fetchUpdateAsync();
        await Updates.reloadAsync();
      }
    } catch (error) {
      console.error("[UpdateService] Silent update error:", error);
    }
  }

  startAutoUpdate(intervalMs = 300000) {
    this.stopAutoUpdate();
    this.silentUpdate();
    this.checkInterval = setInterval(() => this.silentUpdate(), intervalMs);
  }

  stopAutoUpdate() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }
}

export default UpdateService.getInstance();
