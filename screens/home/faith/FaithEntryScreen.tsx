import React from "react";
import { StyleSheet, Text, View } from "react-native";
import AppContainer from "~/components/AppContainer";
import { palette, typography } from "~/theme";

const FaithEntryScreen = () => {
  return (
    <AppContainer>
      <View style={styles.card}></View>
    </AppContainer>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 10,
    backgroundColor: palette.white,
    marginBottom: 15,
    shadowColor: palette.black,
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  type: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    ...typography.textSm,
    ...typography.fontSemiBold,
    borderRadius: 6,
    overflow: "hidden",
    textTransform: "capitalize",
    alignSelf: "flex-start",
    marginBottom: 4,
  },
});

export default FaithEntryScreen;
