import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { palette, typography } from "~/theme";

export default function EventSections({
  active,
}: {
  active: "events" | "conferences";
}) {
  const navigation = useNavigation<any>();
  return (
    <View accessibilityRole="tablist" style={{ flexDirection: "row", gap: 8 }}>
      {(["events", "conferences"] as const).map((section) => (
        <TouchableOpacity
          key={section}
          accessibilityRole="tab"
          accessibilityState={{ selected: active === section }}
          accessibilityLabel={section === "events" ? "Events" : "Conferences"}
          onPress={() => {
            if (active !== section)
              navigation.navigate(
                section === "events" ? "events-index" : "conferences-index",
              );
          }}
          style={{
            flex: 1,
            minHeight: 48,
            justifyContent: "center",
            padding: 10,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: palette.primary,
            backgroundColor:
              active === section ? palette.primary : palette.white,
          }}
        >
          <Text
            style={[
              typography.textBase,
              typography.fontSemiBold,
              {
                textAlign: "center",
                color: active === section ? palette.white : palette.primary,
              },
            ]}
          >
            {section === "events" ? "Events" : "Conferences"}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
