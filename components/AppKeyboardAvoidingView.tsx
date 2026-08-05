import React, { PropsWithChildren } from "react";
import { KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { palette } from "~/theme";

interface Props extends PropsWithChildren {
  withScrollView?: boolean;
  backgroundColor?: string;
  offSet?: number;
  padding?: number;
  gap?: number;
  bottomPadding?: number;
}

const AppKeyboardAvoidingView = ({
  withScrollView = true,
  backgroundColor = palette.background,
  children,
  offSet,
  padding = 16,
  gap = 16,
  bottomPadding = padding,
}: Props) => {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor }} edges={["top", "left", "right"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1, backgroundColor }}
        keyboardVerticalOffset={offSet ?? (Platform.OS === "ios" ? 64 + insets.bottom : 0)}
      >
        {withScrollView ? (
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{
              padding,
              gap,
              paddingBottom: bottomPadding + insets.bottom,
            }}
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        ) : (
          children
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AppKeyboardAvoidingView;
