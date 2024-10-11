import React, { useState } from "react";
import { StyleSheet, Switch, Text, View } from "react-native";
import AppContainer from "~/components/AppContainer";
import Button from "~/components/form/Button";
import { palette, typography } from "~/theme";

const SettingsScreen = () => {
  const [userSettings, setUserSettings] = useState<any>({});

  const SETTINGS = [
    { title: "Someone sends a message", value: "newMessages" },
    { title: "Someone replies a message", value: "newReplies" },
    { title: "Announcements", value: "annoucements" },
  ];

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
        <Button label="Save Changes" onPress={() => {}} style={{ marginTop: 8 }} />
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
