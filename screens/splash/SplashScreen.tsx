import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback } from "react";
import { ActivityIndicator, Image, SafeAreaView, StyleSheet, View } from "react-native";
import { useSelector } from "react-redux";
import { selectAuth } from "~/store/slices/authSlice";
import { palette } from "~/theme";

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
        <Image source={require("~/assets/logo.png")} style={styles.logo} resizeMode="contain" />
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
  logo: { height: 120 },
  loading: { transform: [{ scaleX: 2 }, { scaleY: 2 }] },
});

export default SplashScreen;
