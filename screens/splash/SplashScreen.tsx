import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback } from "react";
import { ActivityIndicator, Image, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { useSelector } from "react-redux";
import { selectAuth } from "~/store/slices/authSlice";
import { palette, typography } from "~/theme";

const SplashScreen = ({ navigation }: any) => {
  const { isAuthenticated } = useSelector(selectAuth);

  useFocusEffect(
    useCallback(() => {
      const timer = setTimeout(() => {
        if (isAuthenticated) navigation.navigate("tab");
        else navigation.navigate("onboarding");
      }, 2500);

      return () => clearTimeout(timer);
    }, [isAuthenticated, navigation])
  );

  return (
    <SafeAreaView style={styles.wrapper}>
      <View style={styles.container}>
        <View style={{ flexDirection: "row", width: "60%", gap: 6, alignItems: 'center' }}>
          <Image source={require("~/assets/CMDALOGO_white.png")} style={styles.logo} />
          <View style={{ flex: 1 }}>
            <Text style={[typography.textBase, typography.fontBold, { color: palette.white }]}>
              CHRISTIAN MEDICAL AND DENTAL ASSOCIATION OF NIGERIA
            </Text>
            <Text style={[[typography.textBase, typography.fontMedium, { color: palette.white }]]}>(CMDA NIGERIA)</Text>
          </View>
        </View>
        <ActivityIndicator color={palette.white} style={styles.loading} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: palette.primary,
  },
  container: {
    flex: 0.6,
    justifyContent: "space-between",
    alignItems: "center",
  },
  logo: { height: 100, width: 50 },
  loading: { transform: [{ scaleX: 2 }, { scaleY: 2 }] },
});

export default SplashScreen;
