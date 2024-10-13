import React from "react";
import { Text, View } from "react-native";
import MCIcon from "@expo/vector-icons/MaterialCommunityIcons";
import { palette, typography } from "~/theme";

interface IEmptyData {
  title: string;
  subtitle?: string;
  icon?: string;
}

const EmptyData = ({ title, subtitle, icon = "file" }: IEmptyData) => {
  return (
    <View style={{ alignItems: "center", gap: 8, paddingHorizontal: 8, paddingVertical: 32 }}>
      <View
        style={{
          backgroundColor: palette.onPrimaryContainer,
          height: 64,
          width: 64,
          overflow: "hidden",
          borderRadius: 32,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <MCIcon name={icon as any} size={40} color={palette.primary} />
      </View>
      <View>
        <Text style={[typography.textLg, typography.fontSemiBold, { textAlign: "center" }]}>{title}</Text>
        <Text style={[typography.textSm, { textAlign: "center" }]}>
          {subtitle || `No ${title?.toLowerCase()} available to display`}
        </Text>
      </View>
    </View>
  );
};

export default EmptyData;
