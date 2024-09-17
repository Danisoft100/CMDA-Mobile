import { Text, View } from "react-native";

const AppFontsTest = ({ onLayout }: any) => {
  let fontSize = 24;
  let paddingVertical = 6;

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }} onLayout={onLayout}>
      <Text
        style={{
          fontSize,
          paddingVertical,
          // Note the quoting of the value for `fontFamily` here; it expects a string!
          fontFamily: "SpaceGrotesk_300Light",
        }}
      >
        Space Grotesk Light
      </Text>

      <Text
        style={{
          fontSize,
          paddingVertical,
          // Note the quoting of the value for `fontFamily` here; it expects a string!
          fontFamily: "SpaceGrotesk_400Regular",
        }}
      >
        Space Grotesk Regular
      </Text>

      <Text
        style={{
          fontSize,
          paddingVertical,
          // Note the quoting of the value for `fontFamily` here; it expects a string!
          fontFamily: "SpaceGrotesk_500Medium",
        }}
      >
        Space Grotesk Medium
      </Text>

      <Text
        style={{
          fontSize,
          paddingVertical,
          // Note the quoting of the value for `fontFamily` here; it expects a string!
          fontFamily: "SpaceGrotesk_600SemiBold",
        }}
      >
        Space Grotesk Semi Bold
      </Text>

      <Text
        style={{
          fontSize,
          paddingVertical,
          // Note the quoting of the value for `fontFamily` here; it expects a string!
          fontFamily: "SpaceGrotesk_700Bold",
        }}
      >
        Space Grotesk Bold
      </Text>
    </View>
  );
};

export default AppFontsTest;
