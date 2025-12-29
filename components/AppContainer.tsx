import React, { PropsWithChildren } from "react";
import { ScrollView, View, Platform } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { palette } from "~/theme";
import AppPullDownRefresh from "./AppPullDownRefresh";

interface Props extends PropsWithChildren {
  backgroundColor?: string;
  withScrollView?: boolean;
  stickyHeaderIndices?: number[];
  padding?: number;
  gap?: number;
  refreshControl?: any;
}

const AppContainer = ({
  backgroundColor = palette.background,
  children,
  withScrollView = true,
  stickyHeaderIndices,
  padding = 16,
  gap = 16,
  refreshControl,
}: Props) => {
  const insets = useSafeAreaInsets();
  // Always apply tab bar height padding to prevent content from being hidden behind tab bar
  const tabBarHeight = Platform.OS === "android" ? 64 : 49 + (insets.bottom || 0);

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor }}
      edges={["top", "left", "right", "bottom"]}
    >
      <StatusBar style="dark" />
      {withScrollView ? (
        <ScrollView
          contentContainerStyle={{
            padding,
            gap,
            position: "relative",
            paddingBottom: padding + tabBarHeight,
          }}
          showsVerticalScrollIndicator={false}
          stickyHeaderIndices={stickyHeaderIndices}
          refreshControl={refreshControl}
        >
          {children}
        </ScrollView>
      ) : (
        <View
          style={{
            flex: 1,
            position: "relative",
            padding,
            gap,
            paddingBottom: padding + tabBarHeight,
          }}
        >
          {children}
        </View>
      )}
    </SafeAreaView>
  );
};

export default AppContainer;
