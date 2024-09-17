import React, { PropsWithChildren } from "react";
import { SafeAreaView, ScrollView, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { palette } from "~/theme";

interface Props extends PropsWithChildren {
  backgroundColor?: string;
  withScrollView?: boolean;
  stickyHeaderIndices?: number[];
  padding?: number;
  gap?: number;
}

const AppContainer = ({
  backgroundColor = palette.background,
  children,
  withScrollView = true,
  stickyHeaderIndices,
  padding = 16,
  gap = 16,
}: Props) => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor }}>
      <StatusBar style="dark" />
      {withScrollView ? (
        <ScrollView
          contentContainerStyle={{ padding, gap, position: "relative" }}
          showsVerticalScrollIndicator={false}
          stickyHeaderIndices={stickyHeaderIndices}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={{ flex: 1, position: "relative", padding, gap }}>{children}</View>
      )}
    </SafeAreaView>
  );
};

export default AppContainer;
