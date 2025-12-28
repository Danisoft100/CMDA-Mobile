import React, { useState } from "react";
import { StyleSheet, Switch, Text, View } from "react-native";
import Toast from "react-native-toast-message";
import AppContainer from "~/components/AppContainer";
import Button from "~/components/form/Button";
import { useGetSettingsQuery, useUpdateSettingsMutation } from "~/store/api/profileApi";
import { palette, typography } from "~/theme";

const SettingsScreen = () => {
  const [updateSettings, { isLoading }] = useUpdateSettingsMutation();
  const { data: userSettingsData = {}, refetch } = useGetSettingsQuery(null, { refetchOnMountOrArgChange: true });

  const [userSettings, setUserSettings] = useState<any>({
    announcements: userSettingsData?.announcements ?? false,
    newMessage: userSettingsData?.newMessage ?? false,
    replies: userSettingsData?.replies ?? false,
  });

  // Update local state when data is fetched
  React.useEffect(() => {
    if (userSettingsData) {
      setUserSettings({
        announcements: userSettingsData?.announcements ?? false,
        newMessage: userSettingsData?.newMessage ?? false,
        replies: userSettingsData?.replies ?? false,
      });
    }
  }, [userSettingsData]);

  const SETTINGS = [
    { title: "Someone sends a message", value: "newMessage" },
    { title: "Someone replies a message", value: "replies" },
    { title: "Announcements", value: "announcements" },
  ];

  const handleUpdate = () => {
    updateSettings(userSettings)
      .unwrap()
      .then(() => {
        Toast.show({ type: "success", text1: "Changes saved successfully" });
        refetch();
      })
      .catch((error) => {
        Toast.show({ 
          type: "error", 
          text1: "Error occurred", 
          text2: error?.message || "Failed to save settings. Please try again." 
        });
      });
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
              onValueChange={(val) => setUserSettings((prev: any) => ({ ...prev, [item.value]: val }))}
              value={userSettings[item.value]}
            />
          </View>
        ))}
        <Button label="Save Changes" onPress={handleUpdate} style={{ marginTop: 8 }} loading={isLoading} />
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
});

export default SettingsScreen;
