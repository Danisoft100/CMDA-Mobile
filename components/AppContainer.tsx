import React, { PropsWithChildren } from "react";
import { ScrollView, View, Platform } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { getTabBarSafeBottomPadding } from "~/utils/safeAreaUtils";
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
  
  const totalBottomPadding = getTabBarSafeBottomPadding(insets);

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor }}
      edges={["top", "left", "right"]} // Don't include bottom - let tab bar handle it
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
