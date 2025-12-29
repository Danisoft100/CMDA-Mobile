import React, { PropsWithChildren } from "react";
import { ScrollView, View, Platform } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { palette } from "~/theme";

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
  
  // Use a more conservative approach - always ensure enough space
  // This prevents issues when modals/overlays cause layout shifts
  const baseTabBarHeight = Platform.OS === "android" ? 64 : 49;
  const minimumSafeArea = Math.max(insets.bottom || 0, Platform.OS === "ios" ? 34 : 0); // iPhone X+ safe area
  const bufferSpace = 20; // Extra buffer to prevent any overlap
  const totalBottomPadding = baseTabBarHeight + minimumSafeArea + bufferSpace;

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor }}
      edges={["top", "left", "right"]} // Never include bottom - causes shifting issues
    >
      <StatusBar style="dark" />
      {withScrollView ? (
        <ScrollView
          contentContainerStyle={{
            padding,
            gap,
            paddingBottom: totalBottomPadding,
          }}
          showsVerticalScrollIndicator={false}
          stickyHeaderIndices={stickyHeaderIndices}
          refreshControl={refreshControl}
          // Prevent scroll behavior changes during overlays
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      ) : (
        <View
          style={{
            flex: 1,
            padding,
            gap,
            paddingBottom: totalBottomPadding,
          }}
        >
          {children}
        </View>
      )}
    </SafeAreaView>
  );
};

export default AppContainer;
