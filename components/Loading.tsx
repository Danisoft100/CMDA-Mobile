import React from "react";
import { ActivityIndicator, View } from "react-native";
import { palette } from "~/theme";

const Loading = ({ center = false, marginVertical = 16, color = palette.primary, size = 32 }) => {
  return (
    <View style={[center && { justifyContent: "center", alignItems: "center" }, { marginVertical }]}>
      <ActivityIndicator color={color} style={{ transform: [{ scaleX: size / 16 }, { scaleY: size / 16 }] }} />
    </View>
  );
};

export default Loading;
