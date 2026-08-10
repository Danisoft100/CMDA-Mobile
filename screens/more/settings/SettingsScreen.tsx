import React, { useEffect, useRef, useState } from "react";
import { Linking, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import MCIcon from "@expo/vector-icons/MaterialCommunityIcons";
import AppContainer from "~/components/AppContainer";
import { useGetSettingsQuery, useUpdateSettingsMutation } from "~/store/api/profileApi";
import { palette, typography } from "~/theme";
import { useTutorial } from "~/contexts/TutorialContext";
import PushNotificationService from "~/services/PushNotificationService";

const DEFAULT_SETTINGS = {
  announcements: true,
  newMessage: false,
  replies: false,
  pushNotifications: true,
  emailNotifications: true,
  events: true,
  payments: true,
  reminders: true,
  marketing: false,
};

const SettingsScreen = ({ navigation }: any) => {
  const [updateSettings] = useUpdateSettingsMutation();
  const { data: userSettingsData = {} } = useGetSettingsQuery(null, { refetchOnMountOrArgChange: true });
  const { reset: resetTutorial, start: startTutorial } = useTutorial();

  const [userSettings, setUserSettings] = useState<any>(DEFAULT_SETTINGS);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveSequence = useRef(0);
  const lastSavedSettings = useRef(userSettings);

  // Update local state when data is fetched
  React.useEffect(() => {
    if (userSettingsData) {
      const next = { ...DEFAULT_SETTINGS, ...userSettingsData };
      setUserSettings(next);
      lastSavedSettings.current = next;
    }
  }, [userSettingsData]);

  const SETTINGS = [
    { title: "Mobile push notifications", value: "pushNotifications" },
    { title: "Email notifications", value: "emailNotifications" },
    { title: "New private messages", value: "newMessage" },
    { title: "Replies to your activity", value: "replies" },
    { title: "CMDA announcements", value: "announcements" },
    { title: "Events and registrations", value: "events" },
    { title: "Payments, orders and membership", value: "payments" },
    { title: "Scheduled reminders", value: "reminders" },
    { title: "Optional campaigns", value: "marketing" },
  ];

  useEffect(() => () => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
  }, []);

  const handleToggle = async (key: string, value: boolean) => {
    if (key === "pushNotifications" && value) {
      const status = await PushNotificationService.getPermissionStatus();
      if (status === "denied") {
        Toast.show({ type: "info", text1: "Enable notifications in device settings", text2: "Opening Settings…" });
        await Linking.openSettings();
        return;
      }
      if (status !== "granted" && !(await PushNotificationService.requestPermissions())) return;
    }
    const nextSettings = { ...userSettings, [key]: value };
    setUserSettings(nextSettings);
    setSaveState("saving");

    if (saveTimer.current) clearTimeout(saveTimer.current);
    const sequence = ++saveSequence.current;
    saveTimer.current = setTimeout(async () => {
      try {
        await updateSettings(nextSettings).unwrap();
        if (sequence !== saveSequence.current) return;
        lastSavedSettings.current = nextSettings;
        setSaveState("saved");
      } catch (error: any) {
        if (sequence !== saveSequence.current) return;
        setUserSettings(lastSavedSettings.current);
        setSaveState("error");
        Toast.show({
          type: "error",
          text1: "Settings were not saved",
          text2: error?.data?.message || error?.message || "Please try again.",
        });
      }
    }, 450);
  };

  /**
   * Handle restart tutorial
   * Requirements: 4.9 - Provide option to restart tutorial from Settings
   */
  const handleRestartTutorial = async () => {
    await resetTutorial();
    // Navigate to home first
    navigation.navigate('home', { screen: 'home-index' });
    // Small delay to allow navigation to complete
    setTimeout(() => {
      startTutorial();
    }, 300);
  };

  return (
    <AppContainer>
      <View style={{ gap: 8 }}>
        <Text style={[typography.textLg, typography.fontSemiBold]}>Notification Settings</Text>
        {SETTINGS.map((item) => (
          <View style={styles.item} key={item.value}>
            <Text style={styles.itemLabel}>{item.title}</Text>
            <Switch
              trackColor={{ false: palette.onPrimaryContainer, true: palette.primary }}
              thumbColor={palette.white}
              ios_backgroundColor={palette.onPrimaryContainer}
              style={styles.switch}
              onValueChange={(val) => void handleToggle(item.value, val)}
              value={Boolean(userSettings[item.value])}
              accessibilityLabel={item.title}
              accessibilityState={{ checked: Boolean(userSettings[item.value]) }}
            />
          </View>
        ))}
        <Text style={[styles.saveStatus, saveState === "error" && { color: palette.error }]} accessibilityLiveRegion="polite">
          {saveState === "saving" ? "Saving…" : saveState === "saved" ? "Saved automatically" : saveState === "error" ? "Not saved" : "Changes save automatically"}
        </Text>
      </View>

      {/* App Tour Section */}
      <View style={{ gap: 8, marginTop: 24 }}>
        <Text style={[typography.textLg, typography.fontSemiBold]}>App Tour</Text>
        <TouchableOpacity 
          style={styles.tutorialButton}
          onPress={handleRestartTutorial}
          activeOpacity={0.7}
        >
          <MCIcon name="school" size={24} color={palette.primary} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[typography.textBase, typography.fontMedium]}>Restart App Tutorial</Text>
            <Text style={[typography.textSm, { color: palette.grey }]}>
              Take a guided tour of the app features
            </Text>
          </View>
          <MCIcon name="chevron-right" size={24} color={palette.grey} />
        </TouchableOpacity>
      </View>
    </AppContainer>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: palette.background,
  },
  content: { padding: 16, gap: 8 },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
  },
  itemLabel: {
    ...typography.textBase,
    ...typography.fontMedium,
    color: palette.greyDark,
  },
  switch: { transform: [{ scaleX: 0.5 }, { scaleY: 0.5 }] },
  saveStatus: { ...typography.textSm, color: palette.greyDark, minHeight: 20 },
  tutorialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: palette.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.greyLight,
  },
});

export default SettingsScreen;
