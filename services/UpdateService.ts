import { Platform } from "react-native";
import Constants from "expo-constants";

class UpdateService {
  private static instance: UpdateService;
  private isChecking = false;

  static getInstance(): UpdateService {
    if (!UpdateService.instance) {
      UpdateService.instance = new UpdateService();
    }
    return UpdateService.instance;
  }

  async checkForUpdate(): Promise<{ available: boolean; manifest?: any }> {
    if (this.isChecking) return { available: false };
    this.isChecking = true;

    try {
      // Only check in production builds (not Expo Go)
      if (Constants.appOwnership === "expo") {
        return { available: false };
      }

      // Dynamically import expo-updates to avoid issues in Expo Go
      const Updates = require("expo-updates");

      if (!Updates.isEnabled) {
        return { available: false };
      }

      const result = await Updates.checkForUpdateAsync();

      if (result.isAvailable) {
        return { available: true, manifest: result.manifest };
      }

      return { available: false };
    } catch (error) {
      console.error("[UpdateService] Error checking for updates:", error);
      return { available: false };
    } finally {
      this.isChecking = false;
    }
  }

  async fetchAndApplyUpdate(): Promise<boolean> {
    try {
      const Updates = require("expo-updates");

      if (!Updates.isEnabled) return false;

      const result = await Updates.fetchUpdateAsync();

      if (result.isNew) {
        await Updates.reloadAsync();
        return true;
      }

      return false;
    } catch (error) {
      console.error("[UpdateService] Error fetching update:", error);
      return false;
    }
  }

  async downloadInBackground(): Promise<void> {
    try {
      const Updates = require("expo-updates");

      if (!Updates.isEnabled) return;

      await Updates.fetchUpdateAsync();
    } catch (error) {
      console.error("[UpdateService] Background download error:", error);
    }
  }
}

export default UpdateService.getInstance();
