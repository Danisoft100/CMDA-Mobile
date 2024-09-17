import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import AppContainer from "~/components/AppContainer";
import { palette, typography } from "~/theme";
import MCIcon from "@expo/vector-icons/MaterialCommunityIcons";
import Button from "~/components/form/Button";

const RewardsScreen = () => {
  return (
    <AppContainer>
      <Text style={[typography.text2xl, typography.fontBold]}>Rewards</Text>

      <View>
        <Text style={[typography.textBase, typography.fontMedium]}>Cash Back</Text>
        <Text style={[typography.text3xl, typography.fontSemiBold, { color: palette.primary }]}>₦100</Text>
      </View>

      <View style={styles.item}>
        <View style={styles.itemIcon}>
          <MCIcon name="bank" size={24} color={palette.primary} />
        </View>
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={[typography.textBase, typography.fontMedium]}>Daily Bonus</Text>
          <Text style={[typography.textSm, { marginTop: -4 }]}>Get up to N100 Bonus</Text>
        </View>
        <Button label="Get Now" dense onPress={() => {}} />
      </View>

      <View>
        <Text style={[typography.textLg, typography.fontSemiBold]}>Daily Bonus</Text>
        <View style={{ gap: 12, marginTop: 4 }}>
          {[...Array(4)].map((_, i) => (
            <View key={i} style={styles.item}>
              <View style={styles.itemIcon}>
                <MCIcon name="bank" size={24} color={palette.primary} />
              </View>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={[typography.textBase, typography.fontMedium]}>Daily Bonus</Text>
                <Text style={[typography.textSm, { marginTop: -4 }]}>Get up to N100 Bonus</Text>
              </View>
              <Button label="Buy" dense onPress={() => {}} />
            </View>
          ))}
        </View>
      </View>

      <TouchableOpacity>
        <Image source={require("~/assets/images/refer-now.png")} style={styles.refer} />
      </TouchableOpacity>
    </AppContainer>
  );
};

const styles = StyleSheet.create({
  item: {
    borderWidth: 1,
    borderColor: palette.grey,
    paddingVertical: 12,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 12,
  },
  itemIcon: {
    backgroundColor: palette.primaryLight,
    height: 40,
    width: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 32,
  },
  refer: { height: 180, width: "100%", borderRadius: 10, resizeMode: "contain", marginTop: -8 },
});

export default RewardsScreen;
