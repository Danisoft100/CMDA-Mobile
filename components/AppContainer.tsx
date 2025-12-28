import React, { PropsWithChildren, useMemo } from "react";
import { ScrollView, View, Platform } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { palette } from "~/theme";
import AppPullDownRefresh from "./AppPullDownRefresh";
import { useNavigation } from "@react-navigation/native";

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
  const navigation = useNavigation<any>();

  const isInsideTabNavigator = useMemo(() => {
    try {
      let parent = navigation;
      // Walk up the navigation tree; bottom tabs report state.type === 'tab'
      while (parent) {
        const state = parent.getState?.();
        if (state?.type === "tab") return true;
        parent = parent.getParent?.();
      }
    } catch {
      // Ignore and treat as not in tabs
    }
    return false;
  }, [navigation]);

  // Calculate tab bar height based on platform and configuration
  // This matches the tabBarStyle configuration in tabs.tsx
  let tabBarHeight = 0;
  if (isInsideTabNavigator) {
    if (Platform.OS === "android") {
      tabBarHeight = 64; // Custom height set in tabs.tsx
    } else {
      // iOS default tab bar height + safe area bottom
      tabBarHeight = 49 + (insets.bottom || 0);
    }
  }
  
  return (
    <SafeAreaView 
      style={{ flex: 1, backgroundColor }} 
      edges={["top", "left", "right", ...(isInsideTabNavigator ? ([] as const) : (["bottom"] as const))]}
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
